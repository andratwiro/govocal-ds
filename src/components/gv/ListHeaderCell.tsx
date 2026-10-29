'use client';
import {Button} from 'react-aria-components/Button';
import {Plus, ArrowDown} from 'lucide-react';
import clsx from 'clsx';
import type {PlacementProps} from '../className';
import {mergeLabels} from '../labels';
import './ListHeaderCell.css';

/** The words List header cell says itself (docs/API.md rule 11). */
export interface ListHeaderCellLabels {
  /** The add-column button's name, when no `aria-label` is given. */
  addColumn: string;
}

/** List header cell's English words; a page passes its own over them with `labels`. */
export const listHeaderCellLabels: ListHeaderCellLabels = {addColumn: 'Add column'};

export interface ListHeaderCellProps extends PlacementProps {
  /**
   * What the cell heads: a label column (text left), a number column (text right), or the trailing "Add column"
   * button (Figma's `Type`).
   *
   * @default 'label'
   */
  kind?: 'label' | 'number' | 'add-column';
  /**
   * A static, non-sortable column label (Figma `Label · square`): plain text, no hover affordance. Ignored for
   * `add-column`.
   *
   * @default false
   */
  isStatic?: boolean;
  /**
   * The column this cell heads is the one the list is currently sorted by (Figma `· sorted`): bold text + a down
   * arrow. Implies the cell is not static.
   *
   * @default false
   */
  isSorted?: boolean;
  /** The column label. Ignored for `add-column`. */
  children?: React.ReactNode;
  /** Sort / add-column press handler. */
  onPress?: () => void;
  'aria-label'?: string;
  /** Its own words, over `listHeaderCellLabels`. */
  labels?: Partial<ListHeaderCellLabels>;
}

export function ListHeaderCell({
  kind = 'label',
  isStatic = false,
  isSorted: sorted = false,
  children,
  onPress,
  'aria-label': ariaLabel,
  labels,
  className,
  style
}: ListHeaderCellProps) {
  if (kind === 'add-column') {
    return (
      <Button
        className={clsx('gv-list-header-cell', className)} style={style}
        data-kind="add-column"
        onPress={onPress}
        aria-label={ariaLabel ?? mergeLabels(listHeaderCellLabels, labels).addColumn}>
        <Plus aria-hidden size={16} strokeWidth={1.75} />
      </Button>
    );
  }

  if (isStatic && !sorted) {
    return (
      <span className={clsx('gv-list-header-cell', className)} style={style} data-kind={kind} data-static>
        {children}
      </span>
    );
  }

  return (
    <Button
      className={clsx('gv-list-header-cell', className)} style={style}
      data-kind={kind}
      data-sorted={sorted || undefined}
      onPress={onPress}
      aria-pressed={sorted}>
      {children}
      {sorted && <ArrowDown aria-hidden size={16} strokeWidth={1.75} className="gv-list-header-cell__arrow" />}
    </Button>
  );
}
