import {test, expect} from '@playwright/test';

const MENU = ['Home', 'All projects', 'All input', 'Events', 'About', 'FAQ'];
const DEFAULTS = ['Home', 'All projects', 'All input', 'Events'];

test('pages & menu follows the real admin: Menu and Pages tabs, the menu items in order', async ({page}) => {
  await page.goto('/backoffice/#/pages-menu');
  await expect(page.getByRole('heading', {level: 1, name: 'Pages & menu'})).toBeVisible();
  const tabs = page.getByRole('tablist', {name: 'Pages & menu sections'});
  await expect(tabs.getByRole('tab', {name: 'Menu'})).toHaveAttribute('aria-selected', 'true');
  await expect(tabs.getByRole('tab', {name: 'Pages'})).toBeVisible();
  await expect(page.getByRole('heading', {level: 3, name: 'Navigation bar'})).toBeVisible();
  await expect(page.getByText('Organise the menu that appears across your site.')).toBeVisible();
  await expect(page.getByRole('button', {name: 'New menu item'})).toBeVisible();

  const rows = page.getByRole('grid', {name: 'Menu items'}).getByRole('row');
  await expect(rows).toHaveCount(MENU.length);
  for (const [i, label] of MENU.entries()) await expect(rows.nth(i)).toContainText(label);
  for (const label of DEFAULTS) await expect(rows.filter({hasText: label}).getByText('Default')).toBeVisible();
});

test('home is locked and opens the homepage editor; other items can be removed and moved', async ({page}) => {
  await page.goto('/backoffice/#/pages-menu');
  const grid = page.getByRole('grid', {name: 'Menu items'});
  const home = grid.getByRole('row').first();
  await expect(home.getByRole('button', {name: 'Edit homepage'})).toBeVisible();
  await expect(home.getByRole('button', {name: 'Remove from menu'})).toHaveCount(0);

  // Move FAQ above About.
  await grid.getByRole('row').filter({hasText: 'FAQ'}).getByRole('button', {name: 'Reorder FAQ'}).click();
  await page.getByRole('menuitem', {name: 'Move up'}).click();
  await expect(grid.getByRole('row').nth(4)).toContainText('FAQ');

  // Remove Events, then add it back from New menu item.
  await grid.getByRole('row').filter({hasText: 'Events'}).getByRole('button', {name: 'Remove from menu'}).click();
  await expect(grid.getByRole('row')).toHaveCount(MENU.length - 1);
  await page.getByRole('button', {name: 'New menu item'}).click();
  await page.getByRole('menuitem', {name: 'Events'}).click();
  await expect(grid.getByRole('row')).toHaveCount(MENU.length);
  await expect(grid.getByRole('row').last()).toContainText('Events');
});

test('pages lists the custom pages; the switch puts a page in the menu', async ({page}) => {
  await page.goto('/backoffice/#/pages-menu');
  await page.getByRole('tab', {name: 'Pages'}).click();
  await expect(page.getByRole('heading', {level: 3, name: 'Custom pages'})).toBeVisible();
  await expect(page.getByRole('button', {name: 'New custom page'})).toBeVisible();
  const list = page.getByRole('list', {name: 'Custom pages'});
  const about = list.getByRole('listitem').filter({hasText: 'About'});
  await expect(about.getByText('In menu', {exact: true})).toBeVisible();
  for (const name of ['Edit page: About', 'View page: About', 'Delete page: About']) {
    await expect(about.getByRole('button', {name})).toBeVisible();
  }
  const grants = list.getByRole('listitem').filter({hasText: 'Neighbourhood grants'});
  await expect(grants.getByText('Not in menu', {exact: true})).toBeVisible();
  const sw = grants.getByRole('switch', {name: 'Show in menu'});
  await expect(sw).not.toBeChecked();
  await sw.click({force: true});
  await expect(sw).toBeChecked();
  await expect(grants.getByText('In menu', {exact: true})).toBeVisible();
  await page.getByRole('tab', {name: 'Menu'}).click();
  await expect(page.getByRole('grid', {name: 'Menu items'}).getByRole('row').last()).toContainText('Neighbourhood grants');
});

test('pages & menu names what the system still lacks', async ({page}) => {
  await page.goto('/backoffice/#/pages-menu');
  const gaps = await page.locator('[data-gap]').evaluateAll(els => [...new Set(els.map(e => e.getAttribute('data-gap')))]);
  expect(gaps).toEqual(expect.arrayContaining(['Drag-and-drop reordering']));
});
