'use client';
import type {ReactNode} from 'react';
import {MenuTrigger} from 'react-aria-components/Menu';
import {Archive, PanelLeft} from 'lucide-react';
import {Button} from '../components/Button';
import {Menu} from '../components/Menu';
import {Popover} from '../components/Popover';
import {Breadcrumbs, type BreadcrumbsLabels} from '../components/gv/Breadcrumbs';
import {IconButton} from '../components/gv/IconButton';
import {SegmentedControl, SegmentedControlItem} from '../components/gv/SegmentedControl';
import clsx from 'clsx';
import type {PlacementProps} from '../components/className';
import {mergeLabels} from '../components/labels';
import './ProjectHeader.css';

/** The words Project header says itself (docs/API.md rule 11), with the Breadcrumbs' Live and Draft, which it hands
 * on (Live also names the bar's Live menu). */
export interface ProjectHeaderLabels extends Pick<BreadcrumbsLabels, 'live' | 'draft'> {
  /** The crumbs' navigation name. */
  breadcrumb: string;
  /** The panel toggle's name: project setup on the project, the timeline on a phase. */
  toggleSetup: string;
  /** The panel toggle's name on a phase: the timeline. */
  toggleTimeline: string;
  /** A phase's ← name, given the project's name. */
  backToProject: (project: string) => string;
  /** The project level's parent crumb, when no `parentLabel` is given. */
  projects: string;
  /** The bar's buttons and the mode switch's name. */
  save: string;
  /** The Share menu button (project level). */
  share: string;
  /** The Publish menu button, while the project is a draft. */
  publish: string;
  /** The mode switch's name (Build, Manage, Insights). */
  phaseView: string;
  /** An archived project's state: the bar's menu button, a phase's badge. */
  archived: string;
  /** Save while it saves (`saveState="saving"`). */
  saving: string;
  /** What Save becomes once saved (`saveState="saved"`): it leads back to the project. */
  backToProjectButton: string;
  /** A mode's unread dot, read after its name. */
  unread: string;
}

/** Project header's English words; a page passes its own over them with `labels`. */
export const projectHeaderLabels: ProjectHeaderLabels = {
  breadcrumb: 'Breadcrumb',
  toggleSetup: 'Show or hide project setup',
  toggleTimeline: 'Show or hide the timeline',
  backToProject: project => `Back to ${project}`,
  projects: 'Projects',
  save: 'Save',
  share: 'Share',
  publish: 'Publish',
  live: 'Live',
  draft: 'Draft',
  phaseView: 'Phase view',
  archived: 'Archived',
  saving: 'Saving',
  backToProjectButton: 'Back to project',
  unread: 'New activity'
};

export interface ProjectHeaderMode {
  /** The mode's key, handed to `onModeChange` and matched by `mode`. */
  id: string;
  /** The mode's name on the switch ("Build"). */
  label: string;
  /** A mode that can't open yet (Manage and Insights before a phase is published). */
  isDisabled?: boolean;
  /** Something new waits in this mode (new inputs in Manage): a red dot after its name. */
  hasUnread?: boolean;
}

/** `className` and `style` place the header (the bar, or the crumb frame without one); they never paint it. */
export interface ProjectHeaderProps extends PlacementProps {
  /**
   * Figma "Level": the project page, or a phase inside it.
   *
   * @default 'project'
   */
  level?: 'project' | 'phase';
  /**
   * The project's status, draft, live or archived, on every level. On a phase it is still the project's: the Status
   * badge after the crumbs (default `draft`; archived wears the grey badge), so an upcoming phase of a live project
   * reads Live. On the project: the bar's Publish ▾ (`draft`, primary), ● Live ▾ (`live`) or Archived ▾ (`archived`,
   * residents can read it but no longer take part; its menu restores it) menu button; given, the header becomes the
   * bar.
   */
  status?: 'draft' | 'live' | 'archived';
  /** The project's name: the current crumb on the project level, the parent link on a phase. */
  projectName: string;
  /** The phase's name (phase levels only). */
  phaseName?: string;
  /** The project level's parent crumb. @default `labels.projects` ("Projects") */
  parentLabel?: string;
  /** Where the parent crumb leads (a link), or what it does (a press). */
  parentHref?: string;
  /** Fires when the parent crumb is pressed. */
  onParentPress?: () => void;
  /** Phase levels: the project link and the ← arrow. */
  projectHref?: string;
  /** Fires when the ← arrow or the project link on a phase is pressed. */
  onBack?: () => void;
  /** The panel toggle (the rail on a phase, project setup on the project). On the project level it shows only when given. */
  onTogglePanel?: () => void;

