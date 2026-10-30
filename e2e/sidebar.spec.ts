import {test, expect, type Page} from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';
import {a11yReport} from './axe';

// The back office's main sidebar, after the real admin's sidebar (order, counts, menus) and the
// prototype's rail (look): To platform band, main items, a gap, the bottom items, Notifications,
// the account row and Support.
const TOP = ['Dashboard', 'Projects', 'Input manager', 'Users', 'Messaging', 'Reporting', 'Community monitor', 'Inspiration hub'];
const BOTTOM = ['Tools', 'Pages & menu', 'Settings'];
const PHASE = '/backoffice/#/projects/green-corridors/phases/p2/build';
// The report view keeps the folded rail; the project screens hide the nav (Side nav's "Hidden" story).
const FOLDED = '/backoffice/#/reporting/report-builder/r1/editor';
const nav = (page: Page) => page.getByRole('navigation', {name: 'Main'});

test('items in the real admin order, with a gap before Tools', async ({page}) => {
  await page.goto('/backoffice/#/dashboard');
  const links = nav(page).getByRole('link');
  const names = (await links.allInnerTexts()).map(t => t.split('\n')[0].trim());
  expect(names).toEqual(['To platform', ...TOP, ...BOTTOM]);
  const hub = await nav(page).getByRole('link', {name: 'Inspiration hub'}).boundingBox();
  const tools = await nav(page).getByRole('link', {name: 'Tools'}).boundingBox();
  const hubToDash = await nav(page).getByRole('link', {name: 'Projects'}).boundingBox();
  const dash = await nav(page).getByRole('link', {name: 'Dashboard'}).boundingBox();
  // The bottom group sits well below the main group (more than one row's step).
  expect(tools!.y - (hub!.y + hub!.height)).toBeGreaterThan(2 * (hubToDash!.y - dash!.y));
  for (const name of ['Notifications', 'Alex Morgan', 'Support'])
    await expect(nav(page).getByRole('button', {name: new RegExp(name)})).toBeVisible();
});

