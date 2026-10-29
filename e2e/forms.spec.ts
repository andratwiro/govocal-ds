import {test, expect} from '@playwright/test';
import {axeViolations, a11yReport} from './axe';
const story = (id: string) => `/storybook/iframe.html?id=${id}&viewMode=story`;


test('Date range field: an end before the start shows the invalid message in words', async ({page}) => {
  await page.goto(story('components-forms-date-range-field--start-and-end'));
  await expect(page.getByText("The end date can't be before the start date.")).toHaveCount(0);

  const end = page.getByRole('group', {name: 'Dates, end date'});
  await end.getByRole('spinbutton').first().click();
  // The story's end starts at 14 Dec 2026 (after the start, 2 Nov); move it to 1 Oct, before the start.
  await page.keyboard.type('10012026');

  const message = page.getByText("The end date can't be before the start date.");
  await expect(message).toBeVisible();
  await expect(end.getByRole('spinbutton').first()).toHaveAttribute('aria-invalid', 'true');
  a11yReport(await axeViolations(page, '.gv-date-range-field'));
});

test('Date range field: "Add end date" reveals the end picker, × removes it', async ({page}) => {
  await page.goto(story('components-forms-date-range-field--start-only'));
  await expect(page.getByRole('group', {name: /end date/})).toHaveCount(0);

  await page.getByRole('button', {name: 'Add end date'}).click();
  await expect(page.getByRole('group', {name: /, end date/})).toBeVisible();

  await page.getByRole('button', {name: 'Remove the end date'}).click();
  await expect(page.getByRole('group', {name: /, end date/})).toHaveCount(0);
  await expect(page.getByRole('button', {name: 'Add end date'})).toBeVisible();
});

test('Choice card: arrow keys move the selection within a radio group', async ({page}) => {
  await page.goto(story('components-forms-choice-card--all-variants'));
  const group = page.getByRole('radiogroup', {name: 'Report type'});
  const first = group.getByRole('radio', {name: /Participation report/});
  const second = group.getByRole('radio', {name: /Hovered/});
  await first.focus();
  await expect(first).toBeChecked();
  await page.keyboard.press('ArrowDown');
  await expect(second).toBeChecked();
  await expect(second).toBeFocused();
  a11yReport(await axeViolations(page, '[role="radiogroup"]'));
});

test('File list: Delete removes the row from the dialog', async ({page}) => {
  await page.goto(story('components-data-display-file-list--in-a-dialog'));
  const row = page.getByRole('row', {name: /street\.webp/});
  await expect(row).toBeVisible();
  await row.getByRole('link', {name: 'Delete'}).click();
  await expect(page.getByRole('row', {name: /street\.webp/})).toHaveCount(0);
  // The other attachment and the Drop zone stay.
  await expect(page.getByRole('row', {name: /consultation-summary\.pdf/})).toBeVisible();
  await expect(page.getByRole('button', {name: 'Drop a file here or browse'})).toBeVisible();
  a11yReport(await axeViolations(page, '.gv-modal'));
});

test('Choice card: revealed content shows only while its tile is chosen', async ({page}) => {
  await page.goto(story('components-forms-choice-card--with-revealed-content'));
  // The story starts on Budget allocation, so its Min/Max are already open. The native radio input
  // is visually hidden (clip-path), so a real person clicks the tile's label text, not the input.
  await expect(page.getByRole('textbox', {name: 'Minimum'})).toBeVisible();
  await page.getByText('Multiple votes', {exact: true}).click();
  await expect(page.getByRole('radio', {name: /Multiple votes/})).toBeChecked();
  await expect(page.getByRole('textbox', {name: 'Minimum'})).toHaveCount(0);
  await page.getByText('Budget allocation', {exact: true}).click();
  await expect(page.getByRole('textbox', {name: 'Minimum'})).toBeVisible();
});

test('Text field: help beside the counter takes the row, not one word a line', async ({page}) => {
  await page.goto(story('components-forms-text-field--with-counter-and-help'));
  const help = page.getByText('One sentence participants can agree or disagree with.');
  await expect(help).toBeVisible();
  const box = await help.boundingBox();
  const row = await page.locator('.gv-text-field-foot').boundingBox();
  // The help fills the row but for the counter (a word wide before: `contain: inline-size` in a flex row).
  expect(box!.width).toBeGreaterThan(row!.width * 0.6);
});
