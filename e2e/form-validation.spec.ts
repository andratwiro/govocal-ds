import {test, expect, type Locator} from '@playwright/test';
import {axeViolations, a11yReport} from './axe';
const story = (id: string) => `/storybook/iframe.html?id=patterns-recipes-form-validation--${id}&viewMode=story`;

// A field's message is read with it (aria-describedby): what a screen reader hears, whatever the paint.
const says = (field: Locator, message: string) => expect(field).toHaveAccessibleDescription(new RegExp(message));

test('Form validation: a submit with fields to fix moves focus to the first, then to the next', async ({page}) => {
  await page.goto(story('submit-to-validate'));
  const save = page.getByRole('button', {name: 'Save'});
  const title = page.getByRole('textbox', {name: 'Title', exact: true});
  const email = page.getByRole('textbox', {name: 'Contact email'});
  const participants = page.getByRole('textbox', {name: 'Participants'});
  const visibility = page.getByRole('radiogroup', {name: 'Visibility'});
  const terms = page.getByRole('checkbox', {name: 'I accept the terms'});
  const submit = async () => { await save.focus(); await page.keyboard.press('Enter'); };

  // Nothing filled: every field to fix says so, and focus lands on the first.
  await submit();
  await expect(title).toBeFocused();
  await expect(title).toHaveAttribute('aria-invalid', 'true');
  await says(title, 'Give the project a title.');
  await says(email, 'Add a contact email.');
  await says(participants, 'How many people can take part\\?');
  await says(visibility, 'Choose who can see the project.');
  await says(terms, 'Accept the terms to publish.');
  await expect(page.getByText('Pick a folder.')).toBeVisible();
  a11yReport(await axeViolations(page, '.react-aria-Form'));

  // Fixed one: the next submit moves on to the next.
  await page.keyboard.type('Green corridors');
  await submit();
  await expect(email).toBeFocused();
  await expect(title).not.toHaveAttribute('aria-invalid', 'true');
  await page.keyboard.type('not an email');
  await submit();
  await expect(email).toBeFocused();
  await says(email, 'That is not an email address');
  await email.fill('team@example.org');
  await submit();
  await expect(participants).toBeFocused();
  await page.keyboard.type('0');
  await submit();
  await expect(participants).toBeFocused();
  await says(participants, 'At least 1.');
  await participants.fill('40');
  await submit();

  // The Select's trigger, by keyboard: open it, take the first folder.
  const folder = page.getByRole('button', {name: /Folder/});
  await expect(folder).toBeFocused();
  await page.keyboard.press('Enter');
  await expect(page.getByRole('option', {name: 'Parks and green space'})).toBeFocused();
  await page.keyboard.press('Enter');
  await expect(folder).toContainText('Parks and green space');
  await submit();
  await expect(visibility.getByRole('radio', {name: 'Everyone'})).toBeFocused();
  await page.keyboard.press('Space');
  await submit();
  await expect(terms).toBeFocused();
  await page.keyboard.press('Space');

  // All pass: the page's onSubmit runs.
  await submit();
  await expect(page.getByRole('status')).toContainText('“Green corridors” is ready to publish.');
  await expect(page.locator('[aria-invalid="true"]')).toHaveCount(0);
});

test('Form validation: every field shows its invalid state and message', async ({page}) => {
  await page.goto(story('all-invalid'));
  await says(page.getByRole('textbox', {name: 'Project title'}), 'Name the project.');
  await says(page.getByRole('textbox', {name: 'Title', exact: true}), 'Give the project a title.');
  await says(page.getByRole('textbox', {name: 'Description'}), 'Say in a sentence what the project is about.');
  await says(page.getByRole('textbox', {name: 'Participants'}), 'At least 1 participant.');
  await says(page.getByRole('searchbox', {name: 'Find a project'}), 'Type at least 3 letters.');
  await says(page.getByRole('checkbox', {name: 'I accept the terms'}), 'Accept the terms to publish.');
  await says(page.getByRole('switch', {name: 'Send a notification'}), 'This phase needs its notification on.');
  await says(page.getByRole('radiogroup', {name: 'Visibility'}), 'Choose who can see the project.');
  await says(page.getByRole('group', {name: 'Topics'}), 'Pick at least one topic.');
  await says(page.getByRole('radiogroup', {name: 'Participation method'}), 'Choose how people take part.');
  for (const message of ['Pick a folder.', "The end date can't be before the start date."])
    await expect(page.getByText(message)).toBeVisible();
  a11yReport(await axeViolations(page, '.react-aria-Form'));
});

test('Text field: its error message runs as wide as the field', async ({page}) => {
  await page.goto(story('all-invalid'));
  const field = await page.getByRole('textbox', {name: 'Title', exact: true}).boundingBox();
  const message = await page.getByText('Give the project a title.').boundingBox();
  expect(message!.width).toBeGreaterThan(field!.width / 4);
});
