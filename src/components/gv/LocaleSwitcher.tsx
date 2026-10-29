'use client';
import {useState, type CSSProperties} from 'react';
import {RadioGroup, Radio} from 'react-aria-components/RadioGroup';
import {Select as AriaSelect, SelectValue} from 'react-aria-components/Select';
import {Button} from 'react-aria-components/Button';
import {VisuallyHidden} from 'react-aria-components/VisuallyHidden';
import {useLocale} from 'react-aria-components';
import {ChevronDown, Languages} from 'lucide-react';
import clsx from 'clsx';
import {Popover} from '../Popover';
import {DropdownItem, DropdownListBox} from '../ListBox';
import './LocaleSwitcher.css';

/**
 * Text in each of the platform's languages, keyed by locale code (`{en: 'Parks', 'nl-BE': 'Parken'}`): the platform's
 * `Multiloc`, so a value from its API drops in as it is.
 */
export type Multiloc = Partial<Record<string, string>>;

/** The text values a mark reads: one Multiloc, or several that share the switcher (a title and its description). */
export type MultilocValues = Multiloc | null | undefined | ReadonlyArray<Multiloc | null | undefined>;

/**
 * What a language's mark says. `filled`: it has text. `empty`: no text, and none is needed. `required`: no text yet,
 * and every language needs some. `invalid`: it holds an error (a required language still empty once the field is
 * invalid, or an error of its own).
 */
export type LocaleStatus = 'filled' | 'empty' | 'required' | 'invalid';

// Rich text arrives as HTML: tags alone ("<p></p>") are no text, an image or an embed is.
const MEDIA = /<(img|iframe|video|audio)\b/i;
const hasText = (text: string | undefined | null) =>
  !!text && (MEDIA.test(text) || text.replace(/<[^>]*>/g, '').replace(/&nbsp;/gi, ' ').trim() !== '');

/**
 * Whether `locale` has text in `values`: something other than spaces (HTML tags alone don't count). With several
 * Multilocs, every one must have it, as the platform's switcher counts.
 */
export function isLocaleFilled(locale: string, values: MultilocValues): boolean {
  const list = Array.isArray(values) ? values : [values as Multiloc | null | undefined];
  return list.every(value => hasText(value?.[locale]));
}

/** The locales of `locales` with no text in `values`, in the platform's order. */
export function emptyLocales(locales: readonly string[], values: MultilocValues): string[] {
  return locales.filter(locale => !isLocaleFilled(locale, values));
}

export interface LocaleStatusOptions {
  values: MultilocValues;
  isRequired?: boolean;
  isInvalid?: boolean;
  /** Locales with an error of their own, whatever their text. */
  invalidLocales?: readonly string[];
}

/** The mark one language shows (see `LocaleStatus`). */
export function localeStatus(locale: string, {values, isRequired, isInvalid, invalidLocales}: LocaleStatusOptions): LocaleStatus {
  if (invalidLocales?.includes(locale)) return 'invalid';
  if (isLocaleFilled(locale, values)) return 'filled';
  if (!isRequired) return 'empty';
  return isInvalid ? 'invalid' : 'required';
}

const names = new Map<string, Intl.DisplayNames | null>();
/**
 * A language's name, said in `inLocale` (the interface's language): `localeName('nl-BE')` is "Dutch (Belgium)". The
 * code itself when the browser doesn't know it.
 */
export function localeName(locale: string, inLocale = 'en'): string {
  if (!names.has(inLocale)) {
    try {
      names.set(inLocale, new Intl.DisplayNames([inLocale], {type: 'language', languageDisplay: 'standard'}));
    } catch {
      names.set(inLocale, null);
    }
  }
  try {
    return names.get(inLocale)?.of(locale) ?? locale;
  } catch {
    return locale;
  }
}

// React Aria's own rule (its isRTL), for a locale that isn't the interface's: the script decides, else the language.
const RTL_SCRIPTS = new Set(['arab', 'syrc', 'samr', 'mand', 'thaa', 'mend', 'nkoo', 'adlm', 'rohg', 'hebr']);
const RTL_LANGUAGES = new Set(['ae', 'ar', 'arc', 'bcc', 'bqi', 'ckb', 'dv', 'fa', 'glk', 'he', 'ku', 'mzn', 'nqo',
  'pnb', 'ps', 'sd', 'ug', 'ur', 'yi']);

/** Which way a locale's text runs: `rtl` for Arabic, Hebrew, Persian, Urdu and the like, else `ltr`. */
export function localeDirection(locale: string): 'ltr' | 'rtl' {
  try {
    const full = new Intl.Locale(locale).maximize() as Intl.Locale & {
      getTextInfo?: () => {direction?: string};
      textInfo?: {direction?: string};
    };
    const info = typeof full.getTextInfo === 'function' ? full.getTextInfo() : full.textInfo;
    if (info?.direction) return info.direction === 'rtl' ? 'rtl' : 'ltr';
    if (full.script) return RTL_SCRIPTS.has(full.script.toLowerCase()) ? 'rtl' : 'ltr';
  } catch {
    // Not a well-formed tag: fall back to its first part.
  }
  return RTL_LANGUAGES.has(locale.split(/[-_]/)[0].toLowerCase()) ? 'rtl' : 'ltr';
}

const STATUS_WORDS: Record<LocaleStatus, string> = {
  filled: 'filled',
  empty: 'empty',
  required: 'empty, required',
  invalid: 'has an error'
};

