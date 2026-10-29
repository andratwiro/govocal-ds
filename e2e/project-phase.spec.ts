import {test, expect, type Page} from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';
import {IDEAS} from '../backoffice/src/data-project';

// The phase screen's Manage tab (#/projects/:id/phases/:phase/manage), after the prototype's Manage tab one week after
// publishing: the metrics, then the ideas under a toolbar (count or selection bar, search, filter) and filter chips.
const URL = '/backoffice/#/projects/green-corridors/phases/p2/manage';
const ideas = (n: number) => `${n} ${n === 1 ? 'idea' : 'ideas'}`;
const table = (page: Page) => page.getByRole('grid', {name: 'Ideas'});
const rows = (page: Page) => table(page).getByRole('row').filter({has: page.getByRole('rowheader')});
const filterButton = (page: Page) => page.getByRole('button', {name: /^Filter ideas/});
const chips = (page: Page) => page.getByRole('grid', {name: 'Active filters'});

async function tick(page: Page, facet: string, value: string) {
  await page.getByRole('menuitem', {name: new RegExp(`^${facet}`)}).hover();
  await page.getByRole('menuitemcheckbox', {name: new RegExp(`^${value}`)}).click();
}

test('the Manage tab lists the phase\'s ideas with its metrics', async ({page}) => {
  await page.goto(URL);
  await expect(page.getByRole('radiogroup', {name: 'Phase view'}).getByRole('radio', {name: 'Manage'})).toBeChecked();
  await expect(page.getByRole('heading', {level: 2, name: ideas(IDEAS.length)})).toBeVisible();
  await expect(rows(page)).toHaveCount(IDEAS.length);
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
  await expect(rows(page)).toHaveCount(a.length);
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
  await expect(rows(page)).toHaveCount(both.length);
  await expect(page.getByRole('heading', {level: 2, name: ideas(both.length)})).toBeVisible();
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
  await expect(rows(page)).toHaveCount(a.length);
  await filterButton(page).click();
  await expect(menu.getByRole('menuitem', {name: /^Tags/})).not.toContainText('1');
  await page.getByRole('menuitem', {name: /^Tags/}).hover();
  await expect(page.getByRole('menuitemcheckbox', {name: /^Cycling/})).toHaveAttribute('aria-checked', 'false');

  // Two values in one facet: "is any of"; Clear all filters empties both views.
  await tick(page, 'Status', 'Proposed');
  await tick(page, 'Status', 'Viewed');
  await expect(rows(page)).toHaveCount(a.filter(i => ['Proposed', 'Viewed'].includes(i.status)).length);
  await expect(chips(page).getByRole('row', {name: 'Status is any of Proposed, Viewed'})).toBeVisible();
  await menu.getByRole('menuitem', {name: 'Clear all filters'}).click();
  await expect(chips(page)).toHaveCount(0);
  await expect(rows(page)).toHaveCount(IDEAS.length);
});

test('the metrics are filters too: Unassigned shows its chip', async ({page}) => {
  await page.goto(URL);
  await page.getByRole('link', {name: /^Unassigned/}).click();
  await expect(chips(page).getByRole('row', {name: 'Assignee is Unassigned'})).toBeVisible();
  await expect(rows(page)).toHaveCount(IDEAS.filter(i => i.assignee === 'Unassigned').length);
  await page.getByRole('button', {name: 'Clear', exact: true}).click();
  await expect(rows(page)).toHaveCount(IDEAS.length);
});

test('search narrows the ideas', async ({page}) => {
  await page.goto(URL);
  await page.getByRole('button', {name: 'Search ideas'}).click();
  await page.getByRole('searchbox', {name: 'Search ideas'}).fill('repair café');
  await expect(rows(page)).toHaveCount(IDEAS.filter(i => i.text.toLowerCase().includes('repair café')).length);
});

test('selecting ideas swaps the count for the selection bar', async ({page}) => {
  await page.goto(URL);
  const first = rows(page).first();
  await first.getByRole('checkbox').check({force: true});
  const bar = page.getByRole('toolbar', {name: 'Selection actions'});
  await expect(bar).toContainText('1 selected');
  for (const a of ['Status', 'Assign', 'Tags', 'Copy to phase', 'Official update'])
    await expect(bar.getByRole('button', {name: a, exact: true})).toBeVisible();
  await expect(page.getByRole('heading', {level: 2, name: ideas(IDEAS.length)})).toHaveCount(0);

  // Status applies to the selected ideas at once.
  await bar.getByRole('button', {name: 'Status', exact: true}).click();
  await page.getByRole('menuitem', {name: 'Implemented', exact: true}).click();
  await expect(first).toContainText('Implemented');

  // Official update opens its composer.
  await bar.getByRole('button', {name: 'Official update'}).click();
  const dialog = page.getByRole('dialog', {name: 'Official update'});
  await expect(dialog.getByRole('textbox', {name: 'Official update'})).toBeVisible();
  await dialog.getByRole('button', {name: 'Cancel'}).click();

  await bar.getByRole('button', {name: 'Clear selection'}).click();
  await expect(bar).toHaveCount(0);
  await expect(page.getByRole('heading', {level: 2, name: ideas(IDEAS.length)})).toBeVisible();
});

test('the Manage tab passes axe (WCAG 2.2 AA), filters on and a row selected', async ({page}) => {
  await page.goto(URL);
  await filterButton(page).click();
  await tick(page, 'Tags', 'Cycling');
  await page.keyboard.press('Escape');
  await page.keyboard.press('Escape');
  await page.keyboard.press('Escape');
  await rows(page).first().getByRole('checkbox').check({force: true});
  expect(await violations(page, 'section[aria-label="Ideas"]')).toEqual([]);
});

async function violations(page: Page, within: string) {
  const {violations} = await new AxeBuilder({page}).include(within)
    .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa', 'wcag22aa']).analyze();
  return violations.map(v => `${v.id}: ${v.nodes.map(n => n.target.join(' ')).join(', ')}`);
}

test('Build: the checklist and phase cards open', async ({page}) => {
  await page.goto('/backoffice/#/projects/green-corridors/phases/p2/build');
  const setup = page.getByRole('complementary', {name: 'Setup'});
  await setup.getByRole('button', {name: 'Edit project page'}).click();
  await expect(page.getByRole('dialog', {name: 'Project settings'}).getByRole('tab', {name: 'Project page'})).toHaveAttribute('aria-selected', 'true');
  await page.keyboard.press('Escape');
  await setup.getByRole('button', {name: /Idea form/}).click();
  await expect(page.getByRole('dialog', {name: 'Idea form'})).toBeVisible();
});
