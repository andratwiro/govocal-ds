'use client';
import type {ReactNode} from 'react';
import {RadioField, RadioButton, type RadioFieldProps} from 'react-aria-components/RadioGroup';
import {CheckboxField, CheckboxButton, type CheckboxFieldProps} from 'react-aria-components/Checkbox';
import './ChoiceCard.css';

interface ChoiceCardBody {
  /**
   * An icon, or later an Illustration, above the title — room for the method picker's cards
   * (a Choice card + Illustration, once Illustration lands).
   */
  media?: ReactNode;
  /** The tile's title. */
  children: ReactNode;
  /** A grey line under the title. */
  description?: ReactNode;
  /** Content shown under the tile once it's chosen, e.g. Budget allocation's Min / Max fields. */
  revealed?: ReactNode;
}

function ChoiceMark({checkmark}: {checkmark?: ReactNode}) {
  return <span className="indicator">{checkmark}</span>;
}

const checkmark = (
  <svg viewBox="0 0 18 18" aria-hidden="true">
    <polyline points="2 9 7 14 16 4" />
  </svg>
);

export interface ChoiceCardProps extends Omit<RadioFieldProps, 'className' | 'children'>, ChoiceCardBody {}

/**
 * Choice card (Figma not yet drawn; the prototype's `.pj-repopt`): a bordered, selectable tile —
 * one component for radio tiles (inside a RadioGroup) and checkbox tiles (`ChoiceCardCheckbox`,
 * inside a CheckboxGroup). Selected = a 2px primary border, drawn as an inset ring so the tile
 * never shifts. `revealed` opens under the tile only while it's chosen (Budget allocation → Min/Max).
 */
export function ChoiceCard({media, children, description, revealed, ...props}: ChoiceCardProps) {
  return (
    <RadioField {...props} className="gv-choice-card">
      {({isSelected}) => (
        <>
          <RadioButton className="gv-choice-card__button gv-choice-card__button--radio">
            <ChoiceMark />
            <span className="gv-choice-card__text">
              {media && <span className="gv-choice-card__media">{media}</span>}
              <span className="gv-choice-card__title">{children}</span>
              {description && <span className="gv-choice-card__description">{description}</span>}
            </span>
          </RadioButton>
          {revealed && isSelected && <div className="gv-choice-card__revealed">{revealed}</div>}
        </>
      )}
    </RadioField>
  );
}

export interface ChoiceCardCheckboxProps
  extends Omit<CheckboxFieldProps, 'className' | 'children'>,
    ChoiceCardBody {}

/** The checkbox tile (the prototype's `.pj-pick`): a Choice card built on Checkbox, for a CheckboxGroup. */
export function ChoiceCardCheckbox({media, children, description, revealed, ...props}: ChoiceCardCheckboxProps) {
  return (
    <CheckboxField {...props} className="gv-choice-card">
      {({isSelected}) => (
        <>
          <CheckboxButton className="gv-choice-card__button gv-choice-card__button--checkbox">
            <ChoiceMark checkmark={checkmark} />
            <span className="gv-choice-card__text">
              {media && <span className="gv-choice-card__media">{media}</span>}
              <span className="gv-choice-card__title">{children}</span>
              {description && <span className="gv-choice-card__description">{description}</span>}
            </span>
          </CheckboxButton>
          {revealed && isSelected && <div className="gv-choice-card__revealed">{revealed}</div>}
        </>
      )}
    </CheckboxField>
  );
}

/**
 * A plain heading above a group of choice cards ("Project context", "Phases" in the Create report
 * checklist). Not Section label: that pattern moves up only once `pk-project` lands.
 */
export function ChoiceCardGroupHeading({children}: {children: ReactNode}) {
  return <div className="gv-choice-card-group-heading">{children}</div>;
}
