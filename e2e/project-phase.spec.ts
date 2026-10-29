import {test, expect, type Page} from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';
import {IDEAS} from '../backoffice/src/data-project';
import {a11yReport} from './axe';

// The phase screen's Manage tab (#/projects/:id/phases/:phase/manage), after the prototype's Manage tab one week after
// publishing: the metrics, then the ideas under a toolbar (count or selection bar, search, filter) and filter chips.
const URL = '/backoffice/#/projects/green-corridors/phases/p2/manage';
const ideas = (n: number) => `${n} ${n === 1 ? 'idea' : 'ideas'}`;
const table = (page: Page) => page.getByRole('grid', {name: 'Ideas'});
const rows = (page: Page) => table(page).getByRole('row').filter({has: page.getByRole('rowheader')});
// The table shows 20 ideas a page (the Pagination in the Panel's foot); the count heading says how many match.
const PAGE = 20;
const onPage = (n: number) => Math.min(n, PAGE);
const count = (page: Page, n: number) => page.getByRole('heading', {level: 3, name: ideas(n)});
const filterButton = (page: Page) => page.getByRole('button', {name: /^Filter ideas/});
const chips = (page: Page) => page.getByRole('grid', {name: 'Active filters'});

async function tick(page: Page, facet: string, value: string) {
  await page.getByRole('menuitem', {name: new RegExp(`^${facet}`)}).hover();
  await page.getByRole('menuitemcheckbox', {name: new RegExp(`^${value}`)}).click();
}

test('the Manage tab lists the phase\'s ideas with its metrics', async ({page}) => {
  await page.goto(URL);
  await expect(page.getByRole('radiogroup', {name: 'Phase view'}).getByRole('radio', {name: 'Manage'})).toBeChecked();
  await expect(count(page, IDEAS.length)).toBeVisible();
  await expect(rows(page)).toHaveCount(onPage(IDEAS.length));
  const overview = page.getByRole('complementary', {name: 'Ideas overview'});
  for (const m of ['Waiting for a reply', 'Unassigned', 'New ideas', 'New comments', 'Content warnings'])
    await expect(overview.getByText(m, {exact: true})).toBeVisible();
  await expect(overview.getByRole('link', {name: /Content warnings/})).toContainText(String(IDEAS.filter(i => i.warning).length));
  // No filters yet: no chips, no dot.
  await expect(chips(page)).toHaveCount(0);
  await expect(filterButton(page)).toHaveAccessibleName('Filter ideas');
});

test('the filter menu narrows the table, and its chips follow', async ({page}) => {
  await page.goto(URL);
  await filterButton(page).click();
  const menu = page.getByRole('menu', {name: 'Filter ideas'});
  for (const f of ['Source', 'Status', 'Assignee', 'Tags', 'Reply']) await expect(menu.getByRole('menuitem', {name: new RegExp(`^${f}`)})).toBeVisible();
  await expect(menu.getByRole('menuitem', {name: 'Clear all filters'})).toHaveCount(0);

  await tick(page, 'Assignee', 'Manager A');
  const a = IDEAS.filter(i => i.assignee === 'Manager A');
  await expect(rows(page)).toHaveCount(onPage(a.length));
  // The Tags submenu searches: "Filter..." narrows the list, counts read "n ideas".
  await page.getByRole('menuitem', {name: /^Tags/}).hover();
  const search = page.getByRole('searchbox', {name: 'Filter tags'});
  await expect(search).toHaveAttribute('placeholder', 'Filter...');
  await search.fill('cyc');
  await expect(page.getByRole('menu', {name: 'Tags'}).getByRole('menuitemcheckbox')).toHaveCount(1);
  const cycling = page.getByRole('menuitemcheckbox', {name: /^Cycling/});
  await expect(cycling).toContainText(ideas(IDEAS.filter(i => i.tags.includes('Cycling')).length));
  await cycling.click();
  await expect(cycling).toHaveAttribute('aria-checked', 'true');
  const both = a.filter(i => i.tags.includes('Cycling'));
  await expect(rows(page)).toHaveCount(onPage(both.length));
  await expect(count(page, both.length)).toBeVisible();
  await expect(menu.getByRole('menuitem', {name: /^Assignee/})).toContainText('1');
  await expect(menu.getByRole('menuitem', {name: 'Clear all filters'})).toBeVisible();

  // Escape leaves the ticks alone and closes the menus.
  await page.keyboard.press('Escape');
  await page.keyboard.press('Escape');
  await page.keyboard.press('Escape');
  await expect(menu).toHaveCount(0);
  await expect(filterButton(page)).toHaveAccessibleName('Filter ideas (2 on)');
  await expect(chips(page).getByRole('row', {name: 'Assignee is Manager A'})).toBeVisible();
  await expect(chips(page).getByRole('row', {name: 'Tags is Cycling'})).toBeVisible();

  // Removing a chip unticks the menu.
  await chips(page).getByRole('button', {name: 'Remove the Tags filter'}).click();
  await expect(rows(page)).toHaveCount(onPage(a.length));
  await filterButton(page).click();
  await expect(menu.getByRole('menuitem', {name: /^Tags/})).not.toContainText('1');
  await page.getByRole('menuitem', {name: /^Tags/}).hover();
  await expect(page.getByRole('menuitemcheckbox', {name: /^Cycling/})).toHaveAttribute('aria-checked', 'false');

  // Two values in one facet: "is any of"; Clear all filters empties both views.
  await tick(page, 'Status', 'Proposed');
  await tick(page, 'Status', 'Viewed');
  await expect(rows(page)).toHaveCount(onPage(a.filter(i => ['Proposed', 'Viewed'].includes(i.status)).length));
  await expect(chips(page).getByRole('row', {name: 'Status is any of Proposed, Viewed'})).toBeVisible();
  await menu.getByRole('menuitem', {name: 'Clear all filters'}).click();
  await expect(chips(page)).toHaveCount(0);
  await expect(rows(page)).toHaveCount(onPage(IDEAS.length));
});

