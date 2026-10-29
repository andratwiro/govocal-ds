import {test, expect} from '@playwright/test';

test('reporting follows the real admin: report list with search and report tabs', async ({page}) => {
  await page.goto('/backoffice/#/reporting');
  await expect(page.getByRole('heading', {level: 1, name: 'Reporting'})).toBeVisible();
  await expect(page.getByRole('button', {name: 'Create a report'}).first()).toBeVisible();
  await expect(page.getByRole('searchbox', {name: 'Search reports'})).toBeVisible();
  const tabs = page.getByRole('tablist', {name: 'Reports'});
  for (const t of [/^Your reports/, /^All reports/, /^Progress reports/]) await expect(tabs.getByRole('tab', {name: t})).toBeVisible();
  await expect(tabs.getByRole('tab', {name: /^All reports/})).toHaveAttribute('aria-selected', 'true');
  const table = page.getByRole('grid', {name: 'All reports'});
  for (const c of ['Report', 'Created', 'Last edited']) await expect(table.getByRole('columnheader', {name: c, exact: true})).toBeVisible();
  await expect(table.getByText(/Modified \d+ days? ago/).first()).toBeVisible();
});

test('search filters the list, and an empty search says so', async ({page}) => {
  await page.goto('/backoffice/#/reporting');
  const table = page.getByRole('grid', {name: 'All reports'});
  const before = await table.getByRole('row').count();
  await page.getByRole('searchbox', {name: 'Search reports'}).fill('survey');
  await expect.poll(() => table.getByRole('row').count()).toBeLessThan(before);
  await page.getByRole('searchbox', {name: 'Search reports'}).fill('zzz no match');
  await expect(page.getByText('No reports match your search.')).toBeVisible();
});

test('progress reports explain who makes them; each row has edit, duplicate and delete', async ({page}) => {
  await page.goto('/backoffice/#/reporting');
  await page.getByRole('tab', {name: /^Progress reports/}).click();
  await expect(page.getByRole('note').filter({hasText: 'created by your Go Vocal success manager'})).toBeVisible();
  await page.getByRole('tab', {name: /^All reports/}).click();
  const table = page.getByRole('grid', {name: 'All reports'});
  const rows = await table.getByRole('row').count();
  await page.getByRole('button', {name: /^Actions for Bike lanes survey results/}).click();
  for (const m of ['Edit', 'Duplicate', 'Delete']) await expect(page.getByRole('menuitem', {name: m})).toBeVisible();
  await page.getByRole('menuitem', {name: 'Delete'}).click();
  await expect(table.getByRole('row')).toHaveCount(rows - 1);
});

test('editing a report opens the slide deck builder (the prototype)', async ({page}) => {
  await page.goto('/backoffice/#/reporting');
  const builder = page.getByRole('region', {name: /^Report builder:/});
  await expect(builder).toBeVisible();
  await expect(builder.getByRole('listbox', {name: 'Slides'})).toBeVisible();
  await expect(builder.getByRole('button', {name: 'Next slide'})).toBeVisible();
  await expect(builder.getByRole('button', {name: 'Present'})).toBeVisible();
  await expect(builder.getByRole('button', {name: 'Save'})).toBeVisible();
  await builder.getByRole('button', {name: 'Share'}).click();
  for (const m of ['Share as web link', 'Print to PDF']) await expect(page.getByRole('menuitem', {name: m})).toBeVisible();
  await page.keyboard.press('Escape');
  await builder.getByRole('option', {name: /Momentum over time/}).click();
  await expect(builder.getByRole('img', {name: /Participants/}).first()).toBeVisible();
});

test('creating a report starts blank: title, template, contents, then the deck', async ({page}) => {
  await page.goto('/backoffice/#/reporting');
  await page.getByRole('button', {name: 'Create a report'}).first().click();
  const builder = page.getByRole('region', {name: /^Report builder:/});
  await expect(builder.getByRole('textbox', {name: 'Report title'})).toBeVisible();
  const tpl = builder.getByRole('radiogroup', {name: 'Report template'});
  for (const t of ['Start blank', 'Use a template', 'Create with AI']) await expect(tpl.getByRole('radio', {name: new RegExp(`^${t}`)})).toBeVisible();
  await expect(builder.getByRole('checkbox', {name: /Participation totals/})).toBeChecked();
  await expect(builder.getByRole('radiogroup', {name: 'Number of slides'})).toBeVisible();
  await tpl.getByText('Create with AI').click();
  await expect(tpl.getByRole('radio', {name: /^Create with AI/})).toBeChecked();
  await builder.getByRole('button', {name: 'Create report'}).click();
  await expect(builder.getByText('Built by Go Vocal AI')).toBeVisible();
  await expect(builder.getByRole('textbox', {name: 'Refine the report'})).toBeVisible();
});

test('reporting names what the system still lacks', async ({page}) => {
  await page.goto('/backoffice/#/reporting');
  const gaps = await page.locator('[data-gap]').evaluateAll(els => [...new Set(els.map(e => e.getAttribute('data-gap')))]);
  expect(gaps).toEqual(expect.arrayContaining(['Slide stage']));
});
