'use client';
import type {ReactNode} from 'react';
import type {ChartColor} from './Chart';
import clsx from 'clsx';
import type {PlacementProps} from '../className';
import {useListFormatter, useNumberFormatter, usePercentFormatter} from '../format';
import {mergeLabels} from '../labels';
import './Chart.css';
import './StatementRow.css';

export interface StatementCounts {
  /** How many people agreed. */
  agree: number;
  /** How many people disagreed. */
  disagree: number;
  /** How many people passed. */
  pass: number;
  /** With `unseenPercent`: the people who haven't seen the statement yet. */
  unseen?: number;
}

/** The words Statement row says itself (docs/API.md rule 11): the shares' names and how the bar reads out. */
export interface StatementRowLabels {
  /** The shares' names, in the hover card and the bar's name. */
  agree: string;
  /** The Disagree share's name. */
  disagree: string;
  /** The third answer ("Unsure" in Manage). */
  pass: string;
  /** The unseen share's name ("Not seen yet"). */
  unseen: string;
  /** One share read out, given its name, its percentage and (with `counts`) its count, as the locale writes them. */
  share: (label: string, percent: string, count?: string) => string;
  /** The bar's name with a `summary`, given the summary and the shares already joined. */
  withSummary: (summary: string, shares: string) => string;
}

/** Statement row's English words; a page passes its own over them with `labels`. */
export const statementRowLabels: StatementRowLabels = {
  agree: 'Agree',
  disagree: 'Disagree',
  pass: 'Pass',
  unseen: 'Not seen yet',
  share: (label, percent, count) => (count != null ? `${count} ${label.toLowerCase()} (${percent})` : `${percent} ${label.toLowerCase()}`),
  withSummary: (summary, shares) => `${summary} (${shares})`
};

export interface StatementRowProps extends PlacementProps {
  /** The Common Ground statement text. Omitted, the row is the bar alone (the Manage panel's "Where people stand"). */
  statement?: ReactNode;
  /** Percent who agree, disagree and pass. Should sum to roughly 100 (with `unseenPercent`, all four do). */
  agreePercent: number;
  /** Percent who disagree. */
  disagreePercent: number;
  /** Percent who pass. */
  passPercent: number;
  /**
   * The fourth share: who hasn't seen the statement yet (the Manage panel). The three answers sit 2 apart and the
   * rest of the track is the unseen share.
   */
  unseenPercent?: number;
  /** The caption after the bar, e.g. "81% agree" (the prototype always gives the agree share). */
  summary?: string;
  /** The people behind each share: the hover card gives them with the percentages. */
  counts?: StatementCounts;
  /** Its own words (the shares' names, how the bar reads out), over `statementRowLabels`. */
  labels?: Partial<StatementRowLabels>;
}

/**
 * A single Common Ground statement with its agree/disagree/pass bar —
 * the compact row used in results and summary views (as opposed to the
 * full `CommonGroundRow`, which is a table row with review columns).
 * Stack them 14 apart. A long statement wraps; a row narrower than 480
 * stacks statement, bar and value (Not in Figma; the prototype does it).
 * Hovering the row darkens the bar and shows every share in a card (Not in Figma).
 */
export function StatementRow({
  statement,
  agreePercent,
  disagreePercent,
  passPercent,
  unseenPercent,
  summary,
  counts,
  labels,
  className,
  style
}: StatementRowProps) {
  const l = mergeLabels(statementRowLabels, labels);
  const group = useNumberFormatter().format;
  const percent = usePercentFormatter();
  const list = useListFormatter({type: 'unit', style: 'short'});
  const shares: {kind: 'agree' | 'disagree' | 'pass' | 'unseen'; label: string; percent: number; count?: number; color?: ChartColor}[] = [
    {kind: 'agree', label: l.agree, percent: agreePercent, count: counts?.agree, color: 'agree'},
    {kind: 'disagree', label: l.disagree, percent: disagreePercent, count: counts?.disagree, color: 'disagree'},
    {kind: 'pass', label: l.pass, percent: passPercent, count: counts?.pass, color: 'pass'}
  ];
  if (unseenPercent != null) shares.push({kind: 'unseen', label: l.unseen, percent: unseenPercent, count: counts?.unseen});
  const four = unseenPercent != null;
  const words = list.format(shares.map(s => l.share(s.label, percent(s.percent), s.count != null ? group(s.count) : undefined)));

  return (
    <div className={clsx('gv-statement-row', className)} style={style} data-shares={four ? 4 : undefined} data-bar-only={statement == null || undefined}>
      <div className="gv-statement-row__in">
        {statement != null && <span className="gv-statement-row__statement">{statement}</span>}
        <span className="gv-statement-row__bar-wrap">
          <span className="gv-statement-row__bar" role="img" aria-label={summary ? l.withSummary(summary, words) : words}>
            {shares
              .filter(s => s.kind !== 'unseen' && (!four || s.percent > 0))
              .map(s => (
                <span key={s.kind} className="gv-statement-row__bar-segment" data-kind={s.kind} style={{width: `${s.percent}%`}} />
              ))}
          </span>
          <span className="gv-chart-card gv-statement-row__card" aria-hidden="true">
            {shares.map(s => (
              <span key={s.kind} className="gv-chart-card__row">
                <span className="gv-chart-card__swatch" data-kind={s.kind} data-chart-color={s.color} />
                <span className="gv-chart-card__label">{s.label}</span>
                <span className="gv-chart-card__value">
                  {s.count != null ? `${group(s.count)} · ` : ''}
                  {percent(s.percent)}
                </span>
              </span>
            ))}
          </span>
        </span>
        {summary != null && (
          <span className="gv-statement-row__value" aria-hidden="true">
            {summary}
          </span>
        )}
      </div>
    </div>
  );
}
