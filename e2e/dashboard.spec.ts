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

// Was: Gap markers for StatCard, Chart · Line, Dashboard card and KPI. Tali's Kpi, Chart and Card now cover them.
test('dashboard is built from Tali\'s cards, KPI tiles and charts, with no gaps left', async ({page}) => {
  await page.goto('/backoffice/#/dashboard');
  await expect(page.locator('.gv-kpi', {hasText: 'Registrations'})).toContainText('Last 30 days: +46');
  await expect(page.locator('.gv-kpi')).toHaveCount(5);
  for (const title of ['Registrations and participants', 'Participation over time', 'Participation per project',
    'Participation per tag', 'Input status', 'Events', 'Emails', 'Invitations', 'Internal adoption']) {
    await expect(page.getByRole('heading', {level: 3, name: title, exact: true})).toBeVisible();
    await expect(page.getByRole('button', {name: `Download ${title.toLowerCase()} data`})).toBeVisible();
  }
  await expect(page.getByRole('img', {name: /^Line chart, Mar to Oct/})).toHaveCount(4);
  await expect(page.getByRole('img', {name: /^Inputs per month rose/})).toBeVisible();
  await expect(page.locator('.gv-dashboard-bars__row', {hasText: 'Under consideration'})).toContainText('15% · 59');
  await expect(page.getByRole('link', {name: /Waiting for feedback/})).toHaveAttribute('href', '#/inputs');
  await expect(page.getByRole('region', {name: 'Events'})).toContainText('Upcoming3');
  await expect(page.locator('[data-gap]')).toHaveCount(0);
});