test('the metrics are filters too: Unassigned shows its chip', async ({page}) => {
  await page.goto(URL);
  await page.getByRole('link', {name: /^Unassigned/}).click();
  await expect(chips(page).getByRole('row', {name: 'Assignee is Unassigned'})).toBeVisible();
  await expect(rows(page)).toHaveCount(onPage(IDEAS.filter(i => i.assignee === 'Unassigned').length));
  await page.getByRole('button', {name: 'Clear', exact: true}).click();
  await expect(rows(page)).toHaveCount(onPage(IDEAS.length));
});

test('search narrows the ideas', async ({page}) => {
  await page.goto(URL);
  await page.getByRole('button', {name: 'Search ideas'}).click();
  await page.getByRole('searchbox', {name: 'Search ideas'}).fill('repair café');
  await expect(rows(page)).toHaveCount(onPage(IDEAS.filter(i => i.text.toLowerCase().includes('repair café')).length));
});

test('selecting ideas swaps the count for the selection bar', async ({page}) => {
  await page.goto(URL);
  const first = rows(page).first();
  await first.getByRole('checkbox').check({force: true});
  const bar = page.getByRole('toolbar', {name: 'Selection actions'});
  await expect(bar).toContainText('1 selected');
  for (const a of ['Status', 'Assign', 'Tags', 'Copy to phase', 'Official update'])
    await expect(bar.getByRole('button', {name: a, exact: true})).toBeVisible();
  await expect(count(page, IDEAS.length)).toHaveCount(0);

  // Status applies to the selected ideas at once.
  await bar.getByRole('button', {name: 'Status', exact: true}).click();
  await page.getByRole('menuitemradio', {name: 'Implemented', exact: true}).click();
  await expect(first).toContainText('Implemented');

  // Official update opens its composer (Bulk official update: no Cancel, Esc or × closes it).
  await bar.getByRole('button', {name: 'Official update'}).click();
  const dialog = page.getByRole('dialog', {name: 'Official update'});
  await expect(dialog.getByRole('textbox', {name: 'Official update'})).toBeVisible();
  await page.keyboard.press('Escape');
  await expect(dialog).toHaveCount(0);

  await bar.getByRole('button', {name: 'Clear selection'}).click();
  await expect(bar).toHaveCount(0);
  await expect(count(page, IDEAS.length)).toBeVisible();
});

test('the Manage tab passes axe (WCAG 2.2 AA), filters on and a row selected', async ({page}) => {
  await page.goto(URL);
  await filterButton(page).click();
  await tick(page, 'Tags', 'Cycling');
  await page.keyboard.press('Escape');
  await page.keyboard.press('Escape');
  await page.keyboard.press('Escape');
  await rows(page).first().getByRole('checkbox').check({force: true});
  a11yReport(await violations(page, '.gv-panel'));
});

async function violations(page: Page, within: string) {
  const {violations} = await new AxeBuilder({page}).include(within)
    .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa', 'wcag22aa']).analyze();
  return violations.map(v => `${v.id}: ${v.nodes.map(n => n.target.join(' ')).join(', ')}`);
}

test('Build: the checklist and phase cards open', async ({page}) => {
  await page.goto('/backoffice/#/projects/green-corridors/phases/p2/build');
  const setup = page.getByRole('region', {name: 'Setup'});
  await setup.getByRole('button', {name: 'Edit project page'}).click();
  await expect(page.getByRole('dialog', {name: 'Project settings'}).getByRole('option', {name: 'Project page'})).toHaveAttribute('aria-selected', 'true');
  await page.keyboard.press('Escape');
  // Idea form folds out to its questions (the Form field summary recipe); Edit form opens the form.
  await setup.getByRole('button', {name: /Idea form/}).click();
  await expect(setup.getByRole('list', {name: 'Idea form questions'}).getByRole('listitem')).toHaveCount(6);
  await setup.getByRole('button', {name: 'Edit form'}).click();
  await expect(page.getByRole('dialog', {name: 'Idea form'})).toBeVisible();
});

