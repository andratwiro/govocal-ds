import {test, expect} from '@playwright/test';
const story = (id: string) => `/storybook/iframe.html?id=${id}&viewMode=story`;

test('primary button wears the Figma primary', async ({page}) => {
  await page.goto(story('components-actions-button--primary'));
  const b = page.getByRole('button').first();
  await expect(b).toHaveCSS('background-color', 'rgb(4, 73, 108)');
  await expect(b).toHaveCSS('border-radius', '8px');
  await expect(b).toHaveCSS('font-family', /Public Sans/);
});

test('secondary button has the control border', async ({page}) => {
  await page.goto(story('components-actions-button--secondary'));
  await expect(page.getByRole('button').first()).toHaveCSS('border-top-color', 'rgb(224, 224, 224)');
});

test('quiet button is transparent until hovered', async ({page}) => {
  await page.goto(story('components-actions-button--quiet'));
  const b = page.getByRole('button').first();
  await expect(b).toHaveCSS('background-color', 'rgba(0, 0, 0, 0)');
  await b.hover();
  await expect(b).toHaveCSS('background-color', 'rgb(245, 247, 248)');
});

test('select trigger is a neutral field, not primary', async ({page}) => {
  await page.goto(story('components-forms-select--field'));
  const trigger = page.getByRole('button').first();
  await expect(trigger).not.toHaveCSS('background-color', 'rgb(4, 73, 108)');
  await expect(trigger).toHaveCSS('border-top-color', 'rgb(224, 224, 224)');
});
