import {readFile, writeFile} from 'node:fs/promises';
import {toCss} from './lib/css.mjs';
import {mergeTokens} from './lib/merge.mjs';
const read = async path => JSON.parse(await readFile(path, 'utf8'));
// Figma's tokens (npm run tokens:pull writes them) + the hand-authored ones Figma has no variables for (Not in Figma).
const tokens = mergeTokens(await read('tokens/foundations.tokens.json'), await read('tokens/motion.tokens.json'));
await writeFile('src/tokens.css', toCss(tokens));
console.log('src/tokens.css written');
