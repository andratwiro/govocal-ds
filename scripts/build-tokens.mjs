import {writeFile} from 'node:fs/promises';
import {toCss} from './lib/css.mjs';
import {loadTokens} from './lib/build.mjs';
// Builds src/tokens.css from tokens/ (scripts/lib/build.mjs says which files, in which order).
await writeFile('src/tokens.css', toCss(loadTokens()));
console.log('src/tokens.css written');
