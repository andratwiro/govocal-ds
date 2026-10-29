'use client';
import {Separator as RACSeparator, type SeparatorProps} from 'react-aria-components/Separator';
import clsx from 'clsx';
import type {PlacementProps} from '../className';
import './Divider.css';

export interface DividerProps extends Omit<SeparatorProps, 'className' | 'style'>, PlacementProps {}

/** Divider (Figma node 5:303): a 1px hairline, horizontal or vertical. Wraps React Aria's Separator. */
export function Divider({className, style, ...props}: DividerProps) {
  return <RACSeparator {...props} className={clsx('gv-divider', className)} style={style} />;
}
