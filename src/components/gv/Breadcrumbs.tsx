'use client';
import {
  Breadcrumbs as RACBreadcrumbs,
  Breadcrumb as RACBreadcrumb,
  Link,
  type BreadcrumbsProps as RACBreadcrumbsProps
} from 'react-aria-components/Breadcrumbs';
import {ChevronRight, PanelLeft, ArrowLeft} from 'lucide-react';
import {IconButton} from './IconButton';
import {StatusBadge} from './StatusBadge';
import clsx from 'clsx';
import type {PlacementProps} from '../className';
import './Breadcrumbs.css';

export interface BreadcrumbItem {
  key: string;
  label: string;
  href?: string;
  /** What pressing the crumb does, for a crumb that isn't a plain link (e.g. "back to the project"). */
  onPress?: () => void;
}

export interface BreadcrumbsProps extends Omit<RACBreadcrumbsProps<object>, 'children'>, PlacementProps {
  /** Figma `Level`: Project is the flat "Projects / Current" trail; Phase · Draft/Live adds the
   * phase-editor chrome (panel toggle, back arrow, divider, status pill). */
  level?: 'project' | 'phase';
  /** Only used when level="phase": the phase's live state, draws the trailing Status badge. */
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
 * Breadcrumbs (Figma node 14:875, Level=Project/Phase·Draft/Phase·Live; prototype `.pj-bc`).
 * The phase levels lead with two ghost Icon buttons split by a divider and end with a Status badge,
 * as Figma's instances do. The last crumb is the current page (`aria-current="page"`).
 */
export function Breadcrumbs({
  level = 'project',
  phaseState = 'draft',
  items,
  onTogglePanel,
  onBack,
  togglePanelLabel = 'Toggle panel',
  backLabel = 'Back',
  className,
  style,
  ...rest
}: BreadcrumbsProps) {
  const last = items.length - 1;
  return (
    <div className={clsx('gv-breadcrumb', className)} style={style} data-level={level}>
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
      {level === 'phase' && <StatusBadge state={phaseState}>{phaseState === 'live' ? 'Live' : 'Draft'}</StatusBadge>}
    </div>
  );
}
