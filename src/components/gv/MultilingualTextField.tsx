'use client';
import {useEffect, useId, useRef, useState, type CSSProperties, type ReactNode} from 'react';
import {
  Input,
  TextArea,
  TextField as AriaTextField,
  type TextFieldProps as AriaTextFieldProps
} from 'react-aria-components/TextField';
import {useLocale} from 'react-aria-components';
import clsx from 'clsx';
import {Description, FieldError, Label} from '../Form';
import {RequiredMarker, type RequiredMarkerLabels} from './RequiredMarker';
import {mergeLabels} from '../labels';
import {useNumberFormatter} from '../format';
import {
  LocaleSwitcher,
  emptyLocales,
  localeDirection,
  localeName,
  localeStatus,
  useShownLocale,
  localeSwitcherLabels,
  type LocaleSwitcherLabels,
  type Multiloc
} from './LocaleSwitcher';
import '../TextField.css';
import './MultilingualTextField.css';

/** The words a multilingual field says itself (docs/API.md rule 11), with its switcher's and Required marker's. */
export interface MultilingualFieldLabels extends LocaleSwitcherLabels, RequiredMarkerLabels {
  /** The switcher's name, given the field's name. Without a name the switcher is `language`. */
  languageOf: (name: string) => string;
  /** The field's name when it has neither `label` nor `aria-label`. */
  text: string;
  /** The input's name: the field's name and the language shown ("Title, French"). */
  inputName: (name: string, language: string) => string;
  /** A required field left empty: the first language missing, then how many more (the count, then as written). */
  missing: (language: string, more: number, formatted: string) => string;
  /** A language's own error, shown while another language is on screen. */
  languageError: (language: string, message: string) => string;
  /** The live count under a text field, both numbers as the locale writes them. */
  counter: (length: string, max: string) => string;
}

/** A multilingual field's English words; a page passes its own over them with `labels`. */
export const multilingualFieldLabels: MultilingualFieldLabels = {
  ...localeSwitcherLabels,
  required: 'Required',
  languageOf: name => `Language of ${name}`,
  text: 'Text',
  inputName: (name, language) => `${name}, ${language}`,
  missing: (language, more, n) => `Add the text in ${language}${more ? ` and ${n} more ${more === 1 ? 'language' : 'languages'}` : ''}`,
  languageError: (language, message) => `${language}: ${message}`,
  counter: (length, max) => `${length}/${max}`
};

/** What every multilingual field takes: the platform's languages, the whole Multiloc, and the language shown. */
export interface MultilingualFieldProps {
  /** The platform's languages, as locale codes in its order (`['en', 'nl-BE', 'fr-BE']`). One language: no switcher. */
  locales: readonly string[];
  /** The text in every language (controlled): the platform's Multiloc, `{en: 'Parks', 'nl-BE': 'Parken'}`. */
  value?: Multiloc | null;
  /** The text in every language at first (uncontrolled). */
  defaultValue?: Multiloc;
  /** Called with the whole Multiloc on each change, and the language that changed. */
  onChange?: (value: Multiloc, locale: string) => void;
  /** The language shown (controlled). Several fields can share one: give them the same `locale`. */
  locale?: string;
  /** The language shown first. @default the first of `locales` */
  defaultLocale?: string;
  /** Fires when the language shown changes, with its locale code. */
  onLocaleChange?: (locale: string) => void;
  /** Show the language switcher over the field; turn it off when another switcher drives `locale`. @default true */
  showLocaleSwitcher?: boolean;
  /** The visible label, at the start of the row the switcher ends. Without it, give an `aria-label`. */
  label?: string;
  /** The field's name when there is no visible `label`. */
  'aria-label'?: string;
  /** Help under the field, in Small secondary. */
  description?: string;
  /**
   * The error under the field while it is invalid: one message, or a Multiloc of messages for the languages that have
   * one (`{fr: 'Add the French title'}`), which marks those languages and makes the field invalid. Without one, a
   * required field that is invalid says which languages still need text.
   */
  errorMessage?: string | Multiloc;
  /** Every language needs text: the empty ones are marked, and the Required marker follows the label. */
  isRequired?: boolean;
  /** Shows the field's errors (set it once a save was tried). It then shows the first language that needs work. */
  isInvalid?: boolean;
  /** The text can't be changed; the switcher still shows each language's text. */
  isDisabled?: boolean;
  /** Its own words (the switcher's, the errors it writes, Required), over `multilingualFieldLabels`. */
  labels?: Partial<MultilingualFieldLabels>;
  /** Places the field (width, margin, grid area); never paints it. */
  className?: string;
  /** Places the field (width, margin, grid area); never paints it. */
  style?: CSSProperties;
}

