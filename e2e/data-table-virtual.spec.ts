import {test, expect, type Page} from '@playwright/test';
import {a11yReport, axeViolations} from './axe';

// Data table, virtualised (Components/Data display/Data table, "Virtualized · 5,000 people"): 5,000 invented people,
// sorted by name (Admin 50, Admin 100, … Resident 4999), of whom the table draws only the rows in view. The same
// table otherwise: keyboard, bulk selection with `toKeySet`, an open row, a pinned header.
const story = '/storybook/iframe.html?id=components-tables-lists-data-table--virtualized-5000-people&viewMode=story';
const more = '/storybook/iframe.html?id=components-tables-lists-data-table--virtualized-loading-more&viewMode=story';
const table = (page: Page) => page.getByRole('grid', {name: 'Users'});
const rows = (page: Page) => table(page).locator('[role="row"][data-key]');
const row = (page: Page, id: string) => table(page).locator(`[role="row"][data-key="${id}"]`);
const focusedKey = (page: Page) => page.evaluate(() => (document.activeElement as HTMLElement | null)?.closest<HTMLElement>('[role="row"]')?.dataset.key);
const header = (page: Page) => table(page).locator('.gv-data-table__header');

test('draws fewer than 100 of the 5,000 rows, and tells assistive tech the whole count', async ({page}) => {
  await page.goto(story);
  await expect(row(page, 'person-50')).toBeVisible();
  await expect(table(page)).toHaveAttribute('aria-rowcount', '5001');
  const drawn = await rows(page).count();
  expect(drawn).toBeGreaterThan(5);
  expect(drawn).toBeLessThan(100);
});

test('scrolling draws later rows under the pinned header', async ({page}) => {
  await page.goto(story);
  await expect(row(page, 'person-50')).toBeVisible();
  await table(page).evaluate(g => { g.scrollTop = g.scrollHeight / 2; });
  await expect.poll(async () => Math.max(...await rows(page).evaluateAll(rs => rs.map(r => Number(r.getAttribute('aria-rowindex'))))))
    .toBeGreaterThan(2000);
  await expect(row(page, 'person-50')).toHaveCount(0);
  expect(await rows(page).count()).toBeLessThan(100);
  // The header stays at the table's top edge.
  const [grid, head] = await Promise.all([table(page).boundingBox(), header(page).boundingBox()]);
  expect(Math.abs(head!.y - grid!.y)).toBeLessThanOrEqual(2);
});

test('the keyboard walks every row: ↓, Page Down, End and Home move focus, and the row shows below the header', async ({page}) => {
  await page.goto(story);
  await row(page, 'person-50').focus();
  expect(await focusedKey(page)).toBe('person-50');
  await page.keyboard.press('ArrowDown');
  expect(await focusedKey(page)).toBe('person-100');

  await page.keyboard.press('PageDown');
  const paged = await focusedKey(page);
  const index = Number(await row(page, paged!).getAttribute('aria-rowindex'));
  expect(index).toBeGreaterThan(5);
  // Brought into view, not left under the pinned header (the browser's own page scroll used to run as well).
  const [head, focused] = await Promise.all([header(page).boundingBox(), row(page, paged!).boundingBox()]);
  expect(focused!.y).toBeGreaterThanOrEqual(head!.y + head!.height - 1);

  await page.keyboard.press('End');
  await expect.poll(() => focusedKey(page)).toBe('person-4999');
  await expect(row(page, 'person-4999')).toBeInViewport();
  await expect(row(page, 'person-4999')).toHaveAttribute('aria-rowindex', '5001');

  await page.keyboard.press('Home');
  await expect.poll(() => focusedKey(page)).toBe('person-50');
  await expect(row(page, 'person-50')).toBeInViewport();
});

test('the header box ticks all 5,000, and toKeySet turns "all" into 5,000 keys', async ({page}) => {
  await page.goto(story);
  await table(page).getByRole('columnheader').first().locator('.gv-checkbox').click();
  await expect(page.getByText('5,000 selected')).toBeVisible();
  await page.getByRole('button', {name: 'Export'}).click();
  await expect(page.getByRole('status').filter({hasText: 'Export:'})).toHaveText('Export: 5,000 users');
  // A row drawn only now, far down the list, is ticked too.
  await table(page).evaluate(g => { g.scrollTop = g.scrollHeight; });
  await expect(row(page, 'person-4999')).toHaveAttribute('aria-selected', 'true');
});

test('the open row keeps its mark when it scrolls away and back', async ({page}) => {
  await page.goto(story);
  await row(page, 'person-100').getByRole('rowheader').click();
  await expect(page.getByRole('dialog', {name: 'Registered users'})).toBeVisible();
  await expect(row(page, 'person-100')).toHaveAttribute('aria-current', 'true');
  await expect(row(page, 'person-100')).toHaveAttribute('data-open', 'true');
  await expect(table(page).locator('[role="row"][aria-current]')).toHaveCount(1);

  // Focus moves to another row (the focused row is always kept drawn), then the open one scrolls out of the page.
  await row(page, 'person-50').focus();
  await table(page).evaluate(g => { g.scrollTop = g.scrollHeight; });
  await expect(row(page, 'person-4999')).toBeAttached();
  await expect(row(page, 'person-100')).toHaveCount(0);
  // The rows drawn in its place carry no mark.
  await expect(table(page).locator('[role="row"][aria-current]')).toHaveCount(0);

  await table(page).evaluate(g => { g.scrollTop = 0; });
  await expect(row(page, 'person-100')).toHaveAttribute('aria-current', 'true');
  await expect(row(page, 'person-100')).toHaveAttribute('data-open', 'true');
  await expect(table(page).locator('[role="row"][aria-current]')).toHaveCount(1);
});

test('a list that loads in pages: scrolling to its end shows "Loading more…" and adds the next 100', async ({page}) => {
  await page.goto(more);
  await expect(table(page)).toHaveAttribute('aria-rowcount', '101');
  await table(page).evaluate(g => { g.scrollTop = g.scrollHeight; });
  await expect(page.getByText('Loading more…')).toBeAttached();
  await expect(table(page)).toHaveAttribute('aria-rowcount', '201');
  await expect(page.getByText('200 of 1,000 users loaded')).toBeVisible();
});

test('axe on the virtualised table (reported, not blocking)', async ({page}) => {
  await page.goto(story);
  await expect(row(page, 'person-50')).toBeVisible();
  a11yReport(await axeViolations(page, '[role="grid"][aria-label="Users"]'));
});
