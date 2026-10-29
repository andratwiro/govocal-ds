import {test, expect} from '@playwright/test';

// The orientation and developer pages (Overview, Foundations › Voice and tone, Word list): each renders, and Welcome
// links to every one of them.
const docs = (id: string) => `/storybook/iframe.html?id=${id}--docs&viewMode=docs`;
const PAGES: [string, string, string[]][] = [
  ['overview-start-here', 'Start here', ['For designers', 'For developers']],
  ['overview-principles', 'Principles', ['1. System first', '2. Tokens only']],
  ['overview-who-owns-what', 'Who owns what', ['Design changes, developers review', 'Developers own, design proposes', 'Decided together']],
  ['overview-questions-for-developers', 'Questions for developers',
    ['1. The base library', '2. How the components reach the apps', '3. The integration seams', '4. The terms of adoption']],
  ['overview-what-comes-from-react-aria', 'What comes from React Aria', ['Components', 'Patterns', 'Base']],
  ['overview-lifecycle', 'Lifecycle', ['Where things stand']],
  ['foundations-voice-and-tone', 'Voice and tone', ['Sentence case, always', 'Buttons and links', 'Errors']],
  ['foundations-word-list', 'Word list', ['Adding a word']]
];

for (const [id, title, sections] of PAGES) {
  test(`${title} renders its sections`, async ({page}) => {
    await page.goto(docs(id));
    await expect(page.getByRole('heading', {level: 1, name: title})).toBeVisible();
    for (const s of sections) await expect(page.locator('h2').filter({hasText: s}).first()).toBeVisible();
  });
}

test('Welcome links to every orientation page', async ({page}) => {
  await page.goto(docs('overview-welcome'));
  for (const [id] of PAGES) await expect(page.locator(`a[href="./?path=/docs/${id}--docs"]`)).toHaveCount(1);
});

test('Questions for developers measures the CSS each part brings', async ({page}) => {
  await page.goto(docs('overview-questions-for-developers'));
  await expect(page.getByText(/\d+ stylesheets, [\d.]+ kB in all, [\d.]+ kB gzipped/)).toBeVisible();
});

test('the React Aria table has a row per part, Data table among them', async ({page}) => {
  await page.goto(docs('overview-what-comes-from-react-aria'));
  const row = page.getByRole('row').filter({hasText: 'Tables & lists › Data table'});
  await expect(row).toContainText('Table');
  await expect(row).toContainText('data-table-virtual');
});

test('the word list comes from its JSON, with an Avoid column', async ({page}) => {
  await page.goto(docs('foundations-word-list'));
  await expect(page.getByRole('row').filter({hasText: 'resident'}).first()).toContainText('citizen');
});

test('Colour, Spacing and Typography each say which token does which job', async ({page}) => {
  for (const [id, token] of [['foundations-colour', 'surface-panel'], ['foundations-spacing', '--gv-space-16'],
    ['foundations-typography', '--gv-type-ui-strong']]) {
    await page.goto(docs(id));
    await expect(page.locator('h2#which-token-for-which-job')).toBeVisible();
    await expect(page.getByRole('cell', {name: token, exact: true}).first()).toBeVisible();
  }
});
