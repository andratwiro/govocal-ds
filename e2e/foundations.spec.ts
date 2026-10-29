import {test, expect} from '@playwright/test';

test('Foundations lists the Figma tokens', async ({page}) => {
  await page.goto('/storybook/iframe.html?id=overview-foundations--docs&viewMode=docs');
  await expect(page.getByText('--gv-action-primary').first()).toBeVisible();
  await expect(page.getByText('--gv-space-14').first()).toBeVisible();
  await expect(page.getByRole('heading', {name: 'Not in Figma'})).toBeVisible();
});

test('Icons lists the Figma names', async ({page}) => {
  await page.goto('/storybook/iframe.html?id=overview-icons--docs&viewMode=docs');
  await expect(page.getByText('In Figma', {exact: true}).first()).toBeVisible();
  await expect(page.getByText('x', {exact: true}).first()).toBeVisible();
});

test('the manager wears Go Vocal\'s mark and name', async ({page}) => {
  await page.goto('/storybook/');
  const brand = page.getByRole('link', {name: 'Go Vocal Design system'});
  await expect(brand).toHaveAttribute('href', '../');
  await expect(brand.getByAltText('Go Vocal')).toBeVisible();
  await expect(brand.getByText('Design system', {exact: true})).toBeVisible();
  await expect(page.locator('link[rel=icon]')).toHaveAttribute('href', './favicon.svg');
  expect(await (await page.request.get('/storybook/favicon.svg')).text()).toContain('<title>Go Vocal</title>');
});

test('Storybook opens on Welcome, first in the sidebar', async ({page}) => {
  await page.goto('/storybook/');
  await expect(page).toHaveURL(/path=\/docs\/overview-welcome--docs/);
  await expect(page.locator('#storybook-explorer-tree .sidebar-item').first())
    .toHaveAttribute('data-item-id', 'overview-welcome--docs');
  const welcome = page.frameLocator('#storybook-preview-iframe');
  await expect(welcome.getByRole('heading', {level: 1, name: 'Go Vocal design system'})).toBeVisible();
  await expect(welcome.getByRole('link', {name: /^Back office/})).toHaveAttribute('href', '../backoffice/');
});

test('a Welcome card opens its whole section, whatever its first entry is called', async ({page}) => {
  await page.goto('/storybook/?path=/docs/overview-welcome--docs');
  await page.frameLocator('#storybook-preview-iframe').getByRole('link', {name: /^Components/}).click();
  await expect(page).toHaveURL(/path=\/docs\/components-[^&]+--docs/);
});
