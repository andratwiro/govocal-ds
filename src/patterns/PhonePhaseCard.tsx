import type {ReactNode} from 'react';
import clsx from 'clsx';
import type {PlacementProps} from '../components/className';
import {useNumberFormatter} from '../components/format';
import {mergeLabels} from '../components/labels';
import './PhonePhaseCard.css';

/** The words Phone phase card says itself (docs/API.md rule 11). */
export interface PhonePhaseCardLabels {
  /** The number before the title, given the phase's number already formatted ("3" → "3."). */
  number: (n: string) => string;
}

/** Phone phase card's English words; a page passes its own over them with `labels`. */
export const phonePhaseCardLabels: PhonePhaseCardLabels = {number: n => `${n}.`};

export interface PhonePhaseCardProps extends PlacementProps {
  /** The phase's place in the timeline, from 1: it leads the title ("3. Shortlist proposals"). */
  number?: number;
  /** The phase's name as residents read it. */
  title: string;
  /** The phase's dates, already formatted ("28 Sep 2026 – 18 Oct 2026"). */
  dates?: ReactNode;
  /** What follows: the phase's description, or skeleton lines while it has none. */
  children?: ReactNode;
  /**
   * The heading's level inside the phone's page.
   *
   * @default 2
   */
  headingLevel?: 2 | 3 | 4;
  /** Its own words (how the number is written), over `phonePhaseCardLabels`. */
  labels?: Partial<PhonePhaseCardLabels>;
}

/**
 * The top of a phase's page in the front-office preview (the prototype's phase card inside `#phone`): a white card
 * with the numbered phase title in the phase colour, its dates and a body. It sits first on every phase's phone, on
 * the `grey` screen. Not in Figma.
 */
export function PhonePhaseCard({number, title, dates, children, headingLevel = 2, labels, className, style}: PhonePhaseCardProps) {
  const Heading = `h${headingLevel}` as const;
  const format = useNumberFormatter();
  return (
    <div className={clsx('gv-phone-phase-card', className)} style={style}>
      <Heading className="gv-phone-phase-card__title">
        {number != null && (
          <span className="gv-phone-phase-card__number">{mergeLabels(phonePhaseCardLabels, labels).number(format.format(number))} </span>
        )}
        {title}
      </Heading>
      {dates != null && <p className="gv-phone-phase-card__dates">{dates}</p>}
      {children != null && <div className="gv-phone-phase-card__body">{children}</div>}
    </div>
  );
}
