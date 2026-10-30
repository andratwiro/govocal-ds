import {createContext, useContext, useEffect, useMemo, useState, useSyncExternalStore, type Dispatch, type ReactNode,
  type SetStateAction} from 'react';
import {Navigate, useNavigate, useParams} from 'react-router';
import {CalendarDays, CircleCheck, CircleDashed, Copy, Download, ExternalLink, FileChartColumn, FileText, Inbox, Lightbulb, Link2, List, Lock, Mail,
  Map as MapIcon, MessageSquareText, Paperclip, MapPin, Plus, Settings, Sparkles, SquarePen, Tag, Trash2, TriangleAlert, Upload, User, Users} from 'lucide-react';
import {ACCESS_WHO_VALUE, AccessRightsModal, type AccessWho, AppFramePanel, Avatar, Badge, Banner,
  BulkOfficialUpdate, Button, Card, type ChartColor, CommentThread, CompactButton, DashboardBars, DashboardCard,
  DashboardDemographic, DashboardList, DashboardRanking, DashboardTopics, DataTable, DataTableAddColumn,
  DataTableAssignee, DataTableBody, DataTableCell, DataTableColumn, DataTableEmpty, DataTableHeader, DataTableRow,
  DataTableStack, DataTableTags, DataTableText, DataTableThumbnail, DateRangeField, DropZone, EmptyState, FileList,
  EmailPreview, type FileListItemData, FilterChips, type FilterFacet, FilterMenu, type FilterValue, Grid, GroupedTab, GroupedTabList,
  GroupedTabPanel, GroupedTabs, IconButton, Illustration, type IllustrationName, Inline, type Key, LineChart, ListHeader, type ListHeaderColumn, LocaleSwitcher,
  MapCard, MapChip, type MapItem, MapOverlay, MapView, Menu, MethodCard, MenuItem, MenuSection, MenuTrigger, Modal,
  MultilingualRichTextEditor, MultilingualTextField, type Multiloc, NotificationEmail, NotificationRow,
  NotificationRowList, OfficialUpdate, OptionList, Pagination, Panel, ParticipantActionList,
  ParticipantActionRow, ParticipantLimit, PhaseTimeline, PhoneCountdown, PhoneHeader, PhonePhaseCard, PhonePreview, PhoneStage,
  type PostedUpdate, ProjectHeader, PropertyList, PropertyListItem, ProposalsRow, RailHeader, ReactionCounts,
  SearchField, SectionLabel, SegmentedControl, SegmentedControlItem, Select, type SelectionAction, SelectionBar,
  SelectItem, Separator, SidePanel, SidePanelActions, SidePanelDecision, SidePanelRecordHead, SidePanelSection, Sparkline,
  Skeleton, Stack, StatRow, StatTile, SubmenuTrigger, Switch, TableToolbar, TableToolbarHeading, TabSection, Text, TextField, type ThreadComment,
  type ThreadTab, type ThreadTarget, TileGrid, type TimelinePhase, TitleField, toast, ViewOptionList, ViewOptionRow,
  useNumberFormatter, VisuallyHidden, VolunteeringRow, VotingRow, WorkspaceLayout} from 'govocal-ds';
import {Dialog, Tag as TagItem, TagGroup} from 'govocal-ds/base';
import {PICTURES} from '../pictures';
import {useOpenNav} from '../Layout';
// Form field summary is a recipe (a story and its CSS): the page keeps its markup and uses the recipe's stylesheet.
import {ME, PROJECTS, type Method, type Phase, type Project} from '../data';
import {LOCALES} from '../data-settings';
import {IDEAS, IDEA_ASSIGNEES, IDEA_REPLIES, IDEA_SOURCES, IDEA_STATUSES, IDEA_TAGS, AREAS, TOPICS, PHASE_FILES, SCREENING_PHASES, TEAM, addedTimeline,
  NO_OVERVIEW, OVERVIEWS, PHONE_CALL, INSIGHT_WEEKS, PARTICIPATION_WEEKS, AI_SUMMARY, VOTE_OPTIONS, VOTES_BY_DAY, VOTER_AGES,
  VOTER_COMMUTES, PROPOSALS, IDEA_FORM, INPUT_TERMS, IDEA_SORTS, PARTICIPANT_ACTIONS, VOLUNTEER_ACTIONS, IDEA_VIEWS, emailsFor, CAUSES,
  ideaComments, ideaInternal, ideaUpdates, timeline, asPhase, type Idea, type IdeaStatus, type NewPhase, type ParticipantAction} from '../data-project';


// The phase screen, from the Figma frames "Project · Build" and "Ideation · Manage (data)" (Screens WIP):
// a header bar (Project header · mode switch · actions) over the Participation rail and the tab's panels.
const TABS = ['build', 'manage', 'insights'] as const;
type Tab = typeof TABS[number];
const label = (t: string) => t[0].toUpperCase() + t.slice(1);
const phaseUrl = (project: Project, phase: Phase, tab: Tab) => `/projects/${project.id}/phases/${phase.id}/${tab}`;

// Phases added from the method picker, per project, for the whole visit: the overview and every phase screen share
// them, so picking a method can open the new phase's Build at once.
const addedPhases = new Map<string, NewPhase[]>();
const addedListeners = new Set<() => void>();
const NO_PHASES: NewPhase[] = [];
export function useAddedPhases(projectId: string): [NewPhase[], (p: NewPhase) => void] {
  const list = useSyncExternalStore(
    on => { addedListeners.add(on); return () => { addedListeners.delete(on); }; },
    () => addedPhases.get(projectId) ?? NO_PHASES
  );
  const add = (p: NewPhase) => {
    addedPhases.set(projectId, [...(addedPhases.get(projectId) ?? []), p]);
    addedListeners.forEach(on => on());
  };
  return [list, add];
}
/** Whether a new phase's Build has its title and dates (Save waits for them), by phase id. */
const ReadyContext = createContext<(id: string, ready: boolean) => void>(() => {});

export function ProjectPhase() {
  // One state per project: a phase added on one project's rail stays there.
  return <PhaseScreen key={useParams().projectId} />;
}

function PhaseScreen() {
  const {projectId, phaseId, tab} = useParams();
  const navigate = useNavigate();
  const openNav = useOpenNav();
  const [railCollapsed, setRailCollapsed] = useRailCollapsed();
  const [settings, setSettings] = useState<SettingsTab | null>(null);
  const [adding, setAdding] = useState(false);
  const [added] = useAddedPhases(projectId ?? '');
  const [ready, setReady] = useState<Record<string, boolean>>({});
  const [removed, deletePhase] = useDeletedPhases();
  const [save, setSave] = useState<'idle' | 'saving' | 'saved'>('idle');
  const project = PROJECTS.find(p => p.id === projectId);
  if (!project) return <Navigate to="/projects" replace />;
  const phases = [...project.phases, ...added.map(asPhase)];
  const phase = phases.find(p => p.id === phaseId) ?? phases[0];
  // A phase just added from the picker: Save stays off until its title and dates are set.
  const isNew = added.some(p => p.id === phase.id);
  const canSave = !isNew || ready[phase.id];
  const tabs = tabsOf(phase);
  if (phase.id !== phaseId || !tabs.includes(tab as Tab)) return <Navigate to={phaseUrl(project, phase, 'build')} replace />;
  const view = tab as Tab;
  // Any change in the setup turns "Back to project" into Save again.
  const changed = () => setSave('idle');
  const key = `${project.id}/${phase.id}`;
  const rail = <ProjectRail project={project} current={phase.id} added={added} onAdd={() => setAdding(true)} onHide={() => setRailCollapsed(true)}
    removed={removed} onDelete={deletePhase} href={p => `#${phaseUrl(project, p, view)}`} />;

  // Workspace layout on every tab: the rail, the tab's work column, then its stage or list. A phase that hasn't
  // started has collected nothing: Manage and Insights show the Empty state.
  let body: ReactNode;
  if (view === 'build') body = <Build key={key} project={project} phase={phase} number={phases.indexOf(phase) + 1} rail={rail} onSettings={setSettings} onChange={changed} />;
  else if (phase.status === 'Draft') body = <EmptyTab phase={phase} tab={view} rail={rail} />;
  else if (view === 'manage') {
    body = phase.method === 'Ideation'
      ? <Manage key={key} phase={phase} project={project} rail={rail} onAddPhase={() => setAdding(true)} />
      : <MethodManage phase={phase} rail={rail} />;
  } else body = <Insights key={key} project={project} phase={phase} rail={rail} />;

  return (
    <Grid rows="auto 1fr" gap="8" className="bo-phase">
      <VisuallyHidden elementType="h1">{project.title}</VisuallyHidden>
      {/* Project header's phase bar ("Tabs and unread dot", "Save states"): the panel toggle opens the platform's
          menu; crumbs and the project's own status; the phase's tabs (a survey has no Manage), Manage's dot while
          inputs wait unseen; who is here; Save, saving, then Back to project. */}
      <ProjectHeader level="phase" status={project.status === 'Live' ? 'live' : 'draft'} projectName={project.title} phaseName={phase.title || phase.method}
        projectHref={`#/projects/${project.id}`} onBack={() => navigate(`/projects/${project.id}`)} onTogglePanel={openNav}
        labels={{toggleTimeline: NAV_TOGGLE}}
        modes={tabs.length > 1 ? tabs.map(t => ({id: t, label: label(t), hasUnread: t === 'manage' && (phase.fresh ?? 0) > 0})) : undefined} mode={view}
        onModeChange={t => navigate(phaseUrl(project, phase, t as Tab))}
        people={<Avatar initials={ME.slice(-1)} aria-label={`${ME} is here`} />}
        saveState={canSave ? save : undefined} onSave={() => { setSave('saving'); setTimeout(() => { setSave('saved'); toast('Changes saved'); }, 600); }} />
      <ReadyContext.Provider value={(id, r) => setReady(all => (all[id] === r ? all : {...all, [id]: r}))}>
        <WorkspaceRail isCollapsed={railCollapsed} onCollapsedChange={setRailCollapsed}>{body}</WorkspaceRail>
      </ReadyContext.Provider>
      <ProjectSettings project={project} tab={settings} onTabChange={setSettings} onClose={() => setSettings(null)} />
      <AddPhase project={project} isOpen={adding} onOpenChange={setAdding} />
    </Grid>
  );
}

