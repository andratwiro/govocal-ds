'use client';
import {TriangleAlert} from 'lucide-react';
import {VoteProgress, voteProgressLabels, type VoteProgressLabels} from './VoteProgress';
import clsx from 'clsx';
import type {PlacementProps} from '../components/className';
import {useNumberFormatter} from '../components/format';
import {mergeLabels, type CountLabel} from '../components/labels';
import './ProposalsRow.css';

/** The words Proposals row says itself (docs/API.md rule 11), with Vote progress's, which it hands on. */
export interface ProposalsRowLabels extends VoteProgressLabels {
  /** The warning mark's name. */
  needsAttention: string;
  /** The vote bar's name, given the proposal's title. */
  votesFor: (title: string) => string;
  /** The time left, once voting has ended and before. */
  closed: string;
  /** The time-left cell while voting is open, given the days left. */
  daysLeft: CountLabel;
}

/** Proposals row's English words; a page passes its own over them with `labels`. */
export const proposalsRowLabels: ProposalsRowLabels = {
  ...voteProgressLabels,
  needsAttention: 'Needs attention',
  votesFor: title => `Votes for ${title}`,
  closed: 'Closed',
  daysLeft: (count, n) => (count === 1 ? `${n} day left` : `${n} days left`)
};

export interface ProposalsRowProps extends PlacementProps {
  /** The proposal's title. */
  title: string;
  /** The proposal's picture, before the title. None when omitted. */
  thumbnail?: string;
  /** Shows the warning mark next to the title. */
  hasWarning?: boolean;
  /** Votes gathered so far, against `voteThreshold`. */
  voteCount: number;
  /** The threshold needed before an official response is triggered. */
  voteThreshold: number;
  /** A short status, e.g. "Gathering support", "Threshold reached", "Official response". */
  statusLabel: string;
  /** How many comments the proposal has. */
  commentCount: number;
  /** Unseen comments since the admin's last visit. */
  newCommentCount?: number;
  /** "N days left", or omit and set `isClosed` once voting has ended. */
  daysLeft?: number;
  /** Voting has ended: the time-left cell says "Closed" in place of the days. */
  isClosed?: boolean;
  /** Its own words (the warning's and the bar's names, "N new", the time left), over `proposalsRowLabels`. */
  labels?: Partial<ProposalsRowLabels>;
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
  labels,
  className,
  style
}: ProposalsRowProps) {
  const l = mergeLabels(proposalsRowLabels, labels);
  const number = useNumberFormatter();
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
                aria-label={l.needsAttention}
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
            label={l.votesFor(title)}
            count={voteCount}
            threshold={voteThreshold}
            labels={l}
          />
        </div>
        <div className="gv-list-row-proposals__cell gv-list-row-proposals__status-cell">{statusLabel}</div>
        <div className="gv-list-row-proposals__cell gv-list-row-proposals__comments-cell" data-num>
          {number.format(commentCount)}
          {Boolean(newCommentCount) && (
            <span className="gv-list-row-proposals__new">{l.new(newCommentCount!, number.format(newCommentCount!))}</span>
          )}
        </div>
        <div className="gv-list-row-proposals__cell gv-list-row-proposals__time-cell">
          {isClosed ? (
            <span className="gv-list-row-proposals__closed">{l.closed}</span>
          ) : (
            daysLeft != null && l.daysLeft(daysLeft, number.format(daysLeft))
          )}
        </div>
      </div>
    </div>
  );
}
