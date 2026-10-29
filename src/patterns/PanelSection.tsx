'use client';
import type {ReactNode} from 'react';
import {Button} from 'react-aria-components/Button';
import {Heading} from 'react-aria-components/Heading';
// React Aria's own Disclosure: the starter's paints its header and panel (its chevron first; the prototype's sits at
// the end), so the trigger and the panel are this section's.
import {Disclosure, DisclosurePanel} from 'react-aria-components/Disclosure';
import {ChevronDown} from 'lucide-react';
import clsx from 'clsx';
import type {PlacementProps} from '../components/className';
import './PanelSection.css';

export interface PanelSectionProps extends PlacementProps {
  /** The section's name ("Next actions"). */
  title: string;
  /** A short note at the end of the header ("0 of 6 ready"). Not shown when `isCollapsible`. */
  aside?: ReactNode;
  /** Folds under its header, with a chevron at the end (prototype "Project details"). */
  isCollapsible?: boolean;
  defaultExpanded?: boolean;
  /** Heading level of the title. @default 3 */
  level?: 2 | 3 | 4;
  children: ReactNode;
}

/**
 * A section of a side panel (prototype `.pj-psec`): a small strong title, its body 16 below. Collapsible sections
 * fold with a chevron at the end of the header. Not in Figma yet.
 */
export function PanelSection({title, aside, isCollapsible, defaultExpanded, level = 3, children, className, style}: PanelSectionProps) {
  if (isCollapsible) {
    return (
      <Disclosure className={clsx('gv-panel-section', className)} style={style} data-collapsible defaultExpanded={defaultExpanded}>
        <Heading level={level} className="gv-panel-section__heading">
          <Button slot="trigger" className="gv-panel-section__trigger">
            <span className="gv-panel-section__title">{title}</span>
            <ChevronDown className="gv-panel-section__chevron" aria-hidden size={16} />
          </Button>
        </Heading>
        <DisclosurePanel className="gv-panel-section__panel">
          <div className="gv-panel-section__body">{children}</div>
        </DisclosurePanel>
      </Disclosure>
    );
  }
  const H = `h${level}` as const;
  return (
    <section className={clsx('gv-panel-section', className)} style={style}>
      <div className="gv-panel-section__header">
        <H className="gv-panel-section__heading gv-panel-section__title">{title}</H>
        {aside != null && <span className="gv-panel-section__aside">{aside}</span>}
      </div>
      <div className="gv-panel-section__body">{children}</div>
    </section>
  );
}
