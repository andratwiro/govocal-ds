import {useState, type Dispatch, type ReactNode, type SetStateAction} from 'react';
import {Navigate, useNavigate, useParams} from 'react-router';
import {CalendarDays, CircleCheck, Copy, Download, ExternalLink, FileChartColumn, FileText, Inbox, Lightbulb, Link2, Lock, Mail,
  MessageSquareText, Paperclip, MapPin, Plus, Settings, Sparkles, SquarePen, Tag, Trash2, TriangleAlert, Upload, User, Users} from 'lucide-react';
import {ACCESS_WHO_VALUE, AccessRightsModal, type AccessWho, ActionRow, ActionRowList, Avatar, Badge, Banner,
  BulkOfficialUpdate, Button, Card, type ChartColor, CommentThread, CompactButton, DashboardBars, DashboardCard,
  DashboardDemographic, DashboardList, DashboardRanking, DashboardTopics, DataTable, DataTableAddColumn,
  DataTableAssignee, DataTableBody, DataTableCell, DataTableColumn, DataTableEmpty, DataTableHeader, DataTableRow,
  DataTableTags, DataTableText, DataTableThumbnail, DateRangeField, DropZone, EmptyState, FileList,
  type FileListItemData, FilterChips, type FilterFacet, FilterMenu, type FilterValue, GroupedTab, GroupedTabList,
  GroupedTabPanel, GroupedTabs, IconButton, LineChart, ListHeader, type ListHeaderColumn, Menu, MenuItem, MenuSection,
  MenuTrigger, Modal, NotificationEmail, NotificationRow, NotificationRowList, OfficialUpdate, OptionList, Pagination,
  Panel, PanelSection, ParticipantActionList, ParticipantActionRow, ParticipantLimit, PhaseTimeline, PhoneHeader,
  PhoneImage, PhonePreview, PhoneStage, type PostedUpdate, ProjectHeader, PropertyList, PropertyListItem, ProposalsRow,
  queue, RailHeader, RailPhase, ReactionCounts, SearchField, SectionLabel, SegmentedControl, SegmentedControlItem,
  Select, type SelectionAction, SelectionBar, SelectItem, Separator, SetupStep, SidePanel, SidePanelActions,
  SidePanelDecision, SidePanelSection, Sparkline, StatRow, StatTile, SubmenuTrigger, TableToolbar, TableToolbarHeading,
  TabSection, TextField, type ThreadComment, type ThreadTab, type ThreadTarget, type TimelinePhase, TitleField,
  ToastRegion, ViewOptionList, ViewOptionRow, VolunteeringRow, VotingRow} from 'govocal-ds';
import {Dialog, Form, Tag as TagItem, TagGroup} from 'govocal-ds/base';
import {PICTURES} from '../../../src/components/gv/story-images';
// Form field summary is a recipe (a story and its CSS): the page keeps its markup and uses the recipe's stylesheet.
import {ME, METHODS, PROJECTS, type Method, type Phase, type Project} from '../data';
import {IDEAS, IDEA_ASSIGNEES, IDEA_REPLIES, IDEA_SOURCES, IDEA_STATUSES, IDEA_TAGS, AREAS, TOPICS, PHASE_FILES, SCREENING_PHASES, TEAM, addedTimeline,
  NO_OVERVIEW, OVERVIEWS, PHONE_CALL, INSIGHT_WEEKS, PARTICIPATION_WEEKS, AI_SUMMARY, VOTE_OPTIONS, VOTES_BY_DAY, VOTER_AGES,
  VOTER_COMMUTES, PROPOSALS, IDEA_FORM, PARTICIPANT_ACTIONS, IDEA_VIEWS, PHASE_EMAILS, CAUSES,
  ideaComments, ideaInternal, ideaUpdates, timeline, type Idea, type IdeaStatus, type NewPhase} from '../data-project';


// The phase screen, from the Figma frames "Project · Build" and "Ideation · Manage (data)" (Screens WIP):
// a header bar (Project header · mode switch · actions) over the Participation rail and the tab's panels.
const TABS = ['build', 'manage', 'insights'] as const;
type Tab = typeof TABS[number];
const label = (t: string) => t[0].toUpperCase() + t.slice(1);
const phaseUrl = (project: Project, phase: Phase, tab: Tab) => `/projects/${project.id}/phases/${phase.id}/${tab}`;

export function ProjectPhase() {
  // One state per project: a phase added on one project's rail stays there.
  return <PhaseScreen key={useParams().projectId} />;
}

function PhaseScreen() {
  const {projectId, phaseId, tab} = useParams();
  const navigate = useNavigate();
  const [railOpen, setRailOpen] = useState(true);
  const [settings, setSettings] = useState<SettingsTab | null>(null);
  const [adding, setAdding] = useState(false);
  const [added, setAdded] = useState<NewPhase[]>([]);
  const [removed, deletePhase] = useDeletedPhases();
  const [dirty, setDirty] = useState(false);
  const project = PROJECTS.find(p => p.id === projectId);
  if (!project) return <Navigate to="/projects" replace />;
  const phase = project.phases.find(p => p.id === phaseId) ?? project.phases[0];
  if (phase.id !== phaseId || !TABS.includes(tab as Tab)) return <Navigate to={phaseUrl(project, phase, 'build')} replace />;
  const view = tab as Tab;

  return (
    <div className="bo-phase" data-rail={railOpen ? 'open' : 'closed'}>
      <h1 className="bo-visually-hidden">{project.title}</h1>
      {/* Project header's bar (its "With mode switch" story): crumbs, Build · Manage · Insights, who is here, Save. Save
          turns on once something in the setup changes. A phase that hasn't started keeps Manage and Insights open: they
          show the Empty state. */}
      <ProjectHeader level="phase" status={phase.status === 'Draft' ? 'draft' : 'live'} projectName={project.title} phaseName={phase.title}
        projectHref={`#/projects/${project.id}`} onBack={() => navigate(`/projects/${project.id}`)} onTogglePanel={() => setRailOpen(o => !o)}
        modes={TABS.map(t => ({id: t, label: label(t)}))} mode={view} onModeChange={t => navigate(phaseUrl(project, phase, t as Tab))}
        people={<Avatar initials={ME.slice(-1)} aria-label={`${ME} is here`} />}
        hasChanges={dirty} onSave={() => { setDirty(false); queue.add({title: 'Changes saved'}, {timeout: 5000}); }} />
      <div className="bo-phase-body" data-view={view}>
        {railOpen && <ProjectRail project={project} current={phase.id} added={added} onAdd={() => setAdding(true)}
          removed={removed} onDelete={deletePhase} href={p => `#${phaseUrl(project, p, view)}`} />}
        {view === 'build' && <Build key={`${project.id}/${phase.id}`} project={project} phase={phase} onSettings={setSettings}
          onChange={() => setDirty(true)} />}
        {/* A phase that hasn't started has collected nothing: Manage and Insights show the Empty state. */}
        {view !== 'build' && phase.status === 'Draft' && <EmptyTab phase={phase} tab={view} />}
        {view === 'manage' && phase.status !== 'Draft' && (phase.method === 'Ideation'
          ? <Manage key={`${project.id}/${phase.id}`} phase={phase} project={project} onAddPhase={() => setAdding(true)} />
          : <MethodManage phase={phase} />)}
        {view === 'insights' && phase.status !== 'Draft' && <Insights key={`${project.id}/${phase.id}`} project={project} phase={phase} />}
      </div>
      <ProjectSettings project={project} tab={settings} onTabChange={setSettings} onClose={() => setSettings(null)} />
      <AddPhase isOpen={adding} onOpenChange={setAdding} onAdd={p => setAdded(a => [...a, p])} />
      <ToastRegion />
    </div>
  );
}

/** Phases deleted from the rail (Rail phase's delete button): gone at once, a Toast can undo it. */
export function useDeletedPhases(): [Set<string>, (p: TimelinePhase) => void] {
  const [removed, setRemoved] = useState<Set<string>>(new Set());
  const remove = (p: TimelinePhase) => {
    setRemoved(s => new Set(s).add(p.id));
    undoToast(`${p.title} deleted`, () => setRemoved(s => new Set([...s].filter(id => id !== p.id))));
  };
  return [removed, remove];
}

const RAIL_WORD = {done: 'Done', 'in-progress': 'In progress', upcoming: 'Upcoming'} as const;
const RAIL_DOT = {done: 'completed', 'in-progress': 'live', upcoming: 'upcoming'} as const;

/** The Participation rail, on the project overview and the phase screen alike: the Rail header (Add a phase, and on
 * the overview the panel toggle), the timeline, then the spotlight methods running beside it. */
