'use client';
import './BarRow.css';

export interface BarRowProps {
  /** The row's label (e.g. a status name). */
  label: string;
  /**
   * Percentage filled, 0–100. Omitted for the empty state (no data to show yet).
   */
  percent?: number;
  /** The text shown at the end of the row, e.g. "18% · 6". */
  value?: string;
  /**
   * The bar fill's colour, as a `--gv-*` token name. Defaults to the shared bar colour;
   * pass a `--gv-chart-*` token to match a status.
   *
   * @default '--gv-chart-bar'
   */
  barColor?: string;
}

export function BarRow({label, percent, value, barColor = '--gv-chart-bar'}: BarRowProps) {
  const isEmpty = percent === undefined;

  return (
    <div className="gv-bar-row" data-empty={isEmpty || undefined}>
      <div className="gv-bar-row__label">{label}</div>
      <div className="gv-bar-row__track">
        {!isEmpty && (
          <div
            className="gv-bar-row__fill"
            style={{width: `${percent}%`, background: `var(${barColor})`}}
          />
        )}
      </div>
      <div className="gv-bar-row__value">{isEmpty ? '—' : value}</div>
    </div>
  );
}
