'use client';
import type {ReactNode} from 'react';
import type {ChartColor} from './Chart';
import './Chart.css';
import './StatementRow.css';

export interface StatementCounts {
  agree: number;
  disagree: number;
  pass: number;
  /** With `unseenPercent`: the people who haven't seen the statement yet. */
  unseen?: number;
}

export interface StatementRowProps {
  /** The Common Ground statement text. Omitted, the row is the bar alone (the Manage panel's "Where people stand"). */
  statement?: ReactNode;
  /** Percent who agree, disagree and pass. Should sum to roughly 100 (with `unseenPercent`, all four do). */
  agreePercent: number;
  disagreePercent: number;
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
  /** The third answer's name ("Unsure" in Manage). @default 'Pass' */
  passLabel?: string;
}

const round = (n: number) => Math.round(n);
const group = (n: number) => n.toLocaleString('en-GB');

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
  passLabel = 'Pass'
}: StatementRowProps) {
  const shares: {kind: 'agree' | 'disagree' | 'pass' | 'unseen'; label: string; percent: number; count?: number; color?: ChartColor}[] = [
    {kind: 'agree', label: 'Agree', percent: agreePercent, count: counts?.agree, color: 'agree'},
    {kind: 'disagree', label: 'Disagree', percent: disagreePercent, count: counts?.disagree, color: 'disagree'},
    {kind: 'pass', label: passLabel, percent: passPercent, count: counts?.pass, color: 'pass'}
  ];
  if (unseenPercent != null) shares.push({kind: 'unseen', label: 'Not seen yet', percent: unseenPercent, count: counts?.unseen});
  const four = unseenPercent != null;
  const words = shares
    .map(s => (s.count != null ? `${group(s.count)} ${s.label.toLowerCase()} (${round(s.percent)}%)` : `${round(s.percent)}% ${s.label.toLowerCase()}`))
    .join(', ');

  return (
    <div className="gv-statement-row" data-shares={four ? 4 : undefined} data-bar-only={statement == null || undefined}>
      <div className="gv-statement-row__in">
        {statement != null && <span className="gv-statement-row__statement">{statement}</span>}
        <span className="gv-statement-row__bar-wrap">
          <span className="gv-statement-row__bar" role="img" aria-label={summary ? `${summary} (${words})` : words}>
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
                  {round(s.percent)}%
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
