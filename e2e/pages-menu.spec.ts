import {test, expect, type Page} from '@playwright/test';
import {axeViolations, a11yReport} from './axe';

// Pages & menu on the current components: the Menu tab a Panel over a Sortable list, the Pages tab a Panel over a
// Data table (the header row is the grid's first row, so pages are counted in its body), row actions in the "…" menu, instant changes in a Toast with Undo, a
// page's delete confirmed in an Alert dialog, saves said in a Toast.
const MENU = ['Home', 'All projects', 'All input', 'Events', 'About', 'FAQ'];
const DEFAULTS = ['Home', 'All projects', 'All input', 'Events'];

const body = (page: Page, name: string) => page.getByRole('grid', {name}).getByRole('rowgroup').last().getByRole('row');
// The navbar is a Sortable list (a grid list: rows, no header); Home sits pinned above it.
const items = (page: Page) => page.getByRole('grid', {name: 'Menu items'}).getByRole('row');
const MOVABLE = MENU.slice(1);
// Sortable list from the keyboard (as e2e/report-parts.spec.ts): Enter picks the row up, the arrow walks the drop
// places until the one named `to` has focus, Enter drops it there.
async function carry(page: Page, key: 'ArrowUp' | 'ArrowDown', to: RegExp) {
  await page.keyboard.press('Enter');
  const place = page.locator('[aria-roledescription="drop indicator"]:focus');
  await expect(place).toHaveCount(1);
  for (let i = 0; i < 8 && !to.test((await place.getAttribute('aria-label')) ?? ''); i++) {
    await page.keyboard.press(key);
    await expect(place).toHaveCount(1);
  }
  await expect(place).toHaveAttribute('aria-label', to);
  await page.keyboard.press('Enter');
}

const toast = (page: Page) => page.locator('.react-aria-Toast');
const option = async (page: Page, menu: string, item: string) => {
  await page.getByRole('button', {name: menu}).click();
  await page.getByRole('menuitem', {name: item}).click();
};

test('pages & menu follows the real admin: Menu and Pages tabs, the menu items in order', async ({page}) => {
  await page.goto('/backoffice/#/pages-menu');
  await expect(page.getByRole('heading', {level: 1, name: 'Pages & menu'})).toBeVisible();
  const tabs = page.getByRole('tablist', {name: 'Pages & menu sections'});
  await expect(tabs.getByRole('tab', {name: 'Menu (6)'})).toHaveAttribute('aria-selected', 'true');
  await expect(tabs.getByRole('tab', {name: 'Pages (5)'})).toBeVisible();
  const panel = page.getByRole('region', {name: /Navigation bar/});
  await expect(panel.getByRole('heading', {level: 2, name: /Navigation bar/})).toBeVisible();
  await expect(panel.getByText('Organise the menu that appears across your site.')).toBeVisible();
  await expect(panel.getByRole('button', {name: 'New menu item'})).toBeVisible();

  const panelText = panel.getByText('Home', {exact: true});
  await expect(panelText).toBeVisible();
  const rows = items(page);
  await expect(rows).toHaveCount(MOVABLE.length);
  for (const [i, label] of MOVABLE.entries()) await expect(rows.nth(i)).toContainText(label);
  for (const label of DEFAULTS.slice(1)) await expect(rows.filter({hasText: label}).getByText('Default')).toBeVisible();
  for (const label of ['About', 'FAQ']) await expect(rows.filter({hasText: label}).getByText('Custom page')).toBeVisible();
  a11yReport(await axeViolations(page, '.gv-panel'));
});

