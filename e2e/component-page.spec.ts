import {test, expect, type Page} from '@playwright/test';

// The component page (src/overview/ComponentPage.tsx): every Components and Patterns docs page, in thirteen sections,
// from the part's <Name>.guide.md and its code. The three sample pages are written; Avatar stands for the rest.
const docs = (id: string) => `/storybook/iframe.html?id=${id}--docs&viewMode=docs`;
const SECTIONS = ['Purpose', 'Status', 'When to use', 'When not to use', 'Anatomy', 'Variants and states', 'Behaviour',
  'Content', 'Accessibility', 'Tokens', 'Related', 'Provenance', 'Changes', 'Props'];
const headings = (page: Page) => page.locator('.gv-sb-page__section > h2').allInnerTexts();
const section = (page: Page, name: string) => page.locator(`.gv-sb-page__section[data-section="${name}"]`);

for (const [name, id] of [['Button', 'components-actions-button'], ['Data table', 'components-tables-lists-data-table'],
  ['Side panel', 'components-overlays-side-panel']]) {
  test(`${name}: the thirteen sections in order, each with something in it`, async ({page}) => {
    await page.goto(docs(id));
    await expect(page.locator('.gv-sb-page[data-guide="written"]')).toBeVisible();
    expect((await headings(page)).map(h => h.trim())).toEqual(SECTIONS);
    for (const s of SECTIONS.slice(0, -1)) {
      await expect(section(page, s), s).not.toHaveText(new RegExp(`^\\s*${s}\\s*$`));
    }
    await expect(section(page, 'Status')).toContainText('Draft');
    await expect(section(page, 'Provenance')).toContainText('Not yet recorded');
    await expect(section(page, 'Tokens').locator('tbody tr').first()).toBeVisible();
    await expect(section(page, 'Behaviour').getByRole('table')).toBeVisible();
    await expect(section(page, 'Behaviour').getByRole('link', {name: /pattern/})).toHaveAttribute('href', /w3\.org\/WAI\/ARIA\/apg/);
  });
}

test('a part named in bold links to its page', async ({page}) => {
  await page.goto(docs('components-actions-button'));
  await expect(section(page, 'When not to use').getByRole('link', {name: 'Link', exact: true}))
    .toHaveAttribute('href', './?path=/docs/components-navigation-link--docs');
});

test('a part with no guide yet: what the code gives, and a note', async ({page}) => {
  await page.goto(docs('components-data-display-avatar'));
  await expect(page.locator('.gv-sb-page[data-guide="not-written"]')).toBeVisible();
  await expect(page.getByText("The guidance for Avatar isn't written yet")).toBeVisible();
  expect((await headings(page)).map(h => h.trim())).toEqual(['Purpose', 'Status', 'Variants and states', 'Tokens', 'Provenance', 'Props']);
  await expect(section(page, 'Status')).toContainText('Draft');
});