test('To platform leaves for the resident placeholder and comes back', async ({page}) => {
  await page.goto('/backoffice/#/dashboard');
  await nav(page).getByRole('link', {name: 'To platform'}).click();
  await expect(page).toHaveURL(/#\/platform$/);
  await expect(page.getByRole('heading', {level: 1, name: /resident site/i})).toBeVisible();
  await expect(nav(page)).toHaveCount(0);
  await page.getByRole('link', {name: /back office/i}).click();
  await expect(page.getByRole('heading', {level: 1, name: 'Dashboard'})).toBeVisible();
});

test('Input manager carries its count badge', async ({page}) => {
  await page.goto('/backoffice/#/dashboard');
  const link = nav(page).getByRole('link', {name: /Input manager/});
  // The inputs waiting for feedback that are assigned to the signed-in admin (data.ts), as the real admin counts them.
  await expect(link).toContainText('2');
  await expect(link).toHaveAccessibleName(/Input manager.*2 of your inputs need feedback/);
});

test('Notifications opens a list; Mark all as read clears the badge', async ({page}) => {
  await page.goto('/backoffice/#/dashboard');
  const bell = nav(page).getByRole('button', {name: /Notifications/});
  await expect(bell).toContainText('28');
  await bell.click();
  const panel = page.getByRole('dialog', {name: 'Notifications'});
  await expect(panel).toBeVisible();
  const items = panel.getByRole('listitem');
  expect(await items.count()).toBeGreaterThanOrEqual(4);
  await expect(panel).toContainText('Your report for Green Corridors for Larkvale is ready');
  await expect(panel.getByRole('img', {name: 'Unread'}).first()).toBeVisible();
  await panel.getByRole('button', {name: 'Mark all as read'}).click();
  await expect(panel.getByRole('img', {name: 'Unread'})).toHaveCount(0);
  await page.keyboard.press('Escape');
  await expect(panel).toBeHidden();
  await expect(bell).not.toContainText('28');
  await expect(bell).toHaveAccessibleName('Notifications');
});

test('Show older notifications adds the read ones under the list, once', async ({page}) => {
  await page.goto('/backoffice/#/dashboard');
  await nav(page).getByRole('button', {name: /Notifications/}).click();
  const panel = page.getByRole('dialog', {name: 'Notifications'});
  const items = panel.getByRole('listitem');
  const before = await items.count();
  await panel.getByRole('button', {name: 'Show older notifications'}).click();
  await expect(items).toHaveCount(before + 4);
  await expect(panel).toContainText('Your report for Q3 platform progress is ready');
  await expect(panel.getByRole('button', {name: 'Show older notifications'})).toHaveCount(0);
});

test('following a notification closes the list', async ({page}) => {
  await page.goto('/backoffice/#/dashboard');
  await nav(page).getByRole('button', {name: /Notifications/}).click();
  const panel = page.getByRole('dialog', {name: 'Notifications'});
  await panel.getByRole('link', {name: /Your report for Green Corridors/}).click();
  await expect(page).toHaveURL(/#\/reporting$/);
  await expect(panel).toBeHidden();
});

test('the account menu opens with Language, My profile and Sign out', async ({page}) => {
  await page.goto('/backoffice/#/dashboard');
  const row = nav(page).getByRole('button', {name: /Alex Morgan/});
  await expect(row).toContainText('Administrator');
  await row.click();
  // React Aria names the menu after its trigger (the account row).
  const menu = page.getByRole('menu').filter({has: page.getByRole('menuitem', {name: 'My profile'})});
  // Menu's "With a submenu checklist": the row says the setting, its description line the current choice.
  const language = menu.getByRole('menuitem', {name: /Language/});
  await expect(language).toHaveAccessibleName('Language');
  await expect(language).toContainText('English');
  await language.press('ArrowRight');
  const languages = page.getByRole('menu', {name: 'Language'});
  await languages.getByRole('menuitemradio', {name: 'Français'}).click();
  await row.click();
  await expect(menu.getByRole('menuitem', {name: /Language/})).toContainText('Français');
  await expect(menu.getByRole('menuitem', {name: 'My profile'})).toBeVisible();
  // Sign out sits apart, after a separator.
  await expect(menu.getByRole('separator')).toHaveCount(1);
  await menu.getByRole('menuitem', {name: 'Sign out'}).click();
  await expect(page).toHaveURL(/#\/platform\?signed-out/);
  await expect(page.getByText(/signed out/i)).toBeVisible();
});

test('the Support menu opens with the real admin items', async ({page}) => {
  await page.goto('/backoffice/#/dashboard');
  await nav(page).getByRole('button', {name: 'Support'}).click();
  const menu = page.getByRole('menu', {name: 'Support'});
  for (const item of ['Knowledge base', 'Product changelog', 'Community platform', 'Customer portal'])
    await expect(menu.getByRole('menuitem', {name: item})).toBeVisible();
});

test('every nav item still opens its page', async ({page}) => {
  await page.goto('/backoffice/');
  for (const label of [...TOP, ...BOTTOM]) {
    await nav(page).getByRole('link', {name: label}).click();
    await expect(page.getByRole('heading', {level: 1, name: label})).toBeVisible();
    await expect(nav(page).getByRole('link', {name: label})).toHaveAttribute('aria-current', 'page');
  }
});

test('hidden on a project screen: the header\'s toggle opens it over the page, a link or Esc closes it', async ({page}) => {
  await page.goto(PHASE);
  await expect(nav(page)).toHaveCount(0);
  const toggle = page.getByRole('button', {name: 'Show the platform menu'});
  await toggle.click();
  // Open over the page, it has room for its labels: the open nav, not the folded rail.
  await expect(nav(page).getByRole('link', {name: 'Projects'})).toBeVisible();
  expect((await nav(page).boundingBox())!.width).toBeGreaterThan(64);
  await page.keyboard.press('Escape');
  await expect(nav(page)).toHaveCount(0);
  await expect(toggle).toBeFocused();
  await toggle.click();
  await nav(page).getByRole('link', {name: 'Users'}).click();
  await expect(page.getByRole('heading', {level: 1, name: 'Users'})).toBeVisible();
  await expect(nav(page).getByRole('link', {name: 'Users'})).toHaveAttribute('aria-current', 'page');
});

test('folded in the report view: icons only, names still accessible, badges on the icons', async ({page}) => {
  await page.goto(FOLDED);
  const box = await nav(page).boundingBox();
  expect(box!.width).toBeLessThan(64);
  for (const label of ['To platform', ...TOP, ...BOTTOM])
    await expect(nav(page).getByRole('link', {name: label})).toBeAttached();
  await expect(nav(page).getByRole('link', {name: /Input manager/})).toHaveAccessibleName(/2 of your inputs need feedback/);
  for (const name of [/Notifications/, /Alex Morgan/, /Support/])
    await expect(nav(page).getByRole('button', {name})).toBeVisible();
  // Labels are visually hidden: the Projects row is no wider than the rail.
  const projects = await nav(page).getByRole('link', {name: 'Projects'}).boundingBox();
  expect(projects!.width).toBeLessThanOrEqual(box!.width);
  // Hover shows the name as a tooltip. React Aria opens it only once it has seen the pointer move, and a real mouse
  // arrives from somewhere: move it over the page first, or the first jump lands on the row before any move.
  await page.mouse.move(400, 400);
  await nav(page).getByRole('link', {name: 'Users'}).hover();
  await expect(page.getByRole('tooltip', {name: 'Users'})).toBeVisible();
  // The menus still open from the rail.
  await nav(page).getByRole('button', {name: /Support/}).click();
  await expect(page.getByRole('menu', {name: 'Support'})).toBeVisible();
});

test('folded: a focus nobody asked for opens no tooltip; keyboard focus does', async ({page}) => {
  // The deep dive saw "To platform" show its tooltip on load. In a headless browser that one is hover: the pointer rests
  // at 0,0, over that link. Here the page's own focus, on a row away from the pointer, opens nothing.
  await page.goto(FOLDED);
  const projects = nav(page).getByRole('link', {name: 'Projects'});
  await projects.focus();
  await expect(projects).toBeFocused();
  await page.waitForTimeout(400);
  await expect(page.getByRole('tooltip', {name: 'Projects'})).toHaveCount(0);
  await page.keyboard.press('Tab');
  await page.keyboard.press('Shift+Tab');
  await expect(page.getByRole('tooltip', {name: 'Projects'})).toBeVisible();
});

test('the sidebar is scanned by axe, open and folded, menus included', async ({page}) => {
  await page.goto('/backoffice/#/dashboard');
  a11yReport(await violations(page, 'nav[aria-label="Main"]'));
  await nav(page).getByRole('button', {name: /Notifications/}).click();
  await settled(page);
  a11yReport(await violations(page, '[role="dialog"]'));
  await page.keyboard.press('Escape');
  await nav(page).getByRole('button', {name: /Alex Morgan/}).click();
  await settled(page);
  a11yReport(await violations(page, '[role="menu"]'));
  await page.keyboard.press('Escape');
  await page.goto(FOLDED);
  a11yReport(await violations(page, 'nav[aria-label="Main"]'));
});

// Overlays fade in; measure contrast once they have.
async function settled(page: Page) {
  await expect(page.locator('.react-aria-Popover[data-entering], .react-aria-Popover[data-exiting]')).toHaveCount(0);
  await expect(page.locator('.react-aria-Popover')).toBeVisible();
  await page.waitForTimeout(250);
}

async function violations(page: Page, within: string) {
  const {violations} = await new AxeBuilder({page}).include(within)
    .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa', 'wcag22aa']).analyze();
  return violations.map(v => `${v.id}: ${v.nodes.map(n => n.target.join(' ')).join(', ')}`);
}
