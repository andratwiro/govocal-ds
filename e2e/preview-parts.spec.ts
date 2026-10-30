import {test, expect, type Page} from '@playwright/test';
import {a11yReport, axeViolations} from './axe';

// The preview parts the back office lacked (deep review 2, S10–S12): Email preview, Site preview and Gantt chart,
// found by role and name.
const story = (id: string) => `/storybook/iframe.html?id=${id}&viewMode=story`;
async function open(page: Page, id: string) {
  await page.goto(story(id));
  await page.locator('#storybook-root > *').first().waitFor();
}
async function report(page: Page, within = '#storybook-root') {
  let found: string[] = [];
  await expect(async () => { found = await axeViolations(page, within); }).toPass();
  a11yReport(found);
}

test('email preview: the envelope, the email, and the switch narrows it to a phone', async ({page}) => {
  await open(page, 'components-data-display-email-preview--default');
  const preview = page.getByRole('region', {name: 'Email preview: New comment on your input'});
  await expect(preview.getByRole('term')).toHaveText(['To', 'From', 'Reply-to', 'Subject']);
  await expect(preview.getByRole('heading', {level: 3, name: 'Someone commented on your input'})).toBeVisible();
  await expect(preview.getByRole('img', {name: 'Larkvale'})).toBeVisible();
  await expect(preview.getByText('View the comment')).toBeVisible();
  await expect(preview.getByText('Unsubscribe')).toBeVisible();
  const frame = preview.locator('[data-device]');
  expect((await frame.boundingBox())!.width).toBeCloseTo(600, 0);
  await preview.getByRole('radio', {name: 'Phone'}).click();
  await expect(frame).toHaveAttribute('data-device', 'phone');
  await expect.poll(async () => Math.round((await frame.boundingBox())!.width)).toBe(343);
  await report(page);
  await open(page, 'components-data-display-email-preview--right-to-left');
  await expect(page.locator('html')).toHaveAttribute('dir', 'rtl');
  await report(page);
});
