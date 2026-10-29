import {test, expect, type Page} from '@playwright/test';
import {axeViolations, a11yReport} from './axe';

// Card titles and actions as the real admin words them ("Public API Access", "Manage API Keys",
// "Manage MCP Authorizations"). Power BI now opens its templates page, so the locked example is the workshops,
// which in the real admin lead out of the back office.
const TOOLS: [string, string, string][] = [
  ['Online deliberation workshops', 'Manage workshops', ''],
  ['Esri integration', 'Enable Esri', 'tools/esri-integration'],
  ['Widget', 'Manage widget', 'tools/widgets'],
  ['Public API Access', 'Manage API Keys', 'tools/public-api-tokens'],
  ['Webhooks', 'Manage webhooks', 'tools/webhooks'],
  ['Power BI', 'Download templates', 'tools/power-bi'],
  ['Manage MCP Authorizations', 'Manage authorizations', 'tools/mcp']
];

const card = (page: Page, title: string) => page.getByRole('list', {name: 'Tools'}).getByRole('listitem')
  .filter({has: page.getByRole('heading', {level: 3, name: title, exact: true})});

test('tools follows the real admin: one card per tool, each with its action', async ({page}) => {
  await page.goto('/backoffice/#/tools');
  await expect(page.getByRole('heading', {level: 1, name: 'Tools'})).toBeVisible();
  await expect(page.getByRole('list', {name: 'Tools'}).getByRole('listitem')).toHaveCount(TOOLS.length);
  for (const [title, action] of TOOLS) {
    await expect(card(page, title)).toBeVisible();
    await expect(card(page, title).getByRole('button', {name: action})).toBeVisible();
    await expect(card(page, title).getByRole('button', {name: `Help: ${title}`})).toBeVisible();
  }
});

test('the workshops are locked; learn more and every help icon open a popover', async ({page}) => {
  await page.goto('/backoffice/#/tools');
  const workshops = card(page, 'Online deliberation workshops');
  await expect(workshops.getByText('Not in your plan')).toBeVisible();
  await expect(workshops.getByRole('button', {name: 'Manage workshops'})).toBeDisabled();
  await expect(card(page, 'Esri integration').getByText('Not connected')).toBeVisible();

  await workshops.getByRole('button', {name: 'Learn more'}).click();
  const learn = page.getByRole('dialog', {name: 'Online deliberation workshops'});
  await expect(learn).toBeVisible();
  await expect(learn.getByRole('link')).toHaveCount(0);
  a11yReport(await axeViolations(page, '.gv-help-popover'));
  await page.keyboard.press('Escape');
  await expect(learn).toHaveCount(0);

  for (const [title] of TOOLS) {
    await card(page, title).getByRole('button', {name: `Help: ${title}`}).click();
    const help = page.getByRole('dialog', {name: title});
    await expect(help).toBeVisible();
    await expect(help.locator('p')).not.toBeEmpty();
    await page.keyboard.press('Escape');
    await expect(help).toHaveCount(0);
  }
});

test('every unlocked tool opens its own page, with a way back to Tools', async ({page}) => {
  for (const [title, action, route] of TOOLS.filter(t => t[2])) {
    await page.goto('/backoffice/#/tools');
    await card(page, title).getByRole('button', {name: action}).click();
    await expect(page).toHaveURL(new RegExp(`#/${route}$`));
    await expect(page.getByRole('heading', {level: 1})).toBeVisible();
    await page.getByRole('navigation', {name: 'Breadcrumbs'}).getByRole('link', {name: 'Tools'}).click();
    await expect(page.getByRole('heading', {level: 1, name: 'Tools'})).toBeVisible();
  }
});

test('public API tokens: the list, then Create new token shows the secret once and adds a row', async ({page}) => {
  await page.goto('/backoffice/#/tools/public-api-tokens');
  await expect(page.getByRole('heading', {level: 1, name: 'Public API tokens'})).toBeVisible();
  const table = page.getByRole('grid', {name: 'Public API tokens'});
  for (const c of ['Name', 'Created', 'Last used']) await expect(table.getByRole('columnheader', {name: c})).toBeVisible();
  const rows = table.getByRole('rowgroup').last().getByRole('row');
  await expect(rows).toHaveCount(2);

  await page.getByRole('button', {name: 'Create new token'}).click();
  const modal = page.getByRole('dialog', {name: 'Create a new token'});
  await expect(modal).toBeVisible();
  a11yReport(await axeViolations(page, '.gv-modal'));
  const create = modal.getByRole('button', {name: 'Create token'});
  await expect(create).toBeDisabled();
  await modal.getByRole('textbox', {name: 'Name'}).fill('Open data portal');
  await create.click();
  const done = page.getByRole('dialog', {name: 'Your token has been created'});
  await expect(done.getByText(/You can only copy this secret once/)).toBeVisible();
  await done.getByRole('button', {name: 'Copy secret'}).click();
  await expect(done.getByText('Copied!')).toBeVisible();
  await done.getByRole('button', {name: 'Close', exact: true}).last().click();
  await expect(rows).toHaveCount(3);
  await expect(rows.last()).toContainText('Open data portal');

  await rows.last().getByRole('button', {name: 'Delete token: Open data portal'}).click();
  await expect(rows).toHaveCount(2);
});

