import {test, expect} from '@playwright/test';

test('Foundations lists the Figma tokens', async ({page}) => {
  await page.goto('/storybook/iframe.html?id=overview-foundations--docs&viewMode=docs');
  await expect(page.getByText('--gv-action-primary').first()).toBeVisible();
  await expect(page.getByText('--gv-space-14').first()).toBeVisible();
  await expect(page.getByRole('heading', {name: 'Not in Figma'})).toBeVisible();
});

test('Icons lists the Figma names', async ({page}) => {
  await page.goto('/storybook/iframe.html?id=overview-icons--docs&viewMode=docs');
  await expect(page.getByText('In Figma', {exact: true}).first()).toBeVisible();
  await expect(page.getByText('x', {exact: true}).first()).toBeVisible();
});

test('the manager wears Go Vocal\'s name', async ({page}) => {
  await page.goto('/storybook/');
  await expect(page.getByText('Go Vocal design system').first()).toBeVisible();
});