/**
 * The state every multilingual field shares: the Multiloc (controlled or not), the language shown, which languages are
 * marked, the error to show, and the label row (label, Required marker, switcher). Build a multilingual field from
 * any input with it: give the input `text`, `setText`, `inputLabel`, `lang` and `dir`.
 */
export function useMultilingualField(props: MultilingualFieldProps, inputId?: string) {
  const {locales, isRequired, showLocaleSwitcher = true, label} = props;
  const {locale: uiLocale} = useLocale();
  const l = mergeLabels(multilingualFieldLabels, props.labels);
  const number = useNumberFormatter();
  const [inner, setInner] = useState<Multiloc>(props.defaultValue ?? {});
  const value: Multiloc = props.value !== undefined ? (props.value ?? {}) : inner;
  const [locale, setLocale] = useShownLocale(locales, props.locale, props.defaultLocale, props.onLocaleChange);
  const text = value[locale] ?? '';
  const setText = (next: string) => {
    const nextValue = {...value, [locale]: next};
    if (props.value === undefined) setInner(nextValue);
    props.onChange?.(nextValue, locale);
  };

  const errors = props.errorMessage && typeof props.errorMessage === 'object' ? props.errorMessage : undefined;
  const invalidLocales = errors ? locales.filter(code => errors[code]?.trim()) : [];
  const isInvalid = !!props.isInvalid || invalidLocales.length > 0;
  const status = (code: string) => localeStatus(code, {values: value, isRequired, isInvalid, invalidLocales});

  // When the field turns invalid, or a language gains an error, show the first language that needs work (the
  // platform jumps to the first language with an error; the prototype's Save to the first one missing). Never while
  // the errors only shrink: that is someone fixing them, mid-word.
  const before = useRef<{isInvalid: boolean; invalidLocales: string[]}>({isInvalid: false, invalidLocales: []});
  useEffect(() => {
    const was = before.current;
    before.current = {isInvalid, invalidLocales};
    const added = invalidLocales.filter(code => !was.invalidLocales.includes(code));
    const target = isInvalid && !was.isInvalid ? locales.filter(code => status(code) === 'invalid') : added;
    if (target.length && !target.includes(locale)) setLocale(target[0]);
  });

  let error: string | undefined;
  const empty = isRequired ? emptyLocales(locales, value) : [];
  if (typeof props.errorMessage === 'string') error = props.errorMessage;
  else if (errors?.[locale]?.trim()) error = errors[locale];
  else if (invalidLocales.length) error = l.languageError(localeName(invalidLocales[0], uiLocale), errors![invalidLocales[0]]!);
  else if (isInvalid && empty.length) {
    const first = empty.includes(locale) ? locale : empty[0];
    const more = empty.length - 1;
    error = l.missing(localeName(first, uiLocale), more, number.format(more));
  }

  const isMultilingual = locales.length > 1;
  const name = props['aria-label'] ?? label;
  const inputLabel = isMultilingual ? l.inputName(name ?? l.text, localeName(locale, uiLocale)) : (name ?? localeName(locale, uiLocale));
  const switcher = isMultilingual && showLocaleSwitcher && (
    <LocaleSwitcher
      className="gv-multilingual-field__switcher"
      aria-label={name ? l.languageOf(name) : l.language}
      labels={l}
      locales={locales}
      locale={locale}
      onLocaleChange={setLocale}
      values={value}
      isRequired={isRequired}
      isInvalid={isInvalid}
      invalidLocales={invalidLocales}
    />
  );
  const head: ReactNode = (label || switcher) && (
    <div className="gv-multilingual-field__head">
      {label && (
        <Label className="react-aria-Label gv-base-label gv-multilingual-field__label" htmlFor={inputId}>
          {label}
          {isRequired && (
            <span className="gv-multilingual-field__required" aria-hidden="true">
              <RequiredMarker labels={l} />
            </span>
          )}
        </Label>
      )}
      {switcher}
    </div>
  );

  return {
    /** The language shown, and the way to show another. */
    locale,
    setLocale,
    /** The whole Multiloc, and the shown language's text with its setter. */
    value,
    text,
    setText,
    /** The input's accessible name: the label and the shown language ("Title, French"). */
    inputLabel,
    /** The shown language's code and direction, for the input's `lang` and `dir`. */
    lang: locale,
    dir: localeDirection(locale),
    isInvalid,
    /** The message to show under the field while it is invalid. */
    error,
    /** The label row: label, Required marker, switcher. */
    head,
    status,
    /** The field's words, the page's over the defaults. */
    labels: l
  };
}