export function ProjectRail({project, href, current, added, onAdd, onHide, removed, onDelete}: {project: Project;
  href: (p: Phase) => string; current?: string; added: NewPhase[]; onAdd: () => void; onHide?: () => void;
  removed: Set<string>; onDelete: (p: TimelinePhase) => void}) {
  const spotlight = (OVERVIEWS[project.id] ?? NO_OVERVIEW).spotlight;
  const phases = [...timeline(project, href, current), ...addedTimeline(added)].filter(p => !removed.has(p.id));
  return (
    <aside className="bo-phase-panel bo-phase-rail" aria-label="Participation">
      <RailHeader title="Participation" onAdd={onAdd} addLabel="Add a phase"
        onTogglePanel={onHide} togglePanelLabel="Hide the participation rail" />
      <nav aria-label="Phases" className="bo-phase-rail-section">
        <SectionLabel>Timeline</SectionLabel>
        {/* Phase timeline's rows, drawn here as Rail phases: the timeline takes no delete (Rail phase's onDelete). The
            phase being viewed can't be deleted from its own screen. */}
        <ul className="bo-project-rail-list bo-phase-timeline">
          {phases.map(p => (
            <li key={p.id}>
              <RailPhase status={RAIL_DOT[p.status]} isCurrent={p.isCurrent} href={p.href} title={p.title} chip={p.count}
                newCount={p.fresh} statusLabel={RAIL_WORD[p.status]} meta={`${p.dates} · ${p.method}`}
                onDelete={p.isCurrent ? undefined : () => onDelete(p)} />
            </li>
          ))}
        </ul>
      </nav>
      {spotlight.length > 0 && (
        <div className="bo-phase-rail-section">
          <SectionLabel>Spotlight</SectionLabel>
          <div className="bo-project-rail-list"><PhaseTimeline phases={spotlight} /></div>
        </div>
      )}
    </aside>
  );
}

// "Project · Build": the front-office preview on the stage, the setup checklist in the right panel.
export const CHECKLIST: {title: string; action: 'open' | 'expand' | 'pick'; body?: string}[] = [
  {title: 'Settings', action: 'open'},
  {title: 'Edit project page', action: 'open'},
  {title: 'Set project card', action: 'expand', body: 'The card residents see on the homepage and in project lists: an image, a title and a one-line summary.'},
  {title: 'Set area', action: 'pick'},
  {title: 'Set topic tags', action: 'pick'},
  {title: 'Plan participation', action: 'open'}
];

const pin = <MapPin aria-hidden size={16} />;
const counted = (n: number, one: string, many: string) => `${n} ${n === 1 ? one : many}`;

/** Set area, as Setup step's "Opens a picker" story: one of three choices, "Selected areas ›" a checklist of areas. */
function SetArea({onChange}: {onChange?: () => void}) {
  const [mode, setMode] = useState<string | null>(null);
  const [areas, setAreas] = useState<Set<string>>(new Set());
  const names = AREAS.filter(a => areas.has(a));
  const value = mode === 'none' ? 'No specific area' : mode === 'all' ? 'All areas'
    : mode === 'selected' && names.length ? (names.length === 1 ? names[0] : counted(names.length, 'area', 'areas')) : undefined;
  return (
    <SetupStep kind="pick" pickerKind="menu" title="Set area" value={value} isDone={value != null} picker={
      <Menu aria-label="Area" selectionMode="single" selectedKeys={mode ? [mode] : []}
        onSelectionChange={keys => { setMode(keys === 'all' ? null : [...keys].map(String)[0] ?? null); onChange?.(); }}>
        <MenuItem id="none" icon={pin} description="The project will not show when filtering by area.">No specific area</MenuItem>
        <MenuItem id="all" icon={pin} description="The project will show on every area filter.">All areas</MenuItem>
        <SubmenuTrigger>
          <MenuItem id="selected" icon={pin} description={names.length ? `${counted(names.length, 'area', 'areas')} selected`
            : 'The project will show on selected area filter(s).'}>Selected areas</MenuItem>
          <Menu aria-label="Areas" selectionMode="multiple" selectedKeys={areas}
            onSelectionChange={keys => { setAreas(new Set(keys === 'all' ? AREAS : [...keys].map(String))); setMode('selected'); onChange?.(); }}>
            {AREAS.map(a => <MenuItem key={a} id={a}>{a}</MenuItem>)}
          </Menu>
        </SubmenuTrigger>
      </Menu>
    } />
  );
}

/** Set topic tags: the Option list, searchable, with its footer and Done. */
function SetTopicTags({onChange}: {onChange?: () => void}) {
  const [tags, setTags] = useState<string[]>([]);
  return (
    <SetupStep kind="pick" title="Set topic tags" value={tags.length ? counted(tags.length, 'tag', 'tags') : undefined}
      isDone={tags.length > 0} picker={
        <OptionList aria-label="Topic tags" items={TOPICS.map(t => ({id: t, label: t}))} value={tags} onChange={t => { setTags(t); onChange?.(); }}
          placeholder="Search tags..." searchLabel="Search tags"
          selectionLabel={k => (k ? `${counted(k, 'tag', 'tags')} selected` : 'No tags selected')} />
      } />
  );
}

/** One step of the setup checklist, on the phase's Build panel and the project overview alike. */
export function ChecklistStep({step, onOpen, onChange}: {step: typeof CHECKLIST[number]; onOpen: (title: string) => void;
  onChange?: () => void}): ReactNode {
  if (step.title === 'Set area') return <SetArea onChange={onChange} />;
  if (step.title === 'Set topic tags') return <SetTopicTags onChange={onChange} />;
  if (step.action === 'expand') return <SetupStep kind="expand" title={step.title}><p className="bo-note bo-phase-flush">{step.body}</p></SetupStep>;
  return <SetupStep title={step.title} onPress={() => onOpen(step.title)} />;
}

// Where each checklist card leads: two open a settings tab, the rest a stub until they're drawn.
export const CHECKLIST_TAB: Partial<Record<string, SettingsTab>> = {'Settings': 'General', 'Edit project page': 'Project page'};

// "Project · Build": what residents see of the phase on the stage (the Phone preview on its Phone stage); the setup in
// a Panel beside it, the project's publish checklist and the phase's own cards each a Panel section. An email opened
// from the Notifications card takes the setup's place (Notification email), the email itself on the phone.
function Build({project, phase, onSettings, onChange}: {project: Project; phase: Phase; onSettings: (tab: SettingsTab) => void;
  onChange: () => void}) {
  const [stub, setStub] = useState<string | null>(null);
  const [attaching, setAttaching] = useState(false);
  const [files, setFiles] = useState<FileListItemData[]>(PHASE_FILES);
  const [emailsOn, setEmailsOn] = useState(() => new Set(PHASE_EMAILS.filter(e => e.on).map(e => e.id)));
  const [emailId, setEmailId] = useState<string | null>(null);
  const open = (title: string) => { const t = CHECKLIST_TAB[title]; if (t) onSettings(t); else setStub(title); };
  const setEmail = (id: string, on: boolean) => {
    setEmailsOn(s => (on ? new Set(s).add(id) : new Set([...s].filter(e => e !== id))));
    onChange();
  };
  const call = PHONE_CALL[phase.method];
  const email = PHASE_EMAILS.find(e => e.id === emailId);
  return (
    <>
      <section className="bo-phase-grow bo-phase-stage-box" aria-label="Preview">
        <PhoneStage caption={email ? 'The email, as residents get it' : 'What residents see while the phase is open'}>
          {email ? (
            <PhonePreview aria-label={`The email: ${email.name}`} header={<PhoneHeader />}>
              <h2>{email.name}</h2>
              <p>{email.when}: this email goes to the {email.who.toLowerCase()}.</p>
              <Button className="bo-phase-phone-call">View it</Button>
            </PhonePreview>
          ) : (
            <PhonePreview aria-label={`What residents see of ${phase.title}`} header={<PhoneHeader />}>
              <PhoneImage aria-label="Project image" />
              <h2>{project.title}</h2>
              <p>{phase.title} · {phase.dates}</p>
              {call && <p>{call.line}</p>}
              <Button className="bo-phase-phone-call">{call?.button ?? 'Take part'}</Button>
            </PhonePreview>
          )}
        </PhoneStage>
      </section>
      <Panel title="Setup" className="bo-phase-side bo-phase-setup"
        actions={<IconButton aria-label="Project settings" onPress={() => onSettings('General')}><Settings aria-hidden size={16} /></IconButton>}>
        {email ? (
          <NotificationEmail key={email.id} name={email.name} who={email.who} when={email.when}
            backLabel={`Back to ${phase.method} setup`} onBack={() => setEmailId(null)}
            isSelected={emailsOn.has(email.id)} onChange={on => setEmail(email.id, on)}
            replyTo="support@example.org" subject={email.name} buttonText="View it" />
        ) : (
          <div className="bo-phase-setup-body">
            <PanelSection title="Before you publish" aside={`0 of ${CHECKLIST.length} ready`}>
              <ul className="bo-phase-stack">
                {CHECKLIST.map(c => (
                  <li key={c.title} data-gv="setup-card"><ChecklistStep step={c} onOpen={open} onChange={onChange} /></li>
                ))}
              </ul>
            </PanelSection>
            <PanelSection title={`${phase.method} setup`}>
              <div className="bo-phase-stack">
                <PhaseStatus phase={phase} />
                {phase.method === 'Ideation' ? (
                  <IdeationCards phase={phase} onOpen={setStub} onAttach={() => setAttaching(true)} files={files.length}
                    onChange={onChange} emailsOn={emailsOn} onEmailChange={setEmail} onEmailOpen={setEmailId} />
                ) : phase.method === 'Volunteering' ? (
                  <VolunteeringCards phase={phase} onOpen={setStub} onChange={onChange} />
                ) : (
                  <p className="bo-note bo-phase-flush">The {phase.method.toLowerCase()} setup cards: not in Figma yet.</p>
                )}
              </div>
            </PanelSection>
          </div>
        )}
      </Panel>
      <CardStub title={stub} onClose={() => setStub(null)} />
      <Attachments isOpen={attaching} onOpenChange={setAttaching} files={files} onChange={setFiles} />
    </>
  );
}

