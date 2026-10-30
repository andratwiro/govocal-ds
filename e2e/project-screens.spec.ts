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

test('Card, the setup row: opening by keyboard marks it Reviewed, hides its pills, and closed the pills come back teal', async ({page}) => {
  await page.goto(story('components-layout-containers-card--setup-rows'));
  const row = page.getByRole('button', {name: /^What should an input be called\?/});
  const pill = page.locator('.gv-card', {has: row}).locator('.gv-pill');
  await expect(row).toContainText('To review');
  await expect(pill).not.toHaveAttribute('data-selected');
  await row.focus();
  await page.keyboard.press('Enter');
  await expect(row).toHaveAttribute('aria-expanded', 'true');
  await expect(row).toContainText('Reviewed');
  await expect(pill).toBeHidden();
  await report(page);
  await page.keyboard.press('Enter');
  await expect(pill).toBeVisible();
  await expect(pill).toHaveAttribute('data-selected', 'true');
  // A "To set" row is one link.
  await expect(page.getByRole('link', {name: /Collect demographic data/})).toBeVisible();
});

test('Card, the setup row: the title keeps every word in a narrow column', async ({page}) => {
  await page.goto(story('components-layout-containers-card--long-title'));
  const title = page.locator('.gv-card__title');
  expect(await title.evaluate(e => e.scrollWidth <= e.clientWidth + 1)).toBe(true);
  await expect(title).toHaveText('What should an input be called?');
});

test('Card, the pick row: Enter opens the picker under the row, Esc closes it back onto the row', async ({page}) => {
  await page.goto(story('components-layout-containers-card--pick-row'));
  const row = page.getByRole('button', {name: /^Set topic tags/});
  await row.focus();
  await page.keyboard.press('Enter');
  const dialog = page.getByRole('dialog', {name: 'Set topic tags'});
  await expect(dialog).toBeVisible();
  await report(page, '.gv-card__popover--pick');
  await page.keyboard.press('Escape');
  await expect(dialog).toHaveCount(0);
  await expect(row).toBeFocused();
});

test('Card, the link rows: each next action is one link by its name', async ({page}) => {
  await page.goto(story('components-layout-containers-card--link-rows'));
  await expect(page.getByRole('link', {name: 'Message participants'})).toHaveAttribute('href', '#/messaging');
  await expect(page.getByRole('link', {name: /Create report/})).toContainText('Reading the results of this phase');
  await report(page);
});

test('Stat card: a flat sparkline under a light numeral; pressing it opens its detail by keyboard', async ({page}) => {
  await page.goto(story('patterns-project-page-stat-card--pressable'));
  const card = page.getByRole('button', {name: /Participants/});
  await expect(card.locator('.gv-sparkline__area')).toHaveCount(1);
  await expect(card.locator('linearGradient')).toHaveCount(0);
  const weight = await card.getByText('215', {exact: true}).evaluate(e => getComputedStyle(e).fontWeight);
  expect(Number(weight)).toBeLessThan(500);
  await card.focus();
  await expect(card).toBeFocused();
  await report(page);
});

test('Project header: Save saves, then reads Back to project; a mode carries its unread dot; a survey has two tabs', async ({page}) => {
  await page.goto(story('patterns-project-page-project-header--save-states'));
  const save = page.getByRole('button', {name: 'Save', exact: true});
  await expect(save).toBeEnabled();
  await save.focus();
  await page.keyboard.press('Enter');
  const back = page.getByRole('button', {name: 'Back to project'});
  await expect(back).toBeVisible();
  await back.focus();
  await page.keyboard.press('Enter');
  await expect(page.getByRole('status')).toHaveText('Back on the project');
  await report(page);

  await page.goto(story('patterns-project-page-project-header--tabs-and-unread'));
  await expect(page.getByRole('radiogroup', {name: 'Phase view'})).toHaveCount(2);
  const [ideation, survey] = await page.getByRole('radiogroup', {name: 'Phase view'}).all();
  await expect(ideation.getByRole('img', {name: 'New activity'})).toBeVisible();
  await expect(survey.getByRole('radio')).toHaveCount(2);
  await report(page);
});

test('Rail header: the title is a heading and the buttons say what they do', async ({page}) => {
  await page.goto(story('patterns-project-rail-rail-header--with-panel-toggle'));
  await expect(page.getByRole('heading', {level: 2})).toBeVisible();
  await expect(page.getByRole('button', {name: 'Hide the participation rail'})).toBeVisible();
  await report(page);
});

test('Workspace layout: named regions; the rail collapses to a strip whose button opens it again by keyboard', async ({page}) => {
  await page.goto(story('components-layout-containers-workspace-layout--build'));
  await expect(page.getByRole('complementary', {name: 'Participation'})).toBeVisible();
  await expect(page.getByRole('region', {name: 'Proposals setup'})).toBeVisible();
  await report(page);
  await page.getByRole('button', {name: 'Hide the participation rail'}).click();
  await expect(page.getByRole('complementary', {name: 'Participation'})).toHaveCount(0);
  const show = page.getByRole('button', {name: 'Show panel'});
  await show.focus();
  await page.keyboard.press('Enter');
  await expect(page.getByRole('complementary', {name: 'Participation'})).toBeVisible();
});

test('Phone phase card: a numbered phase heading and its dates, first on the phone', async ({page}) => {
  await page.goto(story('patterns-project-page-phone-phase-card--in-the-phone'));
  await expect(page.getByRole('heading', {name: '3. Shortlist proposals'})).toBeVisible();
  await expect(page.getByText('28 Sep 2026 – 18 Oct 2026')).toBeVisible();
  await report(page);
});

test('Phone preview: a logo mark, the stage toolbar switches by keyboard, the countdown stays pinned', async ({page}) => {
  await page.goto(story('patterns-project-page-phone-preview--stage-toolbar'));
  await expect(page.getByRole('img', {name: 'Larkvale'})).toBeVisible();
  const open = page.getByRole('radio', {name: 'Open'});
  await expect(open).toBeChecked();
  await open.focus();
  await page.keyboard.press('ArrowRight');
  await page.keyboard.press('Enter');
  await expect(page.getByRole('radio', {name: 'Ended'})).toBeChecked();
  await expect(page.getByText('2 weeks left')).toBeInViewport();
  await report(page);
});

test('Phase timeline: the Events section lists events as links, with no dot and no guide line', async ({page}) => {
  await page.goto(story('patterns-project-rail-phase-timeline--events'));
  const event = page.getByRole('link', {name: /Walk along the river/});
  await expect(event).toContainText('Done · 10 Sep');
  const dot = page.locator('.gv-rail-phase[data-kind="event"] .gv-rail-phase__dot').first();
  await expect(dot).toBeHidden();
  await event.focus();
  await expect(event).toBeFocused();
  await report(page);
});

test('Method card: one button named by its method, pressed by keyboard', async ({page}) => {
  await page.goto(story('patterns-project-page-method-card--all-variants'));
  const card = page.getByRole('button', {name: 'Ideation and geo mapping'});
  await expect(card).toHaveAccessibleDescription(/share input on any topic/);
  await card.focus();
  await expect(card).toBeFocused();
  await page.keyboard.press('Tab');
  await expect(page.getByRole('button', {name: 'Survey'})).toBeFocused();
  await report(page);
});
