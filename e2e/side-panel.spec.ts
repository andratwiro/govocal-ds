import {test, expect, type Page} from '@playwright/test';
import {a11yReport, axeViolations} from './axe';

// The Side panel (Components/Overlays/Side panel) over the Manage tab's list: a non-modal dialog. Focus moves in on
// open, Esc puts it back on the open record's row, the list stays usable, and the pager's ends turn off.
const story = (name: string) => `/storybook/iframe.html?id=components-overlays-side-panel--${name}&viewMode=story`;

/** Axe's findings in `within`, reported (never failing the test). Storybook's a11y addon runs axe in the preview as the
 * story renders; ours waits its turn ("Axe is already running"). */
async function report(page: Page, within: string) {
  let found: string[] = [];
  await expect(async () => { found = await axeViolations(page, within); }).toPass();
  a11yReport(found);
}
const panel = (page: Page) => page.getByRole('dialog', {name: 'Collect ideas'});
const row = (page: Page, n: number) => page.locator(`[role="row"][data-key="${n}"]`);
/** The record whose row holds focus, or null. */
const focusedRow = (page: Page) => page.evaluate(() =>
  document.activeElement?.closest<HTMLElement>('[role="row"]')?.dataset.key ?? null);

test('opens with focus inside, from a row click', async ({page}) => {
  await page.goto(story('closed'));
  await expect(panel(page)).toHaveCount(0);
  await row(page, 4).click();
  await expect(panel(page)).toBeVisible();
  await expect(panel(page)).toBeFocused();
  await expect(panel(page).getByText('4 of 124')).toBeVisible();
});

test('opens with focus inside, from the keyboard', async ({page}) => {
  await page.goto(story('closed'));
  await row(page, 1).click();
  await page.keyboard.press('Escape');
  await expect(panel(page)).toHaveCount(0);
  expect(await focusedRow(page)).toBe('1');
  // The table heard focus come back: the arrow keys move it (they didn't when focus came back inside React's commit).
  await page.keyboard.press('ArrowDown');
  expect(await focusedRow(page)).toBe('2');
  await page.keyboard.press('Enter');
  await expect(panel(page)).toBeFocused();
  await expect(panel(page).getByText('2 of 124')).toBeVisible();
});

test('floating, it is 560 wide (narrow: 440) and never wider than the window less 32', async ({page}) => {
  const width = async () => Math.round((await page.locator('.gv-side-panel').boundingBox())!.width);
  await page.setViewportSize({width: 1440, height: 900});
  await page.goto(story('default'));
  await expect(panel(page)).toBeVisible();
  expect(await width()).toBe(560);
  await page.goto(story('narrow'));
  await expect(panel(page)).toBeVisible();
  expect(await width()).toBe(440);
  await page.setViewportSize({width: 400, height: 800});
  await expect.poll(width).toBe(368);
});

test('record head: the words, Posted by, a title as the first heading, the author\'s role', async ({page}) => {
  await page.goto(story('record-head'));
  await expect(page.getByRole('dialog')).toHaveCount(2);
  await expect(page.getByText('Posted by').first()).toBeVisible();
  await expect(page.getByRole('heading', {level: 2, name: 'Shade over the playground'})).toBeVisible();
  await expect(page.getByText('Registered user')).toBeVisible();
});

test('Esc closes it and puts focus back on the open record\'s row', async ({page}) => {
  await page.goto(story('default'));
  await expect(panel(page)).toBeFocused();
  await panel(page).getByRole('button', {name: 'Next idea'}).click();
  await expect(panel(page).getByText('4 of 124')).toBeVisible();
  await page.keyboard.press('Escape');
  await expect(panel(page)).toHaveCount(0);
  expect(await focusedRow(page)).toBe('4');
});

test('× closes it the same way', async ({page}) => {
  await page.goto(story('closed'));
  await row(page, 6).click();
  await panel(page).getByRole('button', {name: 'Close'}).click();
  await expect(panel(page)).toHaveCount(0);
  expect(await focusedRow(page)).toBe('6');
});

test('the list behind stays usable: a row click shows that record', async ({page}) => {
  await page.goto(story('default'));
  await expect(panel(page).getByText('3 of 124')).toBeVisible();
  await row(page, 5).click();
  await expect(panel(page).getByText('5 of 124')).toBeVisible();
  // The click was the list's: focus stays there, so the arrows keep walking it.
  expect(await focusedRow(page)).toBe('5');
});

test('the first record: ‹ off, and walking back there moves focus to ›', async ({page}) => {
  await page.goto(story('first-record'));
  const prev = panel(page).getByRole('button', {name: 'Previous idea'});
  const next = panel(page).getByRole('button', {name: 'Next idea'});
  await expect(prev).toBeDisabled();
  await next.click();
  await expect(panel(page).getByText('2 of 124')).toBeVisible();
  await expect(prev).toBeEnabled();
  await prev.click();
  await expect(panel(page).getByText('1 of 124')).toBeVisible();
  await expect(prev).toBeDisabled();
  await expect(next).toBeFocused();
});

test('the last record: › off, and walking there moves focus to ‹', async ({page}) => {
  await page.goto(story('last-record'));
  const prev = panel(page).getByRole('button', {name: 'Previous idea'});
  const next = panel(page).getByRole('button', {name: 'Next idea'});
  await expect(panel(page).getByText('124 of 124')).toBeVisible();
  await expect(next).toBeDisabled();
  await prev.click();
  await expect(next).toBeEnabled();
  await next.focus();
  await page.keyboard.press('Enter');
  await expect(panel(page).getByText('124 of 124')).toBeVisible();
  await expect(next).toBeDisabled();
  await expect(prev).toBeFocused();
});

test('no Save: a change applies at once, with Undo', async ({page}) => {
  await page.goto(story('default'));
  await expect(panel(page).getByRole('button', {name: /save/i})).toHaveCount(0);
  await panel(page).getByRole('button', {name: /Status/}).click();
  await page.getByRole('option', {name: 'Accepted'}).click();
  await expect(row(page, 3)).toContainText('Accepted');
  await page.getByRole('button', {name: 'Undo'}).click();
  await expect(row(page, 3)).not.toContainText('Accepted');
});

for (const name of ['default', 'screening', 'long-body-with-footer']) {
  test(`${name}: axe findings in the panel, reported`, async ({page}) => {
    await page.goto(story(name));
    await expect(panel(page)).toBeVisible();
    await report(page, '.gv-side-panel');
  });
}

test('an inline panel takes no focus when it shows, unless it asks with autoFocus', async ({page}) => {
  await page.goto(story('with-icon-and-title'));
  const inline = page.getByRole('dialog', {name: 'By the numbers'});
  await expect(inline).toBeVisible();
  // Two frames: the panel's own focus move ran in its first.
  await page.evaluate(() => new Promise(r => requestAnimationFrame(() => requestAnimationFrame(r))));
  await expect(inline).not.toBeFocused();
  expect(await page.evaluate(() => document.activeElement === document.body)).toBe(true);
});
