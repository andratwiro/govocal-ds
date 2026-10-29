'use client';
import {useId, useState, type ReactNode} from 'react';
import {ToggleButton} from 'react-aria-components/ToggleButton';
import {Check} from 'lucide-react';
import {Switch} from '../components/Switch';
import './ViewOptionRow.css';

export interface ViewOptionRowProps {
  /** The view ("List view", "Map view", "Perspectives view"). */
  children: string;
  /** What it shows and what it is best for; may hold links ("Make sure you add a location field to the Idea form"). */
  description?: ReactNode;
  /** A view the phase can't turn off (List view): a check where the switch would be. */
  isAlwaysOn?: boolean;
  /** The view is on (controlled). */
  isSelected?: boolean;
  /** @default false */
  defaultSelected?: boolean;
  onChange?: (isSelected: boolean) => void;
  /** The view participants land on. One view is the default; its button reads "Default" (pressed). */
  isDefault?: boolean;
  /** "Make default". Making a view that is off the default also turns it on. */
  onMakeDefault?: () => void;
  /** What the view needs while it is on, under its words (Map view's Configure map). */
  options?: ReactNode;
}

/**
 * One view in a phase's Available views card (prototype `.imv-vr`): a switch (or a check for the view that is always
 * on), the view's name and words, and Make default. Not in Figma.
 */
export function ViewOptionRow({
  children,
  description,
  isAlwaysOn = false,
  isSelected,
  defaultSelected = false,
  onChange,
  isDefault = false,
  onMakeDefault,
  options
}: ViewOptionRowProps) {
  const id = useId();
  const [inner, setInner] = useState(defaultSelected);
  const on = isAlwaysOn || (isSelected ?? inner);
  const set = (next: boolean) => {
    setInner(next);
    onChange?.(next);
  };
  return (
    <div className="gv-view-option" data-off={!on || undefined}>
      {isAlwaysOn ? (
        <span className="gv-view-option__always" role="img" aria-label="Always enabled">
          <Check aria-hidden size={16} />
        </span>
      ) : (
        <Switch aria-label={children} isSelected={on} onChange={set}>
          {null}
        </Switch>
      )}
      <div className="gv-view-option__text">
        <span className="gv-view-option__name" id={`${id}-name`}>
          {children}
        </span>
        {description != null && <p className="gv-view-option__description">{description}</p>}
        {/* Default stays focusable (pressed; a press does nothing) instead of disabled, so making a view the default
            keeps focus where it was. Its name is its words and the view's ("Make default Map view"). */}
        <ToggleButton
          id={id}
          className="gv-view-option__default"
          isSelected={isDefault}
          aria-labelledby={`${id} ${id}-name`}
          onChange={() => {
            if (isDefault) return;
            if (!on) set(true);
            onMakeDefault?.();
          }}>
          {isDefault ? (
            <>
              <Check aria-hidden size={16} />
              Default
            </>
          ) : (
            'Make default'
          )}
        </ToggleButton>
        {on && options != null && <div className="gv-view-option__options">{options}</div>}
      </div>
    </div>
  );
}

/** The views, one row each, a hairline between them (a phase's Available views card). */
export function ViewOptionList({
  children,
  'aria-label': ariaLabel = 'Available views'
}: {
  children: ReactNode;
  'aria-label'?: string;
}) {
  return (
    <div className="gv-view-option-list" role="group" aria-label={ariaLabel}>
      {children}
    </div>
  );
}
