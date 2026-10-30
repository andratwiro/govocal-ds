import {test, expect, type Page} from '@playwright/test';
import {axeViolations, a11yReport} from './axe';
import {headingJumps} from './headings';

const URL = '/backoffice/#/reporting/report-builder/r1/editor';
const TITLE = 'Larkvale park renewal: project report';

/** Collects console errors and uncaught exceptions; each test ends by checking there were none. */
function watch(page: Page) {
  const errors: string[] = [];
  page.on('console', m => m.type() === 'error' && errors.push(m.text()));
  page.on('pageerror', e => errors.push(String(e)));
  return errors;
}

const outline = (page: Page) => page.getByRole('treegrid', {name: 'Report outline'});
const pages = (page: Page) => page.getByRole('region', {name: 'Report pages'});
const block = (page: Page, name: RegExp | string) => pages(page).getByRole('group', {name});
// A tooltip open under a resting pointer takes the first Esc (React Aria closes it first): rest the pointer on the
// grey margin under the page.
const rest = (page: Page) => page.mouse.move(700, 895);
const toast = (page: Page, text: string | RegExp) => page.locator('.react-aria-Toast').filter({hasText: text});
const assistant = (page: Page) => page.getByRole('region', {name: 'Assistant'});
/** The blocks on the pages, in order, by their Block frame's id. */
const order = (page: Page) => pages(page).locator('[id^="block-"]').evaluateAll(els => els.map(e => e.id.replace(/^block-/, '')));

test('the report view: three columns, outline, pages and the assistant', async ({page}) => {
  const errors = watch(page);
  await page.setViewportSize({width: 1440, height: 900});
  await page.goto(URL);
  await expect(page.getByRole('heading', {level: 1, name: TITLE})).toBeVisible();
  const outlinePanel = page.getByRole('region', {name: 'Report outline'});
  const side = assistant(page);
  for (const col of [outlinePanel, pages(page), side]) await expect(col).toBeVisible();
  // Side by side, left to right.
  const [a, b, c] = await Promise.all([outlinePanel, pages(page), side].map(l => l.boundingBox()));
  expect(a!.x + a!.width).toBeLessThanOrEqual(b!.x);
  expect(b!.x + b!.width).toBeLessThanOrEqual(c!.x);
  // The outline: sections numbered, with their page; blocks under them.
  await expect(outline(page).getByRole('row', {name: /Executive summary/})).toContainText('01');
  await expect(outline(page).getByRole('row', {name: 'Platform participation'})).toBeVisible();
  // The pages: title page, contents, sections, on a Page stage with its Zoom bar.
  await expect(pages(page).getByRole('heading', {level: 2, name: TITLE})).toBeVisible();
  await expect(pages(page).getByRole('article', {name: 'Page 1', exact: true})).toBeVisible();
  await expect(page.getByRole('toolbar', {name: 'Zoom and pages'})).toContainText(/Page 1 of \d+/);
  // One bar style: Bar rows, the bars the finding names in the accent, the rest grey.
  const bars = block(page, /Platform participation/).locator('.gv-bar-row');
  await expect(bars).toHaveCount(3);
  await expect(block(page, /Platform participation/)).toContainText('Showing top 3 of 6');
  await expect(block(page, /Platform participation/)).toContainText('Source: Go Vocal');
  // Label over value: the Stat tiles of By the numbers.
  await expect(block(page, /By the numbers/).first().locator('.gv-kpi')).toHaveCount(4);
  await expect(side.getByRole('button', {name: 'Make the summary shorter'})).toBeVisible();
  await expect(side.getByRole('textbox', {name: 'Ask the assistant'})).toBeVisible();
  a11yReport(await axeViolations(page, '.bo-report'));
  expect(await headingJumps(page)).toEqual([]);
  expect(errors).toEqual([]);
});

