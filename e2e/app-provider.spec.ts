import {test, expect} from '@playwright/test';
import {a11yReport, axeViolations} from './axe';

const story = (name: string) => `/storybook/iframe.html?id=components-layout-containers-app-provider--${name}&viewMode=story`;

test('App provider: toast() shows one toast, even beside a page\'s own region; Undo follows it', async ({page}) => {
  await page.goto(story('with-a-pages-own-region'));
  await page.getByRole('button', {name: 'Archive idea'}).click();
  const toasts = page.locator('.react-aria-Toast');
  await expect(toasts).toHaveCount(1);
  await expect(toasts.first()).toContainText('Idea archived');
  await expect(page.locator('.react-aria-ToastRegion')).toHaveCount(1);
  a11yReport(await axeViolations(page, '.react-aria-ToastRegion'));
  await toasts.first().getByRole('button', {name: 'Undo'}).click();
  await expect(toasts).toHaveCount(1);
  await expect(toasts.first()).toContainText('Idea restored');
});

test('App provider: icons inside it draw at the 1.75 stroke', async ({page}) => {
  await page.goto(story('default'));
  await expect(page.getByRole('button', {name: 'Archive idea'}).locator('svg')).toHaveAttribute('stroke-width', '1.75');
});
