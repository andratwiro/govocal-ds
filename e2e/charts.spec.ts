import {test, expect, type Page} from '@playwright/test';
import {a11yReport, axeViolations} from './axe';

const story = (id: string) => `/storybook/iframe.html?id=${id}&viewMode=story`;
/** Open a story and wait for it to draw, so the first Tab lands in it. */
async function open(page: Page, id: string) {
  await page.goto(story(id));
  await page.locator('#storybook-root > *').first().waitFor();
}

/** Axe's findings in `within`, reported (never failing the test). Storybook's a11y addon runs axe in the preview as the
 * story renders; ours waits its turn ("Axe is already running"). */
async function report(page: Page, within: string) {
  let found: string[] = [];
  await expect(async () => { found = await axeViolations(page, within); }).toPass();
  a11yReport(found);
}

// The charts' hover and keyboard value card (Not in Figma; the prototype's dashboards have it).

test('line chart: the pointer shows the nearest point, its values and picks out the line under it', async ({page}) => {
  await open(page, 'components-charts-chart--interactive');
  const stage = page.locator('.gv-line-chart__stage');
  const card = page.locator('.gv-chart-card');
  await expect(card).toHaveCount(0);
  const box = (await stage.boundingBox())!;
  // 09 Mar is the fourth of six points (0.6 across); there Visitors stands at 9 of 12 (a quarter down), Participants
  // at 10 (a sixth down): just under Visitors' point picks Visitors.
  await page.mouse.move(box.x + box.width * 0.6, box.y + box.height * 0.28);
  await expect(card).toBeVisible();
  await expect(card).toContainText('09 Mar');
  await expect(card.locator('.gv-chart-card__row')).toHaveText(['Participants10', 'Visitors9']);
  await expect(page.locator('.gv-line-chart__x > span[data-active]')).toHaveText('09 Mar');
  await expect(page.locator('.gv-line-chart__line[data-highlighted]')).toHaveAttribute('data-chart-color', 'line-secondary');
  await expect(page.locator('.gv-line-chart__line[data-dimmed]')).toHaveAttribute('data-chart-color', 'line-primary');
  await page.mouse.move(box.x + box.width * 0.02, box.y + box.height + 120);
  await expect(card).toHaveCount(0);
  await expect(page.locator('.gv-line-chart__line[data-dimmed]')).toHaveCount(0);
});

test('line chart: one tab stop; arrows, Home and End walk the points, Esc hides the card', async ({page}) => {
  await open(page, 'components-charts-chart--interactive');
  const slider = page.getByRole('slider', {name: 'Participants and Visitors values'});
  const card = page.locator('.gv-chart-card');
  await page.keyboard.press('Tab');
  await expect(slider).toBeFocused();
  await expect(slider).toHaveAttribute('aria-valuetext', '16 Feb: Participants 1, Visitors 0');
  await expect(card).toContainText('16 Feb');
  await page.keyboard.press('ArrowRight');
  await expect(slider).toHaveAttribute('aria-valuetext', '23 Feb: Participants 0, Visitors 3');
  await page.keyboard.press('End');
  await expect(slider).toHaveAttribute('aria-valuenow', '6');
  await expect(card).toContainText('23 Mar');
  await page.keyboard.press('ArrowRight');
  await expect(slider).toHaveAttribute('aria-valuenow', '6');
  await page.keyboard.press('Escape');
  await expect(card).toHaveCount(0);
  await expect(slider).toBeFocused();
  await page.keyboard.press('ArrowLeft');
  await expect(card).toContainText('16 Mar');
  await page.keyboard.press('Home');
  await expect(slider).toHaveAttribute('aria-valuetext', '16 Feb: Participants 1, Visitors 0');
  // The chart's trend sentence stays an image's name, outside the slider.
  await expect(page.getByRole('img', {name: /^Line chart, 16 Feb to 23 Mar\. Participants/})).toBeVisible();
  await report(page, '#storybook-root');
});

test('line chart: the legend picks a series out on hover and on focus', async ({page}) => {
  await open(page, 'components-charts-chart--interactive');
  const visitors = page.locator('.gv-chart-legend__item', {hasText: 'Visitors'});
  await visitors.hover();
  await expect(page.locator('.gv-line-chart__line[data-dimmed]')).toHaveAttribute('data-chart-color', 'line-primary');
  await expect(page.locator('.gv-chart-legend__item[data-dimmed]')).toHaveText('Participants');
  await page.mouse.move(0, 0);
  await expect(page.locator('.gv-line-chart__line[data-dimmed]')).toHaveCount(0);
  await page.keyboard.press('Tab');
  await page.keyboard.press('Tab');
  await expect(page.locator('.gv-chart-legend__item', {hasText: 'Participants'})).toBeFocused();
  await expect(page.locator('.gv-line-chart__line[data-dimmed]')).toHaveAttribute('data-chart-color', 'line-secondary');
});

