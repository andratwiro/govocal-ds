'use client';
import {Link as RACLink, type LinkProps as RACLinkProps} from 'react-aria-components/Link';
import {ToggleButton} from 'react-aria-components/ToggleButton';
import {ChevronRight} from 'lucide-react';
import {NewDot} from './NewDot';
import clsx from 'clsx';
import type {PlacementProps} from '../className';
import {mergeLabels} from '../labels';
import './StatRow.css';

/** The words Stat row says itself (docs/API.md rule 11). */
export interface StatRowLabels {
  /** What the new dot means to a screen reader. */
  new: string;
}

/** Stat row's English words; a page passes its own over them with `labels`. */
export const statRowLabels: StatRowLabels = {new: 'New'};

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
   * The row is a filter, and it is on (prototype `.pj-stats__row.is-on`: a Manage metric whose inputs the table now
   * shows). Passed at all (`true` or `false`), it makes the row a toggle button that says whether it is pressed, so
   * Enter and Space both press it; painted as hovered with the chevron dark while on. Leave it out for a row that leads
   * somewhere (a link). Not in Figma.
   */
  isSelected?: boolean;
  /** Where the row navigates. Omit together with onPress to force a static row. Ignored for a toggle (`isSelected`). */
  href?: RACLinkProps['href'];
  /** Called when the row is pressed: a link that isn't a plain navigation, or a toggle (`isSelected`). */
  onPress?: RACLinkProps['onPress'];
  /** Its own words (the new dot's name), over `statRowLabels`. */
  labels?: Partial<StatRowLabels>;
}

/**
 * A labelled number that leads somewhere (Figma "Stat row"): a label over a big number, a chevron at the end, and a
 * dot when there is something new, such as "Waiting for a reply · 40" in a phase's Manage tab. Static, it is plain
 * display.
 */
export function StatRow({label, value, isNew = false, isStatic = false, isSelected, href, onPress, labels, className, style}: StatRowProps) {
  const l = mergeLabels(statRowLabels, labels);
  const content = (
    <>
      <div className="gv-stat-row__label">
        <span>{label}</span>
        {isNew && <NewDot aria-label={l.new} />}
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

  if (isSelected !== undefined) {
    return (
      <ToggleButton
        isSelected={isSelected}
        onPress={onPress}
        className={clsx('gv-stat-row gv-stat-row--interactive', className)} style={style}>
        {content}
      </ToggleButton>
    );
  }

  return (
    <RACLink
      href={href}
      onPress={onPress}
      className={clsx('gv-stat-row gv-stat-row--interactive', className)} style={style}>
      {content}
    </RACLink>
  );
}
