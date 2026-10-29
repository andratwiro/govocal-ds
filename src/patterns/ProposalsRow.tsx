'use client';
import {TriangleAlert} from 'lucide-react';
import {VoteProgress} from './VoteProgress';
import clsx from 'clsx';
import type {PlacementProps} from '../components/className';
import './ProposalsRow.css';

export interface ProposalsRowProps extends PlacementProps {
  title: string;
  thumbnail?: string;
  /** Shows the warning mark next to the title. */
  hasWarning?: boolean;
  voteCount: number;
  /** The threshold needed before an official response is triggered. */
  voteThreshold: number;
  /** A short status, e.g. "Gathering support", "Threshold reached", "Official response". */
  statusLabel: string;
  commentCount: number;
  /** Unseen comments since the admin's last visit. */
  newCommentCount?: number;
  /** "N days left", or omit and set `isClosed` once voting has ended. */
  daysLeft?: number;
  isClosed?: boolean;
}

/**
 * The content of one Proposals list row, built around Vote progress
 * (Type=Threshold): Proposal · Votes 200 · Status 144 · Comments 112 · Time left 104,
 * then a trailing 28px slot. Pair it with `ListHeader` (Figma `Method=Proposals`).
 */
export function ProposalsRow({
  title,
  thumbnail,
  hasWarning,
  voteCount,
  voteThreshold,
  statusLabel,
  commentCount,
  newCommentCount,
  daysLeft,
  isClosed,
  className,
  style
}: ProposalsRowProps) {
  return (
    <div className={clsx('gv-list-row-proposals', className)} style={style}>
      <div className="gv-list-row-proposals__cells">
        <div className="gv-list-row-proposals__title-cell">
          {thumbnail && (
            <img className="gv-list-row-proposals__thumbnail" src={thumbnail} alt="" aria-hidden />
          )}
          <span className="gv-list-row-proposals__title">{title}</span>
          {hasWarning && (
            <span className="gv-list-row-proposals__marks">
              <TriangleAlert
                role="img"
                aria-label="Needs attention"
                className="gv-list-row-proposals__warning"
                size={16}
                strokeWidth={1.75}
              />
            </span>
          )}
        </div>
        <div className="gv-list-row-proposals__cell gv-list-row-proposals__votes-cell">
          <VoteProgress
            kind="threshold"
            label={`Votes for ${title}`}
            count={voteCount}
            threshold={voteThreshold}
          />
        </div>
        <div className="gv-list-row-proposals__cell gv-list-row-proposals__status-cell">{statusLabel}</div>
        <div className="gv-list-row-proposals__cell gv-list-row-proposals__comments-cell" data-num>
          {commentCount}
          {Boolean(newCommentCount) && (
            <span className="gv-list-row-proposals__new">{newCommentCount} new</span>
          )}
        </div>
        <div className="gv-list-row-proposals__cell gv-list-row-proposals__time-cell">
          {isClosed ? <span className="gv-list-row-proposals__closed">Closed</span> : `${daysLeft} days left`}
        </div>
      </div>
    </div>
  );
}
