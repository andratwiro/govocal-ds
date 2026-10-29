import {test, expect, type Page} from '@playwright/test';
import {axeViolations, a11yReport} from './axe';

const story = (id: string) => `/storybook/iframe.html?id=${id}&viewMode=story`;


const rows = (page: Page) => page.locator('.gv-data-table tbody tr');

test('collapsible search: opens from its button, Esc clears then folds, focus back on the button', async ({page}) => {
  await page.goto(story('components-forms-search-field--collapsible-story'));
  const button = page.getByRole('button', {name: 'Search ideas'});
  await button.click();
  const field = page.getByRole('searchbox', {name: 'Search ideas'});
  await expect(field).toBeFocused();
  await field.pressSequentially('park');
  await page.keyboard.press('Escape');
  await expect(field).toHaveValue('');
  await expect(field).toBeFocused();
  await page.keyboard.press('Escape');
  await expect(field).toHaveCount(0);
  await expect(page.getByRole('button', {name: 'Search ideas'})).toBeFocused();
});

test('pagination: the current page is aria-current, the ends are disabled, focus stays on the pager', async ({page}) => {
  await page.goto(story('components-navigation-pagination--middle'));
  const pager = page.getByRole('navigation', {name: 'Pagination'});
  await expect(pager.getByRole('button', {name: 'Page 6'})).toHaveAttribute('aria-current', 'page');
  await page.goto(story('components-navigation-pagination--first'));
  await expect(page.getByRole('button', {name: 'Previous page'})).toBeDisabled();
  await page.goto(story('components-navigation-pagination--last'));
  await expect(page.getByRole('button', {name: 'Next page'})).toBeDisabled();
  await page.getByRole('button', {name: 'Previous page'}).click();
  await page.getByRole('button', {name: 'Next page'}).click();
  // Arriving on the last page disables Next: focus moves to the current page, not to the body.
  await expect(page.getByRole('button', {name: 'Page 12'})).toBeFocused();
  a11yReport(await axeViolations(page, '.gv-pagination'));
});

test('table toolbar: ← → move the search caret, and leave the field only at its edge', async ({page}) => {
  await page.goto(story('components-data-display-table-toolbar--searching'));
  const field = page.getByRole('searchbox', {name: 'Search ideas'});
  await field.focus();
  await page.keyboard.press('End');
  await page.keyboard.press('ArrowLeft');
  await expect(field).toBeFocused();
  expect(await field.evaluate((e: HTMLInputElement) => e.selectionStart)).toBe(3);
  await page.keyboard.press('ArrowRight');
  await expect(field).toBeFocused();
  await page.keyboard.press('ArrowRight');
  await expect(field).not.toBeFocused();
});

test('in a panel: search, quick view and pages drive the count; the metric chip clears; rows select', async ({page}) => {
  await page.goto(story('components-data-display-data-table--in-a-panel'));
  const heading = page.getByRole('heading', {level: 3});
  await expect(heading).toHaveText('19 ideas');
  await expect(rows(page)).toHaveCount(8);
  await page.getByRole('navigation', {name: 'Idea pages'}).getByRole('button', {name: 'Page 3'}).click();
  await expect(rows(page)).toHaveCount(3);

  // A quick view adds its chip first and starts again from page 1; its × takes it away.
  await page.getByRole('button', {name: /^Unassigned/}).click();
  await expect(page.getByRole('row', {name: 'Unassigned'})).toBeVisible();
  await expect(page.getByRole('navigation', {name: 'Idea pages'}).getByRole('button', {name: 'Page 1'})).toHaveAttribute('aria-current', 'page');
  await page.getByRole('button', {name: 'Remove the Unassigned filter'}).click();
  await expect(heading).toHaveText('19 ideas');

  // Selecting rows swaps the count for the Selection bar; the tools stay.
  await rows(page).nth(0).hover();
  await rows(page).nth(0).locator('.gv-checkbox').click();
  await expect(page.getByRole('status').filter({hasText: '1 selected'})).toBeVisible();
  await expect(page.getByRole('button', {name: 'Export'})).toBeVisible();
  await page.getByRole('button', {name: 'Clear selection'}).click();
  await expect(heading).toHaveText('19 ideas');

  // Clear turns every filter off.
  await page.getByRole('button', {name: 'Clear', exact: true}).click();
  await expect(heading).toHaveText('40 ideas');
  a11yReport(await axeViolations(page, '.gv-panel'));
});
