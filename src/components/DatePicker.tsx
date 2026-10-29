'use client';
import {
  DatePicker as AriaDatePicker,
  type DatePickerProps as AriaDatePickerProps,
  type DateValue,
  Group,
  type ValidationResult
} from 'react-aria-components/DatePicker';
import {DateInput, DateSegment} from './DateField';
import {Label, FieldError, Description} from './Form';
import {FieldButton} from './Form';
import {Calendar} from './Calendar';
import {Popover} from './Popover';
import {Calendar as CalendarIcon} from 'lucide-react';
import './DatePicker.css';
import {keepClass} from './className';

export interface DatePickerProps<T extends DateValue> extends AriaDatePickerProps<T> {
  label?: string;
  description?: string;
  errorMessage?: string | ((validation: ValidationResult) => string);
}

/** A date field with a button that opens a Calendar; React Aria's DatePicker. For a start and an end, use Date range field. */
export function DatePicker<T extends DateValue>({
  label,
  description,
  errorMessage,
  ...props
}: DatePickerProps<T>) {
  return (
    <AriaDatePicker {...props} className={keepClass(props.className, 'gv-base-date-picker')}>
      <Label>{label}</Label>
      <Group className="react-aria-Group gv-base-group inset">
        <DateInput>{segment => <DateSegment segment={segment} />}</DateInput>
        <FieldButton>
          <CalendarIcon />
        </FieldButton>
      </Group>
      {description && <Description>{description}</Description>}
      <FieldError>{errorMessage}</FieldError>
      <Popover showArrow={false}>
        <Calendar />
      </Popover>
    </AriaDatePicker>
  );
}
