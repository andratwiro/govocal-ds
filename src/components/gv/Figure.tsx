'use client';
import {useId, type ReactNode} from 'react';
import clsx from 'clsx';
import type {PlacementProps} from '../className';
import {mergeLabels} from '../labels';
import './Figure.css';

/** The words Figure says itself (docs/API.md rule 11). */
export interface FigureLabels {
  /** The source line, given the source ("Source: Go Vocal, Tree planting by street"). */
  source: (source: string) => string;
}

/** Figure's English words; a page passes its own over them with `labels`. */
export const figureLabels: FigureLabels = {
  source: source => `Source: ${source}`
};

export interface FigureProps extends PlacementProps {
  /** The chart, table, quotes or map the figure shows. */
  children?: ReactNode;
  /**
   * The finding: one sentence that says what the figure shows ("Cycling leads in every district"), as a heading in
   * the document lead type. It names the figure for screen readers.
   */
  finding?: ReactNode;
  /** The finding's heading level. @default 3 */
  headingLevel?: 2 | 3 | 4 | 5 | 6;
  /** What is measured, under the finding ("Share of votes per route, 3,600 participants"). */
  measure?: ReactNode;
  /** A Chart legend, between the body and the foot. */
  legend?: ReactNode;
  /** What the figure leaves out, first in the foot ("Showing the top 5 of 12"). */
  truncation?: ReactNode;
  /** A note on the data, in the foot ("Participants could pick more than one route"). */
  note?: ReactNode;
  /** Where the data comes from, last in the foot, written through `labels.source`. */
  source?: string;
  /** The figure's name, when there is no `finding`. */
  'aria-label'?: string;
  /** Its own words, over `figureLabels`. */
  labels?: Partial<FigureLabels>;
}

/**
 * Figure: one finding from the data in a document, in one order: the finding, what is measured, the chart, its legend,
 * then one foot (what is left out, a note, the source). Use it around every chart, table, set of quotes or map on a
 * report's page, so they all read the same way. A chart on a dashboard is a Dashboard card; a single number is a
 * Stat tile.
 *
 * - The figure is a `figure` named by its finding; the foot is its caption.
 * - The finding is a heading (`headingLevel`), so a document's outline lists its findings.
 * - Every slot is optional; an empty foot is left out.
 *
 * `className` and `style` place it; they never paint it. Not in Figma.
 *
 * ```tsx
 * <Figure finding="Cycling leads in every district" measure="Share of votes per route"
 *   truncation="Showing the top 5 of 12" source="Go Vocal, Cycle lanes 2026">
 *   {routes.map(r => <BarRow key={r.id} label={r.name} percent={r.share} />)}
 * </Figure>
 * ```
 */
export function Figure({
  children, finding, headingLevel = 3, measure, legend, truncation, note, source, 'aria-label': ariaLabel, labels,
  className, style
}: FigureProps) {
  const l = mergeLabels(figureLabels, labels);
  const id = useId();
  const Heading = `h${headingLevel}` as const;
  const hasFoot = truncation != null || note != null || source != null;
  return (
    <figure className={clsx('gv-figure', className)} style={style}
      aria-labelledby={finding != null ? `${id}-finding` : undefined} aria-label={finding != null ? undefined : ariaLabel}>
      {(finding != null || measure != null) && (
        <div className="gv-figure__head">
          {finding != null && <Heading id={`${id}-finding`} className="gv-figure__finding">{finding}</Heading>}
          {measure != null && <p className="gv-figure__measure">{measure}</p>}
        </div>
      )}
      {children != null && <div className="gv-figure__body">{children}</div>}
      {legend != null && <div className="gv-figure__legend">{legend}</div>}
      {hasFoot && (
        <figcaption className="gv-figure__foot">
          {truncation != null && <span>{truncation}</span>}
          {note != null && <span>{note}</span>}
          {source != null && <span>{l.source(source)}</span>}
        </figcaption>
      )}
    </figure>
  );
}
