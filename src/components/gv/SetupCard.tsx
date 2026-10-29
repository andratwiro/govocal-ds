'use client';
import type {ReactNode} from 'react';
import {Button, Disclosure, DisclosurePanel, Heading} from 'react-aria-components';
import {ChevronDown, ChevronRight, CircleCheck, CircleDashed} from 'lucide-react';
import './SetupCard.css';

export interface SetupCardProps {
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

function Check({isDone}: {isDone?: boolean}) {
  return isDone ? (
    <CircleCheck className="gv-setup-card__check gv-setup-card__check--done" aria-hidden size={16} />
  ) : (
    <CircleDashed className="gv-setup-card__check" aria-hidden size={16} strokeWidth={1.25} />
  );
}

/** A setup checklist step: a dashed circle until it's done, then a check. */
export function SetupCard({
  action = 'open',
  title,
  isDone,
  onPress,
  children,
  defaultExpanded,
  isExpanded,
  onExpandedChange
}: SetupCardProps) {
  if (action === 'open') {
    return (
      <div className="gv-setup-card" data-action="open" data-done={isDone || undefined}>
        <Button className="gv-setup-card__header" onPress={onPress}>
          <Check isDone={isDone} />
          <span className="gv-setup-card__title">{title}</span>
          {isDone && <span className="gv-setup-card__sr">(done)</span>}
          <span className="gv-setup-card__chevron" aria-hidden>
            <ChevronRight size={16} strokeWidth={1.4} />
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
