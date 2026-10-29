import {useState} from 'react';
import {Navigate, useNavigate, useParams} from 'react-router';
import {Download, Funnel, Lightbulb, Paperclip, Plus, Search, Settings, TriangleAlert, Upload} from 'lucide-react';
import {Button} from '../../../src/components/Button';
import {DataTable, DataTableHeader, DataTableColumn, DataTableBody, DataTableRow, DataTableCell, DataTableEmpty}
  from '../../../src/components/gv/DataTable';
import {Avatar} from '../../../src/components/gv/Avatar';
import {Card} from '../../../src/components/gv/Card';
import {Divider} from '../../../src/components/gv/Divider';
import {Header} from '../../../src/components/gv/Header';
import {IconButton} from '../../../src/components/gv/IconButton';
import {RailHeader} from '../../../src/components/gv/RailHeader';
import {RailSectionLabel} from '../../../src/components/gv/RailSectionLabel';
import {SegmentedControl, Segment} from '../../../src/components/gv/SegmentedControl';
import {SetupCard} from '../../../src/components/gv/SetupCard';
import {StatRow} from '../../../src/components/gv/StatRow';
import {Status} from '../../../src/components/gv/Status';
import {TitleField} from '../../../src/components/gv/TitleField';
import {PhaseTimeline} from '../../../src/patterns/PhaseTimeline';
import {Gap} from '../Gap';
import {INPUTS, ME, PROJECTS, type Phase, type Project} from '../data';
import {timeline} from '../data-project';

// The phase screen, from the Figma frames "Project · Build" and "Ideation · Manage (data)" (Screens WIP):
// a header bar (Header · mode switch · actions) over the Participation rail and the tab's panels.
const TABS = ['build', 'manage', 'insights'] as const;
type Tab = typeof TABS[number];
const label = (t: string) => t[0].toUpperCase() + t.slice(1);
const phaseUrl = (project: Project, phase: Phase, tab: Tab) => `/projects/${project.id}/phases/${phase.id}/${tab}`;

export function ProjectPhase() {
  const {projectId, phaseId, tab} = useParams();
  const navigate = useNavigate();
  const [railOpen, setRailOpen] = useState(true);
  const project = PROJECTS.find(p => p.id === projectId);
  if (!project) return <Navigate to="/projects" replace />;
  const phase = project.phases.find(p => p.id === phaseId) ?? project.phases[0];
  if (phase.id !== phaseId || !TABS.includes(tab as Tab)) return <Navigate to={phaseUrl(project, phase, 'build')} replace />;
  const view = tab as Tab;

  return (
    <div className="bo-phase" data-rail={railOpen ? 'open' : 'closed'}>
      <h1 className="bo-visually-hidden">{project.title}</h1>
      <div className="bo-phase-bar">
        <Header level={phase.status === 'Draft' ? 'phase-draft' : 'phase-live'} projectName={project.title} phaseName={phase.title}
          projectHref={`#/projects/${project.id}`} onBack={() => navigate(`/projects/${project.id}`)} onTogglePanel={() => setRailOpen(o => !o)} />
        <SegmentedControl aria-label="Phase view" disallowEmptySelection selectedKeys={[view]}
          onSelectionChange={keys => { const next = [...keys][0]; if (next) navigate(phaseUrl(project, phase, next as Tab)); }}>
          {TABS.map(t => <Segment key={t} id={t}>{label(t)}</Segment>)}
        </SegmentedControl>
        <div className="bo-phase-bar-actions">
          <Avatar initials={ME.slice(-1)} aria-label={`${ME} is here`} />
          <Button variant="secondary" size={32} hasMenu>Share</Button>
          <Button size={32}>Save</Button>
        </div>
      </div>
      <div className="bo-phase-body" data-view={view}>
        {railOpen && <Rail project={project} current={phase} tab={view} />}
        {view === 'build' && <Build key={`${project.id}/${phase.id}`} phase={phase} />}
        {view === 'manage' && phase.method === 'Ideation' && <Manage key={`${project.id}/${phase.id}`} phase={phase} project={project} />}
        {(view === 'insights' || (view === 'manage' && phase.method !== 'Ideation')) && (
          <section className="bo-phase-panel bo-phase-grow" aria-label={label(view)}>
            <p className="bo-note">{phase.title} · {phase.method} · {label(view)}. Not in Figma yet.</p>
          </section>
        )}
      </div>
    </div>
  );
}