test('line chart: legend rows beside it pick its series out', async ({page}) => {
  await open(page, 'components-charts-chart--with-legend-rows');
  await page.locator('.gv-legend-row', {hasText: 'Project managers'}).hover();
  await expect(page.locator('.gv-legend-row[data-dimmed]')).toContainText('Admins');
  await expect(page.locator('.gv-line-chart__line[data-dimmed]')).toHaveAttribute('data-chart-color', 'line-primary');
  await page.mouse.move(0, 0);
  await page.keyboard.press('Tab');
  await expect(page.locator('.gv-legend-row', {hasText: 'Admins'})).toBeFocused();
  await expect(page.locator('.gv-line-chart__line[data-dimmed]')).toHaveAttribute('data-chart-color', 'line-secondary');
});

test('line chart: the last date stays inside the chart', async ({page}) => {
  await open(page, 'components-charts-chart--line-2-series');
  const chart = (await page.locator('.gv-line-chart').boundingBox())!;
  const last = (await page.locator('.gv-line-chart__x > span').last().boundingBox())!;
  expect(last.x + last.width).toBeLessThanOrEqual(chart.x + chart.width + 0.5);
});

test('sparkline with dates: the same card and keyboard explorer; without them, a picture', async ({page}) => {
  await open(page, 'components-charts-chart--sparkline-interactive');
  const slider = page.getByRole('slider', {name: 'Votes cast values'});
  await page.keyboard.press('Tab');
  await expect(slider).toBeFocused();
  await page.keyboard.press('End');
  await expect(slider).toHaveAttribute('aria-valuetext', '21 May: Votes cast 342');
  await expect(page.locator('.gv-chart-card')).toContainText('21 May');
  await expect(page.getByRole('img', {name: /^Votes cast rose from 12 to 342/})).toBeVisible();
  await open(page, 'components-charts-chart--sparkline');
  await expect(page.getByRole('slider')).toHaveCount(0);
});

test('bar row: hover darkens the bar and shows the exact count and share; screen readers get it with the label', async ({page}) => {
  await open(page, 'components-charts-bar-row--with-detail');
  const row = page.locator('.gv-bar-row', {hasText: 'Green Corridors'});
  const card = row.locator('.gv-chart-card');
  await expect(card).toBeHidden();
  const before = await row.locator('.gv-bar-row__fill').evaluate(el => getComputedStyle(el).backgroundColor);
  await row.hover();
  await expect(card).toBeVisible();
  await expect(card).toHaveText('822 of 3,410 inputs · 24%');
  await expect.poll(() => row.locator('.gv-bar-row__fill').evaluate(el => getComputedStyle(el).backgroundColor)).not.toBe(before);
  await expect(row.locator('.gv-bar-row__label')).toHaveText('Green Corridors, 822 of 3,410 inputs · 24%');
  await open(page, 'components-charts-bar-row--without-value');
  await expect(page.locator('.gv-bar-row__value')).toHaveCount(0);
});

test('statement row: four shares, and a hover card with every share and its count', async ({page}) => {
  await open(page, 'components-charts-statement-row--four-shares');
  const bar = page.getByRole('img', {name: '21 agree (3%), 88 disagree (14%), 12 unsure (2%), 519 not seen yet (81%)'});
  await expect(bar).toBeVisible();
  await expect(bar.locator('.gv-statement-row__bar-segment')).toHaveCount(3);
  const card = page.locator('.gv-statement-row__card');
  await expect(card).toBeHidden();
  await bar.hover();
  await expect(card.locator('.gv-chart-card__row')).toHaveText(['Agree21 · 3%', 'Disagree88 · 14%', 'Unsure12 · 2%', 'Not seen yet519 · 81%']);
});

test('dashboard card: a demographic legend row picks its share out of the stacked bar', async ({page}) => {
  await open(page, 'components-charts-dashboard-card--demographic-age');
  await page.locator('.gv-legend-row', {hasText: '35–44'}).hover();
  await expect(page.locator('.gv-dashboard-demographic__bar > span[data-dimmed]')).toHaveCount(4);
  await expect(page.locator('.gv-legend-row[data-highlighted]')).toContainText('35–44');
  await page.mouse.move(0, 0);
  await expect(page.locator('.gv-dashboard-demographic__bar > span[data-dimmed]')).toHaveCount(0);
});

test('dashboard card: the Most liked list reads each input with its reactions', async ({page}) => {
  await open(page, 'components-charts-dashboard-card--list');
  const rows = page.getByRole('region', {name: 'Most liked'}).getByRole('listitem');
  await expect(rows).toHaveCount(3);
  await expect(rows.first()).toContainText('Basketball court');
  await expect(rows.first()).toContainText('124 likes');
  await expect(rows.first()).toContainText('Viewed');
});
