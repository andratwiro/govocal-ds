'use client';
import {Switch} from '../components/Switch';
import {StatusBadge} from '../components/gv/StatusBadge';
import clsx from 'clsx';
import type {PlacementProps} from '../components/className';
import {mergeLabels} from '../components/labels';
import './SectionToggle.css';

/** The words Section toggle says itself (docs/API.md rule 11). */
export interface SectionToggleLabels {
  /** The status badge, on and off. */
  shown: string;
  hidden: string;
  /** The switch's visible word. */
  show: string;
  /** The switch's name, given the section's title. */
  showTitle: (title: string) => string;
}

/** Section toggle's English words; a page passes its own over them with `labels`. */
export const sectionToggleLabels: SectionToggleLabels = {
  shown: 'Shown on page',
  hidden: 'Not shown on page',
  show: 'Show',
  showTitle: title => `Show ${title}`
};

export interface SectionToggleProps extends PlacementProps {
  /** The section's name ("Homepage banner"). */
  title: string;
  /** A short line about what the section shows. */
  description?: string;
  isSelected: boolean;
  onChange: (isSelected: boolean) => void;
  /** Sections that can't be turned off (the homepage banner) keep the switch on and off-limits. */
  isDisabled?: boolean;
  /** Its own words (the status badge, the switch's), over `sectionToggleLabels`. */
  labels?: Partial<SectionToggleLabels>;
}

/**
 * One page section in a builder's section list: the name and a line about it, whether it is shown on the page,
 * and the switch that shows or hides it. The real admin's section toggle on the homepage and custom pages.
 * Not in Figma yet.
 */
export function SectionToggle({title, description, isSelected, onChange, isDisabled, labels, className, style}: SectionToggleProps) {
  const l = mergeLabels(sectionToggleLabels, labels);
  return (
    <div className={clsx('gv-section-toggle', className)} style={style}>
      <span className="gv-section-toggle__text">
        <span className="gv-section-toggle__title">{title}</span>
        {description && <span className="gv-section-toggle__description">{description}</span>}
      </span>
      <StatusBadge status={isSelected ? 'live' : 'draft'}>{isSelected ? l.shown : l.hidden}</StatusBadge>
      <Switch aria-label={l.showTitle(title)} isSelected={isSelected} onChange={onChange} isDisabled={isDisabled}>
        <span className="gv-section-toggle__switch-label">{l.show}</span>
      </Switch>
    </div>
  );
}
