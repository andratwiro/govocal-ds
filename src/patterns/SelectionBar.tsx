'use client';
import type {CSSProperties, ReactElement, ReactNode} from 'react';
import {clsx} from 'clsx';
import {X} from 'lucide-react';
import {MenuTrigger} from 'react-aria-components/Menu';
import {Toolbar} from 'react-aria-components/Toolbar';
import {Button} from '../components/Button';
import {Popover} from '../components/Popover';
import {IconButton} from '../components/gv/IconButton';
import {useNumberFormatter} from '../components/format';
import {mergeLabels, type CountLabel} from '../components/labels';
import './SelectionBar.css';

/** The words Selection bar says itself (docs/API.md rule 11). */
export interface SelectionBarLabels {
  /** The bar's name, when no `aria-label` is given. */
  actions: string;
  /** "2 selected". */
  selected: CountLabel;
  /** The ×'s name. */
  clear: string;
}

/** Selection bar's English words; a page passes its own over them with `labels`. */
export const selectionBarLabels: SelectionBarLabels = {
  actions: 'Selection actions',
  selected: (count, n) => `${n} selected`,
  clear: 'Clear selection'
};

/** One button of the bar: it opens its `menu`, or it is a plain button that calls its `onPress` and the bar's
 * `onAction`. */
export interface SelectionAction {
  /** Tells this button from the others; handed to the bar's `onAction`. */
  id: string;
  /** The button's words. */
  label: string;
  /** A 16px Lucide icon, `aria-hidden`, before the label. */
  icon?: ReactNode;
  /** A system `Menu` (or Option list) that the button opens: the statuses or groups to pick from. */
  menu?: ReactElement;
  /** Called when a button without a menu is pressed (an export, a confirmation before a delete), before the bar's
   * `onAction`. */
  onPress?: () => void;
}

export interface SelectionBarProps {
  /** How many items are selected. At 0 the bar gives way to `children`. */
  count: number;
  /** The bar's buttons, in order: menu buttons and plain buttons. */
  items: SelectionAction[];
  /** Called with the id of a button without a menu, after its own `onPress`. */
  onAction?: (id: string) => void;
  /** Clears the selection (the ×). */
  onClear: () => void;
  /** What shows while nothing is selected, e.g. the list's count heading or an "Export all" button. */
  children?: ReactNode;
  /** @default `labels.actions` ("Selection actions") */
  'aria-label'?: string;
  /** Its own words ("2 selected", the ×'s name), over `selectionBarLabels`. */
  labels?: Partial<SelectionBarLabels>;
  /** Places the bar while it shows (nothing is drawn around `children`); never paints it. */
  className?: string;
  /** Places the bar, as `className` does. */
  style?: CSSProperties;
}

/**
 * The bulk-action bar of a list with checkboxes (the prototype's `.pj-inbar`): while rows are selected it reads
 * "2 selected", then one secondary button per item and a × that clears the selection. An item opens its own menu, or
 * calls its `onPress` and the bar's `onAction`. With nothing selected it shows `children` instead (the list's count heading, a quiet
 * "Export all"), so the tools beside it never move. A React Aria Toolbar: Tab enters it once and the arrows move
 * between actions. On the phase Manage tab, the Input manager and Users. Not in Figma yet.
 */
export function SelectionBar({
  count, items, onAction, onClear, children, 'aria-label': label, labels, className, style
}: SelectionBarProps) {
  const l = mergeLabels(selectionBarLabels, labels);
  const number = useNumberFormatter();
  if (count === 0) return <>{children}</>;
  return (
    <Toolbar aria-label={label ?? l.actions} className={clsx('gv-selection-bar', className)} style={style}>
      <span className="gv-selection-bar__count" role="status">{l.selected(count, number.format(count))}</span>
      {items.map(a => a.menu ? (
        <MenuTrigger key={a.id}>
          <Button variant="secondary" size={32}>{a.icon}{a.label}</Button>
          <Popover placement="bottom start" showArrow={false}>{a.menu}</Popover>
        </MenuTrigger>
      ) : (
        <Button key={a.id} variant="secondary" size={32} onPress={() => { a.onPress?.(); onAction?.(a.id); }}>
          {a.icon}{a.label}
        </Button>
      ))}
      <IconButton aria-label={l.clear} onPress={onClear}><X aria-hidden size={16} /></IconButton>
    </Toolbar>
  );
}