test('Build: the phase status is a compact Banner, neutral before and after, success while live', async ({page}) => {
  const strip = (page: Page) => page.getByRole('region', {name: 'Setup'}).locator('.gv-banner--compact');
  for (const [phase, tone, text] of [
    ['p2', 'neutral', 'EndedClosed on 21 Sep'],
    ['p4', 'success', 'LiveEnds on 16 Nov'],
    ['p5', 'neutral', 'Not startedStarts on 17 Nov']
  ] as const) {
    await page.goto(`/backoffice/#/projects/green-corridors/phases/${phase}/build`);
    await expect(strip(page)).toHaveAttribute('role', 'status');
    await expect(strip(page)).toHaveAttribute('data-tone', tone);
    await expect(strip(page)).toHaveText(text);
  }
});

// Grouped tabs (Tabs' "Vertical with group headings"): a list box of tabs under group headings, each panel a group
// named by its tab; arrows walk the tabs across groups.
test('Project settings: a fixed-height Modal with a grouped side list of tabs', async ({page}) => {
  await page.goto('/backoffice/#/projects/green-corridors/phases/p2/build');
  await page.getByRole('region', {name: 'Setup'}).getByRole('button', {name: 'Project settings'}).click();
  const dialog = page.getByRole('dialog', {name: 'Project settings'});
  await expect(dialog).toHaveAttribute('data-height', 'fixed');
  const tabs = dialog.getByRole('listbox', {name: 'Project settings'});
  await expect(tabs.getByRole('option')).toHaveCount(8);
  // The side list sits beside the panel, not above it.
  const list = await tabs.boundingBox();
  const panel = await dialog.getByRole('group', {name: 'General'}).boundingBox();
  expect(panel!.x).toBeGreaterThanOrEqual(list!.x + list!.width - 1);
  await tabs.getByRole('option', {name: 'Access rights'}).click();
  await expect(dialog.getByRole('group', {name: 'Access rights'})).toBeVisible();
  // Arrow down from the last tab of a group moves into the next group.
  await page.keyboard.press('ArrowDown');
  await expect(tabs.getByRole('option', {name: 'Audience'})).toHaveAttribute('aria-selected', 'true');
  await dialog.getByRole('button', {name: 'Save'}).click();
  await expect(dialog).toHaveCount(0);
});

// ── The Manage tab's side panel (Side panel's "Default" story, the body of Comment thread's "In a side panel") ──
const panel = (page: Page) => page.getByRole('dialog', {name: 'Collect ideas'});
// The panel floats over the table's end: press a row near its start, as a manager would.
const pressRow = (page: Page, n: number) => rows(page).nth(n).getByRole('rowheader').click({position: {x: 24, y: 8}});
const openRow = async (page: Page, n: number) => {
  await pressRow(page, n);
  await expect(panel(page)).toBeVisible();
};

test('a row opens its idea in the side panel; the pager walks the list; Esc puts focus back on the row', async ({page}) => {
  await page.goto(URL);
  await openRow(page, 2);
  await expect(panel(page)).toContainText(IDEAS[2].text);
  await expect(panel(page)).toContainText(`3 of ${IDEAS.length}`);
  await expect(panel(page).locator('dl[aria-label="Idea details"]')).toBeVisible();
  await expect(panel(page).getByRole('toolbar', {name: 'Quick actions'})).toBeVisible();
  await expect(panel(page).getByRole('textbox', {name: 'Official update'})).toBeVisible();
  await expect(panel(page).getByRole('tab', {name: /^Comments/})).toBeVisible();
  // The list behind stays usable and unselected: no Save, no modal.
  await expect(rows(page).nth(2)).toHaveAttribute('aria-selected', 'false');

  await panel(page).getByRole('button', {name: 'Next idea'}).click();
  await expect(panel(page)).toContainText(`4 of ${IDEAS.length}`);
  await expect(panel(page)).toContainText(IDEAS[3].text);
  await page.keyboard.press('Escape');
  await expect(panel(page)).toHaveCount(0);
  await expect(rows(page).nth(3)).toBeFocused();

  // × closes it too, and focus goes back to the row that opened it.
  await openRow(page, 5);
  await panel(page).getByRole('button', {name: 'Close'}).click();
  await expect(panel(page)).toHaveCount(0);
  await expect(rows(page).nth(5)).toBeFocused();
});

test('the pager counts the filtered list', async ({page}) => {
  await page.goto(URL);
  await page.getByRole('link', {name: /^Unassigned/}).click();
  const unassigned = IDEAS.filter(i => i.assignee === 'Unassigned');
  await openRow(page, 0);
  await expect(panel(page)).toContainText(`1 of ${unassigned.length}`);
  await expect(panel(page).getByRole('button', {name: 'Previous idea'})).toBeDisabled();
});