// The phase status strip (the Banner's "Phase status" story): not started and ended are neutral, live is success.
// The meta reads off the phase's dates ("19 Oct to 16 Nov", "01 Apr – 30 Apr 2027", "1 to 21 Sep").
function phaseDates(dates: string): [string, string] | null {
  const parts = dates.split(/\s+(?:to|–)\s+/);
  if (parts.length !== 2) return null;
  const [start, end] = parts;
  // "1 to 21 Sep": the start borrows the end's month.
  return [/^\d+$/.test(start) ? `${start} ${end.replace(/^\d+\s+/, '').replace(/\s+\d{4}$/, '')}` : start, end];
}

function PhaseStatus({phase}: {phase: Phase}) {
  const range = phaseDates(phase.dates);
  if (phase.status === 'Live') return <Banner density="compact" tone="success" title="Live">{range ? `Ends on ${range[1]}` : phase.dates}</Banner>;
  if (phase.status === 'Done') return <Banner density="compact" tone="neutral" title="Ended">{range ? `Closed on ${range[1]}` : phase.dates}</Banner>;
  return <Banner density="compact" tone="neutral" title="Not started">{range ? `Starts on ${range[0]}` : phase.dates}</Banner>;
}

// The phase's own cards, after the "Ideation · Build" Figma frame (Card types Required, Add, Review, To set) and the
// prototype's Build tab: Idea form folds out to the Form field summary recipe; Participant actions, Available views and
// Notifications are each their pattern's "In a card" story.
const firstPlus = (words: string[]) => (words.length ? [{label: words[0] + (words.length > 1 ? ` +${words.length - 1}` : '')}] : undefined);
const DATES_HELP = 'Ideas can be posted from the first day to the last.';

function DatesAndTitle({phase, onChange, help}: {phase: Phase; onChange: () => void; help: string}) {
  return <>
    <li data-gv="setup-card"><Card title="Dates" isRequired summary={phase.dates} control="expand">
      {/* Date range field: it can't start on the phase's dates yet (it takes date objects the back office can't make). */}
      <DateRangeField isRequired description={help} onChange={onChange} />
    </Card></li>
    <li data-gv="setup-card"><Card title="Title and description" isRequired control="expand" defaultExpanded>
      <div className="bo-phase-stack">
        <TitleField aria-label="Phase title" defaultValue={phase.title} isRequired onChange={onChange} />
        <TitleField aria-label="Phase description" placeholder="Add a short description" onChange={onChange} />
      </div>
    </Card></li>
  </>;
}

function IdeationCards({phase, onOpen, onAttach, files, onChange, emailsOn, onEmailChange, onEmailOpen}: {phase: Phase;
  onOpen: (title: string) => void; onAttach: () => void; files: number; onChange: () => void; emailsOn: Set<string>;
  onEmailChange: (id: string, on: boolean) => void; onEmailOpen: (id: string) => void}) {
  // Participant actions: which are on, who can take each, and whether that is set for this phase.
  const [actionsOn, setActionsOn] = useState<Record<string, boolean>>({submit: true, comment: true, react: true, event: true});
  const [disliking, setDisliking] = useState(false);
  const [who, setWho] = useState<Record<string, AccessWho>>({submit: 'signin', comment: 'signin', react: 'signin', event: 'signin'});
  const [own, setOwn] = useState<Record<string, boolean>>({});
  const [access, setAccess] = useState<string | null>(null);
  // Available views: List is always on; one view is the default.
  const [views, setViews] = useState<Record<string, boolean>>({list: true, map: false, perspectives: false});
  const [defaultView, setDefaultView] = useState('list');
  const changed = <T,>(set: (v: T) => void) => (v: T) => { set(v); onChange(); };
  const accessFor = PARTICIPANT_ACTIONS.find(a => a.id === access);
  const emailCount = emailsOn.size;
  return (
    <ul className="bo-phase-stack">
      <DatesAndTitle phase={phase} onChange={onChange} help={DATES_HELP} />
      <li data-gv="setup-card"><Card title="Attachments" summary={files ? `${files} ${files === 1 ? 'file' : 'files'}` : undefined}
        iconActions={[{icon: Paperclip, label: 'Add an attachment', onPress: onAttach}]} /></li>
      <li data-gv="setup-card"><Card title="What should an input be called?" status="to-review" pills={[{label: 'Idea', icon: Lightbulb}]} control="open" onOpen={() => onOpen('What should an input be called?')} /></li>
      <li data-gv="setup-card"><Card title="Idea form" status="to-review" pills={[{label: `${IDEA_FORM.length} questions`}]} control="expand">
        {/* Form field summary (a recipe): the questions at a glance, one line each, Edit form under them. */}
        <div className="gv-form-summary">
          <ol className="gv-form-summary__list" aria-label="Idea form questions">
            {IDEA_FORM.map((q, i) => (
              <li key={q.name} className="gv-form-summary__question">
                <span className="gv-form-summary__number" aria-hidden>{i + 1}</span>
                <span className="gv-form-summary__name" title={q.name}>{q.name}</span>
                <span className="gv-form-summary__type">{q.isRequired ? `${q.type} · Required` : q.type}</span>
              </li>
            ))}
          </ol>
          <Button variant="secondary" size={36} onPress={() => onOpen('Idea form')}>Edit form</Button>
        </div>
      </Card></li>
      <li data-gv="setup-card"><Card title="Participant actions" control="expand"
        pills={firstPlus(PARTICIPANT_ACTIONS.filter(a => !('isLocked' in a) && actionsOn[a.id]).map(a => a.short))}>
        <ParticipantActionList>
          {PARTICIPANT_ACTIONS.map(a => {
            const locked = 'isLocked' in a && a.isLocked;
            return [
              <ParticipantActionRow key={a.id} value={ACCESS_WHO_VALUE[who[a.id]]} isDefault={!own[a.id]} isLocked={locked}
                isSelected={actionsOn[a.id]} onChange={changed((v: boolean) => setActionsOn(s => ({...s, [a.id]: v})))}
                onOpen={() => setAccess(a.id)} options={a.id === 'react' ? <ParticipantLimit onChange={onChange} /> : undefined}>
                {a.label}
              </ParticipantActionRow>,
              // Disliking hangs from Reacting: a plain switch row while reacting is on.
              a.id === 'react' && actionsOn.react && (
                <ParticipantActionRow key="dislike" isSelected={disliking} onChange={changed(setDisliking)}>Disliking</ParticipantActionRow>
              )
            ];
          })}
        </ParticipantActionList>
      </Card></li>
      <li data-gv="setup-card"><Card title="Available views" control="expand"
        pills={firstPlus(IDEA_VIEWS.filter(v => v.id !== 'list' && views[v.id]).map(v => v.label))}>
        <ViewOptionList>
          {IDEA_VIEWS.map(v => (
            <ViewOptionRow key={v.id} description={v.description} isAlwaysOn={v.id === 'list'} isSelected={views[v.id]}
              onChange={changed((next: boolean) => {
                setViews(s => ({...s, [v.id]: next}));
                if (!next && defaultView === v.id) setDefaultView('list');
              })}
              isDefault={defaultView === v.id}
              onMakeDefault={() => { setDefaultView(v.id); setViews(s => ({...s, [v.id]: true})); onChange(); }}>
              {v.label}
            </ViewOptionRow>
          ))}
        </ViewOptionList>
      </Card></li>
      <li data-gv="setup-card"><Card title="Collect demographic data" status="to-set" control="open" onOpen={() => onOpen('Collect demographic data')} /></li>
      <li data-gv="setup-card"><Card title="Sorting" status="to-review" pills={[{label: 'Trending'}]} control="open" onOpen={() => onOpen('Sorting')} /></li>
      <li data-gv="setup-card"><Card title="Notifications" control="expand"
        pills={[{label: emailCount ? `${emailCount} ${emailCount === 1 ? 'email' : 'emails'} on` : 'Off'}]}>
        <NotificationRowList>
          {PHASE_EMAILS.map(e => (
            <NotificationRow key={e.id} who={e.who} when={e.when} isSelected={emailsOn.has(e.id)}
              onChange={on => onEmailChange(e.id, on)} onOpen={() => onEmailOpen(e.id)}>
              {e.name}
            </NotificationRow>
          ))}
        </NotificationRowList>
      </Card></li>
      {accessFor && (
        <AccessRightsModal key={accessFor.id} title={accessFor.question} isOpen onOpenChange={o => !o && setAccess(null)}
          whoItems={accessFor.id === 'event' ? ['signin', 'admins'] : undefined}
          defaultOverriding={!!own[accessFor.id]} onOverridingChange={changed((v: boolean) => setOwn(s => ({...s, [accessFor.id]: v})))}
          defaultWho={who[accessFor.id]} onWhoChange={changed((v: AccessWho) => setWho(s => ({...s, [accessFor.id]: v})))}
          onSave={() => setAccess(null)} />
      )}
    </ul>
  );
}

