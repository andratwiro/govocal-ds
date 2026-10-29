import {test, expect} from '@playwright/test';

const TOOLS: [string, string][] = [
  ['Online deliberation workshops', 'Manage workshops'],
  ['Esri integration', 'Enable Esri'],
  ['Widget', 'Manage widget'],
  ['Public API access', 'Manage API keys'],
  ['Webhooks', 'Manage webhooks'],
  ['Power BI', 'Download templates'],
  ['MCP authorizations', 'Manage authorizations']
];

test('tools follows the real admin: one card per tool, each with its action', async ({page}) => {
  await page.goto('/backoffice/#/tools');
  await expect(page.getByRole('heading', {level: 1, name: 'Tools'})).toBeVisible();
  const gallery = page.getByRole('list', {name: 'Tools'});
  await expect(gallery.getByRole('listitem')).toHaveCount(TOOLS.length);
  for (const [title, action] of TOOLS) {
    const card = gallery.getByRole('listitem').filter({has: page.getByRole('heading', {level: 3, name: title, exact: true})});
    await expect(card).toBeVisible();
    await expect(card.getByRole('button', {name: action})).toBeVisible();
    await expect(card.getByRole('button', {name: `Help: ${title}`})).toBeVisible();
  }
});

test('workshops has a learn-more link, and a tool outside the plan is locked', async ({page}) => {
  await page.goto('/backoffice/#/tools');
  const items = page.getByRole('list', {name: 'Tools'}).getByRole('listitem');
  const workshops = items.filter({hasText: 'Online deliberation workshops'});
  await expect(workshops.getByRole('link', {name: 'Learn more'})).toBeVisible();
  const powerBi = items.filter({hasText: 'Power BI'});
  await expect(powerBi.getByText('Not in your plan')).toBeVisible();
  await expect(powerBi.getByRole('button', {name: 'Download templates'})).toBeDisabled();
  await expect(items.filter({hasText: 'Esri integration'}).getByText('Not connected')).toBeVisible();
});

test('tools names what the system still lacks', async ({page}) => {
  await page.goto('/backoffice/#/tools');
  const gaps = await page.locator('[data-gap]').evaluateAll(els => [...new Set(els.map(e => e.getAttribute('data-gap')))]);
  expect(gaps).toEqual(expect.arrayContaining(['Tool illustration']));
});
