import {useState} from 'react';
import {Navigate, useNavigate, useParams} from 'react-router';
import {ChevronUp, Eye, Info, Link, PanelLeft, Settings, UserPlus} from 'lucide-react';
import {Button} from '../../../src/components/Button';
import {Menu, MenuItem, MenuTrigger} from '../../../src/components/Menu';
import {TextField} from '../../../src/components/TextField';
import {Modal} from '../../../src/components/gv/Modal';
import {AlertDialog} from '../../../src/components/gv/AlertDialog';
import {Avatar, AvatarGroup} from '../../../src/components/gv/Avatar';
import {Divider} from '../../../src/components/gv/Divider';
import {Panel} from '../../../src/components/gv/Panel';
import {PropertyList, PropertyListItem} from '../../../src/components/gv/PropertyList';
import {ToastRegion, queue} from '../../../src/components/Toast';
import {ProjectHeader} from '../../../src/patterns/ProjectHeader';
import {IconButton} from '../../../src/components/gv/IconButton';
import {StatusBadge} from '../../../src/components/gv/StatusBadge';
import {ActionRow} from '../../../src/patterns/ActionRow';
import {PanelSection} from '../../../src/patterns/PanelSection';
import {PhonePreview, PhoneHeader, PhoneImage} from '../../../src/patterns/PhonePreview';
import {StatCard} from '../../../src/patterns/StatCard';
import {ME, PROJECTS, type Project} from '../data';
import {NO_OVERVIEW, OVERVIEWS, type NewPhase, type Overview} from '../data-project';
import {AddPhase, CHECKLIST, CHECKLIST_TAB, CardStub, ChecklistStep, ProjectRail, ProjectSettings, type SettingsTab} from './ProjectPhase';

// The project's publication status, as the prototype's status pill: one next step from each state.
type PubStatus = 'Draft' | 'Published' | 'Archived';
const NEXT: Record<PubStatus, {to: PubStatus; label: string}> = {
  Draft: {to: 'Published', label: 'Publish project'},
  Published: {to: 'Archived', label: 'Archive project'},
  Archived: {to: 'Draft', label: 'Restore to draft'}
};
const DONE: Record<PubStatus, string> = {Draft: 'Project back in draft', Published: 'Project published', Archived: 'Project archived'};
const PANELS = ['setup', 'rail', 'preview'] as const;
// Copying a link or sending an invitation is done at once: a Toast says so.
const toast = (title: string) => queue.add({title}, {timeout: 5000});

// A project's own page, after the prototype's live project screen: a breadcrumb bar over three columns,
// Project setup | the Participation rail | what a resident sees on a phone.
export function ProjectOverview() {
  const {projectId} = useParams();
  // One state per project: moving to another project's overview starts afresh (its own status, columns and phases).
  return <Overview key={projectId} projectId={projectId} />;
}

