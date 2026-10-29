import {test, expect, type Page} from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';
import {a11yReport} from './axe';

// Body rows only (the header row is not an input).
const inputRows = (page: Page) => page.getByRole('grid', {name: 'Inputs'}).getByRole('rowgroup').nth(1).getByRole('row');

test('input manager follows the real admin: filters, project list, selectable inputs', async ({page}) => {
  await page.goto('/backoffice/#/inputs');
  await expect(page.getByRole('heading', {level: 1, name: 'Input manager'})).toBeVisible();
  await expect(page.getByRole('switch', {name: /need feedback/})).toBeVisible();
  await expect(page.getByRole('searchbox', {name: 'Search inputs'})).toBeVisible();
  await expect(page.getByRole('listbox', {name: 'Projects'})).toBeVisible();
  const grid = page.getByRole('grid', {name: 'Inputs'});
  // Real admin columns, plus the prototype's Status column, in the gv DataTable.
  for (const c of ['Title', 'Status', 'Assignee', 'Comments', 'Likes', 'Dislikes', 'Published on']) {
    await expect(grid.getByRole('columnheader', {name: c, exact: true})).toBeVisible();
  }
  // The real admin assigns from each row: an "Unassigned ▾" dropdown per row (it was a read-only avatar before).
  await expect(grid.getByRole('button', {name: /Unassigned.*Assignee for More trees on Elm Lane/})).toBeVisible();
  // Today's inputs carry the prototype's new dot.
  await expect(grid.getByRole('img', {name: 'New input'}).first()).toBeVisible();
  await expect(grid.getByRole('img', {name: 'Content warning'})).toHaveCount(1);
  await expect(page.getByRole('switch', {name: /need feedback\s*8$/})).toBeVisible(); // count of inputs waiting, in a Badge
  // The starter's checkbox input is visually hidden under its cell: click what a person sees.
  await inputRows(page).first().locator('.indicator').click();
  await expect(inputRows(page).first().getByRole('checkbox')).toBeChecked();
  await expect(inputRows(page).first()).toHaveAttribute('aria-selected', 'true');
});

test('choosing a project narrows the inputs', async ({page}) => {
  await page.goto('/backoffice/#/inputs');
  await expect(page.getByText('12 inputs')).toBeVisible();
  await page.getByRole('listbox', {name: 'Projects'}).getByRole('option', {name: 'Harbour Plan 2030'}).click();
  await expect(inputRows(page)).toHaveCount(3); // the three Harbour Plan inputs
  for (const link of await inputRows(page).getByRole('link').all()) await expect(link).toHaveText('Harbour Plan 2030');
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
  // The gv DataTable marks the sorted column with aria-sort on its header and sorts from the header itself.
  await expect(grid.getByRole('columnheader', {name: 'Published on'})).toHaveAttribute('aria-sort', /ending/);
  await grid.getByRole('columnheader', {name: 'Likes', exact: true}).click();
  await expect(grid.getByRole('columnheader', {name: 'Likes', exact: true})).toHaveAttribute('aria-sort', 'descending');
  await expect(inputRows(page).first()).toContainText('Night buses on weekends'); // most likes (21)
});

test('input manager names what the system still lacks', async ({page}) => {
  await page.goto('/backoffice/#/inputs');
  const gaps = await page.locator('[data-gap]').evaluateAll(els => [...new Set(els.map(e => e.getAttribute('data-gap')))]);
  // Badge and Pagination now come from the system.
  expect(gaps).toEqual([]);
});

// ── First clicks ──
const allowedTags = ['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa', 'wcag22aa'];

const panelOf = (page: Page) => page.getByRole('dialog', {name: /^Input: /});

