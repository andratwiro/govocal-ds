import {test, expect} from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';
import {a11yReport} from './axe';

test('inspiration hub follows the real admin: highlighted projects, then all projects with filters and sort', async ({page}) => {
  await page.goto('/backoffice/#/inspiration-hub');
  await expect(page.getByRole('heading', {level: 1, name: 'Inspiration hub'})).toBeVisible();
  await expect(page.getByRole('heading', {level: 2, name: 'Highlighted'})).toBeVisible();
  await expect(page.getByRole('heading', {level: 2, name: 'All projects'})).toBeVisible();
  for (const name of ['Method', 'Country', 'Population', 'Topic', 'Sort by']) {
    await expect(page.getByRole('button', {name: new RegExp(`${name}$`)}).first()).toBeVisible();
  }
  await expect(page.getByRole('searchbox', {name: 'Search projects'})).toBeVisible();
  await expect(page.getByRole('button', {name: 'Reset filters'})).toBeVisible();
  await expect(page.getByRole('note').filter({hasText: 'Try changing the filters'})).toBeVisible();
});

test('highlighted projects follow the chosen country', async ({page}) => {
  await page.goto('/backoffice/#/inspiration-hub');
  const pinned = page.getByRole('list', {name: 'Highlighted projects'}).getByRole('listitem');
  await expect(pinned).toHaveCount(2);
  await page.getByRole('button', {name: /Highlighted for$/}).click();
  await page.getByRole('option', {name: 'Southmere'}).click();
  await expect(pinned).toHaveCount(1);
  await expect(pinned.first()).toContainText('Neighbourhood budget 2026');
});

test('each card shows platform, participants and methods, and can be copied', async ({page}) => {
  await page.goto('/backoffice/#/inspiration-hub');
  const all = page.getByRole('list', {name: 'All projects'}).getByRole('listitem');
  await expect(all).toHaveCount(8);
  const card = all.filter({has: page.getByRole('heading', {level: 3, name: 'Cycle lanes on the ring road'})});
  await expect(card).toContainText('Quillbrook');
  await expect(card).toContainText('2,475');
  await expect(card).toContainText('Common ground');
  await expect(card.getByRole('button', {name: 'Preview: Cycle lanes on the ring road'})).toBeVisible();
  await card.getByRole('button', {name: 'Copy project'}).click();
  await expect(card.getByText('Copied to your drafts')).toBeVisible();
  await expect(card.getByRole('button', {name: 'Copy project'})).toBeDisabled();
});

test('filters narrow the gallery, show as removable tags, and reset', async ({page}) => {
  await page.goto('/backoffice/#/inspiration-hub');
  const all = page.getByRole('list', {name: 'All projects'}).getByRole('listitem');
  await page.getByRole('button', {name: /Method$/}).click();
  await page.getByRole('option', {name: 'Voting'}).click();
  await expect(all).toHaveCount(3);
  const active = page.getByRole('grid', {name: 'Active filters'});
  await expect(active.getByRole('row', {name: /Voting/})).toBeVisible();
  await page.getByRole('searchbox', {name: 'Search projects'}).fill('budget');
  await expect(all).toHaveCount(1);
  await page.getByRole('button', {name: 'Reset filters'}).click();
  await expect(all).toHaveCount(8);
  await page.getByRole('button', {name: /Method$/}).click();
  await page.getByRole('option', {name: 'Volunteering'}).click();
  await expect(all).toHaveCount(1);
  await active.getByRole('row', {name: /Volunteering/}).getByRole('button', {name: /Remove/}).click();
  await expect(all).toHaveCount(8);
});

test('inspiration hub names what the system still lacks', async ({page}) => {
  await page.goto('/backoffice/#/inspiration-hub');
  const gaps = await page.locator('[data-gap]').evaluateAll(els => [...new Set(els.map(e => e.getAttribute('data-gap')))]);
  expect(gaps).toEqual(expect.arrayContaining(['Project image', 'Quote']));
});

// ── The first clicks: a card opens a preview of its project ──

test('a project card opens a preview, and the preview passes axe', async ({page}) => {
  await page.goto('/backoffice/#/inspiration-hub');
  const all = page.getByRole('list', {name: 'All projects'});
  await all.getByRole('link', {name: 'Cycle lanes on the ring road', exact: true}).click();
  const dialog = page.getByRole('dialog', {name: 'Cycle lanes on the ring road'});
  await expect(dialog).toBeVisible();
  await expect(dialog).toContainText('Quillbrook');
  await expect(dialog).toContainText('2,475 participants');
  await expect(dialog.getByRole('heading', {name: 'Phases'})).toBeVisible();
  const r = await new AxeBuilder({page}).include('.gv-modal').withTags(['wcag2a', 'wcag2aa', 'wcag21aa', 'wcag22aa']).analyze();
  a11yReport(r.violations.map(v => v.id));
  await dialog.getByRole('button', {name: 'Close'}).first().click();
  await expect(dialog).toHaveCount(0);
});

test('the preview icon opens the same preview, and copying from it marks the card', async ({page}) => {
  await page.goto('/backoffice/#/inspiration-hub');
  const all = page.getByRole('list', {name: 'All projects'}).getByRole('listitem');
  const card = all.filter({has: page.getByRole('heading', {level: 3, name: 'Safe routes to school'})});
  await card.getByRole('button', {name: 'Preview: Safe routes to school'}).click();
  const dialog = page.getByRole('dialog', {name: 'Safe routes to school'});
  await expect(dialog).toContainText('Survey');
  await dialog.getByRole('button', {name: 'Copy project'}).click();
  await expect(dialog).toHaveCount(0);
  await expect(card.getByText('Copied to your drafts')).toBeVisible();
});
