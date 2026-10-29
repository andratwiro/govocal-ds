import {test, expect} from '@playwright/test';
import {existsSync, readFileSync} from 'node:fs';

// Every story renders: Storybook's error screen fails it, and so does an exception the page throws while it draws.
// The net under a rename or a codemod: a story that breaks says so here, by its id, before anyone opens it.
const index = 'dist/storybook/index.json';
const stories = existsSync(index)
  ? Object.values(JSON.parse(readFileSync(index, 'utf8')).entries as Record<string, {id: string; type: string; title: string}>)
      .filter(e => e.type === 'story' && !e.title.startsWith('Overview'))
  : [];

test.describe.configure({mode: 'parallel'});
test('the build has stories', () => expect(stories.length, 'run npm run build first').toBeGreaterThan(0));
for (const {id} of stories) {
  test(`renders ${id}`, async ({page}) => {
    const errors: string[] = [];
    page.on('pageerror', e => errors.push(e.message));
    await page.goto(`/storybook/iframe.html?id=${id}&viewMode=story`);
    await page.waitForFunction(() => /sb-show-(main|errordisplay|nopreview)/.test(document.body.className));
    const failed = await page.evaluate(() => document.body.classList.contains('sb-show-errordisplay')
      ? document.querySelector('#error-message')?.textContent ?? 'error' : '');
    expect(failed, 'Storybook shows its error screen').toBe('');
    expect(errors, 'the page threw while drawing').toEqual([]);
  });
}
