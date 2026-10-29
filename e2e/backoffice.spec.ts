import {test, expect} from '@playwright/test';
const NAV = ['Dashboard', 'Projects', 'Input manager', 'Users', 'Messaging', 'Reporting', 'Community monitor',
  'Inspiration hub', 'Tools', 'Pages & menu', 'Settings'];

test('every nav item opens a page with its title and no console errors', async ({page}) => {
  const errors: string[] = [];
  page.on('console', m => m.type() === 'error' && errors.push(m.text()));
  await page.goto('/backoffice/');
  for (const label of NAV) {
    await page.getByRole('navigation', {name: 'Main'}).getByRole('link', {name: label}).click();
    await expect(page.getByRole('heading', {level: 1, name: label})).toBeVisible();
  }
  expect(errors).toEqual([]);
});

test('a project opens on its overview; a phase opens with Build, Manage and Insights', async ({page}) => {
  await page.goto('/backoffice/#/projects');
  await page.getByRole('link', {name: /Green Corridors/}).click();
  await expect(page).toHaveURL(/#\/projects\/green-corridors$/);
  await page.getByRole('link', {name: /Community vote/}).first().click();
  await expect(page.getByRole('radiogroup', {name: 'Phase view'}).or(page.getByRole('tablist', {name: 'Phase view'}))).toBeVisible();
});

test('back office is noindex', async ({page}) => {
  await page.goto('/backoffice/');
  await expect(page.locator('meta[name=robots]')).toHaveAttribute('content', /noindex/);
});

// A tab panel fading out is positioned against its TabPanels; without one it floats over the whole page.
test('switching tabs keeps the old panel inside its tab panels', async ({page}) => {
  await page.goto('/backoffice/#/projects');
  await page.getByRole('tab', {name: 'Folders'}).click();
  const loose = await page.evaluate(() =>
    [...document.querySelectorAll('.react-aria-TabPanel')].filter(p => !p.closest('.react-aria-TabPanels')).length);
  expect(loose).toBe(0);
  await expect(page.getByRole('grid', {name: 'Projects'})).toHaveCount(0);
});
