import './LegendRow.css';

export interface LegendRowProps {
  /** The legend swatch's colour, as a `--gv-chart-*` token name. */
  color: string;
  /** The series' label (e.g. an age bracket). */
  label: string;
  /** The value shown at the end of the row (e.g. a percentage). */
  value: string;
}

export function LegendRow({color, label, value}: LegendRowProps) {
  return (
    <div className="gv-legend-row">
      <span className="gv-legend-row__swatch" aria-hidden="true" style={{background: `var(${color})`}} />
      <span className="gv-legend-row__label">{label}</span>
      <span className="gv-legend-row__value">{value}</span>
    </div>
  );
}
