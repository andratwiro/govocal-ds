import {useState, type Dispatch, type ReactNode, type SetStateAction} from 'react';
import {Navigate, useNavigate, useParams} from 'react-router';
import {CalendarDays, CircleCheck, Copy, Download, ExternalLink, FileText, Inbox, Lightbulb, Lock, Mail, MessageSquareText, Paperclip,
  MapPin, Plus, Settings, SquarePen, Tag, Trash2, TriangleAlert, Upload, User, Users} from 'lucide-react';
import {Button} from '../../../src/components/Button';
import {Form} from '../../../src/components/Form';
import {Select, SelectItem} from '../../../src/components/Select';
import {Tab, TabList, TabPanel, TabPanels, Tabs} from '../../../src/components/Tabs';
import {Tag as TagItem, TagGroup} from '../../../src/components/TagGroup';
import {Menu, MenuItem, MenuSection, MenuTrigger, Separator, SubmenuTrigger} from '../../../src/components/Menu';
import {Dialog} from '../../../src/components/Dialog';
import {SearchField} from '../../../src/components/SearchField';
import {TextField} from '../../../src/components/TextField';
import {ToastRegion, queue} from '../../../src/components/Toast';
import {DataTable, DataTableHeader, DataTableColumn, DataTableBody, DataTableRow, DataTableCell, DataTableEmpty,
  DataTableText, DataTableAddColumn, DataTableAssignee, DataTableTags, DataTableThumbnail} from '../../../src/components/gv/DataTable';
import {OptionList} from '../../../src/components/gv/OptionList';
import {Pagination} from '../../../src/components/gv/Pagination';
import {Panel} from '../../../src/components/gv/Panel';
import {TableToolbar, TableToolbarHeading} from '../../../src/components/gv/TableToolbar';
import {PICTURES} from '../../../src/components/gv/story-images';
import {Avatar} from '../../../src/components/gv/Avatar';
import {Banner} from '../../../src/components/gv/Banner';
import {Card} from '../../../src/components/gv/Card';
import {DateRangeField} from '../../../src/components/gv/DateRangeField';
import {Divider} from '../../../src/components/gv/Divider';
import {DropZone} from '../../../src/components/gv/DropZone';
import {FileList, type FileListItemData} from '../../../src/components/gv/FileList';
import {ProjectHeader} from '../../../src/patterns/ProjectHeader';
import {IconButton} from '../../../src/components/gv/IconButton';
import {Modal} from '../../../src/components/gv/Modal';
import {PropertyList, PropertyListItem} from '../../../src/components/gv/PropertyList';
import {ReactionCounts} from '../../../src/components/gv/ReactionCounts';
import {SidePanel, SidePanelActions, SidePanelDecision, SidePanelSection} from '../../../src/components/gv/SidePanel';
import {RailHeader} from '../../../src/patterns/RailHeader';
import {RailSectionLabel} from '../../../src/patterns/RailSectionLabel';
import {SegmentedControl, SegmentedControlItem} from '../../../src/components/gv/SegmentedControl';
import {SetupStep} from '../../../src/patterns/SetupStep';
import {StatRow} from '../../../src/components/gv/StatRow';
import {TitleField} from '../../../src/components/gv/TitleField';
import {FilterChips} from '../../../src/patterns/FilterChips';
import {FilterMenu, type FilterFacet, type FilterValue} from '../../../src/patterns/FilterMenu';
import {CommentThread, type ThreadComment, type ThreadTab, type ThreadTarget} from '../../../src/patterns/CommentThread';
import {BulkOfficialUpdate, OfficialUpdate, type PostedUpdate} from '../../../src/patterns/OfficialUpdate';
import {PhaseTimeline} from '../../../src/patterns/PhaseTimeline';
import {SelectionBar, type SelectionAction} from '../../../src/patterns/SelectionBar';
import {Gap} from '../Gap';
import {ME, METHODS, PROJECTS, type Method, type Phase, type Project} from '../data';
import {IDEAS, IDEA_ASSIGNEES, IDEA_REPLIES, IDEA_SOURCES, IDEA_STATUSES, IDEA_TAGS, AREAS, TOPICS, PHASE_FILES, SCREENING_PHASES, TEAM, addedTimeline,
  ideaComments, ideaInternal, ideaUpdates, timeline, type Idea, type IdeaStatus, type NewPhase} from '../data-project';


