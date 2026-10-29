import {test, expect, type Page} from '@playwright/test';
import {a11yReport, axeViolations} from './axe';

const story = (id: string) => `/storybook/iframe.html?id=${id}&viewMode=story`;
async function open(page: Page, id: string) {
  await page.goto(story(id));
  await page.locator('#storybook-root > *').first().waitFor();
}

test('tabs: a count and a status dot are part of the tab name', async ({page}) => {
  await open(page, 'components-navigation-tabs--with-count');
  await expect(page.getByRole('tab', {name: 'All reports (18)'})).toHaveAttribute('aria-selected', 'true');
  await open(page, 'components-navigation-tabs--with-status-dots');
  await expect(page.getByRole('tab', {name: /^ES-ES ?, missing$/})).toHaveAttribute('aria-selected', 'true');
  await expect(page.getByRole('tab', {name: /^EN ?, complete$/})).toBeVisible();
});

test('grouped side tabs: headings never take focus, arrows cross groups, the panel follows', async ({page}) => {
  await open(page, 'components-navigation-tabs--vertical-with-group-headings');
  const list = page.getByRole('listbox', {name: 'Settings'});
  await expect(list.getByRole('group')).toHaveCount(2);
  await page.keyboard.press('Tab');
  await expect(list.getByRole('option', {name: 'General information'})).toBeFocused();
  await page.keyboard.press('ArrowDown');
  await page.keyboard.press('ArrowDown');
  const tags = list.getByRole('option', {name: 'Tags'});
  await expect(tags).toBeFocused();
  await expect(tags).toHaveAttribute('aria-selected', 'true');
  await expect(page.getByRole('group', {name: 'Tags'})).toContainText('The tags managers give inputs.');
  await page.keyboard.press('End');
  await expect(list.getByRole('option', {name: 'Perspectives'})).toHaveAttribute('aria-selected', 'true');
  await page.keyboard.press('Home');
  await expect(page.getByRole('group', {name: 'General information'})).toBeVisible();
  await page.keyboard.press('Tab');
  await expect(list.getByRole('option', {name: 'General information'})).not.toBeFocused();
  a11yReport(await axeViolations(page, '#storybook-root'));
});

test('modal side tabs: grouped under Project and Inputs', async ({page}) => {
  // The starter Modal centres with a sticky top, which a 640 dialog outgrows in a short window: a tall one here.
  await page.setViewportSize({width: 1280, height: 1400});
  await open(page, 'components-overlays-modal--with-side-tabs');
  const dialog = page.getByRole('dialog', {name: 'Settings'});
  await expect(dialog.getByRole('group', {name: 'Project'})).toContainText('Resources');
  await expect(dialog.getByRole('group', {name: 'Inputs'})).toContainText('Perspectives');
  await dialog.getByRole('option', {name: 'Resources'}).click();
  await expect(dialog.getByRole('group', {name: 'Resources'})).toBeVisible();
});
