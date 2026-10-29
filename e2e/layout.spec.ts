import {test, expect, type Page} from '@playwright/test';

// The layout parts place by their props alone: the regions land where the props say, a token apart, and the
// landmarks and lists they render are what assistive technology reads.
const story = (id: string) => `/storybook/iframe.html?id=components-layout-containers-${id}&viewMode=story`;
async function open(page: Page, id: string) {
  await page.goto(story(id));
  await page.locator('#storybook-root > *').first().waitFor();
}

test('grid: the list sits beside its detail, 16 apart, under a full-width head', async ({page}) => {
  await page.setViewportSize({width: 1200, height: 800});
  await open(page, 'grid--list-and-detail');
  const head = await page.getByRole('heading', {name: 'Inputs', exact: true}).boundingBox();
  const list = await page.getByRole('heading', {name: 'All inputs'}).boundingBox();
  const detail = page.getByRole('complementary', {name: 'Selected input'});
  await expect(detail).toBeVisible();
  const box = (await detail.boundingBox())!;
  expect(Math.round(box.width)).toBe(360);
  expect(list!.y).toBeGreaterThan(head!.y);
  expect(box.x).toBeGreaterThan(list!.x);
});

test('grid: a field with columnSpan="all" spans both columns of the form', async ({page}) => {
  await open(page, 'grid--two-column-form');
  const form = page.getByRole('form', {name: 'Project details'});
  const first = (await form.getByRole('textbox', {name: 'First name'}).boundingBox())!;
  const last = (await form.getByRole('textbox', {name: 'Last name'}).boundingBox())!;
  const email = (await form.getByRole('textbox', {name: 'Email'}).boundingBox())!;
  expect(Math.round(first.y)).toBe(Math.round(last.y));
  expect(last.x - (first.x + first.width)).toBeCloseTo(24, 0);
  expect(email.width).toBeCloseTo(last.x + last.width - first.x, 0);
});

test('stack: a form\'s fields one under another, 16 apart; the buttons at the end of their row', async ({page}) => {
  await open(page, 'stack--form-fields');
  const form = page.getByRole('form', {name: 'New project'});
  const fields = form.locator(':scope > *');
  const a = (await fields.nth(0).boundingBox())!;
  const b = (await fields.nth(1).boundingBox())!;
  expect(b.y - (a.y + a.height)).toBeCloseTo(16, 0);
  const create = (await form.getByRole('button', {name: 'Create project'}).boundingBox())!;
  const formBox = (await form.boundingBox())!;
  expect(formBox.x + formBox.width - (create.x + create.width)).toBeCloseTo(24, 0);
});

test('inline: a list of topics that wraps onto a second line, still one list', async ({page}) => {
  await open(page, 'inline--wrapping');
  const list = page.getByRole('list', {name: 'Topics'});
  await expect(list.getByRole('listitem')).toHaveCount(8);
  const ys = new Set(await list.getByRole('listitem').evaluateAll(els => els.map(e => Math.round(e.getBoundingClientRect().y))));
  expect(ys.size).toBeGreaterThan(1);
});
