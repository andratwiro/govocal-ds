'use client';
import type {ReactNode} from 'react';
import {RadioField, RadioButton, type RadioFieldProps} from 'react-aria-components/RadioGroup';
import {CheckboxField, CheckboxButton, type CheckboxFieldProps} from 'react-aria-components/Checkbox';
import {SectionLabel} from './SectionLabel';
import clsx from 'clsx';
import type {PlacementProps} from '../className';
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

export interface ChoiceCardProps extends Omit<RadioFieldProps, 'className' | 'style' | 'children'>, ChoiceCardBody, PlacementProps {}

/**
 * Choice card (Figma not yet drawn; the prototype's `.pj-repopt`): a bordered, selectable tile —
 * one component for radio tiles (inside a RadioGroup) and checkbox tiles (`ChoiceCardCheckbox`,
 * inside a CheckboxGroup). Selected = a 2px primary border, drawn as an inset ring so the tile
 * never shifts. `revealed` opens under the tile only while it's chosen (Budget allocation → Min/Max).
 */
export function ChoiceCard({media, children, description, revealed, className, style, ...props}: ChoiceCardProps) {
  return (
    <RadioField {...props} className={clsx('gv-choice-card', className)} style={style}>
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
  extends Omit<CheckboxFieldProps, 'className' | 'style' | 'children'>,
    ChoiceCardBody, PlacementProps {}

/** The checkbox tile (the prototype's `.pj-pick`): a Choice card built on Checkbox, for a CheckboxGroup. */
export function ChoiceCardCheckbox({media, children, description, revealed, className, style, ...props}: ChoiceCardCheckboxProps) {
  return (
    <CheckboxField {...props} className={clsx('gv-choice-card', className)} style={style}>
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
 * The label above a group of choice cards ("Project context", "Phases" in the Create report checklist): a Section label,
 * sentence case.
 */
export interface ChoiceCardGroupHeadingProps extends PlacementProps {children: ReactNode}

export function ChoiceCardGroupHeading({children, className, style}: ChoiceCardGroupHeadingProps) {
  return <SectionLabel className={className} style={style}>{children}</SectionLabel>;
}
