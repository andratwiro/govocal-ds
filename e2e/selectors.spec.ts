import {test, expect, type Page} from '@playwright/test';

// The selectors' keyboard contracts: Select with a search, the Option list, the Tag picker and the Setup step's picker.
const story = (page: Page, id: string) => page.goto(`/storybook/iframe.html?id=${id}&viewMode=story`);
const active = (page: Page) => page.evaluate(() => {
  const a = document.activeElement;
  const ad = a?.getAttribute('aria-activedescendant');
  return {focus: a?.getAttribute('aria-label') ?? a?.textContent?.trim() ?? '', virtual: ad ? document.getElementById(ad)?.textContent?.trim() : undefined};
});

test('Select with search: arrows move while typing, Enter chooses, nothing found says No results', async ({page}) => {
  await story(page, 'components-forms-select--with-search');
  const trigger = page.getByRole('button', {name: /Space/});
  await trigger.focus();
  await page.keyboard.press('Enter');
  const search = page.getByRole('searchbox', {name: 'Search spaces'});
  await expect(search).toBeFocused();
  await page.keyboard.type('c');
  await page.keyboard.press('ArrowDown');
  await expect.poll(async () => (await active(page)).virtual).toBeTruthy();
  const first = (await active(page)).virtual;
  await page.keyboard.press('ArrowDown');
  await expect.poll(async () => (await active(page)).virtual).not.toBe(first);
  const second = (await active(page)).virtual;
  await expect(search).toBeFocused();
  await page.keyboard.press('Enter');
  await expect(trigger).toBeFocused();
  await expect(trigger).toContainText(second!);

  await page.keyboard.press('Enter');
  await page.keyboard.type('zzz');
  await expect(page.getByRole('listbox', {name: 'Space'})).toContainText('No results');
  await page.keyboard.press('Escape');
  await expect(search).toHaveValue('');
  await page.keyboard.press('Escape');
  await expect(trigger).toBeFocused();
});

test('Select: the chosen option carries the check', async ({page}) => {
  await story(page, 'components-forms-select--field');
  await page.getByRole('button', {name: /Status/}).click();
  const chosen = page.getByRole('option', {name: 'Viewed'});
  await expect(chosen).toHaveAttribute('aria-selected', 'true');
  await expect(chosen.locator('.dropdown-item__check')).toBeVisible();
  await expect(page.getByRole('option', {name: 'Accepted'}).locator('.dropdown-item__check')).toHaveCount(0);
});

test('Option list: Enter ticks and keeps the list open; Esc empties the search before anything else', async ({page}) => {
  await story(page, 'components-forms-option-list--searchable');
  const search = page.getByRole('searchbox', {name: 'Filter tags'});
  await search.focus();
  await page.keyboard.type('trans');
  await page.keyboard.press('ArrowDown');
  await page.keyboard.press('Enter');
  await expect(page.getByRole('menuitemcheckbox', {name: /^Transport/})).toHaveAttribute('aria-checked', 'true');
  await expect(search).toBeFocused();
  await page.keyboard.press('Escape');
  await expect(search).toHaveValue('');
  await expect(page.getByRole('menuitemcheckbox', {name: /^Cycling/})).toHaveAttribute('aria-checked', 'true');
  await expect(page.getByRole('menuitemcheckbox', {name: /^Transport/})).toHaveAttribute('aria-checked', 'true');
});

test('Option list: picking one marks only the chosen row', async ({page}) => {
  await story(page, 'components-forms-option-list--single');
  await page.getByRole('menuitemradio', {name: 'Accepted'}).click();
  await expect(page.getByRole('menuitemradio', {name: 'Accepted'})).toHaveAttribute('aria-checked', 'true');
  await expect(page.getByRole('menuitemradio', {name: 'Viewed'})).toHaveAttribute('aria-checked', 'false');
});

test('Tag picker: Backspace removes the focused tag, focus moves to its neighbour, then to Add tag', async ({page}) => {
  await story(page, 'components-forms-tag-picker--default');
  await page.getByRole('row', {name: 'Cycling'}).focus();
  await page.keyboard.press('ArrowRight');
  await expect(page.getByRole('row', {name: 'Safety'})).toBeFocused();
  await page.keyboard.press('Backspace');
  await expect(page.getByRole('row', {name: 'Safety'})).toHaveCount(0);
  await expect(page.getByRole('row', {name: 'Cycling'})).toBeFocused();
  await page.keyboard.press('Delete');
  await expect(page.getByRole('row')).toHaveCount(0);
  await expect(page.getByRole('button', {name: 'Add tag'})).toBeFocused();

  await page.keyboard.press('Enter');
  await page.keyboard.type('hous');
  await page.keyboard.press('ArrowDown');
  await page.keyboard.press('Enter');
  await page.keyboard.press('Escape');
  await page.keyboard.press('Escape');
  await expect(page.getByRole('button', {name: 'Add tag'})).toBeFocused();
  await expect(page.getByRole('row', {name: 'Housing'})).toBeVisible();
});

test('Setup step: a picked topic tag shows in the value badge and marks the step done', async ({page}) => {
  await story(page, 'patterns-project-page-setup-step--opens-a-picker');
  const card = page.getByRole('button', {name: /Set topic tags/});
  await card.click();
  await page.getByRole('menuitemcheckbox', {name: 'Climate'}).click();
  await expect(page.getByRole('status')).toHaveText('1 tag selected');
  await page.getByRole('button', {name: 'Done', exact: true}).click();
  await expect(card).toContainText('1 tag');
  await expect(card).toContainText('(done)');
});
