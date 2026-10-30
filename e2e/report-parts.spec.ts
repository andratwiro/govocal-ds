import {test, expect, type Page} from '@playwright/test';
import {a11yReport, axeViolations} from './axe';

// The report builder's parts (benchmark-gaps plan, Task 8d): Page stage, Zoom bar, Block frame, the floating Rich text
// toolbar and inline editor, the plain Stat tile, Figure, Quote and Sortable list, found by role and name.
const story = (id: string) => `/storybook/iframe.html?id=${id}&viewMode=story`;
async function open(page: Page, id: string) {
  await page.goto(story(id));
  await page.locator('#storybook-root > *').first().waitFor();
}
async function report(page: Page, within = '#storybook-root') {
  let found: string[] = [];
  await expect(async () => { found = await axeViolations(page, within); }).toPass();
  a11yReport(found);
}

test('page stage: zoom steps scale the sheets, Fit fills the width, the page line follows the scroll', async ({page}) => {
  await open(page, 'components-layout-containers-page-stage--default');
  const stage = page.getByRole('region', {name: 'Pages'});
  const bar = page.getByRole('toolbar', {name: 'Zoom and pages'});
  await expect(stage.getByRole('article')).toHaveCount(3);
  await expect(bar).toContainText('83%');
  await expect(bar).toContainText('Page 1 of 3');
  const sheet = stage.getByRole('article', {name: 'Page 2'});
  const before = (await sheet.boundingBox())!.width;
  await bar.getByRole('button', {name: 'Zoom in'}).click();
  await expect(bar).toContainText('100%');
  expect((await sheet.boundingBox())!.width).toBeGreaterThan(before);
  // Fit: a sheet as wide as the stage less its padding; then Fit is off.
  const fit = bar.getByRole('button', {name: 'Fit'});
  await fit.click();
  await expect(fit).toBeDisabled();
  const stageBox = (await stage.boundingBox())!;
  const fitted = (await sheet.boundingBox())!.width;
  expect(fitted).toBeLessThanOrEqual(stageBox.width);
  expect(fitted).toBeGreaterThan(stageBox.width - 100);
  // Scroll to the last page: the page line follows.
  await stage.getByRole('article', {name: 'Page 3'}).scrollIntoViewIfNeeded();
  await stage.evaluate(el => el.scrollTo(0, el.scrollHeight));
  await expect(bar).toContainText('Page 3 of 3');
  // The cover has no footer; the others show the title and the number.
  await expect(stage.getByRole('article', {name: 'Page 1'}).locator('footer')).toHaveCount(0);
  await expect(sheet.locator('footer')).toHaveText(/Moving the city 2026\s*2/);
  await report(page);
});

test('page stage: a sheet is the document paper on the tertiary stage, in the document type', async ({page}) => {
  await open(page, 'components-layout-containers-page-stage--zoomed-out');
  const sheet = page.getByRole('article', {name: 'Page 2'});
  await expect(sheet).toHaveCSS('background-color', 'rgb(255, 255, 255)');
  await expect(page.getByRole('heading', {name: 'Moving the city 2026'})).toHaveCSS('font-size', '44px');
  await expect(page.getByRole('heading', {name: 'Executive summary'})).toHaveCSS('font-size', '28px');
});

test('page stage: right to left puts the footer title at the right', async ({page}) => {
  await open(page, 'components-layout-containers-page-stage--right-to-left');
  // Right to left is Arabic: the page is named and numbered in Arabic digits.
  await expect(page.locator('html')).toHaveAttribute('dir', 'rtl');
  const foot = page.getByRole('article', {name: 'Page ٢'}).locator('footer');
  await expect(foot.locator('span').last()).toHaveText('٢');
  const title = (await foot.getByText('Moving the city 2026').boundingBox())!;
  const number = (await foot.locator('span').last().boundingBox())!;
  expect(title.x).toBeGreaterThan(number.x);
  await report(page);
});

test('zoom bar: − and + stop at the ends, and the arrow keys move between the buttons', async ({page}) => {
  await open(page, 'components-layout-containers-zoom-bar--at-the-ends');
  const [low, high] = await page.getByRole('toolbar', {name: 'Zoom and pages'}).all();
  await expect(low.getByRole('button', {name: 'Zoom out'})).toBeDisabled();
  await expect(low.getByRole('button', {name: 'Zoom in'})).toBeEnabled();
  await expect(high.getByRole('button', {name: 'Zoom in'})).toBeDisabled();
  await open(page, 'components-layout-containers-zoom-bar--live');
  const bar = page.getByRole('toolbar', {name: 'Zoom and pages'});
  await page.keyboard.press('Tab');
  await expect(bar.getByRole('button', {name: 'Zoom out'})).toBeFocused();
  await page.keyboard.press('Enter');
  await expect(bar).toContainText('67%');
  await page.keyboard.press('ArrowRight');
  await expect(bar.getByRole('button', {name: 'Zoom in'})).toBeFocused();
  await report(page);
});

