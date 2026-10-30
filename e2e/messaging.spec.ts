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

test('custom emails list sent, scheduled and draft emails, and a draft opens in the one composer', async ({page}) => {
  await page.goto('/backoffice/#/messaging');
  await expect(page.getByRole('button', {name: 'Create email'})).toBeVisible();
  const table = page.getByRole('grid', {name: 'Custom emails'});
  for (const c of ['Subject', 'Status', 'Date', 'Opened', 'Clicked']) {
    await expect(table.getByRole('columnheader', {name: c, exact: true})).toBeVisible();
  }
  for (const s of ['Sent', 'Scheduled', 'Draft']) await expect(table.getByText(s, {exact: true}).first()).toBeVisible();
  // No second composer on the list: Edit opens the draft at the real admin's route.
  await expect(page.getByRole('region', {name: /^Draft:/})).toHaveCount(0);
  await page.getByRole('button', {name: /^Actions for Market Square/}).click();
  await page.getByRole('menuitem', {name: 'Edit'}).click();
  await expect(page).toHaveURL(/#\/messaging\/emails\/custom\/e6\/edit$/);
  await expect(page.getByRole('heading', {level: 1, name: 'Edit email'})).toBeVisible();
  const composer = page.getByRole('region', {name: 'Write a message and choose who gets it'});
  await expect(composer.getByRole('textbox', {name: 'Subject'})).toHaveValue('Market Square: join the walk on Saturday');
  await expect(composer.getByRole('toolbar', {name: 'Formatting'})).toBeVisible();
  // The message in every platform language: the Multilingual rich text editor's language switcher.
  await expect(composer.getByRole('radio', {name: /^EN\b/})).toBeChecked();
  await expect(composer.getByRole('textbox', {name: /Email message/})).toContainText('Walk the square with the design team');
});

// The list sits in a Panel (Panel's "With actions" story); the composer is its own route (below).
test('custom emails: the list Panel carries Create email and its pages', async ({page}) => {
  await page.goto('/backoffice/#/messaging');
  const list = page.getByRole('region', {name: 'Custom emails', exact: true});
  await expect(list).toHaveClass(/gv-panel/);
  await expect(list.getByRole('heading', {level: 3, name: 'Custom emails'})).toBeVisible();
  await expect(list.locator('.gv-panel__description')).toHaveText('Send out custom emails and check statistics.');
  await expect(list.locator('.gv-panel__actions').getByRole('button', {name: 'Create email'})).toBeVisible();
  await expect(list.locator('.gv-panel__body').getByRole('grid', {name: 'Custom emails'})).toBeVisible();
  const pager = list.locator('.gv-panel__foot').getByRole('navigation', {name: 'Email pages'});
  await expect(pager.getByRole('button', {name: 'Page 1'})).toHaveAttribute('aria-current', 'page');
  a11yReport(await axeViolations(page, '.bo-messaging-lists'));
});

test('automated emails are grouped by recipient, switch on and off with Undo, and an on email opens its page', async ({page}) => {
  await page.goto('/backoffice/#/messaging');
  await page.getByRole('tab', {name: 'Automated emails'}).click();
  // One Panel per recipient group, the Build tab's Notification rows inside, a Section label per kind.
  for (const g of ['Residents', 'Admins and managers']) {
    const panel = page.getByRole('region', {name: g, exact: true});
    await expect(panel).toHaveClass(/gv-panel/);
    await expect(panel.locator('.gv-notification-row').first()).toBeVisible();
  }
  await expect(page.getByRole('region', {name: 'Residents', exact: true}).locator('.gv-panel__description')).toHaveText('5 of 6 emails on');
  await expect(page.getByRole('group', {name: 'Residents: Your inputs'})).toBeVisible();
  // Nothing open yet: the preview's Empty state.
  await expect(page.getByRole('region', {name: 'Preview'}).getByText('No email open')).toBeVisible();
  const sw = page.getByRole('switch', {name: /Weekly digest/});
  await expect(sw).toBeChecked();
  await sw.click({force: true});
  await expect(sw).not.toBeChecked();
  await expect(page.getByRole('region', {name: 'Residents', exact: true}).locator('.gv-panel__description')).toHaveText('4 of 6 emails on');
  // As in the prototype, an email that is off opens nothing.
  await expect(page.getByRole('button', {name: 'Edit Weekly digest'})).toHaveCount(0);
  // An instant change says so, with Undo.
  const off = toasts(page).filter({hasText: 'Email off'});
  await expect(off).toContainText('Weekly digest is no longer sent.');
  await off.getByRole('button', {name: 'Undo'}).click();
  await expect(sw).toBeChecked();
  await page.getByRole('button', {name: 'Edit Comment on your input'}).click();
  // The email's page takes the list's place (Notification row's "Email open" story); the email shows beside it.
  const editor = page.getByRole('region', {name: 'Comment on your input'});
  await expect(editor.getByRole('heading', {level: 2, name: 'Comment on your input'})).toBeVisible();
  await expect(editor.getByRole('switch', {name: 'Send this email'})).toBeChecked();
  for (const f of ['Replies should go to', 'Subject', 'Title', 'Button text']) await expect(editor.getByRole('textbox', {name: f, exact: true})).toBeVisible();
  await expect(editor.getByRole('textbox', {name: 'Introduction'})).toBeVisible();
  await expect(page.getByRole('region', {name: 'Residents', exact: true})).toHaveCount(0);
  const preview = page.getByRole('region', {name: 'Preview'});
  await expect(preview.getByRole('button', {name: 'Send me a test email'})).toBeVisible();
  await expect(preview.locator('[data-missing-part="Email preview"]')).toContainText('New comment on your input');
  // ← goes back to the list.
  await editor.getByRole('button', {name: 'Back to automated emails'}).click();
  await expect(editor).toHaveCount(0);
  await expect(page.getByRole('region', {name: 'Residents', exact: true})).toBeVisible();
});

test('SMS shows the credit balance and the campaigns in a list Panel', async ({page}) => {
  await page.goto('/backoffice/#/messaging');
  await page.getByRole('tab', {name: 'SMS'}).click();
  await expect(page.getByText('SMS credits remaining')).toBeVisible();
  for (const k of ['SMS campaigns', 'Test messages', 'Total used']) await expect(page.getByText(k, {exact: true}).first()).toBeVisible();
  // The list shape every admin table shares: Panel, Table toolbar count, Data table, Pagination.
  const list = page.getByRole('region', {name: 'SMS campaigns', exact: true});
  await expect(list).toHaveClass(/gv-panel/);
  await expect(list.locator('.gv-panel__actions').getByRole('button', {name: 'Create SMS'})).toBeVisible();
  await expect(list.getByRole('heading', {level: 4, name: '4 messages'})).toBeVisible();
  const grid = list.getByRole('grid', {name: 'SMS campaigns'});
  for (const c of ['Message', 'Status', 'Date', 'Delivered', 'Failed']) await expect(grid.getByRole('columnheader', {name: c, exact: true})).toBeVisible();
  await expect(grid.getByRole('row')).toHaveCount(5);
  await expect(list.locator('.gv-panel__foot').getByRole('navigation', {name: 'SMS pages'})).toBeVisible();
});

test('messaging names what the system still lacks', async ({page}) => {
  await page.goto('/backoffice/#/messaging');
  await page.getByRole('tab', {name: 'Automated emails'}).click();
  await page.getByRole('button', {name: 'Edit Comment on your input'}).click();
  const gaps = await page.locator('[data-missing-part]').evaluateAll(els => [...new Set(els.map(e => e.getAttribute('data-missing-part')))]);
  expect(gaps).toEqual(expect.arrayContaining(['Email preview']));
});

// ── The first clicks (shallow: each control leads somewhere visible) ─────────

test('Create email opens the composer; Send now checks the email and asks, with the recipient count', async ({page}) => {
  await page.goto('/backoffice/#/messaging');
  await page.getByRole('button', {name: 'Create email'}).click();
  await expect(page).toHaveURL(/#\/messaging\/emails\/custom\/new$/);
  await expect(page.getByRole('heading', {level: 1, name: 'New email'})).toBeVisible();
  for (const f of ['From', 'Replies should go to']) await expect(page.getByRole('textbox', {name: f, exact: true})).toBeVisible();
  await expect(page.getByRole('textbox', {name: /^Subject/})).toBeVisible();
  // Recipients, as the prototype: everyone by default, with the count in a chip; or a group.
  const recipients = page.getByRole('radiogroup', {name: 'Recipients'});
  await expect(recipients.getByRole('radio', {name: 'Send to all participants'})).toBeChecked();
  await expect(page.getByText('All participants · 5,012 recipients')).toBeVisible();
  await recipients.getByText('Send to a group', {exact: true}).click();
  await expect(page.getByText('Residents of the north district · 612 recipients')).toBeVisible();
  await recipients.getByText('Send to all participants', {exact: true}).click();
  // The composer is a Panel: the form in its body, Cancel, Save as draft, Send a preview and Send now in its foot.
  const composer = page.getByRole('region', {name: 'Write a message and choose who gets it'});
  await expect(composer).toHaveClass(/gv-panel/);
  for (const b of ['Cancel', 'Save as draft', 'Send a preview', 'Send now']) {
    await expect(composer.locator('.gv-panel__foot').getByRole('button', {name: b})).toBeVisible();
  }
  // Empty: Send now sends nothing, and says what is missing.
  await page.getByRole('button', {name: 'Send now'}).click();
  await expect(page.getByRole('alertdialog')).toHaveCount(0);
  await expect(composer.getByText('Add a subject line.')).toBeVisible();
  await expect(composer.getByText('Write the message.')).toBeVisible();
  await expect(page).toHaveURL(/#\/messaging\/emails\/custom\/new$/);
  await page.getByRole('textbox', {name: /^Subject/}).fill('Autumn clean-up day');
  await composer.getByRole('textbox', {name: /Email message/}).fill('Join us on Saturday to tidy the park.');
  await expect(composer.getByText('Add a subject line.')).toHaveCount(0);
  await page.getByRole('button', {name: 'Send a preview'}).click();
  await expect(page.locator('.react-aria-Toast').first()).toContainText('Preview sent');
  await page.locator('.react-aria-Toast').getByRole('button', {name: 'Close'}).click(); // it sits over the footer
  // Filled: Send now asks first, with how many people it goes to; Cancel keeps the email here.
  await page.getByRole('button', {name: 'Send now'}).click();
  const confirm = page.getByRole('alertdialog', {name: 'Send this email to 5,012 people?'});
  await expect(confirm).toBeVisible();
  await confirm.getByRole('button', {name: 'Cancel'}).click();
  await expect(page).toHaveURL(/#\/messaging\/emails\/custom\/new$/);
  await page.getByRole('button', {name: 'Send now'}).click();
  await confirm.getByRole('button', {name: 'Send email'}).click();
  await expect(page).toHaveURL(/#\/messaging$/);
  await expect(page.locator('.gv-banner[data-tone="success"]')).toContainText('Your email “Autumn clean-up day” was sent to 5,012 recipients.');
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
  // Who got it: a list Panel, its count, search and status filter in the toolbar, its pages in the foot.
  const recipients = page.getByRole('region', {name: 'Recipients', exact: true});
  await expect(recipients).toHaveClass(/gv-panel/);
  await expect(recipients.getByRole('heading', {level: 4, name: '6 recipients'})).toBeVisible();
  await recipients.getByRole('searchbox', {name: 'Search recipients'}).fill('resident6');
  await expect(recipients.getByRole('heading', {level: 4, name: '1 recipient'})).toBeVisible();
  await expect(grid.getByRole('row', {name: /Resident F/})).toContainText('Bounced');
  await expect(recipients.locator('.gv-panel__foot').getByRole('navigation', {name: 'Recipient pages'})).toBeVisible();
  const {violations} = await new AxeBuilder({page}).include('main')
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
  // The same composer shape as a new email: a Panel, the actions in its foot.
  const composer = page.getByRole('region', {name: 'Write a text message'});
  await expect(composer).toHaveClass(/gv-panel/);
  for (const b of ['Cancel', 'Send test SMS', 'Send now']) await expect(composer.locator('.gv-panel__foot').getByRole('button', {name: b})).toBeVisible();
  await page.getByRole('textbox', {name: 'Message'}).fill('The library is open late on Thursday.');
  await expect(page.getByText('37 / 160 characters · 1 SMS per recipient')).toBeVisible();
  // The text lands in the Chat message's bubble: no SMS bubble gap any more.
  await expect(page.getByRole('group', {name: 'SMS preview'})).toContainText('The library is open late');
  await expect(page.getByRole('group', {name: 'SMS preview'}).locator('.gv-chat-message')).toBeVisible();
  await page.getByRole('button', {name: 'Send test SMS'}).click();
  await expect(page.locator('.react-aria-Toast').first()).toContainText('Test SMS sent');
  await expect(page.locator('[data-missing-part]')).toHaveCount(0);
  // Send now asks first, with the people and the credits.
  await page.getByRole('button', {name: 'Send now'}).click();
  const confirm = page.getByRole('alertdialog', {name: /^Send this SMS to [\d,]+ people\?$/});
  await confirm.getByRole('button', {name: 'Send SMS'}).click();
  await expect(page).toHaveURL(/#\/messaging$/);
});

// ── Behaviour fixes: every control answers ──

const toasts = (page: import('@playwright/test').Page) => page.locator('.react-aria-Toast');

test('a draft opens in the composer, saves, and sends into the list after asking', async ({page}) => {
  await page.goto('/backoffice/#/messaging');
  const table = page.getByRole('grid', {name: 'Custom emails'});
  // A draft's row opens it in the composer.
  await table.getByRole('row', {name: /Bike parking survey/}).getByText('Draft').click();
  await expect(page).toHaveURL(/#\/messaging\/emails\/custom\/e3\/edit$/);
  await page.getByRole('textbox', {name: /^Subject/}).fill('Bike parking: mark your street');
  await page.getByRole('button', {name: 'Save as draft'}).click();
  await expect(toasts(page).filter({hasText: 'Draft saved'})).toBeVisible();
  await expect(page).toHaveURL(/#\/messaging$/);
  await expect(table.getByRole('row', {name: /Bike parking: mark your street/})).toContainText('Draft');
  await expect(table.getByRole('row', {name: /Bike parking survey/})).toHaveCount(0);
  await table.getByRole('button', {name: /^Actions for Bike parking: mark your street/}).click();
  await page.getByRole('menuitem', {name: 'Edit'}).click();
  // It goes to the group it was written for.
  await expect(page.getByText('Residents of the north district · 612 recipients')).toBeVisible();
  await page.getByRole('button', {name: 'Send now'}).click();
  await page.getByRole('alertdialog', {name: 'Send this email to 612 people?'}).getByRole('button', {name: 'Send email'}).click();
  // Sent: a success Banner on the list (the Banner's Success story), until it is dismissed.
  const sent = page.locator('.gv-banner[data-tone="success"]');
  await expect(sent).toHaveText(/^Your email “Bike parking: mark your street” was sent to 612 recipients\.$/);
  await sent.getByRole('button', {name: 'Dismiss'}).click();
  await expect(sent).toHaveCount(0);
  await expect(table.getByRole('row', {name: /Bike parking: mark your street/})).toContainText('Sent');
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
  // Delete asked first, then offers Undo too; Undo puts the draft back in its place.
  const deleted = toasts(page).filter({hasText: 'Draft deleted'});
  await deleted.getByRole('button', {name: 'Undo'}).click();
  await expect(table.getByRole('row', {name: /Market Square/})).toContainText('Draft');
  // Duplicate's Undo takes the copy away again.
  await toasts(page).filter({hasText: 'Email duplicated'}).getByRole('button', {name: 'Undo'}).click();
  await expect(table.getByRole('row', {name: /Copy of Library opening hours/})).toHaveCount(0);
});

test('custom emails: the toolbar counts, searches and filters the list', async ({page}) => {
  await page.goto('/backoffice/#/messaging');
  const list = page.getByRole('region', {name: 'Custom emails', exact: true});
  const toolbar = list.locator('.gv-panel__toolbar');
  await expect(toolbar.getByRole('heading', {level: 4, name: '6 emails'})).toBeVisible();
  await toolbar.getByRole('searchbox', {name: 'Search emails'}).fill('library');
  await expect(toolbar.getByRole('heading', {level: 4, name: '1 email'})).toBeVisible();
  await expect(list.getByRole('grid', {name: 'Custom emails'}).getByRole('row', {name: /Library opening hours/})).toBeVisible();
  await toolbar.getByRole('searchbox', {name: 'Search emails'}).fill('nothing like this');
  await expect(list.getByText('No emails match. Clear the search or the filters to see them all.')).toBeVisible();
  await toolbar.getByRole('searchbox', {name: 'Search emails'}).fill('');
  // The Filter menu: Status › Draft leaves the two drafts, and a chip says so.
  const filter = toolbar.getByRole('button', {name: /^Filter emails/});
  await filter.click();
  await page.getByRole('menu', {name: 'Filter emails'}).getByRole('menuitem', {name: /^Status/}).hover();
  await page.getByRole('menuitemcheckbox', {name: /^Draft/}).click();
  await page.keyboard.press('Escape');
  await page.keyboard.press('Escape');
  await expect(filter).toHaveAccessibleName('Filter emails (1 on)');
  await expect(toolbar.getByRole('heading', {level: 4, name: '2 emails'})).toBeVisible();
  const chips = toolbar.getByRole('grid', {name: 'Active filters'});
  await expect(chips).toContainText('Draft');
  await chips.getByRole('button', {name: 'Remove the Status filter'}).click();
  await expect(toolbar.getByRole('heading', {level: 4, name: '6 emails'})).toBeVisible();
});

test('an automated email sends a test email to the sender', async ({page}) => {
  await page.goto('/backoffice/#/messaging');
  await page.getByRole('tab', {name: 'Automated emails'}).click();
  await page.getByRole('button', {name: 'Edit Your input is published'}).click();
  await page.getByRole('button', {name: 'Send me a test email'}).click();
  await expect(toasts(page).first()).toContainText('Test email sent');
});

test('the messaging pages keep their headings in order (h1 → h2 → h3)', async ({page}) => {
  for (const route of ['messaging', 'messaging/emails/custom/new', 'messaging/emails/custom/e3/edit', 'messaging/emails/custom/e4', 'messaging/texting/new']) {
    await page.goto(`/backoffice/#/${route}`);
    await expect(page.getByRole('heading', {level: 1})).toBeVisible();
    expect(await headingJumps(page), route).toEqual([]);
  }
});