// The phase screen, from the Figma frames "Project · Build" and "Ideation · Manage (data)" (Screens WIP):
// a header bar (Project header · mode switch · actions) over the Participation rail and the tab's panels.
const TABS = ['build', 'manage', 'insights'] as const;
type Tab = typeof TABS[number];
const label = (t: string) => t[0].toUpperCase() + t.slice(1);
const phaseUrl = (project: Project, phase: Phase, tab: Tab) => `/projects/${project.id}/phases/${phase.id}/${tab}`;

export function ProjectPhase() {
  const {projectId, phaseId, tab} = useParams();
  const navigate = useNavigate();
  const [railOpen, setRailOpen] = useState(true);
  const [settings, setSettings] = useState<SettingsTab | null>(null);
  const [adding, setAdding] = useState(false);
  const [added, setAdded] = useState<NewPhase[]>([]);
  const project = PROJECTS.find(p => p.id === projectId);
  if (!project) return <Navigate to="/projects" replace />;
  const phase = project.phases.find(p => p.id === phaseId) ?? project.phases[0];
  if (phase.id !== phaseId || !TABS.includes(tab as Tab)) return <Navigate to={phaseUrl(project, phase, 'build')} replace />;
  const view = tab as Tab;

  return (
    <div className="bo-phase" data-rail={railOpen ? 'open' : 'closed'}>
      <h1 className="bo-visually-hidden">{project.title}</h1>
      <div className="bo-phase-bar">
        <ProjectHeader level={phase.status === 'Draft' ? 'phase-draft' : 'phase-live'} projectName={project.title} phaseName={phase.title}
          projectHref={`#/projects/${project.id}`} onBack={() => navigate(`/projects/${project.id}`)} onTogglePanel={() => setRailOpen(o => !o)} />
        <SegmentedControl aria-label="Phase view" disallowEmptySelection selectedKeys={[view]}
          onSelectionChange={keys => { const next = [...keys][0]; if (next) navigate(phaseUrl(project, phase, next as Tab)); }}>
          {TABS.map(t => <SegmentedControlItem key={t} id={t}>{label(t)}</SegmentedControlItem>)}
        </SegmentedControl>
        <div className="bo-phase-bar-actions">
          <Avatar initials={ME.slice(-1)} aria-label={`${ME} is here`} />
          <Button variant="secondary" size={32} hasMenu>Share</Button>
          <Button size={32}>Save</Button>
        </div>
      </div>
      <div className="bo-phase-body" data-view={view}>
        {railOpen && <Rail project={project} current={phase} tab={view} added={added} onAdd={() => setAdding(true)} />}
        {view === 'build' && <Build key={`${project.id}/${phase.id}`} phase={phase} onSettings={setSettings} />}
        {view === 'manage' && phase.method === 'Ideation' && <Manage key={`${project.id}/${phase.id}`} phase={phase} project={project} onAddPhase={() => setAdding(true)} />}
        {(view === 'insights' || (view === 'manage' && phase.method !== 'Ideation')) && (
          <section className="bo-phase-panel bo-phase-grow" aria-label={label(view)}>
            <p className="bo-note">{phase.title} · {phase.method} · {label(view)}. Not in Figma yet.</p>
          </section>
        )}
      </div>
      <ProjectSettings project={project} tab={settings} onTabChange={setSettings} onClose={() => setSettings(null)} />
      <AddPhase isOpen={adding} onOpenChange={setAdding} onAdd={p => setAdded(a => [...a, p])} />
    </div>
  );
}

