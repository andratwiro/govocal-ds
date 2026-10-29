'use client';
import {Separator as RACSeparator, type SeparatorProps} from 'react-aria-components/Separator';
import './Divider.css';

/** Tali's Divider (Figma node 5:303): a 1px hairline, horizontal or vertical. Wraps React Aria's Separator. */
export function Divider(props: SeparatorProps) {
  return <RACSeparator {...props} className="gv-divider" />;
}
