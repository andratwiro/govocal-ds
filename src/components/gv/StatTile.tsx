import type {HTMLAttributes, ReactNode} from 'react';
import './StatTile.css';

/** Figma "Stat tile" · Type. */
export type StatTileType = 'default' | 'tall' | 'with-note';

export interface StatTileProps extends Omit<HTMLAttributes<HTMLDivElement>, 'children'> {
  /** What is counted ("Visitors"). */
  label: ReactNode;
  /** The number, already formatted ("1,284", "56.5%"). */
  value: ReactNode;
  /** The line under the number ("updating live", "of visitors"). Shown by Type=With note. */
  note?: ReactNode;
  /**
   * Figma's Type. `tall` keeps the default content in a taller tile (so it lines up with
   * With note tiles in one band). Defaults to `with-note` when a note is given, else `default`.
   */
  type?: StatTileType;
  /** Optional slot under the value and note, e.g. a `Sparkline`. */
  children?: ReactNode;
}

/** A labelled number tile (Figma "Stat tile"; prototype `.pj-kpi`). Display only. */
export function StatTile({label, value, note, type, children, className, ...rest}: StatTileProps) {
  const kind: StatTileType = type ?? (note != null ? 'with-note' : 'default');
  return (
    <div {...rest} className={['gv-kpi', `gv-kpi--${kind}`, className].filter(Boolean).join(' ')}>
      <div className="gv-kpi__label">{label}</div>
      <div className="gv-kpi__value">{value}</div>
      {kind === 'with-note' && note != null && <div className="gv-kpi__note">{note}</div>}
      {children != null && <div className="gv-kpi__slot">{children}</div>}
    </div>
  );
}
