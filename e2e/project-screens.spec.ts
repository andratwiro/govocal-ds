import {test, expect, type Page} from '@playwright/test';
import {a11yReport, axeViolations} from './axe';

// Task 8e, the project screens' parts (the back office's deep dive, project §3), checked in their stories by role.
// Axe's findings are reported, never failing a test; keyboard and focus still assert.
const story = (id: string) => `/storybook/iframe.html?id=${id}&viewMode=story`;

// Skeletons and method scenes move without end; axe waits for animations to settle, so these stories run with
// reduced motion (they stop for it).
test.beforeEach(async ({page}) => {
  await page.emulateMedia({reducedMotion: 'reduce'});
});

/** Storybook's a11y addon runs axe as the story renders; ours waits its turn ("Axe is already running"). */
async function report(page: Page, within = '#storybook-root') {
  let found: string[] = [];
  await expect(async () => {
    found = await axeViolations(page, within);
  }).toPass();
  a11yReport(found);
}

test('Badge: a selected badge takes the value tint; Review status: Reviewed is a 14 check-circle beside To review', async ({page}) => {
  await page.goto(story('components-status-feedback-badge--selected'));
  await expect(page.getByText('Trending')).toHaveCount(2);
  const [plain, selected] = await page.getByText('Trending').all();
  const bg = (l: typeof plain) => l.evaluate(e => getComputedStyle(e.closest('.gv-pill')!).backgroundColor);
  expect(await bg(selected)).not.toBe(await bg(plain));
  await report(page);

  await page.goto(story('components-status-feedback-review-status--all-variants'));
  const reviewed = page.getByText('Reviewed');
  await expect(reviewed).toBeVisible();
  const sizes = await page.locator('#storybook-root svg').evaluateAll(svgs => svgs.map(s => s.getBoundingClientRect().width));
  expect(new Set(sizes).size).toBe(1);
  await report(page);
});
