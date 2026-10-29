import {test, expect, type Page} from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

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
  await expect(page.getByRole('switch', {name: /need feedback\s*8$/})).toBeVisible(); // count of inputs waiting, in a Pill
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
  // Pill now comes from the system; pagination is still missing (its pages work with plain buttons).
  expect(gaps).toEqual(['Pagination']);
});

// ── First clicks ──
const allowedTags = ['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa', 'wcag22aa'];

test('a row click opens the input preview; its status select updates the row', async ({page}) => {
  await page.goto('/backoffice/#/inputs');
  await inputRows(page).filter({hasText: 'Bike lane by the school'}).getByText('Bike lane by the school').click();
  const panel = page.getByRole('complementary', {name: 'Input preview'});
  await expect(panel.getByRole('heading', {name: 'Bike lane by the school'})).toBeVisible();
  await expect(panel.getByText('Resident B · Registered user')).toBeVisible();
  await expect(panel.locator('.bo-inputs-preview-body')).not.toBeEmpty();
  const {violations} = await new AxeBuilder({page}).include('.bo-inputs-preview').withTags(allowedTags).analyze();
  expect(violations.map(v => `${v.id}: ${v.nodes.map(n => n.target).join(', ')}`)).toEqual([]);
  await panel.getByRole('button', {name: /Status/}).click();
  await page.getByRole('option', {name: 'Implemented'}).click();
  await expect(inputRows(page).filter({hasText: 'Bike lane by the school'}).locator('.gv-status')).toHaveText('Implemented');
  await panel.getByRole('button', {name: /Assignee/}).click();
  await page.getByRole('option', {name: 'Manager C'}).click();
  await expect(page.getByRole('button', {name: /Manager C.*Assignee for Bike lane by the school/})).toBeVisible();
  await panel.getByRole('textbox', {name: 'Feedback'}).fill('Thanks, we are looking into it.');
  await panel.getByRole('button', {name: 'Post feedback'}).click();
  await expect(panel.getByRole('list', {name: 'Posted feedback'})).toContainText('Thanks, we are looking into it.');
  await panel.getByRole('button', {name: 'Close the preview'}).click();
  await expect(panel).toHaveCount(0);
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
  const confirm = page.getByRole('dialog', {name: 'Delete these inputs?'});
  await expect(confirm).toContainText('The 2 selected inputs');
  await confirm.getByRole('button', {name: 'Cancel'}).click();
  await expect(confirm).toHaveCount(0);
  await expect(page.getByText('12 inputs')).toBeVisible();
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

test('the input preview is a column beside the list, marked as a missing side panel', async ({page}) => {
  await page.goto('/backoffice/#/inputs');
  await inputRows(page).filter({hasText: 'Bike lane by the school'}).getByText('Bike lane by the school').click();
  const gap = page.locator('[data-gap="Side panel"]');
  await expect(gap.getByRole('complementary', {name: 'Input preview'})).toBeVisible();
  // Beside the table, not over it.
  const [list, side] = [await page.locator('.bo-inputs-list').boundingBox(), await gap.boundingBox()];
  expect(side!.x).toBeGreaterThanOrEqual(list!.x + list!.width);
});

test('the Topics tab filters by topic, and Edit projects leads to the projects', async ({page}) => {
  await page.goto('/backoffice/#/inputs');
  await expect(page.getByRole('link', {name: 'Edit projects'})).toHaveAttribute('href', '#/projects');
  await page.getByRole('tab', {name: 'Topics'}).click();
  await page.getByRole('listbox', {name: 'Topics'}).getByRole('option', {name: 'Mobility'}).click();
  await expect(page.getByText(/^\d+ inputs$/)).not.toHaveText('12 inputs');
  for (const row of await inputRows(page).all()) await expect(row).toContainText('Mobility');
});

test('Exports opens its menu and each export shows a toast', async ({page}) => {
  await page.goto('/backoffice/#/inputs');
  await page.getByRole('button', {name: 'Exports'}).click();
  await expect(page.getByRole('menuitem', {name: 'Export all comments (.xlsx)'})).toBeVisible();
  await expect(page.getByRole('menuitem', {name: 'Export selected'})).toBeDisabled();
  await page.getByRole('menuitem', {name: 'Export all inputs (.xlsx)'}).click();
  await expect(page.getByText('Exporting all inputs')).toBeVisible();
});

test('pagination moves between pages', async ({page}) => {
  await page.goto('/backoffice/#/inputs');
  await expect(inputRows(page)).toHaveCount(10);
  await expect(page.getByText('Page 1 of 2')).toBeVisible();
  await page.getByRole('button', {name: 'Next page'}).click();
  await expect(inputRows(page)).toHaveCount(2);
  await expect(page.getByRole('button', {name: 'Page 2'})).toHaveAttribute('aria-current', 'page');
  await page.getByRole('button', {name: 'Page 1'}).click();
  await expect(inputRows(page)).toHaveCount(10);
});
