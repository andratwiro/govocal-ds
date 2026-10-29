import {Navigate, useNavigate, useParams} from 'react-router';
import {SegmentedControl, SegmentedControlItem} from '../../../src/components/SegmentedControl';
import {PROJECTS} from '../data';
import {Page} from './Page';

const TABS = ['build', 'manage', 'insights'] as const;
export function ProjectPhase() {
  const {projectId, phaseId, tab} = useParams();
  const navigate = useNavigate();
  const project = PROJECTS.find(p => p.id === projectId);
  if (!project) return <Navigate to="/projects" replace />;
  const phase = project.phases.find(p => p.id === phaseId) ?? project.phases[0];
  if (phase.id !== phaseId || !TABS.includes(tab as any)) return <Navigate to={`/projects/${project.id}/phases/${phase.id}/build`} replace />;
  return (
    <Page title={project.title}>
      <SegmentedControl aria-label="Phase view" disallowEmptySelection selectedKeys={[tab!]} onSelectionChange={keys => {
        const next = [...keys][0]; if (next) navigate(`/projects/${project.id}/phases/${phase.id}/${String(next)}`);
      }}>
        {TABS.map(t => <SegmentedControlItem key={t} id={t}>{t[0].toUpperCase() + t.slice(1)}</SegmentedControlItem>)}
      </SegmentedControl>
      <p className="bo-note">{phase.title} · {phase.method} · {phase.status}. Task 6 builds this page from Tali's frames.</p>
    </Page>
  );
}
