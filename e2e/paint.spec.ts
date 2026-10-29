import {test, expect} from '@playwright/test';
const story = (id: string) => `/storybook/iframe.html?id=${id}&viewMode=story`;

test('primary button wears Tali\'s primary', async ({page}) => {
  await page.goto(story('button--primary'));
  const b = page.getByRole('button').first();
  await expect(b).toHaveCSS('background-color', 'rgb(4, 73, 108)');
  await expect(b).toHaveCSS('border-radius', '8px');
  await expect(b).toHaveCSS('font-family', /Public Sans/);
});

test('secondary button has the control border', async ({page}) => {
  await page.goto(story('button--secondary'));
  await expect(page.getByRole('button').first()).toHaveCSS('border-top-color', 'rgb(224, 224, 224)');
});
