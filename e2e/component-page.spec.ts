import {existsSync, readFileSync, readdirSync} from 'node:fs';
import {join} from 'node:path';
import {test, expect, type Page} from '@playwright/test';

// The component page (src/overview/ComponentPage.tsx): every Components and Patterns docs page, in thirteen sections,
// from the part's <Name>.guide.md and its code. The three sample pages are written; a part with no guide yet stands for the rest.
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

// A part with no guide yet, found from the files (guides land part by part, so no name is fixed here). Once every part
// has its guide, there is nothing left to show and the test skips.
const unwritten = (() => {
  for (const f of readdirSync('src', {recursive: true}).filter(f => String(f).endsWith('.stories.tsx')).map(String).sort()) {
    const title = readFileSync(join('src', f), 'utf8').match(/const meta[^=]*=\s*\{[\s\S]*?title:\s*'((?:Components|Patterns)\/[^']+)'/)?.[1];
    if (!title || title.startsWith('Patterns/Recipes/') || existsSync(join('src', f.replace(/\.stories\.tsx$/, '.guide.md')))) continue;
    return {name: title.split('/').at(-1)!, id: title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '')};
  }
  return null;
})();

test('a part with no guide yet: what the code gives, and a note', async ({page}) => {
  test.skip(!unwritten, 'every part has its guide');
  await page.goto(docs(unwritten!.id));
  await expect(page.locator('.gv-sb-page[data-guide="not-written"]')).toBeVisible();
  await expect(page.getByText(`The guidance for ${unwritten!.name} isn't written yet`)).toBeVisible();
  expect((await headings(page)).map(h => h.trim())).toEqual(['Purpose', 'Status', 'Variants and states', 'Tokens', 'Provenance', 'Props']);
  await expect(section(page, 'Status')).toContainText('Draft');
});

test('a guide with its Provenance shows it in place of "Not yet recorded"', async ({page}) => {
  await page.goto(docs('components-data-display-avatar'));
  await expect(page.locator('.gv-sb-page[data-guide="written"]')).toBeVisible();
  await expect(section(page, 'Provenance')).toContainText('Reviewed by a person: not yet');
  await expect(section(page, 'Provenance')).not.toContainText('Not yet recorded');
});
