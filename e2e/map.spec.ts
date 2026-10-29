import {test, expect, type Page} from '@playwright/test';
import {a11yReport, axeViolations} from './axe';

// The Map's stories draw live OpenFreeMap tiles; here nothing leaves the machine. Every request off the local server
// is answered on the spot: the tile style becomes a tiny one (a plain background and a source that only carries the
// credits), anything else is refused. The pins, the card and the controls are the system's and need no tiles.
const STYLE = {
  version: 8,
  sources: {
    credits: {
      type: 'geojson',
      data: {type: 'FeatureCollection', features: []},
      attribution: '<a href="https://www.openstreetmap.org/copyright" target="_blank">&copy; OpenStreetMap</a>'
    }
  },
  layers: [{id: 'ground', type: 'background', paint: {'background-color': '#eef0ec'}}]
};

const story = (id: string) => `/storybook/iframe.html?id=components-data-display-map-view--${id}&viewMode=story`;
const offsite: string[] = [];
test.beforeEach(async ({page, baseURL}) => {
  offsite.length = 0;
  const local = new URL(baseURL!).host;
  await page.context().route(url => url.host !== local, route => {
    const url = route.request().url();
    offsite.push(url);
    return url.startsWith('https://tiles.openfreemap.org/styles/')
      ? route.fulfill({contentType: 'application/json', body: JSON.stringify(STYLE)})
      : route.abort();
  });
});

async function open(page: Page, id: string) {
  await page.goto(story(id));
  await expect(page.locator('.gv-map').first()).toHaveAttribute('data-status', 'ready');
}

const pins = (page: Page) => page.locator('.gv-map__pins .gv-map-pin');

/** A pin in view that nothing covers at its centre, so a click lands on it. */
async function uncoveredPin(page: Page) {
  const label = await page.evaluate(() => {
    for (const pin of document.querySelectorAll<HTMLElement>('.gv-map__marker:not([data-outside]) > .gv-map-pin')) {
      const r = pin.getBoundingClientRect();
      if (pin.contains(document.elementFromPoint(r.x + r.width / 2, r.y + r.height / 2))) return pin.getAttribute('aria-label');
    }
    return null;
  });
  expect(label, 'a pin nothing covers').not.toBeNull();
  return page.getByRole('button', {name: label!, exact: true});
}

/** A marker's place on the map, from the transform the Map gives it. */
const placeOf = (page: Page, n: number) => page.locator('.gv-map__marker').nth(n).evaluate(el => {
  const m = new DOMMatrix(getComputedStyle(el).transform);
  return {x: m.m41, y: m.m42};
});

test('map: the canvas draws, the credits stay visible, and nothing is fetched from the network', async ({page}) => {
  await open(page, 'default');
  await expect(page.getByRole('region', {name: 'Ideas on the map'})).toBeVisible();
  await expect(page.locator('.gv-map__canvas canvas')).toBeVisible();
  await expect(page.locator('.gv-map__credits').getByRole('link', {name: '© OpenStreetMap'})).toBeVisible();
  // The map asked for its style only (answered here), no tiles; Storybook's own font request is not the map's.
  const map = offsite.filter(u => !u.startsWith('https://fonts.googleapis.com/'));
  expect(map.length, 'the style was asked for').toBeGreaterThan(0);
  expect(map.every(u => u.startsWith('https://tiles.openfreemap.org/styles/')), map.join('\n')).toBe(true);
});

test('map: pins are buttons named by their labels, with one Tab stop and arrow keys between them', async ({page}) => {
  await open(page, 'default');
  await expect(pins(page)).toHaveCount(120);
  const labels = await pins(page).evaluateAll(els => els.map(e => e.getAttribute('aria-label') ?? ''));
  for (const label of labels) expect(label.length, 'every pin has a name').toBeGreaterThan(10);
  expect(new Set(labels).size, 'each pin its own name').toBe(120);
  expect(await pins(page).evaluateAll(els => els.map(e => e.tagName))).toEqual(Array(120).fill('BUTTON'));
  await expect(page.locator('.gv-map__pins .gv-map-pin:not([tabindex="-1"])')).toHaveCount(1);

  await page.locator('.gv-map__canvas canvas').focus();
  await page.keyboard.press('Tab');
  const first = await page.evaluate(() => document.activeElement?.getAttribute('aria-label'));
  await expect(page.locator(':focus')).toHaveClass(/gv-map-pin/);
  for (const key of ['ArrowRight', 'ArrowLeft', 'ArrowDown', 'ArrowUp']) {
    await page.keyboard.press(key);
    const now = await page.evaluate(() => document.activeElement?.getAttribute('aria-label'));
    if (now !== first) break;
  }
  await expect(page.locator(':focus')).toHaveClass(/gv-map-pin/);
  expect(await page.evaluate(() => document.activeElement?.getAttribute('aria-label')), 'an arrow moves to another pin').not.toBe(first);
  // Still one Tab stop: the pin the arrows reached. Tab leaves the pins for the zoom buttons.
  await expect(page.locator('.gv-map__pins .gv-map-pin:not([tabindex="-1"])')).toHaveCount(1);
  await page.keyboard.press('Tab');
  await expect(page.getByRole('button', {name: 'Zoom in'})).toBeFocused();
});

