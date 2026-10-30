import {test, expect, type Page} from '@playwright/test';
import {a11yReport, axeViolations} from './axe';

// Components › AI, the Activity feed, the Assistant panel and Side panel's head options, found by role and name.
const story = (id: string) => `/storybook/iframe.html?id=${id}&viewMode=story`;
async function open(page: Page, id: string) {
  await page.goto(story(id));
  await page.locator('#storybook-root > *').first().waitFor();
}
async function report(page: Page, within = '#storybook-root') {
  let found: string[] = [];
  await expect(async () => { found = await axeViolations(page, within); }).toPass();
  a11yReport(found);
}

test('assistant panel: a prompt sent with Enter thinks, answers with a change, and Undo turns off once used', async ({page}) => {
  await open(page, 'patterns-report-builder-assistant-panel--live');
  const panel = page.getByRole('region', {name: 'Assistant'});
  await expect(page.getByRole('dialog')).toHaveCount(0);
  await expect(panel.getByRole('heading', {name: 'What should change in by the numbers?'})).toBeVisible();
  const field = panel.getByRole('textbox', {name: 'Ask the assistant'});
  await field.fill('Lead with first-time participants');
  await field.press('Enter');
  await expect(field).toHaveValue('');
  const log = panel.getByRole('log', {name: 'Conversation'});
  await expect(log).toContainText('Lead with first-time participants');
  await expect(log.getByText('Thinking…')).toBeVisible();
  await expect(panel.getByRole('button', {name: 'Stop'})).toBeVisible();
  await expect(panel.getByRole('heading', {name: /What should/})).toHaveCount(0);
  const undo = log.getByRole('button', {name: 'Undo this change'});
  await expect(undo).toBeVisible({timeout: 5000});
  await expect(log).toContainText('1 widget changed. The version before is kept.');
  await undo.click();
  await expect(undo).toBeDisabled();
  await report(page);
});

test('assistant panel: the scope chip\'s × goes back to the whole report and focus lands in the field', async ({page}) => {
  await open(page, 'patterns-report-builder-assistant-panel--live');
  const panel = page.getByRole('region', {name: 'Assistant'});
  await panel.getByRole('button', {name: 'Ask about the whole report'}).focus();
  await page.keyboard.press('Enter');
  await expect(panel.getByRole('heading', {name: 'What should it change?'})).toBeVisible();
  await expect(panel.getByRole('textbox', {name: 'Ask the assistant'})).toBeFocused();
  await panel.getByRole('button', {name: 'Make the summary shorter'}).click();
  await expect(panel.getByRole('log')).toContainText('Make the summary shorter');
});

test('assistant panel off: a preview that can\'t be pressed, the thread out of reach, and whom to ask', async ({page}) => {
  await open(page, 'patterns-report-builder-assistant-panel--off');
  const panel = page.getByRole('region', {name: 'Assistant'});
  await expect(panel.getByRole('heading', {name: 'What the assistant could do here'})).toBeVisible();
  await expect(panel.getByRole('button', {name: 'Translate the whole report'})).toHaveCount(0);
  await expect(panel.getByText('Not switched on for this platform.')).toBeVisible();
  await expect(panel.getByRole('button', {name: 'Ask your account manager'})).toBeEnabled();
  await expect(panel.getByRole('textbox', {name: 'Ask the assistant'})).toBeDisabled();
  await expect(panel.getByRole('log')).toHaveAttribute('inert', '');
  await report(page);
});

