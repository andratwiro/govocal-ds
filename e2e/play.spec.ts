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
    await page.goto(`/storybook/iframe.html?id=${id}&viewMode=story`);
    // Storybook's own record of where the story's render stands: 'errored' when a check in the play function failed.
    const phase = () => page.evaluate(() =>
      (window as unknown as {__STORYBOOK_PREVIEW__?: {currentRender?: {phase?: string}}}).__STORYBOOK_PREVIEW__?.currentRender?.phase);
    await expect.poll(phase, {timeout: 15_000}).toMatch(/^(errored|completed|afterEach|finished)$/);
    expect(await phase(), errors.join('\n') || 'a check in the play function failed (open the story\'s Interactions panel)').not.toBe('errored');
  });
}
