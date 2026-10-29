import {
  OverlayArrow,
  Popover as AriaPopover,
  type PopoverProps as AriaPopoverProps
} from 'react-aria-components/Popover';
import type {RefObject} from 'react';
import {mergeLabels} from '../labels';
import './Coachmark.css';

/** The words Coachmark says itself (docs/API.md rule 11). */
export interface CoachmarkLabels {
  /** The ×'s name. */
  dismiss: string;
  /** The Skip button's name. */
  skip: string;
  /** The Got it button's name. */
  gotIt: string;
}

/** Coachmark's English words; a page passes its own over them with `labels`. */
export const coachmarkLabels: CoachmarkLabels = {dismiss: 'Dismiss', skip: 'Skip', gotIt: 'Got it'};

export interface CoachmarkProps
  extends Omit<AriaPopoverProps, 'children' | 'className' | 'style'> {
  /** The element the coachmark points at. */
  triggerRef: RefObject<Element | null>;
  /** The bold line at the top. */
  title: string;
  /** What the coachmark explains. */
  children: React.ReactNode;
  /** Called when "Got it" is pressed. */
  onDismiss?: () => void;
  /** Called when "Skip" is pressed. */
  onSkip?: () => void;
  /** Its own words (×, Skip, Got it), over `coachmarkLabels`. */
  labels?: Partial<CoachmarkLabels>;
}

/**
 * A dark onboarding bubble with a tail that points at one control and explains it once, with Skip and Got it. Not in
 * Figma: from the prototype (augur-design.html #pj-coach / .pj-coach__bubble), shown once per new PM. Got it calls
 * `onDismiss`, Skip calls `onSkip`, the × calls both; a short hint that comes back on demand is a Help popover.
 */
export function Coachmark({
  title,
  children,
  onDismiss,
  onSkip,
  placement = 'right',
  labels,
  ...props
}: CoachmarkProps) {
  const l = mergeLabels(coachmarkLabels, labels);
  return (
    <AriaPopover {...props} placement={placement} className="gv-coachmark">
      <OverlayArrow className="gv-coachmark__arrow">
        <svg width={13} height={13} viewBox="0 0 13 13">
          <rect width={13} height={13} rx={2} />
        </svg>
      </OverlayArrow>
      <div className="gv-coachmark__hd">
        <div className="gv-coachmark__title">{title}</div>
        <button
          type="button"
          className="gv-coachmark__x"
          aria-label={l.dismiss}
          onClick={() => {
            onSkip?.();
            onDismiss?.();
          }}>
          <svg
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth={2}
            strokeLinecap="round"
            strokeLinejoin="round"
            width={15}
            height={15}
            aria-hidden="true">
            <line x1="18" y1="6" x2="6" y2="18" />
            <line x1="6" y1="6" x2="18" y2="18" />
          </svg>
        </button>
      </div>
      <div className="gv-coachmark__body">{children}</div>
      <div className="gv-coachmark__acts">
        <button
          type="button"
          className="gv-coachmark__skip"
          onClick={() => {
            onSkip?.();
          }}>
          {l.skip}
        </button>
        <button
          type="button"
          className="gv-coachmark__got"
          onClick={() => {
            onDismiss?.();
          }}>
          {l.gotIt}
        </button>
      </div>
    </AriaPopover>
  );
}
