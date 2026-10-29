'use client';
import {useId, useState, type ReactNode} from 'react';
import {ToggleButton} from 'react-aria-components/ToggleButton';
import {Check} from 'lucide-react';
import {Switch} from '../components/Switch';
import clsx from 'clsx';
import type {PlacementProps} from '../components/className';
import {mergeLabels} from '../components/labels';
import './ViewOptionRow.css';

/** The words View option row says itself (docs/API.md rule 11). */
export interface ViewOptionRowLabels {
  /** The check's name on a view that can't be turned off. */
  alwaysEnabled: string;
  /** The default view's button, and the others'. */
  default: string;
  makeDefault: string;
}

/** View option row's English words; a page passes its own over them with `labels`. */
export const viewOptionRowLabels: ViewOptionRowLabels = {alwaysEnabled: 'Always enabled', default: 'Default', makeDefault: 'Make default'};

/** The words View option list says itself (docs/API.md rule 11). */
export interface ViewOptionListLabels {
  /** The group's name, when no `aria-label` is given. */
  views: string;
}

/** View option list's English words; a page passes its own over them with `labels`. */
export const viewOptionListLabels: ViewOptionListLabels = {views: 'Available views'};

export interface ViewOptionRowProps extends PlacementProps {
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
  /** Its own words (Default, Make default, the check's name), over `viewOptionRowLabels`. */
  labels?: Partial<ViewOptionRowLabels>;
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
  options,
  labels,
  className,
  style
}: ViewOptionRowProps) {
  const l = mergeLabels(viewOptionRowLabels, labels);
  const id = useId();
  const [inner, setInner] = useState(defaultSelected);
  const on = isAlwaysOn || (isSelected ?? inner);
  const set = (next: boolean) => {
    setInner(next);
    onChange?.(next);
  };
  return (
    <div className={clsx('gv-view-option', className)} style={style} data-off={!on || undefined}>
      {isAlwaysOn ? (
        <span className="gv-view-option__always" role="img" aria-label={l.alwaysEnabled}>
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
              {l.default}
            </>
          ) : (
            l.makeDefault
          )}
        </ToggleButton>
        {on && options != null && <div className="gv-view-option__options">{options}</div>}
      </div>
    </div>
  );
}

/** The views, one row each, a hairline between them (a phase's Available views card). */
export interface ViewOptionListProps extends PlacementProps {
  children: ReactNode;
  /** @default `labels.views` ("Available views") */
  'aria-label'?: string;
  /** Its own words, over `viewOptionListLabels`. */
  labels?: Partial<ViewOptionListLabels>;
}

export function ViewOptionList({
  children,
  'aria-label': ariaLabel,
  labels,
  className,
  style
}: ViewOptionListProps) {
  return (
    <div className={clsx('gv-view-option-list', className)} style={style} role="group"
      aria-label={ariaLabel ?? mergeLabels(viewOptionListLabels, labels).views}>
      {children}
    </div>
  );
}
