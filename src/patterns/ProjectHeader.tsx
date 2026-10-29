'use client';
import type {ReactNode} from 'react';
import {MenuTrigger} from 'react-aria-components/Menu';
import {PanelLeft} from 'lucide-react';
import {Button} from '../components/Button';
import {Menu} from '../components/Menu';
import {Popover} from '../components/Popover';
import {Breadcrumbs} from '../components/gv/Breadcrumbs';
import {IconButton} from '../components/gv/IconButton';
import {SegmentedControl, SegmentedControlItem} from '../components/gv/SegmentedControl';
import clsx from 'clsx';
import type {PlacementProps} from '../components/className';
import './ProjectHeader.css';

export interface ProjectHeaderMode {
  id: string;
  label: string;
  /** A mode that can't open yet (Manage and Insights before a phase is published). */
  isDisabled?: boolean;
}

/** `className` and `style` place the header (the bar, or the crumb frame without one); they never paint it. */
export interface ProjectHeaderProps extends PlacementProps {
  /**
   * Figma "Level": the project page, or a phase inside it (draft or live).
   *
   * @default 'project'
   */
  level?: 'project' | 'phase-draft' | 'phase-live';
  /** The project's name: the current crumb on the project level, the parent link on a phase. */
  projectName: string;
  /** The phase's name (phase levels only). */
  phaseName?: string;
  /** The project level's parent crumb. @default 'Projects' */
  parentLabel?: string;
  /** Where the parent crumb leads (a link), or what it does (a press). */
  parentHref?: string;
  onParentPress?: () => void;
  /** Phase levels: the project link and the ← arrow. */
  projectHref?: string;
  onBack?: () => void;
  /** The panel toggle (the rail on a phase, project setup on the project). On the project level it shows only when given. */
  onTogglePanel?: () => void;

  /*
   * The bar. Give the header any of the props below and it becomes the full-width bar of the prototype's
   * project and phase screens: crumbs at the start, the mode switch in the middle, who is here and the actions at
   * the end. Without them it is Figma's 48-tall crumb frame, as before.
   */

  /** Phase levels: the mode switch in the middle of the bar (Build · Manage · Insights; a survey's Build · Insights). */
  modes?: ProjectHeaderMode[];
  /** The selected mode's id. */
  mode?: string;
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
  /** Project level: the project's state as a menu button. `draft`: Publish ▾ (primary). `live`: ● Live ▾. */
  publishState?: 'draft' | 'live';
  /** The Publish / Live menu's items (`MenuItem`s). */
  publishMenu?: ReactNode;
  /** Project level: Share ▾ and its items (`MenuItem`s). */
  shareMenu?: ReactNode;
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
 * where each Level holds a Breadcrumbs instance of the same level. With a mode switch, people or actions it becomes
 * the prototype's full bar (`.pj-hdr`): crumbs · Build | Manage | Insights · avatar, Share ▾, Publish ▾ or Save.
 */
export function ProjectHeader({
  level = 'project',
  projectName,
  phaseName = '',
  parentLabel = 'Projects',
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
  publishState,
  publishMenu,
  shareMenu,
  className,
  style
}: ProjectHeaderProps) {
  const isProject = level === 'project';
  const isBar = modes != null || people != null || onSave != null || publishState != null || shareMenu != null;
  const crumbs = (
    <nav className={clsx('gv-header', !isBar && className)} style={isBar ? undefined : style} data-level={level} aria-label="Breadcrumb">
      {isProject && onTogglePanel && (
        <>
          <IconButton onPress={onTogglePanel} aria-label="Show or hide project setup">
            <PanelLeft aria-hidden />
          </IconButton>
          <span className="gv-header__divider" aria-hidden="true" />
        </>
      )}
      {isProject ? (
        <Breadcrumbs
          level="project"
          items={[
            {key: 'parent', label: parentLabel, href: parentHref, onPress: onParentPress},
            {key: 'project', label: projectName}
          ]}
        />
      ) : (
        <Breadcrumbs
          level="phase"
          phaseState={level === 'phase-live' ? 'live' : 'draft'}
          items={[
            {key: 'project', label: projectName, href: projectHref, onPress: onBack},
            {key: 'phase', label: phaseName}
          ]}
          onTogglePanel={onTogglePanel}
          onBack={onBack}
          togglePanelLabel="Show or hide the timeline"
          backLabel={`Back to ${projectName}`}
        />
      )}
    </nav>
  );

  if (!isBar) return crumbs;

  const save = (
    <Button size={32} onPress={onSave} isDisabled={!isProject && !hasChanges}>
      Save
    </Button>
  );

  let actions: ReactNode;
  if (!isProject) actions = onSave && save;
  else if (hasChanges && onSave) actions = save;
  else
    actions = (
      <>
        {shareMenu != null && (
          <MenuButton label="Share" variant="secondary" menu={shareMenu}>
            Share
          </MenuButton>
        )}
        {publishState === 'draft' && (
          <MenuButton label="Publish" variant="primary" menu={publishMenu}>
            Publish
          </MenuButton>
        )}
        {publishState === 'live' && (
          <MenuButton label="Live" variant="secondary" menu={publishMenu}>
            <span className="gv-project-header__live" aria-hidden="true" />
            Live
          </MenuButton>
        )}
      </>
    );

  return (
    <div className={clsx('gv-project-header', className)} style={style} data-level={level}>
      {crumbs}
      {!isProject && modes != null ? (
        <SegmentedControl
          aria-label="Phase view"
          disallowEmptySelection
          selectedKeys={mode != null ? [mode] : []}
          onSelectionChange={keys => {
            const next = [...keys][0];
            if (next != null) onModeChange?.(String(next));
          }}>
          {modes.map(m => (
            <SegmentedControlItem key={m.id} id={m.id} isDisabled={m.isDisabled}>
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
