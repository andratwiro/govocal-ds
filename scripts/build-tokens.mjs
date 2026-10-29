import {readFileSync} from 'node:fs';
import {writeFile} from 'node:fs/promises';
import {toCss} from './lib/css.mjs';
import {toJson} from './lib/json.mjs';
import {loadTokens} from './lib/build.mjs';
// Builds src/tokens.css and public/tokens.json (the same set as DTCG, published beside Storybook) from tokens/
// (scripts/lib/build.mjs says which files, in which order).
const tokens = loadTokens();
const read = path => JSON.parse(readFileSync(path, 'utf8'));
await writeFile('src/tokens.css', toCss(tokens));
await writeFile('public/tokens.json', JSON.stringify(toJson(tokens, read('tokens/variable-ids.json'), read('tokens/renames.json')), null, 2) + '\n');
console.log('src/tokens.css and public/tokens.json written');