  /*
   * The bar. Give the header any of the props below and it becomes the full-width bar of the prototype's
   * project and phase screens: crumbs at the start, the mode switch in the middle, who is here and the actions at
   * the end. Without them it is Figma's 48-tall crumb frame, as before.
   */

  /**
   * Phase levels: the tabs of the mode switch in the middle of the bar, in order. Only the modes given show: Build ·
   * Manage · Insights, a survey's Build · Insights. Each can be disabled or carry an unread dot.
   */
  modes?: ProjectHeaderMode[];
  /** The selected mode's id. */
  mode?: string;
  /** Fires when another mode is picked, with its id. */
  onModeChange?: (id: string) => void;
  /** Who is here, before the actions: an `Avatar`, or an `AvatarGroup` when others edit the same phase. */
  people?: ReactNode;
  /**
   * Unsaved changes. On a phase, Save turns on. On the project, Share and Publish make way for one Save until it is
   * saved.
   */
  hasChanges?: boolean;
  /** Shows Save (always on a phase, while there are changes on the project). */
  onSave?: () => void;
  /**
   * Phase levels: where saving stands, for the prototype's Save → saving → Back to project. Given, Save is on whether
   * or not there are changes; `saving` turns it into a busy button, `saved` into "Back to project", which calls
   * `onBack`. Leave it out for the older Save that turns on with `hasChanges`.
   */
  saveState?: 'idle' | 'saving' | 'saved';
  /** The Publish / Live / Archived menu's items (`MenuItem`s). */
  publishMenu?: ReactNode;
  /** Project level: Share ▾ and its items (`MenuItem`s). */
  shareMenu?: ReactNode;
  /**
   * Project level: your own Share control in place of Share ▾'s menu, e.g. the Access popover recipe (a Share ▾ that
   * opens the people with access). Wins over `shareMenu`.
   */
  share?: ReactNode;
  /** Its own words (the toggles' and ←'s names, Save, Share, Publish, Live, Draft), over `projectHeaderLabels`. */
  labels?: Partial<ProjectHeaderLabels>;
}

function MenuButton({label, variant, children, menu}: {label: string; variant: 'primary' | 'secondary'; children: ReactNode; menu?: ReactNode}) {
  if (menu == null) return <Button variant={variant} size={32}>{children}</Button>;
  return (
    <MenuTrigger>
      <Button variant={variant} size={32} hasMenu>
        {children}
      </Button>
      <Popover showArrow={false} placement="bottom end" offset={6}>
        <Menu aria-label={label}>{menu}</Menu>
      </Popover>
    </MenuTrigger>
  );
}

/**
 * The project page's header (Figma "Project header", 14:876): a 48-tall frame around the Breadcrumbs, as in Figma,
 * where each Level holds a Breadcrumbs instance (the project the default trail, a phase the editor). With a mode switch, people or actions it becomes
 * the prototype's full bar (`.pj-hdr`): crumbs · Build | Manage | Insights · avatar, Share ▾, Publish ▾ or Save.
 */
