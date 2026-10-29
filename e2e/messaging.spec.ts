import {test, expect} from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

test('messaging follows the real admin: custom emails, automated emails and SMS tabs', async ({page}) => {
  await page.goto('/backoffice/#/messaging');
  await expect(page.getByRole('heading', {level: 1, name: 'Messaging'})).toBeVisible();
  const tabs = page.getByRole('tablist', {name: 'Messaging channels'});
  for (const t of ['Custom emails', 'Automated emails', 'SMS']) await expect(tabs.getByRole('tab', {name: t})).toBeVisible();
  await expect(tabs.getByRole('tab', {name: 'Custom emails'})).toHaveAttribute('aria-selected', 'true');
});

test('custom emails list sent, scheduled and draft emails, and a draft opens in the editor', async ({page}) => {
  await page.goto('/backoffice/#/messaging');
  await expect(page.getByRole('button', {name: 'Create email'})).toBeVisible();
  const table = page.getByRole('grid', {name: 'Custom emails'});
  for (const c of ['Subject', 'Status', 'Date', 'Opened', 'Clicked']) {
    await expect(table.getByRole('columnheader', {name: c, exact: true})).toBeVisible();
  }
  for (const s of ['Sent', 'Scheduled', 'Draft']) await expect(table.getByText(s, {exact: true}).first()).toBeVisible();
  // The draft composer: sender, recipients, subject and the message editor with its formatting toolbar.
  const draft = page.getByRole('region', {name: /^Draft:/});
  await expect(draft.getByRole('textbox', {name: 'From'})).toBeVisible();
  await expect(draft.getByRole('textbox', {name: 'Replies should go to'})).toBeVisible();
  await expect(draft.getByRole('textbox', {name: 'Subject'})).toBeVisible();
  await expect(draft.getByRole('toolbar', {name: 'Formatting'})).toBeVisible();
  await expect(draft.getByRole('textbox', {name: 'Email message'})).toBeVisible();
  await expect(draft.getByRole('button', {name: 'Send a preview'})).toBeVisible();
  await expect(draft.getByRole('button', {name: 'Send now'})).toBeVisible();
  // Choosing another draft from its row's menu loads it.
  await expect(page.getByRole('region', {name: 'Draft: Bike parking survey: tell us where'})).toBeVisible();
  await page.getByRole('button', {name: /^Actions for Market Square/}).click();
  await page.getByRole('menuitem', {name: 'Edit'}).click();
  await expect(page.getByRole('region', {name: 'Draft: Market Square: join the walk on Saturday'})).toBeVisible();
});

test('automated emails are grouped by recipient, switch on and off, and an on email opens its editor', async ({page}) => {
  await page.goto('/backoffice/#/messaging');
  await page.getByRole('tab', {name: 'Automated emails'}).click();
  for (const g of ['Residents', 'Admins and managers']) await expect(page.getByRole('heading', {name: g})).toBeVisible();
  const sw = page.getByRole('switch', {name: /Weekly digest/});
  await expect(sw).toBeChecked();
  await sw.click({force: true});
  await expect(sw).not.toBeChecked();
  // As in the prototype, an email that is off can't be edited.
  await expect(page.getByRole('button', {name: 'Edit Weekly digest'})).toBeDisabled();
  await page.getByRole('button', {name: 'Edit Comment on your input'}).click();
  const editor = page.getByRole('region', {name: 'Comment on your input'});
  for (const f of ['Replies should go to', 'Subject', 'Title', 'Button text']) await expect(editor.getByRole('textbox', {name: f, exact: true})).toBeVisible();
  await expect(editor.getByRole('textbox', {name: 'Introduction'})).toBeVisible();
  await expect(editor.getByRole('button', {name: 'Send me a test email'})).toBeVisible();
});

test('SMS shows the credit balance and the campaigns', async ({page}) => {
  await page.goto('/backoffice/#/messaging');
  await page.getByRole('tab', {name: 'SMS'}).click();
  await expect(page.getByText('SMS credits remaining')).toBeVisible();
  for (const k of ['SMS campaigns', 'Test messages', 'Total used']) await expect(page.getByText(k, {exact: true}).first()).toBeVisible();
  await expect(page.getByRole('button', {name: 'Create SMS'})).toBeVisible();
  await expect(page.getByRole('list', {name: 'SMS campaigns'}).getByRole('listitem')).toHaveCount(4);
});

