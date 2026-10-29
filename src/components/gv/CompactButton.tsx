'use client';
import {Button as RACButton, type ButtonProps as RACButtonProps} from 'react-aria-components/Button';
import './CompactButton.css';

export interface CompactButtonProps extends Omit<RACButtonProps, 'children'> {
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
  const {variant, icon, children, ...rest} = props;
  return (
    <RACButton {...rest} className="gv-compact-button" data-variant={variant || 'secondary'}>
      {icon}
      <span className="gv-compact-button__label">{children}</span>
    </RACButton>
  );
}