test('webhooks: the list, Create webhook adds one, Edit webhook opens it filled in', async ({page}) => {
  await page.goto('/backoffice/#/tools/webhooks');
  await expect(page.getByRole('heading', {level: 1, name: 'Webhooks'})).toBeVisible();
  const table = page.getByRole('grid', {name: 'Webhooks'});
  for (const c of ['Name', 'URL', 'Events', 'Project', 'Enabled']) {
    await expect(table.getByRole('columnheader', {name: c, exact: true})).toBeVisible();
  }
  const rows = table.getByRole('rowgroup').last().getByRole('row');
  await expect(rows).toHaveCount(1);

  await page.getByRole('button', {name: 'Create webhook'}).click();
  const modal = page.getByRole('dialog', {name: 'Create a new webhook'});
  await expect(modal).toBeVisible();
  a11yReport(await axeViolations(page, '.gv-modal'));
  await modal.getByRole('textbox', {name: 'Name'}).fill('Case system');
  await modal.getByRole('textbox', {name: 'URL'}).fill('https://cases.example.org/hook');
  await modal.getByText('idea.created').click();
  await modal.getByRole('button', {name: 'Create webhook'}).click();
  await expect(modal).toHaveCount(0);
  await expect(rows).toHaveCount(2);
  await expect(rows.last()).toContainText('Case system');

  await rows.first().getByRole('button', {name: /^Edit webhook: /}).click();
  const edit = page.getByRole('dialog', {name: 'Edit webhook'});
  await expect(edit.getByRole('textbox', {name: 'Name'})).not.toHaveValue('');
  await edit.getByRole('textbox', {name: 'Name'}).fill('Renamed hook');
  await edit.getByRole('button', {name: 'Update webhook'}).click();
  await expect(rows.first()).toContainText('Renamed hook');
});

test('Esri: Save key stays off until a key is pasted', async ({page}) => {
  await page.goto('/backoffice/#/tools/esri-integration');
  await expect(page.getByRole('heading', {level: 1, name: 'Esri Maps'})).toBeVisible();
  const save = page.getByRole('button', {name: 'Save key'});
  await expect(save).toBeDisabled();
  await page.getByRole('textbox', {name: 'Esri API key'}).fill('invented-key-123');
  await save.click();
  await expect(page.getByText('API key saved')).toBeVisible();
});

test('Power BI: two templates, each with its download', async ({page}) => {
  await page.goto('/backoffice/#/tools/power-bi');
  await expect(page.getByRole('heading', {level: 1, name: 'Power BI templates'})).toBeVisible();
  await expect(page.getByRole('heading', {level: 3, name: 'Report template'})).toBeVisible();
  await expect(page.getByRole('heading', {level: 3, name: 'Dataflow template'})).toBeVisible();
  await page.getByRole('button', {name: 'Download report template'}).click();
  await expect(page.getByRole('status').filter({hasText: 'Report template'})).toBeVisible();
});

test('MCP authorizations: Revoke access asks first, then removes the client', async ({page}) => {
  await page.goto('/backoffice/#/tools/mcp');
  await expect(page.getByRole('heading', {level: 1, name: 'MCP authorizations'})).toBeVisible();
  const rows = page.getByRole('grid', {name: 'MCP authorizations'}).getByRole('rowgroup').last().getByRole('row');
  await expect(rows).toHaveCount(2);
  await rows.first().getByRole('button', {name: /^Revoke access: /}).click();
  const modal = page.getByRole('alertdialog', {name: 'Revoke access?'});
  await expect(modal.getByText(/re-authorized before it can connect again/)).toBeVisible();
  a11yReport(await axeViolations(page, '.gv-alert-dialog'));
  await modal.getByRole('button', {name: 'Revoke access'}).click();
  await expect(rows).toHaveCount(1);
});

test('widget: the settings, with the preview named as a gap', async ({page}) => {
  await page.goto('/backoffice/#/tools/widgets');
  await expect(page.getByRole('heading', {level: 1, name: 'Widget'})).toBeVisible();
  await expect(page.getByRole('textbox', {name: 'Embed code'})).toBeVisible();
});

test('tools names what the system still lacks', async ({page}) => {
  await page.goto('/backoffice/#/tools');
  const gaps = await page.locator('[data-gap]').evaluateAll(els => [...new Set(els.map(e => e.getAttribute('data-gap')))]);
  expect(gaps).toEqual(expect.arrayContaining(['Tool illustration']));
  await page.goto('/backoffice/#/tools/widgets');
  await expect(page.locator('[data-gap="Widget preview"]')).toBeVisible();
});
