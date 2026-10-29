import {test, expect} from '@playwright/test';
// The Figma frames "Project · Build" and "Ideation · Manage (data)" on the phase screen.
// Two departures from the plan's Step 6 test, both forced by the gv components:
// - the Project header's current crumb is also a link named after the phase, so the rail link is looked up inside the
//   Phases nav;
// - gv ListHeader is itself a role="row" inside the grid's column header, so the first idea is the first row of
//   the grid's body, not row 1 of the whole grid;
// - the starter checkbox's input is visually hidden (1px, clipped) under its label, so .check() can't act on it:
//   the test clicks the visible box (the label) and asserts the checkbox checked.
// The project's phases were renamed for the project overview (seven named phases, one live): the Ideation phase is
// "Collect ideas" (p2) and the Voting phase "Community vote" (p4).
test('Project · Build shows the phase rail and setup cards', async ({page}) => {
  await page.goto('/backoffice/#/projects/green-corridors/phases/p2/build');
  const rail = page.getByRole('navigation', {name: 'Phases'});
  await expect(rail).toBeVisible();
  await expect(rail.getByRole('link', {name: /Collect ideas/})).toHaveAttribute('aria-current', 'page');
  await expect(rail.getByRole('link')).toHaveCount(7);
  expect(await page.locator('[data-gv="setup-card"]').count()).toBeGreaterThan(2);
  await expect(page.getByRole('radiogroup', {name: 'Phase view'}).getByRole('radio', {name: 'Build'})).toBeChecked();
  await expect(page.getByRole('heading', {name: 'Before you publish'})).toBeVisible();
});
test('Ideation · Manage lists inputs with selectable rows', async ({page}) => {
  await page.goto('/backoffice/#/projects/green-corridors/phases/p2/manage');
  const grid = page.getByRole('grid', {name: 'Ideas'});
  await expect(grid).toBeVisible();
  const first = grid.getByRole('rowgroup').last().getByRole('row').first();
  await first.getByRole('gridcell').first().locator('label').click();
  await expect(first).toHaveAttribute('aria-selected', 'true');
  await expect(first.getByRole('checkbox')).toBeChecked();
  await expect(page.getByRole('link', {name: /Waiting for a reply/})).toBeVisible();
});
test('the Phases rail moves between phases and other methods keep a note', async ({page}) => {
  await page.goto('/backoffice/#/projects/green-corridors/phases/p2/manage');
  await page.getByRole('navigation', {name: 'Phases'}).getByRole('link', {name: /Community vote/}).click();
  await expect(page).toHaveURL(/phases\/p4\/build/);
  await page.getByRole('radio', {name: 'Insights'}).click();
  await expect(page).toHaveURL(/phases\/p4\/insights/);
  await expect(page.getByText(/Not in Figma yet/)).toBeVisible();
});
