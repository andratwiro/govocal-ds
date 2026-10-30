import {test, expect, type Page} from '@playwright/test';

// Tab out of a React Aria Toolbar, pressed by a real keyboard. The Toolbar sends Tab out from its last tool, and only
// a browser follows it: Storybook's userEvent moves on from where Tab was pressed, so a play function can't prove these
// rows of the component pages (Rich text toolbar, Rich text editor, Table toolbar).

async function open(page: Page, id: string) {
  await page.goto(`/storybook/iframe.html?id=${id}&viewMode=story`);
  // Let a play function finish first: it moves focus too.
  await expect.poll(() => page.evaluate(() =>
    (window as unknown as {__STORYBOOK_PREVIEW__?: {currentRender?: {phase?: string}}}).__STORYBOOK_PREVIEW__?.currentRender?.phase))
    .toMatch(/^(completed|afterEach|finished)$/);
}

test('rich text toolbar: Tab on any tool leaves the toolbar', async ({page}) => {
  await open(page, 'components-forms-rich-text-toolbar--keyboard');
  await page.getByRole('button', {name: 'Bold'}).focus();
  await page.keyboard.press('Tab');
  await expect(page.getByRole('button', {name: 'After the toolbar'})).toBeFocused();
  await page.keyboard.press('Shift+Tab');
  await expect(page.getByRole('toolbar').getByRole('button').first()).toBeFocused();
});

test('rich text editor: Tab goes from the toolbar into the writing area, where typing writes', async ({page}) => {
  await open(page, 'components-forms-rich-text-editor--empty');
  await page.keyboard.press('Tab');
  await expect(page.getByRole('button', {name: 'Bold'})).toBeFocused();
  await page.keyboard.press('Tab');
  const text = page.getByRole('textbox', {name: 'Project description'});
  await expect(text).toBeFocused();
  await page.keyboard.type('Tell residents how to take part.');
  await expect(text).toHaveValue('Tell residents how to take part.');
});

test('table toolbar: Tab in the tools leaves them', async ({page}) => {
  await open(page, 'components-tables-lists-table-toolbar--default');
  const tools = page.getByRole('toolbar', {name: 'Table tools'});
  await page.keyboard.press('Tab');
  await expect(tools.getByRole('button', {name: 'Search ideas'})).toBeFocused();
  await page.keyboard.press('Tab');
  await expect(page.locator(':focus')).toHaveCount(1);
  expect(await tools.evaluate(el => el.contains(document.activeElement))).toBe(false);
});
