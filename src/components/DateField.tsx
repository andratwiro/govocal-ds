'use client';
import {
  DateField as AriaDateField,
  type DateFieldProps as AriaDateFieldProps,
  DateInput as AriaDateInput,
  type DateInputProps,
  DateSegment as AriaDateSegment,
  type DateSegmentProps,
  type DateValue,
  type ValidationResult
} from 'react-aria-components/DateField';
import {Label, FieldError, Description} from './Form';
import './DateField.css';
import {keepClass, ownClass} from './className';

export interface DateFieldProps<T extends DateValue> extends AriaDateFieldProps<T> {
  label?: string;
  description?: string;
  errorMessage?: string | ((validation: ValidationResult) => string);
}

export function DateField<T extends DateValue>({
  label,
  description,
  errorMessage,
  ...props
}: DateFieldProps<T>) {
  return (
    <AriaDateField {...props} className={keepClass(props.className)}>
      <Label>{label}</Label>
      <DateInput>{segment => <DateSegment segment={segment} />}</DateInput>
      {description && <Description>{description}</Description>}
      <FieldError>{errorMessage}</FieldError>
    </AriaDateField>
  );
}

export function DateSegment(props: DateSegmentProps) {
  return <AriaDateSegment {...props} className={keepClass(props.className)} />;
}

export function DateInput(props: DateInputProps) {
  // React Aria draws DateInput through its Group, which would hand a function className Group's default
  // (react-aria-Group): the input's own class is named here.
  return <AriaDateInput {...props} className={ownClass(['react-aria-DateInput', 'inset'], props.className)} />;
}
