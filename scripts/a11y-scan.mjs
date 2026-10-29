import {readFile, writeFile} from 'node:fs/promises';
import {chromium} from 'playwright';
import {AxeBuilder} from '@axe-core/playwright';
import {serve} from './lib/serve.mjs';
import {summarize} from './lib/a11y.mjs';

const index = JSON.parse(await readFile('dist/storybook/index.json', 'utf8'));
const stories = Object.values(index.entries).filter(e => e.type === 'story' && !e.title.startsWith('Overview'));
const server = await serve('dist/storybook', 4174);
const browser = await chromium.launch();
const context = await browser.newContext();
const page = await context.newPage();
const raw = [];
for (const s of stories) for (const direction of ['ltr', 'rtl']) {
  await page.goto(`${server.url}/iframe.html?id=${s.id}&viewMode=story&globals=direction:${direction}`);
  await page.waitForSelector('#storybook-root > *', {timeout: 10000}).catch(() => {});
  const result = await new AxeBuilder({page})
    .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa', 'wcag22aa'])
    .options({rules: {'target-size': {enabled: true}}})
    .analyze();
  raw.push({title: s.title, story: s.id, direction, violations: result.violations});
}
await browser.close(); server.close();
const summary = summarize(raw);
await writeFile('dist/storybook/a11y-results.json', JSON.stringify(summary, null, 2));
const total = summary.components.reduce((n, c) => n + c.violations, 0);
console.log(`a11y: ${stories.length} stories × 2 directions, ${total} violations across ${summary.components.filter(c => c.violations).length} components`);
