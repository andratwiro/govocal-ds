import {test, expect, type Page} from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';
import {a11yReport} from './axe';

const toast = (page: Page) => page.locator('.react-aria-Toast');
const allCards = (page: Page) => page.getByRole('list', {name: 'All projects'}).getByRole('listitem');

async function filterBy(page: Page, facet: string, value: string) {
  await page.getByRole('button', {name: /^Filter projects/}).click();
  await page.getByRole('menu', {name: 'Filter projects'}).getByRole('menuitem', {name: new RegExp(`^${facet}`)}).hover();
  await page.getByRole('menuitemcheckbox', {name: new RegExp(`^${value}`)}).click();
  await page.keyboard.press('Escape');
  await page.keyboard.press('Escape');
}

// Redesign: both sections are Panels; filters went from four Selects to the Filter menu and Filter chips (as on
// every other list), the count sits in the Table toolbar, and Pagination replaces "no more projects".
test('inspiration hub follows the real admin: highlighted projects, then all projects with filters and sort', async ({page}) => {
  await page.goto('/backoffice/#/inspiration-hub');
  await expect(page.getByRole('heading', {level: 1, name: 'Inspiration hub'})).toBeVisible();
  const highlighted = page.getByRole('region', {name: 'Highlighted'});
  const all = page.getByRole('region', {name: 'All projects'});
  await expect(highlighted.getByRole('heading', {level: 2, name: 'Highlighted'})).toBeVisible();
  await expect(all.getByRole('heading', {level: 2, name: 'All projects'})).toBeVisible();
  await expect(highlighted.getByRole('button', {name: /Highlighted for$/})).toContainText('Northmark');
  await expect(all.getByRole('button', {name: /Sort by$/})).toContainText('Start date (newest first)');
  await expect(all.getByRole('searchbox', {name: 'Search projects'})).toBeVisible();
  await expect(all.getByRole('button', {name: 'Filter projects'})).toBeVisible();
  await expect(all.getByRole('heading', {name: '8 projects'})).toBeVisible();
  await expect(all.getByRole('navigation', {name: 'Project pages'})).toBeVisible();
});

test('highlighted projects follow the chosen country', async ({page}) => {
  await page.goto('/backoffice/#/inspiration-hub');
  const pinned = page.getByRole('list', {name: 'Highlighted projects'}).getByRole('listitem');
  await expect(pinned).toHaveCount(2);
  await page.getByRole('button', {name: /Highlighted for$/}).click();
  await page.getByRole('option', {name: 'Southmere'}).click();
  await expect(pinned).toHaveCount(1);
  await expect(pinned.first()).toContainText('Neighbourhood budget 2026');
  // A country with no highlight shows an Empty state.
  await page.getByRole('button', {name: /Highlighted for$/}).click();
  await page.getByRole('option', {name: 'Westerholm'}).click();
  await expect(page.getByRole('heading', {name: 'Nothing highlighted here yet'})).toBeVisible();
});

test('the gallery pages, six cards a page', async ({page}) => {
  await page.goto('/backoffice/#/inspiration-hub');
  await expect(allCards(page)).toHaveCount(6);
  await page.getByRole('navigation', {name: 'Project pages'}).getByRole('button', {name: 'Page 2'}).click();
  await expect(allCards(page)).toHaveCount(2);
  await expect(allCards(page).first()).toContainText('Cycle lanes on the ring road');
});

test('each card shows platform, participants and methods, and copying is instant with Undo', async ({page}) => {
  await page.goto('/backoffice/#/inspiration-hub');
  await page.getByRole('navigation', {name: 'Project pages'}).getByRole('button', {name: 'Page 2'}).click();
  const card = allCards(page).filter({has: page.getByRole('heading', {level: 3, name: 'Cycle lanes on the ring road'})});
  await expect(card).toContainText('Quillbrook');
  await expect(card).toContainText('2,475');
  await expect(card).toContainText('Common ground');
  await expect(card.getByRole('button', {name: 'Preview: Cycle lanes on the ring road'})).toBeVisible();
  await card.getByRole('button', {name: 'Copy project'}).click();
  await expect(card.getByRole('button', {name: 'Copied'})).toBeDisabled();
  await expect(card).toContainText('In your drafts');
  await expect(toast(page).first()).toContainText('Copied to your drafts');
  await toast(page).first().getByRole('button', {name: 'Undo'}).click();
  await expect(card.getByRole('button', {name: 'Copy project'})).toBeEnabled();
});

