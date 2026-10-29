import {test, expect, type Page} from '@playwright/test';

// Body rows only (the header row is not an input).
const inputRows = (page: Page) => page.getByRole('grid', {name: 'Inputs'}).getByRole('rowgroup').nth(1).getByRole('row');

test('input manager follows the real admin: filters, project list, selectable inputs', async ({page}) => {
  await page.goto('/backoffice/#/inputs');
  await expect(page.getByRole('heading', {level: 1, name: 'Input manager'})).toBeVisible();
  await expect(page.getByRole('switch', {name: /need feedback/})).toBeVisible();
  await expect(page.getByRole('searchbox', {name: 'Search inputs'})).toBeVisible();
  await expect(page.getByRole('listbox', {name: 'Projects'})).toBeVisible();
  const grid = page.getByRole('grid', {name: 'Inputs'});
  // Real admin columns, plus the prototype's Status column; headers are gv List header cells.
  for (const c of ['Title', 'Status', 'Assignee', 'Comments', 'Likes', 'Dislikes', 'Published on']) {
    await expect(grid.getByRole('columnheader', {name: c, exact: true})).toBeVisible();
  }
  // The prototype shows the assignee as an avatar (dashed when unassigned) and today's inputs with a new dot.
  await expect(grid.getByRole('img', {name: 'Unassigned'}).first()).toBeVisible();
  await expect(grid.getByRole('img', {name: 'New input'}).first()).toBeVisible();
  await expect(grid.getByRole('img', {name: 'Content warning'})).toHaveCount(1);
  await expect(page.getByRole('switch', {name: /need feedback\s*8$/})).toBeVisible(); // count of inputs waiting, in a Pill
  // The starter's checkbox input is visually hidden under its cell: click what a person sees.
  await inputRows(page).first().locator('.indicator').click();
  await expect(inputRows(page).first().getByRole('checkbox')).toBeChecked();
  await expect(inputRows(page).first()).toHaveAttribute('aria-selected', 'true');
});

test('choosing a project narrows the inputs', async ({page}) => {
  await page.goto('/backoffice/#/inputs');
  const all = await inputRows(page).count();
  await page.getByRole('listbox', {name: 'Projects'}).getByRole('option', {name: 'Harbour Plan 2030'}).click();
  await expect(inputRows(page)).toHaveCount(3); // the three Harbour Plan inputs
  for (const link of await inputRows(page).getByRole('link').all()) await expect(link).toHaveText('Harbour Plan 2030');
  expect(all).toBe(12);
});

test('assignee, feedback switch and search narrow the inputs', async ({page}) => {
  await page.goto('/backoffice/#/inputs');
  const grid = page.getByRole('grid', {name: 'Inputs'});
  await page.getByRole('button', {name: /Assignee/}).first().click();
  await page.getByRole('option', {name: 'Unassigned'}).click();
  await expect(inputRows(page)).toHaveCount(3);
  await page.getByText('Only show inputs that need feedback').click();
  await expect(inputRows(page)).toHaveCount(2);
  await page.getByRole('searchbox', {name: 'Search inputs'}).fill('nothing like this');
  await expect(grid.getByText('No inputs match these filters.')).toBeVisible();
});

test('sortable columns reorder the inputs', async ({page}) => {
  await page.goto('/backoffice/#/inputs');
  const grid = page.getByRole('grid', {name: 'Inputs'});
  await expect(grid.getByRole('button', {name: 'Published on'})).toHaveAttribute('aria-pressed', 'true');
  await grid.getByRole('button', {name: 'Likes', exact: true}).click();
  await expect(grid.getByRole('button', {name: 'Likes', exact: true})).toHaveAttribute('aria-pressed', 'true');
  await expect(inputRows(page).first()).toContainText('Night buses on weekends'); // most likes (21)
});

test('input manager names what the system still lacks', async ({page}) => {
  await page.goto('/backoffice/#/inputs');
  const gaps = await page.locator('[data-gap]').evaluateAll(els => [...new Set(els.map(e => e.getAttribute('data-gap')))]);
  // Pill now comes from the system; only pagination is still missing.
  expect(gaps).toEqual(['Pagination']);
});