// A volunteering phase's cards: its dates and title, then the Causes card (Volunteering row's "Build · in a card"
// story): each cause with Edit and Delete, Add a cause, Download volunteers greyed until someone signs up.
function VolunteeringCards({phase, onOpen, onChange}: {phase: Phase; onOpen: (title: string) => void; onChange: () => void}) {
  const [causes, setCauses] = useState(CAUSES);
  const signedUp = causes.reduce((k, c) => k + c.volunteers, 0);
  const remove = (id: string) => {
    const at = causes.findIndex(c => c.id === id), gone = causes[at];
    setCauses(list => list.filter(c => c.id !== id));
    onChange();
    undoToast(`${gone.title} deleted`, () => setCauses(list => [...list.slice(0, at), gone, ...list.slice(at)]));
  };
  return (
    <ul className="bo-phase-stack">
      <DatesAndTitle phase={phase} onChange={onChange} help="Residents can sign up from the first day to the last." />
      <li data-gv="setup-card"><Card title="Causes" pills={[{label: `${causes.length} ${causes.length === 1 ? 'cause' : 'causes'}`}]}
        iconActions={[
          {icon: Plus, label: 'Add a cause', tooltip: 'Add a cause', onPress: () => onOpen('Add a cause')},
          {icon: Download, label: 'Download volunteers', isDisabled: signedUp === 0, tooltip: signedUp ? 'Download volunteers' : 'Nobody has signed up yet'}
        ]}>
        <div>
          {causes.map((c, i) => (
            <VolunteeringRow key={c.id} layout="build" title={c.title} volunteerCount={c.volunteers} isLast={i === causes.length - 1}
              onEdit={() => onOpen(c.title)} onDelete={() => remove(c.id)} />
          ))}
        </div>
      </Card></li>
    </ul>
  );
}

// "Ideation · Manage (data)", after the prototype's Manage tab one week after publishing: the metrics and actions
// on the left; on the right the ideas, under a toolbar (the count, or the batch actions while ideas are selected;
// search and filter at the end) and the active-filter chips. Filters, chips and metrics share one value.
const icon = (I: typeof Tag) => <I aria-hidden size={16} />;
const ideasWord = (n: number) => `${n} ${n === 1 ? 'idea' : 'ideas'}`;
const replyOf = (i: Idea) => (i.replied ? 'Replied' : 'Awaiting reply');
// Each facet's values for one idea: within a facet any ticked value matches, across facets all must.
const FIELDS: Record<string, (i: Idea) => readonly string[]> = {
  source: i => [i.source], status: i => [i.status], assignee: i => [i.assignee], tags: i => i.tags, reply: i => [replyOf(i)]
};
const matches = (i: Idea, value: FilterValue) =>
  Object.entries(value).every(([k, vals]) => !vals.length || FIELDS[k](i).some(v => vals.includes(v)));
const sameFilters = (a: FilterValue, b: FilterValue) => {
  const on = (v: FilterValue) => JSON.stringify(Object.entries(v).filter(([, x]) => x.length).sort());
  return on(a) === on(b);
};

function facetsFor(ideas: Idea[]): FilterFacet[] {
  const options = (id: string, values: readonly string[], person?: boolean) => values.map(v => ({
    id: v, label: v, count: ideas.filter(i => FIELDS[id](i).includes(v)).length,
    icon: person ? <Avatar size={16} isUnassigned={v === 'Unassigned'} initials={v.slice(-1)} /> : undefined
  }));
  return [
    {id: 'source', label: 'Source', icon: icon(Inbox), items: options('source', IDEA_SOURCES)},
    {id: 'status', label: 'Status', icon: icon(CircleCheck), items: options('status', IDEA_STATUSES)},
    {id: 'assignee', label: 'Assignee', icon: icon(User), items: options('assignee', IDEA_ASSIGNEES, true)},
    {id: 'tags', label: 'Tags', icon: icon(Tag), items: options('tags', IDEA_TAGS)},
    {id: 'reply', label: 'Reply', icon: icon(MessageSquareText), items: options('reply', IDEA_REPLIES)}
  ];
}

// The metrics: two of them are filters (they light up the matching chip), three are views of their own.
type Walk = {key: string; label: string; filter?: FilterValue; test?: (i: Idea) => boolean};
const WALKS: Walk[] = [
  {key: 'reply', label: 'Waiting for a reply', filter: {reply: ['Awaiting reply']}},
  {key: 'unassigned', label: 'Unassigned', filter: {assignee: ['Unassigned']}},
  {key: 'new', label: 'New ideas', test: i => i.isNew},
  {key: 'comments', label: 'New comments', test: i => i.newComments > 0},
  {key: 'warnings', label: 'Content warnings', test: i => !!i.warning}
];
// The Data table's "In a panel" story: Idea (its picture first), Assignee, Tags, Status, Likes; "+" adds Comments.
const COLUMNS = [['comments', 'Comments']] as const;
const PAGE_SIZE = 20;
const PICTURE_LIST = Object.values(PICTURES);
const pictureOf = (i: Idea) => (i.hasPicture ? PICTURE_LIST[(Number(i.id.replace(/\D/g, '')) - 1) / 3 % PICTURE_LIST.length] : undefined);
const person = (name: string) => (name === 'Unassigned' ? undefined : name);
type Sort = {column: string | number; direction: 'ascending' | 'descending'};

// A change in the side panel (or the Selection bar's Official update) applies at once; its toast can undo it.
const undoToast = (title: string, undo: () => void, body?: string) =>
  queue.add({title, description: body, action: 'Undo', onAction: undo}, {timeout: 6000});

type Thread = {comments: ThreadComment[]; internal: ThreadComment[]};
type Restore = (list: ThreadComment[]) => ThreadComment[];

/** The list without comment `id`, and how to put it back where it was. */
function without(list: ThreadComment[], id: string): [ThreadComment[], Restore] {
  const at = list.findIndex(c => c.id === id);
  if (at >= 0) {
    const gone = list[at];
    return [list.filter(c => c.id !== id), l => [...l.slice(0, at), gone, ...l.slice(at)]];
  }
  const parent = list.find(c => c.replies?.some(r => r.id === id));
  if (!parent) return [list, l => l];
  const [replies, put] = without(parent.replies!, id);
  return [list.map(c => (c.id === parent.id ? {...c, replies} : c)),
    l => l.map(c => (c.id === parent.id ? {...c, replies: put(c.replies ?? [])} : c))];
}
const withWarning = (list: ThreadComment[], id: string, warning: string | undefined): ThreadComment[] =>
  list.map(c => (c.id === id ? {...c, warning} : {...c, replies: c.replies && withWarning(c.replies, id, warning)}));
const findComment = (list: ThreadComment[], id: string) => [...list, ...list.flatMap(c => c.replies ?? [])].find(c => c.id === id);

/** The row of idea `id` in the Ideas table: where focus goes back when the side panel closes. */
const rowOf = (id: string) =>
  document.querySelector<HTMLElement>(`[role="grid"][aria-label="Ideas"] [role="row"][data-key="${CSS.escape(id)}"]`);

