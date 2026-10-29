'use client';
import {Checkbox as StarterCheckbox} from '../Checkbox';
import type {CheckboxFieldProps, ValidationResult} from 'react-aria-components/Checkbox';
import type {ReactNode} from 'react';
import './Checkbox.css';

export interface CheckboxProps extends CheckboxFieldProps {
  children?: ReactNode;
  description?: string;
  errorMessage?: string | ((validation: ValidationResult) => string);
  /**
   * Figma's Checkbox as drawn: dimmed at rest, full strength once hovered, checked or
   * indeterminate. For a list header's select-all (the prototype's `.pj-inlist__lh-chk`).
   *
   * @default false
   */
  isQuiet?: boolean;
}

/** Checkbox: a 15x15 rounded box, token-fill when checked/indeterminate. Wraps the starter's Checkbox. */
export function Checkbox({children, description, errorMessage, isQuiet, ...props}: CheckboxProps) {
  return (
    <StarterCheckbox
      {...props}
      className={isQuiet ? 'gv-checkbox gv-checkbox--quiet' : 'gv-checkbox'}
      description={description}
      errorMessage={errorMessage}>
      {children}
    </StarterCheckbox>
  );
}
