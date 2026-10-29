import {test, expect} from '@playwright/test';
import {a11yReport, axeViolations} from './axe';

const story = (name: string) => `/storybook/iframe.html?id=components-actions-menu--${name}&viewMode=story`;

test('Multiple with a footer action: Enter and Space tick a phase and the menu stays open; the action closes it', async ({page}) => {
  await page.goto(story('multiple-with-a-footer-action'));
  const trigger = page.getByRole('button', {name: 'Copy to phase'});
  await trigger.focus();
  await page.keyboard.press('Enter');
  const menu = page.getByRole('menu', {name: 'Copy to phase'});
  await expect(menu).toBeVisible();
  const background = menu.getByRole('menuitemcheckbox', {name: 'Project background'});
  await expect(background).toBeFocused();
  await page.keyboard.press('Enter');
  await expect(background).toHaveAttribute('aria-checked', 'true');
  await expect(menu).toBeVisible();
  await page.keyboard.press('ArrowDown');
  await page.keyboard.press(' ');
  await expect(menu.getByRole('menuitemcheckbox', {name: 'Shortlist proposals'})).toHaveAttribute('aria-checked', 'true');
  await expect(menu).toBeVisible();
  a11yReport(await axeViolations(page, '[role="menu"]'));
  await menu.getByRole('menuitem', {name: 'Add phase'}).focus();
  await page.keyboard.press('Enter');
  await expect(menu).toHaveCount(0);
});
