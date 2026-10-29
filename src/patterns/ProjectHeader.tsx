'use client';
import {Breadcrumbs} from '../components/gv/Breadcrumbs';
import './ProjectHeader.css';

export interface ProjectHeaderProps {
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
  /** Phase levels: the project link, the ← arrow and the panel toggle. */
  projectHref?: string;
  onBack?: () => void;
  onTogglePanel?: () => void;
}

/**
 * The project page's header (Figma "Project header", 14:876): a 48-tall frame around the Breadcrumbs, as in Figma,
 * where each Level holds a Breadcrumbs instance of the same level.
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
  onTogglePanel
}: ProjectHeaderProps) {
  return (
    <nav className="gv-header" data-level={level} aria-label="Breadcrumb">
      {level === 'project' ? (
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
}
