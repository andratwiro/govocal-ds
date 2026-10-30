import {test, expect} from '@playwright/test';

// Undo closes one toast and adds another inside a view transition. While a view transition runs, the browser lays its
// snapshot over the page, and that snapshot took the clicks for about 200 ms: a press right after Undo went nowhere.
test('the page takes a click straight after Undo, while the toasts still move', async ({page}) => {
  await page.goto('/storybook/iframe.html?id=components-status-feedback-toast--undo-then-carry-on&viewMode=story');
  const save = page.getByRole('button', {name: 'Save'});
  await expect(page.getByRole('button', {name: 'Undo'})).toBeVisible();
  const box = (await save.boundingBox())!;
  await page.getByRole('button', {name: 'Undo'}).click();
  // A raw click at Save's place, with no wait: Playwright's own click would wait for the snapshot to go.
  await page.mouse.click(box.x + box.width / 2, box.y + box.height / 2);
  await expect(page.locator('output')).toHaveText('Saved');
  await expect(page.getByText('Tag restored')).toBeVisible();
});
