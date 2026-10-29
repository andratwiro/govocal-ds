'use client';
import {
  RadioGroup as AriaRadioGroup,
  RadioField,
  RadioButton,
  type RadioGroupProps as AriaRadioGroupProps,
  type ValidationResult,
  type RadioFieldProps
} from 'react-aria-components/RadioGroup';
import {composeRenderProps} from 'react-aria-components/composeRenderProps';
import {Label, FieldError, Description} from './Form';
import './RadioGroup.css';
import './utilities.css';
import {keepClass} from './className';

export interface RadioGroupProps extends Omit<AriaRadioGroupProps, 'children'> {
  /** The options: a `Radio` (or a `ChoiceCard`) per option. */
  children?: React.ReactNode;
  /** The group's name, shown above the options. */
  label?: string;
  /** A grey line under the options. */
  description?: string;
  /** The error shown under it when it is invalid: text, or a function of React Aria's validation result. */
  errorMessage?: string | ((validation: ValidationResult) => string);
}

/**
 * Pick exactly one of a few options, all in view. A label, the options in a column (`orientation="horizontal"` for a
 * row), an optional description and an error; each option is a `Radio`, or a `ChoiceCard` for options drawn as
 * bordered tiles. React Aria's RadioGroup (`value` / `defaultValue` / `onChange`). `className` and
 * `style` place it; they never paint it.
 */
export function RadioGroup({
  label,
  description,
  errorMessage,
  children,
  ...props
}: RadioGroupProps) {
  return (
    <AriaRadioGroup {...props} className={keepClass(props.className, 'gv-base-radio-group')}>
      <Label>{label}</Label>
      <div className="radio-items">{children}</div>
      {description && <Description>{description}</Description>}
      <FieldError>{errorMessage}</FieldError>
    </AriaRadioGroup>
  );
}

export interface RadioProps extends RadioFieldProps {
  /** A grey line under this option's words. */
  description?: string;
}

/** One option of a Radio group: its dot and words, with an optional `description` line below. */
export function Radio(props: RadioProps) {
  return (
    <RadioField {...props} className={keepClass(props.className, 'gv-base-radio-field')}>
      <RadioButton className="react-aria-RadioButton gv-base-radio-button">
        {composeRenderProps(props.children, children => (
          <>
            <div className="indicator" />
            {children}
          </>
        ))}
      </RadioButton>
      {props.description && <Description>{props.description}</Description>}
    </RadioField>
  );
}