test('a row click opens the input in the Side panel: the input, its counts, properties, update and thread', async ({page}) => {
  await page.goto('/backoffice/#/inputs');
  await inputRows(page).filter({hasText: 'Bike lane by the school'}).getByText('Bike lane by the school').click();
  const panel = page.getByRole('dialog', {name: 'Input: Bike lane by the school'});
  await expect(panel.getByRole('heading', {name: 'Bike lane by the school'})).toBeVisible();
  await expect(panel.getByText('Posted by Resident B · Registered user')).toBeVisible();
  await expect(panel).toBeFocused(); // focus moves into the panel
  // The Comment thread's "In a side panel" body: counts and quick actions, properties, official update, comments.
  await expect(panel.getByRole('toolbar', {name: 'Quick actions'}).getByRole('button')).toHaveCount(3);
  await expect(panel.getByText('3 comments')).toBeAttached(); // Reaction counts, read with their word
  await expect(panel.locator('dl[aria-label="Input details"]')).toBeVisible(); // a dl: no list role
  await expect(panel.getByRole('textbox', {name: /official update/i}).first()).toBeVisible();
  await expect(panel.getByRole('tab', {name: /Comments \(3\)/})).toBeVisible();
  const {violations} = await new AxeBuilder({page}).include('.gv-side-panel').withTags(allowedTags).analyze();
  a11yReport(violations.map(v => `${v.id}: ${v.nodes.map(n => n.target).join(', ')}`));
  await panel.getByRole('button', {name: /Assignee/}).click();
  await page.getByRole('option', {name: 'Manager C'}).click();
  await expect(page.getByRole('button', {name: /Manager C.*Assignee for Bike lane by the school/})).toBeVisible();
  await panel.getByRole('button', {name: 'Close the input'}).click();
  await expect(panelOf(page)).toHaveCount(0);
});

test('a status change in the panel shows in the row at once, with an Undo toast (no Save)', async ({page}) => {
  await page.goto('/backoffice/#/inputs');
  const row = inputRows(page).filter({hasText: 'Bike lane by the school'});
  await row.getByText('Bike lane by the school').click();
  const panel = panelOf(page);
  await expect(panel.getByRole('button', {name: 'Save'})).toHaveCount(0);
  await panel.getByRole('button', {name: /Status/}).click();
  await page.getByRole('option', {name: 'Implemented'}).click();
  await expect(row.locator('.gv-status')).toHaveText('Implemented');
  await expect(page.getByText('Status changed to Implemented')).toBeVisible();
  await page.getByRole('button', {name: 'Undo'}).click();
  await expect(row.locator('.gv-status')).toHaveText('Under consideration');
});

test('the pager walks the filtered list, and Esc puts focus back on the row', async ({page}) => {
  await page.goto('/backoffice/#/inputs');
  await page.getByRole('listbox', {name: 'Projects'}).getByRole('option', {name: 'Harbour Plan 2030'}).click();
  await expect(inputRows(page)).toHaveCount(3);
  const first = inputRows(page).first();
  const firstTitle = (await first.locator('.gv-data-table__name').innerText()).trim();
  await first.locator('.gv-data-table__name').click();
  const panel = panelOf(page);
  const pager = panel.getByRole('toolbar', {name: 'Pager'});
  await expect(pager).toContainText('1 of 3'); // over the filtered list, not all 12
  await expect(pager.getByRole('button', {name: 'Previous input'})).toBeDisabled();
  await pager.getByRole('button', {name: 'Next input'}).click();
  await expect(pager).toContainText('2 of 3');
  const second = (await inputRows(page).nth(1).locator('.gv-data-table__name').innerText()).trim();
  await expect(panel.getByRole('heading', {level: 2})).toHaveText(second);
  await expect(panel.getByRole('heading', {level: 2})).not.toHaveText(firstTitle);
  // Esc closes the panel and puts focus back on the row of the input it showed.
  await panel.focus();
  await page.keyboard.press('Escape');
  await expect(panelOf(page)).toHaveCount(0);
  await expect(inputRows(page).nth(1)).toBeFocused();
});

