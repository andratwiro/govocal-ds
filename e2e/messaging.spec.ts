import {test, expect} from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';
import {headingJumps} from './headings';
import {a11yReport, axeViolations} from './axe';

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

// The list and the composer each sit in a Panel (Panel's "With actions" and "In a composer" stories).
test('custom emails: the list Panel carries Create email and its pages; the composer Panel has Cancel and Send in its foot', async ({page}) => {
  await page.goto('/backoffice/#/messaging');
  const list = page.getByRole('region', {name: 'Custom emails', exact: true});
  await expect(list).toHaveClass(/gv-panel/);
  await expect(list.getByRole('heading', {level: 3, name: 'Custom emails'})).toBeVisible();
  await expect(list.locator('.gv-panel__description')).toHaveText('Send out custom emails and check statistics.');
  await expect(list.locator('.gv-panel__actions').getByRole('button', {name: 'Create email'})).toBeVisible();
  await expect(list.locator('.gv-panel__body').getByRole('grid', {name: 'Custom emails'})).toBeVisible();
  const pager = list.locator('.gv-panel__foot').getByRole('navigation', {name: 'Email pages'});
  await expect(pager.getByRole('button', {name: 'Page 1'})).toHaveAttribute('aria-current', 'page');
  const draft = page.getByRole('region', {name: 'Draft: Bike parking survey: tell us where'});
  await expect(draft).toHaveClass(/gv-panel/);
  await expect(draft.getByRole('heading', {level: 3, name: 'Draft: Bike parking survey: tell us where'})).toBeVisible();
  const foot = draft.locator('.gv-panel__foot');
  for (const b of ['Cancel', 'Save as draft', 'Send a preview', 'Send now']) await expect(foot.getByRole('button', {name: b})).toBeVisible();
  await expect(draft.locator('.gv-panel__body').getByRole('textbox', {name: 'Subject'})).toBeVisible();
  a11yReport(await axeViolations(page, '.bo-messaging-lists'));
  // Cancel closes the composer and keeps the draft as it was.
  await draft.getByRole('textbox', {name: 'Subject'}).fill('Not kept');
  await foot.getByRole('button', {name: 'Cancel'}).click();
  await expect(draft).toHaveCount(0);
  await expect(page.getByText('Choose Edit on a draft to open it here.')).toBeVisible();
  await expect(page.getByRole('grid', {name: 'Custom emails'}).getByRole('row', {name: /Bike parking survey/})).toContainText('Draft');
  await expect(page.getByRole('row', {name: /Not kept/})).toHaveCount(0);
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
  // The composer is a Panel: the form in its body, Cancel, Save as draft, Send a preview and Send now in its foot.
  const composer = page.getByRole('region', {name: 'Write a message and choose who gets it'});
  await expect(composer).toHaveClass(/gv-panel/);
  for (const b of ['Cancel', 'Save as draft', 'Send a preview', 'Send now']) {
    await expect(composer.locator('.gv-panel__foot').getByRole('button', {name: b})).toBeVisible();
  }
  await page.getByRole('textbox', {name: 'Subject', exact: true}).fill('Autumn clean-up day');
  await page.getByRole('button', {name: 'Send a preview'}).click();
  await expect(page.locator('.react-aria-Toast').first()).toContainText('Preview sent');
  await page.locator('.react-aria-Toast').getByRole('button', {name: 'Close'}).click(); // it sits over the footer
  await page.getByRole('button', {name: 'Send now'}).click();
  await expect(page).toHaveURL(/#\/messaging$/);
  await expect(page.locator('.gv-banner[data-tone="success"]')).toContainText('Your email “Autumn clean-up day” was sent to');
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
  a11yReport(violations.map(v => `${v.id}: ${v.nodes.map(n => n.target).join(', ')}`));
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

// ── Behaviour fixes: every control answers ──

const toasts = (page: import('@playwright/test').Page) => page.locator('.react-aria-Toast');

test('the draft composer saves, previews and sends the draft into the list', async ({page}) => {
  await page.goto('/backoffice/#/messaging');
  const draft = page.getByRole('region', {name: 'Draft: Bike parking survey: tell us where'});
  await draft.getByRole('textbox', {name: 'Subject'}).fill('Bike parking: mark your street');
  await draft.getByRole('button', {name: 'Save as draft'}).click();
  await expect(toasts(page).filter({hasText: 'Draft saved'})).toBeVisible();
  const table = page.getByRole('grid', {name: 'Custom emails'});
  await expect(table.getByRole('row', {name: /Bike parking: mark your street/})).toContainText('Draft');
  // The saved subject renames the draft's card.
  const saved = page.getByRole('region', {name: 'Draft: Bike parking: mark your street'});
  await saved.getByRole('button', {name: 'Send a preview'}).click();
  await expect(toasts(page).filter({hasText: 'Preview sent'})).toBeVisible();
  await saved.getByRole('button', {name: 'Send now'}).click();
  // Sent: a success Banner on the list (the Banner's Success story), until it is dismissed.
  const sent = page.locator('.gv-banner[data-tone="success"]');
  await expect(sent).toHaveText(/^Your email “Bike parking: mark your street” was sent to [\d,]+ recipients\.$/);
  await expect(toasts(page).filter({hasText: 'Email sent'})).toHaveCount(0);
  await sent.getByRole('button', {name: 'Dismiss'}).click();
  await expect(sent).toHaveCount(0);
  await expect(table.getByRole('row', {name: /Bike parking: mark your street/})).toContainText('Sent');
  await expect(saved).toHaveCount(0);
});

test('a row menu duplicates an email, and deletes a draft after asking', async ({page}) => {
  await page.goto('/backoffice/#/messaging');
  const table = page.getByRole('grid', {name: 'Custom emails'});
  await table.getByRole('button', {name: /^Actions for Library opening hours/}).click();
  await page.getByRole('menuitem', {name: 'Duplicate'}).click();
  await expect(toasts(page).filter({hasText: 'Email duplicated'})).toBeVisible();
  await expect(table.getByRole('row', {name: /Copy of Library opening hours/})).toContainText('Draft');
  await table.getByRole('button', {name: /^Actions for Market Square/}).click();
  await page.getByRole('menuitem', {name: 'Delete'}).click();
  const confirm = page.getByRole('alertdialog', {name: 'Delete this draft?'});
  await expect(confirm.getByRole('button', {name: 'Cancel'})).toBeFocused();
  await confirm.getByRole('button', {name: 'Delete draft'}).click();
  await expect(confirm).toHaveCount(0);
  await expect(table.getByRole('row', {name: /Market Square/})).toHaveCount(0);
  await expect(toasts(page).filter({hasText: 'Draft deleted'})).toBeVisible();
});

test('an automated email sends a test email to the sender', async ({page}) => {
  await page.goto('/backoffice/#/messaging');
  await page.getByRole('tab', {name: 'Automated emails'}).click();
  await page.getByRole('button', {name: 'Send me a test email'}).click();
  await expect(toasts(page).first()).toContainText('Test email sent');
});

test('the messaging pages keep their headings in order (h1 → h2 → h3)', async ({page}) => {
  for (const route of ['messaging', 'messaging/emails/custom/new', 'messaging/emails/custom/e4', 'messaging/texting/new']) {
    await page.goto(`/backoffice/#/${route}`);
    await expect(page.getByRole('heading', {level: 1})).toBeVisible();
    expect(await headingJumps(page), route).toEqual([]);
  }
});
