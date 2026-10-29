import {readFileSync} from 'node:fs';
import {describe, mergeTokens} from './merge.mjs';
import {cssOf} from './names.mjs';

// Figma's tokens (npm run tokens:pull writes them), then the hand-authored ones Figma has no variables for (Not in
// Figma), merged by token path; tokens/descriptions.json then says what each Figma token is for.
export const SOURCES = ['tokens/foundations.tokens.json', 'tokens/semantic.tokens.json', 'tokens/motion.tokens.json',
  'tokens/size.tokens.json'];
const read = path => JSON.parse(readFileSync(path, 'utf8'));

export function loadTokens() {
  const [figma, ...handAuthored] = SOURCES.map(read);
  return describe(mergeTokens(figma, ...handAuthored), read('tokens/descriptions.json'), path => cssOf(...path));
}