function Manage({project, phase, onAddPhase}: {project: Project; phase: Phase; onAddPhase: () => void}) {
  const screens = SCREENING_PHASES.has(`${project.id}/${phase.id}`);
  // A draft phase has collected nothing yet; a published one shows its first week of ideas. Only a phase that
  // screens has ideas waiting for approval.
  const [ideas, setIdeas] = useState<Idea[]>(() => (phase.status === 'Draft' ? []
    : IDEAS.map(i => (screens || !i.screening ? i : {...i, screening: undefined}))));
  const [threads, setThreads] = useState<Record<string, Thread>>(() =>
    Object.fromEntries(IDEAS.map(i => [i.id, {comments: ideaComments(i), internal: ideaInternal(i)}])));
  const [updates, setUpdates] = useState<Record<string, PostedUpdate[]>>(() => Object.fromEntries(IDEAS.map(i => [i.id, ideaUpdates(i)])));
  const [filters, setFiltersRaw] = useState<FilterValue>({});
  const [walk, setWalk] = useState<Walk | null>(null);
  const [query, setQueryRaw] = useState('');
  const [selected, setSelected] = useState<Set<string | number>>(new Set());
  const [page, setPage] = useState(1);
  const [copied, setCopied] = useState<Set<string>>(new Set());
  const [open, setOpen] = useState<string | null>(null);
  const [sort, setSort] = useState<Sort | undefined>();
  const [extra, setExtra] = useState<Set<string | number>>(new Set());
  const [updating, setUpdating] = useState(false);
  const [note, setNote] = useState('');
  // A new search, filter or quick view starts again from the first page, with nothing selected.
  const setFilters = (v: FilterValue) => { setFiltersRaw(v); setSelected(new Set()); setPage(1); };
  const setQuery = (v: string) => { setQueryRaw(v); setPage(1); };
  const setView = (w: Walk | null) => { setWalk(w); setSelected(new Set()); setPage(1); };

  const facets = facetsFor(ideas);
  const q = query.trim().toLowerCase();
  const shown = ideas.filter(i => matches(i, filters) && (!walk?.test || walk.test(i)) && (!q || i.text.toLowerCase().includes(q)));
  if (sort) {
    const k = sort.column as 'text' | 'status' | 'likes' | 'comments';
    const sign = sort.direction === 'descending' ? -1 : 1;
    // Nobody sorts after every name, whichever the direction.
    shown.sort((a, b) => (sort.column === 'assignee'
      ? (!person(a.assignee) || !person(b.assignee) ? Number(!person(a.assignee)) - Number(!person(b.assignee))
        : sign * a.assignee.localeCompare(b.assignee))
      : sign * (typeof a[k] === 'number' ? (a[k] as number) - (b[k] as number) : String(a[k]).localeCompare(String(b[k])))));
  }
  const pageCount = Math.max(1, Math.ceil(shown.length / PAGE_SIZE));
  const current = Math.min(page, pageCount);
  const rows = shown.slice((current - 1) * PAGE_SIZE, current * PAGE_SIZE);
  const picked = shown.filter(i => selected.has(i.id)).map(i => i.id);
  const edit = (change: (i: Idea) => Idea) => setIdeas(all => all.map(i => (picked.includes(i.id) ? change(i) : i)));
  const pickedIdeas = ideas.filter(i => picked.includes(i.id));
  const sharedTags = IDEA_TAGS.filter(t => pickedIdeas.length > 0 && pickedIdeas.every(i => i.tags.includes(t)));
  const sharedStatus = pickedIdeas.length && pickedIdeas.every(i => i.status === pickedIdeas[0].status) ? [pickedIdeas[0].status] : [];
  const n = picked.length;

  // The open idea and its place in the filtered list (the pager's "3 of 124").
  const idea = open ? ideas.find(i => i.id === open) : undefined;
  const at = idea ? shown.findIndex(i => i.id === idea.id) : -1;

  const patch = (id: string, change: Partial<Idea>, title: string) => {
    const before = ideas.find(i => i.id === id);
    if (!before) return;
    const undo = Object.fromEntries(Object.keys(change).map(k => [k, before[k as keyof Idea]])) as Partial<Idea>;
    setIdeas(list => list.map(i => (i.id === id ? {...i, ...change} : i)));
    undoToast(title, () => setIdeas(list => list.map(i => (i.id === id ? {...i, ...undo} : i))));
  };
  const remove = (id: string) => {
    const index = ideas.findIndex(i => i.id === id);
    const gone = ideas[index];
    setOpen(null);
    setIdeas(list => list.filter(i => i.id !== id));
    undoToast('Idea deleted', () => setIdeas(list => [...list.slice(0, index), gone, ...list.slice(index)]));
  };
  const setThread = (id: string, tab: ThreadTab, change: (list: ThreadComment[]) => ThreadComment[]) =>
    setThreads(all => ({...all, [id]: {...all[id], [tab]: change(all[id][tab])}}));

  const otherPhases = project.phases.filter(p => p.id !== phase.id);
  // The batch actions: Status picks one (an Option list); Assign is a Menu with avatars; Tags picks several in a
  // searchable Option list, in a dialog popover; Copy to phase ticks several phases, then "Add phase".
  const actions: SelectionAction[] = [
    {id: 'status', label: 'Status', icon: icon(CircleCheck), menu: (
      <OptionList aria-label="Status" selectionMode="single" isSearchable={false} value={sharedStatus}
        items={IDEA_STATUSES.map(st => ({id: st, label: st}))}
        onChange={([st]) => st && edit(i => ({...i, status: st as IdeaStatus}))} />
    )},
    {id: 'assign', label: 'Assign', icon: icon(User), menu: (
      <Menu aria-label="Assign to" onAction={k => edit(i => ({...i, assignee: k as Idea['assignee']}))}>
        {IDEA_ASSIGNEES.map(a => (
          <MenuItem key={a} id={a} icon={<Avatar size={16} isUnassigned={a === 'Unassigned'} initials={a.slice(-1)} />}>{a}</MenuItem>
        ))}
      </Menu>
    )},
    {id: 'tags', label: 'Tags', icon: icon(Tag), menu: (
      // A dialog popover holds the search (as the Filter menu's long submenus do); isFlush keeps the starter
      // Dialog's padding off the Option list.
      <Dialog aria-label="Tags" isFlush>
        <OptionList aria-label="Tags" isSearchable icon={icon(Tag)} value={sharedTags} countLabel={ideasWord}
          items={IDEA_TAGS.map(t => ({id: t, label: t, count: pickedIdeas.filter(i => i.tags.includes(t)).length}))}
          selectionLabel={k => `${k} ${k === 1 ? 'tag' : 'tags'} on every selected idea`}
          onChange={next => {
            const on = new Set(next);
            edit(i => ({...i, tags: [...IDEA_TAGS].filter(t => on.has(t) || (i.tags.includes(t) && !sharedTags.includes(t)))}));
          }} />
      </Dialog>
    )},
    {id: 'copy', label: 'Copy to phase', icon: icon(Copy), menu: (
      <Menu aria-label="Copy to phase" onAction={k => k === 'add' && onAddPhase()}>
        {/* Enter ticks a phase and the menu stays open, as a pick-several list should (Esc closes it). */}
        <MenuSection aria-label="Phases" selectionMode="multiple" selectedKeys={copied} shouldCloseOnSelect={false}
          onSelectionChange={keys => {
            const next = new Set(keys === 'all' ? otherPhases.map(p => p.id) : [...keys].map(String));
            const to = otherPhases.filter(p => next.has(p.id) && !copied.has(p.id));
            setCopied(next);
            if (to.length) setNote(`${ideasWord(n)} copied to ${to.map(p => p.title).join(', ')}.`);
          }}>
          {otherPhases.map(p => <MenuItem key={p.id} id={p.id}>{p.title}</MenuItem>)}
        </MenuSection>
        <Separator />
        <MenuItem id="add" icon={icon(Plus)}>Add phase</MenuItem>
      </Menu>
    )},
    {id: 'update', label: 'Official update', icon: icon(MessageSquareText)},
    // Joins the bar while the table shows only the ideas with content warnings.
    ...(walk?.key === 'warnings' ? [{id: 'dismiss-warnings', label: 'Dismiss warnings', icon: icon(TriangleAlert)}] : [])
  ];
  const dismissWarnings = () => {
    const before = Object.fromEntries(pickedIdeas.map(i => [i.id, i.warning]));
    edit(i => ({...i, warning: undefined}));
    undoToast(`Warnings dismissed on ${ideasWord(n)}`, () => setIdeas(list => list.map(i => (i.id in before ? {...i, warning: before[i.id]} : i))));
  };
  // The panel's pager walks the whole filtered list; the table turns to the page the open idea is on.
  const openAt = (p: number) => { const next = shown[p - 1]; if (!next) return; setOpen(next.id); setPage(Math.ceil(p / PAGE_SIZE)); };

  return (
    <>
      <aside className="bo-phase-side bo-phase-stack" aria-label="Ideas overview">
        <div className="bo-phase-panel bo-phase-panel-tight">
          {WALKS.map(w => {
            const count = ideas.filter(i => (w.filter ? matches(i, w.filter) : w.test!(i))).length;
            const isOn = w.filter ? sameFilters(filters, w.filter) : walk?.key === w.key;
            return <StatRow key={w.key} label={w.label} value={String(count)} isNew={w.key === 'new' && count > 0}
              isStatic={count === 0} isSelected={isOn}
              onPress={() => (w.filter ? setFilters(isOn ? {} : w.filter) : setView(isOn ? null : w))} />;
          })}
        </div>
        <div className="bo-phase-panel bo-phase-panel-actions">
          <ul className="bo-phase-stack">
            <li><Card variant="filled" title="Add an idea" iconActions={[{icon: Plus, label: 'Add an idea'}]} /></li>
            <li><Card variant="filled" title="Import paper ideas" summary="Not set" iconActions={[{icon: Upload, label: 'Import paper ideas'}]} /></li>
            <li><Card variant="filled" title="Exports" iconActions={[{icon: Download, label: 'Export ideas'}]} /></li>
          </ul>
        </div>
      </aside>
      {/* The Data table's "In a panel" story: the Panel's toolbar holds the count (or the Selection bar), the collapsible
          search and the Filter menu, then the chips (the quick view first); the table; the Pagination in its foot. */}
      <Panel title={phase.title} className="bo-phase-grow" isFlush
        description="Everything posted in this phase. Select ideas for batch actions; click one to open it."
        toolbar={(
          <>
            <TableToolbar start={(
              <SelectionBar count={n} items={actions} onClear={() => setSelected(new Set())}
                onAction={id => (id === 'update' ? setUpdating(true) : id === 'dismiss-warnings' && dismissWarnings())}>
                <TableToolbarHeading>{ideasWord(shown.length)}</TableToolbarHeading>
              </SelectionBar>
            )}>
              <SearchField isCollapsible aria-label="Search ideas" placeholder="Search" value={query} onChange={setQuery} />
              <FilterMenu aria-label="Filter ideas" facets={facets} value={filters} onChange={setFilters} countLabel={ideasWord} />
            </TableToolbar>
            <FilterChips aria-label="Active filters" facets={facets} value={filters} onChange={setFilters}
              metric={walk?.label} onMetricRemove={() => setView(null)} />
            {note && <p role="status" className="bo-note bo-phase-flush">{note}</p>}
          </>
        )}
        footer={<Pagination page={current} pageCount={pageCount} onPageChange={setPage} aria-label="Idea pages" />}>
        {/* The checkboxes keep the bulk selection, so the open idea can't also be the table's selection (the Side panel
            story's single-select `selectedKeys=[open]`): a row's action opens it instead, as in the Data table's
            "In a panel" story. */}
        <DataTable aria-label="Ideas" showChecksOnHover selectionMode="multiple"
          selectedKeys={selected} onSelectionChange={k => setSelected(new Set(k === 'all' ? [...selected, ...rows.map(r => r.id)] : k))}
          sortDescriptor={sort} onSortChange={d => { setSort(d as Sort); setPage(1); }}
          addColumn={(
            <DataTableAddColumn selectedKeys={extra} onSelectionChange={setExtra}>
              {COLUMNS.map(([id, label]) => <MenuItem key={id} id={id}>{label}</MenuItem>)}
            </DataTableAddColumn>
          )}>
          <DataTableHeader>
            <DataTableColumn id="text" isRowHeader allowsSorting>Idea</DataTableColumn>
            <DataTableColumn id="assignee" allowsSorting>Assignee</DataTableColumn>
            <DataTableColumn id="tags">Tags</DataTableColumn>
            <DataTableColumn id="status" allowsSorting>Status</DataTableColumn>
            <DataTableColumn id="likes" align="number" allowsSorting>Likes</DataTableColumn>
            {extra.has('comments') && <DataTableColumn id="comments" align="number" allowsSorting>Comments</DataTableColumn>}
          </DataTableHeader>
          <DataTableBody renderEmptyState={() => (
            <DataTableEmpty>{ideas.length ? 'No ideas match. Clear the filters to see them all.' : 'No ideas here yet.'}</DataTableEmpty>
          )}>
            {rows.map(i => {
              const picture = pictureOf(i);
              return (
                <DataTableRow key={i.id} id={i.id} textValue={i.text} onAction={() => setOpen(i.id)}>
                  <DataTableCell>
                    <DataTableText lines={2} leading={picture && <DataTableThumbnail src={picture} />}
                      marks={i.warning && <TriangleAlert size={16} aria-label={`Content warning: ${i.warning}`} role="img" />}>
                      {i.text}
                    </DataTableText>
                  </DataTableCell>
                  <DataTableCell><DataTableAssignee name={person(i.assignee)} initials={i.assignee.slice(-1)} /></DataTableCell>
                  <DataTableCell>{i.tags.length ? <DataTableTags items={i.tags} /> : null}</DataTableCell>
                  <DataTableCell isMuted><span className="bo-phase-manage-nowrap">{i.screening ? 'Waiting for approval' : i.status}</span></DataTableCell>
                  <DataTableCell align="number">{i.likes}</DataTableCell>
                  {extra.has('comments') && <DataTableCell align="number">{i.comments}</DataTableCell>}
                </DataTableRow>
              );
            })}
          </DataTableBody>
        </DataTable>
      </Panel>
      <SidePanel label={phase.title} itemName="idea" isOpen={!!idea} onOpenChange={o => !o && setOpen(null)}
        position={at >= 0 ? {current: at + 1, total: shown.length} : undefined}
        onPositionChange={openAt}
        returnFocus={() => (open ? rowOf(open) : null)}>
        {idea && (
          <>
            <SidePanelSection>
              {idea.screening && (
                <SidePanelDecision title="Waiting for approval">
                  <Button variant="secondary" onPress={() => patch(idea.id, {screening: undefined, status: 'Rejected'}, 'Idea rejected')}>
                    Reject
                  </Button>
                  <Button onPress={() => patch(idea.id, {screening: undefined, status: 'Proposed'}, 'Idea approved and published')}>
                    Approve
                  </Button>
                </SidePanelDecision>
              )}
              {/* The record's head: no Side panel part for it yet (the stories draw it inline). */}
              <p className="bo-phase-flush">{idea.text}</p>
              <p className="bo-note bo-phase-record-meta">
                <span>Posted by <strong>{idea.author}</strong></span>
                <span>{idea.date}</span>
              </p>
              <SidePanelActions items={[
                {id: 'edit', label: 'Edit', icon: icon(SquarePen)},
                {id: 'view', label: 'View on the site', icon: icon(ExternalLink)},
                {id: 'delete', label: 'Delete', icon: icon(Trash2), onPress: () => remove(idea.id)}
              ]}>
                <ReactionCounts likes={idea.likes} dislikes={idea.dislikes}
                  comments={threads[idea.id].comments.reduce((k, c) => k + 1 + (c.replies?.length ?? 0), 0)} />
              </SidePanelActions>
            </SidePanelSection>
            <SidePanelSection>
              <PropertyList aria-label="Idea details">
                <PropertyListItem label="Status">
                  <Select aria-label="Status" selectedKey={idea.status}
                    onSelectionChange={k => k !== idea.status && patch(idea.id, {status: k as IdeaStatus}, `Status changed to ${k}`)}>
                    {IDEA_STATUSES.map(s => <SelectItem key={s} id={s}>{s}</SelectItem>)}
                  </Select>
                </PropertyListItem>
                <PropertyListItem label="Assignee">
                  <Select aria-label="Assignee" selectedKey={idea.assignee}
                    onSelectionChange={k => k !== idea.assignee && patch(idea.id, {assignee: k as Idea['assignee']},
                      k === 'Unassigned' ? 'Idea unassigned' : `Assigned to ${k}`)}>
                    {IDEA_ASSIGNEES.map(a => <SelectItem key={a} id={a}>{a}</SelectItem>)}
                  </Select>
                </PropertyListItem>
                <PropertyListItem label="Tags">
                  {idea.tags.length > 0 && (
                    <TagGroup aria-label="Tags" onRemove={keys => patch(idea.id, {tags: idea.tags.filter(t => !keys.has(t))}, 'Tags changed')}>
                      {idea.tags.map(t => <TagItem key={t} id={t}>{t}</TagItem>)}
                    </TagGroup>
                  )}
                  <MenuTrigger>
                    <Button variant="quiet" size={32}><Plus aria-hidden size={16} />Add tag</Button>
                    <Menu aria-label="Tags" selectionMode="multiple" selectedKeys={new Set(idea.tags)}
                      onSelectionChange={keys => patch(idea.id, {tags: IDEA_TAGS.filter(t => keys === 'all' || keys.has(t))}, 'Tags changed')}>
                      {IDEA_TAGS.map(t => <MenuItem key={t} id={t}>{t}</MenuItem>)}
                    </Menu>
                  </MenuTrigger>
                </PropertyListItem>
                <PropertyListItem label="Phase">
                  <span>{phase.title}</span>
                  <MenuTrigger>
                    <Button variant="quiet" size={32} hasMenu>Copy to phase</Button>
                    <Menu aria-label="Copy to phase"
                      onAction={k => queue.add({title: `Copied to ${otherPhases.find(p => p.id === k)?.title}`}, {timeout: 5000})}>
                      {otherPhases.map(p => <MenuItem key={p.id} id={p.id}>{p.title}</MenuItem>)}
                    </Menu>
                  </MenuTrigger>
                </PropertyListItem>
              </PropertyList>
            </SidePanelSection>
            <SidePanelSection>
              <OfficialUpdate updates={updates[idea.id]} onPublish={({text, name}) => {
                const id = idea.id, update = {id: `u${Date.now()}`, text, by: name || undefined, date: 'Today'};
                setUpdates(all => ({...all, [id]: [update, ...all[id]]}));
                undoToast('Official update published', () => setUpdates(all => ({...all, [id]: all[id].filter(u => u.id !== update.id)})),
                  'The author and everyone following this idea will see it.');
              }} />
            </SidePanelSection>
            <SidePanelSection>
              <CommentThread key={idea.id} comments={threads[idea.id].comments} internal={threads[idea.id].internal} me={TEAM.initials}
                onPost={(text, {tab, replyTo}: ThreadTarget) => {
                  const c: ThreadComment = {id: `p${Date.now()}`, ...TEAM, time: 'Just now', text};
                  setThread(idea.id, tab, list => (replyTo
                    ? list.map(x => (x.id === replyTo ? {...x, replies: [...(x.replies ?? []), c]} : x))
                    : [...list, c]));
                }}
                onDelete={(cid, tab) => {
                  const id = idea.id, [next, restore] = without(threads[id][tab], cid);
                  setThread(id, tab, () => next);
                  undoToast('Comment deleted', () => setThread(id, tab, restore));
                }}
                onDismissWarning={cid => {
                  const id = idea.id, was = findComment(threads[id].comments, cid)?.warning;
                  setThread(id, 'comments', l => withWarning(l, cid, undefined));
                  undoToast('Content warning dismissed', () => setThread(id, 'comments', l => withWarning(l, cid, was)));
                }} />
            </SidePanelSection>
          </>
        )}
      </SidePanel>
      <BulkOfficialUpdate count={n} isOpen={updating} onOpenChange={setUpdating} onSend={({text, name}) => {
        const ids = picked, before = Object.fromEntries(ideas.filter(i => ids.includes(i.id)).map(i => [i.id, i.replied]));
        const update = {id: `u${Date.now()}`, text, by: name || undefined, date: 'Today'};
        setIdeas(list => list.map(i => (ids.includes(i.id) ? {...i, replied: true} : i)));
        setUpdates(all => ({...all, ...Object.fromEntries(ids.map(id => [id, [update, ...all[id]]]))}));
        undoToast(`Official update sent to ${ideasWord(ids.length)}`, () => {
          setIdeas(list => list.map(i => (i.id in before ? {...i, replied: before[i.id]} : i)));
          setUpdates(all => ({...all, ...Object.fromEntries(ids.map(id => [id, all[id].filter(u => u.id !== update.id)]))}));
        }, 'The authors and everyone following them will see it.');
      }} />
    </>
  );
}

