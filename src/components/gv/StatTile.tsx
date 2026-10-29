import type {HTMLAttributes, ReactNode} from 'react';
import {ArrowDown, ArrowRight, ArrowUp} from 'lucide-react';
import {VisuallyHidden} from 'react-aria-components/VisuallyHidden';
import {HelpPopover} from './HelpPopover';
import './StatTile.css';

/** Figma "Stat tile" · Type. */
export type StatTileType = 'default' | 'tall' | 'with-note';

export interface StatTileTrend {
  /** Which way the number moved. Said in words too, never by colour alone. */
  direction: 'up' | 'down' | 'flat';
  /** How much, already formatted ("12%", "+46"). */
  value: ReactNode;
  /** Over what ("7-day change", "vs last month"). */
  label?: ReactNode;
}

export interface StatTileProps extends Omit<HTMLAttributes<HTMLDivElement>, 'children'> {
  /** What is counted ("Visitors"). */
  label: ReactNode;
  /** The number, already formatted ("1,284", "56.5%"). With nothing counted yet, 0 (the prototype's empty phase). */
  value: ReactNode;
  /** The line under the number ("updating live", "of visitors"). Shown by Type=With note. */
  note?: ReactNode;
  /**
   * The change under the number (prototype: "↑ 12% 7-day change"): an arrow, the change and what it covers, green
   * going up, red going down, grey flat. Screen readers hear the direction in words ("Up 12%, 7-day change").
   */
  trend?: StatTileTrend;
  /**
   * What the number means, behind a help icon after the label: it opens a Help popover on press (never a hover-only
   * tip: touch and keyboard reach it too).
   */
  info?: ReactNode;
  /** The Help popover's heading. @default the label, when it is text */
  infoTitle?: string;
  /**
   * Figma's Type. `tall` keeps the default content in a taller tile (so it lines up with
   * With note tiles in one band). Defaults to `with-note` when a note is given, else `default`.
   */
  type?: StatTileType;
  /** Optional slot under the value and note, e.g. a `Sparkline`. */
  children?: ReactNode;
}

const TREND = {
  up: {icon: ArrowUp, words: 'Up'},
  down: {icon: ArrowDown, words: 'Down'},
  flat: {icon: ArrowRight, words: 'No change'}
} as const;

/** A labelled number tile (Figma "Stat tile"; prototype `.pj-kpi`). Display only, but for its help icon. */
export function StatTile({label, value, note, trend, info, infoTitle, type, children, className, ...rest}: StatTileProps) {
  const kind: StatTileType = type ?? (note != null ? 'with-note' : 'default');
  const Arrow = trend ? TREND[trend.direction].icon : null;
  const title = infoTitle ?? (typeof label === 'string' ? label : 'About this number');
  return (
    <div {...rest} className={['gv-kpi', `gv-kpi--${kind}`, className].filter(Boolean).join(' ')}>
      <div className="gv-kpi__label">
        {label}
        {info != null && (
          <span className="gv-kpi__info">
            <HelpPopover title={title}>{info}</HelpPopover>
          </span>
        )}
      </div>
      <div className="gv-kpi__value">{value}</div>
      {trend && Arrow && (
        <div className="gv-kpi__trend" data-direction={trend.direction}>
          <Arrow aria-hidden size={14} strokeWidth={2} />
          <VisuallyHidden>{TREND[trend.direction].words} </VisuallyHidden>
          {trend.value != null && <span>{trend.value}</span>}
          {trend.label != null && (
            <>
              <VisuallyHidden>,</VisuallyHidden> <span className="gv-kpi__trend-label">{trend.label}</span>
            </>
          )}
        </div>
      )}
      {kind === 'with-note' && note != null && <div className="gv-kpi__note">{note}</div>}
      {children != null && <div className="gv-kpi__slot">{children}</div>}
    </div>
  );
}