export interface MultilingualTextFieldProps
  extends MultilingualFieldProps,
    Omit<
      AriaTextFieldProps,
      | 'value'
      | 'defaultValue'
      | 'onChange'
      | 'children'
      | 'className'
      | 'style'
      | 'name'
      | 'validate'
      | 'validationBehavior'
      | 'lang'
      | 'dir'
      | 'isRequired'
      | 'isInvalid'
      | 'isDisabled'
      | 'aria-label'
    > {
  /** A text area (several lines, the height grows by hand) instead of a one-line input. */
  isMultiline?: boolean;
  /** Hint text shown in an empty field. */
  placeholder?: string;
  /** A live "N/maxLength" count of the shown language under the field. Needs `maxLength`. */
  showCounter?: boolean;
}

/**
 * A multilingual text field: one text in each of the platform's languages, with the language switcher over the field
 * (a code per language, marked filled or empty), as the platform's title, name and description fields. `value` is the
 * platform's Multiloc. `isMultiline` makes it a text area. Not in Figma.
 */
export function MultilingualTextField({
  locales,
  value,
  defaultValue,
  onChange,
  locale,
  defaultLocale,
  onLocaleChange,
  showLocaleSwitcher,
  label,
  'aria-label': ariaLabel,
  description,
  errorMessage,
  isRequired,
  isInvalid,
  isDisabled,
  className,
  style,
  isMultiline,
  placeholder,
  showCounter,
  maxLength,
  id,
  labels,
  ...props
}: MultilingualTextFieldProps) {
  const ownId = useId();
  const inputId = id ?? ownId;
  const number = useNumberFormatter();
  const field = useMultilingualField(
    {locales, value, defaultValue, onChange, locale, defaultLocale, onLocaleChange, showLocaleSwitcher, label,
      'aria-label': ariaLabel, errorMessage, isRequired, isInvalid, labels},
    inputId
  );
  const inputProps = {placeholder, lang: field.lang, dir: field.dir};
  return (
    <div
      className={clsx('gv-multilingual-field', className)}
      style={style}
      data-disabled={isDisabled || undefined}
      data-invalid={field.isInvalid || undefined}>
      {field.head}
      <AriaTextField
        {...props}
        id={inputId}
        aria-label={field.inputLabel}
        value={field.text}
        onChange={field.setText}
        maxLength={maxLength}
        isRequired={isRequired}
        isInvalid={field.isInvalid}
        isDisabled={isDisabled}
        validationBehavior="aria"
        className="react-aria-TextField gv-base-text-field gv-multilingual-field__field">
        {isMultiline ? (
          <TextArea {...inputProps} className="react-aria-TextArea gv-base-text-area inset" />
        ) : (
          <Input {...inputProps} className="react-aria-Input gv-base-input inset" />
        )}
        <div className="gv-text-field-foot">
          {description && <Description>{description}</Description>}
          <FieldError>{field.error}</FieldError>
          {showCounter && maxLength !== undefined && (
            <span className="gv-text-field-counter" aria-hidden="true">
              {field.labels.counter(number.format(field.text.length), number.format(maxLength))}
            </span>
          )}
        </div>
      </AriaTextField>
    </div>
  );
}
