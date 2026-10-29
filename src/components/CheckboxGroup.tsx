'use client';
import {
  CheckboxGroup as AriaCheckboxGroup,
  type CheckboxGroupProps as AriaCheckboxGroupProps,
  type ValidationResult
} from 'react-aria-components/CheckboxGroup';
import {Label, FieldError, Description} from './Form';
import './CheckboxGroup.css';
import {keepClass} from './className';

export interface CheckboxGroupProps extends Omit<AriaCheckboxGroupProps, 'children'> {
  children?: React.ReactNode;
  label?: string;
  description?: string;
  errorMessage?: string | ((validation: ValidationResult) => string);
  orientation?: 'horizontal' | 'vertical';
}

/**
 * Pick any number of a few options, all in view. A label, a `Checkbox` per option (each with a `value`) in a column
 * or a row (`orientation`), an optional description and an error. React Aria's CheckboxGroup (`value` /
 * `defaultValue` / `onChange` hold the ticked values). `className` and `style` place it; they never paint it.
 */
export function CheckboxGroup({
  label,
  description,
  errorMessage,
  children,
  orientation = 'vertical',
  ...props
}: CheckboxGroupProps) {
  return (
    <AriaCheckboxGroup {...props} className={keepClass(props.className)} data-orientation={orientation}>
      {label && <Label>{label}</Label>}
      <div className="checkbox-items">{children}</div>
      {description && <Description>{description}</Description>}
      <FieldError>{errorMessage}</FieldError>
    </AriaCheckboxGroup>
  );
}
