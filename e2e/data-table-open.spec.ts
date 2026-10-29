import {test, expect, type Page} from '@playwright/test';
import {a11yReport, axeViolations} from './axe';

// Data table: bulk selection and an open row on one table (Components/Data display/Data table, "With bulk selection
// and an open row"). A row press always opens; the checkbox, Space and Shift / ⌘ / Ctrl clicks tick; `openKey` marks
// the open row.
const story = '/storybook/iframe.html?id=components-data-display-data-table--with-bulk-selection-and-an-open-row&viewMode=story';
const table = (page: Page) => page.getByRole('grid', {name: 'Ideas'});
const row = (page: Page, id: string) => table(page).locator(`[role="row"][data-key="${id}"]`);
const panel = (page: Page) => page.getByRole('dialog', {name: 'Collect ideas'});
const ticked = (page: Page) => table(page).locator('[role="row"][aria-selected="true"]');

test('a row press opens it even while rows are ticked; the ticks stay', async ({page}) => {
  await page.goto(story);
  await expect(panel(page).getByText('3 of 10')).toBeVisible();
  await expect(ticked(page)).toHaveCount(2);
  // Before the fix, React Aria ticked this row instead (checkbox selection turns row presses into ticks).
  await row(page, 'idea-7').getByRole('rowheader').click();
  await expect(panel(page).getByText('7 of 10')).toBeVisible();
  await expect(ticked(page)).toHaveCount(2);
  await expect(row(page, 'idea-7')).not.toHaveAttribute('aria-selected', 'true');
});

test('the checkbox ticks without opening', async ({page}) => {
  await page.goto(story);
  await row(page, 'idea-8').locator('.gv-checkbox').click();
  await expect(row(page, 'idea-8')).toHaveAttribute('aria-selected', 'true');
  await expect(ticked(page)).toHaveCount(3);
  await expect(panel(page).getByText('3 of 10')).toBeVisible();
  await expect(page.getByText('3 selected')).toBeVisible();
});

test('a Shift click ticks a range instead of opening', async ({page}) => {
  await page.goto(story);
  await row(page, 'idea-6').click({modifiers: ['Shift']});
  await expect(row(page, 'idea-6')).toHaveAttribute('aria-selected', 'true');
  await expect(panel(page).getByText('3 of 10')).toBeVisible();
});

test('openKey marks the open row: data-open and aria-current, and it follows the pager', async ({page}) => {
  await page.goto(story);
  await expect(row(page, 'idea-3')).toHaveAttribute('aria-current', 'true');
  await expect(row(page, 'idea-3')).toHaveAttribute('data-open', 'true');
  await expect(table(page).locator('[aria-current="true"]')).toHaveCount(1);
  await panel(page).getByRole('button', {name: 'Next idea'}).click();
  await expect(row(page, 'idea-4')).toHaveAttribute('aria-current', 'true');
  await expect(row(page, 'idea-3')).not.toHaveAttribute('aria-current', 'true');
});

test('keyboard: Space ticks the focused row, Enter opens it', async ({page}) => {
  await page.goto(story);
  // The story opens with the panel open and focus in it.
  await expect(panel(page)).toBeFocused();
  await page.keyboard.press('Escape');
  await expect(panel(page)).toHaveCount(0);
  // Focus went back to the open row (and the table knows it: the arrow keys move it): walk down to an unticked one.
  await expect(row(page, 'idea-3')).toBeFocused();
  await page.keyboard.press('ArrowDown');
  await page.keyboard.press('ArrowDown');
  await page.keyboard.press('ArrowDown');
  const focused = await page.evaluate(() => document.activeElement?.closest<HTMLElement>('[role="row"]')?.dataset.key);
  expect(focused).toBe('idea-6');
  await page.keyboard.press('Space');
  await expect(row(page, 'idea-6')).toHaveAttribute('aria-selected', 'true');
  await expect(panel(page)).toHaveCount(0);
  await page.keyboard.press('ArrowDown');
  await page.keyboard.press('Enter');
  await expect(panel(page).getByText('7 of 10')).toBeVisible();
  await expect(row(page, 'idea-7')).not.toHaveAttribute('aria-selected', 'true');
});

test('axe findings on the table and the panel, reported', async ({page}) => {
  await page.goto(story);
  await expect(panel(page)).toBeVisible();
  let found: string[] = [];
  await expect(async () => { found = await axeViolations(page, 'body'); }).toPass();
  a11yReport(found);
});
