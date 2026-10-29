'use client';
import {Switch} from '../components/Switch';
import {StatusBadge} from '../components/gv/StatusBadge';
import './SectionToggle.css';

export interface SectionToggleProps {
  /** The section's name ("Homepage banner"). */
  title: string;
  /** A short line about what the section shows. */
  description?: string;
  isSelected: boolean;
  onChange: (isSelected: boolean) => void;
  /** Sections that can't be turned off (the homepage banner) keep the switch on and off-limits. */
  isDisabled?: boolean;
}

/**
 * One page section in a builder's section list: the name and a line about it, whether it is shown on the page,
 * and the switch that shows or hides it. The real admin's section toggle on the homepage and custom pages.
 * Not in Figma yet.
 */
export function SectionToggle({title, description, isSelected, onChange, isDisabled}: SectionToggleProps) {
  return (
    <div className="gv-section-toggle">
      <span className="gv-section-toggle__text">
        <span className="gv-section-toggle__title">{title}</span>
        {description && <span className="gv-section-toggle__description">{description}</span>}
      </span>
      <StatusBadge state={isSelected ? 'live' : 'draft'}>{isSelected ? 'Shown on page' : 'Not shown on page'}</StatusBadge>
      <Switch aria-label={`Show ${title}`} isSelected={isSelected} onChange={onChange} isDisabled={isDisabled}>
        <span className="gv-section-toggle__switch-label">Show</span>
      </Switch>
    </div>
  );
}