function Rail({project, current, tab, added, onAdd}: {project: Project; current: Phase; tab: Tab; added: NewPhase[]; onAdd: () => void}) {
  return (
    <aside className="bo-phase-panel bo-phase-rail" aria-label="Participation">
      <RailHeader title="Participation" onAdd={onAdd} addLabel="Add a phase" />
      <nav aria-label="Phases" className="bo-phase-rail-section">
        <RailSectionLabel>Timeline</RailSectionLabel>
        <div className="bo-project-rail-list">
          <PhaseTimeline phases={[...timeline(project, p => `#${phaseUrl(project, p, p.method === 'Ideation' || tab !== 'manage' ? tab : 'build')}`, current.id),
            ...addedTimeline(added)]} />
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
function SetArea() {
  const [mode, setMode] = useState<string | null>(null);
  const [areas, setAreas] = useState<Set<string>>(new Set());
  const names = AREAS.filter(a => areas.has(a));
  const value = mode === 'none' ? 'No specific area' : mode === 'all' ? 'All areas'
    : mode === 'selected' && names.length ? (names.length === 1 ? names[0] : counted(names.length, 'area', 'areas')) : undefined;
  return (
    <SetupStep action="pick" pickerType="menu" title="Set area" value={value} isDone={value != null} picker={
      <Menu aria-label="Area" selectionMode="single" selectedKeys={mode ? [mode] : []}
        onSelectionChange={keys => setMode(keys === 'all' ? null : [...keys].map(String)[0] ?? null)}>
        <MenuItem id="none" icon={pin} description="The project will not show when filtering by area.">No specific area</MenuItem>
        <MenuItem id="all" icon={pin} description="The project will show on every area filter.">All areas</MenuItem>
        <SubmenuTrigger>
          <MenuItem id="selected" icon={pin} description={names.length ? `${counted(names.length, 'area', 'areas')} selected`
            : 'The project will show on selected area filter(s).'}>Selected areas</MenuItem>
          <Menu aria-label="Areas" selectionMode="multiple" selectedKeys={areas}
            onSelectionChange={keys => { setAreas(new Set(keys === 'all' ? AREAS : [...keys].map(String))); setMode('selected'); }}>
            {AREAS.map(a => <MenuItem key={a} id={a}>{a}</MenuItem>)}
          </Menu>
        </SubmenuTrigger>
      </Menu>
    } />
  );
}

/** Set topic tags: the Option list, searchable, with its footer and Done. */
function SetTopicTags() {
  const [tags, setTags] = useState<string[]>([]);
  return (
    <SetupStep action="pick" title="Set topic tags" value={tags.length ? counted(tags.length, 'tag', 'tags') : undefined}
      isDone={tags.length > 0} picker={
        <OptionList aria-label="Topic tags" options={TOPICS.map(t => ({id: t, label: t}))} selected={tags} onChange={setTags}
          placeholder="Search tags..." searchLabel="Search tags"
          selectionLabel={k => (k ? `${counted(k, 'tag', 'tags')} selected` : 'No tags selected')} />
      } />
  );
}

/** One step of the setup checklist, on the phase's Build panel and the project overview alike. */
export function ChecklistStep({step, onOpen}: {step: typeof CHECKLIST[number]; onOpen: (title: string) => void}): ReactNode {
  if (step.title === 'Set area') return <SetArea />;
  if (step.title === 'Set topic tags') return <SetTopicTags />;
  if (step.action === 'expand') return <SetupStep action="expand" title={step.title}><p className="bo-note bo-phase-flush">{step.body}</p></SetupStep>;
  return <SetupStep title={step.title} onPress={() => onOpen(step.title)} />;
}

// Where each checklist card leads: two open a settings tab, the rest a stub until they're drawn.
export const CHECKLIST_TAB: Partial<Record<string, SettingsTab>> = {'Settings': 'General', 'Edit project page': 'Project page'};

function Build({phase, onSettings}: {phase: Phase; onSettings: (tab: SettingsTab) => void}) {
  const [stub, setStub] = useState<string | null>(null);
  const [attaching, setAttaching] = useState(false);
  const [files, setFiles] = useState<FileListItemData[]>(PHASE_FILES);
  const open = (title: string) => { const t = CHECKLIST_TAB[title]; if (t) onSettings(t); else setStub(title); };
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
          <IconButton aria-label="Project settings" onPress={() => onSettings('General')}><Settings aria-hidden size={16} /></IconButton>
        </div>
        <div className="bo-phase-section-header">
          <h3 className="bo-phase-flush">Before you publish</h3>
          <span className="bo-note bo-phase-flush">0 of {CHECKLIST.length} ready</span>
        </div>
        <ul className="bo-phase-stack">
          {CHECKLIST.map(c => (
            <li key={c.title} data-gv="setup-card"><ChecklistStep step={c} onOpen={open} /></li>
          ))}
        </ul>
        <div className="bo-phase-section-header bo-phase-section-gap">
          <h3 className="bo-phase-flush">{phase.method} setup</h3>
        </div>
        <div className="bo-phase-status"><PhaseStatus phase={phase} /></div>
        {phase.method === 'Ideation' ? <IdeationCards phase={phase} onOpen={setStub} onAttach={() => setAttaching(true)} files={files.length} /> : (
          <p className="bo-note">The {phase.method.toLowerCase()} setup cards: not in Figma yet.</p>
        )}
      </aside>
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
  if (phase.status === 'Live') return <Banner compact tone="success" title="Live">{range ? `Ends on ${range[1]}` : phase.dates}</Banner>;
  if (phase.status === 'Done') return <Banner compact tone="neutral" title="Ended">{range ? `Closed on ${range[1]}` : phase.dates}</Banner>;
  return <Banner compact tone="neutral" title="Not started">{range ? `Starts on ${range[0]}` : phase.dates}</Banner>;
}

// The phase's own cards, after the "Ideation · Build" Figma frame (Card types Required, Add, Review, To set).
function IdeationCards({phase, onOpen, onAttach, files}: {phase: Phase; onOpen: (title: string) => void; onAttach: () => void; files: number}) {
  return (
    <ul className="bo-phase-stack">
      <li data-gv="setup-card"><Card title="Dates" isRequired summary={phase.dates} control="expand">
        {/* Date range field: it can't start on the phase's dates yet (it takes date objects the back office can't make). */}
        <DateRangeField isRequired description="Ideas can be posted from the first day to the last." />
      </Card></li>
      <li data-gv="setup-card"><Card title="Title and description" isRequired control="expand" defaultExpanded>
        <div className="bo-phase-stack">
          <TitleField aria-label="Phase title" defaultValue={phase.title} isRequired />
          <TitleField aria-label="Phase description" placeholder="Add a short description" />
        </div>
      </Card></li>
      <li data-gv="setup-card"><Card title="Attachments" summary={files ? `${files} ${files === 1 ? 'file' : 'files'}` : undefined}
        iconActions={[{icon: Paperclip, label: 'Add an attachment', onPress: onAttach}]} /></li>
      <li data-gv="setup-card"><Card title="What should an input be called?" review="to-review" pills={[{label: 'Idea', icon: Lightbulb}]} control="open" onOpen={() => onOpen('What should an input be called?')} /></li>
      <li data-gv="setup-card"><Card title="Idea form" review="to-review" pills={[{label: '6 questions'}]} control="open" onOpen={() => onOpen('Idea form')} /></li>
      <li data-gv="setup-card"><Card title="Collect demographic data" review="to-set" control="open" onOpen={() => onOpen('Collect demographic data')} /></li>
      <li data-gv="setup-card"><Card title="Sorting" review="to-review" pills={[{label: 'Trending'}]} control="open" onOpen={() => onOpen('Sorting')} /></li>
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
    icon: person ? <Avatar size={16} unassigned={v === 'Unassigned'} initials={v.slice(-1)} /> : undefined
  }));
  return [
    {id: 'source', label: 'Source', icon: icon(Inbox), options: options('source', IDEA_SOURCES)},
    {id: 'status', label: 'Status', icon: icon(CircleCheck), options: options('status', IDEA_STATUSES)},
    {id: 'assignee', label: 'Assignee', icon: icon(User), options: options('assignee', IDEA_ASSIGNEES, true)},
    {id: 'tags', label: 'Tags', icon: icon(Tag), options: options('tags', IDEA_TAGS)},
    {id: 'reply', label: 'Reply', icon: icon(MessageSquareText), options: options('reply', IDEA_REPLIES)}
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
  queue.add({title, body, action: 'Undo', onAction: undo}, {timeout: 6000});

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
      <OptionList aria-label="Status" selectionMode="single" searchable={false} selected={sharedStatus}
        options={IDEA_STATUSES.map(st => ({id: st, label: st}))}
        onChange={([st]) => st && edit(i => ({...i, status: st as IdeaStatus}))} />
    )},
    {id: 'assign', label: 'Assign', icon: icon(User), menu: (
      <Menu aria-label="Assign to" onAction={k => edit(i => ({...i, assignee: k as Idea['assignee']}))}>
        {IDEA_ASSIGNEES.map(a => (
          <MenuItem key={a} id={a} icon={<Avatar size={16} unassigned={a === 'Unassigned'} initials={a.slice(-1)} />}>{a}</MenuItem>
        ))}
      </Menu>
    )},
    {id: 'tags', label: 'Tags', icon: icon(Tag), menu: (
      // A dialog popover holds the search (as the Filter menu's long submenus do); its own class keeps the starter
      // Dialog's padding off the Option list.
      <Dialog aria-label="Tags" className="bo-phase-picker">
        <OptionList aria-label="Tags" searchable icon={icon(Tag)} selected={sharedTags} countLabel={ideasWord}
          options={IDEA_TAGS.map(t => ({id: t, label: t, count: pickedIdeas.filter(i => i.tags.includes(t)).length}))}
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
            <li><Card tone="manage" title="Add an idea" iconActions={[{icon: Plus, label: 'Add an idea'}]} /></li>
            <li><Card tone="manage" title="Import paper ideas" summary="Not set" iconActions={[{icon: Upload, label: 'Import paper ideas'}]} /></li>
            <li><Card tone="manage" title="Exports" iconActions={[{icon: Download, label: 'Export ideas'}]} /></li>
          </ul>
        </div>
      </aside>
      {/* The Data table's "In a panel" story: the Panel's toolbar holds the count (or the Selection bar), the collapsible
          search and the Filter menu, then the chips (the quick view first); the table; the Pagination in its foot. */}
      <Panel title={phase.title} className="bo-phase-grow" flush
        description="Everything posted in this phase. Select ideas for batch actions; click one to open it."
        toolbar={(
          <>
            <TableToolbar start={(
              <SelectionBar count={n} actions={actions} onClear={() => setSelected(new Set())}
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
        <DataTable aria-label="Ideas" revealChecks selectionMode="multiple"
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
                  <DataTableCell>{i.tags.length ? <DataTableTags tags={i.tags} /> : null}</DataTableCell>
                  <DataTableCell muted><span className="bo-phase-manage-nowrap">{i.screening ? 'Waiting for approval' : i.status}</span></DataTableCell>
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
              <SidePanelActions actions={[
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
      <ToastRegion />
    </>
  );
}

// ── Project settings, Add a phase, and the stub behind a Build card ─────────────────────────────────────────────
// The settings cog opens the project's settings in a wide modal with side tabs, as the prototype's project settings.
export const SETTINGS_TABS = ['General', 'Project page', 'Input tags', 'Access rights', 'Audience', 'Messaging', 'Files', 'Events'] as const;
export type SettingsTab = typeof SETTINGS_TABS[number];
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
    // Modal's "With side tabs": a fixed height, an unpadded body, the vertical Tabs as a side list beside the panel.
    <Modal title="Project settings" size="wide" height="fixed" padBody={false} isOpen={tab !== null}
      onOpenChange={o => { if (!o) onClose(); }} footer={<Button size={32} slot="close">Save</Button>}>
      <Tabs orientation="vertical" selectedKey={tab ?? 'General'} onSelectionChange={k => onTabChange(k as SettingsTab)}
        className="bo-phase-settings">
        <TabList aria-label="Project settings" className="bo-phase-settings-list">
          {SETTINGS_TABS.map(t => {
            const Icon = SETTINGS_ICON[t];
            return <Tab key={t} id={t}><Icon aria-hidden size={16} strokeWidth={1.75} />{t}</Tab>;
          })}
        </TabList>
        <TabPanels className="bo-phase-settings-panel">
          {SETTINGS_TABS.map(t => (
            <TabPanel key={t} id={t}>
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
            </TabPanel>
          ))}
        </TabPanels>
      </Tabs>
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
        <DropZone size="compact" acceptedFileTypes={['*']} allowsMultiple onSelect={list => list && add([...list])}
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