/** The shown locale, controlled or not, falling back to the first locale when it isn't one of them. */
export function useShownLocale(
  locales: readonly string[],
  locale: string | undefined,
  defaultLocale: string | undefined,
  onLocaleChange: ((locale: string) => void) | undefined
): [string, (locale: string) => void] {
  const [inner, setInner] = useState(defaultLocale ?? locales[0] ?? '');
  const current = locale ?? inner;
  const shown = locales.includes(current) ? current : (locales[0] ?? current);
  const set = (next: string) => {
    if (next === shown) return;
    if (locale === undefined) setInner(next);
    onLocaleChange?.(next);
  };
  return [shown, set];
}

export interface LocaleSwitcherProps {
  /** The platform's languages, as locale codes in its order (`['en', 'nl-BE', 'fr-BE']`). Fewer than two: nothing shows. */
  locales: readonly string[];
  /** The language shown (controlled). */
  locale?: string;
  /** The language shown first. @default the first of `locales` */
  defaultLocale?: string;
  onLocaleChange?: (locale: string) => void;
  /**
   * The text the marks read: a Multiloc, or several sharing this switcher (a language counts as filled when every one
   * has it). Without it, the switcher shows no marks.
   */
  values?: MultilocValues;
  /** Every language needs text: an empty one is marked as required. */
  isRequired?: boolean;
  /** Marks the required languages still empty as errors (after a save was tried). */
  isInvalid?: boolean;
  /** Languages with an error of their own, marked as errors whatever their text. */
  invalidLocales?: readonly string[];
  /**
   * `buttons`: a row of language buttons, a code each, above a field (the platform's switcher). `menu`: one compact
   * button (language icon, code, chevron) that opens the list, for a Title field's end.
   *
   * @default 'buttons'
   */
  kind?: 'buttons' | 'menu';
  isDisabled?: boolean;
  /** Names the switcher for screen readers. @default 'Language' */
  'aria-label'?: string;
  'aria-labelledby'?: string;
  /** Places the switcher (margin, alignment); never paints it. */
  className?: string;
  /** Places the switcher (margin, alignment); never paints it. */
  style?: CSSProperties;
}

/**
 * A language switcher: the row of language codes above a multilingual field (EN · NL-BE · FR-BE) that picks which
 * language the field shows, each with a mark for whether that language has text yet. `kind="menu"` is the compact
 * version for a Title field's end. Each button reads its language's name and mark to screen readers. Not in Figma.
 */
export function LocaleSwitcher({
  locales,
  locale,
  defaultLocale,
  onLocaleChange,
  values,
  isRequired,
  isInvalid,
  invalidLocales,
  kind = 'buttons',
  isDisabled,
  'aria-label': ariaLabel = 'Language',
  'aria-labelledby': ariaLabelledby,
  className,
  style
}: LocaleSwitcherProps) {
  const {locale: uiLocale} = useLocale();
  const [shown, setShown] = useShownLocale(locales, locale, defaultLocale, onLocaleChange);
  if (locales.length < 2) return null;

  const hasMarks = values !== undefined;
  const status = (code: string) => localeStatus(code, {values, isRequired, isInvalid, invalidLocales});
  const mark = (code: string) =>
    hasMarks ? <span className="gv-locale-mark" data-status={status(code)} aria-hidden="true" /> : null;
  const words = (code: string) => `${localeName(code, uiLocale)}${hasMarks ? `, ${STATUS_WORDS[status(code)]}` : ''}`;

  if (kind === 'menu') {
    const filled = hasMarks ? locales.filter(code => isLocaleFilled(code, values)).length : locales.length;
    const showCount = hasMarks && filled < locales.length;
    return (
      <AriaSelect
        aria-label={ariaLabel}
        aria-labelledby={ariaLabelledby}
        value={shown}
        onChange={key => key != null && setShown(String(key))}
        isDisabled={isDisabled}
        className={clsx('gv-locale-switcher', className)}
        style={style}
        data-kind="menu"
        data-invalid={(hasMarks && locales.some(code => status(code) === 'invalid')) || undefined}>
        <Button className="gv-locale-switcher__trigger">
          <Languages className="gv-locale-switcher__icon" aria-hidden="true" />
          <SelectValue className="gv-locale-switcher__value">
            {/* What shows ("EN 1/3") comes first in the name, then the words for it. */}
            {() => (
              <>
                {shown.toUpperCase()}
                {showCount && <span className="gv-locale-switcher__count">{filled}/{locales.length}</span>}
                <VisuallyHidden>
                  , {localeName(shown, uiLocale)}
                  {showCount && `, ${filled} of ${locales.length} languages filled`}
                </VisuallyHidden>
              </>
            )}
          </SelectValue>
          <ChevronDown className="gv-locale-switcher__chevron" aria-hidden="true" />
        </Button>
        <Popover showArrow={false} placement="bottom end" className="gv-locale-switcher__popover">
          <DropdownListBox>
            {locales.map(code => (
              <DropdownItem
                key={code}
                id={code}
                textValue={localeName(code, uiLocale)}
                icon={mark(code)}
                description={hasMarks ? <VisuallyHidden>{STATUS_WORDS[status(code)]}</VisuallyHidden> : undefined}>
                {localeName(code, uiLocale)}
              </DropdownItem>
            ))}
          </DropdownListBox>
        </Popover>
      </AriaSelect>
    );
  }

  return (
    <RadioGroup
      aria-label={ariaLabelledby ? undefined : ariaLabel}
      aria-labelledby={ariaLabelledby}
      orientation="horizontal"
      value={shown}
      onChange={setShown}
      isDisabled={isDisabled}
      className={clsx('gv-locale-switcher', className)}
      style={style}
      data-kind="buttons">
      {locales.map(code => (
        <Radio key={code} value={code} className="gv-locale-switcher__item">
          {mark(code)}
          <span className="gv-locale-switcher__code">{code.toUpperCase()}</span>
          <VisuallyHidden>, {words(code)}</VisuallyHidden>
        </Radio>
      ))}
    </RadioGroup>
  );
}
