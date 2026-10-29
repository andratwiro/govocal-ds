import {test, expect, type Page} from '@playwright/test';

const modal = '/storybook/iframe.html?id=base-modal--example&viewMode=story';
// A token's value in ms (the build's minifier writes 200ms as .2s).
const token = async (page: Page, name: string) => {
  const value = await page.evaluate(n => getComputedStyle(document.documentElement).getPropertyValue(n).trim(), name);
  const [, n, unit] = value.match(/^(\d*\.?\d+)(ms|s)$/) ?? [];
  return unit === 's' ? Number(n) * 1000 : Number(n);
};

// Records the computed animation of every overlay part while React Aria marks it entering or exiting (the
// attribute is gone once the animation ends, so it is read in the MutationObserver, before the next frame).
const recordOverlayAnimations = (page: Page) => page.addInitScript(() => {
  const seen: {state: string; part: string; name: string; duration: string}[] = [];
  (window as unknown as {seen: typeof seen}).seen = seen;
  const look = (el: Element) => {
    for (const state of ['entering', 'exiting']) {
      if (!el.hasAttribute(`data-${state}`) || !/react-aria-Modal/.test(el.className)) continue;
      const style = getComputedStyle(el);
      seen.push({state, part: el.className.split(' ')[0], name: style.animationName, duration: style.animationDuration});
    }
  };
  new MutationObserver(records => {
    for (const r of records) {
      if (r.type === 'attributes') look(r.target as Element);
      for (const n of r.addedNodes) if (n instanceof Element) [n, ...n.querySelectorAll('*')].forEach(look);
    }
  }).observe(document, {subtree: true, childList: true, attributes: true, attributeFilter: ['data-entering', 'data-exiting']});
});
const seen = (page: Page) => page.evaluate(() =>
  (window as unknown as {seen: {state: string; part: string; name: string; duration: string}[]}).seen);

async function openAndClose(page: Page) {
  await page.getByRole('button', {name: 'Sign up…'}).click();
  const dialog = page.getByRole('dialog');
  await expect(dialog).toBeVisible();
  await page.getByRole('button', {name: 'Submit'}).click();
  // React Aria removes the Modal only once its exit animation has ended.
  await expect(dialog).toHaveCount(0);
  await expect(page.locator('.react-aria-ModalOverlay')).toHaveCount(0);
}

test('the Motion page lists the tokens, Not in Figma', async ({page}) => {
  await page.goto('/storybook/iframe.html?id=foundations-motion--docs&viewMode=docs');
  await expect(page.getByRole('heading', {level: 1, name: 'Motion'})).toBeVisible();
  await expect(page.getByText('Not in Figma.')).toBeVisible();
  for (const name of ['--gv-motion-duration-fast', '--gv-motion-duration-loop', '--gv-motion-easing-standard', '--gv-motion-easing-move'])
    await expect(page.getByText(name, {exact: true}).first()).toBeVisible();
  await expect(page.getByRole('heading', {name: 'Reduced motion'})).toBeVisible();
});

test('the Modal enters and leaves on the motion tokens', async ({page}) => {
  await recordOverlayAnimations(page);
  await page.goto(modal);
  expect(await token(page, '--gv-motion-duration-medium')).toBe(200);
  await openAndClose(page);
  expect(await seen(page)).toEqual(expect.arrayContaining([
    {state: 'entering', part: 'react-aria-ModalOverlay', name: 'modal-fade', duration: '0.2s'},
    {state: 'entering', part: 'react-aria-Modal', name: 'modal-zoom', duration: '0.2s'},
    {state: 'exiting', part: 'react-aria-ModalOverlay', name: 'modal-fade-out', duration: '0.12s'}
  ]));
});

test('reduced motion: the durations resolve to 1ms, and the Modal still opens and closes', async ({page}) => {
  await page.emulateMedia({reducedMotion: 'reduce'});
  await recordOverlayAnimations(page);
  await page.goto(modal);
  for (const name of ['fast', 'medium', 'slow']) expect(await token(page, `--gv-motion-duration-${name}`)).toBe(1);
  expect(await token(page, '--gv-motion-duration-loop')).toBe(1600); // loops are stopped by their component instead
  await openAndClose(page);
  expect(await seen(page)).toEqual(expect.arrayContaining([
    {state: 'entering', part: 'react-aria-ModalOverlay', name: 'modal-fade', duration: '0.001s'},
    {state: 'exiting', part: 'react-aria-ModalOverlay', name: 'modal-fade-out', duration: '0.001s'}
  ]));
});