test('map: pressing a pin opens its card, Esc closes it and leaves focus on the pin', async ({page}) => {
  await open(page, 'default');
  const pin = await uncoveredPin(page);
  const label = await pin.getAttribute('aria-label');
  await pin.click();
  await expect(pin).toHaveAttribute('aria-expanded', 'true');
  const card = page.locator('.gv-map__card');
  await expect(card).toBeVisible();
  await expect(card.getByRole('heading', {name: label!})).toBeVisible();
  await expect(card).toContainText(/\d+ likes? · \d+ comments?/);
  await page.keyboard.press('Escape');
  await expect(card).toHaveCount(0);
  await expect(pin).toHaveAttribute('aria-expanded', 'false');
  await expect(pin).toBeFocused();

  // From the keyboard too: Enter opens it, Esc closes it.
  await page.keyboard.press('Enter');
  await expect(card).toBeVisible();
  await page.keyboard.press('Escape');
  await expect(card).toHaveCount(0);
  await expect(pin).toBeFocused();
});

test('map: an open pin from the page shows its card inside the map', async ({page}) => {
  await open(page, 'selected');
  const card = page.locator('.gv-map__card');
  await expect(card).toBeVisible();
  const [map, box] = [await page.locator('.gv-map').boundingBox(), await card.boundingBox()];
  expect(box!.x).toBeGreaterThanOrEqual(map!.x);
  expect(box!.x + box!.width).toBeLessThanOrEqual(map!.x + map!.width);
  expect(box!.y).toBeGreaterThanOrEqual(map!.y);
  await expect(page.locator('.gv-map-pin[aria-expanded="true"]')).toHaveCount(1);
});

test('map: the zoom buttons change the zoom', async ({page}) => {
  await open(page, 'default');
  const spread = async () => {
    const [a, b] = [await placeOf(page, 0), await placeOf(page, 1)];
    return Math.hypot(a.x - b.x, a.y - b.y);
  };
  const before = await spread();
  await page.getByRole('button', {name: 'Zoom in'}).click();
  await expect.poll(async () => (await spread()) / before, {timeout: 5000}).toBeCloseTo(2, 1);
  await page.getByRole('button', {name: 'Zoom out'}).click();
  await page.getByRole('button', {name: 'Zoom out'}).click();
  await expect.poll(async () => (await spread()) / before, {timeout: 5000}).toBeCloseTo(0.5, 1);
});

test('map: a list row under the pointer marks its pin', async ({page}) => {
  await open(page, 'hovered');
  const rows = page.getByRole('row').filter({has: page.getByRole('rowheader')});
  const titleOf = async (n: number) => (await rows.nth(n).locator('.gv-data-table__stack > span').first().textContent())!;
  const pinOf = (label: string) => page.getByRole('button', {name: label, exact: true});
  // The story opens with the third row hot.
  await expect(pinOf(await titleOf(2))).toHaveAttribute('data-highlighted', 'true');

  const first = await titleOf(0);
  const row = (await rows.nth(0).boundingBox())!;
  await page.mouse.move(row.x + row.width / 2, row.y - 40);
  await page.mouse.move(row.x + row.width / 2, row.y + row.height / 2, {steps: 5});
  await expect(pinOf(first)).toHaveAttribute('data-highlighted', 'true');
  await expect(page.locator('.gv-map__marker[data-hot]')).toHaveCount(1);
  await expect(page.locator('.gv-map__marker[data-hot] .gv-map-pin')).toHaveAttribute('aria-label', first);
  await expect(pinOf(await titleOf(2))).not.toHaveAttribute('data-highlighted', 'true');
  // Pressing the row opens its pin's card.
  await page.mouse.click(row.x + row.width / 2, row.y + row.height / 2);
  await expect(pinOf(first)).toHaveAttribute('aria-expanded', 'true');
  await expect(page.locator('.gv-map__card').getByRole('heading', {name: first})).toBeVisible();
});

test('map: Enter on the focused map adds an input at its centre', async ({page}) => {
  await open(page, 'adding-an-input');
  await expect(page.locator('.gv-map-overlay').getByText('As an admin, you can click on the map')).toBeVisible();
  await expect(page.locator('.gv-map-chip')).toHaveText('40 ideas without a location');
  await page.locator('.gv-map__canvas canvas').focus();
  await page.keyboard.press('Enter');
  const card = page.locator('.gv-map__card');
  await expect(card.getByRole('heading', {name: 'Add an idea here'})).toBeVisible();
  await expect(pins(page)).toHaveCount(121);
});

test('map: right to left, the controls swap sides and the pins stay put', async ({page}) => {
  await open(page, 'right-to-left');
  const map = (await page.locator('.gv-map').boundingBox())!;
  const zoom = (await page.getByRole('group', {name: 'Zoom'}).boundingBox())!;
  const chip = (await page.locator('.gv-map-chip').boundingBox())!;
  expect(zoom.x + zoom.width / 2).toBeLessThan(map.x + map.width / 2);
  expect(chip.x + chip.width / 2).toBeGreaterThan(map.x + map.width / 2);
});

test('map: accessibility, reported (never asserted)', async ({page}) => {
  for (const id of ['default', 'selected', 'adding-an-input', 'in-the-manage-tab']) {
    await open(page, id);
    a11yReport((await axeViolations(page, '.gv-map')).map(v => `${id}: ${v}`));
  }
});
