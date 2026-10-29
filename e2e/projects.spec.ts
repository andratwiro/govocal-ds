import {test, expect} from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';
import {settled, a11yReport} from './axe';

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
  // Every admin table pages (docs/DECISIONS.md): six of the eight projects on the first page.
  await expect(table.getByRole('row')).toHaveCount(7);
  await expect(page.getByRole('navigation', {name: 'Project pages'})).toBeVisible();
  await expect(page.getByText('8 projects', {exact: true})).toBeVisible();
  await expect(page.getByText('All projects have been loaded')).toHaveCount(0);
  // The list is a Panel (head, toolbar row, flush table, Pagination in the foot), as Users and Messaging are; the
  // count heads the Table toolbar, whose tools are the sort, Pending approval, the dates, the Filter menu and the search.
  const panel = page.getByRole('region', {name: 'All projects'});
  await expect(panel.getByRole('heading', {name: 'All projects'})).toBeVisible();
  const tools = panel.getByRole('toolbar', {name: 'Project tools'});
  await expect(panel.getByRole('heading', {name: '8 projects'})).toBeVisible();
  await expect(tools.getByRole('searchbox', {name: 'Search projects'})).toBeVisible();
  await expect(tools.getByRole('button', {name: /^Filter projects/})).toBeVisible();
  await expect(tools.locator('.react-aria-Select[data-variant="quiet"]')).toContainText('Sort:');
  await expect(panel.getByRole('navigation', {name: 'Project pages'})).toBeVisible();
});

// The head's action follows the tab, as in the real admin: New project, New folder, New space.
test('the page head offers the open tab\'s action', async ({page}) => {
  await page.goto('/backoffice/#/projects');
  const head = page.locator('.bo-page-header');
  await expect(head.getByRole('button', {name: 'New project'})).toBeVisible();
  await page.getByRole('tab', {name: 'Folders'}).click();
  await expect(head.getByRole('button', {name: 'New folder'})).toBeVisible();
  await expect(head.getByRole('button', {name: 'New project'})).toHaveCount(0);
  await page.getByRole('tab', {name: 'Spaces'}).click();
  await head.getByRole('button', {name: 'New space'}).click();
  const modal = page.getByRole('dialog', {name: 'New space'});
  await expect(modal.getByRole('button', {name: 'Create space'})).toBeDisabled();
  await modal.getByRole('textbox', {name: 'Space name'}).fill('Riverside');
  await modal.getByRole('button', {name: 'Create space'}).click();
  await expect(page.getByText('Space created')).toBeVisible();
  const spaces = page.getByRole('region', {name: 'Spaces'});
  await expect(spaces.getByRole('heading', {name: '4 spaces'})).toBeVisible();
  await expect(spaces.getByRole('grid', {name: 'Spaces'}).getByRole('row', {name: /Riverside/})).toContainText('0 projects');
  await spaces.getByRole('searchbox', {name: 'Search spaces'}).fill('river');
  await expect(spaces.getByRole('heading', {name: '1 space'})).toBeVisible();
});

test('Pagination moves through the projects; a search starts again from the first page', async ({page}) => {
  await page.goto('/backoffice/#/projects');
  const pager = page.getByRole('navigation', {name: 'Project pages'});
  await expect(pager.getByRole('button', {name: 'Page 1'})).toHaveAttribute('aria-current', 'page');
  await expect(pager.getByRole('button', {name: 'Previous page'})).toBeDisabled();
  await expect(bodyRows(page).first()).toContainText('Green Corridors for Larkvale');
  await pager.getByRole('button', {name: 'Next page'}).click();
  await expect(pager.getByRole('button', {name: 'Page 2'})).toHaveAttribute('aria-current', 'page');
  await expect(pager.getByRole('button', {name: 'Next page'})).toBeDisabled();
  await expect(bodyRows(page)).toHaveCount(2);
  await expect(bodyRows(page).first()).toContainText('Clean air week');
  await expect(page.getByRole('row', {name: /Green Corridors/})).toHaveCount(0);
  await pager.getByRole('button', {name: 'Page 1'}).click();
  await expect(bodyRows(page)).toHaveCount(6);
  await pager.getByRole('button', {name: 'Page 2'}).click();
  await page.getByRole('searchbox', {name: 'Search projects'}).fill('a');
  await expect(pager.getByRole('button', {name: 'Page 1'})).toHaveAttribute('aria-current', 'page');
});

