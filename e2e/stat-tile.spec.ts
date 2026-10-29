import {test, expect, type Page} from '@playwright/test';
import {a11yReport, axeViolations} from './axe';

const story = (id: string) => `/storybook/iframe.html?id=${id}&viewMode=story`;
async function open(page: Page, id: string) {
  await page.goto(story(id));
  await page.locator('#storybook-root > *').first().waitFor();
}

test('stat tile: a trend says its direction in words, not by colour alone', async ({page}) => {
  await open(page, 'components-data-display-stat-tile--with-trend');
  const trends = page.locator('.gv-kpi__trend');
  await expect(trends).toHaveText(['Up 12%, 7-day change', 'Down 8%, 7-day change', 'No change 0%, 7-day change']);
  await expect(trends.first().locator('svg')).toHaveAttribute('aria-hidden', 'true');
  a11yReport(await axeViolations(page, '#storybook-root'));
});

test('stat tile: the info icon opens a Help popover by press and by keyboard', async ({page}) => {
  await open(page, 'components-data-display-stat-tile--with-info');
  const help = page.getByRole('button', {name: 'Help: Participation rate'});
  await help.click();
  const dialog = page.getByRole('dialog', {name: 'Participation rate'});
  await expect(dialog).toContainText('Phase participants as a share');
  await page.keyboard.press('Escape');
  await expect(dialog).toHaveCount(0);
  await help.focus();
  await page.keyboard.press('Enter');
  await expect(dialog).toBeVisible();
});
