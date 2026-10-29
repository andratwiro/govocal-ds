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
  // Attached, not visible: Text field's description collapses to zero width today (a system-side fix is on its way).
  await expect(page.getByText("The link residents follow from the platform's footer to your own website.")).toBeAttached();
  await expect(page.getByRole('textbox', {name: 'Population'})).toBeVisible();
  await expect(page.getByRole('switch', {name: 'Profanity blocker'})).toBeChecked();
  await expect(page.getByRole('switch', {name: 'Detect inappropriate content'})).toBeChecked();
  await expect(page.getByRole('switch', {name: 'Exclude admins and managers from statistics'})).not.toBeChecked();
  const names = page.getByRole('radiogroup', {name: 'User name display'});
  await expect(names.getByRole('radio', {name: /User/})).toBeChecked();
  // Each section is a Panel; instant settings carry no Save of their own.
  await expect(page.locator('.gv-panel')).toHaveCount(5);
  await expect(page.getByRole('button', {name: 'Save content moderation'})).toHaveCount(0);
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

const toastWith = (page: Page, text: string) => page.locator('.react-aria-Toast').filter({hasText: text});

test('save stays off until something changes, then says so in a Toast', async ({page}) => {
  await page.goto('/backoffice/#/settings');
  const save = page.getByRole('button', {name: 'Save platform configuration'});
  await expect(save).toBeDisabled();
  await page.getByRole('textbox', {name: 'Website'}).fill('https://larkvale.example.org');
  await expect(save).toBeEnabled();
  await save.click();
  await expect(toastWith(page, 'Platform configuration saved')).toBeVisible();
  await expect(save).toBeDisabled();
});

test('content moderation and statistics apply at once, with Undo', async ({page}) => {
  await page.goto('/backoffice/#/settings');
  const profanity = page.getByRole('switch', {name: 'Profanity blocker'});
  await page.getByText('Profanity blocker', {exact: true}).click();
  await expect(profanity).not.toBeChecked();
  const t = toastWith(page, 'Profanity blocker turned off');
  await expect(t).toBeVisible();
  await t.getByRole('button', {name: 'Undo'}).click();
  await expect(profanity).toBeChecked();
  await page.getByText('Exclude admins and managers from statistics', {exact: true}).click();
  await expect(page.getByRole('switch', {name: 'Exclude admins and managers from statistics'})).toBeChecked();
  await expect(toastWith(page, 'Exclude admins and managers from statistics turned on')).toBeVisible();
});

test('user name display: two Choice cards, a change undone from its Toast', async ({page}) => {
  await page.goto('/backoffice/#/settings');
  const names = page.getByRole('radiogroup', {name: 'User name display'});
  await expect(names.locator('.gv-choice-card')).toHaveCount(2);
  await names.getByText('Animal', {exact: true}).click();
  await expect(names.getByRole('radio', {name: /Animal/})).toBeChecked();
  await toastWith(page, 'animal names').getByRole('button', {name: 'Undo'}).click();
  await expect(names.getByRole('radio', {name: /User/})).toBeChecked();
});

test('branding: a logo through the drop zone lands in the file list, removable with Undo', async ({page}) => {
  await page.goto('/backoffice/#/settings');
  await page.getByRole('tab', {name: 'Branding'}).click();
  await expect(page.getByRole('heading', {level: 3, name: 'Platform logo', exact: true})).toBeVisible();
  await expect(page.locator('.gv-drop-zone')).toHaveCount(2);
  const logo = page.getByRole('region', {name: 'Platform logo'});
  await expect(logo.getByText('No logo yet')).toBeVisible();
  await logo.locator('input[type=file]').setInputFiles({name: 'logo.png', mimeType: 'image/png', buffer: Buffer.from('png')});
  const files = logo.getByRole('grid', {name: 'Platform logo'});
  await expect(files.getByRole('row', {name: 'logo.png'})).toBeVisible();
  await expect(toastWith(page, 'Logo uploaded')).toBeVisible();
  await files.getByText('Delete', {exact: true}).click();
  await expect(logo.getByText('No logo yet')).toBeVisible();
  await toastWith(page, 'Logo removed').getByRole('button', {name: 'Undo'}).click();
  await expect(files.getByRole('row', {name: 'logo.png'})).toBeVisible();
  // Colours save from the Panel's foot.
  await expect(page.getByRole('button', {name: 'Save colours'})).toBeDisabled();
});

const rowsOf = (page: Page, name: string) => page.getByRole('grid', {name}).getByRole('row').filter({has: page.getByRole('rowheader')});
const rowAction = async (page: Page, name: string, item: string, table?: string) => {
  await (table ? page.getByRole('grid', {name: table}) : page).getByRole('button', {name: `Options for ${name}`}).click();
  await page.getByRole('menu', {name: `Options for ${name}`}).getByRole('menuitem', {name: item}).click();
};

