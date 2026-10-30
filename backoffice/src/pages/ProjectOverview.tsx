import {useEffect, useState} from 'react';
import {Navigate, useNavigate, useParams} from 'react-router';
import {Archive, ChevronUp, Info, Link, Rocket, RotateCcw, Settings} from 'lucide-react';
import {ActionRow, AlertDialog, Avatar, AvatarGroup, Badge, Button, Card, Divider, Grid, IconButton, Inline, MenuItem, Panel,
  PanelSection, PhoneHeader, PhoneImage, PhonePreview, PhoneStage, ProjectHeader, SectionLabel, Select, SelectItem, Stack, StatCard,
  Text, TextField, toast, useNumberFormatter, VisuallyHidden} from 'govocal-ds';
import {Dialog, DialogTrigger, Form, Popover} from 'govocal-ds/base';
import {useOpenNav} from '../Layout';
import {ME, PROJECTS, type Project} from '../data';
import {NO_OVERVIEW, OVERVIEWS, type NewPhase, type Overview} from '../data-project';
import {AddPhase, CHECKLIST, CHECKLIST_TAB, CardStub, ChecklistStep, LOGO, NAV_TOGGLE, ProjectRail, ProjectSettings, Workspace,
  WorkspaceRail, useDeletedPhases, useRailCollapsed, type SettingsTab} from './ProjectPhase';

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

// A project's own page, after the prototype's live project screen: the Project header's bar over Workspace layout's
// columns, the Participation rail | Project setup | what a resident sees on a phone.
export function ProjectOverview() {
  const {projectId} = useParams();
  // One state per project: moving to another project's overview starts afresh (its own status, columns and phases).
  return <Overview key={projectId} projectId={projectId} />;
}

function Overview({projectId}: {projectId?: string}) {
  const openNav = useOpenNav();
  const [railCollapsed, setRailCollapsed] = useRailCollapsed();
  const [settings, setSettings] = useState<SettingsTab | null>(null);
  const [adding, setAdding] = useState(false);
  const [added, setAdded] = useState<NewPhase[]>([]);
  const [removed, deletePhase] = useDeletedPhases();
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
    <Grid rows="auto 1fr" gap="8" className="bo-phase">
      <VisuallyHidden elementType="h1">{project.title}</VisuallyHidden>
      {/* Project header's bar: the panel toggle opens the platform's menu, the crumbs, who is here, Share ▾ (the Access
          popover recipe in its `share` slot), then Publish ▾, ● Live ▾ or Archived ▾ (whose menu restores it).
          Unsaved setup: one Save instead. */}
      <ProjectHeader projectName={project.title} parentHref="#/projects" onTogglePanel={openNav} labels={{toggleSetup: NAV_TOGGLE}}
        people={<Avatar initials={ME.slice(-1)} aria-label={`${ME} is here`} />}
        hasChanges={dirty} onSave={() => { setDirty(false); toast('Changes saved'); }}
        share={<SharePopover project={project} canCopy={live} />}
        status={live ? 'live' : status === 'Archived' ? 'archived' : 'draft'}
        publishMenu={(
          <MenuItem id={next.to} textValue={next.label} icon={<NextIcon aria-hidden size={16} />} onAction={() => setConfirm(next.to)}>
            {next.label}
          </MenuItem>
        )} />
      {/* Workspace layout: the Participation rail (its own button collapses it to a strip), Project setup in the work
          column, and what residents see on the stage. */}
      <WorkspaceRail isCollapsed={railCollapsed} onCollapsedChange={setRailCollapsed}>
        <Workspace column={<Setup project={project} o={o} live={live} draft={status === 'Draft'} onSettings={setSettings}
          onChange={() => setDirty(true)} />}
          rail={<ProjectRail project={project} added={added} onAdd={() => setAdding(true)} onHide={() => setRailCollapsed(true)}
            removed={removed} onDelete={deletePhase} href={p => `#/projects/${project.id}/phases/${p.id}/build`} />}>
          <Grid elementType="section" aria-label="Preview" className="bo-fill">
            {/* Phone preview's "On the stage": the phone's own action edits the project page. */}
            <PhoneStage caption="What residents see on the project page">
              <Phone project={project} o={o} onEdit={() => setSettings('Project page')} />
            </PhoneStage>
          </Grid>
        </Workspace>
      </WorkspaceRail>
      <ProjectSettings project={project} tab={settings} onTabChange={setSettings} onClose={() => setSettings(null)} />
      <AddPhase isOpen={adding} onOpenChange={setAdding} onAdd={p => setAdded(a => [...a, p])} />
      <AlertDialog title={confirm ? `${NEXT[status].label}?` : ''} isOpen={confirm !== null} onOpenChange={v => { if (!v) setConfirm(null); }}
        confirmLabel={NEXT[status].label} onConfirm={() => { if (confirm) { setStatus(confirm); toast(DONE[confirm]); } setConfirm(null); }}>
        <Text elementType="p" kind="small" color="meta">
          {status === 'Draft' ? 'Residents can see the project and take part as soon as it is published.'
            : status === 'Published' ? 'Residents can still read the project, but can no longer take part.'
            : 'The project goes back to draft: only managers can see it.'}
        </Text>
      </AlertDialog>
    </Grid>
  );
}

