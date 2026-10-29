import {useState} from 'react';
import {Navigate, useNavigate, useParams} from 'react-router';
import {ChevronUp, Info, PanelLeft, Plus, Settings} from 'lucide-react';
import {Button} from '../../../src/components/Button';
import {Avatar} from '../../../src/components/gv/Avatar';
import {Divider} from '../../../src/components/gv/Divider';
import {Header} from '../../../src/components/gv/Header';
import {IconButton} from '../../../src/components/gv/IconButton';
import {RailHeader} from '../../../src/components/gv/RailHeader';
import {RailSectionLabel} from '../../../src/components/gv/RailSectionLabel';
import {SetupCard} from '../../../src/components/gv/SetupCard';
import {Status} from '../../../src/components/gv/Status';
import {ActionRow} from '../../../src/patterns/ActionRow';
import {DraftsBar} from '../../../src/patterns/DraftsBar';
import {PanelSection} from '../../../src/patterns/PanelSection';
import {PhaseTimeline} from '../../../src/patterns/PhaseTimeline';
import {AvatarStack, PhoneFrame, PhoneHeader, PhoneImage} from '../../../src/patterns/PhonePreview';
import {StatCard} from '../../../src/patterns/StatCard';
import {ME, PROJECTS, type Project} from '../data';
import {NO_OVERVIEW, OVERVIEWS, timeline, type Overview} from '../data-project';
import {CHECKLIST} from './ProjectPhase';

// A project's own page, after the prototype's live project screen: a breadcrumb bar over three columns,
// Project setup | the Participation rail | what a resident sees on a phone.
export function ProjectOverview() {
  const {projectId} = useParams();
  const [setupOpen, setSetupOpen] = useState(true);
  const [railOpen, setRailOpen] = useState(true);
  const [draftsOpen, setDraftsOpen] = useState(true);
  const project = PROJECTS.find(p => p.id === projectId);
  if (!project) return <Navigate to="/projects" replace />;
  const o = OVERVIEWS[project.id] ?? NO_OVERVIEW;
  const live = project.status === 'Live';

  return (
    <div className="bo-phase bo-project">
      <h1 className="bo-visually-hidden">{project.title}</h1>
      <div className="bo-project-bar">
        <IconButton aria-label={setupOpen ? 'Hide project setup' : 'Show project setup'} onPress={() => setSetupOpen(v => !v)}>
          <PanelLeft aria-hidden size={16} />
        </IconButton>
        <Header projectName={project.title} parentHref="#/projects" />
        <span className="bo-push" />
        <Avatar initials={ME.slice(-1)} aria-label={`${ME} is here`} />
        <Button variant="secondary" size={32} hasMenu>Share</Button>
        <Button variant="quiet" size={32} hasMenu iconOnly={false} aria-label={live ? 'Live: change status' : 'Draft: change status'}>
          <Status state={live ? 'live' : 'draft'}>{live ? '● Live' : 'Draft'}</Status>
        </Button>
      </div>
      <div className="bo-phase-body bo-project-body">
        {setupOpen && <Setup project={project} o={o} />}
        {railOpen ? <Rail project={project} o={o} onHide={() => setRailOpen(false)} /> : (
          <aside className="bo-phase-panel bo-project-rail-closed" aria-label="Participation">
            <IconButton aria-label="Show the participation rail" onPress={() => setRailOpen(true)}><PanelLeft aria-hidden size={16} /></IconButton>
          </aside>
        )}
        <section className="bo-phase-stage bo-phase-grow" aria-label="Preview">
          <Phone project={project} o={o} />
        </section>
      </div>
      {draftsOpen && o.drafts > 0 && (
        <div className="bo-project-drafts">
          <DraftsBar count={o.drafts} onShow={() => {}} onHistory={() => {}} onClose={() => setDraftsOpen(false)} />
        </div>
      )}
    </div>
  );
}

