import {test, expect} from '@playwright/test';

// Patterns › Recipes › Integration seams: each story's play function drives the seam (a router link, a form library,
// a translate function, data that loads, fails and loads). Here the browser waits for the state only a finished play
// function reaches, and fails on anything the page throws, a failed play function included.
const story = (name: string) => `/storybook/iframe.html?id=patterns-recipes-integration-seams--${name}&viewMode=story`;
const ends: [string, (page: import('@playwright/test').Page) => Promise<void>][] = [
  ['router-link', async page => {
    await expect(page.getByRole('status')).toContainText('/projects/green-corridors');
    await expect(page).toHaveURL(/viewMode=story$/);
  }],
  ['form-library-field', async page => {
    await expect(page.getByRole('status')).toContainText('Saved “Green Corridors”');
    await expect(page.getByRole('textbox', {name: /^Title/})).toHaveAttribute('name', 'title');
  }],
  ['translated-strings', async page => {
    await expect(page.getByRole('navigation', {name: 'Paginering'})).toBeVisible();
    await expect(page.getByRole('button', {name: 'Pagina 1.240'})).toBeVisible();
  }],
  ['table-loading-error-data', async page => {
    await expect(page.getByRole('grid', {name: 'Ideas'}).getByRole('row')).toHaveCount(4);
  }]
];

for (const [name, end] of ends) {
  test(`Integration seams: ${name} plays through, and says who wires what`, async ({page}) => {
    const errors: string[] = [];
    page.on('pageerror', e => errors.push(e.message));
    await page.goto(story(name));
    const who = page.getByRole('region', {name: 'Who wires what'});
    await expect(who.getByRole('heading', {name: 'The system does'})).toBeVisible();
    await expect(who.getByRole('heading', {name: 'Your app does'})).toBeVisible();
    await end(page);
    expect(errors).toEqual([]);
  });
}