test('a row has its actions menu', async ({page}) => {
  await page.goto('/backoffice/#/projects');
  await page.getByRole('button', {name: 'Actions for Harbour Plan 2030'}).click();
  await expect(page.getByRole('menuitem', {name: 'Duplicate'})).toBeVisible();
});

test('rows use the Data table cells, Status badge and icon button; New project opens its menu', async ({page}) => {
  await page.goto('/backoffice/#/projects');
  const row = page.getByRole('row', {name: /Green Corridors for Larkvale/});
  await expect(row.getByRole('link', {name: 'Green Corridors for Larkvale'}))
    .toHaveAttribute('href', '#/projects/green-corridors');
  // The project's tile (DataTableThumbnail) leads its name (DataTableStack); the manager is a DataTableAssignee.
  await expect(row.locator('.gv-data-table__person .gv-data-table__tile svg')).toBeVisible();
  await expect(row.locator('.gv-data-table__assignee')).toContainText('Manager A');
  await expect(row.locator('.gv-data-table__assignee .gv-avatar')).toHaveText('MA');
  await expect(row).toContainText('+1');
  await expect(row.locator('.gv-status')).toHaveText('Published');
  await expect(page.getByRole('row', {name: /Library opening hours/}).locator('.gv-data-table__sub'))
    .toContainText(['Neighbourhood services', '2 weeks left', 'Anyone']);
  await expect(page.getByRole('row', {name: /Harbour Plan 2030/}).locator('.gv-status')).toHaveText('Draft');
  await expect(page.getByRole('row', {name: /Harbour Plan 2030/}).locator('.gv-avatar[data-unassigned]')).toBeVisible();
  await expect(page.getByRole('row', {name: /Harbour Plan 2030/}).locator('.gv-data-table__assignee')).toHaveText('Not assigned');
  await expect(page.getByRole('button', {name: 'Actions for Harbour Plan 2030'})).toHaveClass(/gv-icon-button/);
  await expect(page.getByRole('tab', {name: 'Spaces', exact: true}).locator('.gv-pill')).toHaveText('New');
  await page.getByRole('button', {name: 'New project'}).click();
  await expect(page.getByRole('menuitem', {name: 'From scratch'})).toBeVisible();
  await expect(page.getByRole('menuitem', {name: 'Use a template'})).toBeVisible();
});

test('projects names what the system still lacks', async ({page}) => {
  await page.goto('/backoffice/#/projects');
  const gaps = await page.locator('[data-gap]').evaluateAll(els => [...new Set(els.map(e => e.getAttribute('data-gap')))]);
  // The project thumbnail is the Data table's DataTableThumbnail now.
  // Arrange projects reorders with buttons until the system has drag and drop.
  expect(gaps).toEqual([]);
  // Templates are Choice cards with their method's tile in the media slot: no "Template image" gap any more.
  await page.getByRole('tab', {name: 'Arrange projects'}).click();
  await expect(page.locator('[data-gap="Drag-and-drop reordering"]').first()).toBeVisible();
  // The Calendar lists the month's projects where the real admin draws a timeline; templates have no image yet.
  await page.getByRole('tab', {name: 'Calendar'}).click();
  await expect(page.locator('[data-gap="Project timeline"]')).toBeVisible();
  await page.getByRole('button', {name: 'New project'}).click();
  await page.getByRole('menuitem', {name: 'Use a template'}).click();
  const gallery = page.getByRole('dialog', {name: 'Start from a template'});
  await expect(gallery.locator('.gv-choice-card')).toHaveCount(9);
  await expect(gallery.locator('.gv-choice-card .gv-data-table__tile').first()).toBeVisible();
  await expect(page.locator('[data-gap="Template image"]')).toHaveCount(0);
});

// ── First clicks: the list's own controls (the overview and phase screens are their own specs) ──
const bodyRows = (page: import('@playwright/test').Page) =>
  page.getByRole('grid', {name: 'Projects'}).getByRole('rowgroup').nth(1).getByRole('row');
// Undo in the toast that says `title` (several toasts can be up at once).
const undo = (page: import('@playwright/test').Page, title: string) =>
  page.locator('.react-aria-Toast', {hasText: title}).getByRole('button', {name: 'Undo'}).click();