export function ProjectHeader({
  level = 'project',
  projectName,
  phaseName = '',
  parentLabel,
  parentHref,
  onParentPress,
  projectHref,
  onBack,
  onTogglePanel,
  modes,
  mode,
  onModeChange,
  people,
  hasChanges = false,
  onSave,
  saveState,
  status,
  publishMenu,
  shareMenu,
  share,
  labels,
  className,
  style
}: ProjectHeaderProps) {
  const l = mergeLabels(projectHeaderLabels, labels);
  const isProject = level === 'project';
  const isBar = modes != null || people != null || onSave != null || (level === 'project' && status != null) || shareMenu != null || share != null;
  const crumbs = (
    <nav className={clsx('gv-header', !isBar && className)} style={isBar ? undefined : style} data-level={level} aria-label={l.breadcrumb}>
      {isProject && onTogglePanel && (
        <>
          <IconButton onPress={onTogglePanel} aria-label={l.toggleSetup}>
            <PanelLeft aria-hidden />
          </IconButton>
          <span className="gv-header__divider" aria-hidden="true" />
        </>
      )}
      {isProject ? (
        <Breadcrumbs
          items={[
            {key: 'parent', label: parentLabel ?? l.projects, href: parentHref, onPress: onParentPress},
            {key: 'project', label: projectName}
          ]}
        />
      ) : (
        <Breadcrumbs
          variant="editor"
          status={status === 'live' ? 'live' : 'draft'}
          items={[
            {key: 'project', label: projectName, href: projectHref, onPress: onBack},
            {key: 'phase', label: phaseName}
          ]}
          onTogglePanel={onTogglePanel}
          onBack={onBack}
          labels={{togglePanel: l.toggleTimeline, back: l.backToProject(projectName), live: l.live,
            draft: status === 'archived' ? l.archived : l.draft}}
        />
      )}
    </nav>
  );

  if (!isBar) return crumbs;

  const save =
    !isProject && saveState === 'saved' ? (
      <Button size={32} variant="secondary" onPress={onBack}>
        {l.backToProjectButton}
      </Button>
    ) : (
      <Button
        size={32}
        onPress={onSave}
        isPending={!isProject && saveState === 'saving'}
        isDisabled={!isProject && saveState == null && !hasChanges}
        labels={{pending: l.saving}}>
        {l.save}
      </Button>
    );

  let actions: ReactNode;
  if (!isProject) actions = onSave && save;
  else if (hasChanges && onSave) actions = save;
  else
    actions = (
      <>
        {share}
        {share == null && shareMenu != null && (
          <MenuButton label={l.share} variant="secondary" menu={shareMenu}>
            {l.share}
          </MenuButton>
        )}
        {status === 'draft' && (
          <MenuButton label={l.publish} variant="primary" menu={publishMenu}>
            {l.publish}
          </MenuButton>
        )}
        {status === 'live' && (
          <MenuButton label={l.live} variant="secondary" menu={publishMenu}>
            <span className="gv-project-header__live" aria-hidden="true" />
            {l.live}
          </MenuButton>
        )}
        {status === 'archived' && (
          <MenuButton label={l.archived} variant="secondary" menu={publishMenu}>
            <Archive aria-hidden size={16} />
            {l.archived}
          </MenuButton>
        )}
      </>
    );

  return (
    <div className={clsx('gv-project-header', className)} style={style} data-level={level}>
      {crumbs}
      {!isProject && modes != null ? (
        <SegmentedControl
          aria-label={l.phaseView}
          disallowEmptySelection
          selectedKeys={mode != null ? [mode] : []}
          onSelectionChange={keys => {
            const next = [...keys][0];
            if (next != null) onModeChange?.(String(next));
          }}>
          {modes.map(m => (
            <SegmentedControlItem key={m.id} id={m.id} isDisabled={m.isDisabled} isUnread={m.hasUnread}
              labels={{unread: l.unread}}>
              {m.label}
            </SegmentedControlItem>
          ))}
        </SegmentedControl>
      ) : (
        <span aria-hidden="true" />
      )}
      <div className="gv-project-header__end">
        {people}
        {actions}
      </div>
    </div>
  );
}