test('the pager turns the table to the open input\'s page; Enter on the focused row opens it again', async ({page}) => {
  await page.goto('/backoffice/#/inputs');
  await inputRows(page).nth(9).locator('.gv-data-table__name').click();
  const pager = panelOf(page).getByRole('toolbar', {name: 'Pager'});
  await expect(pager).toContainText('10 of 12');
  await pager.getByRole('button', {name: 'Next input'}).click();
  await expect(pager).toContainText('11 of 12');
  await expect(page.getByRole('button', {name: 'Page 2'})).toHaveAttribute('aria-current', 'page');
  await page.keyboard.press('Escape');
  await expect(inputRows(page).first()).toBeFocused();
  await page.keyboard.press('Enter');
  await expect(panelOf(page).getByRole('toolbar', {name: 'Pager'})).toContainText('11 of 12');
});

test('Delete in the panel asks first, then removes the input', async ({page}) => {
  await page.goto('/backoffice/#/inputs');
  await inputRows(page).filter({hasText: 'Bike lane by the school'}).getByText('Bike lane by the school').click();
  await panelOf(page).getByRole('toolbar', {name: 'Quick actions'}).getByRole('button', {name: 'Delete'}).click();
  const confirm = page.getByRole('alertdialog', {name: 'Delete this input?'});
  await confirm.getByRole('button', {name: 'Delete input'}).click();
  await expect(page.getByText('11 inputs')).toBeVisible();
  await expect(panelOf(page)).toHaveCount(0);
});

test('the row assignee dropdown assigns the input', async ({page}) => {
  await page.goto('/backoffice/#/inputs');
  await page.getByRole('button', {name: /Assignee for More trees on Elm Lane/}).click();
  await page.getByRole('option', {name: 'Manager B'}).click();
  await expect(page.getByRole('button', {name: /Manager B.*Assignee for More trees on Elm Lane/})).toBeVisible();
});

test('checking rows shows a bulk bar: change status, assign, delete', async ({page}) => {
  await page.goto('/backoffice/#/inputs');
  await inputRows(page).nth(0).locator('.indicator').click();
  await inputRows(page).nth(1).locator('.indicator').click();
  const bar = page.getByRole('toolbar', {name: 'Bulk actions'});
  await expect(bar).toContainText('2 selected');
  await bar.getByRole('button', {name: 'Change status'}).click();
  await page.getByRole('menuitem', {name: 'Accepted'}).click();
  await expect(inputRows(page).nth(0).locator('.gv-status')).toHaveText('Accepted');
  await expect(inputRows(page).nth(1).locator('.gv-status')).toHaveText('Accepted');
  await bar.getByRole('button', {name: 'Assign', exact: true}).click();
  await page.getByRole('menuitem', {name: 'Manager C'}).click();
  await expect(page.getByRole('button', {name: /Manager C.*Assignee for More trees on Elm Lane/})).toBeVisible();
  // Delete asks first; Cancel keeps the inputs, Delete removes them.
  await bar.getByRole('button', {name: 'Delete', exact: true}).click();
  const confirm = page.getByRole('alertdialog', {name: 'Delete these inputs?'});
  await expect(confirm).toContainText('The 2 selected inputs');
  await confirm.getByRole('button', {name: 'Cancel'}).click();
  await expect(confirm).toHaveCount(0);
  await expect(bar).toContainText('2 selected'); // the Selection bar holds the count's place in the Table toolbar
  await expect(inputRows(page)).toHaveCount(10);
  await bar.getByRole('button', {name: 'Delete', exact: true}).click();
  await confirm.getByRole('button', {name: 'Delete 2 inputs'}).click();
  await expect(page.getByText('10 inputs')).toBeVisible();
  await expect(bar).toHaveCount(0);
});

