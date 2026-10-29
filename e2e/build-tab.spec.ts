import {test, expect, type Page} from '@playwright/test';
import {a11yReport, axeViolations} from './axe';

// Package pk-project: the project page's rows and preview, and the new Build tab patterns, driven by keyboard in
// their stories. Axe's findings are reported, never failing a test; keyboard and focus still assert.
const story = (id: string) => `/storybook/iframe.html?id=${id}&viewMode=story`;

/** Storybook's a11y addon runs axe as the story renders; ours waits its turn ("Axe is already running"). */
async function report(page: Page, within: string) {
  let found: string[] = [];
  await expect(async () => {
    found = await axeViolations(page, within);
  }).toPass();
  a11yReport(found);
}

test('Action row: working is busy and inert; a menu row opens its menu by keyboard', async ({page}) => {
  await page.goto(story('patterns-project-page-action-row--working'));
  const working = page.locator('.gv-action-row[data-state="working"]');
  await expect(working).toHaveAttribute('aria-disabled', 'true');
  await expect(working).toHaveAttribute('aria-busy', 'true');
  await expect(working.getByRole('progressbar')).toBeVisible();
  await report(page, '#storybook-root');

  await page.goto(story('patterns-project-page-action-row--with-menu'));
  const trigger = page.getByRole('button', {name: /Share results with participants/});
  await trigger.focus();
  await page.keyboard.press('Enter');
  const menu = page.getByRole('menu');
  await expect(menu).toBeVisible();
  await expect(menu.getByRole('menuitem')).toHaveCount(3);
  await report(page, '.gv-action-row__popover');
  await page.keyboard.press('Escape');
  await expect(menu).toHaveCount(0);
  await expect(trigger).toBeFocused();
});

test('Access rights: Override, choose, Revert asks first, Esc closes back to the row', async ({page}) => {
  await page.goto(story('patterns-build-tab-access-rights--in-the-modal'));
  const row = page.getByRole('button', {name: 'Edit access for Submitting inputs'});
  await row.focus();
  await page.keyboard.press('Enter');
  const modal = page.getByRole('dialog', {name: 'Who can submit inputs?'});
  await expect(modal).toBeVisible();
  await expect(modal.getByText('Using')).toBeVisible();
  await expect(modal.getByRole('radiogroup', {name: 'Who can participate'})).toHaveAttribute('aria-readonly', 'true');

  // Override: the choices work, and focus lands on the chosen one.
  await modal.getByRole('button', {name: 'Override'}).press('Enter');
  await expect(modal.getByText('Overriding platform defaults')).toBeVisible();
  await expect(modal.getByRole('radio', {name: /Require sign-in/})).toBeFocused();
  await page.keyboard.press('ArrowRight');
  await expect(modal.getByRole('radio', {name: /Administrators and managers/})).toBeChecked();
  await expect(modal.getByText('Only administrators and managers can take this action.')).toBeVisible();
  await report(page, '.react-aria-ModalOverlay');

  // Revert asks first; confirming puts the defaults back and focus on Override.
  await modal.getByRole('button', {name: 'Revert to platform defaults'}).click();
  const confirm = page.getByRole('alertdialog', {name: 'Revert to platform defaults'});
  await expect(confirm).toBeVisible();
  await confirm.getByRole('button', {name: 'Revert to defaults'}).click();
  await expect(confirm).toHaveCount(0);
  await expect(modal.getByRole('button', {name: 'Override'})).toBeFocused();

  await page.keyboard.press('Escape');
  await expect(modal).toHaveCount(0);
  await expect(row).toBeFocused();
});

test('Participant action row: Limited reveals the maximum, Unlimited hides it', async ({page}) => {
  await page.goto(story('patterns-build-tab-participant-action-row--limited'));
  const limited = page.getByRole('radio', {name: 'Limited', exact: true});
  await expect(limited).toBeChecked();
  await expect(page.getByRole('textbox', {name: 'Maximum likes'})).toBeVisible();
  await limited.focus();
  await page.keyboard.press('ArrowLeft');
  await expect(page.getByRole('radio', {name: 'Unlimited', exact: true})).toBeChecked();
  await expect(page.getByRole('textbox', {name: 'Maximum likes'})).toHaveCount(0);
  await report(page, '#storybook-root');
});

test('Phone preview: the hover action is reachable by keyboard and shows on focus', async ({page}) => {
  // The countdown's dot pulses forever; reduced motion stops it, so axe can wait for the page to settle.
  await page.emulateMedia({reducedMotion: 'reduce'});
  await page.goto(story('patterns-project-page-phone-preview--hover-cta'));
  const action = page.locator('.gv-phone__action');
  await expect(action).toHaveCSS('opacity', '0');
  await page.keyboard.press('Tab');
  await expect(action).toBeFocused();
  await expect(action).toHaveCSS('opacity', '1');
  await report(page, '#storybook-root');
});

test('Rail phase: the delete is reachable by keyboard and shows on focus', async ({page}) => {
  await page.goto(story('patterns-project-rail-rail-phase--with-delete'));
  const del = page.locator('.gv-rail-phase__delete');
  await expect(del).toHaveCSS('opacity', '0');
  await page.keyboard.press('Tab');
  await expect(page.getByRole('link', {name: /Collect ideas/})).toBeFocused();
  await page.keyboard.press('Tab');
  await expect(page.getByRole('button', {name: 'Delete Collect ideas'})).toBeFocused();
  await expect(del).toHaveCSS('opacity', '1');
  await report(page, '#storybook-root');
});

test('Notification row: the closed card counts the emails on', async ({page}) => {
  await page.goto(story('patterns-build-tab-notification-row--in-a-card'));
  const card = page.getByRole('button', {name: /Notifications/});
  await expect(card).toContainText('3 emails on');
  await card.press('Enter');
  await page.getByRole('switch', {name: 'Phase started'}).press('Space');
  await card.press('Enter');
  await expect(card).toContainText('2 emails on');
  await report(page, '#storybook-root');
});

test('View option row: Make default turns an off view on and keeps focus', async ({page}) => {
  await page.goto(story('patterns-build-tab-view-option-row--in-a-card'));
  const map = page.getByRole('switch', {name: 'Map view'});
  await expect(map).not.toBeChecked();
  const make = page.getByRole('button', {name: 'Make default Map view'});
  await make.focus();
  await page.keyboard.press('Space');
  await expect(map).toBeChecked();
  const isDefault = page.getByRole('button', {name: 'Default Map view'});
  await expect(isDefault).toBeFocused();
  await expect(isDefault).toHaveAttribute('aria-pressed', 'true');
  await expect(page.getByRole('button', {name: 'Make default List view'})).toBeVisible();
  await expect(page.getByRole('button', {name: 'Configure map'})).toBeVisible();
  await report(page, '#storybook-root');
});

test('Card: a disabled action stays focusable and says why', async ({page}) => {
  await page.goto(story('components-layout-containers-card--disabled-action'));
  const download = page.getByRole('button', {name: 'Download volunteers'});
  await page.getByRole('button', {name: 'Add a cause'}).focus();
  await page.keyboard.press('Tab');
  await expect(download).toBeFocused();
  await expect(download).toHaveAttribute('aria-disabled', 'true');
  await expect(page.getByRole('tooltip')).toHaveText('Nobody has signed up yet');
  await report(page, '#storybook-root');
});
