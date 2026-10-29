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

// Was: Gap markers for StatCard, Chart · Line, Dashboard card and KPI. The gv Kpi, Chart and Card now cover them.
test('dashboard is built from the gv cards, KPI tiles and charts, with no gaps left', async ({page}) => {
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
  await expect(page.getByRole('listitem').filter({hasText: /^Under consideration/})).toContainText('15% · 59');
  await expect(page.getByRole('link', {name: /Waiting for feedback/})).toHaveAttribute('href', '#/inputs');
  await expect(page.getByRole('region', {name: 'Events'})).toContainText('Upcoming3');
  await expect(page.locator('[data-gap]')).toHaveCount(0);
});

// ── The first clicks: tabs as routes, the date preset, the metric selects, downloads, the project filter ──

test('dashboard tabs are routes: a click changes the URL, a URL opens its tab', async ({page}) => {
  await page.goto('/backoffice/#/dashboard');
  const tabs = page.getByRole('tablist', {name: 'Dashboard sections'});
  await tabs.getByRole('tab', {name: 'Users'}).click();
  await expect(page).toHaveURL(/#\/dashboard\/users$/);
  await expect(tabs.getByRole('tab', {name: 'Users'})).toHaveAttribute('aria-selected', 'true');
  await expect(page.getByRole('link', {name: 'Dashboard'})).toHaveAttribute('aria-current', 'page');
  await page.goto('/backoffice/#/dashboard/visitors');
  await expect(tabs.getByRole('tab', {name: 'Visitors'})).toHaveAttribute('aria-selected', 'true');
  await tabs.getByRole('tab', {name: 'Overview'}).click();
  await expect(page).toHaveURL(/#\/dashboard(\/overview)?$/);
  await expect(page.getByRole('heading', {level: 2, name: 'People'})).toBeVisible();
});

test('users tab: participants over time and who they are', async ({page}) => {
  await page.goto('/backoffice/#/dashboard/users');
  await expect(page.locator('.gv-kpi')).toHaveCount(3);
  for (const title of ['Participants timeline', 'Gender', 'Age', 'Area', 'Education']) {
    await expect(page.getByRole('heading', {level: 3, name: title, exact: true})).toBeVisible();
  }
  await expect(page.getByRole('img', {name: /^Line chart/})).toBeVisible();
  await expect(page.getByText(/Shallow section/)).toHaveCount(0);
});

test('visitors tab: four KPIs, visitors over time, sources, languages and devices', async ({page}) => {
  await page.goto('/backoffice/#/dashboard/visitors');
  for (const k of ['Visitors', 'Visits', 'Visit duration', 'Pageviews per visit']) {
    await expect(page.locator('.gv-kpi', {hasText: k}).first()).toBeVisible();
  }
  for (const title of ['Visitors over time', 'Traffic sources', 'Language', 'Device types']) {
    await expect(page.getByRole('heading', {level: 3, name: title, exact: true})).toBeVisible();
  }
});

test('representativeness tab: users against the reference population, per field', async ({page}) => {
  await page.goto('/backoffice/#/dashboard/representativeness');
  await expect(page.locator('.gv-kpi', {hasText: 'Representativeness score'})).toContainText('%');
  for (const title of ['Gender', 'Age', 'Area']) {
    await expect(page.getByRole('heading', {level: 3, name: title, exact: true})).toBeVisible();
  }
  await expect(page.getByRole('region', {name: 'Gender'})).toContainText('Reference population');
});

test('participation feed: a list of new activity, filtered by viewed or not', async ({page}) => {
  await page.goto('/backoffice/#/dashboard/participation-feed');
  const rows = page.getByRole('grid', {name: 'Participation feed'}).getByRole('row');
  await expect(rows).toHaveCount(7); // header + 6 not yet viewed
  await page.getByRole('radio', {name: 'Viewed', exact: true}).click();
  await expect(rows).toHaveCount(4);
  await page.getByRole('radio', {name: 'Not yet viewed'}).click();
  await rows.nth(1).getByRole('button', {name: /Mark as viewed/}).click();
  await expect(rows).toHaveCount(6);
});

test('management feed: who changed what, filtered by action', async ({page}) => {
  await page.goto('/backoffice/#/dashboard/management-feed');
  const table = page.getByRole('grid', {name: 'Management feed'});
  await expect(table.getByRole('columnheader')).toHaveText(['Date', 'User', 'Item', 'Action']);
  await expect(table.getByRole('row')).toHaveCount(9);
  await page.getByRole('button', {name: /Action$/}).click();
  await page.getByRole('option', {name: 'Created'}).click();
  await expect(table.getByRole('row')).toHaveCount(3);
});

test('the date preset menu changes its label', async ({page}) => {
  await page.goto('/backoffice/#/dashboard');
  const preset = page.getByRole('button', {name: /Date preset/});
  await expect(preset).toContainText('All Time');
  await preset.click();
  for (const p of ['Previous week', 'Last 30 days', 'Last 90 days', 'Last year', 'Custom']) {
    await expect(page.getByRole('menuitemradio', {name: p})).toBeVisible();
  }
  await page.getByRole('menuitemradio', {name: 'Last 90 days'}).click();
  await expect(preset).toContainText('Last 90 days');
});

test('the per-project and per-tag cards switch metric', async ({page}) => {
  await page.goto('/backoffice/#/dashboard');
  const card = page.getByRole('region', {name: 'Participation per project'});
  await expect(card.locator('.gv-bar-row').first()).toContainText('214');
  await card.getByRole('button', {name: /Metric/}).click();
  await page.getByRole('option', {name: 'Comments'}).click();
  await expect(card.getByRole('button', {name: /Metric/})).toContainText('Comments');
  await expect(card.locator('.gv-bar-row').first()).toContainText('603');
  await expect(page.getByRole('listbox')).toHaveCount(0);
  const tags = page.getByRole('region', {name: 'Participation per tag'});
  await tags.getByRole('button', {name: /Metric/}).click();
  await page.getByRole('option', {name: 'Reactions'}).click();
  await expect(tags.getByRole('button', {name: /Metric/})).toContainText('Reactions');
});

test('input status leads to the input manager', async ({page}) => {
  await page.goto('/backoffice/#/dashboard');
  await page.getByRole('link', {name: /Go to Input Manager/}).click();
  await expect(page).toHaveURL(/#\/inputs$/);
});

test('a download icon opens CSV / XLSX and confirms with a toast', async ({page}) => {
  await page.goto('/backoffice/#/dashboard');
  await page.getByRole('button', {name: 'Download registrations and participants data'}).click();
  await expect(page.getByRole('menuitem', {name: 'XLSX'})).toBeVisible();
  await page.getByRole('menuitem', {name: 'CSV'}).click();
  const toast = page.getByRole('alertdialog').or(page.locator('.react-aria-Toast'));
  await expect(toast.first()).toContainText('Download started');
  await expect(toast.first()).toContainText('registrations-and-participants.csv');
});

test('the project select filters the KPIs', async ({page}) => {
  await page.goto('/backoffice/#/dashboard');
  const part = page.locator('.gv-kpi', {hasText: 'Participants'});
  await expect(part).toContainText('873');
  await page.getByRole('button', {name: /Project$/}).click();
  await page.getByRole('option', {name: 'Safer School Streets'}).click();
  await expect(part).not.toContainText('873');
  await expect(page.locator('.gv-kpi', {hasText: 'Inputs'})).toContainText('131');
  // Registrations are platform-wide in the real admin: a project does not narrow them.
  await expect(page.locator('.gv-kpi', {hasText: 'Registrations'})).toContainText('1,284');
});