test('the selection is cleared whenever the visible rows change: filter, tab, search, page', async ({page}) => {
  await page.goto('/backoffice/#/inputs');
  const bar = page.getByRole('toolbar', {name: 'Bulk actions'});
  const pick = async () => {
    await inputRows(page).first().locator('.indicator').click();
    await expect(bar).toContainText('1 selected');
  };
  await pick();
  await page.getByRole('listbox', {name: 'Projects'}).getByRole('option', {name: 'Harbour Plan 2030'}).click();
  await expect(bar).toHaveCount(0);
  await pick();
  await page.getByRole('tab', {name: 'Topics'}).click();
  await expect(bar).toHaveCount(0);
  await page.getByRole('tab', {name: 'Projects'}).click();
  await page.getByRole('listbox', {name: 'Projects'}).getByRole('option', {name: 'All projects'}).click();
  await pick();
  await page.getByRole('searchbox', {name: 'Search inputs'}).fill('bike');
  await expect(bar).toHaveCount(0);
  await page.getByRole('searchbox', {name: 'Search inputs'}).fill('');
  await pick();
  await page.getByRole('button', {name: 'Next page'}).click();
  await expect(bar).toHaveCount(0);
  await expect(inputRows(page).locator('[aria-selected="true"]')).toHaveCount(0);
});

test('the Side panel sits inline in a column beside the list, and the row checkboxes still work', async ({page}) => {
  await page.goto('/backoffice/#/inputs');
  await inputRows(page).filter({hasText: 'Bike lane by the school'}).getByText('Bike lane by the school').click();
  const side = page.locator('.gv-side-panel[data-inline]');
  await expect(side.getByRole('dialog', {name: 'Input: Bike lane by the school'})).toBeVisible();
  await expect(page.locator('[data-gap="Side panel"]')).toHaveCount(0);
  // Beside the table, not over it.
  const [list, box] = [await page.locator('.bo-inputs-list').boundingBox(), await side.boundingBox()];
  expect(box!.x).toBeGreaterThanOrEqual(list!.x + list!.width);
  // Bulk checkboxes and the panel live side by side: checking a row leaves the open input open.
  await inputRows(page).nth(0).locator('.indicator').click();
  await expect(page.getByRole('toolbar', {name: 'Bulk actions'})).toContainText('1 selected');
  await expect(side).toBeVisible();
});

test('the Topics tab filters by topic, and Edit projects leads to the projects', async ({page}) => {
  await page.goto('/backoffice/#/inputs');
  await expect(page.getByRole('link', {name: 'Edit projects'})).toHaveAttribute('href', '#/projects');
  await page.getByRole('tab', {name: 'Topics'}).click();
  await page.getByRole('listbox', {name: 'Topics'}).getByRole('option', {name: 'Mobility'}).click();
  await expect(page.getByText(/^\d+ inputs$/)).not.toHaveText('12 inputs');
  for (const row of await inputRows(page).all()) await expect(row).toContainText('Mobility');
});

test('the export menu sits in the Table toolbar beside the count, and each export shows a toast', async ({page}) => {
  await page.goto('/backoffice/#/inputs');
  const tools = page.getByRole('toolbar', {name: 'Input tools'});
  await expect(page.getByRole('heading', {name: '12 inputs'})).toBeVisible(); // the toolbar's count heading
  await tools.getByRole('button', {name: 'Export'}).click();
  await expect(page.getByRole('menuitem', {name: 'All comments (.xlsx)'})).toBeVisible();
  await expect(page.getByRole('menuitem', {name: 'Selected inputs (.xlsx)'})).toBeDisabled();
  await page.getByRole('menuitem', {name: 'All inputs (.xlsx)'}).click();
  await expect(page.getByText('Exporting all inputs')).toBeVisible();
  // Checked rows swap the count for the Selection bar; the export stays put.
  await inputRows(page).first().locator('.indicator').click();
  await expect(page.getByRole('heading', {name: '12 inputs'})).toHaveCount(0);
  await expect(tools.getByRole('button', {name: 'Export'})).toBeVisible();
});

