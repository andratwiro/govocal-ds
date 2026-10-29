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
  /** The caption under the bar, e.g. "81% agree". */
  summary: string;
}

/**
 * A single Common Ground statement with its agree/disagree/pass bar —
 * the compact row used in results and summary views (as opposed to the
 * full `ListRowCommonGround`, which is a table row with review columns).
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
      <span className="gv-statement-row__statement">{statement}</span>
      <span
        className="gv-statement-row__bar"
        role="img"
        aria-label={`${summary} (${Math.round(agreePercent)}% agree, ${Math.round(disagreePercent)}% disagree, ${Math.round(passPercent)}% pass)`}>
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
  );
}