// The Access popover recipe (its "Default" story), built here from Stack, Inline and Text so the page's CSS only places
// it: invite by email, the people with access with their roles, Copy link (on once the project is published).
const ROLES = [{id: 'edit', label: 'Can edit'}, {id: 'view', label: 'Can view'}];
type Person = {id: string; name: string; email: string; role: string};
const handle = (name: string) => name.toLowerCase().replace(/\W+/g, '.');

function SharePopover({project, canCopy}: {project: Project; canCopy: boolean}) {
  const [people, setPeople] = useState<Person[]>(() => (project.managers?.length ? project.managers : [ME]).map((name, i) => ({
    id: name, name, email: `${handle(name)}@example.org`, role: i === 0 ? 'owner' : 'edit'
  })));
  const [emails, setEmails] = useState('');
  const invite = () => {
    const added = emails.split(',').map(e => e.trim()).filter(Boolean)
      .filter(email => !people.some(p => p.email === email))
      .map(email => ({id: email, name: email.split('@')[0], email, role: 'view'}));
    if (!added.length) return;
    setPeople(p => [...p, ...added]);
    setEmails('');
    toast(added.length === 1 ? 'Invitation sent' : `${added.length} invitations sent`);
  };
  return (
    <DialogTrigger>
      <Button variant="secondary" size={32} hasMenu>Share</Button>
      <Popover placement="bottom end" offset={6} showArrow={false}>
        <Dialog aria-label="Share" className="bo-project-share">
          <Stack gap="12">
            <Form onSubmit={e => { e.preventDefault(); invite(); }}>
              <Stack gap="4">
                <SectionLabel>Invite people</SectionLabel>
                <Inline gap="8" wrap="nowrap">
                  <TextField aria-label="Email or group" placeholder="Email or group, separated by commas" value={emails}
                    onChange={setEmails} className="bo-push" />
                  <Button type="submit" size={32}>Invite</Button>
                </Inline>
              </Stack>
            </Form>
            <Stack gap="4">
              <SectionLabel>People with access</SectionLabel>
              <Stack elementType="ul" gap="8" aria-label="People with access">
                {people.map(p => (
                  <Inline key={p.id} elementType="li" gap="12" wrap="nowrap">
                    <Avatar initials={p.name.slice(-1).toUpperCase()} />
                    <Stack className="bo-push">
                      <Inline gap="6">
                        <Text kind="ui" isStrong>{p.name}</Text>
                        {p.name === ME && <Badge variant="outlined">you</Badge>}
                      </Inline>
                      <Text kind="small" color="meta">{p.email}</Text>
                    </Stack>
                    {p.role === 'owner' ? <Text color="meta">Owner</Text> : (
                      <Select aria-label={`Role for ${p.name}`} variant="quiet" value={p.role}
                        onChange={role => setPeople(all => all.map(q => (q.id === p.id ? {...q, role: String(role)} : q)))}>
                        {ROLES.map(r => <SelectItem key={r.id} id={r.id}>{r.label}</SelectItem>)}
                      </Select>
                    )}
                  </Inline>
                ))}
              </Stack>
            </Stack>
            <Button variant="secondary" isFullWidth isDisabled={!canCopy} onPress={() => toast('Link copied')}>
              <Link aria-hidden size={16} />Copy link
            </Button>
          </Stack>
        </Dialog>
      </Popover>
    </DialogTrigger>
  );
}

