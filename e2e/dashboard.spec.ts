import {test, expect} from '@playwright/test';

test('dashboard follows the real admin: six sections, filters, three groups of cards', async ({page}) => {
  await page.goto('/backoffice/#/dashboard');
  await expect(page.getByRole('heading', {level: 1, name: 'Dashboard'})).toBeVisible();
  const tabs = page.getByRole('tablist', {name: 'Dashboard sections'});
  for (const t of ['Overview', 'Users', 'Visitors', 'Representativeness', 'Participation feed', 'Management feed']) {
    await expect(tabs.getByRole('tab', {name: t})).toBeVisible();
  }
  await expect(page.getByRole('radiogroup', {name: 'Resolution'})).toBeVisible();
  await expect(page.getByRole('heading', {level: 2, name: 'People'})).toBeVisible();
  await expect(page.getByRole('heading', {level: 2, name: 'Projects and participation'})).toBeVisible();
  await expect(page.getByRole('heading', {level: 2, name: 'Management'})).toBeVisible();
  await expect(page.getByRole('meter', {name: 'Feedback given'})).toBeVisible();
});

test('dashboard names what the system still lacks', async ({page}) => {
  await page.goto('/backoffice/#/dashboard');
  const gaps = await page.locator('[data-gap]').evaluateAll(els => [...new Set(els.map(e => e.getAttribute('data-gap')))]);
  expect(gaps).toEqual(expect.arrayContaining(['StatCard', 'Chart · Line', 'Dashboard card', 'KPI']));
});
