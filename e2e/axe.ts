import AxeBuilder from '@axe-core/playwright';
import type {Page} from '@playwright/test';

/** The WCAG 2.2 AA violations inside one part of the page (an open modal, a popover), as "rule: targets". */
export async function axeViolations(page: Page, within: string) {
  const {violations} = await new AxeBuilder({page}).include(within)
    .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa', 'wcag22aa']).analyze();
  return violations.map(v => `${v.id}: ${v.nodes.map(n => n.target.join(' ')).join(', ')}`);
}
