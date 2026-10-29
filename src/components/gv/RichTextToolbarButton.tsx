'use client';
import {ToggleButton, type ToggleButtonProps} from 'react-aria-components';
import type {ReactNode} from 'react';
import clsx from 'clsx';
import type {PlacementProps} from '../className';
import './RichTextToolbarButton.css';

export interface RichTextToolbarButtonProps extends Omit<ToggleButtonProps, 'children' | 'className' | 'style'>, PlacementProps {
  /** The tool's icon at 14 with a 1.75 stroke, e.g. `<Bold aria-hidden size={14} strokeWidth={1.75} />`. */
  children: ReactNode;
  /** Accessible name, e.g. "Bold". */
  'aria-label': string;
}

export function RichTextToolbarButton({className, style, ...props}: RichTextToolbarButtonProps) {
  return (
    <ToggleButton {...props} className={clsx('gv-editor-tool', className)} style={style}>
      {props.children}
    </ToggleButton>
  );
}