test('messaging names what the system still lacks', async ({page}) => {
  await page.goto('/backoffice/#/messaging');
  await page.getByRole('tab', {name: 'Automated emails'}).click();
  await page.getByRole('button', {name: 'Edit Comment on your input'}).click();
  const gaps = await page.locator('[data-gap]').evaluateAll(els => [...new Set(els.map(e => e.getAttribute('data-gap')))]);
  expect(gaps).toEqual(expect.arrayContaining(['Email preview']));
});

// ── The first clicks (shallow: each control leads somewhere visible) ─────────

test('Create email opens the composer: sender, recipients, subject, message; Send now returns to the list', async ({page}) => {
  await page.goto('/backoffice/#/messaging');
  await page.getByRole('button', {name: 'Create email'}).click();
  await expect(page).toHaveURL(/#\/messaging\/emails\/custom\/new$/);
  await expect(page.getByRole('heading', {level: 1, name: 'New email'})).toBeVisible();
  for (const f of ['From', 'Replies should go to', 'Subject']) await expect(page.getByRole('textbox', {name: f, exact: true})).toBeVisible();
  await expect(page.getByRole('button', {name: /To$/})).toBeVisible();
  await expect(page.getByRole('textbox', {name: 'Email message'})).toBeVisible();
  await page.getByRole('textbox', {name: 'Subject', exact: true}).fill('Autumn clean-up day');
  await page.getByRole('button', {name: 'Send a preview'}).click();
  await expect(page.locator('.react-aria-Toast').first()).toContainText('Preview sent');
  await page.locator('.react-aria-Toast').getByRole('button', {name: 'Close'}).click(); // it sits over the footer
  await page.getByRole('button', {name: 'Send now'}).click();
  await expect(page).toHaveURL(/#\/messaging$/);
  await expect(page.getByRole('grid', {name: 'Custom emails'}).getByRole('row', {name: /Autumn clean-up day/})).toContainText('Sent');
});

test('a sent email row opens its statistics: recipients, opened, clicked, and who got it', async ({page}) => {
  await page.goto('/backoffice/#/messaging');
  await page.getByRole('grid', {name: 'Custom emails'}).getByRole('row', {name: /Library opening hours: the results/}).getByText('Sent').click();
  await expect(page).toHaveURL(/#\/messaging\/emails\/custom\/e4$/);
  await expect(page.getByRole('heading', {level: 1, name: 'Library opening hours: the results'})).toBeVisible();
  for (const k of ['Recipients', 'Delivered', 'Opened', 'Clicked']) await expect(page.getByText(k, {exact: true}).first()).toBeVisible();
  const grid = page.getByRole('grid', {name: 'Recipients'});
  for (const c of ['Recipient', 'Status']) await expect(grid.getByRole('columnheader', {name: c})).toBeVisible();
  const {violations} = await new AxeBuilder({page}).include('.bo-page')
    .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa', 'wcag22aa']).analyze();
  expect(violations.map(v => `${v.id}: ${v.nodes.map(n => n.target).join(', ')}`)).toEqual([]);
  await page.getByRole('navigation', {name: 'Breadcrumbs'}).getByRole('link', {name: 'Messaging'}).click();
  await expect(page).toHaveURL(/#\/messaging$/);
});

test('Create SMS opens the SMS composer with a character count and a phone preview', async ({page}) => {
  await page.goto('/backoffice/#/messaging');
  await page.getByRole('tab', {name: 'SMS'}).click();
  await page.getByRole('button', {name: 'Create SMS'}).click();
  await expect(page).toHaveURL(/#\/messaging\/texting\/new$/);
  await expect(page.getByRole('heading', {level: 1, name: 'New SMS'})).toBeVisible();
  await page.getByRole('textbox', {name: 'Message'}).fill('The library is open late on Thursday.');
  await expect(page.getByText('37 / 160 characters · 1 SMS per recipient')).toBeVisible();
  await expect(page.getByRole('group', {name: 'SMS preview'})).toContainText('The library is open late');
  await page.getByRole('button', {name: 'Send test SMS'}).click();
  await expect(page.locator('.react-aria-Toast').first()).toContainText('Test SMS sent');
  const gaps = await page.locator('[data-gap]').evaluateAll(els => [...new Set(els.map(e => e.getAttribute('data-gap')))]);
  expect(gaps).toEqual(['SMS bubble']);
});
