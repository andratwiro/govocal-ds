'use client';
import {
  Breadcrumbs as RACBreadcrumbs,
  Breadcrumb as RACBreadcrumb,
  Link,
  type BreadcrumbsProps,
  type LinkProps
} from 'react-aria-components/Breadcrumbs';
import {Button as RACButton} from 'react-aria-components/Button';
import {ChevronRight, PanelLeft, ArrowLeft} from 'lucide-react';
import type {ReactNode} from 'react';
import './Breadcrumb.css';

export interface BreadcrumbItem {
  key: string;
  label: string;
  href?: string;
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
}

/**
 * Tali's Breadcrumb (Figma node 14:875, Level=Project/Phase·Draft/Phase·Live; prototype `.pj-bc`).
 * The phase levels' icon buttons and status pill are plain RAC Button / span here (G1's IconButton
 * and Status exports are the real primitives — swap in once merged).
 */
export function Breadcrumb({level = 'project', phaseState = 'draft', items, onTogglePanel, onBack}: BreadcrumbProps) {
  const last = items.length - 1;
  return (
    <div className="gv-breadcrumb" data-level={level}>
      {level === 'phase' && (
        <>
          <RACButton className="gv-breadcrumb-icon-btn" onPress={onTogglePanel} aria-label="Toggle panel">
            <PanelLeft size={16} aria-hidden="true" />
          </RACButton>
          <span className="gv-breadcrumb-divider" aria-hidden="true" />
          <RACButton className="gv-breadcrumb-icon-btn" onPress={onBack} aria-label="Back">
            <ArrowLeft size={16} aria-hidden="true" />
          </RACButton>
        </>
      )}
      <RACBreadcrumbs className="gv-breadcrumb-trail">
        {items.map((item, i) => (
          <RACBreadcrumb key={item.key} className="gv-breadcrumb-crumb">
            {i === last ? (
              <span className="gv-breadcrumb-current" data-level={level}>
                {item.label}
              </span>
            ) : (
              <>
                <Link href={item.href} className="gv-breadcrumb-link">
                  {item.label}
                </Link>
                {level === 'project' ? (
                  <ChevronRight size={14} aria-hidden="true" className="gv-breadcrumb-sep-icon" />
                ) : (
                  <span className="gv-breadcrumb-sep-slash" aria-hidden="true">
                    /
                  </span>
                )}
              </>
            )}
          </RACBreadcrumb>
        ))}
      </RACBreadcrumbs>
      {level === 'phase' && (
        <span className="gv-breadcrumb-status" data-state={phaseState}>
          {phaseState === 'live' ? 'Live' : 'Draft'}
        </span>
      )}
    </div>
  );
}
