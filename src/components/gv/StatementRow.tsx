'use client';
import type {ReactNode} from 'react';
import './StatementRow.css';

export interface StatementRowProps {
  /** The Common Ground statement text. */
  statement: ReactNode;
  /** Percent who agree, disagree and pass. Should sum to roughly 100. */
  agreePercent: number;
  disagreePercent: number;
  passPercent: number;
  /** The caption after the bar, e.g. "81% agree" (the prototype always gives the agree share). */
  summary: string;
}

/**
 * A single Common Ground statement with its agree/disagree/pass bar —
 * the compact row used in results and summary views (as opposed to the
 * full `CommonGroundRow`, which is a table row with review columns).
 * Stack them 14 apart. A long statement wraps; a row narrower than 480
 * stacks statement, bar and value (Not in Figma; the prototype does it).
 */
export function StatementRow({
  statement,
  agreePercent,
  disagreePercent,
  passPercent,
  summary
}: StatementRowProps) {
  return (
    <div className="gv-statement-row">
      <div className="gv-statement-row__in">
        <span className="gv-statement-row__statement">{statement}</span>
        <span
          className="gv-statement-row__bar"
          role="img"
          aria-label={`${summary} (${Math.round(agreePercent)}% agree, ${Math.round(
            disagreePercent
          )}% disagree, ${Math.round(passPercent)}% pass)`}>
          <span
            className="gv-statement-row__bar-segment"
            data-kind="agree"
            style={{width: `${agreePercent}%`}}
          />
          <span
            className="gv-statement-row__bar-segment"
            data-kind="disagree"
            style={{width: `${disagreePercent}%`}}
          />
          <span
            className="gv-statement-row__bar-segment"
            data-kind="pass"
            style={{width: `${passPercent}%`}}
          />
        </span>
        <span className="gv-statement-row__value" aria-hidden="true">
          {summary}
        </span>
      </div>
    </div>
  );
}
