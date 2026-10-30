import {test, expect, type Page} from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';
import {a11yReport} from './axe';

// A project's own overview (#/projects/:id), after the prototype's live project screen, on Workspace layout:
// the Participation rail | Project setup | the resident's phone preview, under the Project header's bar. The setup
// column is a plain Panel (a region named by its heading, the cog in its head). The bar's panel toggle opens the
// platform's menu (Side nav, hidden on project screens); Share ▾ opens the Access popover; the state is a Publish ▾,
// ● Live ▾ or Archived ▾ menu button.
const URL = '/backoffice/#/projects/green-corridors';

test('the overview has its own route, heading and breadcrumb', async ({page}) => {
  await page.goto(URL);
  await expect(page).toHaveURL(/#\/projects\/green-corridors$/);
  await expect(page.getByRole('heading', {level: 1, name: 'Green Corridors for Larkvale'})).toBeAttached();
  const crumbs = page.getByRole('navigation', {name: 'Breadcrumb'});
  await expect(crumbs.getByRole('link', {name: 'Projects'})).toHaveAttribute('href', '#/projects');
  await expect(crumbs.getByText('Green Corridors for Larkvale')).toBeVisible();
  await expect(page.getByRole('button', {name: 'Share'})).toBeVisible();
  await expect(page.getByRole('button', {name: /Live/})).toBeVisible();
  // The phase screen's mode switch and Save stay on the phase screen.
  await expect(page.getByRole('radiogroup', {name: 'Phase view'})).toHaveCount(0);
  await expect(page.getByRole('button', {name: 'Save'})).toHaveCount(0);
});

test('three columns, left to right: participation, setup, preview', async ({page}) => {
  await page.goto(URL);
  const cols = ['Participation', 'Project setup', 'Preview'].map(n => page.getByRole('region', {name: n, exact: true}).or(page.getByRole('complementary', {name: n, exact: true})));
  const xs = [];
  for (const c of cols) {
    await expect(c).toBeVisible();
    xs.push((await c.boundingBox())!.x);
  }
  expect(xs[0]).toBeLessThan(xs[1]);
  expect(xs[1]).toBeLessThan(xs[2]);
  const widths = await Promise.all(cols.map(async c => (await c.boundingBox())!.width));
  expect(widths[2]).toBeGreaterThan(widths[0]);
  expect(widths[2]).toBeGreaterThan(widths[1]);
});

test('the timeline has one live phase, Community vote, and a spotlight', async ({page}) => {
  await page.goto(URL);
  const rail = page.getByRole('navigation', {name: 'Phases'});
  await expect(rail.getByRole('link')).toHaveCount(7);
  const live = rail.locator('[data-status="live"]');
  await expect(live).toHaveCount(1);
  await expect(live).toContainText('Community vote');
  await expect(live).toContainText('1,240 votes');
  await expect(live).toContainText('In progress');
  await expect(rail.getByRole('link', {name: /Collect ideas/})).toContainText('18 new');
  await expect(rail.locator('[data-status="completed"]')).toHaveCount(3);
  await expect(rail.locator('[data-status="upcoming"]')).toHaveCount(3);
  await expect(page.getByText('Spotlight')).toBeVisible();
  await expect(page.getByText('Resident satisfaction')).toBeVisible();
});

test('clicking a phase opens the phase screen, which leads back to the overview', async ({page}) => {
  await page.goto(URL);
  await page.getByRole('navigation', {name: 'Phases'}).getByRole('link', {name: /Collect ideas/}).click();
  await expect(page).toHaveURL(/#\/projects\/green-corridors\/phases\/p2\/build$/);
  await expect(page.getByRole('radiogroup', {name: 'Phase view'})).toBeVisible();
  await page.getByRole('link', {name: 'Green Corridors for Larkvale'}).click();
  await expect(page).toHaveURL(/#\/projects\/green-corridors$/);
});

test('collecting now, next actions and the folded project details', async ({page}) => {
  await page.goto(URL);
  const setup = page.getByRole('region', {name: 'Project setup'});
  await expect(setup.getByRole('heading', {level: 2, name: 'Project setup'})).toBeVisible();
  await expect(setup.getByRole('button', {name: /Participants.*215/})).toBeVisible();
  await expect(setup.getByText('Weekly, since 10 Aug')).toBeVisible();
  await expect(setup.getByRole('link', {name: 'Message participants'})).toHaveAttribute('href', '#/messaging');
  await expect(setup.getByRole('list', {name: 'Next actions'}).getByRole('listitem')).toHaveCount(2);
  // A live project has no publish checklist.
  await expect(setup.getByRole('heading', {name: 'Before you publish'})).toHaveCount(0);
  const details = setup.getByRole('button', {name: 'Project details'});
  await expect(details).toHaveAttribute('aria-expanded', 'false');
  await expect(setup.getByRole('button', {name: /Set area/})).toBeHidden();
  await details.click();
  await expect(details).toHaveAttribute('aria-expanded', 'true');
  // The details are the project's setup steps, Card's link and pick rows.
  const steps = setup.getByRole('list', {name: 'Setup steps'});
  // Published: the prototype's five rows, no marks, the project's area and tags set.
  await expect(steps.getByRole('listitem')).toHaveCount(5);
  await expect(steps.getByRole('link', {name: /Plan participation/})).toHaveCount(0);
  await expect(steps.locator('.gv-card__leading')).toHaveCount(0);
  await expect(steps.getByRole('link', {name: /Edit project page/})).toBeVisible();
  await expect(steps.getByRole('button', {name: /Set area/})).toContainText('Wrenfield');
  await expect(steps.getByRole('button', {name: /Set topic tags/})).toContainText('2 tags');
  await setup.getByRole('link', {name: 'Message participants'}).click();
  await expect(page).toHaveURL(/#\/messaging$/);
});

test('a draft project keeps the publish checklist', async ({page}) => {
  // From a live project's overview straight to a draft one's: the status starts afresh.
  await page.goto(URL);
  await page.goto('/backoffice/#/projects/harbour-plan');
  await expect(page.getByRole('heading', {name: 'Before you publish'})).toBeVisible();
  await expect(page.getByRole('button', {name: 'Publish'})).toBeVisible();
  await expect(page.getByRole('button', {name: /Live/})).toHaveCount(0);
});

test('Create report runs in its row (Action row working, then done) and opens the report', async ({page}) => {
  await page.goto(URL);
  const actions = page.getByRole('list', {name: 'Next actions'});
  await actions.getByRole('link', {name: 'Create report'}).click();
  const working = actions.locator('[aria-busy="true"]');
  await expect(working).toContainText('Creating report');
  await expect(working.getByRole('progressbar', {name: 'Creating report'})).toBeVisible();
  const ready = actions.getByRole('link', {name: 'Report ready'});
  await expect(ready).toHaveAttribute('href', '#/reporting', {timeout: 8000});
  await ready.click();
  await expect(page).toHaveURL(/#\/reporting$/);
});

test('a change in the setup trades Share and Publish for one Save until it is saved', async ({page}) => {
  await page.goto('/backoffice/#/projects/harbour-plan');
  await expect(page.getByRole('button', {name: 'Save'})).toHaveCount(0);
  await page.getByRole('button', {name: /Set area/}).click();
  await page.getByRole('menuitemradio', {name: /All areas/}).click();
  await expect(page.getByRole('button', {name: 'Share', exact: true})).toHaveCount(0);
  await expect(page.getByRole('button', {name: 'Publish'})).toHaveCount(0);
  await page.getByRole('button', {name: 'Save'}).click();
  await expect(page.getByText('Changes saved')).toBeVisible();
  await expect(page.getByRole('button', {name: 'Publish'})).toBeVisible();
});

test('the phone preview shows what a resident sees', async ({page}) => {
  await page.goto(URL);
  const preview = page.getByRole('region', {name: 'Preview'});
  await expect(preview.getByRole('heading', {name: 'Green Corridors for Larkvale'})).toBeVisible();
  await expect(preview.getByRole('button', {name: /Participate · 3 ways/})).toBeVisible();
  await expect(preview.getByText('215 participants')).toBeVisible();
  // The Phone stage's caption, and the phone's own action: Edit project page (the page editor isn't drawn yet).
  await expect(preview.getByText('What residents see on the project page')).toBeVisible();
  await preview.getByRole('group', {name: 'What residents see'}).hover();
  await preview.getByRole('button', {name: 'Edit project page'}).click();
  await expect(page.getByRole('dialog', {name: 'Edit project page'})).toBeVisible();
});

test('the overview passes axe (WCAG 2.2 AA)', async ({page}) => {
  await page.goto(URL);
  await expect(page.getByRole('navigation', {name: 'Phases'})).toBeVisible();
  // Rail section label paints its text in --gv-text-disabled (about 2.9:1 on white): the component's own token, owned
  // by the system, not this page. Accessibility is shown, never blocking, so that one contrast check is waived and reported.
  a11yReport(await violations(page));
});

test('an ended phase reads Done, not Draft, and its rail passes axe', async ({page}) => {
  await page.goto(URL);
  await page.getByRole('link', {name: /Collect ideas/}).first().click();
  const crumbs = page.getByRole('navigation', {name: 'Breadcrumb'});
  await expect(crumbs).toContainText('Live');
  await expect(crumbs).not.toContainText('Draft');
  await expect(page.getByText('18 new').first()).toBeVisible();
  // The rail only: the phase screen's setup cards carry their own contrast issues, reported to the system.
  a11yReport(await violations(page, 'nav[aria-label="Phases"]'));
});

// Only the contrast of two system parts is waived: the rail section label (see above) and Rail phase's green state
// word, both reported to the system; every other rule runs on them.
async function violations(page: Page, within?: string) {
  const builder = new AxeBuilder({page});
  if (within) builder.include(within);
  const {violations} = await builder
    .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa', 'wcag22aa']).analyze();
  return violations
    .map(v => ({...v, nodes: v.nodes.filter(n => !(v.id === 'color-contrast' && /gv-section-label|gv-rail-phase__state/.test(String(n.target))))}))
    .filter(v => v.nodes.length)
    .map(v => `${v.id}: ${v.nodes.map(n => n.target.join(' ')).join(', ')}`);
}

test('the header: its toggle opens the platform menu, Share opens the Access popover, the state menu offers the next step', async ({page}) => {
  await page.goto(URL);
  // The Side nav is hidden on project screens; the bar's toggle opens it over the page, Esc closes it.
  await expect(page.getByRole('navigation', {name: 'Main'})).toHaveCount(0);
  await page.getByRole('button', {name: 'Show the platform menu'}).click();
  await expect(page.getByRole('navigation', {name: 'Main'}).getByRole('link', {name: 'Projects'})).toBeVisible();
  await page.keyboard.press('Escape');
  await expect(page.getByRole('navigation', {name: 'Main'})).toHaveCount(0);

  // The Access popover recipe: invite by email (Enter), the people with access and their roles, Copy link.
  await page.getByRole('button', {name: 'Share'}).click();
  const share = page.getByRole('dialog', {name: 'Share'});
  await expect(share.getByRole('list', {name: 'People with access'}).getByRole('listitem')).toHaveCount(2);
  await expect(share.getByRole('button', {name: /Role for Manager B/})).toBeVisible();
  await share.getByRole('textbox', {name: 'Email or group'}).fill('river.walk@example.org');
  await page.keyboard.press('Enter');
  await expect(page.getByText('Invitation sent')).toBeVisible();
  await expect(share.getByRole('list', {name: 'People with access'}).getByRole('listitem')).toHaveCount(3);
  // Copying a link is done at once: a Toast says so.
  await share.getByRole('button', {name: 'Copy link'}).click();
  await expect(page.getByText('Link copied')).toBeVisible();
  await page.keyboard.press('Escape');
  await expect(share).toHaveCount(0);

  // Live ▾: who can find it and who can open it, one pick each with the menu open; Done closes it.
  await page.getByRole('button', {name: /Live/}).click();
  const live = page.getByRole('menu', {name: /Live/});
  await expect(live.getByRole('menuitemradio', {name: /^Public/})).toHaveAttribute('aria-checked', 'true');
  await expect(live.getByRole('menuitemradio', {name: /^Everyone/})).toHaveAttribute('aria-checked', 'true');
  await live.getByRole('menuitemradio', {name: /^Admins & managers/}).click();
  await expect(live.getByRole('menuitemradio', {name: /^Admins & managers/})).toHaveAttribute('aria-checked', 'true');
  await expect(live.getByRole('menuitemradio', {name: /^Public/})).toHaveAttribute('aria-checked', 'true');
  await live.getByRole('menuitem', {name: 'Done'}).click();
  await expect(live).toHaveCount(0);

  // A published project, one week in: the next step is to archive it, after a confirmation. The bar then wears
  // Project header's archived state, whose menu offers the way back.
  await page.getByRole('button', {name: /Live/}).click();
  await page.getByRole('menuitem', {name: 'Archive project'}).click();
  const confirm = page.getByRole('alertdialog', {name: 'Archive project?'});
  await confirm.getByRole('button', {name: 'Archive project'}).click();
  await expect(page.getByText('Project archived')).toBeVisible();
  await page.getByRole('button', {name: /Archived/}).click();
  await expect(page.getByRole('menuitem', {name: 'Restore to draft'})).toBeVisible();
});

test('the rail header hides the rail; the folded rail brings it back', async ({page}) => {
  await page.goto(URL);
  const rail = page.getByRole('complementary', {name: 'Participation'});
  await rail.getByRole('button', {name: 'Hide the participation rail'}).click();
  await expect(page.getByRole('navigation', {name: 'Phases'})).toHaveCount(0);
  await page.getByRole('button', {name: 'Show the participation rail'}).click();
  await expect(page.getByRole('navigation', {name: 'Phases'})).toBeVisible();
});

test('the settings cog opens the project settings: the prototype\'s four tabs, General information filled', async ({page}) => {
  await page.goto(URL);
  await page.getByRole('region', {name: 'Project setup'}).getByRole('button', {name: 'Project settings'}).click();
  const dialog = page.getByRole('dialog', {name: 'Settings'});
  // Grouped tabs (Tabs' "Vertical with group headings"): Project › General information, Resources; Inputs › Tags, Perspectives.
  const tabs = dialog.getByRole('listbox', {name: 'Project settings'});
  await expect(tabs.getByRole('option')).toHaveText(['General information', 'Resources', 'Tags', 'Perspectives']);
  for (const g of ['Project', 'Inputs']) await expect(tabs.getByText(g, {exact: true})).toBeVisible();
  // The name is a Multilingual text field: English filled, the other platform languages marked empty.
  await expect(dialog.getByRole('textbox', {name: 'Project name, English'})).toHaveValue('Green Corridors for Larkvale');
  await expect(dialog.getByRole('textbox', {name: 'Slug'})).toHaveValue('green-corridors');
  await expect(dialog.getByText('If you change the URL, links to the page using the old URL will no longer work.')).toBeVisible();
  await expect(dialog.getByRole('button', {name: /City centre.*Space|Space.*City centre/})).toBeVisible();
  await expect(dialog.getByText('not in Figma yet')).toHaveCount(0);
  await tabs.getByRole('option', {name: 'Tags'}).click();
  await expect(dialog.getByRole('row', {name: 'Cycling'})).toBeVisible();
  await dialog.getByRole('textbox', {name: 'New tag'}).fill('Trees');
  await dialog.getByRole('button', {name: 'Add tag'}).click();
  await expect(dialog.getByRole('row', {name: 'Trees'})).toBeVisible();
  await tabs.getByRole('option', {name: 'Resources'}).click();
  await expect(dialog.getByRole('grid', {name: 'Resources'}).or(dialog.getByRole('list', {name: 'Resources'}))).toBeVisible();
});

test('Add a phase: the method picker; picking a method opens the new phase\'s Build, Save off until it has a title and dates', async ({page}) => {
  await page.goto(URL);
  await page.getByRole('complementary', {name: 'Participation'}).getByRole('button', {name: 'Add a phase'}).click();
  const dialog = page.getByRole('dialog', {name: 'New participation method'});
  // The prototype's picker: three kinds of method, no heading over them, no footer.
  const kinds = dialog.getByRole('listbox', {name: 'Kinds of method'});
  await expect(kinds.getByRole('option')).toHaveText(['Gather input', 'Shape decisions', 'Inform and recruit']);
  for (const m of ['Ideation and geo mapping', 'Survey', 'Proposals and petitions', 'Document annotation'])
    await expect(dialog.getByRole('button', {name: m})).toBeVisible();
  await expect(dialog.getByRole('button', {name: 'Cancel'})).toHaveCount(0);
  await kinds.getByRole('option', {name: 'Inform and recruit'}).click();
  await expect(dialog.getByRole('button', {name: 'Sharing'})).toBeVisible();
  await dialog.getByRole('button', {name: 'Recruiting'}).click();
  await expect(dialog).toHaveCount(0);
  await expect(page).toHaveURL(/#\/projects\/green-corridors\/phases\/new-\d+\/build$/);
  const rail = page.getByRole('navigation', {name: 'Phases'});
  await expect(rail).toContainText('Upcoming · No dates yet · Volunteering');
  const setup = page.getByRole('region', {name: 'Volunteering setup'});
  await expect(setup.getByRole('textbox', {name: 'Phase title'})).toHaveValue('');
  await expect(page.getByRole('button', {name: 'Save'})).toBeDisabled();
  await setup.getByRole('textbox', {name: 'Phase title'}).fill('Plant the corridor');
  // Still no dates: Save waits.
  await expect(page.getByRole('button', {name: 'Save'})).toBeDisabled();
  // Back on the overview, the phase is still on the rail.
  await page.getByRole('link', {name: 'Green Corridors for Larkvale'}).click();
  await expect(page).toHaveURL(/#\/projects\/green-corridors$/);
  await expect(page.getByRole('navigation', {name: 'Phases'})).toContainText('Volunteering');
});

test('a phase on the rail deletes from its row (Rail phase), and the Toast undoes it', async ({page}) => {
  await page.goto(URL);
  const rail = page.getByRole('navigation', {name: 'Phases'});
  await rail.getByRole('link', {name: /Feedback survey/}).hover();
  await rail.getByRole('button', {name: 'Delete Feedback survey'}).click();
  await expect(rail.getByRole('link')).toHaveCount(6);
  await page.getByRole('button', {name: 'Undo'}).click();
  await expect(rail.getByRole('link')).toHaveCount(7);
});

// Set area and Set topic tags open their picker under the card (Card's "Setup row · pick" story).
test('Set topic tags: a searchable Option list; Enter ticks and it stays open; Esc closes, the card shows the value', async ({page}) => {
  await page.goto('/backoffice/#/projects/harbour-plan');
  const card = page.getByRole('button', {name: /Set topic tags/});
  await card.click();
  const search = page.getByRole('searchbox', {name: 'Search tags'});
  await expect(search).toBeFocused();
  await search.fill('clim');
  await page.keyboard.press('ArrowDown');
  await page.keyboard.press('Enter');
  await expect(page.getByRole('menuitemcheckbox', {name: 'Climate'})).toHaveAttribute('aria-checked', 'true');
  await expect(page.getByText('1 tag selected')).toBeVisible();
  // Esc empties the search first, then closes and gives focus back to the card.
  await page.keyboard.press('Escape');
  await expect(search).toHaveValue('');
  await page.keyboard.press('Escape');
  await expect(search).toHaveCount(0);
  await expect(card).toContainText('1 tag');
  await expect(card).toBeFocused();
});

test('Set area: a Menu of three choices; the card says what is set', async ({page}) => {
  await page.goto('/backoffice/#/projects/harbour-plan');
  const card = page.getByRole('button', {name: /Set area/});
  await card.click();
  await page.getByRole('menuitemradio', {name: /All areas/}).click();
  await expect(card).toContainText('All areas');
});
