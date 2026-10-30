import {test, expect, type Page} from '@playwright/test';

// The Storybook Locale toolbar (.storybook/preview.tsx): every story runs in the chosen locale, so numbers and dates
// follow it; the words stay English. "Right to left" stays Arabic, so old `globals=direction:rtl` links still work.
const open = async (page: Page, id: string, globals = '') => {
  await page.goto(`/storybook/iframe.html?id=${id}&viewMode=story${globals ? `&globals=${globals}` : ''}`);
  await page.waitForFunction(() => /sb-show-main/.test(document.body.className));
};
const monthIn = (page: Page, locale: string) =>
  page.evaluate(l => new Intl.DateTimeFormat(l, {month: 'long', year: 'numeric'}).format(new Date()), locale);

test('a German viewer sees a German number and a German month; the words stay English', async ({page}) => {
  await open(page, 'base-meter--example', 'locale:de-DE');
  await expect(page.locator('html')).toHaveAttribute('lang', 'de-DE');
  await expect(page.locator('html')).toHaveAttribute('dir', 'ltr');
  await expect(page.getByRole('meter')).toContainText('80 %');
  await expect(page.getByText('Storage space')).toBeVisible();

  await open(page, 'base-calendar--example', 'locale:de-DE');
  await expect(page.getByRole('heading')).toContainText(await monthIn(page, 'de-DE'));
});

test('a Dutch viewer sees a Dutch month; English stays the default', async ({page}) => {
  await open(page, 'base-calendar--example', 'locale:nl-BE');
  await expect(page.getByRole('heading')).toContainText(await monthIn(page, 'nl-BE'));

  await open(page, 'base-meter--example');
  await expect(page.locator('html')).toHaveAttribute('lang', 'en-GB');
  await expect(page.getByRole('meter')).toContainText('80%');
});

test('Arabic runs right to left, from the Locale or from the old Direction link', async ({page}) => {
  for (const globals of ['locale:ar-SA', 'direction:rtl', 'locale:de-DE;direction:rtl']) {
    await open(page, 'base-meter--example', globals);
    await expect(page.locator('html'), globals).toHaveAttribute('dir', 'rtl');
    await expect(page.locator('html'), globals).toHaveAttribute('lang', 'ar-SA');
  }
});

test('Data table stories write dates and counts in the chosen locale', async ({page}) => {
  await open(page, 'components-tables-lists-data-table--default', 'locale:de-DE');
  await expect(page.getByRole('grid').getByText('2. Oktober 2026')).toBeVisible();
  await open(page, 'components-tables-lists-data-table--default');
  await expect(page.getByRole('grid').getByText('2 October 2026')).toBeVisible();
});
