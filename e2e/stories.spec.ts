import {test, expect} from '@playwright/test';
import {existsSync, readFileSync} from 'node:fs';

// Every story renders: Storybook's error screen fails it, and so does an exception the page throws while it draws.
// The net under a rename or a codemod: a story that breaks says so here, by its id, before anyone opens it.
const index = 'dist/storybook/index.json';
const stories = existsSync(index)
  ? Object.values(JSON.parse(readFileSync(index, 'utf8')).entries as Record<string, {id: string; type: string; title: string}>)
      .filter(e => e.type === 'story' && !e.title.startsWith('Overview'))
  : [];

// The edge-case stories (empty, loading, error, no permission, 1 and 1,000 rows, long German and Arabic words) render
// right to left too: a state a page meets must hold in Arabic as well.
const EDGE = /--(empty.*|no-rows|no-results|one-row|thousand-rows|first-load|refreshing|load-error|refresh-error|no-permission|long-german-labels|arabic)$/;
const runs = stories.flatMap(({id}) => [{id, globals: ''}, ...(EDGE.test(id) ? [{id, globals: 'direction:rtl'}] : [])]);

test.describe.configure({mode: 'parallel'});
test('the build has stories', () => expect(stories.length, 'run npm run build first').toBeGreaterThan(0));
test('the edge-case stories are there to render both ways', () => {
  expect(stories.filter(s => EDGE.test(s.id)).length, 'run npm run build first').toBeGreaterThanOrEqual(19);
});
for (const {id, globals} of runs) {
  test(`renders ${id}${globals ? ' right to left' : ''}`, async ({page}) => {
    const errors: string[] = [];
    page.on('pageerror', e => errors.push(e.message));
    await page.goto(`/storybook/iframe.html?id=${id}&viewMode=story${globals ? `&globals=${globals}` : ''}`);
    await page.waitForFunction(() => /sb-show-(main|errordisplay|nopreview)/.test(document.body.className));
    const failed = await page.evaluate(() => document.body.classList.contains('sb-show-errordisplay')
      ? document.querySelector('#error-message')?.textContent ?? 'error' : '');
    expect(failed, 'Storybook shows its error screen').toBe('');
    expect(errors, 'the page threw while drawing').toEqual([]);
  });
}
