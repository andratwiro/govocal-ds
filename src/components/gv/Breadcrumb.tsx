'use client';
import {
  Breadcrumbs as RACBreadcrumbs,
  Breadcrumb as RACBreadcrumb,
  Link,
  type BreadcrumbsProps
} from 'react-aria-components/Breadcrumbs';
import {ChevronRight, PanelLeft, ArrowLeft} from 'lucide-react';
import {IconButton} from './IconButton';
import {Status} from './Status';
import './Breadcrumb.css';

export interface BreadcrumbItem {
  key: string;
  label: string;
  href?: string;
  /** What pressing the crumb does, for a crumb that isn't a plain link (e.g. "back to the project"). */
  onPress?: () => void;
}

export interface BreadcrumbProps extends Omit<BreadcrumbsProps<object>, 'children'> {
  /** Figma `Level`: Project is the flat "Projects / Current" trail; Phase · Draft/Live adds the
   * phase-editor chrome (panel toggle, back arrow, divider, status pill). */
  level?: 'project' | 'phase';
  /** Only used when level="phase": the phase's live state, draws the trailing Status pill. */
  phaseState?: 'draft' | 'live';
  items: BreadcrumbItem[];
  /** Phase level only: handlers for the leading chrome buttons. */
  onTogglePanel?: () => void;
  onBack?: () => void;
  /** Phase level only: the panel toggle's accessible name. @default 'Toggle panel' */
  togglePanelLabel?: string;
  /** Phase level only: the back arrow's accessible name. @default 'Back' */
  backLabel?: string;
}

/**
 * Breadcrumb (Figma node 14:875, Level=Project/Phase·Draft/Phase·Live; prototype `.pj-bc`).
 * The phase levels lead with two ghost Icon buttons split by a divider and end with a Status pill,
 * as Figma's instances do. The last crumb is the current page (`aria-current="page"`).
 */
export function Breadcrumb({
  level = 'project',
  phaseState = 'draft',
  items,
  onTogglePanel,
  onBack,
  togglePanelLabel = 'Toggle panel',
  backLabel = 'Back',
  ...rest
}: BreadcrumbProps) {
  const last = items.length - 1;
  return (
    <div className="gv-breadcrumb" data-level={level}>
      {level === 'phase' && (
        <>
          <IconButton onPress={onTogglePanel} aria-label={togglePanelLabel}>
            <PanelLeft aria-hidden />
          </IconButton>
          <span className="gv-breadcrumb-divider" aria-hidden="true" />
          <IconButton onPress={onBack} aria-label={backLabel}>
            <ArrowLeft aria-hidden />
          </IconButton>
        </>
      )}
      <RACBreadcrumbs {...rest} className="gv-breadcrumb-trail">
        {items.map((item, i) => (
          <RACBreadcrumb key={item.key} className="gv-breadcrumb-crumb">
            <Link
              href={item.href}
              onPress={item.onPress}
              className={i === last ? 'gv-breadcrumb-current' : 'gv-breadcrumb-link'}>
              {item.label}
            </Link>
            {i !== last &&
              (level === 'project' ? (
                <ChevronRight size={16} aria-hidden="true" className="gv-breadcrumb-sep-icon" />
              ) : (
                <span className="gv-breadcrumb-sep-slash" aria-hidden="true">
                  /
                </span>
              ))}
          </RACBreadcrumb>
        ))}
      </RACBreadcrumbs>
      {level === 'phase' && <Status state={phaseState}>{phaseState === 'live' ? 'Live' : 'Draft'}</Status>}
    </div>
  );
}
