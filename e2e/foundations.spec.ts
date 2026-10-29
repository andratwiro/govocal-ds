import {test, expect, type Page} from '@playwright/test';

const docs = (id: string) => `/storybook/iframe.html?id=${id}--docs&viewMode=docs`;

// Every element in the docs page that scrolls on its own: the page itself should be the only scroller.
const innerScrollers = (page: Page) => page.locator('#storybook-docs').evaluate(root =>
  [...root.querySelectorAll<HTMLElement>('*')]
    .filter(el => /auto|scroll/.test(getComputedStyle(el).overflowY) && el.scrollHeight > el.clientHeight + 1)
    .map(el => `${el.tagName.toLowerCase()}.${el.className} ${el.scrollHeight} > ${el.clientHeight}`));

// Each Foundations page: its first token block shows whole (first and last token, which a capped, virtualised
// table never renders together), and nothing inside the page scrolls.
const pages = [
  {id: 'foundations-colour', first: '--gv-color-slate-50', last: '--gv-color-olive-500'},
  {id: 'foundations-typography', first: '--gv-font-family', last: '--gv-font-weight-regular'},
  {id: 'foundations-spacing', first: '--gv-space-0', last: '--gv-space-104'},
  {id: 'foundations-radius', first: '--gv-radius-2', last: '--gv-radius-full'},
  {id: 'foundations-shadows', first: '--gv-shadow-raised-strong', last: '--gv-shadow-overlay'},
  {id: 'foundations-size', first: '--gv-size-icon-12', last: '--gv-size-avatar-28'},
  {id: 'foundations-focus-and-states', first: '--gv-opacity-disabled', last: '--gv-opacity-dimmed'}
];
for (const {id, first, last} of pages) {
  test(`${id} shows its first token block whole, with no scroll box inside`, async ({page}) => {
    await page.goto(docs(id));
    await expect(page.getByText(first, {exact: true}).first()).toBeVisible();
    await expect(page.getByText(last, {exact: true}).first()).toBeVisible();
    await expect(page.locator('.design-token-container').first()).toBeVisible();
    await expect.poll(() => innerScrollers(page)).toEqual([]);
  });
}

test('Colour shows the grammar, the intents, the ladders, what is Not in Figma and the renames', async ({page}) => {
  await page.goto(docs('foundations-colour'));
  // By id: a docs heading's accessible name also carries its "Copy heading URL" link.
  for (const id of ['intents', 'neutral-ladders', 'surface', 'text', 'icon', 'border', 'side-nav', 'chart', 'not-in-figma',
    'renamed', 'primitives-dont-paint-with-these'])
    await expect(page.locator(`:is(h2, h3)#${id}`)).toBeVisible();
  // The grammar's words, an intent's solid fill in its cell, the chart palette, an old name in the Renamed table.
  await expect(page.getByRole('cell', {name: /focused/}).first()).toBeVisible();
  await expect(page.locator('.gv-tokens-intents').getByText('--gv-surface-danger-strong', {exact: true})).toBeVisible();
  await expect(page.getByText('--gv-chart-terracotta', {exact: true}).first()).toBeVisible();
  await expect(page.locator('.gv-tokens-renamed').getByText('--gv-action-primary', {exact: true})).toBeVisible();
  // No old group is left on the page.
  for (const id of ['action', 'control', 'state', 'avatar', 'divider']) await expect(page.locator(`#${id}`)).toHaveCount(0);
});

test('Typography draws each role in itself before the tables', async ({page}) => {
  await page.goto(docs('foundations-typography'));
  const stat = page.locator('.gv-tokens-role').first();
  await expect(stat).toContainText('28/32 Regular');
  await expect(stat.locator('.gv-tokens-role__sample')).toHaveCSS('font-size', '28px');
  // Nine interface roles, then a document's four (themed per platform), each list drawn in its own family.
  await expect(page.locator('.gv-tokens-role')).toHaveCount(13);
  const display = page.locator('.gv-tokens-role').filter({hasText: '--gv-type-document-display'});
  await expect(display).toContainText('44/52 Medium');
  await expect(display.locator('.gv-tokens-role__sample')).toHaveCSS('font-size', '44px');
  // What a role is for is its token's description, not a list in the page.
  await expect(stat.locator('.gv-tokens-role__use')).toContainText('Big numbers');
  await expect(page.getByText('--gv-font-weight-regular', {exact: true}).first()).toBeVisible();
});

test('Size draws each size at its token, above its table', async ({page}) => {
  await page.goto(docs('foundations-size'));
  const control = page.locator('.gv-tokens-sizes--control .gv-tokens-size__sample');
  await expect(control).toHaveCount(5);
  await expect(control.nth(3)).toHaveCSS('height', '36px');
  await expect(page.locator('.gv-tokens-sizes--icon svg').nth(2)).toHaveCSS('width', '16px');
  await expect(page.locator('.gv-tokens-sizes--avatar .gv-tokens-size__sample').last()).toHaveCSS('width', '28px');
});

