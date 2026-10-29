'use client';
import type {ReactNode} from 'react';
import {Button, Disclosure, DisclosurePanel, Heading} from 'react-aria-components';
import {ChevronDown, ChevronRight} from 'lucide-react';
import './SetupStep.css';

export interface SetupStepProps {
  /**
   * Figma "Action": Open leads somewhere else (chevron →); Expand opens the card in place (chevron ⌄).
   *
   * @default 'open'
   */
  action?: 'open' | 'expand';
  /** The step's name, e.g. "Settings" or "Set project card". */
  title: string;
  /** The step is done: the dashed circle becomes a filled check. */
  isDone?: boolean;
  /** Open: what pressing the card does. */
  onPress?: () => void;
  /** Expand: the content shown when the card is open. */
  children?: ReactNode;
  /** Expand: open on first render. */
  defaultExpanded?: boolean;
  isExpanded?: boolean;
  onExpandedChange?: (isExpanded: boolean) => void;
}

/* Figma's circle-dashed-1/16 and the prototype's PJP_CHK_OFF: a 14.5 ring, 1px, short round dashes (2.4 / 2).
   Done is the prototype's PJP_CHK: a filled 16 circle with a white tick. */
function Check({isDone}: {isDone?: boolean}) {
  return isDone ? (
    <svg className="gv-setup-card__check gv-setup-card__check--done" viewBox="0 0 16 16" width={16} height={16} aria-hidden="true">
      <circle className="gv-setup-card__check-fill" cx="8" cy="8" r="8" />
      <path
        className="gv-setup-card__check-tick"
        d="M4.8 8.2l2.1 2.1 4.3-4.4"
        fill="none"
        strokeWidth="1.6"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  ) : (
    <svg className="gv-setup-card__check" viewBox="0 0 16 16" width={16} height={16} aria-hidden="true">
      <circle cx="8" cy="8" r="7.25" fill="none" stroke="currentColor" strokeWidth="1" strokeDasharray="2.4 2" strokeLinecap="round" />
    </svg>
  );
}

/** A setup checklist step: a dashed circle until it's done, then a check. */
export function SetupStep({
  action = 'open',
  title,
  isDone,
  onPress,
  children,
  defaultExpanded,
  isExpanded,
  onExpandedChange
}: SetupStepProps) {
  if (action === 'open') {
    return (
      <div className="gv-setup-card" data-action="open" data-done={isDone || undefined}>
        <Button className="gv-setup-card__header" onPress={onPress}>
          <Check isDone={isDone} />
          <span className="gv-setup-card__title">{title}</span>
          {isDone && <span className="gv-setup-card__sr">(done)</span>}
          <span className="gv-setup-card__chevron" aria-hidden>
            <ChevronRight size={17} strokeWidth={2} />
          </span>
        </Button>
      </div>
    );
  }
  return (
    <Disclosure
      className="gv-setup-card"
      data-action="expand"
      data-done={isDone || undefined}
      defaultExpanded={defaultExpanded}
      isExpanded={isExpanded}
      onExpandedChange={onExpandedChange}>
      <Heading className="gv-setup-card__heading">
        <Button slot="trigger" className="gv-setup-card__header">
          <Check isDone={isDone} />
          <span className="gv-setup-card__title">{title}</span>
          {isDone && <span className="gv-setup-card__sr">(done)</span>}
          <span className="gv-setup-card__chevron" aria-hidden>
            <ChevronDown size={16} />
          </span>
        </Button>
      </Heading>
      <DisclosurePanel className="gv-setup-card__panel">
        <div className="gv-setup-card__body">{children}</div>
      </DisclosurePanel>
    </Disclosure>
  );
}
