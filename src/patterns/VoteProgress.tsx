'use client';
import {ProgressBar, type ProgressBarProps} from 'react-aria-components/ProgressBar';
import clsx from 'clsx';
import type {PlacementProps} from '../components/className';
import {useNumberFormatter} from '../components/format';
import {mergeLabels, type CountLabel} from '../components/labels';
import './VoteProgress.css';

/** The words Vote progress says itself (docs/API.md rule 11). */
export interface VoteProgressLabels {
  /** `threshold`: after the count, given the threshold as the locale writes it ("/ 1,500"). */
  of: (threshold: string) => string;
  /** `count`: "N new". */
  new: CountLabel;
}

/** Vote progress's English words; a page passes its own over them with `labels`. */
export const voteProgressLabels: VoteProgressLabels = {of: threshold => `/ ${threshold}`, new: (count, n) => `${n} new`};

interface VoteProgressBase
  extends Omit<ProgressBarProps, 'children' | 'value' | 'minValue' | 'maxValue' | 'className' | 'style'>, PlacementProps {
  /** Accessible label; not shown visually (the count is the visible label). */
  label: string;
  /** Its own words ("/ threshold", "N new"), over `voteProgressLabels`. */
  labels?: Partial<VoteProgressLabels>;
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
  const number = useNumberFormatter();
  if (props.kind === 'threshold') {
    const {kind, label, count, threshold, labels, className, style, ...rest} = props;
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
        <span className="gv-vote-progress__count">{number.format(count)}</span>
        <span className="gv-vote-progress__of">{mergeLabels(voteProgressLabels, labels).of(number.format(threshold))}</span>
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

  const {kind, label, count, maxCount, newCount, labels, className, style, ...rest} = props;
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
      <span className="gv-vote-progress__count">{number.format(count)}</span>
      <span className="gv-vote-progress__track">
        <span className="gv-vote-progress__fill" style={{width: `${percent}%`}} />
      </span>
      {newCount !== undefined && <span className="gv-vote-progress__new">{mergeLabels(voteProgressLabels, labels).new(newCount, number.format(newCount))}</span>}
    </ProgressBar>
  );
}
