import {test, expect} from '@playwright/test';

// Base is the primitives the Components build on: its intro page and every Base entry's docs page say so in one line,
// and the sidebar lists Base last, its intro first.
const docs = (id: string) => `/storybook/iframe.html?id=${id}--docs&viewMode=docs`;
const LINE = /React Aria parts painted with the tokens\. Primitives: don't use them directly in pages/;

test('the Base intro page carries the line', async ({page}) => {
  await page.goto(docs('base-introduction'));
  await expect(page.locator('.gv-sb-base-note')).toHaveText(LINE);
});

test("a Base entry's docs page carries the line; a Components entry's doesn't", async ({page}) => {
  await page.goto(docs('base-calendar'));
  await expect(page.locator('.sbdocs-title')).toBeVisible();
  await expect(page.locator('.gv-sb-base-note')).toHaveText(LINE);
  await page.goto(docs('components-forms-checkbox'));
  await expect(page.locator('.sbdocs-title')).toBeVisible();
  await expect(page.locator('.gv-sb-base-note')).toHaveCount(0);
});

test('the sidebar lists Base last, its intro first', async ({page}) => {
  await page.goto('/storybook/?path=/docs/base-introduction--docs');
  const roots = page.locator('#storybook-explorer-tree [data-action="collapse-root"]');
  await expect(roots.last()).toHaveText(/^Base$/i);
  await expect(page.locator('#storybook-explorer-tree [data-item-id^="base-"]').first())
    .toHaveAttribute('data-item-id', 'base-introduction--docs');
});
