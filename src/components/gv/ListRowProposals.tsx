'use client';
import {TriangleAlert} from 'lucide-react';
import {VoteProgress} from './VoteProgress';
import './ListRowProposals.css';

export interface ListRowProposalsProps {
  title: string;
  thumbnail?: string;
  /** Shows the warning mark next to the title. */
  warning?: boolean;
  voteCount: number;
  /** The threshold needed before an official response is triggered. */
  voteThreshold: number;
  /** A short status, e.g. "Gathering support", "Threshold reached", "Official response". */
  statusLabel: string;
  commentCount: number;
  /** Unseen comments since the admin's last visit. */
  newCommentCount?: number;
  /** "N days left", or omit and set `closed` once voting has ended. */
  daysLeft?: number;
  closed?: boolean;
}

/**
 * The content of one Proposals list row, built around Vote progress
 * (Type=Threshold). Place inside a selectable `Row`/`Cell` (Table) or
 * `GridListItem` — see the `InATable` story.
 */
export function ListRowProposals({
  title,
  thumbnail,
  warning,
  voteCount,
  voteThreshold,
  statusLabel,
  commentCount,
  newCommentCount,
  daysLeft,
  closed
}: ListRowProposalsProps) {
  return (
    <div className="gv-list-row-proposals">
      <div className="gv-list-row-proposals__title-cell">
        {thumbnail && (
          <img className="gv-list-row-proposals__thumbnail" src={thumbnail} alt="" aria-hidden />
        )}
        <span className="gv-list-row-proposals__title">
          {title}
          {warning && (
            <TriangleAlert
              aria-label="Needs attention"
              className="gv-list-row-proposals__warning"
              size={14}
            />
          )}
        </span>
      </div>
      <div className="gv-list-row-proposals__cell gv-list-row-proposals__votes-cell">
        <VoteProgress
          variant="threshold"
          label={`Votes for ${title}`}
          count={voteCount}
          threshold={voteThreshold}
        />
      </div>
      <div className="gv-list-row-proposals__cell gv-list-row-proposals__status-cell">
        {statusLabel}
      </div>
      <div className="gv-list-row-proposals__cell gv-list-row-proposals__comments-cell">
        {commentCount}
        {Boolean(newCommentCount) && (
          <span className="gv-list-row-proposals__new">{newCommentCount} new</span>
        )}
      </div>
      <div className="gv-list-row-proposals__cell gv-list-row-proposals__time-cell">
        {closed ? (
          <span className="gv-list-row-proposals__closed">Closed</span>
        ) : (
          `${daysLeft} days left`
        )}
      </div>
    </div>
  );
}
