'use client';
import type {ReactNode} from 'react';
import {
  Input,
  TextField as AriaTextField,
  type TextFieldProps as AriaTextFieldProps,
  type ValidationResult
} from 'react-aria-components/TextField';
import {FieldError} from '../Form';
import {RequiredMarker, type RequiredMarkerLabels} from './RequiredMarker';
import clsx from 'clsx';
import type {PlacementProps} from '../className';
import {localeDirection} from './LocaleSwitcher';
import {mergeLabels} from '../labels';
import './TitleField.css';

/** The words Title field says itself (docs/API.md rule 11), with the Required marker's, which it hands on. */
export interface TitleFieldLabels extends RequiredMarkerLabels {
  /** The placeholder when no `placeholder` is given. */
  placeholder: string;
}

/** Title field's English words; a page passes its own over them with `labels`. */
export const titleFieldLabels: TitleFieldLabels = {placeholder: 'Add a title', required: 'Required'};

export interface TitleFieldProps extends Omit<AriaTextFieldProps, 'className' | 'style'>, PlacementProps {
  /** This field's hint. @default `labels.placeholder` ("Add a title") */
  placeholder?: string;
  /** Shows the Required dot + label inside the field, on its right (Figma: Title field always carries one). */
  isRequired?: boolean;
  /** The message shown when the field is invalid: text, or a function of React Aria's validation result. */
  errorMessage?: string | ((validation: ValidationResult) => string);
  /**
   * The content-language button, in the end Figma keeps clear for it: a `<LocaleSwitcher kind="menu" />`. The field
   * then edits the language that button shows: pass that language's text as `value` and its code as `lang`. One
   * switcher can drive the description under the title too (the story "Multilingual").
   */
  localeSwitcher?: ReactNode;
  /** The text's language (a locale code): the input reads in that language and runs its way (right to left for Arabic). */
  lang?: string;
  /** Its own words (the default placeholder, Required), over `titleFieldLabels`. */
  labels?: Partial<TitleFieldLabels>;
}

/**
 * Title field (Figma node 4:123): the big project/page name input at the top of an editor.
 * A plain React Aria TextField — no visible <Label>, the placeholder carries the hint. The Required
 * marker sits inside the input's right end, as in Figma and the prototype (`.pj-titlereq`); it is
 * hidden from screen readers, which hear the input's own aria-required. With `localeSwitcher`, the
 * content-language button follows the marker in that end.
 */
export function TitleField({placeholder, isRequired, errorMessage, localeSwitcher, lang, labels, className, style, ...props}: TitleFieldProps) {
  const l = mergeLabels(titleFieldLabels, labels);
  const required = isRequired && (
    <span className="gv-title-field-required" aria-hidden="true">
      <RequiredMarker placement="field" labels={l} />
    </span>
  );
  return (
    <div className={clsx('gv-title-field-wrap', className)} style={style} data-required={isRequired || undefined} data-locale-switcher={localeSwitcher ? true : undefined}>
      <AriaTextField {...props} isRequired={isRequired} className="gv-title-field">
        <Input className="react-aria-Input gv-base-input" placeholder={placeholder ?? l.placeholder} lang={lang} dir={lang ? localeDirection(lang) : undefined} />
        <FieldError>{errorMessage}</FieldError>
      </AriaTextField>
      {localeSwitcher ? (
        <span className="gv-title-field-end">
          {required}
          {localeSwitcher}
        </span>
      ) : (
        required
      )}
    </div>
  );
}
