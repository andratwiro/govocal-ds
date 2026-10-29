import type {ReactNode} from 'react';
import clsx from 'clsx';
import type {PlacementProps} from '../className';
import './LegendRow.css';

export interface LegendRowProps extends PlacementProps {
  /** The legend swatch's colour, as a `--gv-chart-*` token name. */
  color: string;
  /** The series' label (e.g. an age bracket). */
  label: ReactNode;
  /** The value shown at the end of the row (e.g. a percentage). */
  value: string;
  /**
   * A count before the value, in its own column ("88" then "14%"): the Common Ground panel's "Where people stand".
   * A number is grouped for reading (1,284).
   */
  count?: number | string;
  /** Its series is picked out (in the chart beside it): the label goes primary. */
  isHighlighted?: boolean;
  /** Another series is picked out: the row dims with its series. */
  isDimmed?: boolean;
  /**
   * Hovering or focusing the row picks its series out (`true`), leaving gives `false`. When set, the row takes a tab
   * stop so the keyboard reaches it too. Wire it to a chart's `highlightedSeries` (Not in Figma).
   */
  onHighlightChange?: (on: boolean) => void;
}

/** A swatch, a label and its value: the key under a stacked bar or beside a chart (Figma "Legend row"). */
export function LegendRow({color, label, value, count, isHighlighted, isDimmed, onHighlightChange: on, className, style}: LegendRowProps) {
  return (
    <div
      className={clsx('gv-legend-row', className)} style={style}
      data-highlighted={isHighlighted || undefined}
      data-dimmed={isDimmed || undefined}
      tabIndex={on ? 0 : undefined}
      onPointerEnter={on && (() => on(true))}
      onPointerLeave={on && (() => on(false))}
      onFocus={on && (() => on(true))}
      onBlur={on && (() => on(false))}>
      <span className="gv-legend-row__swatch" aria-hidden="true" style={{background: `var(${color})`}} />
      <span className="gv-legend-row__label">{label}</span>
      {count != null && (
        <span className="gv-legend-row__count">{typeof count === 'number' ? count.toLocaleString('en-GB') : count}</span>
      )}
      <span className="gv-legend-row__value">{value}</span>
    </div>
  );
}
