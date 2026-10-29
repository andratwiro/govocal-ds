'use client';
import {
  Input,
  TextField as AriaTextField,
  type TextFieldProps as AriaTextFieldProps,
  type ValidationResult
} from 'react-aria-components/TextField';
import {FieldError} from '../Form';
import {Required} from './Required';
import './TitleField.css';

export interface TitleFieldProps extends AriaTextFieldProps {
  placeholder?: string;
  /** Shows Tali's Required dot + label after the field (Figma: Title field always carries one). */
  isRequired?: boolean;
  errorMessage?: string | ((validation: ValidationResult) => string);
}

/**
 * Tali's Title field (Figma node 4:123): the big project/page name input at the top of an editor.
 * A plain React Aria TextField — no visible <Label>, the placeholder carries the hint.
 */
export function TitleField({placeholder = 'Add a title', isRequired, errorMessage, ...props}: TitleFieldProps) {
  return (
    <div className="gv-title-field-wrap">
      <AriaTextField {...props} isRequired={isRequired} className="gv-title-field">
        <Input placeholder={placeholder} />
        <FieldError>{errorMessage}</FieldError>
      </AriaTextField>
      {isRequired && <Required placement="field" />}
    </div>
  );
}
