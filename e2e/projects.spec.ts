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

test('rows use the gv Status, Avatar and icon button; New project opens its menu', async ({page}) => {
  await page.goto('/backoffice/#/projects');
  const row = page.getByRole('row', {name: /Green Corridors for Larkvale/});
  await expect(row.getByRole('link', {name: 'Green Corridors for Larkvale'}))
    .toHaveAttribute('href', '#/projects/green-corridors/phases/p1/build');
  await expect(row.locator('.gv-status')).toHaveText('Published');
  await expect(row.locator('.gv-avatar')).toHaveText('A');
  await expect(page.getByRole('row', {name: /Harbour Plan 2030/}).locator('.gv-status')).toHaveText('Draft');
  await expect(page.getByRole('row', {name: /Harbour Plan 2030/}).locator('.gv-avatar[data-unassigned]')).toBeVisible();
  await expect(page.getByRole('button', {name: 'Actions for Harbour Plan 2030'})).toHaveClass(/gv-icon-button/);
  await expect(page.getByRole('tab', {name: 'Spaces', exact: true}).locator('.gv-pill')).toHaveText('New');
  await page.getByRole('button', {name: 'New project'}).click();
  await expect(page.getByRole('menuitem', {name: 'From scratch'})).toBeVisible();
  await expect(page.getByRole('menuitem', {name: 'Use a template'})).toBeVisible();
});

test('projects names what the system still lacks', async ({page}) => {
  await page.goto('/backoffice/#/projects');
  const gaps = await page.locator('[data-gap]').evaluateAll(els => [...new Set(els.map(e => e.getAttribute('data-gap')))]);
  // Avatar, Status, Icon button and Pill now exist in src/components/gv; only the project thumbnail is missing.
  expect(gaps).toEqual(['Project thumbnail']);
});
