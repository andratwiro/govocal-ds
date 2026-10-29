'use client';
import {
  TimeField as AriaTimeField,
  type TimeFieldProps as AriaTimeFieldProps,
  type TimeValue,
  type ValidationResult
} from 'react-aria-components/TimeField';
import {Label, FieldError, Description} from './Form';
import {DateInput, DateSegment} from './DateField';
import './TimeField.css';
import {keepClass} from './className';

export interface TimeFieldProps<T extends TimeValue> extends AriaTimeFieldProps<T> {
  label?: string;
  description?: string;
  errorMessage?: string | ((validation: ValidationResult) => string);
}

export function TimeField<T extends TimeValue>({
  label,
  description,
  errorMessage,
  ...props
}: TimeFieldProps<T>) {
  return (
    <AriaTimeField {...props} className={keepClass(props.className)}>
      <Label>{label}</Label>
      <DateInput>{segment => <DateSegment segment={segment} />}</DateInput>
      {description && <Description>{description}</Description>}
      <FieldError>{errorMessage}</FieldError>
    </AriaTimeField>
  );
}
