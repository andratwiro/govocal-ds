'use client';
import {
  Button as RACButton,
  type ButtonProps as RACButtonProps
} from 'react-aria-components/Button';
import {composeRenderProps} from 'react-aria-components/composeRenderProps';
import {ChevronDown} from 'lucide-react';
import {ProgressCircle} from './ProgressCircle';
import './Button.css';

interface ButtonProps extends RACButtonProps {
  /**
   * The visual style of the button (Vanilla CSS implementation specific).
   *
   * @default 'primary'
   */
  variant?: 'primary' | 'secondary' | 'quiet';
  /**
   * The button's height, per Tali's Button spec.
   *
   * @default 36
   */
  size?: 32 | 36;
  /**
   * Appends a menu chevron, for buttons that open a menu.
   *
   * @default false
   */
  hasMenu?: boolean;
}

export function Button(props: ButtonProps) {
  const {variant, size, hasMenu, ...rest} = props;
  return (
    <RACButton
      {...rest}
      className="react-aria-Button"
      data-variant={variant || 'primary'}
      data-size={size || 36}>
      {composeRenderProps(props.children, (children, {isPending}) => (
        <>
          {!isPending && children}
          {!isPending && hasMenu && <ChevronDown aria-hidden size={16} />}
          {isPending && <ProgressCircle aria-label="Saving..." isIndeterminate />}
        </>
      ))}
    </RACButton>
  );
}