test('the selectors: pills in the rows and the panel, avatars on the assignees, a quiet Assignee filter', async ({page}) => {
  await page.goto('/backoffice/#/inputs');
  await expect(page.locator('.bo-inputs-toolbar .react-aria-Select').first()).toHaveAttribute('data-variant', 'quiet');
  const rowPick = page.locator('.react-aria-Select').filter({has: page.getByRole('button', {name: /Assignee for More trees on Elm Lane/})});
  await expect(rowPick).toHaveAttribute('data-variant', 'pill');
  await expect(rowPick).toHaveAttribute('data-size', '22');
  await rowPick.getByRole('button').click();
  const list = page.getByRole('listbox');
  await expect(list.getByRole('option', {name: 'Unassigned'}).locator('.gv-avatar')).toHaveCount(1);
  await expect(list.getByRole('option', {name: 'Manager B'}).locator('.gv-avatar')).toHaveCount(1);
  await page.keyboard.press('Escape');
  await inputRows(page).filter({hasText: 'Bike lane by the school'}).getByText('Bike lane by the school').click();
  const panel = panelOf(page);
  for (const name of ['Status', 'Assignee']) {
    const pick = panel.locator('.react-aria-Select').filter({has: page.getByRole('button', {name: new RegExp(name)})});
    await expect(pick.first()).toHaveAttribute('data-variant', 'pill');
    await expect(pick.first()).toHaveAttribute('data-size', '22');
  }
});

test('the panel\'s tags: Enter ticks a tag and the list stays open; Esc or Done closes it, the panel stays', async ({page}) => {
  await page.goto('/backoffice/#/inputs');
  await inputRows(page).filter({hasText: 'Bike lane by the school'}).getByText('Bike lane by the school').click();
  const panel = panelOf(page);
  await expect(panel.getByRole('row', {name: 'Mobility'})).toBeVisible();
  const add = panel.getByRole('button', {name: 'Add tag'});
  await add.focus();
  await page.keyboard.press('Enter');
  const services = page.getByRole('menuitemcheckbox', {name: /^Services/});
  await expect(services).toBeVisible();
  await services.focus();
  await page.keyboard.press('Enter');
  await expect(services).toHaveAttribute('aria-checked', 'true');
  await expect(services).toBeVisible(); // the list stays open
  await expect(panel.getByRole('row', {name: 'Services'})).toBeVisible();
  await expect(page.getByText('Tags changed')).toBeVisible(); // applies at once, with Undo
  await page.keyboard.press('Escape');
  await expect(services).toHaveCount(0);
  await expect(add).toBeFocused();
  await expect(panel).toBeVisible();
  // Done closes it too.
  await page.keyboard.press('Enter');
  await page.getByRole('button', {name: 'Done', exact: true}).click();
  await expect(page.getByRole('menuitemcheckbox', {name: /^Services/})).toHaveCount(0);
  await expect(panel).toBeVisible();
  // The Topics tab now filters on the new tag.
  await page.getByRole('tab', {name: 'Topics'}).click();
  await page.getByRole('listbox', {name: 'Topics'}).getByRole('option', {name: 'Services'}).click();
  await expect(inputRows(page).filter({hasText: 'Bike lane by the school'})).toHaveCount(1);
});

test('pagination moves between pages', async ({page}) => {
  await page.goto('/backoffice/#/inputs');
  const pager = page.getByRole('navigation', {name: 'Input pages'});
  await expect(inputRows(page)).toHaveCount(10);
  await expect(pager.getByRole('button', {name: 'Page 1'})).toHaveAttribute('aria-current', 'page');
  await expect(pager.getByRole('button', {name: 'Previous page'})).toBeDisabled();
  await pager.getByRole('button', {name: 'Next page'}).click();
  await expect(inputRows(page)).toHaveCount(2);
  await expect(pager.getByRole('button', {name: 'Page 2'})).toHaveAttribute('aria-current', 'page');
  await expect(pager.getByRole('button', {name: 'Next page'})).toBeDisabled();
  await pager.getByRole('button', {name: 'Page 1'}).click();
  await expect(inputRows(page)).toHaveCount(10);
});
