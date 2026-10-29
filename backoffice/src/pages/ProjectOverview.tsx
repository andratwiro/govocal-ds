import {useEffect, useState} from 'react';
import {Navigate, useNavigate, useParams} from 'react-router';
import {Archive, ChevronUp, Info, Link, PanelLeft, Rocket, RotateCcw, Settings, UserPlus} from 'lucide-react';
import {ActionRow, ActionRowList, AlertDialog, Avatar, AvatarGroup, Banner, Button, Divider, IconButton, MenuItem,
  Modal, Panel, PanelSection, PhoneHeader, PhoneImage, PhonePreview, PhoneStage, ProjectHeader, PropertyList,
  PropertyListItem, queue, StatCard, TextField, ToastRegion} from 'govocal-ds';
import {ME, PROJECTS, type Project} from '../data';
import {NO_OVERVIEW, OVERVIEWS, type NewPhase, type Overview} from '../data-project';
import {AddPhase, CHECKLIST, CHECKLIST_TAB, CardStub, ChecklistStep, ProjectRail, ProjectSettings, useDeletedPhases,
  type SettingsTab} from './ProjectPhase';

// The project's publication status: one next step from each state, asked first (an Alert dialog).
type PubStatus = 'Draft' | 'Published' | 'Archived';
const NEXT: Record<PubStatus, {to: PubStatus; label: string}> = {
  Draft: {to: 'Published', label: 'Publish project'},
  Published: {to: 'Archived', label: 'Archive project'},
  Archived: {to: 'Draft', label: 'Restore to draft'}
};
const NEXT_ICON = {Draft: Rocket, Published: Archive, Archived: RotateCcw};
const DONE: Record<PubStatus, string> = {Draft: 'Project back in draft', Published: 'Project published', Archived: 'Project archived'};
// Copying a link or sending an invitation is done at once: a Toast says so.
const toast = (title: string) => queue.add({title}, {timeout: 5000});

// A project's own page, after the prototype's live project screen: the Project header's bar over three columns,
// Project setup | the Participation rail | what a resident sees on a phone.
export function ProjectOverview() {
  const {projectId} = useParams();
  // One state per project: moving to another project's overview starts afresh (its own status, columns and phases).
  return <Overview key={projectId} projectId={projectId} />;
}