/** The header's panel toggle opens the platform's menu (Side nav's "Hidden" story) on every project screen. */
export const NAV_TOGGLE = 'Show the platform menu';
// A survey phase has no Manage tab: its answers are read in Insights.
// An information phase collects nothing: Build only, and the header draws no switch.
const tabsOf = (phase: Phase): readonly Tab[] => (phase.method === 'Survey' ? ['build', 'insights']
  : phase.method === 'Information' ? ['build'] : TABS);

/** The rail's collapsed state, and focus on the strip's button once it collapses (the rail's own button goes with it). */
export function useRailCollapsed(): [boolean, (collapsed: boolean) => void] {
  const [collapsed, setCollapsed] = useState(false);
  const set = (next: boolean) => {
    setCollapsed(next);
    if (next) requestAnimationFrame(() => document.querySelector<HTMLElement>(`button[aria-label="${SHOW_RAIL}"]`)?.focus());
  };
  return [collapsed, set];
}
const SHOW_RAIL = 'Show the participation rail';

/** Workspace layout's rail and the collapse it carries, handed to each tab, which fills in its column and its stage. */
const RailState = createContext<{isCollapsed: boolean; onCollapsedChange: (c: boolean) => void}>({isCollapsed: false, onCollapsedChange: () => {}});
export function WorkspaceRail({isCollapsed, onCollapsedChange, children}: {isCollapsed: boolean; onCollapsedChange: (c: boolean) => void;
  children: ReactNode}) {
  return <RailState.Provider value={{isCollapsed, onCollapsedChange}}>{children}</RailState.Provider>;
}

/** A project screen's columns: Workspace layout with the Participation rail, the tab's work column and the rest. */
export function Workspace({rail, column, columnLabel, main = 'stage', children}: {rail: ReactNode; column?: ReactNode;
  columnLabel?: string; main?: 'stage' | 'plain'; children: ReactNode}) {
  const {isCollapsed, onCollapsedChange} = useContext(RailState);
  return (
    <WorkspaceLayout rail={rail} railLabel="Participation" isRailCollapsed={isCollapsed} onRailCollapsedChange={onCollapsedChange}
      labels={{showRail: SHOW_RAIL}} column={column} columnLabel={columnLabel} main={main} className="bo-workspace">
      {children}
    </WorkspaceLayout>
  );
}

/** Phases deleted from the rail (Rail phase's delete button): gone at once, a Toast can undo it. */
export function useDeletedPhases(): [Set<string>, (p: TimelinePhase) => void] {
  const [removed, setRemoved] = useState<Set<string>>(new Set());
  const remove = (p: TimelinePhase) => {
    setRemoved(s => new Set(s).add(p.id));
    toast(`${p.title} deleted`, undefined, {action: 'Undo', onAction: () => setRemoved(s => new Set([...s].filter(id => id !== p.id)))});
  };
  return [removed, remove];
}

/** The Participation rail, on the project overview and the phase screens alike (Workspace layout's rail): the Rail
 * header (Add a phase, and the button that collapses the rail), the timeline (Phase timeline, each row deletable but
 * the phase on screen), the spotlight methods running beside it, then the project's events ("Events" story). */
export function ProjectRail({project, href, current, added, onAdd, onHide, removed, onDelete}: {project: Project;
  href: (p: Phase) => string; current?: string; added: NewPhase[]; onAdd: () => void; onHide: () => void;
  removed: Set<string>; onDelete: (p: TimelinePhase) => void}) {
  const {spotlight, events} = OVERVIEWS[project.id] ?? NO_OVERVIEW;
  const phases = [...timeline(project, href, current), ...addedTimeline(added, p => href(asPhase(p)), current)].filter(p => !removed.has(p.id));
  return (
    <Stack gap="16">
      <RailHeader title="Participation" onAdd={onAdd} onTogglePanel={onHide}
        labels={{add: 'Add a phase', togglePanel: 'Hide the participation rail'}} />
      <Stack elementType="nav" aria-label="Phases">
        <SectionLabel>Timeline</SectionLabel>
        <PhaseTimeline phases={phases} onDelete={onDelete} />
      </Stack>
      {spotlight.length > 0 && (
        <Stack>
          <SectionLabel>Spotlight</SectionLabel>
          <PhaseTimeline phases={spotlight} />
        </Stack>
      )}
      {events.length > 0 && (
        <Stack>
          <SectionLabel>Events</SectionLabel>
          <PhaseTimeline phases={events} />
        </Stack>
      )}
    </Stack>
  );
}

// The project's setup steps: "Before you publish" while a draft; once published, Project details shows the first five
// (Plan participation is the rail's job by then), without their marks and with the project's own area and tags.
export const CHECKLIST: {title: string; action: 'open' | 'expand' | 'pick'; body?: string; draftOnly?: boolean}[] = [
  {title: 'Settings', action: 'open'},
  {title: 'Edit project page', action: 'open'},
  {title: 'Set project card', action: 'expand', body: 'The card residents see on the homepage and in project lists: an image, a title and a one-line summary.'},
  {title: 'Set area', action: 'pick'},
  {title: 'Set topic tags', action: 'pick'},
  {title: 'Plan participation', action: 'open', draftOnly: true}
];
/** A published project's area and topic tags, as Project details shows them. */
const SET_AREA = [AREAS[0]];
const SET_TAGS = TOPICS.slice(0, 2);

const pin = <MapPin aria-hidden size={16} />;
const counted = (n: number, one: string, many: string) => `${n} ${n === 1 ? one : many}`;
/** A setup step's mark before its title (Card's `leading`): a dashed ring to do, a check once set. */
const stepMark = (isDone: boolean) => (isDone ? <CircleCheck aria-hidden size={16} /> : <CircleDashed aria-hidden size={16} />);
/** The chosen value as Card's pill, tinted (Card's "Setup row · pick" story). */
const chosen = (value?: string) => (value ? [{label: value, isSelected: true}] : undefined);