test('home is locked and opens the homepage editor; other items drag into order and leave with Undo', async ({page}) => {
  await page.goto('/backoffice/#/pages-menu');
  const rows = items(page);
  // Home is pinned above the list: a lock, no handle.
  await expect(page.getByLabel('Always first')).toBeVisible();
  await expect(page.getByRole('button', {name: 'Move Home'})).toHaveCount(0);
  await expect(page.getByRole('button', {name: 'Move All projects'})).toBeVisible();
  // No arrows and no Position column any more.
  await expect(page.getByRole('button', {name: /^Move .* (up|down)$/})).toHaveCount(0);
  await expect(page.getByRole('columnheader', {name: 'Position'})).toHaveCount(0);
  await page.getByRole('button', {name: 'Options for Home'}).click();
  await expect(page.getByRole('menuitem', {name: 'Edit homepage'})).toBeVisible();
  await expect(page.getByRole('menuitem', {name: 'Remove from menu'})).toHaveCount(0);
  await page.keyboard.press('Escape');

  // Move FAQ above About from the keyboard: its handle, Enter, up to the place between Events and About, Enter.
  await page.getByRole('button', {name: 'Move FAQ'}).focus();
  await carry(page, 'ArrowUp', /between Events and About/);
  await expect(rows.nth(3)).toContainText('FAQ');
  await expect(rows.nth(4)).toContainText('About');

  // Remove Events, take it back with Undo; remove it again, then add it back from New menu item.
  await option(page, 'Options for Events', 'Remove from menu');
  await expect(rows).toHaveCount(MOVABLE.length - 1);
  await toast(page).filter({hasText: 'Events removed from the menu'}).getByRole('button', {name: 'Undo'}).click();
  await expect(rows).toHaveCount(MOVABLE.length);
  await expect(rows.nth(2)).toContainText('Events');
  await option(page, 'Options for Events', 'Remove from menu');
  await expect(rows).toHaveCount(MOVABLE.length - 1);
  await page.getByRole('button', {name: 'New menu item'}).click();
  await page.getByRole('menuitem', {name: /Events/}).click();
  await expect(rows).toHaveCount(MOVABLE.length);
  await expect(rows.last()).toContainText('Events');
  await expect(toast(page).filter({hasText: 'Events added to the menu'})).toBeVisible();
});

test('pages lists the custom pages; the switch puts a page in the menu, with Undo', async ({page}) => {
  await page.goto('/backoffice/#/pages-menu');
  await page.getByRole('tab', {name: /^Pages/}).click();
  const panel = page.getByRole('region', {name: /Custom pages/});
  await expect(panel.getByRole('heading', {level: 2, name: /Custom pages/})).toBeVisible();
  await expect(panel.getByRole('button', {name: 'New custom page'})).toBeVisible();
  const rows = body(page, 'Custom pages');
  await expect(rows).toHaveCount(5);
  const about = rows.filter({hasText: 'About'});
  await expect(about.getByText('In menu', {exact: true})).toBeVisible();
  await expect(about.getByText('/pages/about')).toBeVisible();
  await about.getByRole('button', {name: 'Options for page: About'}).click();
  for (const name of ['Edit page', 'View page', 'Delete page']) await expect(page.getByRole('menuitem', {name})).toBeVisible();
  await page.keyboard.press('Escape');
  await expect(page.getByText('Terms and conditions, the privacy policy and the cookie policy are edited in Settings.')).toBeVisible();

  const grants = rows.filter({hasText: 'Neighbourhood grants'});
  await expect(grants.getByText('Not in menu', {exact: true})).toBeVisible();
  const sw = grants.getByRole('switch', {name: 'Show Neighbourhood grants in menu'});
  await expect(sw).not.toBeChecked();
  // The switch's input is visually hidden: press its visible label.
  await grants.getByText('Not in menu', {exact: true}).click();
  await expect(sw).toBeChecked();
  await expect(grants.getByText('In menu', {exact: true})).toBeVisible();
  await expect(page.getByRole('tab', {name: 'Menu (7)'})).toBeVisible();
  await page.getByRole('tab', {name: /^Menu/}).click();
  await expect(items(page).last()).toContainText('Neighbourhood grants');
  await toast(page).filter({hasText: 'Neighbourhood grants added to the menu'}).getByRole('button', {name: 'Undo'}).click();
  await expect(items(page)).toHaveCount(MOVABLE.length);
});

