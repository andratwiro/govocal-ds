'use client';
import {useState, type ReactNode} from 'react';
import {Button} from 'react-aria-components/Button';
import {Check, ChevronRight} from 'lucide-react';
import {NumberField} from '../components/NumberField';
import {Radio, RadioGroup} from '../components/RadioGroup';
import {Switch} from '../components/Switch';
import './ParticipantActionRow.css';

export interface ParticipantActionRowProps {
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
  options
}: ParticipantActionRowProps) {
  const [inner, setInner] = useState(defaultSelected);
  const on = isLocked || (isSelected ?? inner);
  return (
    <>
      <div className="gv-participant-action" data-off={!on || undefined}>
        {isLocked ? (
          <span className="gv-participant-action__lock" role="img" aria-label="Always on">
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
          <Button className="gv-participant-action__open" onPress={onOpen} aria-label={`Edit access for ${children}`}>
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

export interface ParticipantLimitProps {
  /** @default 'Number of likes per participant' */
  label?: string;
  /** @default 'Maximum likes' */
  maxLabel?: string;
  /** `limited` reveals the maximum. */
  defaultLimit?: 'unlimited' | 'limited';
  /** @default 5 */
  defaultMax?: number;
  onChange?: (limit: 'unlimited' | 'limited', max: number) => void;
}

/** How many reactions each participant has: Unlimited or Limited; Limited reveals the maximum. */
export function ParticipantLimit({
  label = 'Number of likes per participant',
  maxLabel = 'Maximum likes',
  defaultLimit = 'unlimited',
  defaultMax = 5,
  onChange
}: ParticipantLimitProps) {
  const [limit, setLimit] = useState(defaultLimit);
  const [max, setMax] = useState(defaultMax);
  return (
    <div className="gv-participant-limit">
      <RadioGroup
        label={label}
        orientation="horizontal"
        value={limit}
        onChange={next => {
          const l = next as 'unlimited' | 'limited';
          setLimit(l);
          onChange?.(l, max);
        }}>
        <Radio value="unlimited">Unlimited</Radio>
        <Radio value="limited">Limited</Radio>
      </RadioGroup>
      {limit === 'limited' && (
        <NumberField
          label={maxLabel}
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
export function ParticipantActionList({children, 'aria-label': ariaLabel = 'Participant actions'}: {children: ReactNode; 'aria-label'?: string}) {
  return (
    <div className="gv-participant-action-list" role="group" aria-label={ariaLabel}>
      {children}
    </div>
  );
}
