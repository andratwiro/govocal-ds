import {test, expect, type Page} from '@playwright/test';
import {a11yReport, axeViolations} from './axe';

const story = (id: string) => `/storybook/iframe.html?id=${id}&viewMode=story`;
async function open(page: Page, id: string) {
  await page.goto(story(id));
  await page.locator('#storybook-root > *').first().waitFor();
}

/** Axe's findings in `within`, reported (never failing the test). Storybook's a11y addon runs axe in the preview as the
 * story renders; ours waits its turn ("Axe is already running"). */
async function report(page: Page, within: string) {
  let found: string[] = [];
  await expect(async () => { found = await axeViolations(page, within); }).toPass();
  a11yReport(found);
}

test('stat tile: a trend says its direction in words, not by colour alone', async ({page}) => {
  await open(page, 'components-data-display-stat-tile--with-trend');
  const trends = page.locator('.gv-kpi__trend');
  await expect(trends).toHaveText(['Up 12%, 7-day change', 'Down 8%, 7-day change', 'No change 0%, 7-day change']);
  await expect(trends.first().locator('svg')).toHaveAttribute('aria-hidden', 'true');
  await report(page, '#storybook-root');
});

test('stat tile: the info icon opens a Help popover by press and by keyboard', async ({page}) => {
  await open(page, 'components-data-display-stat-tile--with-info');
  const help = page.getByRole('button', {name: 'Help: Participation rate'});
  await help.click();
  const dialog = page.getByRole('dialog', {name: 'Participation rate'});
  await expect(dialog).toContainText('Phase participants as a share');
  await page.keyboard.press('Escape');
  await expect(dialog).toHaveCount(0);
  await help.focus();
  await page.keyboard.press('Enter');
  await expect(dialog).toBeVisible();
});

test('stat tile, plain: no card, the document type, the lead figure large and in the chart highlight', async ({page}) => {
  await open(page, 'components-data-display-stat-tile--plain-lead');
  const lead = page.locator('.gv-kpi').filter({hasText: 'Participants'}).first();
  await expect(lead).toHaveCSS('border-top-width', '0px');
  await expect(lead).toHaveCSS('background-color', 'rgba(0, 0, 0, 0)');
  await expect(lead.getByText('3,600')).toHaveCSS('font-size', '44px');
  await expect(lead.getByText('3,600')).toHaveCSS('color', 'rgb(20, 121, 133)');
  const other = page.locator('.gv-kpi').filter({hasText: 'Projects'});
  await expect(other.getByText('6', {exact: true})).toHaveCSS('font-size', '28px');
  // Label over value, as every Stat tile: the DOM and the eye agree.
  await expect(lead).toHaveText(/^Participants3,600/);
  await report(page, '#storybook-root');
});
