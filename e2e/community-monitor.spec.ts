import {test, expect, type Page} from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';
import {settled, a11yReport} from './axe';

const CATEGORIES = ['Quality of life', 'Service delivery', 'Governance and trust'];

test('community monitor follows the real admin: four sections, a quarter picker and the survey link', async ({page}) => {
  await page.goto('/backoffice/#/community-monitor');
  await expect(page.getByRole('heading', {level: 1, name: 'Community monitor'})).toBeVisible();
  const tabs = page.getByRole('tablist', {name: 'Community monitor sections'});
  for (const t of ['Live monitor', 'Participants', 'Reports', 'Settings']) {
    await expect(tabs.getByRole('tab', {name: t})).toBeVisible();
  }
  await expect(page.getByRole('button', {name: /Quarter/})).toContainText('Q4 2026');
  await expect(page.getByRole('button', {name: 'Next quarter'})).toBeDisabled();
  await page.getByRole('button', {name: 'Previous quarter'}).click();
  await expect(page.getByRole('button', {name: /Quarter/})).toContainText('Q3 2026');
  await expect(page.getByRole('button', {name: 'View survey'})).toBeVisible();
});

test('live monitor: health score and three category scores, over time, then every question by category', async ({page}) => {
  await page.goto('/backoffice/#/community-monitor');
  await expect(page.locator('.gv-kpi')).toHaveCount(4);
  await expect(page.locator('.gv-kpi', {hasText: 'Health score'})).toContainText('/ 5');
  for (const c of CATEGORIES) await expect(page.locator('.gv-kpi', {hasText: c})).toBeVisible();
  await expect(page.getByRole('heading', {level: 3, name: 'Health score over time'})).toBeVisible();
  await expect(page.getByRole('img', {name: /^Line chart, Q1 2025 to Q4 2026/})).toBeVisible();
  for (const c of CATEGORIES) await expect(page.getByRole('heading', {level: 3, name: c, exact: true})).toBeVisible();
  // The real admin's eleven sentiment questions, numbered across the categories.
  await expect(page.locator('.gv-bar-row')).toHaveCount(11);
  await expect(page.locator('.gv-bar-row', {hasText: '1. The city as a place to live'})).toContainText('/ 5');
  await expect(page.locator('.gv-bar-row', {hasText: '11. Transparency'})).toBeVisible();
  // Answer distribution for one question at a time.
  const answers = page.getByRole('region', {name: 'Answers per question'});
  await expect(answers.getByRole('listitem').filter({hasText: /\d+%$/})).toHaveCount(5);
  await expect(answers).toContainText('Very satisfied');
});

test('participants, reports and settings tabs', async ({page}) => {
  await page.goto('/backoffice/#/community-monitor');
  const tabs = page.getByRole('tablist', {name: 'Community monitor sections'});

  await tabs.getByRole('tab', {name: 'Participants'}).click();
  await expect(page.getByRole('heading', {level: 3, name: 'Respondents over time'})).toBeVisible();
  await expect(page.getByRole('heading', {level: 2, name: 'Who is answering'})).toBeVisible();
  await expect(page.locator('.gv-dashboard-demographic')).toHaveCount(3);
  await expect(page.getByRole('note')).toContainText('fewer than 5');

  await tabs.getByRole('tab', {name: 'Reports'}).click();
  await expect(page.getByRole('button', {name: 'Create report'})).toBeVisible();
  await expect(page.locator('.gv-card', {hasText: 'Q3 2026 results'})).toBeVisible();

  // Settings now splits into the real admin's four sub-tabs, one card group each (was: four cards on one screen).
  await tabs.getByRole('tab', {name: 'Settings'}).click();
  const sub = page.getByRole('tablist', {name: 'Settings sections'});
  await expect(page.locator('.gv-card', {hasText: 'Survey'}).first()).toBeVisible();
  await expect(page.getByRole('switch', {name: 'Open for responses'})).toBeChecked();
  await sub.getByRole('tab', {name: 'Popup'}).click();
  await expect(page.locator('.gv-card', {hasText: 'Popup settings'})).toBeVisible();
  await expect(page.getByRole('textbox', {name: 'Popup frequency (0 to 100)'})).toHaveValue('100');
  await sub.getByRole('tab', {name: 'Access rights'}).click();
  await expect(page.locator('.gv-card', {hasText: 'Access and user data'})).toBeVisible();
  await expect(page.getByRole('switch', {name: 'Anonymize all user data'})).not.toBeChecked();
  await sub.getByRole('tab', {name: 'Managers'}).click();
  await expect(page.locator('.gv-card', {hasText: 'Management'})).toBeVisible();
});

test('community monitor has no gaps left', async ({page}) => {
  await page.goto('/backoffice/#/community-monitor');
  await expect(page.locator('[data-gap]')).toHaveCount(0);
});

test('the quarter picker shows only on the results sections', async ({page}) => {
  await page.goto('/backoffice/#/community-monitor');
  const tabs = page.getByRole('tablist', {name: 'Community monitor sections'});
  await tabs.getByRole('tab', {name: 'Participants'}).click();
  await expect(page.getByRole('button', {name: 'Previous quarter'})).toBeVisible();
  await tabs.getByRole('tab', {name: 'Reports'}).click();
  await expect(page.getByRole('button', {name: 'Previous quarter'})).toHaveCount(0);
  await expect(page.getByRole('button', {name: 'View survey'})).toBeVisible();
});

