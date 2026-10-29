import {test, expect} from '@playwright/test';
import {existsSync, readFileSync} from 'node:fs';
// The results come from `npm run a11y:scan` (minutes): deploy runs it before e2e; a local or PR run without it skips.
const results = 'dist/storybook/a11y-results.json';
test('scan results exist and name the palette', () => {
  test.skip(!existsSync(results), 'no scan in this build: run npm run a11y:scan');
  const r = JSON.parse(readFileSync(results, 'utf8'));
  expect(r.palette).toMatch(/Go Vocal/);
  expect(r.components.length).toBeGreaterThan(40);
});
test('RTL story sets dir on the document', async ({page}) => {
  await page.goto('/storybook/iframe.html?id=components-actions-button--primary&viewMode=story&globals=direction:rtl');
  await expect(page.locator('html')).toHaveAttribute('dir', 'rtl');
  await expect(page.locator('html')).toHaveAttribute('lang', 'ar-SA');
});
test('overview page lists components', async ({page}) => {
  await page.goto('/storybook/iframe.html?id=overview-accessibility--docs&viewMode=docs');
  // With a scan the page draws its table; without one it says so, and says how to make one.
  if (existsSync(results)) await expect(page.getByRole('table')).toBeVisible();
  else await expect(page.getByText('No results yet')).toBeVisible();
});