// ── Manage and Insights before the phase has data, and Manage for the other methods ─────────────────────────────
// What each method collects, as the empty tabs and the counts name it.
const NOUN: Record<Method, string> = {
  Information: 'visits', Ideation: 'ideas', Survey: 'responses', Voting: 'votes', Proposals: 'proposals',
  'Common ground': 'statements', 'Document annotation': 'comments', Volunteering: 'volunteers', Poll: 'responses'
};
const capital = (t: string) => t[0].toUpperCase() + t.slice(1);

/** The Empty state's "Manage tab" and "Insights tab" stories on the stage, its "Side panel" story beside them. */
function EmptyTab({phase, tab}: {phase: Phase; tab: 'manage' | 'insights'}) {
  const noun = NOUN[phase.method];
  const main = (
    <section className="bo-phase-panel bo-phase-grow bo-phase-empty" aria-label={label(tab)}>
      {tab === 'manage'
        ? <EmptyState illustration="empty-notebook" title={`${capital(noun)} will appear here`}
          description={`Once the phase starts, you can review and manage ${noun} here`} />
        : <EmptyState illustration="empty-notebook" title="Insights will appear here"
          description="Once the phase starts, insights will help you turn participation into clear results" />}
    </section>
  );
  const side = (
    <aside className="bo-phase-panel bo-phase-side bo-phase-empty-side" aria-label={tab === 'manage' ? `${capital(noun)} overview` : 'Recommended actions'}>
      <EmptyState layout="panel" illustration="empty-notebook" headingLevel="none" title={tab === 'manage' ? `No ${noun} yet` : 'No insights yet'} />
    </aside>
  );
  // The side panel keeps its place: before the list on Manage, after the dashboard on Insights.
  return tab === 'manage' ? <>{side}{main}</> : <>{main}{side}</>;
}