test('a status change in the panel shows in its row at once, with an Undo toast', async ({page}) => {
  await page.goto(URL);
  const idea = IDEAS[2];
  const next = idea.status === 'Implemented' ? 'Accepted' : 'Implemented';
  await openRow(page, 2);
  await panel(page).getByRole('button', {name: /Status/}).click();
  await page.getByRole('option', {name: next, exact: true}).click();
  await expect(rows(page).nth(2)).toContainText(next);
  const toast = page.getByRole('alertdialog').or(page.locator('.react-aria-Toast')).filter({hasText: `Status changed to ${next}`});
  await expect(toast).toBeVisible();
  await toast.getByRole('button', {name: 'Undo'}).click();
  await expect(rows(page).nth(2)).toContainText(idea.status);
});

test('a screening phase: a waiting idea opens on Approve / Reject', async ({page}) => {
  await page.goto(URL);
  const waiting = IDEAS.map((i, n) => [i, n] as const).filter(([i]) => i.screening);
  expect(waiting.length).toBeGreaterThanOrEqual(2);
  const [[, first], [, second]] = waiting;
  await expect(rows(page).nth(first)).toContainText('Waiting for approval');

  await openRow(page, first);
  const decision = panel(page).getByRole('toolbar', {name: 'Waiting for approval'});
  await decision.getByRole('button', {name: 'Approve'}).click();
  await expect(decision).toHaveCount(0);
  await expect(rows(page).nth(first)).toContainText('Proposed');
  await expect(page.getByText('Idea approved and published')).toBeVisible();

  // The decision took its buttons away; focus stayed in the panel, so Esc still closes it.
  await page.keyboard.press('Escape');
  await expect(panel(page)).toHaveCount(0);
  await pressRow(page, second);
  await panel(page).getByRole('toolbar', {name: 'Waiting for approval'}).getByRole('button', {name: 'Reject'}).click();
  await expect(rows(page).nth(second)).toContainText('Rejected');
  await expect(page.getByText('Idea rejected')).toBeVisible();
});

test('a phase that does not screen has no ideas waiting', async ({page}) => {
  await page.goto('/backoffice/#/projects/harbour-plan/phases/p1/manage');
  await expect(page.getByText('Waiting for approval')).toHaveCount(0);
});

test('bulk selection still works beside the panel; the Selection bar\'s Official update opens its dialog', async ({page}) => {
  await page.goto(URL);
  await openRow(page, 0);
  await page.keyboard.press('Escape');
  for (const n of [0, 1]) await rows(page).nth(n).getByRole('checkbox').check({force: true});
  const bar = page.getByRole('toolbar', {name: 'Selection actions'});
  await expect(bar).toContainText('2 selected');
  await bar.getByRole('button', {name: 'Official update'}).click();
  const dialog = page.getByRole('dialog', {name: 'Official update'});
  await expect(dialog).toContainText('This update goes to 2 ideas');
  const send = dialog.getByRole('button', {name: 'Send'});
  await expect(send).toBeDisabled();
  await dialog.getByRole('textbox', {name: 'Official update'}).fill('The team has read every idea on this street.');
  await send.click();
  await expect(dialog).toHaveCount(0);
  await expect(page.getByText('Official update sent to 2 ideas')).toBeVisible();
});

test('the side panel passes axe (WCAG 2.2 AA), reported', async ({page}) => {
  await page.goto(URL);
  await openRow(page, 2);
  a11yReport(await violations(page, '.gv-side-panel'));
});

test('Build: the Dates card holds a Date range field; Events has one with times', async ({page}) => {
  await page.goto('/backoffice/#/projects/green-corridors/phases/p2/build');
  const setup = page.getByRole('region', {name: 'Setup'});
  await setup.getByRole('button', {name: /^Dates/}).click();
  await expect(setup.getByRole('group', {name: 'Start date'})).toBeVisible();
  await expect(setup.getByRole('button', {name: 'Add end date'})).toBeVisible();

  await setup.getByRole('button', {name: 'Project settings'}).click();
  const dialog = page.getByRole('dialog', {name: 'Project settings'});
  await dialog.getByRole('option', {name: 'Events'}).click();
  const events = dialog.getByRole('group', {name: 'Events'});
  await expect(events.getByRole('group', {name: 'Event dates, start date'})).toBeVisible();
  // The time fields come with a date: type a start date and its time field appears.
  await events.getByRole('group', {name: 'Event dates, start date'}).getByRole('spinbutton').first().click();
  await page.keyboard.type('11022026');
  await expect(events.getByRole('group', {name: 'Event dates, start time'})).toBeVisible();
});

test('Build: the Attachments card opens its dialog: a drop zone, the files, Done', async ({page}) => {
  await page.goto('/backoffice/#/projects/green-corridors/phases/p2/build');
  const setup = page.getByRole('region', {name: 'Setup'});
  await expect(setup.locator('[data-gv="setup-card"]', {hasText: /^Attachments/})).toContainText('2 files');
  await setup.getByRole('button', {name: 'Add an attachment'}).click();
  const dialog = page.getByRole('dialog', {name: 'Attachments'});
  await expect(dialog.getByRole('button', {name: 'Drop a file here or browse'})).toBeVisible();
  const files = dialog.getByRole('grid', {name: 'Attachments'}).getByRole('row');
  await expect(files).toHaveCount(2);
  await dialog.locator('input[type="file"]').setInputFiles({name: 'walk-route.pdf', mimeType: 'application/pdf', buffer: Buffer.alloc(2048)});
  await expect(files).toHaveCount(3);
  await expect(files.last()).toContainText('walk-route.pdf');
  await files.first().getByRole('link', {name: 'Delete'}).click();
  await expect(files).toHaveCount(2);
  await dialog.getByRole('button', {name: 'Done'}).click();
  await expect(dialog).toHaveCount(0);
  await expect(setup.locator('[data-gv="setup-card"]', {hasText: /^Attachments/})).toContainText('2 files');
});

