import {test, expect} from '@playwright/test';
import {readFileSync} from 'node:fs';

test('landing links both parts and is noindex', async ({page}) => {
  await page.goto('/');
  await expect(page.locator('meta[name=robots]')).toHaveAttribute('content', /noindex/);
  await expect(page.getByRole('link', {name: /Storybook/})).toHaveAttribute('href', './storybook/');
  await expect(page.getByRole('link', {name: /Back office/})).toHaveAttribute('href', './backoffice/');
});

test('storybook holds the starter kit', async () => {
  const index = JSON.parse(readFileSync('dist/storybook/index.json', 'utf8'));
  const stories = Object.values(index.entries).filter((e: any) => e.type === 'story');
  expect(stories.length).toBeGreaterThanOrEqual(50);
});

test('a story renders', async ({page}) => {
  await page.goto('/storybook/iframe.html?id=button--primary&viewMode=story');
  await expect(page.getByRole('button', {name: 'Publish'})).toBeVisible();
});
