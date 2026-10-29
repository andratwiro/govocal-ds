import {test, expect, type Page} from '@playwright/test';
import {a11yReport, axeViolations} from './axe';

const story = (id: string) => `/storybook/iframe.html?id=${id}&viewMode=story`;
async function open(page: Page, id: string) {
  await page.goto(story(id));
  // A Select's collection renders a hidden <template> first, so wait for Storybook, not for a visible child.
  await page.waitForFunction(() => /sb-show-main/.test(document.body.className));
}

/** Axe's findings in `within`, reported (never failing the test); ours waits for Storybook's own run to end. */
async function report(page: Page, within: string) {
  let found: string[] = [];
  await expect(async () => { found = await axeViolations(page, within); }).toPass();
  a11yReport(found);
}

// The radio itself is a visually hidden input under its chip: click what a person sees.
const chip = (page: Page, code: string) => page.locator('.gv-locale-switcher__item', {hasText: code});

test('multilingual text field: Tab reaches the switcher, arrows change the language, typing fills only that one', async ({page}) => {
  await open(page, 'components-forms-multilingual-text-field--default');
  const group = page.getByRole('radiogroup', {name: 'Language of Title'});
  await expect(group).toHaveAttribute('aria-orientation', 'horizontal');

  // A language button reads its code, the language's name and its mark: "EN, English, filled".
  await page.keyboard.press('Tab');
  const english = page.getByRole('radio', {name: /^EN ?, English, filled$/});
  await expect(english).toBeFocused();
  await expect(english).toBeChecked();
  const input = page.getByRole('textbox', {name: 'Title, English'});
  await expect(input).toHaveValue('Green Corridors for Riverside');

  // Arrows move and choose, as radios do; the field follows.
  await page.keyboard.press('ArrowRight');
  await expect(page.getByRole('radio', {name: /^NL-BE ?, Dutch \(Belgium\), filled$/})).toBeChecked();
  await expect(page.getByRole('textbox', {name: 'Title, Dutch (Belgium)'})).toHaveValue('Groene corridors voor Riverside');
  await page.keyboard.press('ArrowRight');
  const french = page.getByRole('radio', {name: /^FR-BE/});
  await expect(french).toBeChecked();
  await expect(french).toHaveAccessibleName(/^FR-BE ?, French \(Belgium\), empty$/);

  // Tab leaves the switcher for the field; typing goes into French only, and its mark turns filled.
  await page.keyboard.press('Tab');
  const frenchInput = page.getByRole('textbox', {name: 'Title, French (Belgium)'});
  await expect(frenchInput).toBeFocused();
  await expect(frenchInput).toHaveValue('');
  await page.keyboard.type('Corridors verts');
  await expect(frenchInput).toHaveValue('Corridors verts');
  await expect(french).toHaveAccessibleName(/^FR-BE ?, French \(Belgium\), filled$/);
  await expect(chip(page, 'FR-BE').locator('.gv-locale-mark'))
    .toHaveAttribute('data-status', 'filled');

  // Back on the switcher, the other languages kept their own text.
  await page.keyboard.press('Shift+Tab');
  await expect(french).toBeFocused();
  await page.keyboard.press('ArrowLeft');
  await expect(page.getByRole('textbox', {name: 'Title, Dutch (Belgium)'})).toHaveValue('Groene corridors voor Riverside');
  await page.keyboard.press('ArrowLeft');
  await expect(page.getByRole('textbox', {name: 'Title, English'})).toHaveValue('Green Corridors for Riverside');
  await report(page, '#storybook-root');
});

test('multilingual text field: a required, invalid field shows the missing language and says so', async ({page}) => {
  await open(page, 'components-forms-multilingual-text-field--required');
  await expect(page.getByRole('radio', {name: /^FR-BE/})).toHaveAccessibleName(/empty, required$/);
  await expect(page.getByRole('textbox', {name: 'Title, English'})).toHaveAttribute('aria-required', 'true');

  await open(page, 'components-forms-multilingual-text-field--invalid');
  const input = page.getByRole('textbox', {name: 'Title, French (Belgium)'});
  await expect(page.getByRole('radio', {name: /^FR-BE/})).toBeChecked();
  await expect(page.getByRole('radio', {name: /^FR-BE/})).toHaveAccessibleName(/has an error$/);
  await expect(input).toHaveAttribute('aria-invalid', 'true');
  await expect(input).toHaveAccessibleDescription('Add the text in French (Belgium)');
  // Filling it in clears its mark; the field stays where it is (no jump while fixing).
  await input.fill('Corridors verts pour Riverside');
  await expect(page.getByRole('radio', {name: /^FR-BE/})).toHaveAccessibleName(/filled$/);
  await expect(page.getByRole('radio', {name: /^FR-BE/})).toBeChecked();
  await report(page, '#storybook-root');

  await open(page, 'components-forms-multilingual-text-field--error-per-language');
  await expect(page.getByRole('radio', {name: /^NL-BE/})).toBeChecked();
  await expect(page.getByRole('textbox', {name: 'Title, Dutch (Belgium)'}))
    .toHaveAccessibleDescription('This title is already used by another project');
});

test('multilingual text field: Arabic text runs right to left in a left-to-right page', async ({page}) => {
  await open(page, 'components-forms-multilingual-text-field--right-to-left');
  const arabic = page.getByRole('textbox', {name: /^Title, Arabic/});
  await expect(arabic).toHaveAttribute('dir', 'rtl');
  await expect(arabic).toHaveAttribute('lang', 'ar-SA');
  await chip(page, 'EN').click();
  await expect(page.getByRole('textbox', {name: 'Title, English'})).toHaveAttribute('dir', 'ltr');
  await report(page, '#storybook-root');
});

test('multilingual text field: disabled text, the languages still readable', async ({page}) => {
  await open(page, 'components-forms-multilingual-text-field--disabled');
  await expect(page.getByRole('textbox', {name: 'Title, English'})).toBeDisabled();
  await chip(page, 'NL-BE').click();
  await expect(page.getByRole('textbox', {name: 'Title, Dutch (Belgium)'})).toHaveValue('Groene corridors voor Riverside');
});

test('multilingual text field: controlled, the page holds the Multiloc', async ({page}) => {
  await open(page, 'components-forms-multilingual-text-field--controlled');
  await chip(page, 'FR-BE').click();
  await page.getByRole('textbox', {name: 'Title, French (Belgium)'}).fill('Corridors verts');
  await expect(page.locator('#storybook-root pre')).toContainText('locale: fr-BE');
  await expect(page.locator('#storybook-root pre')).toContainText('"fr-BE": "Corridors verts"');
  await expect(page.locator('#storybook-root pre')).toContainText('"en": "Green Corridors for Riverside"');
});

test('multilingual rich text editor: the switcher picks the language the editor edits', async ({page}) => {
  await open(page, 'components-forms-multilingual-rich-text-editor--invalid');
  await expect(page.getByRole('radio', {name: /^ES-ES/})).toBeChecked();
  await expect(page.getByRole('textbox', {name: 'Description, Spanish (Spain)'})).toHaveValue('');
  await expect(page.getByRole('alert')).toHaveText('Add the text in Spanish (Spain)');
  await page.getByRole('textbox', {name: 'Description, Spanish (Spain)'}).fill('Añade una breve introducción');
  await expect(page.getByRole('alert')).toHaveCount(0);
  await chip(page, 'EN').click();
  await expect(page.getByRole('textbox', {name: 'Description, English'})).toHaveValue(/^Add a short introduction here/);
  await report(page, '#storybook-root');
});
