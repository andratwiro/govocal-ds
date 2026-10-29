import clsx from 'clsx';
import type {PlacementProps} from '../className';
import './ReviewStatus.css';

export interface ReviewStatusProps extends PlacementProps {
  /**
   * Where a card's review stands. Figma draws "To review"; the prototype adds "To set" (a decision with no value
   * yet) and "Reviewed" (green, once the admin has visited the card).
   *
   * @default 'to-review'
   */
  status?: 'to-review' | 'to-set' | 'reviewed';
}

const LABEL = {'to-review': 'To review', 'to-set': 'To set', reviewed: 'Reviewed'} as const;

/* Figma's circle-dashed/14 and the prototype's `.rv--todo` mark: a 12.5 ring, 1.5 stroke in a 16 box (drawn at 14),
   dashes 2.6 / 2.2. Lucide's CircleDashed has eight long dashes instead. */
function Todo() {
  return (
    <svg className="gv-review-notice__icon" viewBox="0 0 16 16" width={14} height={14} aria-hidden="true">
      <circle cx="8" cy="8" r="6.25" fill="none" stroke="currentColor" strokeWidth="1.5" strokeDasharray="2.6 2.2" />
    </svg>
  );
}

/* The prototype's `.rv--done` mark: a filled 15 circle with a white tick, drawn at 16. */
function Done() {
  return (
    <svg className="gv-review-notice__icon" viewBox="0 0 16 16" width={16} height={16} aria-hidden="true">
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
export function ReviewStatus({status = 'to-review', className, style}: ReviewStatusProps) {
  return (
    <span className={clsx('gv-review-notice', className)} style={style} data-status={status}>
      {status === 'reviewed' ? <Done /> : <Todo />}
      <span>{LABEL[status]}</span>
    </span>
  );
}