test('selecting in the outline selects on the page, and the other way round', async ({page}) => {
  const errors = watch(page);
  await page.goto(URL);
  await outline(page).getByRole('row', {name: 'Platform participation'}).click();
  const chart = block(page, /Platform participation/);
  await expect(chart).toHaveAttribute('aria-current', 'true');
  await expect(chart).toBeInViewport();
  await expect(page.getByRole('dialog', {name: 'Platform participation'})).toBeVisible();
  // Page → outline.
  await block(page, /Survey themes/).click();
  await expect(outline(page).getByRole('row', {name: 'Survey themes'})).toHaveAttribute('aria-selected', 'true');
  await expect(outline(page).getByRole('row', {name: 'Platform participation'})).toHaveAttribute('aria-selected', 'false');
  await expect(page.getByRole('dialog', {name: 'Survey themes'})).toBeVisible();
  // The settings change the page: all 5 themes, then values off.
  const settings = page.getByRole('dialog', {name: 'Survey themes'});
  await settings.getByRole('radio', {name: 'Top 3'}).click();
  await expect(block(page, /Survey themes/).locator('.gv-bar-row')).toHaveCount(3);
  await settings.getByText('Show the value on each bar').click();
  await expect(block(page, /Survey themes/)).not.toContainText('420');
  expect(errors).toEqual([]);
});

test('the keyboard: Enter selects a block, its toolbar is next, Esc closes the settings', async ({page}) => {
  const errors = watch(page);
  await page.goto(URL);
  await rest(page);
  const text = block(page, /Tree planting and the cycle lane vote/);
  await text.focus();
  await page.keyboard.press('Enter');
  await expect(text).toHaveAttribute('aria-current', 'true');
  await expect(page.getByRole('dialog', {name: 'Tree planting and the cycle lane vote'})).toBeVisible();
  // Next is its floating format bar (the block type first); the arrow keys walk to Bold.
  await page.keyboard.press('Tab');
  const tools = text.getByRole('toolbar', {name: /block tools/});
  await expect(tools.locator(':focus')).toHaveCount(1);
  await expect(tools.getByRole('radio', {name: 'Text'})).toHaveAttribute('aria-checked', 'true');
  const bold = tools.getByRole('button', {name: 'Bold'});
  for (let i = 0; i < 6 && !(await bold.evaluate(el => el === document.activeElement)); i++) await page.keyboard.press('ArrowRight');
  await expect(bold).toBeFocused();
  await page.keyboard.press('Enter');
  await expect(bold).toHaveAttribute('aria-pressed', 'true');
  // The words are typed on the page, in an inline Rich text editor.
  await expect(text.getByRole('textbox', {name: 'Text'})).toBeVisible();
  await page.keyboard.press('Escape');
  await expect(text).not.toHaveAttribute('aria-current', 'true');
  await expect(text.locator('strong')).toHaveCount(1);
  await expect(assistant(page)).toBeVisible();
  // Arrow keys in the outline walk the blocks; Esc there clears the selection.
  // The settings panel opens beside it, and focus stays on the row.
  const row = outline(page).getByRole('row', {name: 'Platform participation'});
  await row.click();
  await expect(page.getByRole('dialog', {name: 'Platform participation'})).toBeVisible();
  await expect(row).toBeFocused();
  await page.keyboard.press('ArrowDown');
  await expect(text).toHaveAttribute('aria-current', 'true');
  await page.keyboard.press('Escape');
  await expect(assistant(page)).toBeVisible();
  expect(errors).toEqual([]);
});

test('the block toolbar moves, duplicates and deletes, with Undo', async ({page}) => {
  const errors = watch(page);
  await page.goto(URL);
  const before = await order(page);
  const text = block(page, /Tree planting and the cycle lane vote/);
  await text.click();
  const tools = text.getByRole('toolbar', {name: /block tools/});
  await tools.getByRole('button', {name: 'Move down'}).click();
  const moved = await order(page);
  const i = before.indexOf('b-text-1');
  expect(moved[i + 1]).toBe('b-text-1');
  await expect(text.getByRole('button', {name: 'Move up'})).toBeVisible();
  await text.getByRole('button', {name: 'Move up'}).click();
  expect(await order(page)).toEqual(before);
  await expect(page.getByRole('button', {name: /^Saved just now/})).toBeVisible();
  // Delete, then Undo.
  await text.getByRole('button', {name: 'Delete'}).click();
  await expect(block(page, /Tree planting and the cycle lane vote/)).toHaveCount(0);
  await expect(outline(page).getByRole('row', {name: 'Tree planting and the cycle lane vote'})).toHaveCount(0);
  const undo = toast(page, 'Tree planting and the cycle lane vote deleted');
  await expect(undo).toBeVisible();
  await undo.getByRole('button', {name: 'Undo'}).click();
  await expect(block(page, /Tree planting and the cycle lane vote/)).toHaveCount(1);
  expect(await order(page)).toEqual(before);
  // Pinned blocks keep their place: the title page has Delete only.
  await block(page, /Title page/).click();
  const pinned = block(page, /Title page/).getByRole('toolbar', {name: /block tools/});
  await expect(pinned.getByRole('button')).toHaveCount(1);
  await expect(pinned.getByRole('button', {name: 'Delete'})).toBeVisible();
  // Duplicate puts a copy under the block.
  await block(page, /Survey themes/).click();
  await block(page, /Survey themes/).getByRole('button', {name: 'Duplicate'}).click();
  await expect(block(page, /Survey themes/)).toHaveCount(2);
  await expect(toast(page, 'Survey themes duplicated')).toBeVisible();
  expect(errors).toEqual([]);
});

