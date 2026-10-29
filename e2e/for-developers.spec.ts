import {test, expect} from '@playwright/test';

// Overview/For developers shows docs/CONSUMING.md as it is in the repo: its sections, its tables and code, and none
// of the steward's merge notes (HTML comments in the file).
test('For developers shows docs/CONSUMING.md, without the merge notes', async ({page}) => {
  await page.goto('/storybook/iframe.html?id=overview-for-developers--docs&viewMode=docs');
  await expect(page.getByRole('heading', {level: 1, name: 'For developers'})).toBeVisible();
  for (const h of ["What it isn't (yet)", 'How to adopt it', 'CSS: the scoping caveat', 'Providers',
    'Forms with react-hook-form'])
    await expect(page.getByRole('heading', {level: 2, name: h})).toBeVisible();
  // A table and the recipe's code made it through the Markdown.
  await expect(page.getByRole('cell', {name: /outline: none/}).first()).toBeVisible();
  await expect(page.getByText('validationBehavior="aria"').first()).toBeVisible();
  await expect(page.getByText(/steward/)).toHaveCount(0);
});
