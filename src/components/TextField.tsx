'use client';
import {
  Input,
  TextField as AriaTextField,
  TextArea as AriaTextArea,
  type TextFieldProps as AriaTextFieldProps,
  type ValidationResult
} from 'react-aria-components/TextField';
import {Group} from 'react-aria-components/Group';
import {Label, FieldError, Description} from './Form';
import './TextField.css';
import {useState, type ReactNode} from 'react';
import type React from 'react';

export interface TextFieldProps<T = HTMLInputElement> extends AriaTextFieldProps {
  label?: string;
  description?: string;
  errorMessage?: string | ((validation: ValidationResult) => string);
  placeholder?: string;
  inputRef?: React.Ref<T>;
  /** Text before the input, inside the field (e.g. the slug's "internal.govocal.com/en/projects/"). */
  prefix?: ReactNode;
  /** Text after the input, inside the field. */
  suffix?: ReactNode;
  /** Shows a live "N/maxLength" count under the field, right-aligned. Needs `maxLength`. */
  showCounter?: boolean;
}

export function TextField({
  label,
  description,
  errorMessage,
  placeholder,
  inputRef,
  prefix,
  suffix,
  showCounter,
  maxLength,
  value,
  defaultValue,
  onChange,
  ...props
}: TextFieldProps) {
  const [length, setLength] = useState(() => (value ?? defaultValue ?? '').length);
  const hasDecoration = Boolean(prefix || suffix);
  const input = (
    <Input
      ref={inputRef}
      className={hasDecoration ? 'react-aria-Input' : 'react-aria-Input inset'}
      placeholder={placeholder}
      maxLength={maxLength}
    />
  );
  return (
    <AriaTextField
      {...props}
      value={value}
      defaultValue={defaultValue}
      maxLength={maxLength}
      onChange={next => {
        if (showCounter) setLength(next.length);
        onChange?.(next);
      }}>
      {label && <Label>{label}</Label>}
      {hasDecoration ? (
        <Group className="react-aria-Group inset gv-text-field-group">
          {prefix && <span className="gv-text-field-affix">{prefix}</span>}
          {input}
          {suffix && <span className="gv-text-field-affix">{suffix}</span>}
        </Group>
      ) : (
        input
      )}
      <div className="gv-text-field-foot">
        {description && <Description>{description}</Description>}
        <FieldError>{errorMessage}</FieldError>
        {showCounter && maxLength !== undefined && (
          <span className="gv-text-field-counter" aria-hidden="true">
            {length}/{maxLength}
          </span>
        )}
      </div>
    </AriaTextField>
  );
}

export function TextArea({
  label,
  description,
  errorMessage,
  placeholder,
  inputRef,
  ...props
}: TextFieldProps<HTMLTextAreaElement>) {
  return (
    <AriaTextField {...props}>
      <Label>{label}</Label>
      <AriaTextArea
        ref={inputRef}
        className="react-aria-TextArea inset"
        placeholder={placeholder}
      />
      {description && <Description>{description}</Description>}
      <FieldError>{errorMessage}</FieldError>
    </AriaTextField>
  );
}
