'use client';
import {
  SwitchField,
  SwitchButton,
  type SwitchFieldProps,
  type ValidationResult
} from 'react-aria-components/Switch';
import './Switch.css';
import {Description, FieldError} from './Form';
import type {ReactNode} from 'react';
import {keepClass} from './className';

export interface SwitchProps extends Omit<SwitchFieldProps, 'children'> {
  children: ReactNode;
  description?: string;
  errorMessage?: string | ((validation: ValidationResult) => string);
}

/**
 * Turn one setting on or off: a 36×20 track and knob with its label after it, an optional description line under the
 * label and an error. React Aria's Switch (`isSelected` / `defaultSelected` / `onChange`). Children are the label; with
 * no visible words, pass `aria-label`. `className` and `style` place it; they never paint it.
 */
export function Switch({children, description, errorMessage, ...props}: SwitchProps) {
  return (
    <SwitchField {...props} className={keepClass(props.className, 'gv-base-switch-field')}>
      <SwitchButton className="react-aria-SwitchButton gv-base-switch-button">
        {({isSelected, isDisabled}) => (
          <>
            <div className="track indicator">
              <div
                data-disabled={isDisabled || undefined}
                className={isSelected ? 'handle' : 'handle indicator'}
              />
            </div>
            {children}
          </>
        )}
      </SwitchButton>
      {description && <Description>{description}</Description>}
      <FieldError>{errorMessage}</FieldError>
    </SwitchField>
  );
}