test('zoom bar: German numbers and words', async ({page}) => {
  await page.goto(`${story('components-layout-containers-zoom-bar--translated')}&globals=locale:de-DE`);
  const bar = page.getByRole('toolbar', {name: 'Zoom und Seiten'});
  await expect(bar).toContainText('83 %');
  await expect(bar).toContainText('Seite 3 von 1.284');
});

test('block frame: press selects, the toolbar moves and deletes, Esc steps out with focus kept', async ({page}) => {
  await open(page, 'components-layout-containers-block-frame--live');
  const numbers = page.getByRole('group', {name: 'By the numbers'});
  const tools = page.getByRole('toolbar', {name: 'By the numbers: block tools'});
  await expect(tools).toBeVisible();
  await expect(numbers).toHaveAttribute('aria-current', 'true');
  // Move up: By the numbers now sits before Executive summary.
  await tools.getByRole('button', {name: 'Move up'}).click();
  const names = () => page.getByRole('group').evaluateAll(gs => gs.map(g => g.getAttribute('aria-label')));
  expect(await names()).toEqual(['Title page', 'By the numbers', 'Executive summary', 'Votes per route']);
  await expect(tools.getByRole('button', {name: 'Move up'})).toBeDisabled();
  // Select another block by pressing it; Esc deselects and keeps focus on it.
  const routes = page.getByRole('group', {name: 'Votes per route'});
  await routes.click();
  await expect(page.getByRole('toolbar', {name: 'Votes per route: block tools'})).toBeVisible();
  await page.keyboard.press('Escape');
  await expect(page.getByRole('toolbar')).toHaveCount(0);
  await expect(routes).toBeFocused();
  // Pinned keeps only Delete.
  await page.getByRole('group', {name: 'Title page'}).click();
  const pinned = page.getByRole('toolbar', {name: 'Title page: block tools'});
  await expect(pinned.getByRole('button')).toHaveCount(1);
  await expect(pinned.getByRole('button', {name: 'Delete'})).toBeVisible();
  // Delete by keyboard.
  await routes.focus();
  await page.keyboard.press('Enter');
  await page.keyboard.press('Tab');
  const del = page.getByRole('toolbar', {name: 'Votes per route: block tools'}).getByRole('button', {name: 'Delete'});
  await del.focus();
  await page.keyboard.press('Enter');
  await expect(routes).toHaveCount(0);
  await report(page);
});

test('block frame: hover shows the tag; the AI-made mark has a name; the selected frame is the selected navy', async ({page}) => {
  await open(page, 'components-layout-containers-block-frame--ai-made');
  const block = page.getByRole('group', {name: 'Summary'});
  await expect(block.getByRole('img', {name: 'Made by the assistant'})).toBeVisible();
  await expect(block.getByText('Summary', {exact: true})).toBeHidden();
  await block.hover();
  await expect(block.getByText('Summary', {exact: true})).toBeVisible();
  await open(page, 'components-layout-containers-block-frame--selected');
  await expect(page.getByRole('group', {name: 'By the numbers'})).toHaveCSS('outline-color', 'rgb(4, 77, 108)');
  await report(page);
});

test('rich text toolbar, floating: a block-type segment, the formatting and the block\'s actions in one toolbar', async ({page}) => {
  await open(page, 'components-forms-rich-text-toolbar--floating-variant');
  const bar = page.getByRole('toolbar', {name: 'Formatting'});
  const types = bar.getByRole('radiogroup', {name: 'Block type'});
  await expect(types.getByRole('radio')).toHaveText(['Section', 'Sub-section', 'Text']);
  await expect(types.getByRole('radio', {name: 'Section', exact: true})).toBeChecked();
  await types.getByRole('radio', {name: 'Text'}).click();
  await expect(types.getByRole('radio', {name: 'Text'})).toBeChecked();
  // Image and video show only when a page handles them; the actions follow.
  await expect(bar.getByRole('button', {name: 'Add image'})).toHaveCount(0);
  await expect(bar.getByRole('button', {name: 'Add link'})).toBeVisible();
  await expect(bar.getByRole('button', {name: 'Delete'})).toBeVisible();
  // The docked toolbar is unchanged: all six buttons.
  await open(page, 'components-forms-rich-text-toolbar--default');
  await expect(page.getByRole('toolbar', {name: 'Formatting'}).getByRole('button')).toHaveCount(6);
  await open(page, 'components-layout-containers-block-frame--with-format-bar');
  await expect(page.getByRole('group', {name: 'Text'}).getByRole('toolbar', {name: 'Formatting'})).toBeVisible();
  await report(page);
});