/** Set area, Card's pick row with a Menu: one of three choices, "Selected areas ›" a checklist of areas. */
function SetArea({onChange, leading, isSet}: {onChange?: () => void; leading: (isDone: boolean) => ReactNode; isSet?: boolean}) {
  const [mode, setMode] = useState<string | null>(isSet ? 'selected' : null);
  const [areas, setAreas] = useState<Set<string>>(new Set(isSet ? SET_AREA : []));
  const names = AREAS.filter(a => areas.has(a));
  const value = mode === 'none' ? 'No specific area' : mode === 'all' ? 'All areas'
    : mode === 'selected' && names.length ? (names.length === 1 ? names[0] : counted(names.length, 'area', 'areas')) : undefined;
  return (
    <Card title="Set area" control="pick" pickerKind="menu" leading={leading(value != null)} pills={chosen(value)} picker={
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

/** Set topic tags, Card's pick row with the Option list, searchable, with its footer and Done. */
function SetTopicTags({onChange, leading, isSet}: {onChange?: () => void; leading: (isDone: boolean) => ReactNode; isSet?: boolean}) {
  const [tags, setTags] = useState<string[]>(isSet ? SET_TAGS : []);
  return (
    <Card title="Set topic tags" control="pick" leading={leading(tags.length > 0)}
      pills={chosen(tags.length ? counted(tags.length, 'tag', 'tags') : undefined)} picker={
        <OptionList aria-label="Topic tags" items={TOPICS.map(t => ({id: t, label: t}))} value={tags} onChange={t => { setTags(t); onChange?.(); }}
          placeholder="Search tags..." labels={{search: () => 'Search tags'}}
          selectionLabel={k => (k ? `${counted(k, 'tag', 'tags')} selected` : 'No tags selected')} />
      } />
  );
}

/** One step of the project's setup, as Card's rows (its "Setup row · link" and "· pick" stories): before publishing
 * with a `leading` mark (to do, or done); in a published project's Project details bare, its area and tags set. */
export function ChecklistStep({step, onOpen, onChange, isPublished}: {step: typeof CHECKLIST[number]; onOpen: (title: string) => void;
  onChange?: () => void; isPublished?: boolean}): ReactNode {
  const leading = (isDone: boolean) => (isPublished ? undefined : stepMark(isDone));
  if (step.title === 'Set area') return <SetArea onChange={onChange} leading={leading} isSet={isPublished} />;
  if (step.title === 'Set topic tags') return <SetTopicTags onChange={onChange} leading={leading} isSet={isPublished} />;
  if (step.action === 'expand') {
    return (
      <Card title={step.title} control="expand" leading={leading(false)}>
        <Text elementType="p" kind="small" color="meta">{step.body}</Text>
      </Card>
    );
  }
  return <Card title={step.title} control="link" leading={leading(false)} onOpen={() => onOpen(step.title)} />;
}

// Where each checklist card leads: two open a settings tab, the rest a stub until they're drawn.
export const CHECKLIST_TAB: Partial<Record<string, SettingsTab>> = {'Settings': 'General', 'Edit project page': 'Project page'};

// "Project · Build", after the prototype's Build tab: Workspace layout with the rail, the method's setup in the middle
// (a plain Panel, the phase's cards in sections) and what residents see of the phase on the stage (the Phone preview
// on its Phone stage). The project's own publish checklist lives on the overview. An email opened from the
// Notifications card takes the setup's place (Notification email), the email itself on the phone.
function Build({project, phase, number, rail, onSettings, onChange}: {project: Project; phase: Phase; number: number; rail: ReactNode;
  onSettings: (tab: SettingsTab) => void; onChange: () => void}) {
  const [stub, setStub] = useState<string | null>(null);
  const [attaching, setAttaching] = useState(false);
  const [files, setFiles] = useState<FileListItemData[]>(PHASE_FILES);
  const emails = emailsFor(phase.method);
  const [emailsOn, setEmailsOn] = useState(() => new Set(emails.filter(e => e.on).map(e => e.id)));
  const [emailId, setEmailId] = useState<string | null>(null);
  const setEmail = (id: string, on: boolean) => {
    setEmailsOn(s => (on ? new Set(s).add(id) : new Set([...s].filter(e => e !== id))));
    onChange();
  };
  const email = emails.find(e => e.id === emailId);
  // What every method's cards share: the stub behind a card, the attachments, the emails.
  const common: SetupCommon = {phase, screens: SCREENING_PHASES.has(`${project.id}/${phase.id}`), onOpen: setStub, onChange, files: files.length, onAttach: () => setAttaching(true),
    emails, emailsOn, onEmailChange: setEmail, onEmailOpen: setEmailId};
  const column = (
    <Panel variant="plain" title={`${phase.method} setup`}
      actions={<IconButton aria-label="Project settings" onPress={() => onSettings('General')}><Settings aria-hidden size={16} /></IconButton>}>
      {email ? (
        <NotificationEmail key={email.id} name={email.name} who={email.who} when={email.when}
          labels={{back: `Back to ${phase.method} setup`}} onBack={() => setEmailId(null)}
          isSelected={emailsOn.has(email.id)} onChange={on => setEmail(email.id, on)}
          replyTo="support@example.org" subject={email.name} buttonText="View it" />
      ) : (
        <Stack gap="8">
          {phase.method === 'Ideation' ? <IdeationCards {...common} />
          : phase.method === 'Volunteering' ? <VolunteeringCards {...common} />
          : phase.method === 'Information' ? <InformationCards {...common} />
          : <FirstCards {...common} />}
        </Stack>
      )}
    </Panel>
  );
  return (
    <>
      <Workspace rail={rail} column={column}>
        <Grid elementType="section" aria-label="Preview" className="bo-fill">
          {email ? (
            <EmailPreview aria-label={`The email: ${email.name}`} subject={email.name} to={email.who} from="Larkvale"
              logo={LOGO} logoLabel="Larkvale" title={email.name} headingLevel={2} buttonText="View it" defaultDevice="phone">
              <p>{email.when}: this email goes to the {email.who.toLowerCase()}.</p>
            </EmailPreview>
          ) : <PhasePhone project={project} phase={phase} number={number} />}
        </Grid>
      </Workspace>
      <CardStub title={stub} onClose={() => setStub(null)} />
      <Attachments isOpen={attaching} onOpenChange={setAttaching} files={files} onChange={setFiles} />
    </>
  );
}

/** The platform's logo mark in the phone's header (Phone preview's "Logo header" story): invented, drawn inline. */
export const LOGO = (
  <svg viewBox="0 0 32 16" width={32} height={16} fill="currentColor" aria-hidden="true">
    <path d="M0 16 9 4l5 6 4-5 7 11H0Z" />
  </svg>
);

type PhoneState = 'before' | 'open' | 'ended';
const STATE_OF: Record<Phase['status'], PhoneState> = {Draft: 'before', Live: 'open', Done: 'ended'};

/** What residents see of the phase (Phone phase card's "In the phone"): its number, title and dates on the phase page,
 * and the participation bar at the foot. A vote's or a common ground's stage switches the phone between Before, Open
 * and Ended (Phone preview's "Stage toolbar"). */
function PhasePhone({project, phase, number}: {project: Project; phase: Phase; number: number}) {
  const [state, setState] = useState<PhoneState>(STATE_OF[phase.status]);
  const call = PHONE_CALL[phase.method];
  const toolbar = (phase.method === 'Voting' || phase.method === 'Common ground') && (
    <SegmentedControl aria-label="Phase state" disallowEmptySelection selectedKeys={[state]}
      onSelectionChange={k => { const next = [...k][0]; if (next) setState(next as PhoneState); }}>
      <SegmentedControlItem id="before">Before</SegmentedControlItem>
      <SegmentedControlItem id="open">Open</SegmentedControlItem>
      <SegmentedControlItem id="ended">Ended</SegmentedControlItem>
    </SegmentedControl>
  );
  const range = phaseDates(phase.dates);
  const footer = state === 'open'
    ? <PhoneCountdown cta={call?.button ?? 'Take part'}>{phase.status === 'Live' && project.timeLeft ? project.timeLeft : 'Open now'}</PhoneCountdown>
    : <PhoneCountdown>{state === 'before' ? (range ? `Starts on ${range[0]}` : 'Not started yet') : 'Ended'}</PhoneCountdown>;
  return (
    <PhoneStage caption={`What residents see ${state === 'before' ? 'before the phase opens' : state === 'open' ? 'while the phase is open' : 'once the phase has ended'}`}
      toolbar={toolbar || undefined}>
      <PhonePreview aria-label={`What residents see of ${phase.title}`} header={<PhoneHeader mark={LOGO} logo="Larkvale" />} surface="grey"
        footer={footer}>
        <PhonePhaseCard number={number} title={phase.title} dates={phase.dates}>
          {call ? <p>{call.line}</p> : <><Skeleton /><Skeleton width="70%" /></>}
        </PhonePhaseCard>
      </PhonePreview>
    </PhoneStage>
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

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
/** The phase's dates as the Date range field takes them, "YYYY-MM-DD". A date without its year falls in the demo's
 * season, August 2026 to July 2027 (its today is late October 2026). */
function phaseRange(dates: string): {start: string; end: string} | undefined {
  const range = phaseDates(dates);
  if (!range) return undefined;
  const iso = (words: string) => {
    const [, day, month, year] = words.match(/^(\d{1,2})\s+([A-Z][a-z]{2})(?:\s+(\d{4}))?$/) ?? [];
    const m = MONTHS.indexOf(month);
    if (!day || m < 0) return undefined;
    const y = year ? Number(year) : m >= 7 ? 2026 : 2027;
    return `${y}-${String(m + 1).padStart(2, '0')}-${day.padStart(2, '0')}`;
  };
  // "01 Apr – 30 Apr 2027": the start borrows the end's year.
  const end = iso(range[1]);
  const start = iso(/\d{4}$/.test(range[0]) || !/\d{4}$/.test(range[1]) ? range[0] : `${range[0]} ${range[1].slice(-4)}`);
  return start && end ? {start, end} : undefined;
}

function PhaseStatus({phase}: {phase: Phase}) {
  const range = phaseDates(phase.dates);
  if (!phase.dates) return null;
  if (phase.status === 'Live') return <Banner density="compact" tone="success" title="Live">{range ? `Ends on ${range[1]}` : phase.dates}</Banner>;
  if (phase.status === 'Done') return <Banner density="compact" tone="neutral" title="Ended">{range ? `Closed on ${range[1]}` : phase.dates}</Banner>;
  return <Banner density="compact" tone="neutral" title="Not started">{range ? `Starts on ${range[0]}` : phase.dates}</Banner>;
}

// The phase's own cards, after the "Ideation · Build" Figma frame (Card types Required, Add, Review, To set) and the
// prototype's Build tab: Idea form folds out to the Form field summary recipe; Participant actions, Available views and
// Notifications are each their pattern's "In a card" story.
const firstPlus = (words: string[]) => (words.length ? [{label: words[0] + (words.length > 1 ? ` +${words.length - 1}` : '')}] : undefined);
const DATES_HELP = 'Ideas can be posted from the first day to the last.';

// The platform's languages (Settings' Platform configuration): every multilingual field of the project takes them.
const LANGUAGES = LOCALES.map(l => l.id);

/** Where each setup row's review stands: To review until the person has opened it, then Reviewed (Card's "Setup
 * rows" story: the page sets it from `onExpandedChange`; Card draws the look). */
function useReviewed(): {status: (title: string) => 'to-review' | 'reviewed'; seen: (title: string) => (open: boolean) => void} {
  const [opened, setOpened] = useState<Set<string>>(new Set());
  return {
    status: title => (opened.has(title) ? 'reviewed' : 'to-review'),
    seen: title => open => { if (open) setOpened(s => (s.has(title) ? s : new Set(s).add(title))); }
  };
}
type Reviewed = ReturnType<typeof useReviewed>;
/** An expanding setup row's review props: its status, and Reviewed once opened. */
const review = (r: Reviewed, title: string) => ({title, control: 'expand' as const, status: r.status(title), onExpandedChange: r.seen(title)});

/** The phase's dates (a setup row), then its title and description straight in the column (the prototype's Build tab):
 * the Title field with one content-language menu in its end, which drives the Multilingual rich text editor under it. */
function DatesAndTitle({phase, onChange, help, reviewed}: {phase: Phase; onChange: () => void; help: string; reviewed: Reviewed}) {
  const [locale, setLocale] = useState(LANGUAGES[0]);
  const [title, setTitle] = useState<Multiloc>({[LANGUAGES[0]]: phase.title});
  const [description, setDescription] = useState<Multiloc>({});
  const [hasDates, setHasDates] = useState(phaseRange(phase.dates) != null);
  const setReady = useContext(ReadyContext);
  const ready = hasDates && !!title[LANGUAGES[0]]?.trim();
  useEffect(() => setReady(phase.id, ready), [phase.id, ready, setReady]);
  return <>
    <li data-gv="setup-card"><Card {...review(reviewed, 'Dates')} isRequired pills={phase.dates ? [{label: phase.dates, icon: CalendarDays}] : undefined}>
      {/* The prototype's Dates row opens to the fields and where the phase stands ("Finished 11 days ago"). */}
      <Stack gap="8">
        <DateRangeField isRequired description={help} defaultValue={phaseRange(phase.dates)}
          onChange={v => { setHasDates(v != null); onChange(); }} />
        <PhaseStatus phase={phase} />
      </Stack>
    </Card></li>
    <li>
      <Stack gap="8">
        <TitleField aria-label="Phase title" placeholder="Add a title" isRequired lang={locale} value={title[locale] ?? ''}
          onChange={text => { setTitle(t => ({...t, [locale]: text})); onChange(); }}
          localeSwitcher={(
            <LocaleSwitcher kind="menu" aria-label="Content language" locales={LANGUAGES} locale={locale}
              onLocaleChange={setLocale} values={[title, description]} isRequired />
          )} />
        <MultilingualRichTextEditor aria-label="Phase description" placeholder="Add a short description" locales={LANGUAGES}
          locale={locale} onLocaleChange={setLocale} showLocaleSwitcher={false} value={description}
          description="Residents read it at the top of the phase's page."
          onChange={v => { setDescription(v); onChange(); }} />
      </Stack>
    </li>
  </>;
}

/** A quiet label over a group of setup rows (the prototype's Build sections). */
function SetupSection({title, children}: {title: string; children: ReactNode}) {
  return (
    <li>
      <Stack gap="8" paddingBlock="8">
        <SectionLabel>{title}</SectionLabel>
        <Stack elementType="ul" gap="8" aria-label={title}>{children}</Stack>
      </Stack>
    </li>
  );
}

/** What every method's setup cards are handed by Build. */
type SetupCommon = {phase: Phase; screens: boolean; onOpen: (title: string) => void; onChange: () => void; files: number; onAttach: () => void;
  emails: Email[]; emailsOn: Set<string>; onEmailChange: (id: string, on: boolean) => void; onEmailOpen: (id: string) => void};
type Email = ReturnType<typeof emailsFor>[number];

/** Attachments: the files residents can download from the phase, the dialog behind its button. */
function AttachmentsCard({files, onAttach}: Pick<SetupCommon, 'files' | 'onAttach'>) {
  return (
    <li data-gv="setup-card"><Card title="Attachments" summary={files ? `${files} ${files === 1 ? 'file' : 'files'}` : undefined}
      iconActions={[{icon: Paperclip, label: 'Add an attachment', onPress: onAttach}]} /></li>
  );
}

/** Notifications (Notification row's "In a card"): the phase's emails, each switched on or off, each opening in the setup's place. */
function NotificationsCard({reviewed, emails, emailsOn, onEmailChange, onEmailOpen}: {reviewed: Reviewed} &
  Pick<SetupCommon, 'emails' | 'emailsOn' | 'onEmailChange' | 'onEmailOpen'>) {
  const count = emails.filter(e => emailsOn.has(e.id)).length;
  return (
    <li data-gv="setup-card"><Card {...review(reviewed, 'Notifications')}
      pills={[{label: count ? `${count} ${count === 1 ? 'email' : 'emails'} on` : 'Off'}]}>
      <NotificationRowList>
        {emails.map(e => (
          <NotificationRow key={e.id} who={e.who} when={e.when} isSelected={emailsOn.has(e.id)}
            onChange={on => onEmailChange(e.id, on)} onOpen={() => onEmailOpen(e.id)}>
            {e.name}
          </NotificationRow>
        ))}
      </NotificationRowList>
    </Card></li>
  );
}

/** Participant actions (its pattern's "In a card"): which actions are on, who can take each (its Access rights modal),
 * and whether that is set for this phase. Reacting carries its limit and Disliking while it is on. */
function ParticipantActionsCard({actions, reviewed, onChange}: {actions: readonly ParticipantAction[]; reviewed: Reviewed;
  onChange: () => void}) {
  const [actionsOn, setActionsOn] = useState<Record<string, boolean>>(() => Object.fromEntries(actions.map(a => [a.id, true])));
  const [disliking, setDisliking] = useState(false);
  const [who, setWho] = useState<Record<string, AccessWho>>(() => Object.fromEntries(actions.map(a => [a.id, 'signin' as AccessWho])));
  const [own, setOwn] = useState<Record<string, boolean>>({});
  const [access, setAccess] = useState<string | null>(null);
  const changed = <T,>(set: (v: T) => void) => (v: T) => { set(v); onChange(); };
  const accessFor = actions.find(a => a.id === access);
  return (
    <li data-gv="setup-card"><Card {...review(reviewed, 'Participant actions')}
      pills={firstPlus(actions.filter(a => !a.isLocked && actionsOn[a.id]).map(a => a.short))}>
      <ParticipantActionList>
        {actions.map(a => [
          <ParticipantActionRow key={a.id} value={ACCESS_WHO_VALUE[who[a.id]]} isDefault={!own[a.id]} isLocked={a.isLocked}
            isSelected={actionsOn[a.id]} onChange={changed((v: boolean) => setActionsOn(s => ({...s, [a.id]: v})))}
            onOpen={() => setAccess(a.id)} options={a.id === 'react' ? <ParticipantLimit onChange={onChange} /> : undefined}>
            {a.label}
          </ParticipantActionRow>,
          // Disliking hangs from Reacting: a plain switch row while reacting is on.
          a.id === 'react' && actionsOn.react && (
            <ParticipantActionRow key="dislike" isSelected={disliking} onChange={changed(setDisliking)}>Disliking</ParticipantActionRow>
          )
        ])}
      </ParticipantActionList>
      {accessFor && (
        <AccessRightsModal key={accessFor.id} title={accessFor.question} isOpen onOpenChange={o => !o && setAccess(null)}
          whoItems={accessFor.id === 'event' ? ['signin', 'admins'] : undefined}
          defaultOverriding={!!own[accessFor.id]} onOverridingChange={changed((v: boolean) => setOwn(s => ({...s, [accessFor.id]: v})))}
          defaultWho={who[accessFor.id]} onWhoChange={changed((v: AccessWho) => setWho(s => ({...s, [accessFor.id]: v})))}
          onSave={() => setAccess(null)} />
      )}
    </Card></li>
  );
}

/** Moderation (the prototype's Rules section): who moderates the phase's inputs, its pill, and whether new inputs wait
 * for approval before they show (the Manage tab's screening). A team member by role, never a person's name. */
function ModerationCard({reviewed, screens, onChange}: {reviewed: Reviewed; screens: boolean; onChange: () => void}) {
  const [moderator, setModerator] = useState<string>(MODERATORS[0]);
  const [screening, setScreening] = useState(screens);
  return (
    <li data-gv="setup-card"><Card {...review(reviewed, 'Moderation')} pills={[{label: moderator}]}>
      <Stack gap="16">
        <Select label="Moderator" value={moderator} onChange={k => { setModerator(String(k)); onChange(); }}>
          {MODERATORS.map(m => <SelectItem key={m} id={m}>{m}</SelectItem>)}
        </Select>
        <Switch isSelected={screening} onChange={v => { setScreening(v); onChange(); }}
          description="New inputs wait in Manage until the moderator approves them.">Screen inputs before they are published</Switch>
      </Stack>
    </Card></li>
  );
}
const MODERATORS = IDEA_ASSIGNEES.filter(a => a !== 'Unassigned');

function IdeationCards({phase, onOpen, onChange, files, onAttach, screens, ...emails}: SetupCommon) {
  const reviewed = useReviewed();
  // Available views: List is always on; one view is the default.
  const [views, setViews] = useState<Record<string, boolean>>({list: true, map: false, perspectives: false});
  const [defaultView, setDefaultView] = useState('list');
  // The two rows that pick one value from their menu: once picked, they are reviewed.
  const [term, setTerm] = useState<string>(INPUT_TERMS[0]);
  const [sort, setSort] = useState<string>(IDEA_SORTS[0]);
  const changed = <T,>(set: (v: T) => void) => (v: T) => { set(v); onChange(); };
  const picked = (title: string, set: (v: string) => void) => (v: string) => { set(v); reviewed.seen(title)(true); onChange(); };
  return (
    <Stack elementType="ul" gap="8">
      <DatesAndTitle phase={phase} onChange={onChange} help={DATES_HELP} reviewed={reviewed} />
      <AttachmentsCard files={files} onAttach={onAttach} />
      <SetupSection title="Ideas and participant data">
        <li data-gv="setup-card"><Card title="What should an input be called?" status={reviewed.status('What should an input be called?')}
          control="menu" menuItems={INPUT_TERMS.map(t => ({id: t, label: t, icon: t === 'Idea' ? Lightbulb : undefined}))}
          value={term} onChange={picked('What should an input be called?', setTerm)} /></li>
        <li data-gv="setup-card"><Card {...review(reviewed, 'Idea form')} pills={[{label: `${IDEA_FORM.length} questions`}]}>
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
        <li data-gv="setup-card"><Card title="Collect demographic data" status="to-set" control="link" onOpen={() => onOpen('Collect demographic data')} /></li>
      </SetupSection>
      <SetupSection title="How ideas are shown">
        <li data-gv="setup-card"><Card {...review(reviewed, 'Available views')}
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
        <li data-gv="setup-card"><Card title="Sorting" status={reviewed.status('Sorting')} control="menu"
          menuItems={IDEA_SORTS.map(t => ({id: t, label: t}))} value={sort} onChange={picked('Sorting', setSort)} /></li>
      </SetupSection>
      <SetupSection title="Rules">
        <ParticipantActionsCard actions={PARTICIPANT_ACTIONS} reviewed={reviewed} onChange={onChange} />
        <ModerationCard reviewed={reviewed} screens={screens} onChange={onChange} />
        <NotificationsCard reviewed={reviewed} {...emails} />
      </SetupSection>
    </Stack>
  );
}

/** A method whose own setup isn't built yet: the rows every setup opens with (dates, title, description, Attachments). */
function FirstCards({phase, onChange, files, onAttach}: SetupCommon) {
  const reviewed = useReviewed();
  return (
    <Stack elementType="ul" gap="8">
      <DatesAndTitle phase={phase} onChange={onChange} help="Residents can take part from the first day to the last." reviewed={reviewed} />
      <AttachmentsCard files={files} onAttach={onAttach} />
      <li><Text elementType="p" kind="small" color="meta">The rest of the {phase.method.toLowerCase()} setup: not built yet.</Text></li>
    </Stack>
  );
}

/** An information phase's cards, after the prototype's Information setup: dates and title, Attachments, the Report row
 * (Download greyed until a report exists, Add a report opens Reporting) and Notifications. It collects nothing, so it
 * has no Manage or Insights. */
function InformationCards({phase, onChange, files, onAttach, onOpen: _, screens: _s, ...emails}: SetupCommon) {
  const navigate = useNavigate();
  const reviewed = useReviewed();
  return (
    <Stack elementType="ul" gap="8">
      <DatesAndTitle phase={phase} onChange={onChange} help="Residents can read the phase from the first day to the last." reviewed={reviewed} />
      <AttachmentsCard files={files} onAttach={onAttach} />
      <li data-gv="setup-card"><Card title="Report" actions={<>
        <Button variant="secondary" size={32} isDisabled>Download</Button>
        <Button size={32} onPress={() => navigate('/reporting')}><Plus aria-hidden size={16} />Add a report</Button>
      </>} /></li>
      <NotificationsCard reviewed={reviewed} {...emails} />
    </Stack>
  );
}

// A volunteering phase's cards, after the prototype's Volunteering setup: dates and title, Attachments, then Causes as a
// closed row (its list, Add a cause and Download volunteers, greyed until someone signs up, with the count), then
// Participant actions (Sign up) and Notifications. The list opens in a dialog: Volunteering row's "Build" layout, each
// cause with Edit and Delete.
function VolunteeringCards({phase, onOpen, onChange, files, onAttach, screens: _s, ...emails}: SetupCommon) {
  const [causes, setCauses] = useState(CAUSES);
  const [listing, setListing] = useState(false);
  const signedUp = causes.reduce((k, c) => k + c.volunteers, 0);
  const remove = (id: string) => {
    const at = causes.findIndex(c => c.id === id), gone = causes[at];
    setCauses(list => list.filter(c => c.id !== id));
    onChange();
    toast(`${gone.title} deleted`, undefined, {action: 'Undo', onAction: () => setCauses(list => [...list.slice(0, at), gone, ...list.slice(at)])});
  };
  const reviewed = useReviewed();
  return (
    <Stack elementType="ul" gap="8">
      <DatesAndTitle phase={phase} onChange={onChange} help="Residents can sign up from the first day to the last." reviewed={reviewed} />
      <AttachmentsCard files={files} onAttach={onAttach} />
      <li data-gv="setup-card"><Card title="Causes" pills={[{label: `${causes.length} ${causes.length === 1 ? 'cause' : 'causes'}`}]}
        iconActions={[
          {icon: List, label: 'Show the causes', tooltip: 'Show the causes', onPress: () => setListing(true)},
          {icon: Plus, label: 'Add a cause', tooltip: 'Add a cause', onPress: () => onOpen('Add a cause')},
          {icon: Download, label: 'Download volunteers', isDisabled: signedUp === 0, tooltip: signedUp ? 'Download volunteers' : 'Nobody has signed up yet'}
        ]} /></li>
      <ParticipantActionsCard actions={VOLUNTEER_ACTIONS} reviewed={reviewed} onChange={onChange} />
      <NotificationsCard reviewed={reviewed} {...emails} />
      <Modal title="Causes" isOpen={listing} onOpenChange={setListing} footer={<Button variant="secondary" slot="close">Done</Button>}>
        {causes.length ? (
          <div>
            {causes.map((c, i) => (
              <VolunteeringRow key={c.id} layout="build" title={c.title} volunteerCount={c.volunteers} isLast={i === causes.length - 1}
                onEdit={() => { setListing(false); onOpen(c.title); }} onDelete={() => remove(c.id)} />
            ))}
          </div>
        ) : <Text elementType="p" kind="small" color="meta">No causes yet. Add one with the + on the Causes row.</Text>}
      </Modal>
    </Stack>
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
// The prototype's Manage list: Idea (full text, its picture first when it has one, the warning mark) and Status; "+"
// adds Assignee, Tags, Likes and Comments.
const COLUMNS = [['assignee', 'Assignee'], ['tags', 'Tags'], ['likes', 'Likes'], ['comments', 'Comments']] as const;
const PAGE_SIZE = 20;
const PICTURE_LIST = Object.values(PICTURES);
const pictureOf = (i: Idea) => (i.hasPicture ? PICTURE_LIST[(Number(i.id.replace(/\D/g, '')) - 1) / 3 % PICTURE_LIST.length] : undefined);
const person = (name: string) => (name === 'Unassigned' ? undefined : name);
type Sort = {column: string | number; direction: 'ascending' | 'descending'};
// The Map view's "In the Manage tab" story: a pin per idea with a place, its card with the idea's counts.
type IdeaPin = MapItem & {idea: Idea};
const countsOf = (i: Idea) => [`${i.likes} ${i.likes === 1 ? 'like' : 'likes'}`, `${i.comments} ${i.comments === 1 ? 'comment' : 'comments'}`];

// A change in the side panel (or the Selection bar's Official update) applies at once; its toast can undo it.

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

function Manage({project, phase, rail, onAddPhase}: {project: Project; phase: Phase; rail: ReactNode; onAddPhase: () => void}) {
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
  // List or Map (the toolbar's switch); the idea a row of the map's list is hovering, to mark its pin.
  const [mode, setMode] = useState<'list' | 'map'>('list');
  const [hot, setHot] = useState<Key | null>(null);
  // In Map the open idea is its pin's card; the side panel, which would cover the list, opens from the card.
  const [reading, setReading] = useState(false);
  const pinCard = ({idea: i}: IdeaPin) => (
    <MapCard title={i.text} status={i.status} details={countsOf(i)} location={i.place?.where}
      actions={<Button variant="secondary" size={32} onPress={() => setReading(true)}>Open idea</Button>} />
  );
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
  const pins = useMemo<IdeaPin[]>(() => shown.flatMap(i => (i.place
    ? [{id: i.id, lat: i.place.lat, lng: i.place.lng, label: i.text, status: i.status, idea: i}] : [])),
  [shown.map(i => `${i.id}:${i.status}`).join()]); // eslint-disable-line react-hooks/exhaustive-deps
  const unplaced = shown.length - pins.length;
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
    toast(title, undefined, {action: 'Undo', onAction: () => setIdeas(list => list.map(i => (i.id === id ? {...i, ...undo} : i)))});
  };
  const remove = (id: string) => {
    const index = ideas.findIndex(i => i.id === id);
    const gone = ideas[index];
    setOpen(null);
    setIdeas(list => list.filter(i => i.id !== id));
    toast('Idea deleted', undefined, {action: 'Undo', onAction: () => setIdeas(list => [...list.slice(0, index), gone, ...list.slice(index)])});
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
    toast(`Warnings dismissed on ${ideasWord(n)}`, undefined, {action: 'Undo', onAction: () => setIdeas(list => list.map(i => (i.id in before ? {...i, warning: before[i.id]} : i)))});
  };
  // The panel's pager walks the whole filtered list; the table turns to the page the open idea is on.
  const openAt = (p: number) => { const next = shown[p - 1]; if (!next) return; setOpen(next.id); setPage(Math.ceil(p / PAGE_SIZE)); };

  // The work column (Workspace layout's "With a list"): the metrics, each a filter or a view of its own, then the
  // manager's actions as filled Cards.
  const column = (
    <Stack gap="16">
      <Stack>
        {WALKS.map(w => {
          const count = ideas.filter(i => (w.filter ? matches(i, w.filter) : w.test!(i))).length;
          const isOn = w.filter ? sameFilters(filters, w.filter) : walk?.key === w.key;
          return <StatRow key={w.key} label={w.label} value={String(count)} isNew={w.key === 'new' && count > 0}
            isStatic={count === 0} isSelected={isOn}
            onPress={() => (w.filter ? setFilters(isOn ? {} : w.filter) : setView(isOn ? null : w))} />;
        })}
      </Stack>
      <Stack elementType="ul" gap="10">
        <li><Card variant="filled" title="Add an idea" iconActions={[{icon: Plus, label: 'Add an idea'}]} /></li>
        <li><Card variant="filled" title="Import paper ideas" summary="Not set" iconActions={[{icon: Upload, label: 'Import paper ideas'}]} /></li>
        <li><Card variant="filled" title="Exports" iconActions={[{icon: Download, label: 'Export ideas'}]} /></li>
      </Stack>
    </Stack>
  );

  return (
    <>
      <Workspace rail={rail} column={column} columnLabel="Ideas overview" main="plain">
      {/* The prototype's list: no panel head, the count heading leads. The toolbar holds the count (or the Selection
          bar), the collapsible search and the Filter menu, then the chips (the quick view first); the table; the
          Pagination at its foot. */}
      <AppFramePanel elementType="section" aria-label={phase.title} padding="16" className="bo-fill">
        <Stack gap="8">
            <TableToolbar start={(
              <SelectionBar count={n} items={actions} onClear={() => setSelected(new Set())}
                onAction={id => (id === 'update' ? setUpdating(true) : id === 'dismiss-warnings' && dismissWarnings())}>
                <TableToolbarHeading>{ideasWord(shown.length)}</TableToolbarHeading>
              </SelectionBar>
            )}>
              <SegmentedControl size={30} aria-label="View" disallowEmptySelection selectedKeys={[mode]}
                onSelectionChange={k => { setMode([...k][0] as 'list' | 'map'); setReading(false); }}>
                <SegmentedControlItem id="list"><List aria-hidden />List</SegmentedControlItem>
                <SegmentedControlItem id="map"><MapIcon aria-hidden />Map</SegmentedControlItem>
              </SegmentedControl>
              <SearchField isCollapsible aria-label="Search ideas" placeholder="Search" value={query} onChange={setQuery} />
              <FilterMenu aria-label="Filter ideas" facets={facets} value={filters} onChange={setFilters} countLabel={ideasWord} />
            </TableToolbar>
            <FilterChips aria-label="Active filters" facets={facets} value={filters} onChange={setFilters}
              metric={walk?.label} onMetricRemove={() => setView(null)} />
            {note && <Text elementType="p" kind="small" color="meta" role="status">{note}</Text>}
        {/* Map: the Map view's "In the Manage tab" story, opening on all the ideas (no centre: it fits its pins). The map beside a one-column list of the same ideas (the whole
            filtered list, no pages); one open idea for both (the map's value, the list's openKey, the side panel), a
            hovered row marks its pin and a hovered pin its row. The chip counts the ideas the map can't show. */}
        {mode === 'map' ? (
          <Grid columns="minmax(0, 1fr) minmax(280px, 400px)" className="bo-phase-map">
            <MapView aria-label="Ideas on the map" items={pins} className="bo-phase-map-view"
              value={open} onChange={k => { setReading(false); setOpen(k == null ? null : String(k)); }} hoveredKey={hot} onHoverChange={setHot}
              renderCard={pinCard}>
              {unplaced > 0 && (
                <MapOverlay placement="bottom-start">
                  <MapChip>{unplaced} {unplaced === 1 ? 'idea' : 'ideas'} without a location</MapChip>
                </MapOverlay>
              )}
            </MapView>
            <div className="bo-phase-map-list">
              {/* A row reports its hover only when it does something: its action opens the idea. */}
              <DataTable aria-label="Ideas" density="compact" openKey={open}
                onRowAction={k => { setReading(false); setOpen(o => (o === String(k) ? null : String(k))); }}>
                <DataTableHeader>
                  <DataTableColumn isRowHeader>Idea</DataTableColumn>
                </DataTableHeader>
                <DataTableBody renderEmptyState={() => (
                  <DataTableEmpty>{ideas.length ? 'No ideas match. Clear the filters to see them all.' : 'No ideas here yet.'}</DataTableEmpty>
                )}>
                  {shown.map(i => (
                    <DataTableRow key={i.id} id={i.id} textValue={i.text} onHoverChange={h => setHot(h ? i.id : null)}>
                      <DataTableCell>
                        <DataTableStack sub={[i.screening ? 'Waiting for approval' : i.status, ...countsOf(i),
                          ...(i.place ? [] : ['No location'])].join(' · ')}>{i.text}</DataTableStack>
                      </DataTableCell>
                    </DataTableRow>
                  ))}
                </DataTableBody>
              </DataTable>
            </div>
          </Grid>
        ) : (
        /* The checkboxes keep the bulk selection, so the open idea can't also be the table's selection (the Side panel
            story's single-select `selectedKeys=[open]`): a row's action opens it instead, as in the Data table's
            "In a panel" story. */
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
            <DataTableColumn id="status" allowsSorting>Status</DataTableColumn>
            {extra.has('assignee') && <DataTableColumn id="assignee" allowsSorting>Assignee</DataTableColumn>}
            {extra.has('tags') && <DataTableColumn id="tags">Tags</DataTableColumn>}
            {extra.has('likes') && <DataTableColumn id="likes" align="number" allowsSorting>Likes</DataTableColumn>}
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
                    <DataTableText leading={picture && <DataTableThumbnail src={picture} />}
                      marks={i.warning && <TriangleAlert size={16} aria-label={`Content warning: ${i.warning}`} role="img" />}>
                      {i.text}
                    </DataTableText>
                  </DataTableCell>
                  <DataTableCell isMuted>{i.screening ? 'Waiting for approval' : i.status}</DataTableCell>
                  {extra.has('assignee') && <DataTableCell><DataTableAssignee name={person(i.assignee)} initials={i.assignee.slice(-1)} /></DataTableCell>}
                  {extra.has('tags') && <DataTableCell>{i.tags.length ? <DataTableTags items={i.tags} /> : null}</DataTableCell>}
                  {extra.has('likes') && <DataTableCell align="number">{i.likes}</DataTableCell>}
                  {extra.has('comments') && <DataTableCell align="number">{i.comments}</DataTableCell>}
                </DataTableRow>
              );
            })}
          </DataTableBody>
        </DataTable>
        )}
        {mode === 'list' && (
          <Inline justifyContent="end"><Pagination page={current} pageCount={pageCount} onPageChange={setPage} aria-label="Idea pages" /></Inline>
        )}
        </Stack>
      </AppFramePanel>
      </Workspace>
      <SidePanel label={phase.title} labels={{previous: 'Previous idea', next: 'Next idea'}} isOpen={!!idea && (mode === 'list' || reading)}
        onOpenChange={o => { if (o) return; setReading(false); if (mode === 'list') setOpen(null); }}
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
              <SidePanelRecordHead author={idea.author} date={idea.date} actions={(
                <SidePanelActions items={[
                  {id: 'edit', label: 'Edit', icon: icon(SquarePen)},
                  {id: 'view', label: 'View on the site', icon: icon(ExternalLink)},
                  {id: 'delete', label: 'Delete', icon: icon(Trash2), onPress: () => remove(idea.id)}
                ]}>
                  <ReactionCounts likes={idea.likes} dislikes={idea.dislikes}
                    comments={threads[idea.id].comments.reduce((k, c) => k + 1 + (c.replies?.length ?? 0), 0)} />
                </SidePanelActions>
              )}>
                {idea.text}
              </SidePanelRecordHead>
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
                      onAction={k => toast(`Copied to ${otherPhases.find(p => p.id === k)?.title}`)}>
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
                toast('Official update published', 'The author and everyone following this idea will see it.', {action: 'Undo', onAction: () => setUpdates(all => ({...all, [id]: all[id].filter(u => u.id !== update.id)}))});
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
                  toast('Comment deleted', undefined, {action: 'Undo', onAction: () => setThread(id, tab, restore)});
                }}
                onDismissWarning={cid => {
                  const id = idea.id, was = findComment(threads[id].comments, cid)?.warning;
                  setThread(id, 'comments', l => withWarning(l, cid, undefined));
                  toast('Content warning dismissed', undefined, {action: 'Undo', onAction: () => setThread(id, 'comments', l => withWarning(l, cid, was))});
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
        toast(`Official update sent to ${ideasWord(ids.length)}`, 'The authors and everyone following them will see it.', {action: 'Undo', onAction: () => {
          setIdeas(list => list.map(i => (i.id in before ? {...i, replied: before[i.id]} : i)));
          setUpdates(all => ({...all, ...Object.fromEntries(ids.map(id => [id, all[id].filter(u => u.id !== update.id)]))}));
        }});
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

/** The Empty state's "Manage tab" and "Insights tab" stories on the stage, its "Side panel" story in the work column. */
function EmptyTab({phase, tab, rail}: {phase: Phase; tab: 'manage' | 'insights'; rail: ReactNode}) {
  const noun = NOUN[phase.method];
  return (
    <Workspace rail={rail} columnLabel={tab === 'manage' ? `${capital(noun)} overview` : 'Recommended actions'}
      column={<EmptyState layout="panel" illustration="empty-notebook" headingLevel="none" title={tab === 'manage' ? `No ${noun} yet` : 'No insights yet'} />}>
      <AppFramePanel elementType="section" aria-label={label(tab)} padding="16" className="bo-fill bo-phase-empty">
        {tab === 'manage'
          ? <EmptyState illustration="empty-notebook" title={`${capital(noun)} will appear here`}
            description={`Once the phase starts, you can review and manage ${noun} here`} />
          : <EmptyState illustration="empty-notebook" title="Insights will appear here"
            description="Once the phase starts, insights will help you turn participation into clear results" />}
      </AppFramePanel>
    </Workspace>
  );
}

// Manage for Voting and Proposals: the Panel over the method's List header and rows (Voting row, Proposals row).
// The other methods' Manage tabs are not drawn yet (an Information phase has no Manage).
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

function MethodManage({phase, rail}: {phase: Phase; rail: ReactNode}) {
  if (phase.method !== 'Voting' && phase.method !== 'Proposals') {
    return (
      <Workspace rail={rail}>
        <AppFramePanel elementType="section" aria-label="Manage" padding="16" className="bo-fill bo-phase-empty">
          <EmptyState icon={<Inbox aria-hidden size={24} />} title={`${phase.method}: Manage`}
            description="This method's Manage tab: not in Figma yet." />
        </AppFramePanel>
      </Workspace>
    );
  }
  const voting = phase.method === 'Voting';
  const top = Math.max(...VOTE_OPTIONS.map(o => o.votes));
  // List header's "Manage table" story: the header is a row of column heads, so the list is a table; each row (Voting
  // row, Proposals row) sits in a row and a cell.
  return (
    <Workspace rail={rail} main="plain">
      <Panel title={phase.title} className="bo-fill" isFlush count={voting ? VOTE_OPTIONS.length : PROPOSALS.length}
        description={voting ? 'The options residents vote on, most votes first. Votes counted on paper are added as offline votes.'
          : 'Every proposal, most supported first. 300 votes bring an official response.'}>
        <div role="table" aria-label={voting ? 'Options' : 'Proposals'}>
          <div role="rowgroup"><ListHeader columns={voting ? VOTING_COLUMNS : PROPOSAL_COLUMNS} /></div>
          <div role="rowgroup">
            {voting ? VOTE_OPTIONS.map(o => (
              <div role="row" key={o.title}><div role="cell">
                <VotingRow title={o.title} voteCount={o.votes} fillPercent={Math.round(o.votes / top * 100)} newVoteCount={o.newVotes}
                  onlineCount={o.votes - o.offline} offlineCount={o.offline} commentCount={o.comments} newCommentCount={o.newComments} />
              </div></div>
            )) : PROPOSALS.map(o => (
              <div role="row" key={o.title}><div role="cell">
                <ProposalsRow title={o.title} voteCount={o.votes} voteThreshold={300} statusLabel={o.status} commentCount={o.comments}
                  isClosed={phase.status === 'Done'} daysLeft={phase.status === 'Done' ? undefined : 12} />
              </div></div>
            ))}
          </div>
        </div>
      </Panel>
    </Workspace>
  );
}

// ── Insights, one week in: the prototype's phase dashboard on Dashboard cards and Stat tiles; Recommended actions
// beside it as the Manage tab's cards. A vote shows its results; ideas and proposals the ideation dashboard; any
// other method its visitors.
const statusColor: Record<IdeaStatus, ChartColor> = {
  Proposed: 'blue-2', Viewed: 'blue-3', 'Under consideration': 'blue-1', Accepted: 'agree', Rejected: 'disagree', Implemented: 'green'
};

function Insights({project, phase, rail}: {project: Project; phase: Phase; rail: ReactNode}) {
  const navigate = useNavigate();
  const number = useNumberFormatter();
  const percent = useNumberFormatter({style: 'percent', maximumFractionDigits: 1});
  const weekly = `Weekly, since ${INSIGHT_WEEKS[0]}`;
  const [range, setRange] = useState<'daily' | 'weekly'>('daily');
  let body: ReactNode;
  if (phase.method === 'Voting') {
    const votes = VOTES_BY_DAY;
    const byWeek = votes.filter((_, k) => k % 7 === 6 || k === votes.length - 1);
    // One tile kind per row (the prototype's four equal tiles): each Stat tile with its note; the votes' trend is the
    // chart under them.
    body = <>
      <TileGrid minTileWidth={160} density="compact">
        <StatTile layout="with-note" label="Voters" value={number.format(517)} note="updating live" />
        <StatTile layout="with-note" label="Votes" value={number.format(votes[votes.length - 1])} note="updating live" />
        <StatTile layout="with-note" label="Avg per voter" value={number.format(2.4)} note="multiple picks" />
        <StatTile layout="with-note" label="Participation" value={percent.format(0.18)} note="of visitors" />
      </TileGrid>
      <DashboardCard kind="votes-over-time" title="Participation over time" subtitle="Votes cast · cumulative" actions={(
        <SegmentedControl size={30} aria-label="Range" disallowEmptySelection selectedKeys={[range]}
          onSelectionChange={k => { const next = [...k][0]; if (next) setRange(next as 'daily' | 'weekly'); }}>
          <SegmentedControlItem id="daily">Daily</SegmentedControlItem>
          <SegmentedControlItem id="weekly">Weekly</SegmentedControlItem>
        </SegmentedControl>
      )}>
        <Sparkline label="Votes cast" values={range === 'daily' ? votes : byWeek} />
      </DashboardCard>
      <DashboardCard kind="live-ranking" title="Live ranking" subtitle={`By votes · ${phase.status === 'Done' ? 'final' : 'updating live'}`}>
        <DashboardRanking items={VOTE_OPTIONS.map(o => ({title: o.title, count: o.votes}))} />
      </DashboardCard>
      <SectionLabel>Who is voting</SectionLabel>
      <Grid columns={2} gap="16">
        <DashboardCard kind="demographic-age"><DashboardDemographic label="Age group" items={[...VOTER_AGES]} /></DashboardCard>
        <DashboardCard kind="demographic-commute"><DashboardDemographic label="Primary commute" items={[...VOTER_COMMUTES]} /></DashboardCard>
      </Grid>
      <Banner tone="ai" linkLabel="Open AI analysis" onLinkPress={() => navigate(phaseUrl(project, phase, 'manage'))}>
        Explore AI-powered summaries and view individual votes.
      </Banner>
    </>;
  } else if (phase.method === 'Ideation' || phase.method === 'Proposals') {
    const noun = NOUN[phase.method];
    const total = IDEAS.length;
    const liked = [...IDEAS].sort((a, b) => b.likes - a.likes).slice(0, 3);
    // Six equal Stat tiles (the prototype's ideation dashboard); the weekly trend is the chart under them.
    body = <>
      <TileGrid minTileWidth={160} density="compact">
        <StatTile label="Visitors" value={number.format(412)} />
        <StatTile label="Phase participants" value={number.format(124)} />
        <StatTile label={capital(noun)} value={number.format(total)} />
        <StatTile label="Comments" value={number.format(IDEAS.reduce((k, i) => k + i.comments, 0))} />
        <StatTile label="Reactions" value={number.format(IDEAS.reduce((k, i) => k + i.likes + i.dislikes, 0))} />
        <StatTile label="Participation rate" value={percent.format(0.301)} />
      </TileGrid>
      <DashboardCard kind="participation-over-time" title="Participation over time" subtitle={weekly}>
        <LineChart showLegend xAxis={INSIGHT_WEEKS} series={[
          {label: 'Participants', values: PARTICIPATION_WEEKS.participants}, {label: 'Visitors', values: PARTICIPATION_WEEKS.visitors}
        ]} />
      </DashboardCard>
      <Grid columns="1.4fr 1fr" gap="16">
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
      </Grid>
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
      <TileGrid minTileWidth={160} layout="gallery" density="compact"><StatTile label="Visitors" value={phase.count?.split(' ')[0] ?? '0'} /></TileGrid>
      <DashboardCard kind="visitors-over-time" title="Visitors over time">
        <LineChart xAxis={INSIGHT_WEEKS} series={[{label: 'Visitors', values: PARTICIPATION_WEEKS.visitors}]} />
      </DashboardCard>
    </>;
  }
  // The work column: Recommended actions as Card's link rows, each action's own icon at the end ("Setup row · link").
  const column = (
    <Panel variant="plain" title="Recommended actions">
      <Stack elementType="ul" gap="8" aria-label="Recommended actions">
        <li><Card title="Add a report" control="link" href="#/reporting" linkIcon={<FileChartColumn aria-hidden size={16} />} /></li>
        <li><Card title="Share results with participants" control="link" href="#/messaging" linkIcon={<Link2 aria-hidden size={16} />} /></li>
        <li><Card title="Get an AI Sensemaking summary" control="link" linkIcon={<Sparkles aria-hidden size={16} />}
          onOpen={() => toast('AI summary requested', 'It appears under "What are people saying?" in a few minutes.')} /></li>
        <li><Card title="Download insights" control="link" linkIcon={<Download aria-hidden size={16} />}
          onOpen={() => toast('Insights downloaded', 'This dashboard, as a PDF.')} /></li>
      </Stack>
    </Panel>
  );
  return (
    <Workspace rail={rail} column={column} main="plain">
      <Stack elementType="section" aria-label="Insights" gap="16" className="bo-phase-insights">{body}</Stack>
    </Workspace>
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
            <Stack gap="8">
              <Text elementType="h3" kind="body" isStrong color="primary">{t}</Text>
              <Text elementType="p" kind="small" color="meta">{SETTINGS_ABOUT[t]}</Text>
              {t === 'General' && <>
                <MultilingualTextField label="Title" isRequired locales={LANGUAGES} defaultValue={{[LANGUAGES[0]]: project.title}} />
                <TextField label="Project URL" prefix="internal.govocal.com/en/projects/" defaultValue={project.id} />
              </>}
              {t === 'Events' && <>
                <MultilingualTextField label="Event title" placeholder="e.g. Walk along the corridor" locales={LANGUAGES} />
                <DateRangeField label="Event dates" showTime />
              </>}
              {t === 'Input tags' && (
                <TagGroup label="Tags" items={IDEA_TAGS.map(id => ({id}))}>{item => <TagItem id={item.id}>{item.id}</TagItem>}</TagGroup>
              )}
              <Text elementType="p" kind="small" color="meta">The rest of this tab: not in Figma yet.</Text>
            </Stack>
          </GroupedTabPanel>
        ))}
      </GroupedTabs>
    </Modal>
  );
}

// The method picker, after the prototype's "New participation method": side tabs of the three kinds, each a grid of
// Method cards (a method can sit in two kinds); what each does, from the platform's Method card stories, the project
// templates and the phone's lines; a picture where the system has the method's illustration.
const METHOD_GROUPS: {title: string; methods: Method[]}[] = [
  {title: 'Gather input', methods: ['Ideation', 'Survey', 'Proposals', 'Document annotation']},
  {title: 'Shape decisions', methods: ['Voting', 'Document annotation', 'Proposals', 'Common ground']},
  {title: 'Inform and recruit', methods: ['Information', 'Volunteering']}
];
const METHOD_CARD: Record<Method, {title: string; description: string; picture?: IllustrationName; features: {label: string; isHighlighted?: boolean}[]}> = {
  Ideation: {title: 'Ideation and geo mapping', description: 'Invite participants to share input on any topic, discuss it in public and place it on a map.',
    picture: 'ideation-map', features: [{label: 'Map pins'}, {label: 'Reactions and comments'}, {label: 'Grouped into themes'}]},
  Survey: {title: 'Survey', description: "Understand your users' needs and thinking via a wide range of private question types.",
    picture: 'survey-pages', features: [{label: 'Surveys can run in parallel with other methods', isHighlighted: true}, {label: 'Drop a pin'},
      {label: 'Rating and sentiment scales'}]},
  Poll: {title: 'Poll', description: 'Take the pulse of public opinion on one topic.', features: []},
  'Document annotation': {title: 'Document annotation', description: 'Participants comment on a draft document, passage by passage.',
    picture: 'document-annotation', features: [{label: 'Inline comments'}]},
  Voting: {title: 'Voting', description: 'Let residents prioritise the options, or share part of the budget across competing proposals.', features: []},
  Proposals: {title: 'Proposals and petitions', description: 'Participants put forward proposals; each one needs enough votes before its deadline.',
    picture: 'proposal-threshold', features: [{label: 'Vote threshold'}, {label: 'Deadline'}]},
  'Common ground': {title: 'Common ground', description: 'Agree, disagree or pass: see where the neighbourhood stands.', features: []},
  Information: {title: 'Sharing', description: 'Shares news with residents; it collects no inputs.', features: []},
  Volunteering: {title: 'Recruiting', description: 'Residents sign up for the causes you add, and you download who volunteered.', features: []}
};

/** Add a phase: the method picker (Modal with side tabs, a grid of Method cards). Picking a method adds the phase at
 * once and opens its Build, where its dates and title wait, marked required. */
export function AddPhase({project, isOpen, onOpenChange}: {project: Project; isOpen: boolean; onOpenChange: (open: boolean) => void}) {
  const navigate = useNavigate();
  const [, add] = useAddedPhases(project.id);
  const [group, setGroup] = useState(METHOD_GROUPS[0].title);
  const pick = (method: Method) => {
    const phase: NewPhase = {id: `new-${Date.now()}`, title: '', method, dates: ''};
    add(phase);
    onOpenChange(false);
    navigate(`/projects/${project.id}/phases/${phase.id}/build`);
  };
  return (
    <Modal title="New participation method" width="wide" height="fixed" isFlush isOpen={isOpen} onOpenChange={onOpenChange}>
      <GroupedTabs selectedKey={group} onSelectionChange={k => setGroup(String(k))} className="bo-phase-settings">
        <GroupedTabList aria-label="Kinds of method" className="bo-phase-settings-list">
          {METHOD_GROUPS.map(g => <GroupedTab key={g.title} id={g.title}>{g.title}</GroupedTab>)}
        </GroupedTabList>
        {METHOD_GROUPS.map(g => (
          <GroupedTabPanel key={g.title} id={g.title} className="bo-phase-settings-panel">
            <Grid columns={2} gap="16">
              {g.methods.map(m => {
                const c = METHOD_CARD[m];
                return (
                  <MethodCard key={m} title={c.title} description={c.description} onPress={() => pick(m)}
                    media={c.picture && <Illustration name={c.picture} size={320} height={168} motion="hover" />}
                    features={c.features} />
                );
              })}
            </Grid>
          </GroupedTabPanel>
        ))}
      </GroupedTabs>
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
      <Stack gap="16">
        <DropZone density="compact" acceptedFileTypes={['*']} allowsMultiple onSelect={list => list && add([...list])}
          onDrop={async e => add(await Promise.all(e.items.flatMap(i => (i.kind === 'file' ? [i.getFile()] : []))))}>
          Drop a file here or browse
        </DropZone>
        <FileList aria-label="Attachments" items={files} onDelete={item => onChange(current => current.filter(f => f.id !== item.id))} />
      </Stack>
    </Modal>
  );
}

/** What opens behind a Build card that has no screen of its own yet. */
export function CardStub({title, onClose}: {title: string | null; onClose: () => void}) {
  return (
    <Modal title={title ?? ''} isOpen={title !== null} onOpenChange={o => { if (!o) onClose(); }}
      footer={<Button size={32} slot="close">Done</Button>}>
      <Text elementType="p" kind="small" color="meta">{title}: not in Figma yet.</Text>
    </Modal>
  );
}
