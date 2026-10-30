import AxeBuilder from '@axe-core/playwright';
import {test, type Page} from '@playwright/test';

/** The WCAG 2.2 AA violations inside one part of the page (an open modal, a popover), as "rule: targets". */
// A dialog fading in is half transparent for a moment, and axe reads that as low contrast: let animations end first.
// An animation that loops forever (a spinner, a skeleton's shimmer, the countdown's pulse) never ends, so it isn't
// waited for: only the ones with an end are.
export async function settled(page: Page) {
  await page.waitForFunction(() => document.getAnimations().every(a =>
    a.playState !== 'running' || a.effect?.getComputedTiming().iterations === Infinity));
}

export async function axeViolations(page: Page, within: string) {
  await settled(page);
  // In a story, Storybook's a11y panel runs axe in the same frame on load; a second run at that moment is refused
  // ("Axe is already running"), so wait for it and try again.
  for (let attempt = 0; ; attempt++) {
    try {
      const {violations} = await new AxeBuilder({page}).include(within)
        .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa', 'wcag22aa']).analyze();
      return violations.map(v => `${v.id}: ${v.nodes.map(n => n.target.join(' ')).join(', ')}`);
    } catch (e) {
      if (attempt >= 10 || !String(e).includes('Axe is already running')) throw e;
      await page.waitForTimeout(200);
    }
  }
}

/**
 * WCAG 2.2 AA is the front office's bar. In the back office the design is followed as drawn: axe's findings are
 * reported (a test annotation and a log line each), never fail a test and never change the design (29 Oct 2026).
 */
export function a11yReport(violations: string[]) {
  for (const v of violations) {
    test.info().annotations.push({type: 'a11y', description: v});
    console.log(`a11y (reported, not blocking): ${v}`);
  }
}