// Manage for Voting and Proposals: the Panel over the method's List header and rows (Voting row, Proposals row).
// The other methods' Manage tabs are not drawn yet; an Information phase collects nothing to manage.
const VOTING_COLUMNS: ListHeaderColumn[] = [
  {key: 'option', label: 'Option', width: 264, isStatic: true}, {key: 'votes', label: 'Votes', width: 200, isSorted: true},
  {key: 'online', label: 'Online', width: 80, kind: 'number'}, {key: 'offline', label: 'Offline', width: 80, kind: 'number'},
  {key: 'comments', label: 'Comments', width: 112, kind: 'number'}
];
const PROPOSAL_COLUMNS: ListHeaderColumn[] = [
  {key: 'proposal', label: 'Proposal', width: 176, isStatic: true}, {key: 'votes', label: 'Votes', width: 200, isSorted: true},
  {key: 'status', label: 'Status', width: 144, isStatic: true}, {key: 'comments', label: 'Comments', width: 112, kind: 'number'},
  {key: 'timeLeft', label: 'Time left', width: 104, isStatic: true}
];

function MethodManage({phase}: {phase: Phase}) {
  if (phase.method !== 'Voting' && phase.method !== 'Proposals') {
    return (
      <section className="bo-phase-panel bo-phase-grow bo-phase-empty" aria-label="Manage">
        <EmptyState icon={<Inbox aria-hidden size={24} />} title={phase.method === 'Information' ? 'Nothing to manage here' : `${phase.method}: Manage`}
          description={phase.method === 'Information' ? 'An information phase shares news with residents; it collects no inputs.'
            : 'This method\'s Manage tab: not in Figma yet.'} />
      </section>
    );
  }
  const voting = phase.method === 'Voting';
  const top = Math.max(...VOTE_OPTIONS.map(o => o.votes));
  return (
    <Panel title={phase.title} className="bo-phase-grow" isFlush count={voting ? VOTE_OPTIONS.length : PROPOSALS.length}
      description={voting ? 'The options residents vote on, most votes first. Votes counted on paper are added as offline votes.'
        : 'Every proposal, most supported first. 300 votes bring an official response.'}>
      <div className="bo-phase-method-list" role="list" aria-label={voting ? 'Options' : 'Proposals'}>
        <ListHeader columns={voting ? VOTING_COLUMNS : PROPOSAL_COLUMNS} />
        {voting ? VOTE_OPTIONS.map(o => (
          <div role="listitem" key={o.title}>
            <VotingRow title={o.title} voteCount={o.votes} fillPercent={Math.round(o.votes / top * 100)} newVoteCount={o.newVotes}
              onlineCount={o.votes - o.offline} offlineCount={o.offline} commentCount={o.comments} newCommentCount={o.newComments} />
          </div>
        )) : PROPOSALS.map(o => (
          <div role="listitem" key={o.title}>
            <ProposalsRow title={o.title} voteCount={o.votes} voteThreshold={300} statusLabel={o.status} commentCount={o.comments}
              isClosed={phase.status === 'Done'} daysLeft={phase.status === 'Done' ? undefined : 12} />
          </div>
        ))}
      </div>
    </Panel>
  );
}

// ── Insights, one week in: the prototype's phase dashboard on Dashboard cards and Stat tiles; Recommended actions
// beside it as the Manage tab's cards. A vote shows its results; ideas and proposals the ideation dashboard; any
// other method its visitors.
const statusColor: Record<IdeaStatus, ChartColor> = {
  Proposed: 'blue-2', Viewed: 'blue-3', 'Under consideration': 'blue-1', Accepted: 'agree', Rejected: 'disagree', Implemented: 'green'
};

function Insights({project, phase}: {project: Project; phase: Phase}) {
  const navigate = useNavigate();
  const [range, setRange] = useState<'daily' | 'weekly'>('daily');
  let body: ReactNode;
  if (phase.method === 'Voting') {
    const votes = VOTES_BY_DAY;
    const weekly = votes.filter((_, k) => k % 7 === 6 || k === votes.length - 1);
    body = <>
      <div className="bo-phase-tiles" data-tiles="4">
        <StatTile layout="with-note" label="Voters" value="517" note="updating live" />
        <StatTile layout="with-note" label="Votes" value="1,240" note="updating live" />
        <StatTile layout="with-note" label="Avg per voter" value="2.4" note="multiple picks" />
        <StatTile layout="with-note" label="Participation" value="18%" note="of visitors" />
      </div>
      <DashboardCard kind="votes-over-time" title="Participation over time" subtitle="Votes cast · cumulative" actions={(
        <SegmentedControl size={30} aria-label="Range" disallowEmptySelection selectedKeys={[range]}
          onSelectionChange={k => { const next = [...k][0]; if (next) setRange(next as 'daily' | 'weekly'); }}>
          <SegmentedControlItem id="daily">Daily</SegmentedControlItem>
          <SegmentedControlItem id="weekly">Weekly</SegmentedControlItem>
        </SegmentedControl>
      )}>
        <Sparkline label="Votes cast" values={range === 'daily' ? votes : weekly} />
      </DashboardCard>
      <DashboardCard kind="live-ranking" title="Live ranking" subtitle={`By votes · ${phase.status === 'Done' ? 'final' : 'updating live'}`}>
        <DashboardRanking items={VOTE_OPTIONS.map(o => ({title: o.title, count: o.votes}))} />
      </DashboardCard>
      <div className="bo-phase-insights-pair">
        <DashboardCard kind="demographic-age"><DashboardDemographic label="Age group" items={[...VOTER_AGES]} /></DashboardCard>
        <DashboardCard kind="demographic-commute"><DashboardDemographic label="Primary commute" items={[...VOTER_COMMUTES]} /></DashboardCard>
      </div>
      <Banner tone="ai" linkLabel="Open AI analysis" onLinkPress={() => navigate(phaseUrl(project, phase, 'manage'))}>
        Explore AI-powered summaries and view individual votes.
      </Banner>
    </>;
  } else if (phase.method === 'Ideation' || phase.method === 'Proposals') {
    const noun = NOUN[phase.method];
    const total = IDEAS.length;
    const liked = [...IDEAS].sort((a, b) => b.likes - a.likes).slice(0, 3);
    body = <>
      <div className="bo-phase-tiles" data-tiles="6">
        <StatTile label="Visitors" value="412" />
        <StatTile label="Phase participants" value="124" />
        <StatTile label={capital(noun)} value={String(total)} />
        <StatTile label="Comments" value={IDEAS.reduce((k, i) => k + i.comments, 0).toLocaleString('en-GB')} />
        <StatTile label="Reactions" value={IDEAS.reduce((k, i) => k + i.likes + i.dislikes, 0).toLocaleString('en-GB')} />
        <StatTile label="Participation rate" value="30.1%" />
      </div>
      <DashboardCard kind="participation-over-time" title="Participation over time">
        <LineChart showLegend labels={INSIGHT_WEEKS} series={[
          {label: 'Participants', values: PARTICIPATION_WEEKS.participants}, {label: 'Visitors', values: PARTICIPATION_WEEKS.visitors}
        ]} />
      </DashboardCard>
      <div className="bo-phase-insights-pair" data-wide>
        <DashboardCard kind="ai-summary" icon={<Sparkles />} title="What are people saying?"
          footer={<>1 / {total}<CompactButton onPress={() => navigate(phaseUrl(project, phase, 'manage'))}>Explore</CompactButton></>}>
          <p>{AI_SUMMARY}</p>
        </DashboardCard>
        <DashboardCard kind="topic-breakdown" title="Topic breakdown">
          <DashboardTopics onAction={() => navigate(phaseUrl(project, phase, 'manage'))} items={[
            {id: 'ai', label: 'AI topic distribution', meta: `${total} ${noun} · 0 topics`},
            {id: 'manual', label: 'Manual tags', meta: `${IDEAS.filter(i => i.tags.length).length} ${noun} · ${IDEA_TAGS.length} topics`}
          ]} />
        </DashboardCard>
      </div>
      <DashboardCard kind="status-breakdown" title="Status breakdown">
        <DashboardBars items={IDEA_STATUSES.map(st => {
          const count = IDEAS.filter(i => i.status === st).length;
          return {label: st, count, percent: Math.round(count / total * 100), color: statusColor[st]};
        })} />
      </DashboardCard>
      <DashboardCard title="Most liked" subtitle="These ideas got the most traction">
        <DashboardList items={liked.map(i => ({id: i.id, title: i.text, meta: `${i.author} · ${i.date}`,
          reactions: {likes: i.likes, dislikes: i.dislikes, comments: i.comments}, status: <Badge>{i.status}</Badge>}))} />
      </DashboardCard>
      <DashboardCard title="Demographics and audience">
        <EmptyState layout="panel" headingLevel="none" title="No demographic data yet" description="It appears once participants fill in their profile." />
      </DashboardCard>
    </>;
  } else {
    body = <>
      <div className="bo-phase-tiles"><StatTile label="Visitors" value={phase.count?.split(' ')[0] ?? '0'} /></div>
      <DashboardCard kind="visitors-over-time" title="Visitors over time">
        <LineChart labels={INSIGHT_WEEKS} series={[{label: 'Visitors', values: PARTICIPATION_WEEKS.visitors}]} />
      </DashboardCard>
    </>;
  }
  return (
    <>
      <section className="bo-phase-grow bo-phase-insights" aria-label="Insights">{body}</section>
      {/* Action row's "Recommended actions" story: each action's icon at the end of its row. */}
      <Panel title="Recommended actions" className="bo-phase-side bo-phase-insights-side">
        <ActionRowList aria-label="Recommended actions">
          <ActionRow href="#/reporting" icon={<FileChartColumn />}>Add a report</ActionRow>
          <ActionRow href="#/messaging" icon={<Link2 />}>Share results with participants</ActionRow>
          <ActionRow icon={<Sparkles />} onPress={() => queue.add({title: 'AI summary requested',
            description: 'It appears under "What are people saying?" in a few minutes.'}, {timeout: 5000})}>
            Get an AI Sensemaking summary
          </ActionRow>
        </ActionRowList>
      </Panel>
    </>
  );
}

