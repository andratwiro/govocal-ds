/**
 * Words (docs/API.md rule 11). The system never translates. Every word a part says comes from the page: content as
 * the part's own props (`title`, `label`, `aria-label`, `placeholder`, `emptyLabel`, `children`), and the part's own
 * words (its controls, states, counts, joins, and the English defaults of those content props) as `labels`.
 *
 *   <FilterChips labels={{clear: formatMessage(messages.clear)}} … />
 */

/**
 * A phrase that agrees with a count: the count as a number (the host's plural rules need it), then as the locale
 * writes it ("1,284"; "1.284" in German), which the English defaults print.
 *
 *   selected: (count, n) => `${n} selected`
 *   selected: count => formatMessage(messages.selected, {count})   // ICU: {count, plural, one {# selected} …}
 */
export type CountLabel = (count: number, formatted: string) => string;

/**
 * A part's English defaults with the page's words over them. A key the page leaves out, or passes as `undefined`,
 * keeps its default. Internal: every part with words calls it as `mergeLabels(xLabels, labels)`.
 */
export function mergeLabels<T extends object>(defaults: T, labels?: Partial<T>): T {
  if (!labels) return defaults;
  const merged = {...defaults};
  for (const key of Object.keys(labels) as (keyof T)[]) {
    if (labels[key] !== undefined) merged[key] = labels[key] as T[keyof T];
  }
  return merged;
}

/** The words of the five load-more items (`ListBoxLoadMoreItem`, `MenuLoadMoreItem`, `GridListLoadMoreItem`,
 * `TableLoadMoreItem`, `TreeLoadMoreItem`): the spinner's name while the next page loads. */
export interface LoadMoreLabels {
  loading: string;
}

export const loadMoreLabels: LoadMoreLabels = {loading: 'Loading more...'};
