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
  /**
   * `default`: the flat "Projects › Current" trail (Figma `Level=Project`). `editor`: an editor's chrome around a
   * slashed trail, a panel toggle, a back arrow and the trailing Status badge (Figma `Level=Phase · Draft/Live`).
   *
   * @default 'default'
   */
  variant?: 'default' | 'editor';
  /** `editor` only: what the trailing Status badge says. @default 'draft' */
  status?: 'draft' | 'live';
  items: BreadcrumbItem[];
  /** `editor` only: handlers for the leading chrome buttons. */
  onTogglePanel?: () => void;
  onBack?: () => void;
  /** `editor` only: the panel toggle's accessible name. @default 'Toggle panel' */
  togglePanelLabel?: string;
  /** `editor` only: the back arrow's accessible name. @default 'Back' */
  backLabel?: string;
}

/**
 * Breadcrumbs (Figma node 14:875, Level=Project/Phase·Draft/Phase·Live; prototype `.pj-bc`).
 * The phase levels lead with two ghost Icon buttons split by a divider and end with a Status badge,
 * as Figma's instances do. The last crumb is the current page (`aria-current="page"`).
 */
export function Breadcrumbs({
  variant = 'default',
  status = 'draft',
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
    <div className={clsx('gv-breadcrumb', className)} style={style} data-variant={variant}>
      {variant === 'editor' && (
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
              (variant === 'default' ? (
                <ChevronRight size={16} aria-hidden="true" className="gv-breadcrumb-sep-icon" />
              ) : (
                <span className="gv-breadcrumb-sep-slash" aria-hidden="true">
                  /
                </span>
              ))}
          </RACBreadcrumb>
        ))}
      </RACBreadcrumbs>
      {variant === 'editor' && <StatusBadge status={status}>{status === 'live' ? 'Live' : 'Draft'}</StatusBadge>}
    </div>
  );
}