// ── Project settings, Add a phase, and the stub behind a Build card ─────────────────────────────────────────────
// The settings cog opens the project's settings in a wide modal with side tabs, as the prototype's project settings.
export const SETTINGS_TABS = ['General', 'Project page', 'Input tags', 'Access rights', 'Audience', 'Messaging', 'Files', 'Events'] as const;
export type SettingsTab = typeof SETTINGS_TABS[number];
// The side list's groups (Tabs' "Vertical with group headings" story).
const SETTINGS_GROUPS: {title: string; tabs: SettingsTab[]}[] = [
  {title: 'Project', tabs: ['General', 'Project page', 'Files', 'Events']},
  {title: 'Participation', tabs: ['Access rights', 'Audience', 'Messaging']},
  {title: 'Inputs', tabs: ['Input tags']}
];
const SETTINGS_ICON: Record<SettingsTab, typeof Settings> = {
  'General': Settings, 'Project page': FileText, 'Input tags': Tag, 'Access rights': Lock, 'Audience': Users,
  'Messaging': Mail, 'Files': Paperclip, 'Events': CalendarDays
};
const SETTINGS_ABOUT: Record<SettingsTab, string> = {
  'General': 'The project title, its folder and its dates.',
  'Project page': 'What residents read on the project page: the image, the intro and the sections under it.',
  'Input tags': 'The tags managers give ideas, used by the Manage filters.',
  'Access rights': 'Who can see the project and who can take part.',
  'Audience': 'The groups and places this project is for.',
  'Messaging': 'The emails residents get when the project or a phase starts.',
  'Files': 'Files residents can download from the project page.',
  'Events': 'Meetings and walks residents can sign up for.'
};

export function ProjectSettings({project, tab, onTabChange, onClose}: {project: Project; tab: SettingsTab | null;
  onTabChange: (tab: SettingsTab) => void; onClose: () => void}) {
  return (
    // Modal's "With side tabs": a fixed height, an unpadded body, the grouped side list beside the panel.
    <Modal title="Project settings" width="wide" height="fixed" isFlush isOpen={tab !== null}
      onOpenChange={o => { if (!o) onClose(); }} footer={<Button size={32} slot="close">Save</Button>}>
      <GroupedTabs selectedKey={tab ?? 'General'} onSelectionChange={k => onTabChange(k as SettingsTab)} className="bo-phase-settings">
        <GroupedTabList aria-label="Project settings" className="bo-phase-settings-list">
          {SETTINGS_GROUPS.map(g => (
            <TabSection key={g.title} title={g.title}>
              {g.tabs.map(t => {
                const Icon = SETTINGS_ICON[t];
                return <GroupedTab key={t} id={t} textValue={t}><Icon aria-hidden size={16} strokeWidth={1.75} />{t}</GroupedTab>;
              })}
            </TabSection>
          ))}
        </GroupedTabList>
        {SETTINGS_TABS.map(t => (
          <GroupedTabPanel key={t} id={t} className="bo-phase-settings-panel">
            <div className="bo-phase-stack">
              <h3 className="bo-section-title bo-phase-flush">{t}</h3>
              <p className="bo-note bo-phase-flush">{SETTINGS_ABOUT[t]}</p>
              {t === 'General' && <>
                <TextField label="Title" defaultValue={project.title} />
                <TextField label="Project URL" prefix="internal.govocal.com/en/projects/" defaultValue={project.id} />
              </>}
              {t === 'Events' && <>
                <TextField label="Event title" placeholder="e.g. Walk along the corridor" />
                <DateRangeField label="Event dates" showTime />
              </>}
              {t === 'Input tags' && (
                <TagGroup label="Tags" items={IDEA_TAGS.map(id => ({id}))}>{item => <TagItem id={item.id}>{item.id}</TagItem>}</TagGroup>
              )}
              <p className="bo-note bo-phase-flush">The rest of this tab: not in Figma yet.</p>
            </div>
          </GroupedTabPanel>
        ))}
      </GroupedTabs>
    </Modal>
  );
}

export function AddPhase({isOpen, onOpenChange, onAdd}: {isOpen: boolean; onOpenChange: (open: boolean) => void;
  onAdd: (phase: NewPhase) => void}) {
  const [title, setTitle] = useState('');
  const [method, setMethod] = useState<Method>('Ideation');
  const [dates, setDates] = useState('');
  const add = () => {
    if (!title.trim()) return;
    onAdd({id: `new-${Date.now()}`, title: title.trim(), method, dates: dates.trim() || 'Dates not set'});
    setTitle(''); setDates('');
    onOpenChange(false);
  };
  return (
    <Modal title="Add a phase" isOpen={isOpen} onOpenChange={onOpenChange}
      footer={<>
        <Button variant="secondary" size={32} slot="close">Cancel</Button>
        <Button size={32} isDisabled={!title.trim()} onPress={add}>Add phase</Button>
      </>}>
      <Form className="bo-phase-stack" onSubmit={e => { e.preventDefault(); add(); }}>
        <TextField label="Title" isRequired value={title} onChange={setTitle} autoFocus />
        <Select label="Method" selectedKey={method} onSelectionChange={k => setMethod(k as Method)}>
          {METHODS.map(m => <SelectItem key={m} id={m}>{m}</SelectItem>)}
        </Select>
        <TextField label="Dates" placeholder="e.g. 17 Nov to 7 Dec" value={dates} onChange={setDates} />
      </Form>
    </Modal>
  );
}

/** The Attachments card's dialog, as File list's "In a dialog" story: a compact Drop zone, the list, Done. */
function Attachments({isOpen, onOpenChange, files, onChange}: {isOpen: boolean; onOpenChange: (open: boolean) => void;
  files: FileListItemData[]; onChange: Dispatch<SetStateAction<FileListItemData[]>>}) {
  // Updates go through the setter: File list keeps each row's first Delete handler (its rows are cached by item).
  const add = (picked: File[]) => onChange(current => [...current, ...picked.map((f, k) => ({
    id: `f${Date.now()}-${k}`, name: f.name,
    meta: `${(f.name.split('.').pop() ?? 'file').toUpperCase()} · ${Math.max(1, Math.round(f.size / 1024))} KB`
  }))]);
  return (
    <Modal title="Attachments" isOpen={isOpen} onOpenChange={onOpenChange}
      footer={<Button variant="secondary" slot="close">Done</Button>}>
      <div className="bo-phase-attach">
        <DropZone density="compact" acceptedFileTypes={['*']} allowsMultiple onSelect={list => list && add([...list])}
          onDrop={async e => add(await Promise.all(e.items.flatMap(i => (i.kind === 'file' ? [i.getFile()] : []))))}>
          Drop a file here or browse
        </DropZone>
        <FileList aria-label="Attachments" items={files} onDelete={item => onChange(current => current.filter(f => f.id !== item.id))} />
      </div>
    </Modal>
  );
}

/** What opens behind a Build card that has no screen of its own yet. */
export function CardStub({title, onClose}: {title: string | null; onClose: () => void}) {
  return (
    <Modal title={title ?? ''} isOpen={title !== null} onOpenChange={o => { if (!o) onClose(); }}
      footer={<Button size={32} slot="close">Done</Button>}>
      <p className="bo-note bo-phase-flush">{title}: not in Figma yet.</p>
    </Modal>
  );
}