test('the Filter menu narrows the gallery, shows chips, and an Empty state clears it', async ({page}) => {
  await page.goto('/backoffice/#/inspiration-hub');
  const all = page.getByRole('region', {name: 'All projects'});
  const chips = page.getByRole('grid', {name: 'Active filters'});
  await filterBy(page, 'Method', 'Voting');
  await expect(allCards(page)).toHaveCount(3);
  await expect(all.getByRole('heading', {name: '3 projects'})).toBeVisible();
  await expect(chips).toContainText('Voting');
  await page.getByRole('searchbox', {name: 'Search projects'}).fill('budget');
  await expect(allCards(page)).toHaveCount(1);
  await chips.getByRole('button', {name: 'Remove the Method filter'}).click();
  await expect(allCards(page)).toHaveCount(1);
  await page.getByRole('searchbox', {name: 'Search projects'}).fill('zzz');
  await expect(all.getByRole('heading', {name: 'No projects match'})).toBeVisible();
  await all.getByRole('button', {name: 'Clear search and filters'}).click();
  await expect(allCards(page)).toHaveCount(6);
  await expect(all.getByRole('heading', {name: '8 projects'})).toBeVisible();
  // Facets add up: Northmark surveys.
  await filterBy(page, 'Country', 'Northmark');
  await filterBy(page, 'Method', 'Survey');
  await expect(allCards(page)).toHaveCount(2);
  await page.getByRole('button', {name: 'Clear', exact: true}).click();
  await expect(chips).toHaveCount(0);
});

test('inspiration hub names what the system still lacks', async ({page}) => {
  await page.goto('/backoffice/#/inspiration-hub');
  const gaps = await page.locator('[data-missing-part]').evaluateAll(els => [...new Set(els.map(e => e.getAttribute('data-missing-part')))]);
  // The project's image is Card media now; the highlight's quote is still missing.
  expect(gaps).toEqual(['Quote']);
});

// ── The first clicks: a card opens a preview of its project ──

test('a project card opens a preview, and the preview passes axe', async ({page}) => {
  await page.goto('/backoffice/#/inspiration-hub');
  await page.getByRole('navigation', {name: 'Project pages'}).getByRole('button', {name: 'Page 2'}).click();
  const all = page.getByRole('list', {name: 'All projects'});
  await all.getByRole('link', {name: 'Cycle lanes on the ring road', exact: true}).click();
  const dialog = page.getByRole('dialog', {name: 'Cycle lanes on the ring road'});
  await expect(dialog).toBeVisible();
  // The facts are a Property list.
  const facts = dialog.getByRole('definition');
  await expect(facts.filter({hasText: 'Quillbrook'})).toBeVisible();
  await expect(facts.filter({hasText: '2,475 participants'})).toBeVisible();
  await expect(dialog.getByRole('heading', {name: 'Phases'})).toBeVisible();
  const r = await new AxeBuilder({page}).include('.gv-modal').withTags(['wcag2a', 'wcag2aa', 'wcag21aa', 'wcag22aa']).analyze();
  a11yReport(r.violations.map(v => v.id));
  await dialog.getByRole('button', {name: 'Close'}).first().click();
  await expect(dialog).toHaveCount(0);
});

test('the preview icon opens the same preview, and copying from it marks the card', async ({page}) => {
  await page.goto('/backoffice/#/inspiration-hub');
  const all = page.getByRole('list', {name: 'All projects'}).getByRole('listitem');
  const card = all.filter({has: page.getByRole('heading', {level: 3, name: 'Safe routes to school'})});
  await card.getByRole('button', {name: 'Preview: Safe routes to school'}).click();
  const dialog = page.getByRole('dialog', {name: 'Safe routes to school'});
  await expect(dialog).toContainText('Survey');
  await dialog.getByRole('button', {name: 'Copy project'}).click();
  await expect(dialog).toHaveCount(0);
  await expect(card.getByRole('button', {name: 'Copied'})).toBeDisabled();
  await expect(toast(page).first()).toContainText('Copied to your drafts');
});
