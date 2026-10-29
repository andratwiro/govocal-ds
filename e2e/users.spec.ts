import {test, expect} from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';
import {headingJumps} from './headings';
import {a11yReport} from './axe';

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
  // Every admin table pages (docs/DECISIONS.md): ten of the twelve people on the first page.
  await expect(grid.getByRole('row')).toHaveCount(11);
});

// The list sits in a Panel (Panel's "With a toolbar" story): the title and description in the head, the toolbar row
// (the count, Export all, the search), the table flush, the Pagination in the foot.
test('the list is a Panel: head, toolbar with the count and search, the table, Pagination in the foot', async ({page}) => {
  await page.goto('/backoffice/#/users');
  const panel = page.getByRole('region', {name: 'Registered users'});
  await expect(panel).toHaveClass(/gv-panel/);
  await expect(panel.getByRole('heading', {level: 2, name: 'Registered users'})).toBeVisible();
  await expect(panel.locator('.gv-panel__description')).toContainText('Get an overview of all the people');
  const toolbar = panel.locator('.gv-panel__toolbar');
  await expect(toolbar.getByRole('heading', {level: 3, name: '12 users'})).toBeVisible();
  await expect(toolbar.getByRole('searchbox', {name: 'Search users'})).toBeVisible();
  await expect(toolbar.getByRole('button', {name: 'Export all'})).toBeVisible();
  await expect(panel.locator('.gv-panel__body').getByRole('grid', {name: 'Registered users'})).toBeVisible();
  await expect(panel.locator('.gv-panel__foot').getByRole('navigation', {name: 'User pages'})).toBeVisible();
  a11yReport(await axeOn(page, '.gv-panel'));
  // The one count follows the search.
  await toolbar.getByRole('searchbox', {name: 'Search users'}).fill('admin');
  await expect(toolbar.getByRole('heading', {level: 3, name: '2 users'})).toBeVisible();
  // A group's page carries Edit Group and Delete Group in the head.
  await page.getByRole('listbox', {name: 'Groups'}).getByRole('option', {name: /^Youth panel/}).click();
  const group = page.getByRole('region', {name: 'Youth panel'});
  await expect(group.locator('.gv-panel__actions').getByRole('button', {name: 'Edit Group'})).toBeVisible();
  await expect(group.locator('.gv-panel__actions').getByRole('button', {name: 'Delete Group'})).toBeVisible();
});

test('Pagination moves through the users; the header select-all ticks the page shown', async ({page}) => {
  await page.goto('/backoffice/#/users');
  const grid = page.getByRole('grid', {name: 'Registered users'});
  const pager = page.getByRole('navigation', {name: 'User pages'});
  await expect(pager.getByRole('button', {name: 'Page 1'})).toHaveAttribute('aria-current', 'page');
  await pager.getByRole('button', {name: 'Page 2'}).click();
  await expect(pager.getByRole('button', {name: 'Page 2'})).toHaveAttribute('aria-current', 'page');
  await expect(grid.getByRole('row')).toHaveCount(3); // header + Admin B and Resident L
  await expect(grid.getByRole('row', {name: /Admin B/})).toBeVisible();
  await expect(grid.getByRole('row', {name: /Resident E/})).toHaveCount(0);
  await grid.getByRole('columnheader').getByRole('checkbox').click({force: true});
  await expect(page.getByText('2 selected')).toBeVisible();
  // A tick on another page stays: page 1 adds to it.
  await pager.getByRole('button', {name: 'Page 1'}).click();
  await grid.getByRole('row', {name: /Resident E/}).locator('.gv-checkbox .indicator').click();
  await expect(page.getByText('3 selected')).toBeVisible();
  await page.getByRole('button', {name: 'Clear selection'}).click();
  // A new search goes back to the first page.
  await pager.getByRole('button', {name: 'Page 2'}).click();
  await page.getByRole('searchbox', {name: 'Search users'}).fill('resident');
  await expect(pager.getByRole('button', {name: 'Page 1'})).toHaveAttribute('aria-current', 'page');
});

