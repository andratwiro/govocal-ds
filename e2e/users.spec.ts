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
  // One scrolling list, virtualised (the Data table's "Virtualized" story): the twelve and 5,000 invented people,
  // of whom the table draws only the rows in view, and tells assistive tech the whole count.
  await expect(grid).toHaveAttribute('aria-rowcount', '5013');
  await expect(grid.getByRole('row', {name: /Admin A/})).toBeVisible();
  expect(await grid.getByRole('row').count()).toBeLessThan(100);
});

// The list sits in a Panel (Panel's "With a toolbar" story): the title and description in the head, the toolbar row
// (the count, Export all, the search), the table flush; no pages, the table scrolls.
test('the list is a Panel: head, toolbar with the count and search, the table, no Pagination', async ({page}) => {
  await page.goto('/backoffice/#/users');
  const panel = page.getByRole('region', {name: 'Registered users'});
  await expect(panel).toHaveClass(/gv-panel/);
  await expect(panel.getByRole('heading', {level: 2, name: 'Registered users'})).toBeVisible();
  await expect(panel.locator('.gv-panel__description')).toContainText('Get an overview of all the people');
  const toolbar = panel.locator('.gv-panel__toolbar');
  await expect(toolbar.getByRole('heading', {level: 3, name: '5,012 users'})).toBeVisible();
  await expect(toolbar.getByRole('searchbox', {name: 'Search users'})).toBeVisible();
  await expect(toolbar.getByRole('button', {name: 'Export all'})).toBeVisible();
  await expect(panel.locator('.gv-panel__body').getByRole('grid', {name: 'Registered users'})).toBeVisible();
  await expect(panel.getByRole('navigation', {name: 'User pages'})).toHaveCount(0);
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

test('one list, no pages: scrolling draws later rows under the pinned header, the page stays put', async ({page}) => {
  await page.goto('/backoffice/#/users');
  const grid = page.getByRole('grid', {name: 'Registered users'});
  await expect(grid.getByRole('row', {name: /Admin A/})).toBeVisible();
  const before = await page.evaluate(() => window.scrollY);
  // The table takes its height from its box and scrolls inside it: most of the window, not 5,000 rows tall.
  const box = (await grid.boundingBox())!;
  expect(box.height).toBeLessThanOrEqual(page.viewportSize()!.height * 0.7 + 1);
  await grid.evaluate(g => { g.scrollTop = g.scrollHeight / 2; });
  await expect.poll(async () => Math.max(...await grid.locator('[role="row"][data-key]')
    .evaluateAll(rs => rs.map(r => Number(r.getAttribute('aria-rowindex')))))).toBeGreaterThan(2000);
  await expect(grid.getByRole('row', {name: /Admin A/})).toHaveCount(0);
  expect(await grid.getByRole('row').count()).toBeLessThan(100);
  const [head, rows] = [grid.locator('.gv-data-table__header'), grid];
  expect(Math.abs((await head.boundingBox())!.y - (await rows.boundingBox())!.y)).toBeLessThanOrEqual(2);
  expect(await page.evaluate(() => window.scrollY)).toBe(before);
  // The keyboard reaches the last row.
  await grid.evaluate(g => { g.scrollTop = 0; });
  await grid.getByRole('row', {name: /Admin A/}).focus();
  await page.keyboard.press('End');
  await expect(grid.locator('[role="row"][aria-rowindex="5013"]')).toBeInViewport();
});

test('the header select-all ticks every row in view: all of them, or all the search leaves', async ({page}) => {
  await page.goto('/backoffice/#/users');
  const grid = page.getByRole('grid', {name: 'Registered users'});
  await grid.getByRole('columnheader').getByRole('checkbox').click({force: true});
  await expect(page.getByText('5,012 selected')).toBeVisible();
  // A row drawn only now, far down the list, is ticked too.
  await grid.evaluate(g => { g.scrollTop = g.scrollHeight; });
  await expect(grid.locator('[role="row"][aria-rowindex="5013"]')).toHaveAttribute('aria-selected', 'true');
  await page.getByRole('button', {name: 'Export selected'}).click();
  await expect(toast(page).filter({hasText: '5,012 users in users.xlsx'})).toBeVisible();
  await page.getByRole('button', {name: 'Clear selection'}).click();
  // A search narrows what "all" means.
  await page.getByRole('searchbox', {name: 'Search users'}).fill('admin');
  // Not forced: the click waits until the page takes pointer events again (the export toast briefly holds them).
  await grid.getByRole('columnheader').locator('.gv-checkbox .indicator').click();
  await expect(page.getByText('2 selected')).toBeVisible();
});

test('the Panel counts the list; rows use the gv Avatar and icon button; a row has its options menu', async ({page}) => {
  await page.goto('/backoffice/#/users');
  await expect(page.getByRole('heading', {level: 3, name: '5,012 users'})).toBeVisible();
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
test('the header select-all picks every row and shows the selection actions', async ({page}) => {
  await page.goto('/backoffice/#/users');
  await expect(page.getByText('Select', {exact: true})).toHaveCount(0);
  const grid = page.getByRole('grid', {name: 'Registered users'});
  await grid.getByRole('columnheader').getByRole('checkbox').click({force: true});
  await expect(grid.getByRole('row').nth(1)).toHaveAttribute('aria-selected', 'true');
  await expect(page.getByText('5,012 selected')).toBeVisible();
  // The Selection bar takes the count's place in the toolbar.
  await expect(page.getByRole('heading', {name: '5,012 users'})).toHaveCount(0);
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
  // An empty list is the Empty state, not an empty table (docs/DECISIONS.md).
  const banned = page.getByRole('region', {name: 'Banned emails'});
  await expect(banned.locator('.gv-empty-state').getByRole('heading', {name: 'No banned emails'})).toBeVisible();
  await expect(banned.getByRole('grid')).toHaveCount(0);
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
  // The kinds are Choice cards in a RadioGroup (CardRadio is deprecated for Choice card).
  const kinds = modal.getByRole('radiogroup', {name: 'Kind of group'});
  await expect(kinds.locator('.gv-choice-card')).toHaveCount(2);
  await expect(kinds.getByRole('radio', {name: /Create a normal group/})).toBeVisible();
  await expect(kinds.getByRole('radio', {name: /Create a smart group/})).toBeVisible();
  await expect(modal.getByRole('button', {name: 'Save group'})).toBeDisabled();
  a11yReport(await axeOn(page, '.gv-modal'));
  await kinds.getByText('Create a smart group').click();
  await expect(kinds.getByRole('radio', {name: /Create a smart group/})).toBeChecked();
  await modal.getByRole('textbox', {name: 'Name of the group, English'}).fill('Cyclists');
  // The rules open under the smart card once it is chosen (Choice card's `revealed`), still a Gap.
  await expect(kinds.locator('.gv-choice-card__revealed').getByRole('button', {name: /Rule/})).toBeVisible();
  await modal.getByRole('button', {name: 'Save group'}).click();
  await expect(modal).toHaveCount(0);
  await expect(page).toHaveURL(/#\/users\/groups\/[\w-]+$/);
  await expect(page.getByRole('listbox', {name: 'Groups'}).getByRole('option', {name: /^Cyclists/})).toHaveAttribute('aria-selected', 'true');
  // A new smart group: the Banner says why its list fills itself, and the Empty state says nobody is in it yet.
  const cyclists = page.getByRole('region', {name: 'Cyclists'});
  await expect(cyclists.locator('.gv-banner')).toContainText('smart group');
  await expect(cyclists.getByRole('heading', {name: 'Nobody meets the rules yet'})).toBeVisible();
  await expect(toast(page).first()).toContainText('Group created');
});

test('a group has its own page: its members, Edit Group to rename it, Delete Group with a confirmation', async ({page}) => {
  await page.goto('/backoffice/#/users');
  await page.getByRole('listbox', {name: 'Groups'}).getByRole('option', {name: /^Youth panel/}).click();
  await expect(page).toHaveURL(/#\/users\/groups\/youth$/);
  await expect(page.getByRole('grid', {name: 'Youth panel'}).getByRole('row')).toHaveCount(4);
  await page.getByRole('button', {name: 'Edit Group'}).click();
  const modal = page.getByRole('dialog', {name: 'Edit Group'});
  await modal.getByRole('textbox', {name: 'Name of the group, English'}).fill('Youth council');
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
  // Manager C sits below the table's fold: find them first, as an admin would in a list of 5,000.
  await page.getByRole('searchbox', {name: 'Search users'}).fill('Manager C');
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
  // Resident H blocked, Resident K deleted: 5,010 people and the header.
  await expect(page.getByRole('grid', {name: 'Registered users'})).toHaveAttribute('aria-rowcount', '5011');
});

test('the selection actions answer: Add to group adds the users, the exports start', async ({page}) => {
  await page.goto('/backoffice/#/users');
  await page.getByRole('button', {name: 'Export all'}).click();
  await expect(toast(page).first()).toContainText('5,012 users in users.xlsx');
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

// ── The redesign on the current components ──────────────────────────────────

test('row menus carry their icons in the icon slot, with the removing items apart', async ({page}) => {
  await page.goto('/backoffice/#/users');
  await page.getByRole('button', {name: 'Options for Resident E'}).click();
  const menu = page.getByRole('menu');
  for (const m of ['Make platform admin', 'Add to group', 'Block user', 'Delete user']) {
    await expect(menu.getByRole('menuitem', {name: m}).locator('.gv-menu-icon svg')).toHaveCount(1);
  }
  await expect(menu.getByRole('separator')).toHaveCount(1);
  // Only a manual group's own list takes someone out of it.
  await expect(menu.getByRole('menuitem', {name: 'Remove from group'})).toHaveCount(0);
});

test('instant changes carry Undo: admin rights, add to group', async ({page}) => {
  await page.goto('/backoffice/#/users');
  const grid = page.getByRole('grid', {name: 'Registered users'});
  await grid.getByRole('button', {name: 'Options for Resident E'}).click();
  await page.getByRole('menuitem', {name: 'Make platform admin'}).click();
  await expect(grid.getByRole('row', {name: /Resident E/})).toContainText('Platform admin');
  await toast(page).filter({hasText: 'Resident E is now a platform admin'}).getByRole('button', {name: 'Undo'}).click();
  await expect(grid.getByRole('row', {name: /Resident E/})).toContainText('Registered user');

  await grid.getByRole('row', {name: /Resident G/}).locator('.gv-checkbox .indicator').click();
  await page.getByRole('button', {name: 'Add to group'}).click();
  await page.getByRole('menuitem', {name: 'Youth panel'}).click();
  const groups = page.getByRole('listbox', {name: 'Groups'});
  await expect(groups.getByRole('option', {name: /^Youth panel/})).toContainText('4');
  await toast(page).filter({hasText: '1 user added to Youth panel'}).getByRole('button', {name: 'Undo'}).click();
  await expect(groups.getByRole('option', {name: /^Youth panel/})).toContainText('3');
});

test('a manual group takes users out from the row or the Selection bar, with Undo; empty, it says so', async ({page}) => {
  await page.goto('/backoffice/#/users/groups/youth');
  const grid = page.getByRole('grid', {name: 'Youth panel'});
  await expect(page.getByRole('region', {name: 'Youth panel'}).locator('.gv-banner')).toHaveCount(0);
  await grid.getByRole('button', {name: 'Options for Resident E'}).click();
  await page.getByRole('menuitem', {name: 'Remove from group'}).click();
  await expect(grid.getByRole('row')).toHaveCount(3);
  await toast(page).filter({hasText: '1 user removed from Youth panel'}).getByRole('button', {name: 'Undo'}).click();
  await expect(grid.getByRole('row')).toHaveCount(4);
  // Not forced: the click waits until the page takes pointer events again (a toast's exit briefly holds them).
  await grid.getByRole('columnheader').locator('.gv-checkbox .indicator').click();
  await expect(page.getByText('3 selected')).toBeVisible();
  await page.getByRole('button', {name: 'Remove from group'}).click();
  const region = page.getByRole('region', {name: 'Youth panel'});
  await expect(region.getByRole('heading', {name: 'No members yet'})).toBeVisible();
  // A search that finds nobody says so too.
  await page.goto('/backoffice/#/users');
  await page.getByRole('searchbox', {name: 'Search users'}).fill('nobody-here');
  await expect(page.getByRole('heading', {name: 'No users match'})).toBeVisible();
});

test('a blocked user is unblocked from their row under Banned emails, with Undo', async ({page}) => {
  await page.goto('/backoffice/#/users');
  const grid = page.getByRole('grid', {name: 'Registered users'});
  await grid.getByRole('button', {name: 'Options for Resident H'}).click();
  await page.getByRole('menuitem', {name: 'Block user'}).click();
  await page.getByRole('alertdialog', {name: 'Block this user?'}).getByRole('button', {name: 'Block user'}).click();
  await page.getByRole('listbox', {name: 'Users'}).getByRole('option', {name: /^Banned emails/}).click();
  const banned = page.getByRole('grid', {name: 'Banned emails'});
  await banned.getByRole('button', {name: 'Options for Resident H'}).click();
  await expect(page.getByRole('menuitem', {name: 'Block user', exact: true})).toHaveCount(0);
  await page.getByRole('menuitem', {name: 'Unblock user'}).click();
  await expect(page.getByRole('heading', {name: 'No banned emails'})).toBeVisible();
  await toast(page).filter({hasText: 'Resident H is unblocked'}).getByRole('button', {name: 'Undo'}).click();
  await expect(banned.getByRole('row', {name: /Resident H/})).toBeVisible();
});

test('invitations: the form is a Panel with Send in its foot; an invitation is a Badge, deleted with Undo', async ({page}) => {
  await page.goto('/backoffice/#/users/invitations');
  const form = page.getByRole('region', {name: 'Invite by email'});
  await expect(form.locator('.gv-panel__foot').getByRole('button', {name: 'Send invites'})).toBeDisabled();
  await form.getByRole('button', {name: /Role/}).click();
  await expect(page.getByRole('option', {name: /Platform admin/})).toContainText('Takes an admin seat');
  await page.keyboard.press('Escape');
  await expect(page.getByRole('tab', {name: 'All invitations (3)'})).toBeVisible();
  await page.getByRole('tab', {name: /All invitations/}).click();
  const grid = page.getByRole('grid', {name: 'All invitations'});
  await expect(grid.getByRole('row', {name: /invitee2/}).locator('.gv-pill')).toHaveText('Pending');
  await grid.getByRole('button', {name: 'Options for invitee2@example.org'}).click();
  await expect(page.getByRole('menuitem', {name: 'Resend invitation'})).toBeVisible();
  await page.getByRole('menuitem', {name: 'Delete invitation'}).click();
  await expect(grid.getByRole('row', {name: /invitee2/})).toHaveCount(0);
  await toast(page).filter({hasText: 'Invitation deleted'}).getByRole('button', {name: 'Undo'}).click();
  await expect(grid.getByRole('row').nth(2)).toContainText('invitee2@example.org');
  await page.getByRole('searchbox', {name: 'Search invitations'}).fill('zzz');
  await expect(page.getByRole('heading', {name: 'No invitations match'})).toBeVisible();
});

test('seats: Stat tiles with a trend and a help icon; a profile is a Property list with its groups', async ({page}) => {
  await page.goto('/backoffice/#/users/seats');
  const used = page.locator('.gv-kpi', {hasText: 'Admin seats used'});
  await expect(used.locator('.gv-kpi__trend')).toContainText('+1');
  await expect(used.locator('.gv-kpi__trend')).toContainText('since last month');
  await expect(page.locator('.gv-kpi__info')).toHaveCount(4);

  await page.goto('/backoffice/#/users/u8');
  const profile = page.getByRole('region', {name: 'Profile'});
  const facts = profile.locator('.gv-property-list');
  for (const k of ['Email', 'Role', 'Joined', 'Last active', 'Groups']) await expect(facts.getByText(k, {exact: true})).toBeVisible();
  await expect(facts.locator('.gv-pill')).toHaveText(['Verified residents', 'Youth panel']);
  await page.getByRole('button', {name: 'Make platform admin'}).click();
  await expect(facts).toContainText('Platform admin');
  await toast(page).filter({hasText: 'is now a platform admin'}).getByRole('button', {name: 'Undo'}).click();
  await expect(facts).toContainText('Registered user');
  await expect(page.getByRole('button', {name: 'Make platform admin'})).toBeVisible();

  await page.goto('/backoffice/#/users/nobody');
  await expect(page.getByRole('heading', {level: 2, name: 'This user is not on the platform'})).toBeVisible();
});
