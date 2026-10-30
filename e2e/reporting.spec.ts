import {test, expect} from '@playwright/test';
import {axeViolations, a11yReport} from './axe';
import {headingJumps} from './headings';

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
  // Both dates in the app's locale, one format (en-GB): "27 Oct 2026", "28 Oct 2026".
  await expect(table.getByRole('row', {name: /Larkvale park renewal/})).toContainText('27 Oct 2026');
  await expect(table.getByRole('row', {name: /Larkvale park renewal/})).toContainText('28 Oct 2026');
  // Each tab is a Panel (title, description), its count and search in the Table toolbar, Pagination in its foot.
  await expect(tabs.getByRole('tab', {name: 'All reports (13)'})).toBeVisible();
  const panel = page.getByRole('tabpanel', {name: /^All reports/});
  await expect(panel.getByRole('heading', {level: 2, name: 'All reports'})).toBeVisible();
  await expect(panel.getByRole('heading', {level: 3, name: '13 reports'})).toBeVisible();
  await expect(table.getByRole('row')).toHaveCount(11);
  const pages = panel.getByRole('navigation', {name: 'Report pages'});
  await pages.getByRole('button', {name: /2/}).click();
  await expect(table.getByRole('row')).toHaveCount(4);
});

test('search filters the list, and an empty search says so', async ({page}) => {
  await page.goto('/backoffice/#/reporting');
  const table = page.getByRole('grid', {name: 'All reports'});
  const before = await table.getByRole('row').count();
  await page.getByRole('searchbox', {name: 'Search reports'}).fill('survey');
  await expect.poll(() => table.getByRole('row').count()).toBeLessThan(before);
  await expect(page.getByRole('heading', {level: 3, name: /^\d reports?$/})).toBeVisible();
  await page.getByRole('searchbox', {name: 'Search reports'}).fill('zzz no match');
  // No match is the Empty state in the Panel body, with no table under it.
  await expect(page.getByRole('heading', {level: 3, name: 'No reports match'})).toBeVisible();
  await expect(table).toHaveCount(0);
});

test('progress reports explain who makes them; each row has edit, duplicate and delete', async ({page}) => {
  await page.goto('/backoffice/#/reporting');
  await page.getByRole('tab', {name: /^Progress reports/}).click();
  await expect(page.getByRole('note').filter({hasText: 'created by your Go Vocal success manager'})).toBeVisible();
  await page.getByRole('tab', {name: /^All reports/}).click();
  const table = page.getByRole('grid', {name: 'All reports'});
  const count = page.getByRole('tabpanel', {name: /^All reports/}).getByRole('heading', {level: 3, name: / reports$/});
  await expect(count).toHaveText('13 reports');
  await page.getByRole('button', {name: /^Actions for Bike lanes survey results/}).click();
  // Menu items carry their icons in the icon slot; Delete sits after a separator.
  for (const m of ['Edit', 'Duplicate', 'Delete']) await expect(page.getByRole('menuitem', {name: m})).toBeVisible();
  await expect(page.getByRole('menu').locator('.gv-menu-icon')).toHaveCount(3);
  await expect(page.getByRole('menu').getByRole('separator')).toHaveCount(1);
  // Delete asks first in an Alert dialog, then says so in a Toast with Undo.
  await page.getByRole('menuitem', {name: 'Delete'}).click();
  const confirm = page.getByRole('alertdialog', {name: 'Delete this report?'});
  await expect(confirm).toBeVisible();
  await confirm.getByRole('button', {name: 'Delete report'}).click();
  await expect(count).toHaveText('12 reports');
  await expect(table.getByRole('row', {name: /Bike lanes survey results/})).toHaveCount(0);
  await expect(page.getByRole('tab', {name: 'All reports (12)'})).toBeVisible();
  const toast = page.locator('.react-aria-Toast').filter({hasText: 'Report deleted'});
  await toast.getByRole('button', {name: 'Undo'}).click();
  await expect(count).toHaveText('13 reports');
  // Duplicate is instant, with Undo.
  await page.getByRole('button', {name: /^Actions for Bike lanes survey results/}).click();
  await page.getByRole('menuitem', {name: 'Duplicate'}).click();
  await expect(table.getByRole('row', {name: /Bike lanes survey results \(copy\)/})).toBeVisible();
  await expect(count).toHaveText('14 reports');
  await page.locator('.react-aria-Toast').filter({hasText: 'Report duplicated'}).getByRole('button', {name: 'Undo'}).click();
  await expect(count).toHaveText('13 reports');
});

