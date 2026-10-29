import {test, expect, type Page} from '@playwright/test';
import {a11yReport, axeViolations} from './axe';

// Comment thread (Patterns/Manage tab/Comment thread): Reply points the composer at a comment, posts land at once,
// Delete and Dismiss warning apply at once with Undo, and the internal conversation is its own tab.
const story = (name: string) => `/storybook/iframe.html?id=patterns-manage-tab-comment-thread--${name}&viewMode=story`;

/** Axe's findings in `within`, reported (never failing the test). Storybook's a11y addon runs axe in the preview as the
 * story renders; ours waits its turn ("Axe is already running"). */
async function report(page: Page, within: string) {
  let found: string[] = [];
  await expect(async () => { found = await axeViolations(page, within); }).toPass();
  a11yReport(found);
}

test('Reply moves focus to the composer, and the reply lands under that comment', async ({page}) => {
  await page.goto(story('default'));
  await page.getByRole('button', {name: 'Reply to Tom R.'}).click();
  const field = page.getByRole('textbox', {name: 'Reply to Tom R.'});
  await expect(field).toBeFocused();
  await expect(page.getByText('Replying to Tom R.')).toBeVisible();
  await page.keyboard.type('The weekend crowds are why we would widen it.');
  await page.getByRole('button', {name: 'Post'}).click();
  const replies = page.getByRole('list', {name: 'Replies to Tom R.'});
  await expect(replies).toContainText('The weekend crowds are why we would widen it.');
  await expect(page.getByRole('tab', {name: 'Comments (6)'})).toBeVisible();
  await expect(page.getByText('Replying to')).toHaveCount(0);
});

test('Post is off until there are words; ⌘/Ctrl + Enter posts', async ({page}) => {
  await page.goto(story('empty'));
  await expect(page.getByText('No comments yet')).toBeVisible();
  await expect(page.getByRole('button', {name: 'Post'})).toBeDisabled();
  await page.getByRole('textbox', {name: 'Comment'}).fill('Thanks for all the ideas so far.');
  await page.keyboard.press('ControlOrMeta+Enter');
  await expect(page.getByRole('list', {name: 'Comments'})).toContainText('Thanks for all the ideas so far.');
});

test('Delete applies at once; Undo puts the comment back in its place', async ({page}) => {
  await page.goto(story('default'));
  const list = page.getByRole('list', {name: 'Comments'});
  await page.getByRole('button', {name: "Delete Priya S.'s comment"}).click();
  await expect(list).not.toContainText('Priya S.');
  await page.getByRole('button', {name: 'Undo'}).click();
  await expect(list.getByRole('article').nth(2)).toContainText('Priya S.');
});

test('Dismiss warning removes the warning at once, with Undo', async ({page}) => {
  await page.goto(story('content-warning'));
  await expect(page.getByText(/Content warning: Possibly offensive language/)).toBeVisible();
  await page.getByRole('button', {name: 'Dismiss warning'}).click();
  await expect(page.getByText(/Content warning:/)).toHaveCount(0);
  await page.getByRole('button', {name: 'Undo'}).click();
  await expect(page.getByText(/Content warning: Possibly offensive language/)).toBeVisible();
});

test('the internal conversation is its own tab, with its own composer', async ({page}) => {
  await page.goto(story('default'));
  await page.getByRole('tab', {name: 'Internal conversation (2)'}).click();
  await expect(page.getByRole('list', {name: 'Internal comments'})).toContainText('Booked one for Thursday.');
  await expect(page.getByRole('textbox', {name: 'Internal comment'}))
    .toHaveAttribute('placeholder', 'This comment is not visible to regular users');
});

test('in a side panel, Esc in a field holding words keeps them; the next Esc reaches the panel', async ({page}) => {
  await page.goto(story('in-a-side-panel'));
  const field = page.getByRole('textbox', {name: 'Official update'});
  await field.fill('Half written');
  await page.keyboard.press('Escape');
  await expect(field).toHaveValue('Half written');
  await expect(page.getByRole('dialog', {name: 'Collect ideas'})).toBeFocused();
});

for (const name of ['default', 'content-warning', 'empty', 'internal-conversation', 'in-a-side-panel']) {
  test(`${name}: axe findings, reported`, async ({page}) => {
    await page.goto(story(name));
    await expect(page.locator('#storybook-root > *').first()).toBeVisible();
    await report(page, '#storybook-root');
  });
}
