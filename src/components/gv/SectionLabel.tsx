'use client';
import type {ReactNode} from 'react';
import {Heading} from 'react-aria-components/Heading';
import clsx from 'clsx';
import type {PlacementProps} from '../className';
import './SectionLabel.css';

export interface SectionLabelProps extends PlacementProps {
  /** The label, in sentence case ("Timeline", "Who is voting", "Project context"). */
  children: ReactNode;
  /**
   * Makes the label a real heading at this level, for a label that opens a section a screen reader should be able to
   * jump to ("Who can participate" in Access rights). Without it the label is plain text: the rail's "Timeline" names
   * a list that already has its own name.
   */
  level?: 1 | 2 | 3 | 4 | 5 | 6;
  /** A 16 icon before the words (Access rights' "Who can participate"). */
  icon?: ReactNode;
}

/**
 * A quiet label over a group of rows: the rail's Timeline / Spotlight / Events, Insights' "Who is voting", the Create
 * report checklist's "Project context" (Figma "Rail section label", 4:442: a 32 row in Small, quiet grey). Sentence
 * case everywhere, never uppercase tracked (docs/DECISIONS.md).
 */
export function SectionLabel({children, level, icon, className, style}: SectionLabelProps) {
  const body = (
    <>
      {icon != null && (
        <span className="gv-section-label__icon" aria-hidden>
          {icon}
        </span>
      )}
      {children}
    </>
  );
  return level ? (
    <Heading level={level} className={clsx('gv-section-label', className)} style={style}>
      {body}
    </Heading>
  ) : (
    <div className={clsx('gv-section-label', className)} style={style}>{body}</div>
  );
}