const axe = async (page: import('@playwright/test').Page, selector: string) => {
  // The Gap marker's own label is scaffolding of the demo, not the page: it is left out of the check.
  await settled(page);
  const {violations} = await new AxeBuilder({page}).include(selector).exclude('.bo-gap-label')
    .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa', 'wcag22aa']).analyze();
  a11yReport(violations.map(v => `${v.id}: ${v.nodes.map(n => n.target).join(', ')}`));
};

// The prototype's From scratch: a Space and a Folder, neither required; the project starts as an untitled draft.
test('New project → From scratch asks for a space and folder, then adds an untitled draft', async ({page}) => {
  await page.goto('/backoffice/#/projects');
  await page.getByRole('button', {name: 'New project'}).click();
  await page.getByRole('menuitem', {name: 'From scratch'}).click();
  const modal = page.getByRole('dialog', {name: 'New project'});
  await expect(modal.getByRole('button', {name: /Space/})).toBeVisible();
  // Select's pills (the "With search" and "With icons" stories): "✱ Space: No space ▾" and "Folder: No folder ▾".
  await expect(modal.locator('.react-aria-Select[data-variant="pill"]')).toHaveCount(2);
  await expect(modal.getByRole('button', {name: /Space/})).toContainText('Space:');
  await axe(page, '.gv-modal');
  await modal.getByRole('button', {name: /Folder/}).click();
  const search = page.getByRole('searchbox', {name: 'Search folders'});
  await expect(search).toBeFocused();
  await expect(page.getByRole('option')).toHaveCount(3);
  await search.fill('neigh');
  await expect(page.getByRole('option')).toHaveCount(1);
  await page.getByRole('option', {name: 'Neighbourhood services'}).click();
  await expect(modal.getByRole('button', {name: /Folder/})).toContainText('Neighbourhood services');
  await modal.getByRole('button', {name: 'Create project'}).click();
  await expect(modal).toHaveCount(0);
  const row = page.getByRole('row', {name: /Untitled project/});
  await expect(row.locator('.gv-status')).toHaveText('Draft');
  await expect(row).toContainText('Neighbourhood services');
  await expect(page.getByText('Project created')).toBeVisible();
  await expect(page.getByText('9 projects', {exact: true})).toBeVisible();
  await expect(bodyRows(page)).toHaveCount(6);
});

test('New project\'s Space pill searches its spaces from the keyboard: type, ↓, Enter chooses', async ({page}) => {
  await page.goto('/backoffice/#/projects');
  await page.getByRole('button', {name: 'New project'}).click();
  await page.getByRole('menuitem', {name: 'From scratch'}).click();
  const modal = page.getByRole('dialog', {name: 'New project'});
  const space = modal.getByRole('button', {name: /Space/});
  await space.focus();
  await page.keyboard.press('Enter');
  const search = page.getByRole('searchbox', {name: 'Search spaces'});
  await expect(search).toBeFocused();
  await expect(page.getByRole('option')).toHaveCount(4); // No space + three
  await page.keyboard.type('school');
  await expect(page.getByRole('option')).toHaveCount(1);
  await page.keyboard.press('ArrowDown');
  await page.keyboard.press('Enter');
  await expect(search).toHaveCount(0);
  await expect(space).toContainText('Schools and youth');
  await expect(space).toBeFocused();
  await space.click();
  await page.getByRole('searchbox', {name: 'Search spaces'}).fill('zzz');
  await expect(page.getByText('No results')).toBeVisible();
  await page.keyboard.press('Escape');
  await expect(space).toContainText('Schools and youth');
});