// ── The first clicks: every button on the monitor opens something ──

async function axeOn(page: Page, selector: string) {
  await settled(page);
  const r = await new AxeBuilder({page}).include(selector).withTags(['wcag2a', 'wcag2aa', 'wcag21aa', 'wcag22aa']).analyze();
  return r.violations.map(v => v.id);
}

async function openSettings(page: Page, sub: string) {
  await page.goto('/backoffice/#/community-monitor');
  await page.getByRole('tablist', {name: 'Community monitor sections'}).getByRole('tab', {name: 'Settings'}).click();
  await page.getByRole('tablist', {name: 'Settings sections'}).getByRole('tab', {name: sub}).click();
}

test('settings has the real admin\'s four sub-tabs', async ({page}) => {
  await openSettings(page, 'Survey');
  const sub = page.getByRole('tablist', {name: 'Settings sections'});
  for (const t of ['Survey', 'Popup', 'Access rights', 'Managers']) await expect(sub.getByRole('tab', {name: t})).toBeVisible();
  await sub.getByRole('tab', {name: 'Access rights'}).click();
  await expect(page.getByRole('radiogroup', {name: 'Who can take the survey?'})).toBeVisible();
});

test('View survey opens the survey as residents see it, and passes axe', async ({page}) => {
  await page.goto('/backoffice/#/community-monitor');
  await page.getByRole('button', {name: 'View survey'}).click();
  const dialog = page.getByRole('dialog', {name: 'Community monitor survey'});
  await expect(dialog).toBeVisible();
  await expect(dialog).toContainText('1. The city as a place to live');
  await expect(dialog).toContainText('11. Transparency');
  a11yReport(await axeOn(page, '.gv-modal'));
  await dialog.getByRole('button', {name: 'Close'}).first().click();
  await expect(dialog).toHaveCount(0);
});

test('Create report adds a draft report', async ({page}) => {
  await page.goto('/backoffice/#/community-monitor');
  await page.getByRole('tab', {name: 'Reports'}).click();
  await page.getByRole('button', {name: 'Create report'}).click();
  const dialog = page.getByRole('dialog', {name: 'Create a report'});
  await expect(dialog).toBeVisible();
  a11yReport(await axeOn(page, '.gv-modal'));
  await dialog.getByRole('textbox', {name: 'Report title'}).fill('Parks check-in');
  await dialog.getByRole('button', {name: 'Create'}).click();
  await expect(dialog).toHaveCount(0);
  await expect(page.locator('.gv-card', {hasText: 'Parks check-in'})).toContainText('Draft');
});

test('a report card opens its report', async ({page}) => {
  await page.goto('/backoffice/#/community-monitor');
  await page.getByRole('tab', {name: 'Reports'}).click();
  await page.getByRole('button', {name: 'Open Q3 2026 results'}).click();
  const dialog = page.getByRole('dialog', {name: 'Q3 2026 results'});
  await expect(dialog.locator('.gv-kpi', {hasText: 'Health score'})).toBeVisible();
  await expect(dialog).toContainText('Respondents');
  a11yReport(await axeOn(page, '.gv-modal'));
});

test('Edit survey opens the questions to edit, and saving says so', async ({page}) => {
  await openSettings(page, 'Survey');
  await page.getByRole('button', {name: 'Edit survey'}).click();
  const dialog = page.getByRole('dialog', {name: 'Edit survey'});
  await expect(dialog.getByRole('textbox', {name: 'Question 1', exact: true})).toHaveValue('The city as a place to live');
  a11yReport(await axeOn(page, '.gv-modal'));
  await dialog.getByRole('textbox', {name: 'Question 1', exact: true}).fill('The town as a place to live');
  await dialog.getByRole('button', {name: 'Save'}).click();
  await expect(dialog).toHaveCount(0);
  await expect(page.getByRole('status').filter({hasText: 'Survey saved'})).toBeVisible();
});

test('Import answers opens a drop zone', async ({page}) => {
  await openSettings(page, 'Survey');
  await page.getByRole('button', {name: 'Import answers'}).click();
  const dialog = page.getByRole('dialog', {name: 'Import answers'});
  await expect(dialog.getByRole('button', {name: 'browse'})).toBeVisible();
  await expect(dialog.getByRole('button', {name: 'Download the template'})).toBeVisible();
  a11yReport(await axeOn(page, '.gv-modal'));
});

test('Add a manager picks someone and adds them', async ({page}) => {
  await openSettings(page, 'Managers');
  await expect(page.locator('.gv-pill')).toHaveCount(3);
  await page.getByRole('button', {name: 'Add a manager'}).click();
  const dialog = page.getByRole('dialog', {name: 'Add a manager'});
  a11yReport(await axeOn(page, '.gv-modal'));
  await dialog.getByRole('button', {name: /Person/}).click();
  await page.getByRole('option', {name: 'Admin D'}).click();
  await dialog.getByRole('button', {name: 'Add'}).click();
  await expect(dialog).toHaveCount(0);
  await expect(page.locator('.gv-pill')).toHaveCount(4);
  await expect(page.locator('.gv-pill', {hasText: 'Admin D'})).toBeVisible();
});