function Rail({project, current, tab}: {project: Project; current: Phase; tab: Tab}) {
  return (
    <aside className="bo-phase-panel bo-phase-rail" aria-label="Participation">
      <RailHeader title="Participation" onAdd={() => {}} addLabel="Add a phase" />
      <nav aria-label="Phases" className="bo-phase-rail-section">
        <RailSectionLabel>Timeline</RailSectionLabel>
        <div className="bo-project-rail-list">
          <PhaseTimeline phases={timeline(project, p => `#${phaseUrl(project, p, p.method === 'Ideation' || tab !== 'manage' ? tab : 'build')}`, current.id)} />
        </div>
      </nav>
      <Divider />
      <RailSectionLabel>Spotlight</RailSectionLabel>
      <Divider />
      <RailSectionLabel>Events</RailSectionLabel>
    </aside>
  );
}

// "Project · Build": the front-office preview on the stage, the setup checklist in the right panel.
export const CHECKLIST: {title: string; action: 'open' | 'expand'; body?: string}[] = [
  {title: 'Settings', action: 'open'},
  {title: 'Edit project page', action: 'open'},
  {title: 'Set project card', action: 'expand', body: 'The card residents see on the homepage and in project lists: an image, a title and a one-line summary.'},
  {title: 'Set area', action: 'expand', body: 'The neighbourhoods this project is about, so residents who follow them hear of it.'},
  {title: 'Set topic tags', action: 'expand', body: 'Topics help residents find the project from the homepage filters.'},
  {title: 'Plan participation', action: 'open'}
];

function Build({phase}: {phase: Phase}) {
  const navigate = useNavigate();
  return (
    <>
      <section className="bo-phase-stage bo-phase-grow" aria-label="Preview">
        <Gap name="Front-office phone preview">
          <p className="bo-note">What residents see for {phase.title}, as they'll see it on a phone.</p>
        </Gap>
      </section>
      <aside className="bo-phase-panel bo-phase-side" aria-label="Setup">
        <div className="bo-phase-panel-header">
          <h2 className="bo-section-title bo-phase-flush">Project setup</h2>
          <IconButton aria-label="Project settings" onPress={() => navigate('/projects')}><Settings aria-hidden size={16} /></IconButton>
        </div>
        <div className="bo-phase-section-header">
          <h3 className="bo-phase-flush">Before you publish</h3>
          <span className="bo-note bo-phase-flush">0 of {CHECKLIST.length} ready</span>
        </div>
        <ul className="bo-phase-stack">
          {CHECKLIST.map(c => (
            <li key={c.title} data-gv="setup-card">
              {c.action === 'open'
                ? <SetupCard title={c.title} onPress={() => {}} />
                : <SetupCard action="expand" title={c.title}><p className="bo-note bo-phase-flush">{c.body}</p></SetupCard>}
            </li>
          ))}
        </ul>
        <div className="bo-phase-section-header bo-phase-section-gap">
          <h3 className="bo-phase-flush">{phase.method} setup</h3>
          <Status state={phase.status === 'Draft' ? 'draft' : 'live'}>{phase.status}</Status>
        </div>
        {phase.method === 'Ideation' ? <IdeationCards phase={phase} /> : (
          <p className="bo-note">The {phase.method.toLowerCase()} setup cards: not in Figma yet.</p>
        )}
      </aside>
    </>
  );
}

// The phase's own cards, after the "Ideation · Build" Figma frame (Card types Required, Add, Review, To set).
function IdeationCards({phase}: {phase: Phase}) {
  return (
    <ul className="bo-phase-stack">
      <li data-gv="setup-card"><Card title="Dates" isRequired summary={phase.dates} control="expand">
        <p className="bo-note bo-phase-flush">Ideas can be posted from the first day to the last.</p>
      </Card></li>
      <li data-gv="setup-card"><Card title="Title and description" isRequired control="expand" defaultExpanded>
        <div className="bo-phase-stack">
          <TitleField aria-label="Phase title" defaultValue={phase.title} isRequired />
          <TitleField aria-label="Phase description" placeholder="Add a short description" />
        </div>
      </Card></li>
      <li data-gv="setup-card"><Card title="Attachments" iconActions={[{icon: Paperclip, label: 'Add an attachment'}]} /></li>
      <li data-gv="setup-card"><Card title="What should an input be called?" review="to-review" pills={[{label: 'Idea', icon: Lightbulb}]} control="open" /></li>
      <li data-gv="setup-card"><Card title="Idea form" review="to-review" pills={[{label: '6 questions'}]} control="open" /></li>
      <li data-gv="setup-card"><Card title="Collect demographic data" review="to-set" control="open" /></li>
      <li data-gv="setup-card"><Card title="Sorting" review="to-review" pills={[{label: 'Trending'}]} control="open" /></li>
    </ul>
  );
}

