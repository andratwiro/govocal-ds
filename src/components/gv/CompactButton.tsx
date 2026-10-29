'use client';
import {Button as RACButton, type ButtonProps as RACButtonProps} from 'react-aria-components/Button';
import clsx from 'clsx';
import type {PlacementProps} from '../className';
import './CompactButton.css';

export interface CompactButtonProps extends Omit<RACButtonProps, 'children' | 'className' | 'style'>, PlacementProps {
  /**
   * The visual style (Figma "Style": Secondary/Primary). Figma's third
   * variant, "Primary · icon", is `variant="primary"` plus an `icon`, rather
   * than its own enum value, so the icon can be combined with either style.
   *
   * @default 'secondary'
   */
  variant?: 'secondary' | 'primary';
  /** A small leading icon, e.g. `<Plus aria-hidden size={16} />`. */
  icon?: React.ReactNode;
  children: React.ReactNode;
}

export function CompactButton(props: CompactButtonProps) {
  const {variant, icon, children, className, style, ...rest} = props;
  return (
    <RACButton {...rest} className={clsx('gv-compact-button', className)} style={style} data-variant={variant || 'secondary'}>
      {icon}
      <span className="gv-compact-button__label">{children}</span>
    </RACButton>
  );
}
