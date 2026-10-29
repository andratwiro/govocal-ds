'use client';
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
import './TitleField.css';

export interface TitleFieldProps extends Omit<AriaTextFieldProps, 'className' | 'style'>, PlacementProps {
  placeholder?: string;
  /** Shows the Required dot + label inside the field, on its right (Figma: Title field always carries one). */
  isRequired?: boolean;
  errorMessage?: string | ((validation: ValidationResult) => string);
}

/**
 * Title field (Figma node 4:123): the big project/page name input at the top of an editor.
 * A plain React Aria TextField — no visible <Label>, the placeholder carries the hint. The Required
 * marker sits inside the input's right end, as in Figma and the prototype (`.pj-titlereq`); it is
 * hidden from screen readers, which hear the input's own aria-required.
 */
export function TitleField({placeholder = 'Add a title', isRequired, errorMessage, className, style, ...props}: TitleFieldProps) {
  return (
    <div className={clsx('gv-title-field-wrap', className)} style={style} data-required={isRequired || undefined}>
      <AriaTextField {...props} isRequired={isRequired} className="gv-title-field">
        <Input className="react-aria-Input gv-base-input" placeholder={placeholder} />
        <FieldError>{errorMessage}</FieldError>
      </AriaTextField>
      {isRequired && (
        <span className="gv-title-field-required" aria-hidden="true">
          <RequiredMarker placement="field" />
        </span>
      )}
    </div>
  );
}
