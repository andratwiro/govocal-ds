import {CircleCheck, CircleDashed} from 'lucide-react';
import './ReviewNotice.css';

export interface ReviewNoticeProps {
  /**
   * Where a card's review stands. Figma draws "To review"; Tali's prototype adds "To set" (a decision with no value
   * yet) and "Reviewed" (green, once the admin has visited the card).
   *
   * @default 'to-review'
   */
  state?: 'to-review' | 'to-set' | 'reviewed';
}

const LABEL = {'to-review': 'To review', 'to-set': 'To set', reviewed: 'Reviewed'} as const;

/** The small word at the end of a card's header that says whether the admin has looked at it. */
export function ReviewNotice({state = 'to-review'}: ReviewNoticeProps) {
  return (
    <span className="gv-review-notice" data-state={state}>
      {state === 'reviewed' ? (
        <CircleCheck className="gv-review-notice__icon" aria-hidden size={16} />
      ) : (
        <CircleDashed className="gv-review-notice__icon" aria-hidden size={14} />
      )}
      <span>{LABEL[state]}</span>
    </span>
  );
}