test('widget settings: Settings and Data tabs, the sources and their preview', async ({page}) => {
  const errors = watch(page);
  await page.goto(URL);
  await block(page, /Platform participation/).click();
  const panel = page.getByRole('dialog', {name: 'Platform participation'});
  const tabs = panel.getByRole('tablist', {name: 'Widget settings'});
  await expect(tabs.getByRole('tab', {name: 'Settings'})).toHaveAttribute('aria-selected', 'true');
  await expect(panel.getByRole('textbox', {name: 'Finding'})).toHaveValue('Tree planting has the highest project participant count');
  await panel.getByRole('textbox', {name: 'Finding'}).fill('Tree planting drew the most people');
  await expect(block(page, /Platform participation/).getByRole('heading', {name: 'Tree planting drew the most people'})).toBeVisible();
  await tabs.getByRole('tab', {name: 'Data'}).click();
  await expect(panel.getByRole('heading', {name: 'What’s included'})).toBeVisible();
  const sources = panel.getByRole('treegrid', {name: 'Sources'});
  await expect(sources.getByRole('row', {name: 'Public realm'})).toBeVisible();
  await sources.getByRole('row', {name: 'Tree planting by street'}).click();
  const preview = page.getByRole('dialog', {name: 'Tree planting by street'});
  await expect(preview.getByText('Recorded coverage').or(preview.getByText('Coverage'))).toBeVisible();
  await preview.getByRole('button', {name: 'Close'}).last().click();
  await expect(preview).toHaveCount(0);
  // The panel's Esc closes the settings and puts focus back on the block.
  await panel.getByRole('tab', {name: 'Data'}).focus();
  await page.keyboard.press('Escape');
  await expect(assistant(page)).toBeVisible();
  await expect(block(page, /Platform participation/)).toBeFocused();
  expect(errors).toEqual([]);
});

test('one language control and the Download menu', async ({page}) => {
  const errors = watch(page);
  await page.goto(URL);
  const lang = page.getByRole('button', {name: /Editing language/});
  await expect(lang).toContainText('English');
  await lang.click();
  await expect(page.getByRole('option', {name: 'English'})).toBeVisible();
  await page.getByRole('option', {name: 'French'}).click();
  await expect(lang).toContainText('French');
  await block(page, /Platform participation/).click();
  const panel = page.getByRole('dialog', {name: 'Platform participation'});
  await expect(panel.getByText('Missing in French: readers see the English.').first()).toBeVisible();
  await expect(panel.getByRole('textbox', {name: 'Finding'})).toHaveValue('');
  // A section's heading is a Multilingual text field with no switcher of its own: the page's language picks it.
  await block(page, /Executive summary/).click();
  const section = page.getByRole('dialog', {name: 'Executive summary'});
  await expect(section.getByRole('textbox', {name: 'Section heading, French'})).toHaveValue('Synthèse');
  await expect(section.getByRole('radiogroup', {name: /^Language of/})).toHaveCount(0);
  // Download: PDF, or Word (Beta).
  await page.getByRole('button', {name: 'Download'}).click();
  await expect(page.getByRole('menuitem', {name: 'PDF'})).toBeVisible();
  await expect(page.getByRole('menuitem', {name: /Word/})).toContainText('Beta');
  await page.getByRole('menuitem', {name: 'PDF'}).click();
  await expect(toast(page, 'Preparing the PDF')).toBeVisible();
  expect(errors).toEqual([]);
});

