import clsx from 'clsx';
import type {PlacementProps} from '../className';
import {mergeLabels} from '../labels';
import './ReviewStatus.css';

/** The words Review status says itself (docs/API.md rule 11): one per status. Card takes the same keys and hands
 * them on. */
export interface ReviewStatusLabels {
  /** The word for a card nobody has looked at yet. */
  toReview: string;
  /** The word for a decision with no value yet. */
  toSet: string;
  /** The word once the admin has visited the card. */
  reviewed: string;
}

/** Review status's English words; a page passes its own over them with `labels`. */
export const reviewStatusLabels: ReviewStatusLabels = {toReview: 'To review', toSet: 'To set', reviewed: 'Reviewed'};

export interface ReviewStatusProps extends PlacementProps {
  /**
   * Where a card's review stands. Figma draws "To review"; the prototype adds "To set" (a decision with no value
   * yet) and "Reviewed" (a green check-circle and a green word, once the admin has opened the card).
   *
   * @default 'to-review'
   */
  status?: 'to-review' | 'to-set' | 'reviewed';
  /** Its own words, over `reviewStatusLabels`. */
  labels?: Partial<ReviewStatusLabels>;
}

const KEY = {'to-review': 'toReview', 'to-set': 'toSet', reviewed: 'reviewed'} as const;

/* Figma's circle-dashed/14 and the prototype's `.rv--todo` mark: a 12.5 ring, 1.5 stroke in a 16 box (drawn at 14),
   dashes 2.6 / 2.2. Lucide's CircleDashed has eight long dashes instead. */
function Todo() {
  return (
    <svg className="gv-review-notice__icon" viewBox="0 0 16 16" width={14} height={14} aria-hidden="true">
      <circle cx="8" cy="8" r="6.25" fill="none" stroke="currentColor" strokeWidth="1.5" strokeDasharray="2.6 2.2" />
    </svg>
  );
}

/* The prototype's `.rv--done` mark: a green check-circle (a filled circle with a white tick), drawn at 14, the same
   box as To review's dashed ring, so a row keeps its height and its words their place when it turns Reviewed. */
function Done() {
  return (
    <svg className="gv-review-notice__icon" viewBox="0 0 16 16" width={14} height={14} aria-hidden="true">
      <circle className="gv-review-notice__fill" cx="8" cy="8" r="7.5" />
      <path
        className="gv-review-notice__tick"
        d="M4.9 8.2 7 10.2 11.1 6"
        fill="none"
        strokeWidth="1.6"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

/** The small word at the end of a card's header that says whether the admin has looked at it. */
export function ReviewStatus({status = 'to-review', labels, className, style}: ReviewStatusProps) {
  return (
    <span className={clsx('gv-review-notice', className)} style={style} data-status={status}>
      {status === 'reviewed' ? <Done /> : <Todo />}
      <span>{mergeLabels(reviewStatusLabels, labels)[KEY[status]]}</span>
    </span>
  );
}
