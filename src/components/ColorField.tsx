'use client';
import {
  ColorField as AriaColorField,
  type ColorFieldProps as AriaColorFieldProps,
  Input,
  type ValidationResult
} from 'react-aria-components/ColorField';
import {Label, FieldError, Description} from './Form';
import './ColorField.css';
import {keepClass} from './className';

export interface ColorFieldProps extends AriaColorFieldProps {
  label?: string;
  description?: string;
  errorMessage?: string | ((validation: ValidationResult) => string);
  placeholder?: string;
}

/** A text field to type a colour as hex; React Aria's ColorField. Use it for a colour setting, with ColorSwatch to show the result. */
export function ColorField({
  label,
  description,
  errorMessage,
  placeholder,
  ...props
}: ColorFieldProps) {
  return (
    <AriaColorField {...props} className={keepClass(props.className, 'gv-base-color-field')}>
      {label && <Label>{label}</Label>}
      <Input className="react-aria-Input gv-base-input inset" placeholder={placeholder} />
      {description && <Description>{description}</Description>}
      <FieldError>{errorMessage}</FieldError>
    </AriaColorField>
  );
}