function Overview({projectId}: {projectId?: string}) {
  const [setupOpen, setSetupOpen] = useState(true);
  const [railOpen, setRailOpen] = useState(true);
  const [settings, setSettings] = useState<SettingsTab | null>(null);
  const [adding, setAdding] = useState(false);
  const [added, setAdded] = useState<NewPhase[]>([]);
  const [removed, deletePhase] = useDeletedPhases();
  const [inviting, setInviting] = useState(false);
  const [confirm, setConfirm] = useState<PubStatus | null>(null);
  const [dirty, setDirty] = useState(false);
  const project = PROJECTS.find(p => p.id === projectId);
  const [status, setStatus] = useState<PubStatus>(project?.status === 'Live' ? 'Published' : 'Draft');
  if (!project) return <Navigate to="/projects" replace />;
  const o = OVERVIEWS[project.id] ?? NO_OVERVIEW;
  const live = status === 'Published';
  const next = NEXT[status];
  const NextIcon = NEXT_ICON[status];

  return (
    <div className="bo-phase bo-project">
      <h1 className="bo-visually-hidden">{project.title}</h1>
      {/* Project header's "Share and Publish" story: the setup toggle and crumbs, who is here, Share ▾, then Publish ▾
          (a draft; an archived project too, whose menu restores it) or ● Live ▾. Unsaved setup: one Save instead. */}
      <ProjectHeader projectName={project.title} parentHref="#/projects" onTogglePanel={() => setSetupOpen(v => !v)}
        people={<Avatar initials={ME.slice(-1)} aria-label={`${ME} is here`} />}
        hasChanges={dirty} onSave={() => { setDirty(false); toast('Changes saved'); }}
        shareMenu={<>
          <MenuItem id="invite" textValue="Invite people" icon={<UserPlus aria-hidden size={16} />} onAction={() => setInviting(true)}>Invite people</MenuItem>
          <MenuItem id="copy" textValue="Copy link" isDisabled={!live} icon={<Link aria-hidden size={16} />} onAction={() => toast('Link copied')}>Copy link</MenuItem>
        </>}
        status={live ? 'live' : 'draft'}
        publishMenu={(
          <MenuItem id={next.to} textValue={next.label} icon={<NextIcon aria-hidden size={16} />} onAction={() => setConfirm(next.to)}>
            {next.label}
          </MenuItem>
        )} />
      <div className="bo-phase-body bo-project-body">
        {setupOpen && <Setup project={project} o={o} live={live} archived={status === 'Archived'} onSettings={setSettings}
          onChange={() => setDirty(true)} />}
        {railOpen ? (
          <ProjectRail project={project} added={added} onAdd={() => setAdding(true)} onHide={() => setRailOpen(false)}
            removed={removed} onDelete={deletePhase} href={p => `#/projects/${project.id}/phases/${p.id}/build`} />
        ) : (
          <aside className="bo-phase-panel bo-project-rail-closed" aria-label="Participation">
            <IconButton aria-label="Show the participation rail" onPress={() => setRailOpen(true)}><PanelLeft aria-hidden size={16} /></IconButton>
          </aside>
        )}
        <section className="bo-phase-grow bo-phase-stage-box" aria-label="Preview">
          {/* Phone preview's "On the stage": the phone's own action edits the project page. */}
          <PhoneStage caption="What residents see on the project page">
            <Phone project={project} o={o} onEdit={() => setSettings('Project page')} />
          </PhoneStage>
        </section>
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
function Setup({project, o, live, archived, onSettings, onChange}: {project: Project; o: Overview; live: boolean; archived: boolean;
  onSettings: (tab: SettingsTab) => void; onChange: () => void}) {
  const navigate = useNavigate();
  const [stub, setStub] = useState<string | null>(null);
  return (
    <Panel title="Project setup" className="bo-project-setup"
      actions={<IconButton aria-label="Project settings" onPress={() => onSettings('General')}><Settings aria-hidden size={16} /></IconButton>}>
      <div className="bo-project-setup-body">
        {archived && (
          <Banner density="compact" tone="neutral" title="Archived">Residents can read the project but no longer take part.</Banner>
        )}
        {live ? (
          <>
            <PanelSection title="Collecting now">
              <StatCard label="Participants" value={(project.participants ?? 0).toLocaleString('en-GB')} series={o.weeks}
                caption={o.since ? `Weekly, since ${o.since}` : 'Numbers appear here once participants take part'}
                onPress={() => navigate('/dashboard')} />
            </PanelSection>
            <Divider />
            <PanelSection title="Next actions">
              <ActionRowList aria-label="Next actions">
                <ActionRow href="#/messaging">Message participants</ActionRow>
                <CreateReport />
              </ActionRowList>
            </PanelSection>
          </>
        ) : !archived && (
          <PanelSection title="Before you publish" aside={`0 of ${CHECKLIST.length} ready`}>
            <ul className="bo-phase-stack">
              {CHECKLIST.map(c => (
                <li key={c.title} data-gv="setup-card">
                  <ChecklistStep step={c} onChange={onChange}
                    onOpen={title => { const t = CHECKLIST_TAB[title]; if (t) onSettings(t); else setStub(title); }} />
                </li>
              ))}
            </ul>
          </PanelSection>
        )}
        <Divider />
        <PanelSection title="Project details" isCollapsible>
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

// Create report runs in its own row (Action row's working state, its ring filling), then opens the report.
const REPORT_SECONDS = 4;
function CreateReport() {
  const [left, setLeft] = useState<number | null>(null);
  useEffect(() => {
    if (left == null || left === 0) return;
    const t = setTimeout(() => setLeft(s => (s ?? 1) - 1), 1000);
    return () => clearTimeout(t);
  }, [left]);
  if (left === 0) return <ActionRow status="done" href="#/reporting">Report ready</ActionRow>;
  if (left != null) {
    return (
      <ActionRow status="working" progress={(REPORT_SECONDS - left) / REPORT_SECONDS * 100} badge={`${left}s`}
        description="Reading the results so far">Creating report</ActionRow>
    );
  }
  return <ActionRow onPress={() => setLeft(REPORT_SECONDS)}>Create report</ActionRow>;
}

// What a resident sees: the platform header, the project's picture, title and intro, the participation box. The
// phone's action (on hover or focus) opens the project page's settings.
function Phone({project, o, onEdit}: {project: Project; o: Overview; onEdit: () => void}) {
  const people = project.participants ?? 0;
  return (
    <PhonePreview aria-label="What residents see" header={<PhoneHeader />} action={{label: 'Edit project page', onPress: onEdit}}>
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