test('editing a report opens the report view (outline, pages, side panel)', async ({page}) => {
  await page.goto('/backoffice/#/reporting');
  await page.getByRole('tab', {name: /^All reports/}).click();
  await page.getByRole('button', {name: /^Actions for Bike lanes survey results/}).click();
  await page.getByRole('menuitem', {name: 'Edit'}).click();
  await expect(page).toHaveURL(/#\/reporting\/report-builder\/r2\/editor$/);
  await expect(page.getByRole('heading', {level: 1, name: 'Bike lanes survey results'})).toBeVisible();
  await expect(page.getByRole('treegrid', {name: 'Report outline'})).toBeVisible();
  await expect(page.getByRole('region', {name: 'Report pages'})).toBeVisible();
  await expect(page.getByRole('region', {name: 'Assistant'})).toBeVisible();
});

test('creating a report starts blank: title, template, contents, then the report view', async ({page}) => {
  await page.goto('/backoffice/#/reporting');
  await page.getByRole('button', {name: 'Create a report'}).first().click();
  // The start screen is a wide Modal: the template as Choice cards in a RadioGroup, the contents as checkbox cards.
  const builder = page.getByRole('dialog', {name: 'Create a report'});
  await expect(builder.getByRole('textbox', {name: 'Report title'})).toBeFocused();
  await expect(builder.getByRole('textbox', {name: 'Report title'})).toBeVisible();
  const tpl = builder.getByRole('radiogroup', {name: 'Report template'});
  for (const t of ['Start blank', 'Use a template', 'Create with AI']) await expect(tpl.getByRole('radio', {name: new RegExp(`^${t}`)})).toBeVisible();
  await expect(builder.getByRole('checkbox', {name: /Participation totals/})).toBeChecked();
  // The Choice card's radio tiles and its "Checkbox group with group headings": the contents under three headings.
  await expect(tpl.locator('.gv-choice-card')).toHaveCount(3);
  await expect(tpl.getByRole('radio', {name: /^Use a template/})).toBeChecked();
  const contents = builder.getByRole('group', {name: 'Report contents'});
  await expect(contents.getByRole('checkbox')).toHaveCount(8);
  await expect(contents.locator('.gv-choice-card')).toHaveCount(8);
  for (const h of ['Project context', 'Participation', 'Results']) {
    await expect(contents.getByText(h, {exact: true})).toBeVisible();
  }
  await contents.getByText('Demographics').click();
  await expect(contents.getByRole('checkbox', {name: /Demographics/})).toBeChecked();
  a11yReport(await axeViolations(page, '[role="dialog"]'));
  await expect(builder.getByRole('radiogroup', {name: 'Length'})).toBeVisible();
  await tpl.getByText('Create with AI').click();
  await expect(tpl.getByRole('radio', {name: /^Create with AI/})).toBeChecked();
  await builder.getByRole('button', {name: 'Create report'}).click();
  // The new report opens in the report view, and the assistant offers to write it.
  await expect(page).toHaveURL(/#\/reporting\/report-builder\/new\/editor$/);
  await expect(page.getByRole('dialog', {name: 'Generate the report'})).toBeVisible();
});

test('the Create a report dialog cancels back to the list', async ({page}) => {
  await page.goto('/backoffice/#/reporting');
  await page.getByRole('button', {name: 'Create a report'}).first().click();
  const dialog = page.getByRole('dialog', {name: 'Create a report'});
  await dialog.getByRole('button', {name: 'Cancel'}).click();
  await expect(dialog).toHaveCount(0);
  await expect(page).toHaveURL(/#\/reporting$/);
});

test('the report list has no gaps; the report view names its own (e2e/report-view.spec.ts)', async ({page}) => {
  await page.goto('/backoffice/#/reporting');
  await expect(page.locator('[data-missing-part]')).toHaveCount(0);
  await page.goto('/backoffice/#/reporting/report-builder/r2/editor');
  await expect(page.getByRole('region', {name: 'Report pages'})).toBeVisible();
  const gaps = await page.locator('[data-missing-part]').evaluateAll(els => [...new Set(els.map(e => e.getAttribute('data-missing-part')))]);
  expect(gaps).toEqual(['Map']);
  expect(gaps).not.toContain('Slide stage');
});

// ── The first clicks (shallow) ──────────────────────────────────────────────

test('a report row opens the report view: Download answers, the crumb goes back', async ({page}) => {
  await page.goto('/backoffice/#/reporting');
  await page.getByRole('grid', {name: 'All reports'}).getByRole('row', {name: /Bike lanes survey results/}).getByText('14 Oct 2026').click();
  await expect(page).toHaveURL(/#\/reporting\/report-builder\/r2\/editor$/);
  await expect(page.getByRole('heading', {level: 1, name: 'Bike lanes survey results'})).toBeVisible();
  await page.getByRole('button', {name: 'Download'}).click();
  await page.getByRole('menuitem', {name: 'PDF'}).click();
  await expect(page.locator('.react-aria-Toast').first()).toContainText('Bike lanes survey results.pdf');
  await page.getByRole('navigation', {name: 'Breadcrumbs'}).getByRole('link', {name: 'Reporting'}).click();
  await expect(page).toHaveURL(/#\/reporting$/);
});

test('the reporting pages keep their headings in order (h1 → h2 → h3)', async ({page}) => {
  for (const route of ['reporting', 'reporting/report-builder/r2/editor']) {
    await page.goto(`/backoffice/#/${route}`);
    await expect(page.getByRole('heading', {level: 1})).toBeVisible();
    expect(await headingJumps(page), route).toEqual([]);
  }
});
