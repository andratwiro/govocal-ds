import {readFile, writeFile, mkdir} from 'node:fs/promises';
import {homedir} from 'node:os';

export const config = JSON.parse(await readFile(new URL('../../tokens/figma.config.json', import.meta.url), 'utf8'));

async function token() {
  if (process.env.FIGMA_TOKEN) return process.env.FIGMA_TOKEN.trim();
  try { return (await readFile(`${homedir()}/.creds/figma_token`, 'utf8')).trim(); }
  catch { throw new Error('No Figma token: set FIGMA_TOKEN or write one to ~/.creds/figma_token'); }
}

export async function fetchFile(fileKey = config.fileKey, {fresh = process.argv.includes('--fresh')} = {}) {
  const cache = `.cache/figma-${fileKey}.json`;
  if (!fresh) { try { return JSON.parse(await readFile(cache, 'utf8')); } catch {} }
  const res = await fetch(`https://api.figma.com/v1/files/${fileKey}`, {headers: {'X-Figma-Token': await token()}});
  if (!res.ok) throw new Error(`Figma said ${res.status}: ${await res.text()}`);
  const file = await res.json();
  await mkdir('.cache', {recursive: true});
  await writeFile(cache, JSON.stringify(file));
  return file;
}

export const page = (file, name) => {
  const p = file.document.children.find(c => c.name === name);
  if (!p) throw new Error(`No page called ${name} in ${file.name}`);
  return p;
};
