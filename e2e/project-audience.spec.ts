import {test, expect} from '@playwright/test';
import {PEOPLE} from '../backoffice/src/data-users';
import {a11yReport, axeViolations} from './axe';

// A project's Audience (#/projects/:id/audience), after the prototype's page behind the overview's Participants card:
// the project's crumbs, the rail, the tabs Participants / Demographics / Traffic, four Stat tiles and the table of
// everyone who has taken part.
const URL = '/backoffice/#/projects/green-corridors/audience';

test('the Participants card opens the Audience page, crumbs Project › Audience, the rail beside it', async ({page}) => {
  await page.goto('/backoffice/#/projects/green-corridors');
  await page.getByRole('region', {name: 'Project setup'}).getByRole('button', {name: /Participants.*215/}).click();
  await expect(page).toHaveURL(/#\/projects\/green-corridors\/audience$/);
  const crumbs = page.getByRole('navigation', {name: 'Breadcrumb'});
  await expect(crumbs.getByRole('link', {name: 'Green Corridors for Larkvale'})).toHaveAttribute('href', '#/projects/green-corridors');
  await expect(crumbs).toContainText('Audience');
  await expect(page.getByRole('complementary', {name: 'Participation'})).toBeVisible();
});

test('tabs, four Stat tiles and the participants table; search narrows it; the tabs move by keyboard', async ({page}) => {
  await page.goto(URL);
  const tabs = page.getByRole('tablist', {name: 'Audience'});
  await expect(tabs.getByRole('tab')).toHaveText(['Participants', 'Demographics', 'Traffic']);
  for (const t of ['Participants', 'Shared an idea', 'Votes cast', 'Provided demographics'])
    await expect(page.getByRole('tabpanel').getByText(t, {exact: true}).first()).toBeVisible();
  const table = page.getByRole('grid', {name: 'All participants'});
  await expect(table.getByRole('row').filter({has: page.getByRole('rowheader')})).toHaveCount(PEOPLE.length);
  await page.getByRole('searchbox', {name: 'Search participants'}).fill('Resident E');
  await expect(table.getByRole('row').filter({has: page.getByRole('rowheader')})).toHaveCount(1);
  await expect(page.getByRole('link', {name: 'Stats overview'})).toHaveAttribute('href', '#/dashboard');
  await tabs.getByRole('tab', {name: 'Participants'}).focus();
  await page.keyboard.press('ArrowRight');
  await expect(tabs.getByRole('tab', {name: 'Demographics'})).toHaveAttribute('aria-selected', 'true');
  await expect(page.getByText('Age group')).toBeVisible();
});

test('the Audience page passes axe (WCAG 2.2 AA), reported', async ({page}) => {
  await page.goto(URL);
  await expect(page.getByRole('grid', {name: 'All participants'})).toBeVisible();
  a11yReport(await axeViolations(page, 'main'));
});