test('deleting a page asks first; with none left the Panel shows an Empty state', async ({page}) => {
  await page.goto('/backoffice/#/pages-menu');
  await page.getByRole('tab', {name: /^Pages/}).click();
  const rows = body(page, 'Custom pages');
  await option(page, 'Options for page: About', 'Delete page');
  const confirm = page.getByRole('alertdialog', {name: 'Delete page?'});
  await expect(confirm).toContainText('About leaves the platform and the menu.');
  a11yReport(await axeViolations(page, '[role="alertdialog"]'));
  await confirm.getByRole('button', {name: 'Cancel'}).click();
  await expect(rows).toHaveCount(5);
  await option(page, 'Options for page: About', 'Delete page');
  await page.getByRole('alertdialog', {name: 'Delete page?'}).getByRole('button', {name: 'Delete page'}).click();
  await expect(rows).toHaveCount(4);
  await expect(toast(page).filter({hasText: 'About deleted'})).toBeVisible();
  await expect(page.getByRole('tab', {name: 'Menu (5)'})).toBeVisible();

  for (const name of ['FAQ', 'Accessibility statement', 'How we use your input', 'Neighbourhood grants']) {
    await option(page, `Options for page: ${name}`, 'Delete page');
    await page.getByRole('alertdialog', {name: 'Delete page?'}).getByRole('button', {name: 'Delete page'}).click();
  }
  await expect(page.getByRole('grid', {name: 'Custom pages'})).toHaveCount(0);
  await expect(page.getByRole('heading', {name: 'You haven’t created any custom pages yet'})).toBeVisible();
  await page.getByRole('region', {name: /Custom pages/}).getByRole('button', {name: 'New custom page'}).last().click();
  await expect(page).toHaveURL(/#\/pages-menu\/pages\/new$/);
});

test('home Edit opens the homepage builder: sections on and off, then Save', async ({page}) => {
  await page.goto('/backoffice/#/pages-menu');
  await option(page, 'Options for Home', 'Edit homepage');
  await expect(page).toHaveURL(/#\/pages-menu\/homepage-builder$/);
  await expect(page.getByRole('heading', {level: 1, name: 'Homepage'})).toBeVisible();
  await expect(page.getByRole('heading', {level: 2, name: /Sections/})).toContainText('3 of 6 shown');
  const sections = page.getByRole('list', {name: 'Sections'});
  for (const s of ['Homepage banner', 'Projects', 'Events', 'Proposals', 'Image & text cards']) {
    await expect(sections.getByRole('switch', {name: `Show ${s}`})).toBeVisible();
  }
  const save = page.getByRole('button', {name: 'Save homepage'});
  await expect(save).toBeDisabled();
  const events = sections.getByRole('switch', {name: 'Show Events'});
  await expect(events).toBeChecked();
  await events.click({force: true});
  await expect(events).not.toBeChecked();
  await expect(sections.getByRole('listitem').filter({hasText: 'Events'}).getByText('Not shown on page')).toBeVisible();
  await expect(page.getByRole('heading', {level: 2, name: /Sections/})).toContainText('2 of 6 shown');
  await save.click();
  await expect(toast(page).filter({hasText: 'Homepage saved'})).toBeVisible();
  await expect(save).toBeDisabled();
  await expect(page.locator('[data-missing-part="Homepage preview"]')).toBeVisible();
  await page.getByRole('navigation', {name: 'Breadcrumbs'}).getByRole('link', {name: 'Pages & menu'}).click();
  await expect(page.getByRole('heading', {level: 1, name: 'Pages & menu'})).toBeVisible();
});

test('a menu item\'s Edit opens its form: the name in every language, then Save', async ({page}) => {
  await page.goto('/backoffice/#/pages-menu');
  await option(page, 'Options for All projects', 'Edit menu item');
  await expect(page).toHaveURL(/#\/pages-menu\/navbar-items\/edit\/projects$/);
  await expect(page.getByRole('heading', {level: 1, name: 'All projects'})).toBeVisible();
  await expect(page.getByRole('heading', {level: 2, name: 'Name in navbar'})).toBeVisible();
  const en = page.getByRole('textbox', {name: 'Name in navbar (English)'});
  await expect(en).toHaveValue('All projects');
  await expect(page.getByRole('textbox', {name: 'Name in navbar (Français (Belgique))'})).toBeVisible();
  await expect(page.getByText('Provide a title for all languages.')).toHaveCount(0);
  const save = page.getByRole('button', {name: 'Save page'});
  await expect(save).toBeDisabled();
  await en.fill('Projects');
  await save.click();
  await expect(toast(page).filter({hasText: 'Page successfully saved'})).toBeVisible();

  // A name missing in a language: a warning Banner names it.
  await page.goto('/backoffice/#/pages-menu/navbar-items/edit/faq');
  await expect(page.getByText('Provide a title for all languages.')).toBeVisible();
  await expect(page.getByText(/Missing: Nederlands \(Nederland\)/)).toBeVisible();
});

test('New custom page opens Create custom page, with Settings and Content tabs', async ({page}) => {
  await page.goto('/backoffice/#/pages-menu');
  await page.getByRole('tab', {name: /^Pages/}).click();
  await page.getByRole('button', {name: 'New custom page'}).click();
  await expect(page).toHaveURL(/#\/pages-menu\/pages\/new$/);
  await expect(page.getByRole('heading', {level: 1, name: 'Create custom page'})).toBeVisible();
  const tabs = page.getByRole('tablist', {name: 'Custom page sections'});
  await expect(tabs.getByRole('tab', {name: 'Settings'})).toHaveAttribute('aria-selected', 'true');
  await expect(page.getByRole('heading', {level: 2, name: 'Page settings'})).toBeVisible();
  const save = page.getByRole('button', {name: 'Save custom page'});
  await expect(save).toBeDisabled();
  await page.getByRole('textbox', {name: 'Title, English'}).fill('Neighbourhood budget');
  await expect(page.getByRole('textbox', {name: 'Slug'})).toHaveValue('neighbourhood-budget');
  await tabs.getByRole('tab', {name: 'Content'}).click();
  await expect(page.getByRole('heading', {level: 2, name: /Page content/})).toContainText('2 of 6 shown');
  const sections = page.getByRole('list', {name: 'Sections'});
  await expect(sections.getByRole('switch', {name: 'Show Top info section'})).toBeVisible();
  await sections.getByRole('switch', {name: 'Show Attachments'}).click({force: true});
  await save.click();
  await expect(toast(page).filter({hasText: 'Page successfully created'})).toBeVisible();
});

test('a custom page\'s Edit and View open the page; an unknown page says so', async ({page}) => {
  await page.goto('/backoffice/#/pages-menu');
  await page.getByRole('tab', {name: /^Pages/}).click();
  await option(page, 'Options for page: About', 'Edit page');
  await expect(page).toHaveURL(/#\/pages-menu\/pages\/about$/);
  await expect(page.getByRole('heading', {level: 1, name: 'About'})).toBeVisible();
  await expect(page.getByRole('textbox', {name: 'Title, English'})).toHaveValue('About');
  await page.getByRole('button', {name: 'View page'}).click();
  await expect(page).toHaveURL(/#\/pages-menu\/pages\/about\/view$/);
  await expect(page.getByRole('heading', {level: 1, name: 'About'})).toBeVisible();

  await page.goto('/backoffice/#/pages-menu');
  await page.getByRole('tab', {name: /^Pages/}).click();
  await option(page, 'Options for page: FAQ', 'View page');
  await expect(page).toHaveURL(/#\/pages-menu\/pages\/faq\/view$/);
  await expect(page.getByRole('heading', {level: 1, name: 'FAQ'})).toBeVisible();

  await page.goto('/backoffice/#/pages-menu/pages/nowhere');
  await expect(page.getByRole('heading', {level: 1, name: 'Page not found'})).toBeVisible();
  await page.getByRole('button', {name: 'Back to Pages & menu'}).click();
  await expect(page.getByRole('heading', {level: 1, name: 'Pages & menu'})).toBeVisible();
});

test('pages & menu names what the system still lacks: the navbar\'s reordering is the Sortable list now', async ({page}) => {
  await page.goto('/backoffice/#/pages-menu');
  await expect(page.getByRole('grid', {name: 'Menu items'})).toBeVisible();
  const gaps = await page.locator('[data-missing-part]').evaluateAll(els => [...new Set(els.map(e => e.getAttribute('data-missing-part')))]);
  expect(gaps).not.toContain('Drag-and-drop reordering');
});
