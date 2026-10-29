'use client';
import {ProgressBar, type ProgressBarProps} from 'react-aria-components/ProgressBar';
import clsx from 'clsx';
import type {PlacementProps} from '../components/className';
import './VoteProgress.css';

interface VoteProgressBase
  extends Omit<ProgressBarProps, 'children' | 'value' | 'minValue' | 'maxValue' | 'className' | 'style'>, PlacementProps {
  /** Accessible label; not shown visually (the count is the visible label). */
  label: string;
}

export interface VoteProgressThresholdProps extends VoteProgressBase {
  kind: 'threshold';
  /** Votes gathered so far. */
  count: number;
  /** The signature threshold the cause is aiming for. */
  threshold: number;
}

export interface VoteProgressCountProps extends VoteProgressBase {
  kind: 'count';
  /** Votes gathered so far. */
  count: number;
  /** The highest count among the options shown, used to scale the bar. */
  maxCount: number;
  /** How many of the votes are new since last seen. Omit for the plain Count kind. */
  newCount?: number;
}

export type VoteProgressProps = VoteProgressThresholdProps | VoteProgressCountProps;

export function VoteProgress(props: VoteProgressProps) {
  if (props.kind === 'threshold') {
    const {kind, label, count, threshold, className, style, ...rest} = props;
    const percent = threshold > 0 ? Math.min(100, (count / threshold) * 100) : 0;
    return (
      <ProgressBar
        {...rest}
        aria-label={label}
        value={count}
        minValue={0}
        maxValue={threshold}
        className={clsx('gv-vote-progress gv-vote-progress--threshold', className)}
        style={style}>
        <span className="gv-vote-progress__count">{count}</span>
        <span className="gv-vote-progress__of">/ {threshold}</span>
        <span className="gv-vote-progress__track">
          <span
            className="gv-vote-progress__fill"
            data-reached={count >= threshold || undefined}
            style={{width: `${percent}%`}}
          />
        </span>
      </ProgressBar>
    );
  }

  const {kind, label, count, maxCount, newCount, className, style, ...rest} = props;
  const percent = maxCount > 0 ? Math.min(100, (count / maxCount) * 100) : 0;
  return (
    <ProgressBar
      {...rest}
      aria-label={label}
      value={count}
      minValue={0}
      maxValue={maxCount}
      className={clsx('gv-vote-progress gv-vote-progress--count', className)}
      style={style}>
      <span className="gv-vote-progress__count">{count}</span>
      <span className="gv-vote-progress__track">
        <span className="gv-vote-progress__fill" style={{width: `${percent}%`}} />
      </span>
      {newCount !== undefined && <span className="gv-vote-progress__new">{newCount} new</span>}
    </ProgressBar>
  );
}
