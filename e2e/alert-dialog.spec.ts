import {test, expect} from '@playwright/test';
const story = (id: string) => `/storybook/iframe.html?id=${id}&viewMode=story`;

test('type to confirm: the confirm button stays disabled until the exact text is typed', async ({page}) => {
  await page.goto(story('components-overlays-alert-dialog--type-to-confirm'));
  const dialog = page.getByRole('alertdialog');
  const confirm = dialog.getByRole('button', {name: 'Reset data'});
  const field = dialog.getByRole('textbox');
  await expect(confirm).toBeDisabled();
  await field.fill('Res');
  await expect(confirm).toBeDisabled();
  await field.fill('reset'); // wrong case: still not the exact text
  await expect(confirm).toBeDisabled();
  await field.fill('Reset');
  await expect(confirm).toBeEnabled();
  await field.fill('Reset data'); // typed past the exact match
  await expect(confirm).toBeDisabled();
});

test('destructive: focus starts on Cancel, no ×, Esc cancels and returns focus to the trigger', async ({page}) => {
  await page.goto(story('components-overlays-alert-dialog--destructive'));
  const trigger = page.getByRole('button', {name: 'Destructive'});
  await trigger.click();
  const dialog = page.getByRole('alertdialog', {name: 'Delete this group?'});
  await expect(dialog).toBeVisible();
  await expect(dialog.getByRole('button', {name: 'Cancel'})).toBeFocused();
  await expect(dialog.getByRole('button', {name: '×', exact: false})).toHaveCount(0);
  await page.keyboard.press('Escape');
  await expect(dialog).toBeHidden();
  await expect(trigger).toBeFocused();
});

test('with impact list: a row per consequence, tone icon then title then description', async ({page}) => {
  await page.goto(story('components-overlays-alert-dialog--with-impact-list'));
  const trigger = page.getByRole('button', {name: 'With impact list'});
  await trigger.click();
  const dialog = page.getByRole('alertdialog', {name: 'Edit form'});
  const rows = dialog.getByRole('listitem');
  await expect(rows).toHaveCount(3);
  await expect(rows.nth(0)).toContainText('Delete a question');
  await expect(rows.nth(2)).toContainText('Edit text');
});
