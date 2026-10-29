'use client';
import {TriangleAlert} from 'lucide-react';
import './ListRowVoting.css';

export interface ListRowVotingProps {
  title: string;
  thumbnail?: string;
  /** Shows the warning mark next to the title. */
  warning?: boolean;
  voteCount: number;
  /** The bar fill, 0-100, relative to the option with the most votes. */
  fillPercent: number;
  /** Unseen votes since Rob's last visit. */
  newVoteCount?: number;
  onlineCount: number;
  offlineCount: number;
  commentCount: number;
  /** Unseen comments since Rob's last visit. */
  newCommentCount?: number;
}

/**
 * The content of one Voting-method list row, built around Tali's
 * vote-progress bar (swap in the real `VoteProgress` component once it
 * ships — see the group report). Place inside a selectable `Row`/`Cell`
 * (Table) or `GridListItem` — see the `InATable` story.
 */
export function ListRowVoting({
  title,
  thumbnail,
  warning,
  voteCount,
  fillPercent,
  newVoteCount,
  onlineCount,
  offlineCount,
  commentCount,
  newCommentCount
}: ListRowVotingProps) {
  return (
    <div className="gv-list-row-voting">
      <div className="gv-list-row-voting__title-cell">
        {thumbnail && (
          <img className="gv-list-row-voting__thumbnail" src={thumbnail} alt="" aria-hidden />
        )}
        <span className="gv-list-row-voting__title">
          {title}
          {warning && (
            <TriangleAlert
              aria-label="Needs attention"
              className="gv-list-row-voting__warning"
              size={14}
            />
          )}
        </span>
      </div>
      <div className="gv-list-row-voting__cell gv-list-row-voting__votes-cell">
        <span className="gv-list-row-voting__vote-count">{voteCount}</span>
        <span className="gv-list-row-voting__bar">
          <span className="gv-list-row-voting__bar-fill" style={{width: `${fillPercent}%`}} />
        </span>
        {Boolean(newVoteCount) && (
          <span className="gv-list-row-voting__new">{newVoteCount} new</span>
        )}
      </div>
      <div className="gv-list-row-voting__cell gv-list-row-voting__number-cell">
        {onlineCount}
      </div>
      <div className="gv-list-row-voting__cell gv-list-row-voting__number-cell">
        <span className={offlineCount === 0 ? 'gv-list-row-voting__none' : undefined}>
          {offlineCount}
        </span>
      </div>
      <div className="gv-list-row-voting__cell gv-list-row-voting__comments-cell">
        {commentCount}
        {Boolean(newCommentCount) && (
          <span className="gv-list-row-voting__new">{newCommentCount} new</span>
        )}
      </div>
    </div>
  );
}
