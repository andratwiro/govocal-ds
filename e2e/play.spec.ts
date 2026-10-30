import {test, expect} from '@playwright/test';
import {existsSync, readFileSync} from 'node:fs';

// Every story with a play function plays to its end without a failed check. A component page's keyboard table cites
// these (`play: Keyboard`), so a table row is only as true as this test (docs/HOW-TO.md, "Write a component page").
// Storybook tags each such story `play-fn` in index.json.
const index = 'dist/storybook/index.json';
const stories = existsSync(index)
  ? Object.values(JSON.parse(readFileSync(index, 'utf8')).entries as Record<string, {id: string; type: string; tags?: string[]}>)
      .filter(e => e.type === 'story' && e.tags?.includes('play-fn'))
  : [];

test.describe.configure({mode: 'parallel'});
test('the build has stories with play functions', () => expect(stories.length, 'run npm run build first').toBeGreaterThan(0));
for (const {id} of stories) {
  test(`plays ${id}`, async ({page}) => {
    const errors: string[] = [];
    page.on('pageerror', e => errors.push(e.message));
    // A failed check doesn't throw out of the page: Storybook ends the render as 'finished' all the same and logs the
    // check's error to the console. Read the console, or a red play function passes here.
    page.on('console', m => { if (m.type() === 'error') errors.push(m.text().split('\n').slice(0, 3).join('\n')); });
    await page.goto(`/storybook/iframe.html?id=${id}&viewMode=story`);
    // Storybook's own record of where the story's render stands: 'errored' when a check in the play function failed.
    const phase = () => page.evaluate(() =>
      (window as unknown as {__STORYBOOK_PREVIEW__?: {currentRender?: {phase?: string}}}).__STORYBOOK_PREVIEW__?.currentRender?.phase);
    await expect.poll(phase, {timeout: 15_000}).toMatch(/^(errored|completed|afterEach|finished)$/);
    expect(await phase(), errors.join('\n') || 'a check in the play function failed (open the story\'s Interactions panel)').not.toBe('errored');
    expect(errors, 'a check in the play function failed (open the story\'s Interactions panel)').toEqual([]);
  });
}