// "Ideation · Manage (data)": the metrics and actions on the left, the list of ideas on the right.
type Walk = 'reply' | 'unassigned' | 'new' | 'comments' | 'warnings';
const WALKS: {key: Walk; label: string; test: (i: typeof INPUTS[number]) => boolean}[] = [
  {key: 'reply', label: 'Waiting for a reply', test: i => i.needsFeedback},
  {key: 'unassigned', label: 'Unassigned', test: i => i.assignee === 'Unassigned'},
  {key: 'new', label: 'New ideas', test: i => i.published.includes('hour')},
  {key: 'comments', label: 'New comments', test: i => i.newComments > 0},
  {key: 'warnings', label: 'Content warnings', test: i => i.warning}
];

function Manage({project, phase}: {project: Project; phase: Phase}) {
  const ideas = INPUTS.filter(i => i.project === project.id && i.phase === phase.id);
  const [walk, setWalk] = useState<Walk | null>(null);
  const active = WALKS.find(w => w.key === walk);
  const shown = active ? ideas.filter(active.test) : ideas;
  return (
    <>
      <aside className="bo-phase-side bo-phase-stack" aria-label="Ideas overview">
        <div className="bo-phase-panel bo-phase-panel-tight">
          {WALKS.map(w => {
            const n = ideas.filter(w.test).length;
            return <StatRow key={w.key} label={w.label} value={String(n)} isNew={w.key === 'new' && n > 0}
              isStatic={n === 0} onPress={() => setWalk(w.key === walk ? null : w.key)} />;
          })}
        </div>
        <div className="bo-phase-panel bo-phase-panel-actions">
          <ul className="bo-phase-stack">
            <li><Card tone="manage" title="Add an idea" iconActions={[{icon: Plus, label: 'Add an idea'}]} /></li>
            <li><Card tone="manage" title="Import paper ideas" summary="Not set" iconActions={[{icon: Upload, label: 'Import paper ideas'}]} /></li>
            <li><Card tone="manage" title="Exports" iconActions={[{icon: Download, label: 'Export ideas'}]} /></li>
          </ul>
        </div>
      </aside>
      <section className="bo-phase-panel bo-phase-grow" aria-label="Ideas">
        <div className="bo-phase-toolbar">
          <h2 className="bo-section-title bo-phase-flush">{shown.length} {shown.length === 1 ? 'idea' : 'ideas'}{active && ` · ${active.label}`}</h2>
          {active && <Button variant="quiet" size={32} onPress={() => setWalk(null)}>Show all</Button>}
          <span className="bo-push" />
          <IconButton variant="bordered" tone="strong" aria-label="Search ideas"><Search aria-hidden size={16} /></IconButton>
          <IconButton variant="bordered" tone="strong" aria-label="Filter ideas"><Funnel aria-hidden size={16} /></IconButton>
        </div>
        {/* Shown sorted by idea, as before; the order itself is not interactive yet. */}
        <DataTable aria-label="Inputs" selectionMode="multiple" sortDescriptor={{column: 'idea', direction: 'ascending'}}>
          <DataTableHeader>
            <DataTableColumn id="idea" isRowHeader allowsSorting>Idea</DataTableColumn>
            <DataTableColumn id="status">Status</DataTableColumn>
          </DataTableHeader>
          <DataTableBody renderEmptyState={() => <DataTableEmpty>No ideas here yet.</DataTableEmpty>}>
            {shown.map(i => (
              <DataTableRow key={i.id} id={i.id} textValue={i.title}>
                <DataTableCell>{i.title}{i.warning && <> <TriangleAlert aria-label="Needs attention" size={14} /></>}</DataTableCell>
                <DataTableCell>{i.status}</DataTableCell>
              </DataTableRow>
            ))}
          </DataTableBody>
        </DataTable>
      </section>
    </>
  );
}
