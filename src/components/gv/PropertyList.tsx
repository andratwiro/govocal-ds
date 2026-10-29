import type {ReactNode} from 'react';
import {VisuallyHidden} from 'react-aria-components';
import clsx from 'clsx';
import type {PlacementProps} from '../className';
import './PropertyList.css';

export interface PropertyListProps extends PlacementProps {
  /** One `PropertyListItem` per property. */
  children: ReactNode;
  /** Names the list when the page has no heading for it, e.g. "Idea details". */
  'aria-label'?: string;
}

/**
 * Property list: label · value rows (the prototype's `.pj-props` in the side panel, Figma's idea panel 1:512). The
 * labels share one column, 64 wide or as wide as the longest; the values start 8 after it and wrap. A `dl`, so a
 * screen reader reads each label with its value. Values are anything: text, a number, a Select, tags, a link.
 * Not in Figma as a component.
 */
export function PropertyList({children, 'aria-label': ariaLabel, className, style}: PropertyListProps) {
  return (
    <dl className={clsx('gv-property-list', className)} style={style} aria-label={ariaLabel}>
      {children}
    </dl>
  );
}

export interface PropertyListItemProps extends PlacementProps {
  /** The property's name, e.g. "Status". */
  label: string;
  /** Its value. Left out (or empty), the row shows "–", read as `emptyLabel`. */
  children?: ReactNode;
  /** What a screen reader says for an empty value. @default 'Not set' */
  emptyLabel?: string;
}

const isEmpty = (v: ReactNode) => v === undefined || v === null || v === false || v === '';

/** One row of a Property list: its label and its value. */
export function PropertyListItem({label, children, emptyLabel = 'Not set', className, style}: PropertyListItemProps) {
  return (
    <div className={clsx('gv-property-list__item', className)} style={style}>
      <dt className="gv-property-list__label">{label}</dt>
      <dd className="gv-property-list__value">
        {isEmpty(children) ? (
          <span className="gv-property-list__empty">
            <span aria-hidden>–</span>
            <VisuallyHidden>{emptyLabel}</VisuallyHidden>
          </span>
        ) : (
          children
        )}
      </dd>
    </div>
  );
}
