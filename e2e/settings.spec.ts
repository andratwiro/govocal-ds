import {test, expect} from '@playwright/test';

test('settings follows the real admin: seven tabs, General open on its five sections', async ({page}) => {
  await page.goto('/backoffice/#/settings');
  await expect(page.getByRole('heading', {level: 1, name: 'Settings'})).toBeVisible();
  const tabs = page.getByRole('tablist', {name: 'Settings sections'});
  for (const t of ['General', 'Branding', 'Registration', 'Tags', 'Areas', 'Statuses', 'Policies']) {
    await expect(tabs.getByRole('tab', {name: t, exact: true})).toBeVisible();
  }
  await expect(tabs.getByRole('tab', {name: 'General'})).toHaveAttribute('aria-selected', 'true');
  for (const h of ['Platform configuration', 'Content moderation', 'Statistics',
    'User name display (for users with email confirmed only)', 'Project approval settings']) {
    await expect(page.getByRole('heading', {level: 3, name: h, exact: true})).toBeVisible();
  }
  await expect(page.getByRole('textbox', {name: /Name of city or organization/})).toHaveValue('Riverside participates');
  await expect(page.getByRole('group', {name: 'Languages'})).toBeVisible();
  await expect(page.getByRole('textbox', {name: 'Website'})).toBeVisible();
  await expect(page.getByRole('textbox', {name: 'Population'})).toBeVisible();
  await expect(page.getByRole('switch', {name: 'Profanity blocker'})).toBeChecked();
  await expect(page.getByRole('switch', {name: 'Detect inappropriate content'})).toBeChecked();
  await expect(page.getByRole('switch', {name: 'Exclude admins and managers from statistics'})).not.toBeChecked();
  const names = page.getByRole('radiogroup', {name: 'User name display'});
  await expect(names.getByRole('radio', {name: /User/})).toBeChecked();
  await expect(names.getByRole('radio', {name: /Animal/})).not.toBeChecked();
  await expect(page.getByRole('button', {name: /Select approvers/})).toBeVisible();
});

test('the platform name is multilingual: one value per platform language', async ({page}) => {
  await page.goto('/backoffice/#/settings');
  const locales = page.getByRole('radiogroup', {name: 'Language of the name'});
  for (const l of ['EN', 'NL-BE', 'FR-BE']) await expect(locales.getByRole('radio', {name: l})).toBeVisible();
  await locales.getByRole('radio', {name: 'FR-BE'}).click();
  await expect(page.getByRole('textbox', {name: /Name of city or organization/})).toHaveValue('Riverside participe');
  // Turning a language off removes its version of the name.
  await page.getByRole('group', {name: 'Languages'}).getByText('Français (Belgique)').click();
  await expect(locales.getByRole('radio', {name: 'FR-BE'})).toHaveCount(0);
});

test('save stays off until something changes', async ({page}) => {
  await page.goto('/backoffice/#/settings');
  const save = page.getByRole('button', {name: 'Save platform configuration'});
  await expect(save).toBeDisabled();
  await page.getByRole('textbox', {name: 'Website'}).fill('https://riverside.example.org');
  await expect(save).toBeEnabled();
  await save.click();
  await expect(page.getByText('Platform configuration saved')).toBeVisible();
});

test('branding takes a logo through Tali\'s drop zone', async ({page}) => {
  await page.goto('/backoffice/#/settings');
  await page.getByRole('tab', {name: 'Branding'}).click();
  await expect(page.getByRole('heading', {level: 3, name: 'Platform logo', exact: true})).toBeVisible();
  await expect(page.locator('.gv-drop-zone')).toHaveCount(2);
  await expect(page.getByRole('button', {name: 'browse'}).first()).toBeVisible();
});

test('settings is built from the system, with no gaps', async ({page}) => {
  await page.goto('/backoffice/#/settings');
  await expect(page.locator('.gv-card').first()).toBeVisible();
  await expect(page.locator('.gv-title-field')).toBeVisible();
  await expect(page.locator('[data-gap]')).toHaveCount(0);
});