test('the widget library opens in the outline column and adds a block', async ({page}) => {
  const errors = watch(page);
  await page.goto(URL);
  await block(page, /Survey themes/).click();
  await page.getByRole('region', {name: 'Report outline'}).getByRole('button', {name: 'Add widget'}).click();
  const library = page.getByRole('grid', {name: 'Widgets'});
  await expect(library).toBeVisible();
  await expect(library.getByRole('row', {name: /Bar chart/})).toBeVisible();
  // Esc goes back to the outline.
  await rest(page);
  await expect(library.getByRole('row', {name: /^Title page/})).toBeFocused();
  await page.keyboard.press('Escape');
  await expect(library).toHaveCount(0);
  await expect(outline(page)).toBeVisible();
  const count = (await order(page)).length;
  await page.getByRole('region', {name: 'Report outline'}).getByRole('button', {name: 'Add widget'}).click();
  await page.getByRole('grid', {name: 'Widgets'}).getByRole('row', {name: /^Divider/}).click();
  await expect.poll(async () => (await order(page)).length).toBe(count + 1);
  await expect(toast(page, 'Divider added')).toBeVisible();
  // The new block sits right under the selected one, selected.
  const ids = await order(page);
  expect(ids[ids.indexOf('b-themes') + 1]).toMatch(/^divider-new/);
  await expect(page.getByRole('dialog', {name: 'Divider'})).toBeVisible();
  expect(errors).toEqual([]);
});

test('version history opens in the side panel and Esc closes it', async ({page}) => {
  const errors = watch(page);
  await page.goto(URL);
  await page.getByRole('button', {name: /^Saved 10:19 by you/}).click();
  const history = page.getByRole('dialog', {name: 'Version history'});
  await expect(history).toBeVisible();
  await expect(history.getByRole('heading', {level: 2, name: 'Version history'})).toBeVisible();
  await expect(history.getByRole('heading', {name: 'Today'})).toBeVisible();
  await expect(history.getByText('Manager A').first()).toBeVisible();
  await expect(history.getByText('Showing now')).toBeVisible();
  await history.getByRole('button', {name: 'More'}).first().click();
  await page.getByRole('menuitem', {name: 'Restore this version'}).click();
  await expect(toast(page, 'Version restored')).toBeVisible();
  await history.getByRole('button', {name: 'Close the version history'}).focus();
  await page.keyboard.press('Escape');
  await expect(assistant(page)).toBeVisible();
  expect(errors).toEqual([]);
});

test('the assistant changes the report, with Undo', async ({page}) => {
  const errors = watch(page);
  await page.goto(URL);
  const summary = block(page, /Executive summary/);
  await expect(summary.getByRole('listitem')).toHaveCount(4);
  await assistant(page).getByRole('button', {name: 'Make the summary shorter'}).click();
  // It thinks (send becomes stop), then answers with the change, its Undo beside it, never in a toast.
  await expect(assistant(page).getByRole('button', {name: 'Stop'})).toBeVisible();
  await expect(summary.getByRole('listitem')).toHaveCount(3);
  const log = assistant(page).getByRole('log', {name: 'Conversation'});
  await expect(log).toContainText('I cut the executive summary');
  await expect(summary.getByRole('img', {name: 'Made by the assistant'})).toBeVisible();
  await expect(toast(page, 'The assistant changed')).toHaveCount(0);
  await log.getByRole('button', {name: 'Undo this change'}).click();
  await expect(summary.getByRole('listitem')).toHaveCount(4);
  await expect(log.getByRole('button', {name: 'Undo this change'})).toBeDisabled();
  expect(errors).toEqual([]);
});