// ── The table in its Panel (Data table's "In a panel" story) and the batch pickers ──
test('the table pages by 20, and the panel\'s pager turns the page', async ({page}) => {
  await page.goto(URL);
  const pages = page.getByRole('navigation', {name: 'Idea pages'});
  await pages.getByRole('button', {name: 'Page 2'}).click();
  await expect(rows(page).first()).toContainText(IDEAS[PAGE].text.slice(0, 12));
  await pages.getByRole('button', {name: 'Page 1'}).click();
  await openRow(page, PAGE - 1);
  await expect(panel(page)).toContainText(`${PAGE} of ${IDEAS.length}`);
  await panel(page).getByRole('button', {name: 'Next idea'}).click();
  await expect(panel(page)).toContainText(`${PAGE + 1} of ${IDEAS.length}`);
  await expect(pages.getByRole('button', {name: 'Page 2'})).toHaveAttribute('aria-current', 'page');
  await page.keyboard.press('Escape');
  await expect(rows(page).first()).toBeFocused();
});

test('a quick view from the stats is a key-only chip; its × turns it off', async ({page}) => {
  await page.goto(URL);
  await page.getByRole('link', {name: /^New ideas/}).click();
  await expect(chips(page).getByRole('row', {name: 'New ideas'})).toBeVisible();
  await expect(count(page, IDEAS.filter(i => i.isNew).length)).toBeVisible();
  await chips(page).getByRole('button', {name: 'Remove the New ideas filter'}).click();
  await expect(chips(page)).toHaveCount(0);
  await expect(count(page, IDEAS.length)).toBeVisible();
});

test('batch Assign: a Menu with avatars', async ({page}) => {
  await page.goto(URL);
  await rows(page).first().getByRole('checkbox').check({force: true});
  await page.getByRole('toolbar', {name: 'Selection actions'}).getByRole('button', {name: 'Assign', exact: true}).click();
  const item = page.getByRole('menuitem', {name: 'Manager C'});
  await expect(item.locator('.gv-avatar')).toHaveText('C');
  await item.click();
  await expect(rows(page).first()).toContainText('Manager C');
});

test('batch Tags: a searchable Option list; Enter ticks and the list stays open, Esc closes', async ({page}) => {
  await page.goto(URL);
  const first = IDEAS[0];
  const tag = ['Housing', 'Culture'].find(t => !first.tags.includes(t))!;
  await rows(page).first().getByRole('checkbox').check({force: true});
  await page.getByRole('toolbar', {name: 'Selection actions'}).getByRole('button', {name: 'Tags', exact: true}).click();
  const search = page.getByRole('searchbox', {name: 'Filter tags'});
  await expect(search).toBeFocused();
  await search.fill(tag.slice(0, 3));
  await page.keyboard.press('ArrowDown');
  await page.keyboard.press('Enter');
  const option = page.getByRole('menuitemcheckbox', {name: new RegExp(`^${tag}`)});
  await expect(option).toHaveAttribute('aria-checked', 'true');
  await expect(search).toBeVisible();
  await expect(rows(page).first()).toContainText(tag);
  // Esc empties the search first, then closes.
  await page.keyboard.press('Escape');
  await expect(search).toHaveValue('');
  await page.keyboard.press('Escape');
  await expect(search).toHaveCount(0);
});

test('batch Copy to phase: tick several phases, the menu stays open; Add phase follows a divider', async ({page}) => {
  await page.goto(URL);
  await rows(page).first().getByRole('checkbox').check({force: true});
  await page.getByRole('toolbar', {name: 'Selection actions'}).getByRole('button', {name: 'Copy to phase'}).click();
  const menu = page.getByRole('menu', {name: 'Copy to phase'});
  await page.keyboard.press('ArrowDown');
  const vote = menu.getByRole('menuitemcheckbox', {name: 'Community vote'});
  await vote.focus();
  await page.keyboard.press('Enter');
  await expect(vote).toHaveAttribute('aria-checked', 'true');
  await expect(menu).toBeVisible();
  await expect(page.getByText('1 idea copied to Community vote.')).toBeVisible();
  await expect(menu.getByRole('separator')).toHaveCount(1);
  await menu.getByRole('menuitem', {name: 'Add phase'}).click();
  await expect(page.getByRole('dialog', {name: 'Add a phase'})).toBeVisible();
});

