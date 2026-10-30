'use client';
import {useLocale} from 'react-aria-components/I18nProvider';

/*
 * Numbers and lists in the locale around a part: React Aria's I18nProvider, which AppProvider sets from its `locale`
 * (the browser's language when nothing sets one). These are React Aria's useNumberFormatter and friends, rebuilt on
 * the one React Aria package the system depends on (react-aria-components re-exports useLocale, not the formatters).
 * Never a fixed locale ('en-GB') in a part: tests/words.test.mjs fails on one.
 */

// Intl formatters are slow to build and every row of a table asks for one: one per locale and options.
const cache = new Map<string, Intl.NumberFormat | Intl.ListFormat | Intl.DateTimeFormat>();

function cached<T extends Intl.NumberFormat | Intl.ListFormat | Intl.DateTimeFormat>(key: string, make: () => T): T {
  let formatter = cache.get(key) as T | undefined;
  if (!formatter) {
    formatter = make();
    cache.set(key, formatter);
  }
  return formatter;
}

/** Numbers as the locale writes them: `useNumberFormatter().format(1284)` → "1,284" (en-GB), "1.284" (de-DE). */
export function useNumberFormatter(options?: Intl.NumberFormatOptions): Intl.NumberFormat {
  const {locale} = useLocale();
  return cached(`number|${locale}|${JSON.stringify(options ?? {})}`, () => new Intl.NumberFormat(locale, options));
}

/**
 * Dates as the locale writes them, as React Aria's useDateFormatter:
 * `useDateFormatter({day: 'numeric', month: 'long', year: 'numeric'}).format(date)` → "2 October 2026" (en-GB),
 * "2. Oktober 2026" (de-DE).
 */
export function useDateFormatter(options?: Intl.DateTimeFormatOptions): Intl.DateTimeFormat {
  const {locale} = useLocale();
  return cached(`date|${locale}|${JSON.stringify(options ?? {})}`, () => new Intl.DateTimeFormat(locale, options));
}

/**
 * Whole percentages as the locale writes them, from 0–100: `percent(42)` → "42%" (en-GB), "42 %" (fr-BE, de-DE).
 * Rounded first, as `Math.round` does, so 14.5 reads 15 in every locale.
 */
export function usePercentFormatter(): (percent: number) => string {
  const formatter = useNumberFormatter({style: 'percent', maximumFractionDigits: 0});
  return percent => formatter.format(Math.round(percent) / 100);
}

/**
 * A list as the locale joins it. `conjunction` (the default): "Participants and Visitors", "A, B und C". `unit`
 * (short): "a, b, c", for names listed without an "and" (a tag cell's hidden rest, a filter's values).
 */
export function useListFormatter(options: Intl.ListFormatOptions = {type: 'conjunction'}): Intl.ListFormat {
  const {locale} = useLocale();
  return cached(`list|${locale}|${JSON.stringify(options)}`, () => new Intl.ListFormat(locale, options));
}
