'use client';
import type {CSSProperties, ReactNode} from 'react';
import {VisuallyHidden} from 'react-aria-components/VisuallyHidden';
import './Chart.css';
import './BarRow.css';

export interface BarRowProps {
  /** The row's label (e.g. a status name). */
  label: ReactNode;
  /**
   * Percentage filled, 0–100. Omitted for the empty state (no data to show yet).
   */
  percent?: number;
  /**
   * The text shown at the end of the row, e.g. "18% · 6". Omitted, the row has no value cell and the bar runs to
   * the end (the AI summary's Top themes); an empty row still shows its dash.
   */
  value?: string;
  /**
   * The bar fill's colour, as a `--gv-*` token name. Defaults to the shared bar colour;
   * pass a `--gv-chart-*` token to match a status.
   *
   * @default '--gv-chart-bar'
   */
  barColor?: string;
  /**
   * The label's lines before it cuts off: 1 (Figma) or 2, for a narrow column of longer names ("Green spaces / and
   * shade" in the AI summary's Top themes).
   * @default 1
   */
  labelLines?: 1 | 2;
  /**
   * The exact count and share, when `value` doesn't print them ("59 of 400 inputs · 15%"). Hovering the row shows it
   * in a card over the bar's end (Not in Figma); screen readers read it with the row.
   */
  detail?: string;
}

/** Figma "Bar row": a label, a thin bar and its value. Hover darkens the bar; a `detail` card gives the exact numbers. */
export function BarRow({label, percent, value, barColor = '--gv-chart-bar', labelLines = 1, detail}: BarRowProps) {
  const isEmpty = percent === undefined;
  const share = Math.max(0, Math.min(100, percent ?? 0));

  return (
    <div className="gv-bar-row" data-empty={isEmpty || undefined} data-lines={labelLines === 2 ? 2 : undefined}>
      <div className="gv-bar-row__label">
        {label}
        {detail && !isEmpty && <VisuallyHidden>, {detail}</VisuallyHidden>}
      </div>
      <div className="gv-bar-row__bar">
        <div className="gv-bar-row__track">
          {!isEmpty && (
            <div className="gv-bar-row__fill" style={{width: `${share}%`, '--bar-color': `var(${barColor})`} as CSSProperties} />
          )}
        </div>
        {detail && !isEmpty && (
          <div className="gv-chart-card gv-bar-row__card" style={{insetInlineStart: `${share}%`}} aria-hidden>
            <span className="gv-chart-card__value">{detail}</span>
          </div>
        )}
      </div>
      {(isEmpty || value != null) && <div className="gv-bar-row__value">{isEmpty ? '—' : value}</div>}
    </div>
  );
}