test('the Filter menu: Enter ticks an option and the submenu stays open; Esc closes', async ({page}) => {
  await page.goto(URL);
  await filterButton(page).click();
  const source = page.getByRole('menuitem', {name: /^Source/});
  await source.focus();
  await page.keyboard.press('Enter');
  const online = page.getByRole('menuitemcheckbox', {name: /^Online/});
  await expect(online).toBeFocused();
  await page.keyboard.press('Enter');
  await expect(online).toHaveAttribute('aria-checked', 'true');
  await expect(online).toBeVisible();
  await page.keyboard.press('Escape');
  await expect(online).toHaveCount(0);
  await expect(chips(page).getByRole('row', {name: 'Source is Online'})).toBeVisible();
});

test('Project settings: General has the project URL with its prefix', async ({page}) => {
  await page.goto('/backoffice/#/projects/green-corridors/phases/p2/build');
  await page.getByRole('region', {name: 'Setup'}).getByRole('button', {name: 'Project settings'}).click();
  const dialog = page.getByRole('dialog', {name: 'Project settings'});
  await expect(dialog.getByRole('textbox', {name: 'Project URL'})).toHaveValue('green-corridors');
  await expect(dialog.getByText('internal.govocal.com/en/projects/')).toBeVisible();
});

// ── Build's phone, the empty tabs, the other methods' Manage and the Insights dashboards (redesign on the current
// components). The Build setup is a Panel now, so it is found as a region named "Setup" (it was a complementary).
test('Build: the stage shows the phase on the Phone preview; the setup is a Panel with its sections', async ({page}) => {
  await page.goto('/backoffice/#/projects/green-corridors/phases/p4/build');
  const phone = page.getByRole('region', {name: 'Preview'}).getByLabel('What residents see of Community vote');
  await expect(phone.getByRole('heading', {name: 'Green Corridors for Larkvale'})).toBeVisible();
  await expect(phone.getByRole('button', {name: 'Vote'})).toBeVisible();
  const setup = page.getByRole('region', {name: 'Setup'});
  await expect(setup.getByRole('heading', {level: 2, name: 'Setup'})).toBeVisible();
  for (const h of ['Before you publish', 'Voting setup']) await expect(setup.getByRole('heading', {level: 3, name: h})).toBeVisible();
  await expect(setup).toContainText('0 of 6 ready');
});

test('a phase that has not started: Manage and Insights show the Empty state', async ({page}) => {
  await page.goto('/backoffice/#/projects/green-corridors/phases/p5/manage');
  await expect(page.getByRole('heading', {name: 'Responses will appear here'})).toBeVisible();
  await expect(page.getByText('No responses yet')).toBeVisible();
  await page.getByRole('radio', {name: 'Insights'}).click();
  await expect(page.getByRole('heading', {name: 'Insights will appear here'})).toBeVisible();
  await expect(page.getByText('No insights yet')).toBeVisible();
  // A draft ideation phase too: no empty table, the Empty state.
  await page.goto('/backoffice/#/projects/harbour-plan/phases/p1/manage');
  await expect(page.getByRole('heading', {name: 'Ideas will appear here'})).toBeVisible();
  await expect(page.getByRole('grid', {name: 'Ideas'})).toHaveCount(0);
});

test('Manage for proposals lists the Proposals rows; an information phase has nothing to manage', async ({page}) => {
  await page.goto('/backoffice/#/projects/green-corridors/phases/p3/manage');
  const list = page.getByRole('list', {name: 'Proposals'});
  await expect(list.getByRole('listitem')).toHaveCount(5);
  await expect(list.getByRole('listitem').first()).toContainText('Car-free Sundays on Brindle Street');
  await page.goto('/backoffice/#/projects/green-corridors/phases/p1/manage');
  await expect(page.getByRole('heading', {name: 'Nothing to manage here'})).toBeVisible();
});