test('Use a template opens the gallery; Use template asks for a title, then adds the draft', async ({page}) => {
  await page.goto('/backoffice/#/projects');
  await page.getByRole('button', {name: 'New project'}).click();
  await page.getByRole('menuitem', {name: 'Use a template'}).click();
  const gallery = page.getByRole('dialog', {name: 'Start from a template'});
  await expect(gallery.getByText('9 templates available')).toBeVisible();
  await axe(page, '.gv-modal');
  await gallery.getByRole('searchbox', {name: 'Search the templates'}).fill('zzz');
  await expect(gallery.getByText('No templates match')).toBeVisible();
  await gallery.getByRole('searchbox', {name: 'Search the templates'}).fill('budget');
  await expect(gallery.getByText('1 templates available')).toBeVisible();
  // One pick (a Choice card in a radio group), then Use template in the foot.
  await expect(gallery.getByRole('button', {name: 'Use template'})).toBeDisabled();
  await gallery.getByRole('radio', {name: /Participatory budget/}).check({force: true});
  await gallery.getByRole('button', {name: 'Use template'}).click();
  const create = page.getByRole('dialog', {name: "Create a project based on the template 'Participatory budget'"});
  await create.getByRole('textbox', {name: 'The title of your project'}).fill('Budget for the parks');
  await create.getByRole('button', {name: 'Create project'}).click();
  await expect(page.getByRole('row', {name: /Budget for the parks/}).locator('.gv-status')).toHaveText('Draft');
});

// New folder sits on the Folders tab now (the head's action follows the tab, as in the real admin).
test('New folder opens a folder form; Create adds the folder to the Folders view', async ({page}) => {
  await page.goto('/backoffice/#/projects');
  await page.getByRole('tab', {name: 'Folders'}).click();
  await page.getByRole('button', {name: 'New folder'}).click();
  const modal = page.getByRole('dialog', {name: 'New folder'});
  await expect(modal.getByRole('button', {name: 'Create folder'})).toBeDisabled();
  await modal.getByRole('textbox', {name: 'Folder name'}).fill('Parks and play');
  await modal.getByRole('button', {name: 'Create folder'}).click();
  await expect(page.getByText('Folder created')).toBeVisible();
  await expect(page.getByRole('heading', {name: '3 folders'})).toBeVisible();
  await expect(page.getByRole('grid', {name: 'Folders'}).getByRole('row', {name: /Parks and play/})).toBeVisible();
});

