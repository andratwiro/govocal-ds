import {test, expect, type Page} from '@playwright/test';

const GALLERY = '/storybook/iframe.html?id=foundations-illustrations--docs&viewMode=docs';
const running = (page: Page) =>
  page.$$eval('.gv-illustration', els =>
    els.map(e => e.getAnimations({subtree: true}).filter(a => a.playState === 'running').length));

test('the Illustrations gallery shows every drawing, grouped, and says it is not in Figma', async ({page}) => {
  await page.goto(GALLERY);
  await expect(page.getByText('Not in Figma: drawn from the prototype; the designer owns the drawings.')).toBeVisible();
  for (const group of ['Empty states', 'Method scenes', 'Other']) {
    await expect(page.getByRole('heading', {level: 2, name: new RegExp(`${group}$`)})).toBeVisible();
  }
  const tiles = page.locator('.gv-illus-tile');
  await expect(tiles).toHaveCount(5);
  await expect(tiles.locator('.gv-illustration > svg')).toHaveCount(5);
  // A moving drawing plays in its tile, the still one rests, and each moving tile's Still switch stops it.
  const scene = page.locator('.gv-illus-tile[data-illustration="ideation-map"]');
  await expect(scene.locator('.gv-illustration')).toHaveAttribute('data-state', 'play');
  await expect(page.locator('.gv-illus-tile[data-illustration="empty-notebook"] .gv-illustration')).toHaveAttribute('data-state', 'rest');
  await scene.getByRole('switch', {name: 'Still'}).click({force: true});
  await expect(scene.locator('.gv-illustration')).toHaveAttribute('data-state', 'rest');
  await expect(scene.getByRole('button', {name: 'Copy ideation-map'})).toBeVisible();
});

test.describe('under reduced motion', () => {
  test.use({reducedMotion: 'reduce'});
  test('every drawing shows its still and nothing runs', async ({page}) => {
    await page.goto(GALLERY);
    await expect(page.locator('.gv-illus-tile')).toHaveCount(5);
    const states = await page.$$eval('.gv-illustration', els => els.map(e => e.getAttribute('data-state')));
    expect(states).toEqual(states.map(() => 'rest'));
    expect((await running(page)).every(n => n === 0)).toBe(true);
  });
});

test('a method scene waits for the card it sits in to be hovered', async ({page}) => {
  await page.goto('/storybook/iframe.html?id=components-data-display-illustration--hover&viewMode=story');
  const art = page.locator('.gv-illustration');
  await expect(art).toHaveAttribute('data-state', 'rest');
  await page.locator('[data-illustration-host]').hover();
  await expect(art).toHaveAttribute('data-state', 'play');
  await page.mouse.move(0, 0);
  await expect(art).toHaveAttribute('data-state', 'rest');
});

test('Empty state draws the notebook, the title and the line', async ({page}) => {
  await page.goto('/storybook/iframe.html?id=components-status-feedback-empty-state--manage-tab&viewMode=story');
  await expect(page.locator('.gv-empty-state .gv-illustration[aria-hidden="true"] > svg')).toBeVisible();
  await expect(page.getByRole('heading', {level: 3, name: 'Ideas will appear here'})).toBeVisible();
  await expect(page.getByText('Once the project is live, you can review and manage ideas here')).toBeVisible();
});
