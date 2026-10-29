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
import type {CSSProperties, ReactNode} from 'react';
import clsx from 'clsx';
import './NumberField.css';

/** `className` and `style` place the field's outer box (grid area, width, margin); they never paint it. */
export interface NumberFieldProps extends Omit<AriaNumberFieldProps, 'className' | 'style'> {
  className?: string;
  style?: CSSProperties;
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
  className,
  style,
  ...props
}: NumberFieldProps) {
  return (
    <div className={clsx('gv-number-field-wrap', className)} style={style} data-label-position={labelPosition}>
      <AriaNumberField className="react-aria-NumberField gv-base-number-field" {...props}>
        <Label>{label}</Label>
        <Group className="react-aria-Group gv-base-group">
          <div className="react-aria-NumberField-field" data-has-prefix={prefix ? true : undefined}>
            {prefix && (
              <span className="react-aria-NumberField-prefix" aria-hidden="true">
                {prefix}
              </span>
            )}
            <Input className="react-aria-Input gv-base-input inset" />
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