test('Focus and states draws the ring on a button, a field and a row, and disabled at 45%', async ({page}) => {
  await page.goto(docs('foundations-focus-and-states'));
  const focused = page.locator('.gv-tokens-state--focus, .gv-tokens-state--focus-inset');
  await expect(focused).toHaveCount(3);
  for (const el of await focused.all()) await expect(el).toHaveCSS('outline-width', '2px');
  await expect(page.locator('.gv-tokens-state--focus-inset')).toHaveCSS('outline-offset', '-2px');
  await expect(page.locator('.gv-tokens-state--disabled')).toHaveCSS('opacity', '0.45');
  await expect(page.getByText('--gv-layer-overlay', {exact: true})).toBeVisible();
});

test('Icons lists the Figma names, with no scroll box inside', async ({page}) => {
  await page.goto(docs('foundations-icons'));
  await expect(page.getByText('In Figma', {exact: true}).first()).toBeVisible();
  await expect(page.getByText('x', {exact: true}).first()).toBeVisible();
  await expect.poll(() => innerScrollers(page)).toEqual([]);
});

test('the sidebar has Foundations as its own section, in order', async ({page}) => {
  await page.goto('/storybook/?path=/docs/foundations-colour--docs');
  const tree = page.locator('#storybook-explorer-tree');
  await expect(tree.locator('[data-item-id="foundations-colour--docs"]')).toBeVisible();
  const ids = await tree.locator('[data-item-id^="foundations-"]').evaluateAll(els =>
    els.map(el => el.getAttribute('data-item-id')));
  // The named pages first (.storybook/preview.tsx), then the rest alphabetically.
  const order = ['colour', 'typography', 'spacing', 'radius', 'shadows', 'motion', 'icons', 'illustrations',
    'focus-and-states', 'size', 'voice-and-tone', 'word-list'];
  const pagesShown = ids.map(id => id!.replace(/^foundations-|--docs$/g, ''));
  expect(pagesShown).toEqual(order.filter(name => pagesShown.includes(name)));
  expect(pagesShown).toEqual(expect.arrayContaining(['colour', 'typography', 'spacing', 'radius', 'shadows', 'icons']));
});

test('old Foundations and Icons links land on the new pages', async ({page}) => {
  await page.goto('/storybook/?path=/docs/overview-foundations--docs');
  await expect(page).toHaveURL(/path=\/docs\/foundations-colour--docs/);
  await expect(page.frameLocator('#storybook-preview-iframe').getByRole('heading', {level: 1, name: 'Colour'}))
    .toBeVisible();
  await page.goto('/storybook/?path=/docs/overview-icons--docs');
  await expect(page).toHaveURL(/path=\/docs\/foundations-icons--docs/);
});

test('the Welcome Foundations card opens Colour', async ({page}) => {
  await page.goto('/storybook/?path=/docs/overview-welcome--docs');
  await page.frameLocator('#storybook-preview-iframe').getByRole('link', {name: /^Foundations/}).click();
  await expect(page).toHaveURL(/path=\/docs\/foundations-colour--docs/);
});

test('the manager wears Go Vocal\'s mark and name', async ({page}) => {
  await page.goto('/storybook/');
  const brand = page.getByRole('link', {name: 'Go Vocal Design system'});
  await expect(brand).toHaveAttribute('href', '../');
  await expect(brand.getByAltText('Go Vocal')).toBeVisible();
  await expect(brand.getByText('Design system', {exact: true})).toBeVisible();
  await expect(page.locator('link[rel=icon]')).toHaveAttribute('href', './favicon.svg');
  expect(await (await page.request.get('/storybook/favicon.svg')).text()).toContain('<title>Go Vocal</title>');
});

test('Storybook opens on Welcome, first in the sidebar', async ({page}) => {
  await page.goto('/storybook/');
  await expect(page).toHaveURL(/path=\/docs\/overview-welcome--docs/);
  await expect(page.locator('#storybook-explorer-tree .sidebar-item').first())
    .toHaveAttribute('data-item-id', 'overview-welcome--docs');
  const welcome = page.frameLocator('#storybook-preview-iframe');
  await expect(welcome.getByRole('heading', {level: 1, name: 'Go Vocal design system'})).toBeVisible();
  await expect(welcome.getByRole('link', {name: /^Back office/})).toHaveAttribute('href', '../backoffice/');
});

test('a Welcome card opens its whole section, whatever its first entry is called', async ({page}) => {
  await page.goto('/storybook/?path=/docs/overview-welcome--docs');
  await page.frameLocator('#storybook-preview-iframe').getByRole('link', {name: /^Components/}).click();
  await expect(page).toHaveURL(/path=\/docs\/components-[^&]+--docs/);
});
