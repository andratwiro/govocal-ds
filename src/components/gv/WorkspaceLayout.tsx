'use client';
import {useState, type ReactNode} from 'react';
import {clsx} from 'clsx';
import {PanelLeft} from 'lucide-react';
import {IconButton} from './IconButton';
import type {PlacementProps} from '../className';
import {mergeLabels} from '../labels';
import './WorkspaceLayout.css';

/** The words Workspace layout says itself (docs/API.md rule 11). */
export interface WorkspaceLayoutLabels {
  /** The collapsed strip's button, which opens the rail again. */
  showRail: string;
}

/** Workspace layout's English words; a page passes its own over them with `labels`. */
export const workspaceLayoutLabels: WorkspaceLayoutLabels = {showRail: 'Show panel'};

export interface WorkspaceLayoutProps extends PlacementProps {
  /**
   * The rail at the start: a white panel, 300 wide (the project's Participation rail). Its own header carries the
   * button that collapses it (`RailHeader onTogglePanel`), wired to `onRailCollapsedChange(true)`.
   */
  rail?: ReactNode;
  /** The rail's landmark name ("Participation"). */
  railLabel?: string;
  /** The work column in the middle: a white panel, 480 wide (a phase's setup, Manage's metrics, Insights' actions). */
  column?: ReactNode;
  /** The work column's landmark name ("Proposals setup"). */
  columnLabel?: string;
  /** What fills the rest: the stage (a Phone stage) or a list (a Data table, a panel of tiles). */
  children?: ReactNode;
  /**
   * The ground under `children`. `stage`: the light stage grey, where a phone or a preview stands. `plain`: no fill,
   * for a list or tiles that bring their own panels.
   *
   * @default 'stage'
   */
  main?: 'stage' | 'plain';
  /** Whether the rail is collapsed to a 44 strip with one button that opens it (controlled). */
  isRailCollapsed?: boolean;
  /** Whether the rail starts collapsed (uncontrolled). */
  defaultRailCollapsed?: boolean;
  /** Fires with the new state when the strip's button opens the rail (and when the page collapses it). */
  onRailCollapsedChange?: (isCollapsed: boolean) => void;
  /** Its own words (the strip's button), over `workspaceLayoutLabels`. */
  labels?: Partial<WorkspaceLayoutLabels>;
}

/**
 * Workspace layout: the project screens' three columns, so every screen lines up. A rail at the start that collapses
 * to a strip, a work column in the middle and the stage or a list filling the rest, 8 apart on the app grey. The
 * overview, Build, Manage and Insights all use it. Not in Figma.
 */
export function WorkspaceLayout({
  rail,
  railLabel,
  column,
  columnLabel,
  children,
  main = 'stage',
  isRailCollapsed,
  defaultRailCollapsed = false,
  onRailCollapsedChange,
  labels,
  className,
  style
}: WorkspaceLayoutProps) {
  const l = mergeLabels(workspaceLayoutLabels, labels);
  const [innerCollapsed, setInnerCollapsed] = useState(defaultRailCollapsed);
  const collapsed = isRailCollapsed ?? innerCollapsed;
  const open = () => {
    setInnerCollapsed(false);
    onRailCollapsedChange?.(false);
  };
  return (
    <div className={clsx('gv-workspace', className)} style={style} data-rail={rail == null ? undefined : collapsed ? 'collapsed' : 'open'}>
      {rail != null &&
        (collapsed ? (
          <div className="gv-workspace__strip">
            <IconButton aria-label={l.showRail} onPress={open}>
              <PanelLeft aria-hidden size={16} />
            </IconButton>
          </div>
        ) : (
          <aside className="gv-workspace__rail" aria-label={railLabel}>
            {rail}
          </aside>
        ))}
      {column != null && (
        <section className="gv-workspace__column" aria-label={columnLabel}>
          {column}
        </section>
      )}
      <div className="gv-workspace__main" data-main={main}>
        {children}
      </div>
    </div>
  );
}
