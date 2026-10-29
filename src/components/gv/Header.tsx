'use client';
import {Breadcrumb, Breadcrumbs, Button, Link} from 'react-aria-components';
import {ArrowLeft, ChevronRight, PanelLeft} from 'lucide-react';
import './Header.css';

export interface HeaderProps {
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

/** Tali's page header: a breadcrumb for the project, or panel + back + project / phase + state for a phase. */
export function Header({
  level = 'project',
  projectName,
  phaseName = '',
  parentLabel = 'Projects',
  parentHref,
  onParentPress,
  projectHref,
  onBack,
  onTogglePanel
}: HeaderProps) {
  if (level === 'project') {
    return (
      <nav className="gv-header" data-level={level} aria-label="Breadcrumb">
        <Breadcrumbs className="gv-header__crumbs">
          <Breadcrumb className="gv-header__crumb">
            <Link className="gv-header__link" href={parentHref} onPress={onParentPress}>
              {parentLabel}
            </Link>
            <ChevronRight className="gv-header__chevron" aria-hidden size={16} />
          </Breadcrumb>
          <Breadcrumb className="gv-header__crumb">
            <Link className="gv-header__current gv-header__current--boxed">{projectName}</Link>
          </Breadcrumb>
        </Breadcrumbs>
      </nav>
    );
  }
  const live = level === 'phase-live';
  return (
    <nav className="gv-header" data-level={level} aria-label="Breadcrumb">
      <Button className="gv-header__icon" aria-label="Show or hide the timeline" onPress={onTogglePanel}>
        <PanelLeft aria-hidden size={16} />
      </Button>
      <span className="gv-header__divider" aria-hidden />
      <Button className="gv-header__icon" aria-label={`Back to ${projectName}`} onPress={onBack}>
        <ArrowLeft aria-hidden size={16} />
      </Button>
      <Breadcrumbs className="gv-header__crumbs gv-header__crumbs--phase">
        <Breadcrumb className="gv-header__crumb">
          <Link className="gv-header__link gv-header__link--project" href={projectHref} onPress={onBack}>
            {projectName}
          </Link>
          <span className="gv-header__slash" aria-hidden>/</span>
        </Breadcrumb>
        <Breadcrumb className="gv-header__crumb">
          <Link className="gv-header__current">{phaseName}</Link>
        </Breadcrumb>
      </Breadcrumbs>
      <span className="gv-header__status" data-state={live ? 'live' : 'draft'}>
        {live ? 'Live' : 'Draft'}
      </span>
    </nav>
  );
}
