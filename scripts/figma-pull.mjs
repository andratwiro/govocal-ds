import {readFile, writeFile} from 'node:fs/promises';
import {fetchFile, page, config} from './lib/figma.mjs';
import {parseFoundations} from './lib/foundations.mjs';
import {parseIcons} from './lib/icons.mjs';

// `npm run tokens:pull` downloads the Figma file (rate-limited); `-- --cached` reads the cached copy in .cache/ instead,
// to rebuild the Figma token files after a change to the names (tokens/variable-ids.json, tokens/renames.json).
const cached = process.argv.includes('--cached');
const json = async (path, fallback) => { try { return JSON.parse(await readFile(path, 'utf8')); } catch { return fallback; } };
const file = await fetchFile(config.fileKey, {fresh: !cached});
const names = await json('tokens/variable-ids.json', {});
const {renames = []} = await json('tokens/renames.json', {});
const {tokens, variableIds, report} = parseFoundations(page(file, config.foundationsPage), {names, renames});
await writeFile('tokens/foundations.tokens.json', JSON.stringify(tokens, null, 2) + '\n');
await writeFile('tokens/variable-ids.json', JSON.stringify(variableIds, null, 2) + '\n');
// What Figma still names differently: the designer's checklist, and the Foundations page's "Figma follows" column.
await writeFile('tokens/figma-report.json', JSON.stringify({pulled: file.lastModified, report}, null, 2) + '\n');
const icons = parseIcons(page(file, config.iconsPage));
await writeFile('tokens/icons.json', JSON.stringify({figma: icons}, null, 2) + '\n');
const count = g => Object.values(g).reduce((n, x) => n + (x.$type ? 1 : count(x)), 0);
console.log(`Pulled "${file.name}" (${file.lastModified}${cached ? ', cached' : ''}): ${count(tokens)} tokens, ` +
  `${Object.keys(variableIds).length} variable ids, ${icons.length} icons`);
if (report.length) console.log(`Where Figma differs from code (${report.length}):\n${report.map(r => `  ${r.text}`).join('\n')}`);
