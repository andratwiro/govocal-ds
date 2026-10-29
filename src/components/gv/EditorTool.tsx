'use client';
import {ToggleButton, type ToggleButtonProps} from 'react-aria-components';
import type {ReactNode} from 'react';
import './EditorTool.css';

export interface EditorToolProps extends Omit<ToggleButtonProps, 'children'> {
  /** The tool's icon at 14 with a 1.75 stroke, e.g. `<Bold aria-hidden size={14} strokeWidth={1.75} />`. */
  children: ReactNode;
  /** Accessible name, e.g. "Bold". */
  'aria-label': string;
}

export function EditorTool(props: EditorToolProps) {
  return (
    <ToggleButton {...props} className="gv-editor-tool">
      {props.children}
    </ToggleButton>
  );
}
