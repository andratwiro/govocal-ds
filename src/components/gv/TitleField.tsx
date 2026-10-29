'use client';
import type {ReactNode} from 'react';
import {
  Input,
  TextField as AriaTextField,
  type TextFieldProps as AriaTextFieldProps,
  type ValidationResult
} from 'react-aria-components/TextField';
import {FieldError} from '../Form';
import {RequiredMarker} from './RequiredMarker';
import clsx from 'clsx';
import type {PlacementProps} from '../className';
import {localeDirection} from './LocaleSwitcher';
import './TitleField.css';

export interface TitleFieldProps extends Omit<AriaTextFieldProps, 'className' | 'style'>, PlacementProps {
  placeholder?: string;
  /** Shows the Required dot + label inside the field, on its right (Figma: Title field always carries one). */
  isRequired?: boolean;
  errorMessage?: string | ((validation: ValidationResult) => string);
  /**
   * The content-language button, in the end Figma keeps clear for it: a `<LocaleSwitcher kind="menu" />`. The field
   * then edits the language that button shows: pass that language's text as `value` and its code as `lang`. One
   * switcher can drive the description under the title too (the story "Multilingual").
   */
  localeSwitcher?: ReactNode;
  /** The text's language (a locale code): the input reads in that language and runs its way (right to left for Arabic). */
  lang?: string;
}

/**
 * Title field (Figma node 4:123): the big project/page name input at the top of an editor.
 * A plain React Aria TextField — no visible <Label>, the placeholder carries the hint. The Required
 * marker sits inside the input's right end, as in Figma and the prototype (`.pj-titlereq`); it is
 * hidden from screen readers, which hear the input's own aria-required. With `localeSwitcher`, the
 * content-language button follows the marker in that end.
 */
export function TitleField({placeholder = 'Add a title', isRequired, errorMessage, localeSwitcher, lang, className, style, ...props}: TitleFieldProps) {
  const required = isRequired && (
    <span className="gv-title-field-required" aria-hidden="true">
      <RequiredMarker placement="field" />
    </span>
  );
  return (
    <div className={clsx('gv-title-field-wrap', className)} style={style} data-required={isRequired || undefined} data-locale-switcher={localeSwitcher ? true : undefined}>
      <AriaTextField {...props} isRequired={isRequired} className="gv-title-field">
        <Input className="react-aria-Input gv-base-input" placeholder={placeholder} lang={lang} dir={lang ? localeDirection(lang) : undefined} />
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
