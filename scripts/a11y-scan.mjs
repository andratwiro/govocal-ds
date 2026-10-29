import {readFile, readdir, writeFile} from 'node:fs/promises';
import {availableParallelism} from 'node:os';
import {chromium} from 'playwright';
import {AxeBuilder} from '@axe-core/playwright';
import {serve} from './lib/serve.mjs';
import {summarize} from './lib/a11y.mjs';

const OUT = 'dist/storybook';
// CI splits the scan over runners: A11Y_SHARD=2/3 scans every third story from the second and writes its raw findings
// to a11y-raw-2.json; `--merge` then folds every a11y-raw-*.json into the one results file the page reads.
if (process.argv.includes('--merge')) {
  const parts = (await readdir(OUT)).filter(f => /^a11y-raw-\d+\.json$/.test(f));
  const raw = (await Promise.all(parts.map(async f => JSON.parse(await readFile(`${OUT}/${f}`, 'utf8'))))).flat();
  await writeResults(raw, `${parts.length} shards`);
  process.exit(0);
}
const [shard, shards] = (process.env.A11Y_SHARD ?? '1/1').split('/').map(Number);
const index = JSON.parse(await readFile(`${OUT}/index.json`, 'utf8'));
const stories = Object.values(index.entries).filter(e => e.type === 'story' && !e.title.startsWith('Overview'))
  .filter((_, i) => i % shards === shard - 1);
// 388 stories × 2 directions one at a time took over ten minutes: a few pages in one browser, each in its own
// context, share the work. A11Y_CONCURRENCY=1 brings back the one-page run on a busy machine.
const concurrency = Math.max(1, Number(process.env.A11Y_CONCURRENCY ?? Math.min(4, availableParallelism())));
const server = await serve(OUT, 6206);
let browser = await chromium.launch();
let relaunching = null;

// A busy machine sometimes closes chromium under the scan. One relaunch serves every page that saw it die.
async function relaunch() {
  relaunching ??= (async () => {
    try { await browser.close(); } catch {}
    browser = await chromium.launch();
  })().finally(() => { relaunching = null; });
  await relaunching;
}
const newPage = async () => (await browser.newContext()).newPage();

async function scanOne(page, s, direction) {
  await page.goto(`${server.url}/iframe.html?id=${s.id}&viewMode=story&globals=direction:${direction}`);
  await page.waitForSelector('#storybook-root > *', {timeout: 10000}).catch(() => {});
  // A dialog fading in reads as low contrast mid-fade (e2e/axe.ts's settled()): wait out running animations.
  await page.waitForFunction(() => document.getAnimations().every(a => a.playState !== 'running'), {timeout: 5000}).catch(() => {});
  // Storybook's a11y panel runs axe in the same frame on load, and a second run at that moment is refused ("Axe is
  // already running"): wait and try again, as e2e/axe.ts does. axe never settling must cost one story, not the run.
  for (let attempt = 0; ; attempt++) {
    let timer;
    const limit = new Promise((_, reject) => { timer = setTimeout(() => reject(new Error('page closed: axe took over 30 s')), 30000); });
    try {
      return await Promise.race([
        new AxeBuilder({page})
          .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa', 'wcag22aa'])
          .options({rules: {'target-size': {enabled: true}}})
          .analyze(),
        limit,
      ]);
    } catch (err) {
      if (attempt >= 10 || !String(err).includes('Axe is already running')) throw err;
      await page.waitForTimeout(200);
    } finally {
      clearTimeout(timer);
    }
  }
}

const queue = stories.flatMap(s => ['ltr', 'rtl'].map(direction => ({s, direction})));
const raw = [];
async function worker() {
  let page = await newPage();
  for (let job = queue.shift(); job; job = queue.shift()) {
    const {s, direction} = job;
    const keep = result => raw.push({title: s.title, story: s.id, direction, violations: result.violations});
    try {
      keep(await scanOne(page, s, direction));
    } catch (err) {
      if (/closed|disconnected/i.test(err.message)) {
        // One retry on a fresh page (and a fresh browser if it died): a crash costs this story a retry, not the run.
        try {
          if (!browser.isConnected()) await relaunch();
          await page.context().close().catch(() => {});
          page = await newPage();
          keep(await scanOne(page, s, direction));
        } catch (err2) {
          console.warn(`a11y: skipped ${s.id} (${direction}) after relaunch: ${err2.message}`);
          page = await newPage().catch(() => page);
        }
        continue;
      }
      // Accessibility is shown, never blocking: one story that fails to render never stops the scan.
      console.warn(`a11y: skipped ${s.id} (${direction}): ${err.message}`);
    }
  }
  await page.context().close().catch(() => {});
}

const started = Date.now();
try {
  await Promise.all(Array.from({length: concurrency}, worker));
} finally {
  await browser.close().catch(() => {});
  server.close();
}
const seconds = Math.round((Date.now() - started) / 1000);
if (shards > 1) {
  await writeFile(`${OUT}/a11y-raw-${shard}.json`, JSON.stringify(raw));
  console.log(`a11y: shard ${shard}/${shards}, ${stories.length} stories × 2 directions (${concurrency} pages, ${seconds} s)`);
} else {
  await writeResults(raw, `${concurrency} pages, ${seconds} s`);
}

async function writeResults(raw, how) {
  // Pages finish out of order: sort so the results file reads the same run to run.
  raw.sort((a, b) => a.story.localeCompare(b.story) || a.direction.localeCompare(b.direction));
  const summary = summarize(raw);
  await writeFile(`${OUT}/a11y-results.json`, JSON.stringify(summary, null, 2));
  const total = summary.components.reduce((n, c) => n + c.violations, 0);
  const stories = new Set(raw.map(r => r.story)).size;
  console.log(`a11y: ${stories} stories × 2 directions, ${total} violations across ${summary.components.filter(c => c.violations).length} components (${how})`);
}
