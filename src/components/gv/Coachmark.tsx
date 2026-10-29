import {
  OverlayArrow,
  Popover as AriaPopover,
  type PopoverProps as AriaPopoverProps
} from 'react-aria-components/Popover';
import type {RefObject} from 'react';
import './Coachmark.css';

export interface CoachmarkProps
  extends Omit<AriaPopoverProps, 'children' | 'className'> {
  /** The element the coachmark points at. */
  triggerRef: RefObject<Element | null>;
  title: string;
  children: React.ReactNode;
  /** Called when "Got it" is pressed. */
  onDismiss?: () => void;
  /** Called when "Skip" is pressed. */
  onSkip?: () => void;
}

/**
 * Tali's onboarding coachmark (augur-design.html #pj-coach / .pj-coach__bubble): a dark
 * popover with a tail, shown once per new PM, pointing at the UI it explains.
 */
export function Coachmark({
  title,
  children,
  onDismiss,
  onSkip,
  placement = 'right',
  ...props
}: CoachmarkProps) {
  return (
    <AriaPopover {...props} placement={placement} className="gv-coachmark">
      <OverlayArrow className="gv-coachmark__arrow">
        <svg width={13} height={13} viewBox="0 0 13 13">
          <rect width={13} height={13} />
        </svg>
      </OverlayArrow>
      <div className="gv-coachmark__hd">
        <div className="gv-coachmark__title">{title}</div>
        <button
          type="button"
          className="gv-coachmark__x"
          aria-label="Dismiss"
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
          Skip
        </button>
        <button
          type="button"
          className="gv-coachmark__got"
          onClick={() => {
            onDismiss?.();
          }}>
          Got it
        </button>
      </div>
    </AriaPopover>
  );
}
