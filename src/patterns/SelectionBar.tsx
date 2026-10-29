'use client';
import type {ReactElement, ReactNode} from 'react';
import {X} from 'lucide-react';
import {MenuTrigger} from 'react-aria-components/Menu';
import {Toolbar} from 'react-aria-components/Toolbar';
import {Button} from '../components/Button';
import {Popover} from '../components/Popover';
import {IconButton} from '../components/gv/IconButton';
import './SelectionBar.css';

export interface SelectionAction {
  id: string;
  label: string;
  /** A 16px Lucide icon, `aria-hidden`. */
  icon: ReactNode;
  /** A system `Menu` that the action opens (e.g. the statuses to pick from). Without it, the action calls `onAction`. */
  menu?: ReactElement;
}

export interface SelectionBarProps {
  /** How many items are selected. At 0 the bar gives way to `children`. */
  count: number;
  actions: SelectionAction[];
  /** Called for actions without a menu. */
  onAction?: (id: string) => void;
  /** Clears the selection (the ×). */
  onClear: () => void;
  /** What shows while nothing is selected, e.g. the list's count heading. */
  children?: ReactNode;
  /** @default 'Selection actions' */
  'aria-label'?: string;
}

/**
 * The batch-action bar (the prototype's Manage table, after Linear): while items are selected it takes the place of
 * the list's count, reading "1 selected" followed by one secondary button per action (Status, Assign, Tags, Copy to
 * phase, Official update) and a × that clears the selection. Actions open their own menu or call `onAction`. With
 * nothing selected it shows `children` instead, so the tools beside it never move. A React Aria Toolbar: Tab
 * enters it once and the arrows move between actions. Not in Figma yet.
 */
export function SelectionBar({count, actions, onAction, onClear, children, 'aria-label': label = 'Selection actions'}: SelectionBarProps) {
  if (count === 0) return <>{children}</>;
  return (
    <Toolbar aria-label={label} className="gv-selection-bar">
      <span className="gv-selection-bar__count" role="status">{count} selected</span>
      {actions.map(a => a.menu ? (
        <MenuTrigger key={a.id}>
          <Button variant="secondary" size={32}>{a.icon}{a.label}</Button>
          <Popover placement="bottom start" hideArrow>{a.menu}</Popover>
        </MenuTrigger>
      ) : (
        <Button key={a.id} variant="secondary" size={32} onPress={() => onAction?.(a.id)}>{a.icon}{a.label}</Button>
      ))}
      <IconButton aria-label="Clear selection" onPress={onClear}><X aria-hidden size={16} /></IconButton>
    </Toolbar>
  );
}
