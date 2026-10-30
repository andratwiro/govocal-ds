import {test, expect} from '@playwright/test';
import {a11yReport, axeViolations} from './axe';

const story = (name: string) => `/storybook/iframe.html?id=components-data-display-file-list--${name}&viewMode=story`;

// A page's Delete handler reads the list it rendered with. The rows must call the handler of the latest render, not
// the one their row was first drawn with (that one still holds the deleted file, which came back).
test('Delete removes its file, one after another', async ({page}) => {
  await page.goto(story('deleting'));
  const list = page.getByRole('grid', {name: 'Attachments'});
  await expect(list.getByRole('row')).toHaveCount(3);
  await list.getByRole('row', {name: 'consultation-summary.pdf'}).getByRole('button', {name: 'Delete'}).click();
  await expect(list.getByRole('row')).toHaveCount(2);
  await list.getByRole('row', {name: 'street.webp'}).getByRole('button', {name: 'Delete'}).click();
  await expect(list.getByRole('row')).toHaveCount(1);
  await expect(list.getByRole('row', {name: 'budget-breakdown.xlsx'})).toBeVisible();
  a11yReport(await axeViolations(page, '.gv-file-list'));
});
