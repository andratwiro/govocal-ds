'use client';
import {TriangleAlert} from 'lucide-react';
import {VoteProgress} from './VoteProgress';
import clsx from 'clsx';
import type {PlacementProps} from '../components/className';
import './VotingRow.css';

export interface VotingRowProps extends PlacementProps {
  title: string;
  thumbnail?: string;
  /** Shows the warning mark next to the title. */
  warning?: boolean;
  voteCount: number;
  /** The bar fill, 0-100, relative to the option with the most votes. */
  fillPercent: number;
  /** Unseen votes since the admin's last visit. */
  newVoteCount?: number;
  onlineCount: number;
  offlineCount: number;
  commentCount: number;
  /** Unseen comments since the admin's last visit. */
  newCommentCount?: number;
}

/**
 * The content of one Voting-method list row, built around Vote progress
 * (Type=Count / Count · new): Option · Votes 200 · Online 80 · Offline 80 · Comments 112,
 * then a trailing 28px slot. Pair it with `ListHeader` (Figma `Method=Voting`).
 */
export function VotingRow({
  title,
  thumbnail,
  warning,
  voteCount,
  fillPercent,
  newVoteCount,
  onlineCount,
  offlineCount,
  commentCount,
  newCommentCount,
  className,
  style
}: VotingRowProps) {
  // Vote progress scales the bar by the leading option's count: recover it from this row's relative fill.
  const maxCount = fillPercent > 0 ? Math.round((voteCount * 100) / fillPercent) : Math.max(voteCount, 1);
  return (
    <div className={clsx('gv-list-row-voting', className)} style={style}>
      <div className="gv-list-row-voting__cells">
        <div className="gv-list-row-voting__title-cell">
          {thumbnail && <img className="gv-list-row-voting__thumbnail" src={thumbnail} alt="" aria-hidden />}
          <span className="gv-list-row-voting__title">{title}</span>
          {warning && (
            <span className="gv-list-row-voting__marks">
              <TriangleAlert
                role="img"
                aria-label="Needs attention"
                className="gv-list-row-voting__warning"
                size={16}
                strokeWidth={1.75}
              />
            </span>
          )}
        </div>
        <div className="gv-list-row-voting__cell gv-list-row-voting__votes-cell">
          <VoteProgress
            variant="count"
            label={`Votes for ${title}`}
            count={voteCount}
            maxCount={maxCount}
            newCount={newVoteCount || undefined}
          />
        </div>
        <div className="gv-list-row-voting__cell" data-num>
          {onlineCount}
        </div>
        <div className="gv-list-row-voting__cell" data-num>
          <span className={offlineCount === 0 ? 'gv-list-row-voting__none' : undefined}>{offlineCount}</span>
        </div>
        <div className="gv-list-row-voting__cell gv-list-row-voting__comments-cell" data-num>
          {commentCount}
          {Boolean(newCommentCount) && <span className="gv-list-row-voting__new">{newCommentCount} new</span>}
        </div>
      </div>
    </div>
  );
}
