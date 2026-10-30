import type {HTMLAttributes, ReactNode} from 'react';
import {ArrowDown, ArrowRight, ArrowUp} from 'lucide-react';
import {VisuallyHidden} from 'react-aria-components/VisuallyHidden';
import {HelpPopover, type HelpPopoverLabels} from './HelpPopover';
import {mergeLabels} from '../labels';
import './StatTile.css';

/** The words Stat tile says itself (docs/API.md rule 11), with the Help popover's, which it hands on. */
export interface StatTileLabels extends HelpPopoverLabels {
  /** The trend's direction, read before the change ("Up 12%, 7-day change"). */
  up: string;
  /** Read before a downward trend's change. */
  down: string;
  /** Read when the trend shows no change. */
  flat: string;
  /** The Help popover's heading when neither `infoTitle` nor a text `label` gives one. */
  about: string;
}

/** Stat tile's English words; a page passes its own over them with `labels`. */
export const statTileLabels: StatTileLabels = {
  up: 'Up',
  down: 'Down',
  flat: 'No change',
  about: 'About this number',
  help: title => `Help: ${title}`
};

/** Figma "Stat tile" · Type. */
export type StatTileLayout = 'default' | 'tall' | 'with-note';

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
  layout?: StatTileLayout;
  /**
   * The look: `card` (a bordered tile, the dashboard's) or `plain` (no card: the figure printed on a document's page,
   * in the document type; split plain tiles with a vertical Divider). @default 'card'
   */
  variant?: 'card' | 'plain';
  /** The number the finding names, in the chart highlight colour (a report's lead figure). */
  isHighlighted?: boolean;
  /**
   * The number's size in the plain look: `large` for a lead figure beside smaller ones (the document display type).
   * @default 'default'
   */
  size?: 'default' | 'large';
  /** Optional slot under the value and note. For a number with its trend line, use Stat card (`StatCard`), not a
   * Sparkline here. */
  children?: ReactNode;
  /** Its own words (the trend's direction, the help icon's name), over `statTileLabels`. */
  labels?: Partial<StatTileLabels>;
}

const ARROW = {up: ArrowUp, down: ArrowDown, flat: ArrowRight} as const;

/**
 * A labelled number tile (Figma "Stat tile"; prototype `.pj-kpi`). Display only, but for its help icon.
 * `variant="plain"` prints the figure on a document's page with no card, in the document type: label over value as ever, a
 * `large` lead figure, `isHighlighted` in the chart highlight (the report prototype's key figures; not in Figma).
 */
export function StatTile({
  label, value, note, trend, info, infoTitle, layout, variant = 'card', isHighlighted, size = 'default', children, labels,
  className, ...rest
}: StatTileProps) {
  const l = mergeLabels(statTileLabels, labels);
  const shape: StatTileLayout = layout ?? (note != null ? 'with-note' : 'default');
  const Arrow = trend ? ARROW[trend.direction] : null;
  const title = infoTitle ?? (typeof label === 'string' ? label : l.about);
  return (
    <div {...rest} className={['gv-kpi', `gv-kpi--${shape}`, className].filter(Boolean).join(' ')} data-variant={variant}
      data-highlighted={isHighlighted || undefined} data-size={size === 'large' ? size : undefined}>
      <div className="gv-kpi__label">
        {label}
        {info != null && (
          <span className="gv-kpi__info">
            <HelpPopover title={title} labels={l}>{info}</HelpPopover>
          </span>
        )}
      </div>
      <div className="gv-kpi__value">{value}</div>
      {trend && Arrow && (
        <div className="gv-kpi__trend" data-direction={trend.direction}>
          <Arrow aria-hidden size={14} strokeWidth={2} />
          <VisuallyHidden>{l[trend.direction]} </VisuallyHidden>
          {trend.value != null && <span>{trend.value}</span>}
          {trend.label != null && (
            <>
              <VisuallyHidden>,</VisuallyHidden> <span className="gv-kpi__trend-label">{trend.label}</span>
            </>
          )}
        </div>
      )}
      {shape === 'with-note' && note != null && <div className="gv-kpi__note">{note}</div>}
      {children != null && <div className="gv-kpi__slot">{children}</div>}
    </div>
  );
}
