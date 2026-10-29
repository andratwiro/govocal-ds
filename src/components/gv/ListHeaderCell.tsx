'use client';
import {Button} from 'react-aria-components/Button';
import {Plus, ArrowDown} from 'lucide-react';
import './ListHeaderCell.css';

export interface ListHeaderCellProps {
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
  'aria-label': ariaLabel
}: ListHeaderCellProps) {
  if (variant === 'add-column') {
    return (
      <Button
        className="gv-list-header-cell"
        data-variant="add-column"
        onPress={onPress}
        aria-label={ariaLabel ?? 'Add column'}>
        <Plus aria-hidden size={16} />
      </Button>
    );
  }

  const isSquare = square && !sorted;

  if (isSquare) {
    return (
      <span className="gv-list-header-cell" data-variant={variant} data-square>
        {children}
      </span>
    );
  }

  return (
    <Button
      className="gv-list-header-cell"
      data-variant={variant}
      data-sorted={sorted || undefined}
      onPress={onPress}
      aria-pressed={sorted}>
      {children}
      {sorted && <ArrowDown aria-hidden size={16} className="gv-list-header-cell__arrow" />}
    </Button>
  );
}
