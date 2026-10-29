'use client';
import {
  Group,
  Input,
  NumberField as AriaNumberField,
  type NumberFieldProps as AriaNumberFieldProps,
  type ValidationResult
} from 'react-aria-components/NumberField';
import {Button} from './Button';
import {Plus, Minus} from 'lucide-react';
import {Label, FieldError, Description} from './Form';
import type {ReactNode} from 'react';
import './NumberField.css';

export interface NumberFieldProps extends AriaNumberFieldProps {
  label?: string;
  description?: string;
  errorMessage?: string | ((validation: ValidationResult) => string);
  placeholder?: string;
  /** Puts the label beside the field instead of above it (Proposal requirements, Voting Min / Max). */
  labelPosition?: 'top' | 'side';
  /** Text inside the field, before the number, e.g. "€" (Voting's budget fields). */
  prefix?: ReactNode;
}

export function NumberField({
  label,
  description,
  errorMessage,
  labelPosition = 'top',
  prefix,
  ...props
}: NumberFieldProps) {
  return (
    <div className="gv-number-field-wrap" data-label-position={labelPosition}>
      <AriaNumberField {...props}>
        <Label>{label}</Label>
        <Group>
          <div className="react-aria-NumberField-field" data-has-prefix={prefix ? true : undefined}>
            {prefix && (
              <span className="react-aria-NumberField-prefix" aria-hidden="true">
                {prefix}
              </span>
            )}
            <Input className="react-aria-Input inset" />
          </div>
          <Button slot="decrement" variant="secondary">
            <Minus />
          </Button>
          <Button slot="increment" variant="secondary">
            <Plus />
          </Button>
        </Group>
        {description && <Description>{description}</Description>}
        <FieldError>{errorMessage}</FieldError>
      </AriaNumberField>
    </div>
  );
}
