'use client';
import {Form as RACForm, type FormProps} from 'react-aria-components/Form';
import {type LabelProps, Label as RACLabel} from 'react-aria-components/Label';
import {type FieldErrorProps, FieldError as RACFieldError} from 'react-aria-components/FieldError';
import {type ButtonProps, Button} from 'react-aria-components/Button';
import {type TextProps, Text as AriaText} from 'react-aria-components/Text';
import './Form.css';
import clsx from 'clsx';
import {keepClass, ownClass} from './className';

export function Form(props: FormProps) {
  return <RACForm {...props} className={clsx('react-aria-Form', props.className)} />;
}

export function Label(props: LabelProps) {
  return <RACLabel {...props} className={clsx('react-aria-Label', props.className)} />;
}

export function FieldError(props: FieldErrorProps) {
  return <RACFieldError {...props} className={keepClass(props.className)} />;
}

export function Description(props: TextProps) {
  return <AriaText slot="description" {...props} className={clsx('field-description', props.className)} />;
}

export function FieldButton(props: ButtonProps) {
  return <Button {...props} className={ownClass('field-Button', props.className)} />;
}
export type {FormProps, LabelProps, FieldErrorProps};
