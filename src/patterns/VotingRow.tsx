'use client';
import {TriangleAlert} from 'lucide-react';
import {VoteProgress, voteProgressLabels, type VoteProgressLabels} from './VoteProgress';
import clsx from 'clsx';
import type {PlacementProps} from '../components/className';
import {useNumberFormatter} from '../components/format';
import {mergeLabels} from '../components/labels';
import './VotingRow.css';

/** The words Voting row says itself (docs/API.md rule 11), with Vote progress's, which it hands on ("N new" is
 * shared by the votes and the comments). */
export interface VotingRowLabels extends VoteProgressLabels {
  /** The warning mark's name. */
  needsAttention: string;
  /** The vote bar's name, given the option's title. */
  votesFor: (title: string) => string;
}

/** Voting row's English words; a page passes its own over them with `labels`. */
export const votingRowLabels: VotingRowLabels = {
  ...voteProgressLabels,
  needsAttention: 'Needs attention',
  votesFor: title => `Votes for ${title}`
};

export interface VotingRowProps extends PlacementProps {
  /** The option's title. */
  title: string;
  /** The option's picture, before the title. None when omitted. */
  thumbnail?: string;
  /** Shows the warning mark next to the title. */
  hasWarning?: boolean;
  /** Votes the option has so far. */
  voteCount: number;
  /** The bar fill, 0-100, relative to the option with the most votes. */
  fillPercent: number;
  /** Unseen votes since the admin's last visit. */
  newVoteCount?: number;
  /** How many of its votes were cast online. */
  onlineCount: number;
  /** How many of its votes were added from offline voting; 0 shows dimmed. */
  offlineCount: number;
  /** How many comments the option has. */
  commentCount: number;
  /** Unseen comments since the admin's last visit. */
  newCommentCount?: number;
  /** Its own words (the warning's and the bar's names, "N new"), over `votingRowLabels`. */
  labels?: Partial<VotingRowLabels>;
}

/**
 * The content of one Voting-method list row, built around Vote progress
 * (Type=Count / Count · new): Option · Votes 200 · Online 80 · Offline 80 · Comments 112,
 * then a trailing 28px slot. Pair it with `ListHeader` (Figma `Method=Voting`).
 */
export function VotingRow({
  title,
  thumbnail,
  hasWarning,
  voteCount,
  fillPercent,
  newVoteCount,
  onlineCount,
  offlineCount,
  commentCount,
  newCommentCount,
  labels,
  className,
  style
}: VotingRowProps) {
  const l = mergeLabels(votingRowLabels, labels);
  // Vote progress scales the bar by the leading option's count: recover it from this row's relative fill.
  const number = useNumberFormatter();
  const maxCount = fillPercent > 0 ? Math.round((voteCount * 100) / fillPercent) : Math.max(voteCount, 1);
  return (
    <div className={clsx('gv-list-row-voting', className)} style={style}>
      <div className="gv-list-row-voting__cells">
        <div className="gv-list-row-voting__title-cell">
          {thumbnail && <img className="gv-list-row-voting__thumbnail" src={thumbnail} alt="" aria-hidden />}
          <span className="gv-list-row-voting__title">{title}</span>
          {hasWarning && (
            <span className="gv-list-row-voting__marks">
              <TriangleAlert
                role="img"
                aria-label={l.needsAttention}
                className="gv-list-row-voting__warning"
                size={16}
                strokeWidth={1.75}
              />
            </span>
          )}
        </div>
        <div className="gv-list-row-voting__cell gv-list-row-voting__votes-cell">
          <VoteProgress
            kind="count"
            label={l.votesFor(title)}
            count={voteCount}
            maxCount={maxCount}
            newCount={newVoteCount || undefined}
            labels={l}
          />
        </div>
        <div className="gv-list-row-voting__cell" data-num>
          {number.format(onlineCount)}
        </div>
        <div className="gv-list-row-voting__cell" data-num>
          <span className={offlineCount === 0 ? 'gv-list-row-voting__none' : undefined}>{number.format(offlineCount)}</span>
        </div>
        <div className="gv-list-row-voting__cell gv-list-row-voting__comments-cell" data-num>
          {number.format(commentCount)}
          {Boolean(newCommentCount) && <span className="gv-list-row-voting__new">{l.new(newCommentCount!, number.format(newCommentCount!))}</span>}
        </div>
      </div>
    </div>
  );
}