// The setup column, a plain Panel (the cog in its head) on the column's white: what is collecting now and the next
// actions once live; before publishing, the project's setup steps (Card's link and pick rows); after, the same steps
// fold away under Project details.
function Setup({project, o, live, draft, onSettings, onChange}: {project: Project; o: Overview; live: boolean; draft: boolean;
  onSettings: (tab: SettingsTab) => void; onChange: () => void}) {
  const navigate = useNavigate();
  const number = useNumberFormatter();
  const [stub, setStub] = useState<string | null>(null);
  const steps = (
    <Stack elementType="ul" gap="8" aria-label="Setup steps">
      {CHECKLIST.map(c => (
        <li key={c.title} data-gv="setup-card">
          <ChecklistStep step={c} onChange={onChange}
            onOpen={title => { const t = CHECKLIST_TAB[title]; if (t) onSettings(t); else setStub(title); }} />
        </li>
      ))}
    </Stack>
  );
  return (
    <Panel variant="plain" title="Project setup"
      actions={<IconButton aria-label="Project settings" onPress={() => onSettings('General')}><Settings aria-hidden size={16} /></IconButton>}>
      <Stack gap="24">
        {live && (
          <>
            <PanelSection title="Collecting now">
              <StatCard label="Participants" value={number.format(project.participants ?? 0)} series={o.weeks}
                caption={o.since ? `Weekly, since ${o.since}` : 'Numbers appear here once participants take part'}
                onPress={() => navigate('/dashboard')} />
            </PanelSection>
            <Divider />
            {/* Card's "Setup row · link": each next action one link; Create report runs in its own row (Action row). */}
            <PanelSection title="Next actions">
              <Stack elementType="ul" gap="8" aria-label="Next actions">
                <li><Card title="Message participants" control="link" href="#/messaging" /></li>
                <li><CreateReport /></li>
              </Stack>
            </PanelSection>
            <Divider />
          </>
        )}
        {draft ? (
          <PanelSection title="Before you publish" aside={`0 of ${CHECKLIST.length} ready`}>{steps}</PanelSection>
        ) : (
          <PanelSection title="Project details" isCollapsible>{steps}</PanelSection>
        )}
      </Stack>
      <CardStub title={stub} onClose={() => setStub(null)} />
    </Panel>
  );
}

// Create report: a link row (Card) that, pressed, runs in its own row (Action row's working state, its ring filling,
// then done), which opens the report: the one place the recipe keeps Action row.
const REPORT_SECONDS = 4;
function CreateReport() {
  const [left, setLeft] = useState<number | null>(null);
  // The countdown in the locale's own short unit: "4s" (en), "4 s" (fr, de).
  const seconds = useNumberFormatter({style: 'unit', unit: 'second', unitDisplay: 'narrow'});
  useEffect(() => {
    if (left == null || left === 0) return;
    const t = setTimeout(() => setLeft(s => (s ?? 1) - 1), 1000);
    return () => clearTimeout(t);
  }, [left]);
  if (left === 0) return <ActionRow status="done" href="#/reporting">Report ready</ActionRow>;
  if (left != null) {
    return (
      <ActionRow status="working" progress={(REPORT_SECONDS - left) / REPORT_SECONDS * 100} badge={seconds.format(left)}
        description="Reading the results so far">Creating report</ActionRow>
    );
  }
  return <Card title="Create report" control="link" onOpen={() => setLeft(REPORT_SECONDS)} />;
}

// What a resident sees: the platform header, the project's picture, title and intro, the participation box. The
// phone's action (on hover or focus) opens the project page's settings.
function Phone({project, o, onEdit}: {project: Project; o: Overview; onEdit: () => void}) {
  const people = project.participants ?? 0;
  const number = useNumberFormatter();
  return (
    <PhonePreview aria-label="What residents see" header={<PhoneHeader mark={LOGO} logo="Larkvale" />} action={{label: 'Edit project page', onPress: onEdit}}>
      <PhoneImage aria-label="Project image" />
      <h2>{project.title}</h2>
      <p>{o.intro}</p>
      <Stack gap="12" alignItems="start">
        <Button isFullWidth>{o.ways > 1 ? `Participate · ${o.ways} ways` : 'Participate'} <ChevronUp aria-hidden size={16} /></Button>
        {people > 0 && (
          <AvatarGroup initials={['A', 'B', 'C']}>
            {number.format(people)} participants <Info aria-hidden size={14} />
          </AvatarGroup>
        )}
      </Stack>
      {o.more.map(t => <p key={t}>{t}</p>)}
    </PhonePreview>
  );
}