test('Insights for ideas: the stat tiles, the dashboard cards and the recommended actions', async ({page}) => {
  await page.goto('/backoffice/#/projects/green-corridors/phases/p2/insights');
  const dash = page.getByRole('region', {name: 'Insights'});
  await expect(dash.locator('.gv-kpi__label')).toHaveText(['Visitors', 'Phase participants', 'Ideas', 'Comments', 'Reactions', 'Participation rate']);
  await expect(dash.getByText(String(IDEAS.length), {exact: true}).first()).toBeVisible();
  for (const h of ['Participation over time', 'What are people saying?', 'Topic breakdown', 'Status breakdown', 'Most liked', 'Demographics and audience'])
    await expect(dash.getByRole('heading', {name: h})).toBeVisible();
  const actions = page.getByRole('region', {name: 'Recommended actions'});
  await expect(actions.getByRole('list', {name: 'Recommended actions'}).getByRole('listitem')).toHaveCount(3);
  await actions.getByRole('link', {name: 'Add a report'}).click();
  await expect(page).toHaveURL(/#\/reporting$/);
});

test('Insights for a vote: tiles with notes, the live ranking, who is voting, the AI banner', async ({page}) => {
  await page.goto('/backoffice/#/projects/green-corridors/phases/p4/insights');
  const dash = page.getByRole('region', {name: 'Insights'});
  await expect(dash.getByText('updating live').first()).toBeVisible();
  await expect(dash.getByRole('heading', {name: 'Live ranking'})).toBeVisible();
  await expect(dash.getByText('Rain gardens along Brindle Street')).toBeVisible();
  await expect(dash.getByText('Age group')).toBeVisible();
  await dash.getByRole('radio', {name: 'Weekly'}).click();
  await expect(dash.getByRole('radio', {name: 'Weekly'})).toBeChecked();
  await expect(dash.getByRole('note')).toContainText('Explore AI-powered summaries');
});

test('the Insights tab passes axe (WCAG 2.2 AA), reported', async ({page}) => {
  await page.goto('/backoffice/#/projects/green-corridors/phases/p2/insights');
  await expect(page.getByRole('heading', {name: 'Status breakdown'})).toBeVisible();
  a11yReport(await violations(page, '.bo-phase-insights'));
});

// ── Build's cards on the system's Build-tab patterns, the header's Save, the rail's delete ──
const BUILD = '/backoffice/#/projects/green-corridors/phases/p2/build';
const setup = (page: Page) => page.getByRole('region', {name: 'Setup'});

test('Build: Participant actions, each opening its Access rights modal; the row says when it is set for this phase', async ({page}) => {
  await page.goto(BUILD);
  const card = setup(page).locator('[data-gv="setup-card"]', {hasText: /^Participant actions/});
  await expect(card).toContainText('Submit +2');
  await card.getByRole('button', {name: /Participant actions/}).click();
  const actions = card.getByRole('group', {name: 'Participant actions'});
  await expect(actions.getByRole('switch', {name: 'Disliking'})).toBeVisible();
  await expect(actions.getByRole('img', {name: 'Always on'})).toBeVisible();
  // Reacting carries its limit while it is on.
  await expect(actions.getByRole('radiogroup', {name: 'Number of likes per participant'})).toBeVisible();
  await actions.getByRole('switch', {name: 'Commenting on inputs'}).click({force: true});
  await expect(card).toContainText('Submit +1');
  await expect(page.getByRole('button', {name: 'Save'})).toBeEnabled();

  await actions.getByRole('button', {name: 'Edit access for Submitting inputs'}).click();
  const modal = page.getByRole('dialog', {name: 'Who can submit inputs?'});
  await expect(modal).toBeVisible();
  await page.keyboard.press('Escape');
  await expect(modal).toHaveCount(0);
});

test('Build: Available views and Notifications; an email opens in the setup\'s place, the email on the phone', async ({page}) => {
  await page.goto(BUILD);
  const views = setup(page).locator('[data-gv="setup-card"]', {hasText: /^Available views/});
  await views.getByRole('button', {name: /Available views/}).click();
  await views.getByRole('switch', {name: 'Map view'}).click({force: true});
  await expect(views).toContainText('Map view');

  const card = setup(page).locator('[data-gv="setup-card"]', {hasText: /^Notifications/});
  await expect(card).toContainText('6 emails on');
  await card.getByRole('button', {name: /Notifications/}).click();
  const emails = card.getByRole('group', {name: 'Emails'});
  await emails.getByRole('switch', {name: 'Deletion of my comment'}).click({force: true});
  await expect(card).toContainText('7 emails on');
  await emails.getByRole('button', {name: 'Edit A reply on my comment'}).click();
  const email = setup(page).getByRole('region', {name: 'A reply on my comment'});
  await expect(email.getByRole('switch', {name: 'Send this email'})).toBeChecked();
  await expect(email.getByRole('textbox', {name: 'Subject'})).toHaveValue('A reply on my comment');
  await expect(page.getByRole('region', {name: 'Preview'}).getByRole('group', {name: 'The email: A reply on my comment'})).toBeVisible();
  await email.getByRole('button', {name: 'Back to Ideation setup'}).click();
  await expect(setup(page).getByRole('heading', {name: 'Before you publish'})).toBeVisible();
});

test('Build: the header\'s Save turns on with a change and off once saved', async ({page}) => {
  await page.goto(BUILD);
  const save = page.getByRole('button', {name: 'Save'});
  await expect(save).toBeDisabled();
  await setup(page).getByRole('textbox', {name: 'Phase description'}).fill('Where should the corridor go?');
  await expect(save).toBeEnabled();
  await save.click();
  await expect(page.getByText('Changes saved')).toBeVisible();
  await expect(save).toBeDisabled();
});

test('Build of a volunteering phase: the Causes card; a cause deletes with an Undo toast', async ({page}) => {
  await page.goto('/backoffice/#/projects/green-corridors/phases/p7/build');
  const card = setup(page).locator('[data-gv="setup-card"]', {hasText: /^Causes/});
  await expect(card).toContainText('3 causes');
  await expect(card.getByRole('button', {name: 'Download volunteers'})).toBeDisabled();
  await card.getByRole('button', {name: 'Delete Plant the first corridor'}).click();
  await expect(card).toContainText('2 causes');
  await page.getByRole('button', {name: 'Undo'}).click();
  await expect(card).toContainText('3 causes');
});

test('the rail deletes any phase but the one on screen', async ({page}) => {
  await page.goto(BUILD);
  const rail = page.getByRole('navigation', {name: 'Phases'});
  await expect(rail.getByRole('button', {name: 'Delete Collect ideas'})).toHaveCount(0);
  await rail.getByRole('link', {name: /Recruit volunteers/}).hover();
  await rail.getByRole('button', {name: 'Delete Recruit volunteers'}).click();
  await expect(rail.getByRole('link')).toHaveCount(6);
  await expect(page.getByText('Recruit volunteers deleted')).toBeVisible();
});

// The Map view's "In the Manage tab" story. Nothing leaves the machine (as e2e/map.spec.ts): the tile style is answered
// with a tiny local one, anything else off the local server is refused. The pins, card and list need no tiles.
const MAP_STYLE = {version: 8, sources: {credits: {type: 'geojson', data: {type: 'FeatureCollection', features: []},
  attribution: '&copy; OpenStreetMap'}}, layers: [{id: 'ground', type: 'background', paint: {'background-color': '#eef0ec'}}]};

test('Map: a List / Map switch; the map beside a one-column list, one open idea, a hovered row marks its pin', async ({page, baseURL}) => {
  const local = new globalThis.URL(baseURL!).host;
  const offsite: string[] = [];
  await page.context().route(url => url.host !== local, route => {
    const url = route.request().url();
    offsite.push(url);
    return url.startsWith('https://tiles.openfreemap.org/styles/')
      ? route.fulfill({contentType: 'application/json', body: JSON.stringify(MAP_STYLE)})
      : route.abort();
  });
  await page.goto(URL);
  await expect(page.getByRole('radio', {name: 'List'})).toBeChecked();
  await page.getByRole('radio', {name: 'Map'}).click();
  await expect(page.getByRole('radio', {name: 'Map'})).toBeChecked();
  const map = page.locator('.gv-map');
  await expect(map).toHaveAttribute('data-status', 'ready');
  // No pages in Map: the list beside the map holds every idea, in one column.
  await expect(page.getByRole('navigation', {name: 'Idea pages'})).toHaveCount(0);
  await expect(table(page).getByRole('columnheader')).toHaveCount(1);
  await expect(rows(page)).toHaveCount(IDEAS.length);
  // The chip counts the ideas the map can't show.
  const unplaced = IDEAS.filter(i => !i.place).length;
  expect(unplaced).toBeGreaterThan(0);
  await expect(map.getByText(`${unplaced} ideas without a location`)).toBeVisible();
  await expect(map.locator('.gv-map-pin')).toHaveCount(IDEAS.length - unplaced);

  // A hovered row marks its pin.
  const first = IDEAS[0];
  await rows(page).first().hover();
  await expect(map.locator('.gv-map__marker[data-hot]')).toHaveCount(1);
  await expect(map.locator('.gv-map__marker[data-hot] .gv-map-pin')).toHaveAttribute('aria-label', first.text);
  // The map opens on all the ideas: every pin in view.
  await expect(map.locator('.gv-map__marker[data-outside]')).toHaveCount(0);
  // A row opens its idea: its pin opens with its card (the side panel would cover the list: it opens from the card).
  await rows(page).first().click();
  await expect(map.getByRole('button', {name: first.text, exact: true})).toHaveAttribute('aria-expanded', 'true');
  await expect(rows(page).first()).toHaveAttribute('aria-current', 'true');
  await expect(panel(page)).toHaveCount(0);
  await map.getByRole('button', {name: 'Open idea'}).click();
  await expect(panel(page)).toContainText(first.text);
  await page.keyboard.press('Escape');
  await expect(panel(page)).toHaveCount(0);
  await expect(map.getByRole('button', {name: first.text, exact: true})).toHaveAttribute('aria-expanded', 'true');
  // Pressing the row again closes the idea.
  await rows(page).first().click();
  await expect(rows(page).first()).not.toHaveAttribute('aria-current', 'true');
  a11yReport(await new AxeBuilder({page}).include('.bo-phase-map')
    .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa', 'wcag22aa']).analyze()
    .then(r => r.violations.map(v => `${v.id}: ${v.nodes.map(n => n.target).join(', ')}`)));

  // Back to List: the table with its pages.
  await page.getByRole('radio', {name: 'List'}).click();
  await expect(page.getByRole('navigation', {name: 'Idea pages'})).toBeVisible();
  await expect(rows(page)).toHaveCount(onPage(IDEAS.length));
  // Every request off the machine was answered here or refused; the map asked for nothing but its style (the page's
  // web font is refused too).
  const asked = offsite.filter(u => !/^https:\/\/fonts\.(googleapis|gstatic)\.com\//.test(u));
  expect(asked.every(u => u.startsWith('https://tiles.openfreemap.org/styles/')), asked.join('\n')).toBe(true);
});