test('assistant panel: an empty report offers Generate; generating shows the steps and no openings', async ({page}) => {
  await open(page, 'patterns-report-builder-assistant-panel--empty-report');
  await expect(page.getByRole('button', {name: 'Generate a report from the folder'})).toBeVisible();
  await report(page);
  // The spinner turns for as long as the run lasts: axe's wait skips animations that loop forever (e2e/axe.ts).
  await open(page, 'patterns-report-builder-assistant-panel--generating');
  const steps = page.getByRole('list', {name: 'Steps'});
  await expect(steps.getByRole('listitem')).toHaveCount(3);
  await expect(steps).toContainText('Done: Reading the 6 projects across 3 spaces');
  await expect(page.getByRole('button', {name: 'Stop'})).toBeVisible();
  await expect(page.getByRole('heading', {name: /What should/})).toHaveCount(0);
  await report(page);
});

test('chat thread: scrolled up, "Jump to latest" appears and takes you back', async ({page}) => {
  await open(page, 'components-ai-chat-thread--long');
  const jump = page.getByRole('button', {name: 'Jump to latest'});
  await expect(jump).toHaveCount(0);
  const log = page.getByRole('log', {name: 'Conversation'});
  await log.evaluate(el => { el.closest('.gv-chat-thread__scroll')!.scrollTop = 0; });
  await expect(jump).toBeVisible();
  await jump.click();
  await expect(jump).toHaveCount(0);
  await report(page);
});

test('item chip: a change\'s status is said in words, and a removed item can\'t be pressed', async ({page}) => {
  await open(page, 'components-ai-item-chip--in-history');
  await expect(page.getByRole('button', {name: 'Added: Upcoming events in Green Streets'})).toBeVisible();
  await expect(page.getByRole('button', {name: 'Summary'})).toBeVisible();
  await expect(page.getByRole('button', {name: /How people heard/})).toHaveCount(0);
  await expect(page.getByText('Removed: How people heard about the survey')).toBeAttached();
  await report(page);
});

test('prompt composer: send is off until there is a prompt; Shift+Enter is a new line', async ({page}) => {
  await open(page, 'components-ai-prompt-composer--default');
  const send = page.getByRole('button', {name: 'Send'});
  await expect(send).toBeDisabled();
  const field = page.getByRole('textbox', {name: 'Ask the assistant'});
  await field.click();
  await page.keyboard.type('One');
  await page.keyboard.press('Shift+Enter');
  await page.keyboard.type('Two');
  await expect(field).toHaveValue('One\nTwo');
  await expect(send).toBeEnabled();
  await report(page);
});

test('activity feed: the changes open and page, and ⋯ restores an older version', async ({page}) => {
  await open(page, 'components-data-display-activity-feed--default');
  await expect(page.getByRole('heading', {name: 'Today'})).toBeVisible();
  await expect(page.getByText('Showing now')).toBeVisible();
  const show = page.getByRole('button', {name: 'Show 24 changes'});
  await show.click();
  await expect(page.getByRole('button', {name: 'Hide the changes'})).toHaveAttribute('aria-expanded', 'true');
  await page.getByRole('button', {name: 'Page 2'}).click();
  // One ⋯ per entry but the current one.
  const more = page.getByRole('button', {name: 'More'});
  await expect(more).toHaveCount(3);
  await more.first().press('Enter');
  await expect(page.getByRole('menuitem', {name: 'Restore this version'})).toBeFocused();
  await page.keyboard.press('Escape');
  await report(page);
});

test('side panel: a titled head is a heading with its icon; a head-less one is a region that takes no focus', async ({page}) => {
  await open(page, 'components-overlays-side-panel--with-icon-and-title');
  const dialog = page.getByRole('dialog', {name: 'By the numbers'});
  await expect(dialog.getByRole('heading', {level: 2, name: 'By the numbers'})).toBeVisible();
  await report(page);
  await open(page, 'components-overlays-side-panel--headless');
  const region = page.getByRole('region', {name: 'Assistant'});
  await expect(region).toBeVisible();
  await expect(page.getByRole('dialog')).toHaveCount(0);
  await expect(region.getByRole('button', {name: 'Close'})).toHaveCount(0);
  await expect(page.locator('body')).toBeFocused();
  await page.keyboard.press('Escape');
  await expect(region).toBeVisible();
});
