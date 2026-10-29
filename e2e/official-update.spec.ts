import {test, expect, type Page} from '@playwright/test';
import {a11yReport, axeViolations} from './axe';

// Official update (Patterns/Manage tab/Official update): Publish only with words, the update shows at once and its
// toast takes it back; in bulk, the Modal's Send does the same and focus returns to the button that opened it.
const story = (name: string) => `/storybook/iframe.html?id=patterns-manage-tab-official-update--${name}&viewMode=story`;

/** Axe's findings in `within`, reported (never failing the test). Storybook's a11y addon runs axe in the preview as the
 * story renders; ours waits its turn ("Axe is already running"). */
async function report(page: Page, within: string) {
  let found: string[] = [];
  await expect(async () => { found = await axeViolations(page, within); }).toPass();
  a11yReport(found);
}

test('Publish is off until there are words; publishing shows the update, Undo takes it back', async ({page}) => {
  await page.goto(story('empty'));
  const publish = page.getByRole('button', {name: 'Publish'});
  await expect(publish).toBeDisabled();
  await page.getByRole('textbox', {name: 'Official update'}).fill('We will test this in July.');
  await page.getByRole('textbox', {name: 'Name shown with the update'}).fill('Parks team');
  await publish.click();
  const posted = page.getByRole('article', {name: /^Official update · Parks team/});
  await expect(posted).toContainText('We will test this in July.');
  await expect(page.getByRole('textbox', {name: 'Official update'})).toHaveValue('');
  await page.getByRole('button', {name: 'Undo'}).click();
  await expect(posted).toHaveCount(0);
});

test('⌘/Ctrl + Enter in the words publishes; an empty name reads "The project team"', async ({page}) => {
  await page.goto(story('empty'));
  await page.getByRole('textbox', {name: 'Official update'}).fill('Thanks, we are on it.');
  await page.keyboard.press('ControlOrMeta+Enter');
  await expect(page.getByRole('article', {name: /^Official update · The project team/})).toContainText('Thanks, we are on it.');
});

test('bulk: the Modal opens on the words, Send is off until there are some, and sending closes it', async ({page}) => {
  await page.goto(story('bulk'));
  const dialog = page.getByRole('dialog', {name: 'Official update'});
  await expect(dialog).toBeVisible();
  await expect(dialog.getByRole('textbox', {name: 'Official update'})).toBeFocused();
  await expect(dialog).toContainText('This update goes to 2 ideas');
  const send = dialog.getByRole('button', {name: 'Send'});
  await expect(send).toBeDisabled();
  await page.keyboard.type('We will test this in July.');
  await send.click();
  await expect(dialog).toHaveCount(0);
  await expect(page.getByText('Official update sent to 2 ideas')).toBeVisible();
});

test('bulk: closing returns focus to the button that opened it', async ({page}) => {
  await page.goto(story('bulk'));
  await expect(page.getByRole('textbox', {name: 'Official update'})).toBeFocused();
  await page.keyboard.press('Escape');
  await expect(page.getByRole('dialog')).toHaveCount(0);
  await page.getByRole('button', {name: 'Official update'}).click();
  await expect(page.getByRole('dialog', {name: 'Official update'})).toBeVisible();
  await page.keyboard.press('Escape');
  await expect(page.getByRole('button', {name: 'Official update'})).toBeFocused();
});

for (const [name, within] of [['posted', '#storybook-root'], ['bulk', '[role="dialog"]']]) {
  test(`${name}: axe findings, reported`, async ({page}) => {
    await page.goto(story(name));
    await expect(page.locator(within).first()).toBeVisible();
    await report(page, within);
  });
}
