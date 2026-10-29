import {test, expect, type Page} from '@playwright/test';
import {axeViolations, a11yReport} from './axe';

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
  await expect(page.getByRole('textbox', {name: /Name of city or organization/})).toHaveValue('Larkvale participates');
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
  await expect(page.getByRole('textbox', {name: /Name of city or organization/})).toHaveValue('Larkvale participe');
  // Turning a language off removes its version of the name.
  await page.getByRole('group', {name: 'Languages'}).getByText('Français (Belgique)').click();
  await expect(locales.getByRole('radio', {name: 'FR-BE'})).toHaveCount(0);
});

test('save stays off until something changes', async ({page}) => {
  await page.goto('/backoffice/#/settings');
  const save = page.getByRole('button', {name: 'Save platform configuration'});
  await expect(save).toBeDisabled();
  await page.getByRole('textbox', {name: 'Website'}).fill('https://larkvale.example.org');
  await expect(save).toBeEnabled();
  await save.click();
  await expect(page.getByText('Platform configuration saved')).toBeVisible();
});

test('branding takes a logo through the gv drop zone', async ({page}) => {
  await page.goto('/backoffice/#/settings');
  await page.getByRole('tab', {name: 'Branding'}).click();
  await expect(page.getByRole('heading', {level: 3, name: 'Platform logo', exact: true})).toBeVisible();
  await expect(page.locator('.gv-drop-zone')).toHaveCount(2);
  await expect(page.getByRole('button', {name: 'browse'}).first()).toBeVisible();
});

test('content moderation switches mark the section changed: Save turns on', async ({page}) => {
  await page.goto('/backoffice/#/settings');
  const save = page.getByRole('button', {name: 'Save content moderation'});
  await expect(save).toBeDisabled();
  await page.getByRole('switch', {name: 'Profanity blocker'}).click({force: true});
  await expect(save).toBeEnabled();
  await save.click();
  await expect(page.getByText('Content moderation saved')).toBeVisible();
  const stats = page.getByRole('button', {name: 'Save statistics'});
  await expect(stats).toBeDisabled();
  await page.getByRole('switch', {name: 'Exclude admins and managers from statistics'}).click({force: true});
  await expect(stats).toBeEnabled();
});

const rowsOf = (page: Page, name: string) => page.getByRole('list', {name}).getByRole('listitem');

test('tags: Add platform tag adds a row; Edit renames one', async ({page}) => {
  await page.goto('/backoffice/#/settings');
  await page.getByRole('tab', {name: 'Tags'}).click();
  await expect(page.getByRole('heading', {level: 3, name: 'Platform tags'})).toBeVisible();
  const rows = rowsOf(page, 'Platform tags');
  await expect(rows).toHaveCount(5);
  await page.getByRole('button', {name: 'Add platform tag'}).click();
  const modal = page.getByRole('dialog', {name: 'Add platform tag'});
  await expect(modal).toBeVisible();
  a11yReport(await axeViolations(page, '.gv-modal'));
  const save = modal.getByRole('button', {name: 'Save tag'});
  await expect(save).toBeDisabled();
  await modal.getByRole('textbox', {name: 'Tag name'}).fill('Education');
  await save.click();
  await expect(modal).toHaveCount(0);
  await expect(rows).toHaveCount(6);
  await expect(rows.last()).toContainText('Education');

  await rows.filter({hasText: 'Mobility'}).getByRole('button', {name: 'Edit Mobility'}).click();
  const edit = page.getByRole('dialog', {name: 'Edit platform tag'});
  await expect(edit.getByRole('textbox', {name: 'Tag name'})).toHaveValue('Mobility');
  await edit.getByRole('textbox', {name: 'Tag name'}).fill('Getting around');
  await edit.getByRole('button', {name: 'Save tag'}).click();
  await expect(rows.first()).toContainText('Getting around');
});

test('areas: Add area adds a row; Edit opens it filled in', async ({page}) => {
  await page.goto('/backoffice/#/settings');
  await page.getByRole('tab', {name: 'Areas'}).click();
  const rows = rowsOf(page, 'Areas');
  await expect(rows).toHaveCount(4);
  await page.getByRole('button', {name: 'Add area'}).click();
  const modal = page.getByRole('dialog', {name: 'Add area'});
  a11yReport(await axeViolations(page, '.gv-modal'));
  await modal.getByRole('textbox', {name: 'Area name'}).fill('West end');
  await modal.getByRole('button', {name: 'Save area'}).click();
  await expect(rows).toHaveCount(5);
  await rows.filter({hasText: 'Old harbour'}).getByRole('button', {name: 'Edit Old harbour'}).click();
  await expect(page.getByRole('dialog', {name: 'Edit area'}).getByRole('textbox', {name: 'Area name'})).toHaveValue('Old harbour');
});

test('statuses: input and proposal statuses apart, each with Add status and Edit', async ({page}) => {
  await page.goto('/backoffice/#/settings');
  await page.getByRole('tab', {name: 'Statuses'}).click();
  await expect(page.getByRole('button', {name: 'Edit proposal statuses'})).toBeVisible();
  await page.getByRole('button', {name: 'Edit input statuses'}).click();
  await expect(page.getByRole('heading', {level: 3, name: 'Input statuses'})).toBeVisible();
  const rows = rowsOf(page, 'Input statuses');
  const count = await rows.count();
  expect(count).toBeGreaterThan(3);
  await page.getByRole('button', {name: 'Add status'}).click();
  const modal = page.getByRole('dialog', {name: 'Add status'});
  a11yReport(await axeViolations(page, '.gv-modal'));
  await modal.getByRole('textbox', {name: 'Status name'}).fill('On hold');
  await modal.getByRole('button', {name: /Category/}).click();
  await page.getByRole('option', {name: 'Other'}).click();
  await modal.getByRole('button', {name: 'Save status'}).click();
  await expect(rows).toHaveCount(count + 1);
  await expect(rows.last()).toContainText('On hold');
  await rows.first().getByRole('button', {name: /^Edit /}).click();
  await expect(page.getByRole('dialog', {name: 'Edit status'})).toBeVisible();
  await page.keyboard.press('Escape');

  await page.getByRole('button', {name: 'All statuses'}).click();
  await page.getByRole('button', {name: 'Edit proposal statuses'}).click();
  await expect(page.getByRole('heading', {level: 3, name: 'Proposal statuses'})).toBeVisible();
  await expect(rowsOf(page, 'Proposal statuses').filter({hasText: 'Threshold reached'})).toBeVisible();
});

test('policies: Terms and conditions and Privacy policy open in the editor', async ({page}) => {
  await page.goto('/backoffice/#/settings');
  await page.getByRole('tab', {name: 'Policies'}).click();
  await expect(page.getByRole('heading', {level: 3, name: 'Platform policies'})).toBeVisible();
  for (const name of ['Terms and conditions', 'Privacy policy']) {
    await page.getByRole('button', {name: `Edit ${name}`}).click();
    const editor = page.getByRole('textbox', {name});
    await expect(editor).toBeVisible();
    const save = page.getByRole('button', {name: `Save ${name}`});
    await expect(save).toBeDisabled();
    await editor.fill(`New ${name} text.`);
    await save.click();
    await expect(page.getByText(`${name} saved`)).toBeVisible();
  }
});

test('settings is built from the system, with no gaps', async ({page}) => {
  await page.goto('/backoffice/#/settings');
  await expect(page.locator('.gv-card').first()).toBeVisible();
  await expect(page.locator('.gv-title-field')).toBeVisible();
  await expect(page.locator('[data-gap]')).toHaveCount(0);
});
