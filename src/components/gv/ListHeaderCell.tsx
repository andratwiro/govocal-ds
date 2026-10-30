'use client';
import {Button} from 'react-aria-components/Button';
import {Plus, ArrowDown, ArrowUp} from 'lucide-react';
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
   * A static, non-sortable column label (Figma `Label · square`): plain text, no hover affordance, even with an
   * `onPress`. Ignored for `add-column`.
   *
   * @default false
   */
  isStatic?: boolean;
  /**
   * The column this cell heads is the one the list is currently sorted by (Figma `· sorted`): bold text, an arrow, and
   * `aria-sort` on the column head with `sortDirection`.
   *
   * @default false
   */
  isSorted?: boolean;
  /**
   * Which way the sorted column runs: `descending` (most first, the arrow points down) or `ascending` (least first, up).
   * Only read while `isSorted`.
   *
   * @default 'descending'
   */
  sortDirection?: 'ascending' | 'descending';
  /** The column label. Ignored for `add-column`. */
  children?: React.ReactNode;
  /**
   * Sorts by this column, or adds a column. A label or number cell is a button only with it; without it the cell is
   * plain text and takes no focus.
   */
  onPress?: () => void;
  /** The add-column button's name, over `labels.addColumn`. A label or number cell is named by its text. */
  'aria-label'?: string;
  /** Its own words, over `listHeaderCellLabels`. */
  labels?: Partial<ListHeaderCellLabels>;
}

/**
 * One column head in a List header (Figma "List header cell"): a label or number column that sorts the list when
 * pressed, a static label, or the trailing "Add column" button. Bold with an arrow when the list is sorted by it.
 * Each cell is a column head (`role="columnheader"`), so it sits in a List header's row.
 */
export function ListHeaderCell({
  kind = 'label',
  isStatic = false,
  isSorted: sorted = false,
  sortDirection = 'descending',
  children,
  onPress,
  'aria-label': ariaLabel,
  labels,
  className,
  style
}: ListHeaderCellProps) {
  if (kind === 'add-column') {
    return (
      <div role="columnheader" className={clsx('gv-list-header-cell', className)} style={style} data-kind="add-column">
        <Button
          className="gv-list-header-cell__button"
          onPress={onPress}
          aria-label={ariaLabel ?? mergeLabels(listHeaderCellLabels, labels).addColumn}>
          <Plus aria-hidden size={16} strokeWidth={1.75} />
        </Button>
      </div>
    );
  }

  const Arrow = sortDirection === 'ascending' ? ArrowUp : ArrowDown;
  const label = (
    <>
      {children}
      {sorted && <Arrow aria-hidden size={16} strokeWidth={1.75} className="gv-list-header-cell__arrow" />}
    </>
  );
  const isSortable = !isStatic && onPress != null;
  return (
    <div
      role="columnheader"
      aria-sort={sorted ? sortDirection : undefined}
      className={clsx('gv-list-header-cell', className)} style={style}
      data-kind={kind}
      data-sorted={sorted || undefined}
      data-sortable={isSortable || undefined}>
      {isSortable ? <Button className="gv-list-header-cell__button" onPress={onPress}>{label}</Button> : label}
    </div>
  );
}
