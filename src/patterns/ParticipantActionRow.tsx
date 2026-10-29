'use client';
import {useState, type ReactNode} from 'react';
import {Button} from 'react-aria-components/Button';
import {Check, ChevronRight} from 'lucide-react';
import {NumberField} from '../components/NumberField';
import {Radio, RadioGroup} from '../components/RadioGroup';
import {Switch} from '../components/Switch';
import clsx from 'clsx';
import type {PlacementProps} from '../components/className';
import {mergeLabels} from '../components/labels';
import './ParticipantActionRow.css';

/** The words Participant action row says itself (docs/API.md rule 11). */
export interface ParticipantActionRowLabels {
  /** The check's name on an action the phase can't turn off. */
  alwaysOn: string;
  /** The row's button name, given the action. */
  edit: (action: string) => string;
}

/** Participant action row's English words; a page passes its own over them with `labels`. */
export const participantActionRowLabels: ParticipantActionRowLabels = {
  alwaysOn: 'Always on',
  edit: action => `Edit access for ${action}`
};

/** The words Participant limit says itself (docs/API.md rule 11). */
export interface ParticipantLimitLabels {
  /** The choice's label, when no `label` is given. */
  limit: string;
  unlimited: string;
  limited: string;
  /** The maximum's label. */
  max: string;
}

/** Participant limit's English words; a page passes its own over them with `labels`. */
export const participantLimitLabels: ParticipantLimitLabels = {
  limit: 'Number of likes per participant',
  unlimited: 'Unlimited',
  limited: 'Limited',
  max: 'Maximum likes'
};

/** The words Participant action list says itself (docs/API.md rule 11). */
export interface ParticipantActionListLabels {
  /** The group's name, when no `aria-label` is given. */
  actions: string;
}

/** Participant action list's English words; a page passes its own over them with `labels`. */
export const participantActionListLabels: ParticipantActionListLabels = {actions: 'Participant actions'};

/** `className` and `style` place the row (not its options under it); they never paint it. */
export interface ParticipantActionRowProps extends PlacementProps {
  /** The action ("Submitting inputs", "Reacting to inputs", "Attending an event"). */
  children: string;
  /** Who can take it, shown at the end while it is on ("Sign-in required", "Anyone can participate"). */
  value?: string;
  /**
   * The value is the platform's default (grey) rather than set for this phase (dark). The words say which, so the
   * colour never has to.
   *
   * @default true
   */
  isDefault?: boolean;
  /** An action the phase can't turn off (Attending an event; voting in a voting phase): a check in place of the switch. */
  isLocked?: boolean;
  /** The action is on (controlled). */
  isSelected?: boolean;
  /** @default true */
  defaultSelected?: boolean;
  onChange?: (isSelected: boolean) => void;
  /** Opens who can take it (Access rights). Without it the row is a plain switch and label (Disliking). */
  onOpen?: () => void;
  /** Settings that hang from the action while it is on (Reacting's likes per participant), in the label column. */
  options?: ReactNode;
  /** Its own words (the check's and the button's names), over `participantActionRowLabels`. */
  labels?: Partial<ParticipantActionRowLabels>;
}

/**
 * One action in a phase's Participant actions card (prototype `.pjacc2`): a switch, the action, and who can take it
 * with a chevron to Access rights. Off, the label greys and there is no value or chevron: who can do something nobody
 * can do isn't set. Not in Figma.
 */
export function ParticipantActionRow({
  children,
  value,
  isDefault = true,
  isLocked = false,
  isSelected,
  defaultSelected = true,
  onChange,
  onOpen,
  options,
  labels,
  className,
  style
}: ParticipantActionRowProps) {
  const l = mergeLabels(participantActionRowLabels, labels);
  const [inner, setInner] = useState(defaultSelected);
  const on = isLocked || (isSelected ?? inner);
  return (
    <>
      <div className={clsx('gv-participant-action', className)} style={style} data-off={!on || undefined}>
        {isLocked ? (
          <span className="gv-participant-action__lock" role="img" aria-label={l.alwaysOn}>
            <Check aria-hidden size={16} />
          </span>
        ) : (
          <Switch
            aria-label={children}
            isSelected={on}
            onChange={next => {
              setInner(next);
              onChange?.(next);
            }}>
            {null}
          </Switch>
        )}
        {on && onOpen ? (
          <Button className="gv-participant-action__open" onPress={onOpen} aria-label={l.edit(children)}>
            <span className="gv-participant-action__label">{children}</span>
            {value != null && (
              <span className="gv-participant-action__value" data-default={isDefault || undefined}>
                {value}
              </span>
            )}
            <ChevronRight className="gv-participant-action__chevron" aria-hidden size={16} />
          </Button>
        ) : (
          <span className="gv-participant-action__label gv-participant-action__label--plain">{children}</span>
        )}
      </div>
      {on && options != null && <div className="gv-participant-action__options">{options}</div>}
    </>
  );
}

export interface ParticipantLimitProps extends PlacementProps {
  /** @default `labels.limit` ("Number of likes per participant") */
  label?: string;
  /** `limited` reveals the maximum. */
  defaultLimit?: 'unlimited' | 'limited';
  /** @default 5 */
  defaultMax?: number;
  onChange?: (limit: 'unlimited' | 'limited', max: number) => void;
  /** Its own words (the choices, the maximum's label), over `participantLimitLabels`. */
  labels?: Partial<ParticipantLimitLabels>;
}

/** How many reactions each participant has: Unlimited or Limited; Limited reveals the maximum. */
export function ParticipantLimit({
  label,
  defaultLimit = 'unlimited',
  defaultMax = 5,
  onChange,
  labels,
  className,
  style
}: ParticipantLimitProps) {
  const words = mergeLabels(participantLimitLabels, labels);
  const [limit, setLimit] = useState(defaultLimit);
  const [max, setMax] = useState(defaultMax);
  return (
    <div className={clsx('gv-participant-limit', className)} style={style}>
      <RadioGroup
        label={label ?? words.limit}
        orientation="horizontal"
        value={limit}
        onChange={next => {
          const l = next as 'unlimited' | 'limited';
          setLimit(l);
          onChange?.(l, max);
        }}>
        <Radio value="unlimited">{words.unlimited}</Radio>
        <Radio value="limited">{words.limited}</Radio>
      </RadioGroup>
      {limit === 'limited' && (
        <NumberField
          label={words.max}
          labelPosition="side"
          minValue={1}
          value={max}
          onChange={next => {
            setMax(next);
            onChange?.(limit, next);
          }}
        />
      )}
    </div>
  );
}

/** The actions, one row each (a phase's Participant actions card). */
export interface ParticipantActionListProps extends PlacementProps {
  children: ReactNode;
  /** @default `labels.actions` ("Participant actions") */
  'aria-label'?: string;
  /** Its own words, over `participantActionListLabels`. */
  labels?: Partial<ParticipantActionListLabels>;
}

export function ParticipantActionList({children, 'aria-label': ariaLabel, labels, className, style}: ParticipantActionListProps) {
  return (
    <div className={clsx('gv-participant-action-list', className)} style={style} role="group"
      aria-label={ariaLabel ?? mergeLabels(participantActionListLabels, labels).actions}>
      {children}
    </div>
  );
}