test('figure: named by its finding, with the foot as its caption', async ({page}) => {
  await open(page, 'components-charts-figure--full-foot');
  const figure = page.getByRole('figure', {name: 'Cycling leads in every district'});
  await expect(figure.getByRole('heading', {level: 3, name: 'Cycling leads in every district'})).toHaveCSS('font-size', '19px');
  await expect(figure.locator('figcaption')).toHaveText(
    /Showing the top 3 of 5 routes\s*Participants could vote for more than one route\.\s*Source: Go Vocal, Cycle lanes 2026/);
  await report(page);
});

test('quote: the words in a blockquote, in the language\'s marks, with the person in the caption', async ({page}) => {
  await open(page, 'components-data-display-quote--translated');
  const quote = page.getByRole('figure');
  await expect(quote.getByRole('blockquote')).toHaveText(/^« Dès juin.* »$/);
  await expect(quote.locator('figcaption')).toContainText('Résidente A');
  await open(page, 'components-data-display-quote--in-a-row');
  await report(page);
});

/** Picks the focused row up with Enter, then presses ↓ until the focused drop place is `to` (React Aria focuses each
 * place, a "drop indicator" named for where the row would land). */
async function carry(page: Page, to: RegExp) {
  await page.keyboard.press('Enter');
  const place = page.locator('[aria-roledescription="drop indicator"]:focus');
  await expect(place).toHaveCount(1);
  for (let i = 0; i < 6 && !to.test((await place.getAttribute('aria-label')) ?? ''); i++) {
    await page.keyboard.press('ArrowDown');
    await expect(place).toHaveCount(1);
  }
  await expect(place).toHaveAttribute('aria-label', to);
}

test('sortable list: a row moves by keyboard (pick up, move, drop) and Esc puts it back', async ({page}) => {
  await open(page, 'components-tables-lists-sortable-list--default');
  const list = page.getByRole('grid', {name: 'Numbers'});
  // While carrying, React Aria adds drop places as empty rows: read the rows that hold words.
  const order = async () => (await list.getByRole('row').allTextContents()).filter(t => t.trim());
  expect((await order())[0]).toContain('Participants');
  await page.keyboard.press('Tab');
  await expect(list.locator(':focus')).toHaveCount(1);
  const handle = list.getByRole('button', {name: 'Move 3,600 Participants'});
  await handle.focus();
  await carry(page, /between 61% Took part for the first time and 6 Projects/);
  await page.keyboard.press('Enter');
  await expect.poll(async () => (await order())[0]).toContain('Took part for the first time');
  // Esc while carrying: nothing moves.
  await open(page, 'components-tables-lists-sortable-list--default');
  await list.getByRole('button', {name: 'Move 3,600 Participants'}).focus();
  await carry(page, /between 61% Took part for the first time and 6 Projects/);
  await page.keyboard.press('Escape');
  await expect.poll(async () => (await order())[0]).toContain('Participants');
  await expect.poll(async () => (await list.getByRole('row').allTextContents()).length).toBe(4);
  await report(page);
});

test('sortable list: a row moves by dragging its handle', async ({page}) => {
  await open(page, 'components-tables-lists-sortable-list--default');
  const list = page.getByRole('grid', {name: 'Numbers'});
  const handle = list.getByRole('button', {name: 'Move 3,600 Participants'});
  const target = list.getByRole('row').nth(2);
  const from = (await handle.boundingBox())!, to = (await target.boundingBox())!;
  await page.mouse.move(from.x + from.width / 2, from.y + from.height / 2);
  await page.mouse.down();
  await page.mouse.move(from.x + 10, from.y + 10, {steps: 4});
  await page.mouse.move(to.x + 40, to.y + to.height - 4, {steps: 10});
  await page.mouse.up();
  await expect.poll(async () => (await list.getByRole('row').allTextContents())[0]).toContain('Took part');
});

test('rich text editor, inline: no border or toolbar, the type around it, grows as you type', async ({page}) => {
  await open(page, 'components-forms-rich-text-editor--inline');
  const field = page.getByRole('textbox', {name: 'Summary'});
  await expect(field).toHaveAttribute('placeholder', 'Type here, or ask the assistant to write this part');
  await expect(page.getByRole('toolbar')).toHaveCount(0);
  await expect(field).toHaveCSS('border-top-width', '0px');
  await expect(field).toHaveCSS('font-size', '13px');
  const before = (await field.boundingBox())!.height;
  await page.keyboard.press('Tab');
  await expect(field).toBeFocused();
  await page.keyboard.type('One line.\nTwo lines.\nThree lines.');
  await expect.poll(async () => (await field.boundingBox())!.height).toBeGreaterThan(before);
  await open(page, 'components-forms-rich-text-editor--inline-in-a-block');
  await expect(page.getByRole('textbox', {name: 'Section heading'})).toHaveCSS('font-size', '28px');
  await report(page);
});
