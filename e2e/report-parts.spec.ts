import {test, expect, type Page} from '@playwright/test';
import {a11yReport, axeViolations} from './axe';

// The report builder's parts (benchmark-gaps plan, Task 8d): Page stage, Zoom bar, Block frame, the floating Rich text
// toolbar and inline editor, the plain Stat tile, Figure, Quote and Sortable list, found by role and name.
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

test('page stage: zoom steps scale the sheets, Fit fills the width, the page line follows the scroll', async ({page}) => {
  await open(page, 'components-layout-containers-page-stage--default');
  const stage = page.getByRole('region', {name: 'Pages'});
  const bar = page.getByRole('toolbar', {name: 'Zoom and pages'});
  await expect(stage.getByRole('article')).toHaveCount(3);
  await expect(bar).toContainText('83%');
  await expect(bar).toContainText('Page 1 of 3');
  const sheet = stage.getByRole('article', {name: 'Page 2'});
  const before = (await sheet.boundingBox())!.width;
  await bar.getByRole('button', {name: 'Zoom in'}).click();
  await expect(bar).toContainText('100%');
  expect((await sheet.boundingBox())!.width).toBeGreaterThan(before);
  // Fit: a sheet as wide as the stage less its padding; then Fit is off.
  const fit = bar.getByRole('button', {name: 'Fit'});
  await fit.click();
  await expect(fit).toBeDisabled();
  const stageBox = (await stage.boundingBox())!;
  const fitted = (await sheet.boundingBox())!.width;
  expect(fitted).toBeLessThanOrEqual(stageBox.width);
  expect(fitted).toBeGreaterThan(stageBox.width - 100);
  // Scroll to the last page: the page line follows.
  await stage.getByRole('article', {name: 'Page 3'}).scrollIntoViewIfNeeded();
  await stage.evaluate(el => el.scrollTo(0, el.scrollHeight));
  await expect(bar).toContainText('Page 3 of 3');
  // The cover has no footer; the others show the title and the number.
  await expect(stage.getByRole('article', {name: 'Page 1'}).locator('footer')).toHaveCount(0);
  await expect(sheet.locator('footer')).toHaveText(/Moving the city 2026\s*2/);
  await report(page);
});

test('page stage: a sheet is the document paper on the tertiary stage, in the document type', async ({page}) => {
  await open(page, 'components-layout-containers-page-stage--zoomed-out');
  const sheet = page.getByRole('article', {name: 'Page 2'});
  await expect(sheet).toHaveCSS('background-color', 'rgb(255, 255, 255)');
  await expect(page.getByRole('heading', {name: 'Moving the city 2026'})).toHaveCSS('font-size', '44px');
  await expect(page.getByRole('heading', {name: 'Executive summary'})).toHaveCSS('font-size', '28px');
});

test('page stage: right to left puts the footer title at the right', async ({page}) => {
  await open(page, 'components-layout-containers-page-stage--right-to-left');
  // Right to left is Arabic: the page is named and numbered in Arabic digits.
  await expect(page.locator('html')).toHaveAttribute('dir', 'rtl');
  const foot = page.getByRole('article', {name: 'Page ٢'}).locator('footer');
  await expect(foot.locator('span').last()).toHaveText('٢');
  const title = (await foot.getByText('Moving the city 2026').boundingBox())!;
  const number = (await foot.locator('span').last().boundingBox())!;
  expect(title.x).toBeGreaterThan(number.x);
  await report(page);
});

test('zoom bar: − and + stop at the ends, and the arrow keys move between the buttons', async ({page}) => {
  await open(page, 'components-layout-containers-zoom-bar--at-the-ends');
  const [low, high] = await page.getByRole('toolbar', {name: 'Zoom and pages'}).all();
  await expect(low.getByRole('button', {name: 'Zoom out'})).toBeDisabled();
  await expect(low.getByRole('button', {name: 'Zoom in'})).toBeEnabled();
  await expect(high.getByRole('button', {name: 'Zoom in'})).toBeDisabled();
  await open(page, 'components-layout-containers-zoom-bar--live');
  const bar = page.getByRole('toolbar', {name: 'Zoom and pages'});
  await page.keyboard.press('Tab');
  await expect(bar.getByRole('button', {name: 'Zoom out'})).toBeFocused();
  await page.keyboard.press('Enter');
  await expect(bar).toContainText('67%');
  await page.keyboard.press('ArrowRight');
  await expect(bar.getByRole('button', {name: 'Zoom in'})).toBeFocused();
  await report(page);
});

test('zoom bar: German numbers and words', async ({page}) => {
  await page.goto(`${story('components-layout-containers-zoom-bar--translated')}&globals=locale:de-DE`);
  const bar = page.getByRole('toolbar', {name: 'Zoom und Seiten'});
  await expect(bar).toContainText('83 %');
  await expect(bar).toContainText('Seite 3 von 1.284');
});
