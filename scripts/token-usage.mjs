import {readdirSync, readFileSync, mkdirSync, writeFileSync, existsSync} from 'node:fs';
import {join} from 'node:path';
import {scanUsage} from './lib/usage.mjs';

// Walks the component/pattern/back-office stylesheets and writes the token -> component usage map
// storybook-design-token's usageMap wants. Run via `npm run tokens:usage` (also wired as a
// prestorybook / prebuild:storybook hook so the Foundations page is never stale.

function cssFilesIn(dir) {
  if (!existsSync(dir)) return [];
  return readdirSync(dir, {recursive: true})
    .filter(entry => entry.endsWith('.css'))
    .map(entry => join(dir, entry));
}

const dirs = ['src/components', 'src/patterns', 'backoffice/src'];
const paths = dirs.flatMap(cssFilesIn);
const files = paths.map(path => ({path, text: readFileSync(path, 'utf8')}));
const usageMap = scanUsage(files);

mkdirSync('src/foundations', {recursive: true});
writeFileSync('src/foundations/usage.json', JSON.stringify(usageMap, null, 2) + '\n');
console.log(`tokens:usage: ${Object.keys(usageMap).length} tokens used across ${files.length} stylesheets`);
