import {test, expect} from '@playwright/test';

test('input manager follows the real admin: filters, project list, selectable inputs', async ({page}) => {
  await page.goto('/backoffice/#/inputs');
  await expect(page.getByRole('heading', {level: 1, name: 'Input manager'})).toBeVisible();
  await expect(page.getByRole('switch', {name: /need feedback/})).toBeVisible();
  await expect(page.getByRole('searchbox', {name: 'Search inputs'})).toBeVisible();
  await expect(page.getByRole('listbox', {name: 'Projects'})).toBeVisible();
  const grid = page.getByRole('grid', {name: 'Inputs'});
  for (const c of ['Title', 'Assignee', 'Comments', 'Likes', 'Dislikes', 'Published on']) {
    await expect(grid.getByRole('columnheader', {name: c, exact: true})).toBeVisible();
  }
  // The starter's checkbox input is visually hidden under its cell: click what a person sees.
  await grid.getByRole('row').nth(1).locator('.indicator').click();
  await expect(grid.getByRole('row').nth(1).getByRole('checkbox')).toBeChecked();
  await expect(grid.getByRole('row').nth(1)).toHaveAttribute('aria-selected', 'true');
});

test('choosing a project narrows the inputs', async ({page}) => {
  await page.goto('/backoffice/#/inputs');
  const grid = page.getByRole('grid', {name: 'Inputs'});
  const all = await grid.getByRole('row').count();
  await page.getByRole('listbox', {name: 'Projects'}).getByRole('option', {name: 'Harbour Plan 2030'}).click();
  await expect(grid.getByRole('row')).toHaveCount(4); // header + three Harbour Plan inputs
  for (const link of await grid.getByRole('row').getByRole('link').all()) await expect(link).toHaveText('Harbour Plan 2030');
  expect(all).toBe(13);
});

test('assignee, feedback switch and search narrow the inputs', async ({page}) => {
  await page.goto('/backoffice/#/inputs');
  const grid = page.getByRole('grid', {name: 'Inputs'});
  await page.getByRole('button', {name: /Assignee/}).first().click();
  await page.getByRole('option', {name: 'Unassigned'}).click();
  await expect(grid.getByRole('row')).toHaveCount(4);
  await page.getByText('Only show inputs that need feedback').click();
  await expect(grid.getByRole('row')).toHaveCount(3);
  await page.getByRole('searchbox', {name: 'Search inputs'}).fill('nothing like this');
  await expect(grid.getByText('No inputs match these filters.')).toBeVisible();
});

test('input manager names what the system still lacks', async ({page}) => {
  await page.goto('/backoffice/#/inputs');
  const gaps = await page.locator('[data-gap]').evaluateAll(els => [...new Set(els.map(e => e.getAttribute('data-gap')))]);
  expect(gaps).toEqual(expect.arrayContaining(['Pill', 'Pagination']));
});
