'use client';
import {Link as RACLink, type LinkProps as RACLinkProps} from 'react-aria-components/Link';
import {ChevronRight} from 'lucide-react';
import {NewDot} from './NewDot';
import clsx from 'clsx';
import type {PlacementProps} from '../className';
import './StatRow.css';

export interface StatRowProps extends PlacementProps {
  /** The row's label, above the value. */
  label: string;
  /** The stat itself (a number or short string). */
  value: string;
  /**
   * Whether this row carries unread/new activity (shows a dot next to the label).
   *
   * @default false
   */
  isNew?: boolean;
  /**
   * Static rows are plain display (no hover, no chevron, no link): used when the row
   * isn't a destination. Interactive rows (the default) render as a link and show a
   * trailing chevron.
   *
   * @default false
   */
  isStatic?: boolean;
  /**
   * The row's filter is on (prototype `.pj-stats__row.is-on`: a Manage metric whose inputs the table now shows). Painted
   * as hovered with the chevron dark, and announced as the current item. Not in Figma.
   *
   * @default false
   */
  isSelected?: boolean;
  /** Where the row navigates. Omit together with onPress to force a static row. */
  href?: RACLinkProps['href'];
  /** Called when the row is activated, for a link that isn't a plain navigation. */
  onPress?: RACLinkProps['onPress'];
}

export function StatRow({label, value, isNew = false, isStatic = false, isSelected = false, href, onPress, className, style}: StatRowProps) {
  const content = (
    <>
      <div className="gv-stat-row__label">
        <span>{label}</span>
        {isNew && <NewDot />}
      </div>
      <div className="gv-stat-row__value">
        <span>{value}</span>
        {!isStatic && <ChevronRight aria-hidden="true" className="gv-stat-row__chevron" />}
      </div>
    </>
  );

  if (isStatic) {
    return <div className={clsx('gv-stat-row gv-stat-row--static', className)} style={style}>{content}</div>;
  }

  return (
    <RACLink
      href={href}
      onPress={onPress}
      aria-current={isSelected ? 'true' : undefined}
      className={clsx('gv-stat-row gv-stat-row--interactive', className)} style={style}>
      {content}
    </RACLink>
  );
}