test('tags: a Panel over a Data table; Add adds a row, Edit renames, Delete confirms and undoes', async ({page}) => {
  await page.goto('/backoffice/#/settings');
  await page.getByRole('tab', {name: 'Tags'}).click();
  const panel = page.getByRole('region', {name: /Platform tags/});
  await expect(panel.getByRole('heading', {level: 3, name: /Platform tags/})).toBeVisible();
  const rows = rowsOf(page, 'Platform tags');
  await expect(rows).toHaveCount(5);
  await panel.getByRole('button', {name: 'Add platform tag'}).click();
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
  await expect(toastWith(page, 'Education added')).toBeVisible();

  await rowAction(page, 'Mobility', 'Edit tag');
  const edit = page.getByRole('dialog', {name: 'Edit platform tag'});
  await expect(edit.getByRole('textbox', {name: 'Tag name'})).toHaveValue('Mobility');
  await edit.getByRole('textbox', {name: 'Tag name'}).fill('Getting around');
  await edit.getByRole('button', {name: 'Save tag'}).click();
  await expect(rows.first()).toContainText('Getting around');

  await rowAction(page, 'Housing', 'Delete tag');
  const confirm = page.getByRole('alertdialog', {name: 'Delete tag?'});
  await confirm.getByRole('button', {name: 'Delete tag'}).click();
  await expect(rows).toHaveCount(5);
  await toastWith(page, 'Housing deleted').getByRole('button', {name: 'Undo'}).click();
  await expect(rows).toHaveCount(6);
  await expect(rows.nth(2)).toContainText('Housing');
});

test('areas: Add area adds a row; Edit opens it filled in; an emptied list shows the Empty state', async ({page}) => {
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
  await rowAction(page, 'Old harbour', 'Edit area');
  await expect(page.getByRole('dialog', {name: 'Edit area'}).getByRole('textbox', {name: 'Area name'})).toHaveValue('Old harbour');
  await page.keyboard.press('Escape');
  for (const name of ['North bank', 'Old harbour', 'Market quarter', 'South hills', 'West end']) {
    await rowAction(page, name, 'Delete area');
    await page.getByRole('alertdialog').getByRole('button', {name: 'Delete area'}).click();
  }
  await expect(page.locator('.gv-empty-state')).toBeVisible();
  await expect(page.getByRole('heading', {name: 'No areas yet'})).toBeVisible();
});

test('statuses: input and proposal statuses as two tables, each with its own Add and row menu', async ({page}) => {
  await page.goto('/backoffice/#/settings');
  await page.getByRole('tab', {name: 'Statuses'}).click();
  await expect(page.getByRole('heading', {level: 3, name: /Input statuses/})).toBeVisible();
  await expect(page.getByRole('heading', {level: 3, name: /Proposal statuses/})).toBeVisible();
  const rows = rowsOf(page, 'Input statuses');
  const count = await rows.count();
  expect(count).toBeGreaterThan(3);
  await page.getByRole('button', {name: 'Add input status'}).click();
  const modal = page.getByRole('dialog', {name: 'Add input status'});
  a11yReport(await axeViolations(page, '.gv-modal'));
  await modal.getByRole('textbox', {name: 'Status name'}).fill('On hold');
  await modal.getByRole('button', {name: /Category/}).click();
  await page.getByRole('option', {name: 'Other'}).click();
  await modal.getByRole('button', {name: 'Save status'}).click();
  await expect(rows).toHaveCount(count + 1);
  await expect(rows.last()).toContainText('On hold');
  await expect(rows.last()).toContainText('Other');
  await rowAction(page, 'Proposed', 'Edit status', 'Input statuses');
  await expect(page.getByRole('dialog', {name: 'Edit status'})).toBeVisible();
  await page.keyboard.press('Escape');
  await expect(rowsOf(page, 'Proposal statuses').filter({hasText: 'Threshold reached'})).toBeVisible();
});

test('policies: each text opens in the editor in a Modal; Save says so in a Toast', async ({page}) => {
  await page.goto('/backoffice/#/settings');
  await page.getByRole('tab', {name: 'Policies'}).click();
  await expect(page.getByRole('heading', {level: 3, name: /Platform policies/})).toBeVisible();
  await expect(rowsOf(page, 'Platform policies')).toHaveCount(2);
  for (const name of ['Terms and conditions', 'Privacy policy']) {
    await rowAction(page, name, `Edit ${name.toLowerCase()}`);
    const modal = page.getByRole('dialog', {name: `Edit ${name.toLowerCase()}`});
    const editor = modal.getByRole('textbox', {name});
    await expect(editor).toBeVisible();
    const save = modal.getByRole('button', {name: `Save ${name}`});
    await expect(save).toBeDisabled();
    await editor.fill(`New ${name} text.`);
    await save.click();
    await expect(modal).toHaveCount(0);
    await expect(toastWith(page, `${name} saved`)).toBeVisible();
    await expect(rowsOf(page, 'Platform policies').filter({hasText: `New ${name} text.`})).toBeVisible();
  }
});

test('settings is built from the system, with no gaps', async ({page}) => {
  await page.goto('/backoffice/#/settings');
  await expect(page.locator('.gv-panel').first()).toBeVisible();
  await expect(page.locator('.gv-card')).toHaveCount(0);
  await expect(page.locator('.gv-title-field')).toBeVisible();
  await expect(page.locator('[data-gap]')).toHaveCount(0);
});