function Setup({project, o}: {project: Project; o: Overview}) {
  const navigate = useNavigate();
  const live = project.status === 'Live';
  return (
    <aside className="bo-phase-panel bo-project-setup" aria-label="Project setup">
      <div className="bo-phase-panel-header">
        <h2 className="bo-section-title bo-phase-flush">Project setup</h2>
        <IconButton aria-label="Project settings" onPress={() => navigate('/projects')}><Settings aria-hidden size={16} /></IconButton>
      </div>
      {live ? (
        <>
          <PanelSection title="Collecting now">
            <StatCard label="Participants" value={(project.participants ?? 0).toLocaleString('en-GB')} series={o.weeks}
              caption={o.since ? `Weekly, since ${o.since}` : 'Numbers appear here once participants take part'}
              onPress={() => navigate('/dashboard')} />
          </PanelSection>
          <Divider />
          <PanelSection title="Next actions">
            <ActionRow href="#/messaging">Message participants</ActionRow>
            <ActionRow href="#/reporting">Create report</ActionRow>
          </PanelSection>
        </>
      ) : (
        <PanelSection title="Before you publish" aside={`0 of ${CHECKLIST.length} ready`}>
          <ul className="bo-phase-stack">
            {CHECKLIST.map(c => (
              <li key={c.title} data-gv="setup-card">
                {c.action === 'open'
                  ? <SetupCard title={c.title} onPress={() => {}} />
                  : <SetupCard action="expand" title={c.title}><p className="bo-note bo-phase-flush">{c.body}</p></SetupCard>}
              </li>
            ))}
          </ul>
        </PanelSection>
      )}
      <Divider />
      <PanelSection title="Project details" collapsible>
        <dl className="bo-project-details">
          <dt>Dates</dt><dd>{project.start ?? 'Not set'}{project.end && ` to ${project.end}`}</dd>
          <dt>Folder</dt><dd>{project.folder ?? 'No folder'}</dd>
          <dt>Visibility</dt><dd>{project.access ?? 'Anyone'}</dd>
          <dt>Managers</dt><dd>{project.managers?.length ? project.managers.join(', ') : 'Nobody yet'}</dd>
        </dl>
      </PanelSection>
    </aside>
  );
}

function Rail({project, o, onHide}: {project: Project; o: Overview; onHide: () => void}) {
  return (
    <aside className="bo-phase-panel bo-phase-rail bo-project-rail" aria-label="Participation">
      <div className="bo-project-rail-head">
        <RailHeader title="Participation" />
        <IconButton tone="strong" aria-label="Hide the participation rail" onPress={onHide}><PanelLeft aria-hidden size={16} /></IconButton>
        <IconButton tone="strong" aria-label="Add a phase"><Plus aria-hidden size={16} /></IconButton>
      </div>
      <nav aria-label="Phases" className="bo-phase-rail-section">
        <RailSectionLabel>Timeline</RailSectionLabel>
        <div className="bo-project-rail-list">
          <PhaseTimeline phases={timeline(project, p => `#/projects/${project.id}/phases/${p.id}/build`)} />
        </div>
      </nav>
      {o.spotlight.length > 0 && (
        <div className="bo-phase-rail-section">
          <RailSectionLabel>Spotlight</RailSectionLabel>
          <div className="bo-project-rail-list"><PhaseTimeline phases={o.spotlight} /></div>
        </div>
      )}
    </aside>
  );
}

// What a resident sees: the platform header, the project's picture, title and intro, the participation box.
function Phone({project, o}: {project: Project; o: Overview}) {
  const people = project.participants ?? 0;
  return (
    <PhoneFrame aria-label="What residents see" header={<PhoneHeader />}>
      <PhoneImage aria-label="Project image" />
      <h2>{project.title}</h2>
      <p>{o.intro}</p>
      <div className="bo-project-phone-box">
        <Button>{o.ways > 1 ? `Participate · ${o.ways} ways` : 'Participate'} <ChevronUp aria-hidden size={16} /></Button>
        {people > 0 && (
          <AvatarStack initials={['A', 'B', 'C']}>
            {people.toLocaleString('en-GB')} participants <Info aria-hidden size={14} />
          </AvatarStack>
        )}
      </div>
      {o.more.map(t => <p key={t}>{t}</p>)}
    </PhoneFrame>
  );
}
