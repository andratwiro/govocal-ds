import {test, expect} from '@playwright/test';

test('users follows the real admin: segments, groups, a selectable user table', async ({page}) => {
  await page.goto('/backoffice/#/users');
  await expect(page.getByRole('heading', {level: 1, name: 'Users'})).toBeVisible();
  for (const b of ['Seats overview', 'User insights', 'Invite users', 'Add a new group']) {
    await expect(page.getByRole('button', {name: b})).toBeVisible();
  }
  const segments = page.getByRole('listbox', {name: 'Users'});
  for (const s of ['Registered users', 'Admins', 'Space managers', 'Folder managers', 'Project managers',
    'Banned emails', 'Email bounces']) {
    await expect(segments.getByRole('option', {name: new RegExp(`^${s}`)})).toBeVisible();
  }
  await expect(page.getByRole('listbox', {name: 'Groups'}).getByRole('option', {name: /^Verified residents/})).toBeVisible();
  await expect(page.getByRole('searchbox', {name: 'Search groups'})).toBeVisible();
  await expect(page.getByRole('searchbox', {name: 'Search users'})).toBeVisible();
  await expect(page.getByRole('button', {name: 'Export all'})).toBeVisible();
  const grid = page.getByRole('grid', {name: 'Registered users'});
  for (const c of ['Name', 'Role', 'Last active', 'Joined', 'Options']) {
    await expect(grid.getByRole('columnheader', {name: c})).toBeVisible();
  }
  await expect(grid.getByRole('row')).toHaveCount(13); // header + twelve people
});

test('the Card counts the list; rows use the gv Avatar and icon button; a row has its options menu', async ({page}) => {
  await page.goto('/backoffice/#/users');
  await expect(page.getByRole('heading', {level: 3, name: 'Registered users'}).locator('..').locator('.gv-card__pill')).toHaveText('12');
  const row = page.getByRole('row', {name: /Admin A/});
  await expect(row.locator('.gv-avatar')).toHaveText('AA');
  await expect(row.getByText('user1@example.org')).toBeVisible();
  await expect(row.getByText('Platform admin')).toBeVisible();
  const options = page.getByRole('button', {name: 'Options for Resident E'});
  await expect(options).toHaveClass(/gv-icon-button/);
  await options.click();
  for (const m of ['Make platform admin', 'Add to group', 'Block user', 'Delete user']) {
    await expect(page.getByRole('menuitem', {name: m})).toBeVisible();
  }
});

test('the Select checkbox picks every row and shows the selection actions', async ({page}) => {
  await page.goto('/backoffice/#/users');
  await page.getByText('Select', {exact: true}).click();
  const grid = page.getByRole('grid', {name: 'Registered users'});
  await expect(grid.getByRole('row').nth(1)).toHaveAttribute('aria-selected', 'true');
  await expect(page.getByText('12 selected')).toBeVisible();
  await expect(page.getByRole('button', {name: 'Add to group'})).toBeVisible();
  await expect(page.getByRole('button', {name: 'Export selected'})).toBeVisible();
});

test('segments, groups and search narrow the users', async ({page}) => {
  await page.goto('/backoffice/#/users');
  const segments = page.getByRole('listbox', {name: 'Users'});
  const groups = page.getByRole('listbox', {name: 'Groups'});
  await segments.getByRole('option', {name: /^Admins/}).click();
  const admins = page.getByRole('grid', {name: 'Admins'});
  await expect(admins.getByRole('row')).toHaveCount(3);
  await groups.getByRole('option', {name: /^Youth panel/}).click();
  await expect(page.getByRole('grid', {name: 'Youth panel'}).getByRole('row')).toHaveCount(4);
  await segments.getByRole('option', {name: /^Banned emails/}).click();
  await expect(page.getByText('No users here.')).toBeVisible();
  await segments.getByRole('option', {name: /^Registered users/}).click();
  await page.getByRole('searchbox', {name: 'Search users'}).fill('user12@');
  await expect(page.getByRole('grid', {name: 'Registered users'}).getByRole('row')).toHaveCount(2);
  await page.getByRole('searchbox', {name: 'Search groups'}).fill('youth');
  await expect(groups.getByRole('option', {name: /^Verified residents/})).toHaveCount(0);
  await expect(groups.getByRole('option', {name: /^Youth panel/})).toBeVisible();
});

test('sorting by name puts Admin A first', async ({page}) => {
  await page.goto('/backoffice/#/users');
  const grid = page.getByRole('grid', {name: 'Registered users'});
  await grid.getByRole('columnheader', {name: 'Name'}).click();
  await expect(grid.getByRole('row').nth(1)).toContainText('Admin A');
});

test('users names what the system still lacks', async ({page}) => {
  await page.goto('/backoffice/#/users');
  const gaps = await page.locator('[data-gap]').evaluateAll(els => [...new Set(els.map(e => e.getAttribute('data-gap')))]);
  expect(gaps).toEqual(['Pagination']);
});
