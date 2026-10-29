import {test, expect} from '@playwright/test';

test('projects follows the real admin: views, filters, a full project table', async ({page}) => {
  await page.goto('/backoffice/#/projects');
  await expect(page.getByRole('heading', {level: 1, name: 'Projects'})).toBeVisible();
  const views = page.getByRole('tablist', {name: 'Project views'});
  for (const t of ['Projects', 'Folders', 'Spaces', 'Calendar', 'Arrange projects']) {
    await expect(views.getByRole('tab', {name: t, exact: true})).toBeVisible();
  }
  await expect(page.getByRole('searchbox', {name: 'Search projects'})).toBeVisible();
  const table = page.getByRole('grid', {name: 'Projects'});
  for (const c of ['Project', 'Participants', 'Phase', 'Managers', 'Visibility', 'Start', 'End']) {
    await expect(table.getByRole('columnheader', {name: c})).toBeVisible();
  }
  await expect(table.getByRole('row')).toHaveCount(9); // header + eight projects
});

test('a row has its actions menu', async ({page}) => {
  await page.goto('/backoffice/#/projects');
  await page.getByRole('button', {name: 'Actions for Harbour Plan 2030'}).click();
  await expect(page.getByRole('menuitem', {name: 'Duplicate'})).toBeVisible();
});

test('projects names what the system still lacks', async ({page}) => {
  await page.goto('/backoffice/#/projects');
  const gaps = await page.locator('[data-gap]').evaluateAll(els => [...new Set(els.map(e => e.getAttribute('data-gap')))]);
  expect(gaps).toEqual(expect.arrayContaining(['Status', 'Avatar', 'Icon button', 'Pill']));
});
