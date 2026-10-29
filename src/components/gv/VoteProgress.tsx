'use client';
import {ProgressBar, type ProgressBarProps} from 'react-aria-components/ProgressBar';
import './VoteProgress.css';

interface VoteProgressBase extends Omit<ProgressBarProps, 'children' | 'value' | 'minValue' | 'maxValue'> {
  /** Accessible label; not shown visually (the count is the visible label). */
  label: string;
}

export interface VoteProgressThresholdProps extends VoteProgressBase {
  variant: 'threshold';
  /** Votes gathered so far. */
  count: number;
  /** The signature threshold the cause is aiming for. */
  threshold: number;
}

export interface VoteProgressCountProps extends VoteProgressBase {
  variant: 'count';
  /** Votes gathered so far. */
  count: number;
  /** The highest count among the options shown, used to scale the bar. */
  maxCount: number;
  /** How many of the votes are new since last seen. Omit for the plain Count variant. */
  newCount?: number;
}

export type VoteProgressProps = VoteProgressThresholdProps | VoteProgressCountProps;

export function VoteProgress(props: VoteProgressProps) {
  const {label, variant} = props;

  if (variant === 'threshold') {
    const {count, threshold} = props;
    const percent = threshold > 0 ? Math.min(100, (count / threshold) * 100) : 0;
    return (
      <ProgressBar
        aria-label={label}
        value={count}
        minValue={0}
        maxValue={threshold}
        className="gv-vote-progress gv-vote-progress--threshold">
        <span className="gv-vote-progress__count">{count}</span>
        <span className="gv-vote-progress__of">/ {threshold}</span>
        <span className="gv-vote-progress__track">
          <span className="gv-vote-progress__fill" style={{width: `${percent}%`}} />
        </span>
      </ProgressBar>
    );
  }

  const {count, maxCount, newCount} = props;
  const percent = maxCount > 0 ? Math.min(100, (count / maxCount) * 100) : 0;
  return (
    <ProgressBar
      aria-label={label}
      value={count}
      minValue={0}
      maxValue={maxCount}
      className="gv-vote-progress gv-vote-progress--count">
      <span className="gv-vote-progress__count">{count}</span>
      <span className="gv-vote-progress__track">
        <span className="gv-vote-progress__fill" style={{width: `${percent}%`}} />
      </span>
      {newCount !== undefined && <span className="gv-vote-progress__new">{newCount} new</span>}
    </ProgressBar>
  );
}
