'use client';
import {Link as RACLink, type LinkProps as RACLinkProps} from 'react-aria-components/Link';
import {ChevronRight} from 'lucide-react';
import './StatRow.css';

export interface StatRowProps {
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
  /** Where the row navigates. Omit together with onPress to force a static row. */
  href?: RACLinkProps['href'];
  /** Called when the row is activated, for a link that isn't a plain navigation. */
  onPress?: RACLinkProps['onPress'];
}

export function StatRow({label, value, isNew = false, isStatic = false, href, onPress}: StatRowProps) {
  const content = (
    <>
      <div className="gv-stat-row__label">
        <span>{label}</span>
        {isNew && <span className="gv-stat-row__dot" aria-hidden="true" />}
      </div>
      <div className="gv-stat-row__value">
        <span>{value}</span>
        {!isStatic && <ChevronRight aria-hidden="true" className="gv-stat-row__chevron" />}
      </div>
    </>
  );

  if (isStatic) {
    return <div className="gv-stat-row gv-stat-row--static">{content}</div>;
  }

  return (
    <RACLink href={href} onPress={onPress} className="gv-stat-row gv-stat-row--interactive">
      {content}
    </RACLink>
  );
}