function Overview({projectId}: {projectId?: string}) {
  const [setupOpen, setSetupOpen] = useState(true);
  const [railOpen, setRailOpen] = useState(true);
  const [previewOpen, setPreviewOpen] = useState(true);
  const [settings, setSettings] = useState<SettingsTab | null>(null);
  const [adding, setAdding] = useState(false);
  const [added, setAdded] = useState<NewPhase[]>([]);
  const [inviting, setInviting] = useState(false);
  const [confirm, setConfirm] = useState<PubStatus | null>(null);
  const project = PROJECTS.find(p => p.id === projectId);
  const [status, setStatus] = useState<PubStatus>(project?.status === 'Live' ? 'Published' : 'Draft');
  if (!project) return <Navigate to="/projects" replace />;
  const o = OVERVIEWS[project.id] ?? NO_OVERVIEW;
  const live = status === 'Published';
  const shown = new Set(PANELS.filter((_, i) => [setupOpen, railOpen, previewOpen][i]));
  const next = NEXT[status];

  return (
    <div className="bo-phase bo-project">
      <h1 className="bo-visually-hidden">{project.title}</h1>
      <div className="bo-project-bar">
        <IconButton aria-label={setupOpen ? 'Hide project setup' : 'Show project setup'} onPress={() => setSetupOpen(v => !v)}>
          <PanelLeft aria-hidden size={16} />
        </IconButton>
        <ProjectHeader projectName={project.title} parentHref="#/projects" />
        <span className="bo-push" />
        <Avatar initials={ME.slice(-1)} aria-label={`${ME} is here`} />
        <MenuTrigger>
          <Button variant="secondary" size={32} hasMenu><Eye aria-hidden size={16} />View</Button>
          <Menu aria-label="View" selectionMode="multiple" selectedKeys={shown}
            onSelectionChange={k => {
              const on = k === 'all' ? new Set<string>(PANELS) : new Set([...k].map(String));
              setSetupOpen(on.has('setup')); setRailOpen(on.has('rail')); setPreviewOpen(on.has('preview'));
            }}>
            <MenuItem id="setup">Project setup</MenuItem>
            <MenuItem id="rail">Participation</MenuItem>
            <MenuItem id="preview">Resident preview</MenuItem>
          </Menu>
        </MenuTrigger>
        <MenuTrigger>
          <Button variant="secondary" size={32} hasMenu>Share</Button>
          <Menu aria-label="Share" onAction={k => (k === 'invite' ? setInviting(true) : toast('Link copied'))}>
            <MenuItem id="invite" textValue="Invite people" icon={<UserPlus aria-hidden size={16} />}>Invite people</MenuItem>
            <MenuItem id="copy" textValue="Copy link" isDisabled={!live} icon={<Link aria-hidden size={16} />}>Copy link</MenuItem>
          </Menu>
        </MenuTrigger>
        <MenuTrigger>
          <Button variant="quiet" size={32} hasMenu iconOnly={false} aria-label={`${live ? 'Live' : status}: change status`}>
            <StatusBadge state={live ? 'live' : 'draft'}>{live ? '● Live' : status}</StatusBadge>
          </Button>
          <Menu aria-label="Project status" onAction={() => setConfirm(next.to)}>
            <MenuItem id={next.to}>{next.label}</MenuItem>
          </Menu>
        </MenuTrigger>
      </div>
      <div className="bo-phase-body bo-project-body">
        {setupOpen && <Setup project={project} o={o} live={live} onSettings={setSettings} />}
        {railOpen ? (
          <ProjectRail project={project} added={added} onAdd={() => setAdding(true)} onHide={() => setRailOpen(false)}
            href={p => `#/projects/${project.id}/phases/${p.id}/build`} />
        ) : (
          <aside className="bo-phase-panel bo-project-rail-closed" aria-label="Participation">
            <IconButton aria-label="Show the participation rail" onPress={() => setRailOpen(true)}><PanelLeft aria-hidden size={16} /></IconButton>
          </aside>
        )}
        {previewOpen && (
          <section className="bo-phase-stage bo-phase-grow" aria-label="Preview">
            <Phone project={project} o={o} />
          </section>
        )}
      </div>
      <ProjectSettings project={project} tab={settings} onTabChange={setSettings} onClose={() => setSettings(null)} />
      <AddPhase isOpen={adding} onOpenChange={setAdding} onAdd={p => setAdded(a => [...a, p])} />
      <Modal title="Invite people" isOpen={inviting} onOpenChange={setInviting}
        footer={<>
          <Button variant="secondary" size={32} slot="close">Cancel</Button>
          <Button size={32} onPress={() => { setInviting(false); toast('Invitation sent'); }}>Send invite</Button>
        </>}>
        <TextField label="Email" type="email" placeholder="name@example.org" autoFocus />
      </Modal>
      <AlertDialog title={confirm ? `${NEXT[status].label}?` : ''} isOpen={confirm !== null} onOpenChange={v => { if (!v) setConfirm(null); }}
        confirmLabel={NEXT[status].label} onConfirm={() => { if (confirm) { setStatus(confirm); toast(DONE[confirm]); } setConfirm(null); }}>
        <p className="bo-note bo-phase-flush">
          {status === 'Draft' ? 'Residents can see the project and take part as soon as it is published.'
            : status === 'Published' ? 'Residents can still read the project, but can no longer take part.'
            : 'The project goes back to draft: only managers can see it.'}
        </p>
      </AlertDialog>
      <ToastRegion />
    </div>
  );
}

// The setup column is a Panel (the cog in its head), its parts Panel sections: what is collecting now and the next
// actions once live, the publish checklist before; the project's details fold away in a Property list.
function Setup({project, o, live, onSettings}: {project: Project; o: Overview; live: boolean; onSettings: (tab: SettingsTab) => void}) {
  const navigate = useNavigate();
  const [stub, setStub] = useState<string | null>(null);
  return (
    <Panel title="Project setup" className="bo-project-setup"
      actions={<IconButton aria-label="Project settings" onPress={() => onSettings('General')}><Settings aria-hidden size={16} /></IconButton>}>
      <div className="bo-project-setup-body">
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
                  <ChecklistStep step={c} onOpen={title => { const t = CHECKLIST_TAB[title]; if (t) onSettings(t); else setStub(title); }} />
                </li>
              ))}
            </ul>
          </PanelSection>
        )}
        <Divider />
        <PanelSection title="Project details" collapsible>
          <PropertyList>
            <PropertyListItem label="Dates">{project.start && `${project.start}${project.end ? ` to ${project.end}` : ''}`}</PropertyListItem>
            <PropertyListItem label="Folder">{project.folder ?? 'No folder'}</PropertyListItem>
            <PropertyListItem label="Visibility">{project.access ?? 'Anyone'}</PropertyListItem>
            <PropertyListItem label="Managers">{project.managers?.length ? project.managers.join(', ') : 'Nobody yet'}</PropertyListItem>
          </PropertyList>
        </PanelSection>
      </div>
      <CardStub title={stub} onClose={() => setStub(null)} />
    </Panel>
  );
}

// What a resident sees: the platform header, the project's picture, title and intro, the participation box.
function Phone({project, o}: {project: Project; o: Overview}) {
  const people = project.participants ?? 0;
  return (
    <PhonePreview aria-label="What residents see" header={<PhoneHeader />}>
      <PhoneImage aria-label="Project image" />
      <h2>{project.title}</h2>
      <p>{o.intro}</p>
      <div className="bo-project-phone-box">
        <Button>{o.ways > 1 ? `Participate · ${o.ways} ways` : 'Participate'} <ChevronUp aria-hidden size={16} /></Button>
        {people > 0 && (
          <AvatarGroup initials={['A', 'B', 'C']}>
            {people.toLocaleString('en-GB')} participants <Info aria-hidden size={14} />
          </AvatarGroup>
        )}
      </div>
      {o.more.map(t => <p key={t}>{t}</p>)}
    </PhonePreview>
  );
}
