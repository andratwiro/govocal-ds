import {test, expect} from '@playwright/test';
import {readFileSync} from 'node:fs';
test('scan results exist and name the palette', () => {
  const r = JSON.parse(readFileSync('dist/storybook/a11y-results.json', 'utf8'));
  expect(r.palette).toMatch(/Go Vocal/);
  expect(r.components.length).toBeGreaterThan(40);
});
test('RTL story sets dir on the document', async ({page}) => {
  await page.goto('/storybook/iframe.html?id=button--primary&viewMode=story&globals=direction:rtl');
  await expect(page.locator('html')).toHaveAttribute('dir', 'rtl');
  await expect(page.locator('html')).toHaveAttribute('lang', 'ar-SA');
});
test('overview page lists components', async ({page}) => {
  await page.goto('/storybook/iframe.html?id=overview-accessibility--docs&viewMode=docs');
  await expect(page.getByRole('table')).toBeVisible();
});
