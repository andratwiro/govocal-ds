'use client';
import {Button} from 'react-aria-components/Button';
import {X} from 'lucide-react';
import './DraftsBar.css';

export interface DraftsBarProps {
  /** How many drafts are open. */
  count: number;
  onShow?: () => void;
  onHistory?: () => void;
  /** Hides the bar. Without it there is no close button. */
  onClose?: () => void;
}

/**
 * The floating drafts bar: a dark pill at the foot of the screen that says how many drafts are open, with Show,
 * History and a close button. The page places it (fixed, bottom start). Not in Figma yet.
 */
export function DraftsBar({count, onShow, onHistory, onClose}: DraftsBarProps) {
  return (
    <section className="gv-drafts-bar" aria-label="Drafts">
      <span className="gv-drafts-bar__count">{count} {count === 1 ? 'draft' : 'drafts'} open</span>
      <span className="gv-drafts-bar__sep" aria-hidden>·</span>
      <Button className="gv-drafts-bar__action" onPress={onShow}>Show</Button>
      <span className="gv-drafts-bar__sep" aria-hidden>·</span>
      <Button className="gv-drafts-bar__action" onPress={onHistory}>History</Button>
      {onClose && (
        <Button className="gv-drafts-bar__close" aria-label="Close the drafts bar" onPress={onClose}>
          <X aria-hidden size={14} />
        </Button>
      )}
    </section>
  );
}
