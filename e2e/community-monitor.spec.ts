import {test, expect} from '@playwright/test';

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

  await tabs.getByRole('tab', {name: 'Settings'}).click();
  for (const t of ['Survey', 'Popup settings', 'Access and user data', 'Management']) {
    await expect(page.locator('.gv-card', {hasText: t}).first()).toBeVisible();
  }
  await expect(page.getByRole('switch', {name: 'Open for responses'})).toBeChecked();
  await expect(page.getByRole('switch', {name: 'Anonymize all user data'})).not.toBeChecked();
  await expect(page.getByRole('textbox', {name: 'Popup frequency (0 to 100)'})).toHaveValue('100');
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
