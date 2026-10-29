import {readFile, writeFile} from 'node:fs/promises';
import {toCss} from './lib/css.mjs';
const tokens = JSON.parse(await readFile('tokens/foundations.tokens.json', 'utf8'));
await writeFile('src/tokens.css', toCss(tokens));
console.log('src/tokens.css written');
