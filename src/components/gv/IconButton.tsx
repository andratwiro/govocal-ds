'use client';
import {Button as RACButton, type ButtonProps as RACButtonProps} from 'react-aria-components/Button';
import clsx from 'clsx';
import type {PlacementProps} from '../className';
import './IconButton.css';

export interface IconButtonProps extends Omit<RACButtonProps, 'children' | 'className' | 'style'>, PlacementProps {
  /**
   * The button's chrome (Figma "Style").
   *
   * @default 'ghost'
   */
  variant?: 'ghost' | 'bordered';
  /**
   * The icon's colour weight: secondary grey or near-black (Figma's "Tone"; here `tone` is only ever a colour
   * intent). `bordered` only has a Figma variant for `strong`; `default` is supported anyway since nothing in the
   * token set stops it.
   *
   * @default 'default'
   */
  emphasis?: 'default' | 'strong';
  /**
   * The button's size. Figma only specs 28; 24 is the prototype's
   * `.btn-icon--sm` (used in dense toolbars), carried over for parity.
   *
   * @default 28
   */
  size?: 24 | 28;
  /** The icon, e.g. `<Settings aria-hidden size={16} />`. */
  children: React.ReactNode;
  /** Required: an icon-only button has no visible label. */
  'aria-label': string;
}

export function IconButton(props: IconButtonProps) {
  const {variant, emphasis, size, children, className, style, ...rest} = props;
  return (
    <RACButton
      {...rest}
      className={clsx('gv-icon-button', className)}
      style={style}
      data-variant={variant || 'ghost'}
      data-emphasis={emphasis || 'default'}
      data-size={size || 28}>
      {children}
    </RACButton>
  );
}
