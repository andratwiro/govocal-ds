'use client';
import type {CSSProperties, ReactNode} from 'react';
import {VisuallyHidden} from 'react-aria-components/VisuallyHidden';
import clsx from 'clsx';
import type {PlacementProps} from '../className';
import type {ChartColor} from './Chart';
import './Chart.css';
import './BarRow.css';

export interface BarRowProps extends PlacementProps {
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
   * The bar fill's colour, a chart colour name: `bar` (the shared bar colour), `pass` (the grey of the rest),
   * `highlight` (the one a finding names), or a status's (`blue-2`). The old `--gv-chart-*` token string
   * (`'--gv-chart-pass'`) still works until the next release; use the name.
   *
   * @default 'bar'
   */
  barColor?: ChartColor | `--gv-chart-${ChartColor}`;
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

/**
 * One row of a ranking: a label, a bar sized by its share and a value; stack rows in order (status breakdown, Top themes).
 * Figma's "Bar row". Hover darkens the bar; a `detail` card gives the exact numbers.
 */
export function BarRow({label, percent, value, barColor = 'bar', labelLines = 1, detail, className, style}: BarRowProps) {
  const isEmpty = percent === undefined;
  const share = Math.max(0, Math.min(100, percent ?? 0));
  // A name, or (until the next release) the old token string.
  const token = barColor.startsWith('--') ? barColor : `--gv-chart-${barColor}`;

  return (
    <div className={clsx('gv-bar-row', className)} style={style} data-empty={isEmpty || undefined} data-lines={labelLines === 2 ? 2 : undefined}>
      <div className="gv-bar-row__label">
        {label}
        {detail && !isEmpty && <VisuallyHidden>, {detail}</VisuallyHidden>}
      </div>
      <div className="gv-bar-row__bar">
        <div className="gv-bar-row__track">
          {!isEmpty && (
            <div className="gv-bar-row__fill" style={{width: `${share}%`, '--bar-color': `var(${token})`} as CSSProperties} />
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
