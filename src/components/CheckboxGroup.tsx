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
  /** The options: a `Checkbox` per option, each with a `value`. */
  children?: React.ReactNode;
  /** The group's name, shown above the options. */
  label?: string;
  /** A grey line under the options. */
  description?: string;
  /** The error shown under it when it is invalid: text, or a function of React Aria's validation result. */
  errorMessage?: string | ((validation: ValidationResult) => string);
  /** Whether the options stack (`vertical`) or sit in a row (`horizontal`). @default 'vertical' */
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
    <AriaCheckboxGroup {...props} className={keepClass(props.className, 'gv-base-checkbox-group')} data-orientation={orientation}>
      {label && <Label>{label}</Label>}
      <div className="checkbox-items">{children}</div>
      {description && <Description>{description}</Description>}
      <FieldError>{errorMessage}</FieldError>
    </AriaCheckboxGroup>
  );
}
