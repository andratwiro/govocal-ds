import {readFile, writeFile} from 'node:fs/promises';
import {toCss} from './lib/css.mjs';
import {mergeTokens} from './lib/merge.mjs';
const read = async path => JSON.parse(await readFile(path, 'utf8'));
// Figma's tokens (npm run tokens:pull writes them) + the hand-authored ones Figma has no variables for (Not in Figma),
// merged by token path.
export const sources = ['tokens/foundations.tokens.json', 'tokens/semantic.tokens.json', 'tokens/motion.tokens.json',
  'tokens/size.tokens.json'];
const [figma, ...handAuthored] = await Promise.all(sources.map(read));
const tokens = mergeTokens(figma, ...handAuthored);
await writeFile('src/tokens.css', toCss(tokens));
console.log('src/tokens.css written');
