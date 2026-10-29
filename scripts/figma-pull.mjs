import {writeFile} from 'node:fs/promises';
import {fetchFile, page, config} from './lib/figma.mjs';
import {parseFoundations} from './lib/foundations.mjs';

const file = await fetchFile(config.fileKey, {fresh: true});
const {tokens, variableIds} = parseFoundations(page(file, config.foundationsPage));
await writeFile('tokens/foundations.tokens.json', JSON.stringify(tokens, null, 2) + '\n');
await writeFile('tokens/variable-ids.json', JSON.stringify(variableIds, null, 2) + '\n');
const count = g => Object.values(g).reduce((n, x) => n + (x.$type ? 1 : count(x)), 0);
console.log(`Pulled "${file.name}" (${file.lastModified}): ${count(tokens)} tokens, ${Object.keys(variableIds).length} variable ids`);
