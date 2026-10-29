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
  /** The button's words. */
  children: React.ReactNode;
}

/**
 * A small 32-tall button for an action inside a card, a panel section or a dashboard card's foot ("Explore", "Add",
 * "Import", "+ Add a report"): React Aria's Button in Figma's Button · compact. Secondary by default, primary for the
 * one action of its card; a page's own actions are a Button. `className` and `style` place it; they never paint it.
 */
export function CompactButton(props: CompactButtonProps) {
  const {variant, icon, children, className, style, ...rest} = props;
  return (
    <RACButton {...rest} className={clsx('gv-compact-button', className)} style={style} data-variant={variant || 'secondary'}>
      {icon}
      <span className="gv-compact-button__label">{children}</span>
    </RACButton>
  );
}
