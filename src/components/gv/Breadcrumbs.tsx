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
import {mergeLabels} from '../labels';
import './Breadcrumbs.css';

/** The words Breadcrumbs says itself (docs/API.md rule 11): its nav's name, and the `editor` variant's words. */
export interface BreadcrumbsLabels {
  /** The name of the `nav` landmark the breadcrumbs draw, when no `aria-label` is given. */
  nav: string;
  /** The panel toggle's name. */
  togglePanel: string;
  /** The back arrow's name. */
  back: string;
  /** What the trailing Status badge says. */
  live: string;
  /** What the Status badge says when `status` is `draft`. */
  draft: string;
}

/** Breadcrumbs' English words; a page passes its own over them with `labels`. */
export const breadcrumbsLabels: BreadcrumbsLabels = {nav: 'Breadcrumbs', togglePanel: 'Toggle panel', back: 'Back', live: 'Live', draft: 'Draft'};

export interface BreadcrumbItem {
  /** A stable id for the crumb. */
  key: string;
  /** The crumb's words. */
  label: string;
  /** Where the crumb goes. */
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
  /** `editor` only: fires when the back arrow is pressed. */
  onBack?: () => void;
  /** Its own words (the nav's name, the toggle's and back arrow's names, Live, Draft), over `breadcrumbsLabels`. */
  labels?: Partial<BreadcrumbsLabels>;
  /** The nav landmark's name, over `labels.nav` ("Breadcrumbs"). */
  'aria-label'?: string;
}

/**
 * Breadcrumbs (Figma node 14:875, Level=Project/Phase·Draft/Phase·Live; prototype `.pj-bc`).
 * The phase levels lead with two ghost Icon buttons split by a divider and end with a Status badge,
 * as Figma's instances do. The last crumb is the current page (`aria-current="page"`). It draws its own `nav`
 * landmark, named "Breadcrumbs" (`labels.nav` or `aria-label`), so the page wraps it in nothing.
 */
export function Breadcrumbs({
  variant = 'default',
  status = 'draft',
  items,
  onTogglePanel,
  onBack,
  labels,
  'aria-label': ariaLabel,
  className,
  style,
  ...rest
}: BreadcrumbsProps) {
  const l = mergeLabels(breadcrumbsLabels, labels);
  const last = items.length - 1;
  return (
    <nav className={clsx('gv-breadcrumb', className)} style={style} data-variant={variant} aria-label={ariaLabel ?? l.nav}>
      {variant === 'editor' && (
        <>
          <IconButton onPress={onTogglePanel} aria-label={l.togglePanel}>
            <PanelLeft aria-hidden />
          </IconButton>
          <span className="gv-breadcrumb-divider" aria-hidden="true" />
          <IconButton onPress={onBack} aria-label={l.back}>
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
      {variant === 'editor' && <StatusBadge status={status}>{status === 'live' ? l.live : l.draft}</StatusBadge>}
    </nav>
  );
}
