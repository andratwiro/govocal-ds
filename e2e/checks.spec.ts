import {test, expect} from '@playwright/test';

// Overview/Checks (src/Checks.mdx): how to rerun everything, the last `npm run check`, the four faults
// `npm run break-it` caught, and every guard in plain words with the command that reruns it alone.
test('Checks shows the rerun command, the break-it faults and every guard', async ({page}) => {
  await page.goto('/storybook/iframe.html?id=overview-checks--docs&viewMode=docs');
  await expect(page.getByRole('heading', {level: 1, name: 'Checks'})).toBeVisible();
  for (const h of ['Rerun everything', 'Break it on purpose', 'Every guard', "What the checks don't prove"])
    await expect(page.getByRole('heading', {level: 2, name: h})).toBeVisible();
  await expect(page.getByText('E2E_PORT=4173 npm run check').first()).toBeVisible();
  // Each fault, with the check that went red for it.
  for (const fault of ['An undefined token', 'A raw hex colour', 'A renamed prop', 'A missing label'])
    await expect(page.getByRole('row', {name: new RegExp(fault)})).toContainText(/tests\/|typecheck/);
  await expect(page.getByText('4 of 4 faults caught')).toBeVisible();
  // A guard, its plain words and its rerun command.
  const guard = (file: string) => page.getByRole('row').filter({has: page.getByRole('cell', {name: file, exact: true})});
  await expect(guard('tests/tokens-defined.test.mjs')).toContainText('npx vitest run tests/tokens-defined.test.mjs');
  await expect(guard('e2e/checks.spec.ts')).toContainText('npx playwright test e2e/checks.spec.ts');
});

test('AI assistance says the Storybook MCP needs a running Storybook', async ({page}) => {
  await page.goto('/storybook/iframe.html?id=overview-ai-assistance--docs&viewMode=docs');
  await expect(page.getByRole('heading', {level: 1, name: 'AI assistance'})).toBeVisible();
  for (const h of ['Where an agent starts', 'How an agent should use the system', 'The MCP servers'])
    await expect(page.getByRole('heading', {level: 2, name: h})).toBeVisible();
  await expect(page.getByText(/works only while Storybook runs/)).toBeVisible();
  await expect(page.getByRole('link', {name: 'components.json'})).toHaveAttribute('href', /storybook\/manifests\/components\.json$/);
});