test('the Panel counts the list; rows use the gv Avatar and icon button; a row has its options menu', async ({page}) => {
  await page.goto('/backoffice/#/users');
  await expect(page.getByRole('heading', {level: 3, name: '12 users'})).toBeVisible();
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

// docs/DECISIONS.md: select-all lives in the header only; the toolbar's "Select" checkbox is gone.
test('the header select-all picks every row of the page and shows the selection actions', async ({page}) => {
  await page.goto('/backoffice/#/users');
  await expect(page.getByText('Select', {exact: true})).toHaveCount(0);
  const grid = page.getByRole('grid', {name: 'Registered users'});
  await grid.getByRole('columnheader').getByRole('checkbox').click({force: true});
  await expect(grid.getByRole('row').nth(1)).toHaveAttribute('aria-selected', 'true');
  await expect(page.getByText('10 selected')).toBeVisible();
  // The Selection bar takes the count's place in the toolbar.
  await expect(page.getByRole('heading', {name: '12 users'})).toHaveCount(0);
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

test('sorting by name orders the rows, and pressing again flips them', async ({page}) => {
  await page.goto('/backoffice/#/users');
  const grid = page.getByRole('grid', {name: 'Registered users'});
  await expect(grid.getByRole('row').nth(2)).toContainText('Resident E'); // default: joined, newest first
  // The gv DataTable sorts from the column header itself (React Aria's sortable column), no inner button.
  await grid.getByRole('columnheader', {name: 'Name'}).click();
  await expect(grid.getByRole('row').nth(1)).toContainText('Admin A');
  await expect(grid.getByRole('row').nth(2)).toContainText('Admin B');
  await grid.getByRole('columnheader', {name: 'Name'}).click();
  await expect(grid.getByRole('row').nth(1)).toContainText('Resident L');
});

test('users names what the system still lacks', async ({page}) => {
  await page.goto('/backoffice/#/users');
  const gaps = await page.locator('[data-gap]').evaluateAll(els => [...new Set(els.map(e => e.getAttribute('data-gap')))]);
  expect(gaps).toEqual([]);
});

test('the table is the gv DataTable: Joined sort toggles, a row selects, one select-all, options open', async ({page}) => {
  await page.goto('/backoffice/#/users');
  const grid = page.getByRole('grid', {name: 'Registered users'});
  await expect(grid).toHaveClass(/gv-data-table/);
  const joined = grid.getByRole('columnheader', {name: 'Joined'});
  await expect(joined).toHaveAttribute('aria-sort', 'descending');
  await expect(grid.getByRole('row').nth(1)).toContainText('Admin A'); // newest first
  await joined.click();
  await expect(joined).toHaveAttribute('aria-sort', 'ascending');
  await expect(grid.getByRole('row').nth(1)).not.toContainText('Admin A');
  await joined.click();
  await expect(joined).toHaveAttribute('aria-sort', 'descending');
  await expect(grid.getByRole('row').nth(1)).toContainText('Admin A');

  // One "select all": the header's checkbox (docs/DECISIONS.md).
  await expect(grid.getByRole('columnheader').getByRole('checkbox')).toHaveCount(1);
  await expect(page.getByRole('checkbox', {name: /Select all users/})).toHaveCount(0);
  const row = grid.getByRole('row', {name: /Resident E/});
  await row.locator('.gv-checkbox .indicator').click();
  await expect(row).toHaveAttribute('aria-selected', 'true');
  await expect(page.getByText('1 selected')).toBeVisible();

  // The prototype's quiet list: no zebra (two unselected neighbours share one fill), compact rows.
  await page.mouse.move(0, 0);
  const [a, b] = [grid.getByRole('row').nth(4), grid.getByRole('row').nth(5)];
  const bg = (l: typeof a) => l.evaluate(e => getComputedStyle(e).backgroundColor);
  expect(await bg(a)).toBe(await bg(b));
  expect((await a.boundingBox())!.height).toBeLessThan(70);

  await row.getByRole('button', {name: 'Options for Resident E'}).click();
  await expect(page.getByRole('menuitem', {name: 'Block user'})).toBeVisible();
});

test('the users table passes axe (WCAG 2.2 AA)', async ({page}) => {
  await page.goto('/backoffice/#/users');
  await expect(page.getByRole('grid', {name: 'Registered users'})).toBeVisible();
  const {violations} = await new AxeBuilder({page}).include('.gv-data-table')
    .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa', 'wcag22aa']).analyze();
  a11yReport(violations.map(v => `${v.id}: ${v.nodes.map(n => n.target).join(', ')}`));
});

// ── The first clicks (shallow: each control leads somewhere visible) ─────────

const toast = (page: import('@playwright/test').Page) => page.locator('.react-aria-Toast');
const axeOn = async (page: import('@playwright/test').Page, selector: string) => {
  const {violations} = await new AxeBuilder({page}).include(selector)
    .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa', 'wcag22aa']).analyze();
  return violations.map(v => `${v.id}: ${v.nodes.map(n => n.target).join(', ')}`);
};

test('Invite users opens the invitations page: invite by email, then the list of all invitations', async ({page}) => {
  await page.goto('/backoffice/#/users');
  await page.getByRole('button', {name: 'Invite users'}).click();
  await expect(page).toHaveURL(/#\/users\/invitations$/);
  await expect(page.getByRole('heading', {level: 1, name: 'Invitations'})).toBeVisible();
  const tabs = page.getByRole('tablist', {name: 'Invitations'});
  await expect(tabs.getByRole('tab', {name: 'Invite users'})).toHaveAttribute('aria-selected', 'true');
  await expect(tabs.getByRole('tab', {name: 'All invitations'})).toBeVisible();
  await page.getByRole('textbox', {name: 'Email addresses'}).fill('new1@example.org, new2@example.org');
  for (const f of ['Role', 'Add to a group']) await expect(page.getByRole('button', {name: new RegExp(f)}).first()).toBeVisible();
  await page.getByRole('textbox', {name: 'Invitation message'}).fill('Join us on the platform.');
  a11yReport(await axeOn(page, '.bo-page'));
  await page.getByRole('button', {name: 'Send invites'}).click();
  await expect(toast(page).first()).toContainText('2 invitations sent');
  await tabs.getByRole('tab', {name: 'All invitations'}).click();
  const grid = page.getByRole('grid', {name: 'All invitations'});
  for (const c of ['Email', 'Invited', 'Status']) await expect(grid.getByRole('columnheader', {name: c})).toBeVisible();
  await expect(grid.getByRole('row', {name: /new2@example.org/})).toContainText('Pending');
  await page.getByRole('button', {name: 'Export all invitations'}).click();
  await expect(toast(page).first()).toContainText('Export started');
});

test('Add a new group: choose normal or smart, name it, and it joins the list with its own page', async ({page}) => {
  await page.goto('/backoffice/#/users');
  await page.getByRole('button', {name: 'Add a new group'}).click();
  const modal = page.getByRole('dialog', {name: 'Add a new group'});
  // The kinds are the gv Card's choice cards (a stacked Card with its radio list), not restyled buttons.
  const kinds = modal.locator('.gv-card[data-layout="stacked"]').getByRole('radiogroup', {name: 'Kind of group'});
  await expect(kinds.getByRole('radio', {name: /Create a normal group/})).toBeVisible();
  await expect(kinds.getByRole('radio', {name: /Create a smart group/})).toBeVisible();
  await expect(modal.getByRole('button', {name: 'Save group'})).toBeDisabled();
  a11yReport(await axeOn(page, '.gv-modal'));
  await kinds.getByText('Create a smart group').click();
  await expect(kinds.getByRole('radio', {name: /Create a smart group/})).toBeChecked();
  await modal.getByRole('textbox', {name: 'Name of the group'}).fill('Cyclists');
  await expect(modal.getByRole('button', {name: /Rule/})).toBeVisible();
  await modal.getByRole('button', {name: 'Save group'}).click();
  await expect(modal).toHaveCount(0);
  await expect(page).toHaveURL(/#\/users\/groups\/[\w-]+$/);
  await expect(page.getByRole('listbox', {name: 'Groups'}).getByRole('option', {name: /^Cyclists/})).toHaveAttribute('aria-selected', 'true');
  await expect(page.getByRole('grid', {name: 'Cyclists'})).toBeVisible();
  await expect(toast(page).first()).toContainText('Group created');
});

test('a group has its own page: its members, Edit Group to rename it, Delete Group with a confirmation', async ({page}) => {
  await page.goto('/backoffice/#/users');
  await page.getByRole('listbox', {name: 'Groups'}).getByRole('option', {name: /^Youth panel/}).click();
  await expect(page).toHaveURL(/#\/users\/groups\/youth$/);
  await expect(page.getByRole('grid', {name: 'Youth panel'}).getByRole('row')).toHaveCount(4);
  await page.getByRole('button', {name: 'Edit Group'}).click();
  const modal = page.getByRole('dialog', {name: 'Edit Group'});
  await modal.getByRole('textbox', {name: 'Name of the group'}).fill('Youth council');
  await modal.getByRole('button', {name: 'Save group'}).click();
  await expect(page.getByRole('grid', {name: 'Youth council'})).toBeVisible();
  // Delete Group confirms in an Alert dialog: no ×, focus on Cancel, Esc cancels; then Delete group deletes.
  const deleteGroup = page.getByRole('button', {name: 'Delete Group'});
  await deleteGroup.click();
  const confirm = page.getByRole('alertdialog', {name: 'Delete this group?'});
  await expect(confirm).toBeVisible();
  await expect(confirm.getByRole('button', {name: 'Cancel'})).toBeFocused();
  await expect(confirm.getByRole('button', {name: 'Close'})).toHaveCount(0);
  await page.keyboard.press('Escape');
  await expect(confirm).toHaveCount(0);
  await expect(page.getByRole('grid', {name: 'Youth council'})).toBeVisible();
  await deleteGroup.click();
  await confirm.getByRole('button', {name: 'Delete group'}).click();
  await expect(page.getByRole('listbox', {name: 'Groups'}).getByRole('option', {name: /^Youth council/})).toHaveCount(0);
  await expect(page.getByRole('grid', {name: 'Registered users'})).toBeVisible();
});

test('Seats overview shows seats used and available, with the admins and managers', async ({page}) => {
  await page.goto('/backoffice/#/users');
  await page.getByRole('button', {name: 'Seats overview'}).click();
  await expect(page).toHaveURL(/#\/users\/seats$/);
  await expect(page.getByRole('heading', {level: 1, name: 'Seats overview'})).toBeVisible();
  for (const k of ['Admin seats used', 'Admin seats available', 'Manager seats used', 'Manager seats available']) {
    await expect(page.getByText(k, {exact: true})).toBeVisible();
  }
  await expect(page.getByRole('grid', {name: 'Admins'}).getByRole('row')).toHaveCount(3);
  await expect(page.getByRole('grid', {name: 'Managers'}).getByRole('row', {name: /Manager C/})).toBeVisible();
  a11yReport(await axeOn(page, '.bo-page'));
  await page.getByRole('link', {name: 'Users'}).first().click();
  await expect(page).toHaveURL(/#\/users$/);
});

test('User insights leads to the users dashboard', async ({page}) => {
  await page.goto('/backoffice/#/users');
  await page.getByRole('button', {name: 'User insights'}).click();
  await expect(page).toHaveURL(/#\/dashboard\/users$/);
});

test('a row opens the user profile: name, email, role, joined and participation', async ({page}) => {
  await page.goto('/backoffice/#/users');
  await page.getByRole('row', {name: /Manager C/}).getByText('Project manager').click();
  await expect(page).toHaveURL(/#\/users\/u3$/);
  await expect(page.getByRole('heading', {level: 1, name: 'Manager C'})).toBeVisible();
  await expect(page.getByText('user3@example.org')).toBeVisible();
  await expect(page.getByText('June 12, 2025')).toBeVisible();
  const done = page.getByRole('region', {name: 'Participation'});
  for (const k of ['Ideas', 'Comments', 'Votes', 'Projects']) await expect(done.getByText(k, {exact: true})).toBeVisible();
  a11yReport(await axeOn(page, '.bo-page'));
  await page.getByRole('button', {name: 'Make platform admin'}).click();
  await expect(toast(page).first()).toContainText('Manager C is now a platform admin');
});

test('a row menu answers: admin rights toggle, add to group, block and delete ask first', async ({page}) => {
  await page.goto('/backoffice/#/users');
  const grid = page.getByRole('grid', {name: 'Registered users'});
  const options = (name: string) => grid.getByRole('button', {name: `Options for ${name}`});

  await options('Resident E').click();
  await page.getByRole('menuitem', {name: 'Make platform admin'}).click();
  await expect(toast(page).first()).toContainText('Resident E is now a platform admin');
  await expect(grid.getByRole('row', {name: /Resident E/})).toContainText('Platform admin');
  await options('Resident E').click();
  await page.getByRole('menuitem', {name: 'Remove platform admin rights'}).click();
  await expect(grid.getByRole('row', {name: /Resident E/})).toContainText('Registered user');

  await options('Resident G').click();
  await page.getByRole('menuitem', {name: 'Add to group'}).click();
  const add = page.getByRole('dialog', {name: 'Add to group'});
  await add.getByRole('button', {name: 'Add to group'}).click();
  await expect(toast(page).filter({hasText: '1 user added to Youth panel'})).toBeVisible();
  await expect(page.getByRole('listbox', {name: 'Groups'}).getByRole('option', {name: /^Youth panel/})).toContainText('4');

  await options('Resident H').click();
  await page.getByRole('menuitem', {name: 'Block user'}).click();
  const block = page.getByRole('alertdialog', {name: 'Block this user?'});
  await block.getByRole('button', {name: 'Cancel'}).click();
  await expect(grid.getByRole('row', {name: /Resident H/})).toBeVisible();
  await options('Resident H').click();
  await page.getByRole('menuitem', {name: 'Block user'}).click();
  await block.getByRole('button', {name: 'Block user'}).click();
  await expect(grid.getByRole('row', {name: /Resident H/})).toHaveCount(0);
  await page.getByRole('listbox', {name: 'Users'}).getByRole('option', {name: /^Banned emails/}).click();
  await expect(page.getByRole('grid', {name: 'Banned emails'}).getByRole('row', {name: /Resident H/})).toBeVisible();

  await page.getByRole('listbox', {name: 'Users'}).getByRole('option', {name: /^Registered users/}).click();
  await options('Resident K').click();
  await page.getByRole('menuitem', {name: 'Delete user'}).click();
  // An Alert dialog: focus starts on Cancel, no ×, Esc cancels and keeps the user.
  const remove = page.getByRole('alertdialog', {name: 'Delete this user?'});
  await expect(remove.getByRole('button', {name: 'Cancel'})).toBeFocused();
  await expect(remove.getByRole('button', {name: 'Close'})).toHaveCount(0);
  await page.keyboard.press('Escape');
  await expect(remove).toHaveCount(0);
  await expect(grid.getByRole('row', {name: /Resident K/})).toBeVisible();
  await options('Resident K').click();
  await page.getByRole('menuitem', {name: 'Delete user'}).click();
  await remove.getByRole('button', {name: 'Delete user'}).click();
  await expect(toast(page).filter({hasText: 'Resident K is deleted'})).toBeVisible();
  await expect(page.getByRole('grid', {name: 'Registered users'}).getByRole('row')).toHaveCount(11); // header + ten
});

test('the selection actions answer: Add to group adds the users, the exports start', async ({page}) => {
  await page.goto('/backoffice/#/users');
  await page.getByRole('button', {name: 'Export all'}).click();
  await expect(toast(page).first()).toContainText('12 users in users.xlsx');
  const grid = page.getByRole('grid', {name: 'Registered users'});
  for (const n of ['Resident G', 'Resident I']) await grid.getByRole('row', {name: new RegExp(n)}).locator('.gv-checkbox .indicator').click();
  await page.getByRole('button', {name: 'Export selected'}).click();
  await expect(page.getByRole('alertdialog', {name: 'Export started', description: '2 users in users.xlsx', exact: true})).toBeVisible();
  await page.getByRole('button', {name: 'Add to group'}).click();
  await page.getByRole('menuitem', {name: 'Youth panel'}).click();
  await expect(toast(page).filter({hasText: '2 users added to Youth panel'})).toBeVisible();
  await page.getByRole('listbox', {name: 'Groups'}).getByRole('option', {name: /^Youth panel/}).click();
  await expect(page.getByRole('grid', {name: 'Youth panel'}).getByRole('row')).toHaveCount(6); // header + five
});

test('the users pages keep their headings in order (h1 → h2 → h3)', async ({page}) => {
  for (const route of ['users', 'users/invitations', 'users/seats', 'users/u3']) {
    await page.goto(`/backoffice/#/${route}`);
    await expect(page.getByRole('heading', {level: 1})).toBeVisible();
    expect(await headingJumps(page), route).toEqual([]);
  }
  await page.goto('/backoffice/#/users/invitations');
  await page.getByRole('tab', {name: 'All invitations'}).click();
  await expect(page.getByRole('grid', {name: 'All invitations'})).toBeVisible();
  expect(await headingJumps(page)).toEqual([]);
});
