'use client';
import {Button} from 'react-aria-components/Button';
import {Plus, ArrowDown} from 'lucide-react';
import clsx from 'clsx';
import type {PlacementProps} from '../className';
import './ListHeaderCell.css';

export interface ListHeaderCellProps extends PlacementProps {
  /**
   * Label cells align their text left; Number cells align right (Figma's `Type`).
   *
   * @default 'label'
   */
  variant?: 'label' | 'number' | 'add-column';
  /**
   * A square cell is a static, non-sortable column label (Figma `Label · square`):
   * plain text, no hover affordance. Ignored for `add-column`.
   *
   * @default false
   */
  square?: boolean;
  /**
   * The column this cell heads is the one the list is currently sorted by
   * (Figma `· sorted`): bold text + a down arrow. Implies the cell is not square.
   *
   * @default false
   */
  sorted?: boolean;
  /** The column label. Ignored for `add-column`. */
  children?: React.ReactNode;
  /** Sort / add-column press handler. */
  onPress?: () => void;
  'aria-label'?: string;
}

export function ListHeaderCell({
  variant = 'label',
  square = false,
  sorted = false,
  children,
  onPress,
  'aria-label': ariaLabel,
  className,
  style
}: ListHeaderCellProps) {
  if (variant === 'add-column') {
    return (
      <Button
        className={clsx('gv-list-header-cell', className)} style={style}
        data-variant="add-column"
        onPress={onPress}
        aria-label={ariaLabel ?? 'Add column'}>
        <Plus aria-hidden size={16} strokeWidth={1.75} />
      </Button>
    );
  }

  const isSquare = square && !sorted;

  if (isSquare) {
    return (
      <span className={clsx('gv-list-header-cell', className)} style={style} data-variant={variant} data-square>
        {children}
      </span>
    );
  }

  return (
    <Button
      className={clsx('gv-list-header-cell', className)} style={style}
      data-variant={variant}
      data-sorted={sorted || undefined}
      onPress={onPress}
      aria-pressed={sorted}>
      {children}
      {sorted && <ArrowDown aria-hidden size={16} strokeWidth={1.75} className="gv-list-header-cell__arrow" />}
    </Button>
  );
}
