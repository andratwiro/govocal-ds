import type {Page} from '@playwright/test';

/** Every place the page's headings skip a level going down (h1 → h3), as "h1 Title → h3 Card": empty when in order. */
export async function headingJumps(page: Page, within = 'main') {
  return page.locator(within).evaluate(root => {
    const levels = [...root.querySelectorAll('h1, h2, h3, h4, h5, h6')].map(h => ({level: Number(h.tagName[1]), text: h.textContent?.trim() ?? ''}));
    return levels.flatMap((h, i) => (i > 0 && h.level > levels[i - 1].level + 1
      ? [`h${levels[i - 1].level} ${levels[i - 1].text} → h${h.level} ${h.text}`] : []));
  });
}
