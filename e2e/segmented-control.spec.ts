import {test, expect, type Page} from '@playwright/test';

const story = (id: string) => `/storybook/iframe.html?id=${id}&viewMode=story`;
async function open(page: Page, id: string) {
  await page.goto(story(id));
  await page.locator('#storybook-root > *').first().waitFor();
}

test('segmented control: icons sit before the words, which name the segments', async ({page}) => {
  await open(page, 'components-actions-segmented-control--icon-and-label-small');
  await expect(page.getByRole('radio', {name: 'Map'})).toBeChecked();
  await expect(page.getByRole('radio', {name: 'List'}).locator('svg')).toHaveAttribute('aria-hidden', 'true');
});

test('segmented control: the unread dot tells what it stands for on hover and on focus', async ({page}) => {
  await open(page, 'components-actions-segmented-control--unread-with-tooltip');
  const manage = page.getByRole('radio', {name: /^Manage/});
  // A pointer that comes in from outside, as a hand does (one jump to the middle doesn't reach React Aria's hover).
  const box = (await manage.boundingBox())!;
  await page.mouse.move(box.x - 40, box.y - 40);
  await page.mouse.move(box.x + box.width / 2, box.y + box.height / 2, {steps: 5});
  await expect(page.getByRole('tooltip')).toHaveText('18 new ideas');
  await page.mouse.move(0, 0);
  await expect(page.getByRole('tooltip')).toHaveCount(0);
  await page.keyboard.press('Tab');
  await page.keyboard.press('ArrowRight');
  await expect(manage).toBeFocused();
  await expect(page.getByRole('tooltip')).toHaveText('18 new ideas');
  await expect(manage).toHaveAccessibleDescription('18 new ideas');
});