test('a new blank report is empty until the assistant generates it', async ({page}) => {
  const errors = watch(page);
  await page.goto('/backoffice/#/reporting');
  await page.getByRole('button', {name: 'Create a report'}).click();
  const builder = page.getByRole('dialog', {name: 'Create a report'});
  await builder.getByRole('textbox', {name: 'Report title'}).fill('Harbour walk survey report');
  await builder.getByRole('radiogroup', {name: 'Report template'}).getByText('Start blank').click();
  await builder.getByRole('button', {name: 'Create report'}).click();
  await expect(page).toHaveURL(/#\/reporting\/report-builder\/new\/editor$/);
  await expect(page.getByRole('heading', {level: 1, name: 'Harbour walk survey report'})).toBeVisible();
  await expect(pages(page).getByRole('heading', {name: 'No widgets in this report yet'})).toBeVisible();
  await expect(pages(page).getByRole('article', {name: 'Page 1'})).toBeVisible();
  await page.getByRole('button', {name: 'Generate a report from the folder'}).click();
  const modal = page.getByRole('dialog', {name: 'Generate the report'});
  await expect(modal).toBeVisible();
  await modal.getByRole('button', {name: 'Generate'}).click();
  await expect(pages(page).getByRole('article', {name: 'Generating the report'}).locator('.gv-skeleton').first()).toBeVisible();
  await expect(assistant(page).getByRole('list', {name: 'Steps'}).getByRole('listitem')).toHaveCount(3);
  await expect(page.getByRole('button', {name: 'Zoom in'})).toBeDisabled();
  await expect(toast(page, 'Report generated')).toBeVisible();
  await expect(pages(page).getByRole('heading', {level: 2, name: 'Harbour walk survey report'})).toBeVisible();
  expect(errors).toEqual([]);
});

test('the report view names the parts the system lacks', async ({page}) => {
  await page.goto(URL);
  const seen = new Set<string>();
  const collect = async () => (await page.locator('[data-missing-part]').evaluateAll(els => els.map(e => e.getAttribute('data-missing-part')!)))
    .forEach(g => seen.add(g));
  await collect();
  await block(page, /Platform participation/).click();
  await collect();
  await block(page, /By the numbers/).first().click();
  // The layouts are thumbnails (Choice card), named for screen readers; the order is a Sortable list.
  await expect(page.getByRole('radio', {name: /^Lead/})).toBeChecked();
  await expect(page.getByRole('grid', {name: 'Numbers'})).toBeVisible();
  await collect();
  await page.getByRole('button', {name: /^Saved 10:19 by you/}).click();
  await collect();
  // The report moved onto Page stage, Block frame, Figure, Quote, Sortable list, the Assistant panel and the Activity
  // feed: only the map is left.
  expect([...seen].sort()).toEqual(['Map']);
  // The old slide deck is gone.
  expect(seen.has('Slide stage')).toBe(false);
});

test('the assistant about one block, and with the assistant switched off', async ({page}) => {
  const errors = watch(page);
  await page.goto(URL);
  // "Ask the assistant" in a widget's settings scopes the chat to it; the chip's × goes back to the whole report.
  await block(page, /Survey themes/).click();
  await page.getByRole('dialog', {name: 'Survey themes'}).getByRole('button', {name: 'Ask the assistant'}).click();
  await expect(assistant(page).getByRole('heading', {name: 'What should change in survey themes?'})).toBeVisible();
  await expect(assistant(page).getByRole('textbox', {name: 'Ask the assistant'})).toBeFocused();
  await assistant(page).getByRole('button', {name: 'Ask about the whole report'}).click();
  await expect(assistant(page).getByRole('heading', {name: 'What should it change?'})).toBeVisible();
  // Show what changed scrolls to the block the assistant changed.
  await assistant(page).getByRole('button', {name: 'Make the summary shorter'}).click();
  await assistant(page).getByRole('button', {name: 'Show what changed'}).click();
  await expect(block(page, /Executive summary/)).toBeInViewport();
  // Off: what it could do, whom to ask, no ✦ in the format bar.
  await page.goto('about:blank');
  await page.goto(`${URL}?assistant=off`);
  await expect(assistant(page).getByRole('heading', {name: 'What the assistant could do here'})).toBeVisible();
  await expect(assistant(page).getByRole('textbox', {name: 'Ask the assistant'})).toBeDisabled();
  const text = block(page, /Tree planting and the cycle lane vote/);
  await text.click();
  await expect(text.getByRole('toolbar', {name: /block tools/}).getByRole('button', {name: 'Ask the assistant'})).toHaveCount(0);
  expect(errors).toEqual([]);
});

test('the insert line between blocks opens the library for that place', async ({page}) => {
  const errors = watch(page);
  await page.goto(URL);
  const before = await order(page);
  const at = before.indexOf('b-themes');
  await block(page, /Survey themes/).hover();
  await pages(page).getByRole('button', {name: 'Add widget here'}).nth(at).click();
  await page.getByRole('grid', {name: 'Widgets'}).getByRole('row', {name: /^Divider/}).click();
  const after = await order(page);
  expect(after[at + 1]).toMatch(/^divider-new/);
  expect(after.length).toBe(before.length + 1);
  expect(errors).toEqual([]);
});