test('a row click opens the project overview', async ({page}) => {
  await page.goto('/backoffice/#/projects');
  await page.getByRole('row', {name: /Harbour Plan 2030/}).getByText('Selected groups').click();
  await expect(page).toHaveURL(/#\/projects\/harbour-plan$/);
});

test('row actions duplicate, move to a folder and delete on the list', async ({page}) => {
  await page.goto('/backoffice/#/projects');
  await page.getByRole('button', {name: 'Actions for Harbour Plan 2030'}).click();
  await page.getByRole('menuitem', {name: 'Duplicate'}).click();
  await expect(page.getByRole('row', {name: /Copy of Harbour Plan 2030/})).toBeVisible();
  await expect(page.getByText('9 projects', {exact: true})).toBeVisible();
  await expect(page.getByText('Project duplicated')).toBeVisible();

  await page.getByRole('button', {name: 'Actions for Harbour Plan 2030', exact: true}).click();
  await page.getByRole('menuitem', {name: 'Move to folder'}).click();
  const move = page.getByRole('dialog', {name: 'Move to folder'});
  await move.getByRole('button', {name: /Folder/}).click();
  await page.getByRole('option', {name: 'Neighbourhood services'}).click();
  await move.getByRole('button', {name: 'Move', exact: true}).click();
  await expect(page.getByRole('row', {name: /^Harbour Plan 2030/})).toContainText('Neighbourhood services');
  // Instant changes offer Undo in their Toast.
  await undo(page, 'Moved to Neighbourhood services');
  await expect(page.getByRole('row', {name: /^Harbour Plan 2030/})).not.toContainText('Neighbourhood services');

  // Clean air week is on the second page now.
  await page.getByRole('navigation', {name: 'Project pages'}).getByRole('button', {name: 'Page 2'}).click();
  await page.getByRole('button', {name: 'Actions for Clean air week'}).click();
  await page.getByRole('menuitem', {name: 'Delete'}).click();
  const confirm = page.getByRole('alertdialog', {name: 'Delete this project?'});
  await expect(confirm.getByRole('button', {name: 'Cancel'})).toBeFocused();
  await confirm.getByRole('button', {name: 'Delete project'}).click();
  await expect(page.getByRole('row', {name: /Clean air week/})).toHaveCount(0);
  await expect(bodyRows(page)).toHaveCount(2);
  await expect(page.getByText('8 projects', {exact: true})).toBeVisible();
  await undo(page, 'Project deleted');
  await expect(page.getByRole('row', {name: /Clean air week/})).toBeVisible();
  await expect(page.getByText('9 projects', {exact: true})).toBeVisible();
});

test('search, sort and pending approval change the list', async ({page}) => {
  await page.goto('/backoffice/#/projects');
  await page.getByRole('searchbox', {name: 'Search projects'}).fill('harbour');
  await expect(bodyRows(page)).toHaveCount(1);
  await page.getByRole('searchbox', {name: 'Search projects'}).fill('');
  await page.getByRole('button', {name: /Sort/}).click();
  await page.getByRole('option', {name: 'Alphabetically (a-z)'}).click();
  await expect(bodyRows(page).first()).toContainText('Clean air week');
  await page.getByRole('button', {name: 'Pending approval'}).click();
  await expect(page.getByRole('button', {name: 'Pending approval'})).toHaveAttribute('aria-pressed', 'true');
  await expect(bodyRows(page)).toHaveCount(2);
});

test('Folders, Spaces, Calendar and Arrange projects tabs show their views', async ({page}) => {
  await page.goto('/backoffice/#/projects');
  await page.getByRole('tab', {name: 'Folders'}).click();
  const folders = page.getByRole('grid', {name: 'Folders'});
  await expect(folders.getByRole('row', {name: /Neighbourhood services/})).toContainText('2 projects');
  await page.getByRole('searchbox', {name: 'Search folders'}).fill('zzz');
  await expect(folders.getByText('No folders match.')).toBeVisible();
  await page.getByRole('tab', {name: 'Spaces'}).click();
  await expect(page.getByRole('grid', {name: 'Spaces'}).getByRole('row', {name: /City centre/})).toBeVisible();
  await page.getByRole('tab', {name: 'Calendar'}).click();
  // Each tab is a Panel; the Calendar's title is the month, its arrows in the head, the month's projects in a table.
  await expect(page.getByRole('heading', {name: 'October 2026'})).toBeVisible();
  await expect(page.getByRole('grid', {name: 'October 2026'}).getByRole('row').nth(1)).toContainText('Green Corridors for Larkvale');
  await page.getByRole('button', {name: 'Next month'}).click();
  await expect(page.getByRole('heading', {name: 'November 2026'})).toBeVisible();
  await axe(page, '.bo-page');
  // Before the first project starts, the month is an Empty state.
  for (let i = 0; i < 4; i++) await page.getByRole('button', {name: 'Previous month'}).click();
  await expect(page.getByText('No projects run in July 2026')).toBeVisible();
  await expect(page.getByRole('grid', {name: 'July 2026'})).toHaveCount(0);
  await page.getByRole('tab', {name: 'Arrange projects'}).click();
  await expect(page.getByRole('region', {name: 'Homepage order'})).toBeVisible();
  const order = page.getByRole('grid', {name: 'Project order'}).getByRole('rowgroup').nth(1).getByRole('row');
  await expect(order.first()).toContainText('Green Corridors for Larkvale');
  await page.getByRole('button', {name: 'Move Green Corridors for Larkvale down'}).click();
  await expect(order.first()).toContainText('Harbour Plan 2030');
  await expect(order.nth(1)).toContainText('Green Corridors for Larkvale');
});

test('the Dates range keeps the projects running in it', async ({page}) => {
  await page.goto('/backoffice/#/projects');
  await expect(bodyRows(page)).toHaveCount(6);
  const dates = page.getByRole('group', {name: 'Dates'});
  await dates.getByRole('spinbutton').first().click();
  await page.keyboard.type('01012027');
  await dates.getByRole('spinbutton').nth(3).click();
  await page.keyboard.type('01312027');
  // January 2027: the project running since August and the one starting on the 1st.
  await expect(bodyRows(page)).toHaveCount(2);
  await expect(bodyRows(page).first()).toContainText('Green Corridors for Larkvale');
});

// The Filter menu and Filter chips (src/patterns), as on the phase Manage tab: they replace the hand-built
// "Add filter" button and its removable Selects. A facet keeps any of its ticked values; facets add up.
test('the Filter menu adds a filter as a chip, which narrows the list and can be removed', async ({page}) => {
  await page.goto('/backoffice/#/projects');
  const filter = page.getByRole('button', {name: /^Filter projects/});
  const chips = page.getByRole('grid', {name: 'Active filters'});
  await expect(chips).toHaveCount(0);
  await filter.click();
  const menu = page.getByRole('menu', {name: 'Filter projects'});
  for (const f of ['Visibility', 'Folder', 'Manager']) await expect(menu.getByRole('menuitem', {name: new RegExp(`^${f}`)})).toBeVisible();
  await menu.getByRole('menuitem', {name: /^Visibility/}).hover();
  await page.getByRole('menuitemcheckbox', {name: /^Draft/}).click();
  await expect(page.getByRole('menuitemcheckbox', {name: /^Draft/})).toHaveAttribute('aria-checked', 'true');
  await expect(page.getByRole('menuitemcheckbox', {name: /^Published/})).toContainText('6 projects');
  await page.keyboard.press('Escape');
  await page.keyboard.press('Escape');
  await expect(filter).toHaveAccessibleName('Filter projects (1 on)');
  await expect(chips.getByRole('row')).toHaveCount(1);
  await expect(chips).toContainText('Visibility');
  await expect(chips).toContainText('Draft');
  for (const row of await bodyRows(page).all()) await expect(row.locator('.gv-status')).toHaveText('Draft');
  await expect(bodyRows(page)).toHaveCount(2);
  // A second facet adds up: drafts with no manager.
  await filter.click();
  await page.getByRole('menu', {name: 'Filter projects'}).getByRole('menuitem', {name: /^Manager/}).hover();
  await page.getByRole('menuitemcheckbox', {name: /^Not assigned/}).click();
  await page.keyboard.press('Escape');
  await page.keyboard.press('Escape');
  await expect(chips.getByRole('row')).toHaveCount(2);
  await chips.getByRole('button', {name: 'Remove the Visibility filter'}).click();
  await expect(chips.getByRole('row')).toHaveCount(1);
  await expect(bodyRows(page)).toHaveCount(2); // the two projects without a manager
  await page.getByRole('button', {name: 'Clear', exact: true}).click();
  await expect(chips).toHaveCount(0);
  await expect(page.getByText('8 projects', {exact: true})).toBeVisible();
});

// docs/DECISIONS.md: in a pick-several list Enter ticks and the list stays open; Esc closes.
test('the Filter menu ticks with Enter and stays open; Esc closes', async ({page}) => {
  await page.goto('/backoffice/#/projects');
  const filter = page.getByRole('button', {name: /^Filter projects/});
  await filter.focus();
  await page.keyboard.press('Enter');
  const menu = page.getByRole('menu', {name: 'Filter projects'});
  await expect(menu).toBeVisible();
  await menu.getByRole('menuitem', {name: /^Visibility/}).focus();
  await page.keyboard.press('ArrowRight');
  const draft = page.getByRole('menuitemcheckbox', {name: /^Draft/});
  await expect(page.getByRole('menuitemcheckbox', {name: /^Published/})).toBeFocused();
  await page.keyboard.press('ArrowDown');
  await expect(draft).toBeFocused();
  await page.keyboard.press('Enter');
  await expect(draft).toHaveAttribute('aria-checked', 'true');
  await expect(draft).toBeVisible();
  await page.keyboard.press('Escape');
  await page.keyboard.press('Escape');
  await expect(menu).toHaveCount(0);
  await expect(bodyRows(page)).toHaveCount(2);
});

test('From scratch keeps the chosen Space on the new draft', async ({page}) => {
  await page.goto('/backoffice/#/projects');
  await page.getByRole('button', {name: 'New project'}).click();
  await page.getByRole('menuitem', {name: 'From scratch'}).click();
  const modal = page.getByRole('dialog', {name: 'New project'});
  await modal.getByRole('button', {name: /Space/}).click();
  await page.getByRole('option', {name: 'Waterfront'}).click();
  await modal.getByRole('button', {name: 'Create project'}).click();
  await expect(page.getByText(/in the Waterfront space/)).toBeVisible();
  await page.getByRole('tab', {name: 'Spaces'}).click();
  const row = page.getByRole('grid', {name: 'Spaces'}).getByRole('row', {name: /Waterfront/});
  await expect(row).toContainText('2 projects');
  await expect(row).toContainText('Untitled project');
});
