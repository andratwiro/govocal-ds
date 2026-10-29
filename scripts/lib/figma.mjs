import {readFile, writeFile, mkdir} from 'node:fs/promises';
import {homedir} from 'node:os';
import https from 'node:https';

// FIGMA_API points at a gateway that adds the token itself (client cert from FIGMA_CERT/FIGMA_KEY/FIGMA_CA).
const API = process.env.FIGMA_API ?? 'https://api.figma.com/v1';

export const config = JSON.parse(await readFile(new URL('../../tokens/figma.config.json', import.meta.url), 'utf8'));

async function token() {
  if (process.env.FIGMA_TOKEN) return process.env.FIGMA_TOKEN.trim();
  try { return (await readFile(`${homedir()}/.creds/figma_token`, 'utf8')).trim(); }
  catch { throw new Error('No Figma token: set FIGMA_TOKEN or write one to ~/.creds/figma_token'); }
}

async function get(url) {
  if (!process.env.FIGMA_API) {
    const res = await fetch(url, {headers: {'X-Figma-Token': await token()}});
    return {status: res.status, body: await res.text()};
  }
  const home = homedir();
  const [cert, key, ca] = await Promise.all([
    readFile(process.env.FIGMA_CERT ?? `${home}/.gateway/cert.pem`),
    readFile(process.env.FIGMA_KEY ?? `${home}/.gateway/key.pem`),
    readFile(process.env.FIGMA_CA ?? '/etc/clankers/gateway-ca.pem'),
  ]);
  return new Promise((resolve, reject) => {
    https.get(url, {cert, key, ca}, res => {
      let body = '';
      res.setEncoding('utf8');
      res.on('data', c => body += c);
      res.on('end', () => resolve({status: res.statusCode, body}));
    }).on('error', reject);
  });
}

export async function fetchFile(fileKey = config.fileKey, {fresh = process.argv.includes('--fresh')} = {}) {
  const cache = `.cache/figma-${fileKey}.json`;
  if (!fresh) { try { return JSON.parse(await readFile(cache, 'utf8')); } catch {} }
  const {status, body} = await get(`${API}/files/${fileKey}`);
  if (status !== 200) throw new Error(`Figma said ${status}: ${body}`);
  const file = JSON.parse(body);
  await mkdir('.cache', {recursive: true});
  await writeFile(cache, JSON.stringify(file));
  return file;
}

export const page = (file, name) => {
  const p = file.document.children.find(c => c.name === name);
  if (!p) throw new Error(`No page called ${name} in ${file.name}`);
  return p;
};

/** A Figma name's last slash segment: what instance layers, search and swap menus show ("Project rail/Rail header"). */
export const lastSegment = name => name.split('/').pop().trim();

/** Components and component sets under a node; a set's variants are not walked. */
function* components(node) {
  for (const c of node.children ?? []) {
    if (c.type === 'COMPONENT_SET' || c.type === 'COMPONENT') yield c;
    else yield* components(c);
  }
}

/**
 * The components a name points at on the given pages, as [{page, node}]: those named exactly so, else those whose last
 * slash segment matches the name's ("Rail header" and "Project rail/Rail header" both find "Project rail/Rail header").
 */
export function findComponent(pages, name) {
  const found = pages.flatMap(p => [...components(p)].map(node => ({page: p.name, node})));
  const exact = found.filter(f => f.node.name === name);
  if (exact.length) return exact;
  const want = lastSegment(name);
  return found.filter(f => lastSegment(f.node.name) === want);
}
