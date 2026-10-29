import {useState} from 'react';
import {Navigate, useNavigate, useParams} from 'react-router';
import {CircleCheck, Copy, Download, Inbox, Lightbulb, MessageSquareText, Paperclip, Plus, Search, Settings, Tag,
  TriangleAlert, Upload, User} from 'lucide-react';
import {Button} from '../../../src/components/Button';
import {Form} from '../../../src/components/Form';
import {Select, SelectItem} from '../../../src/components/Select';
import {Tab, TabList, TabPanel, TabPanels, Tabs} from '../../../src/components/Tabs';
import {Tag as TagItem, TagGroup} from '../../../src/components/TagGroup';
import {Menu, MenuItem} from '../../../src/components/Menu';
import {SearchField} from '../../../src/components/SearchField';
import {TextArea, TextField} from '../../../src/components/TextField';
import {DataTable, DataTableHeader, DataTableColumn, DataTableBody, DataTableRow, DataTableCell, DataTableEmpty,
  DataTableText, DataTableAddColumn} from '../../../src/components/gv/DataTable';
import {Avatar} from '../../../src/components/gv/Avatar';
import {Card} from '../../../src/components/gv/Card';
import {Divider} from '../../../src/components/gv/Divider';
import {ProjectHeader} from '../../../src/patterns/ProjectHeader';
import {IconButton} from '../../../src/components/gv/IconButton';
import {Modal} from '../../../src/components/gv/Modal';
import {RailHeader} from '../../../src/patterns/RailHeader';
import {RailSectionLabel} from '../../../src/patterns/RailSectionLabel';
import {SegmentedControl, SegmentedControlItem} from '../../../src/components/gv/SegmentedControl';
import {SetupStep} from '../../../src/patterns/SetupStep';
import {StatRow} from '../../../src/components/gv/StatRow';
import {StatusBadge} from '../../../src/components/gv/StatusBadge';
import {TitleField} from '../../../src/components/gv/TitleField';
import {FilterChips} from '../../../src/patterns/FilterChips';
import {FilterMenu, type FilterFacet, type FilterValue} from '../../../src/patterns/FilterMenu';
import {PhaseTimeline} from '../../../src/patterns/PhaseTimeline';
import {SelectionBar, type SelectionAction} from '../../../src/patterns/SelectionBar';
import {Gap} from '../Gap';
import {ME, METHODS, PROJECTS, type Method, type Phase, type Project} from '../data';
import {IDEAS, IDEA_ASSIGNEES, IDEA_REPLIES, IDEA_SOURCES, IDEA_STATUSES, IDEA_TAGS, addedTimeline, timeline, type Idea, type IdeaStatus,
  type NewPhase} from '../data-project';

type Selection = 'all' | Set<string | number>;

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
        {view === 'manage' && phase.method === 'Ideation' && <Manage key={`${project.id}/${phase.id}`} phase={phase} project={project} />}
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
export const CHECKLIST: {title: string; action: 'open' | 'expand'; body?: string}[] = [
  {title: 'Settings', action: 'open'},
  {title: 'Edit project page', action: 'open'},
  {title: 'Set project card', action: 'expand', body: 'The card residents see on the homepage and in project lists: an image, a title and a one-line summary.'},
  {title: 'Set area', action: 'expand', body: 'The neighbourhoods this project is about, so residents who follow them hear of it.'},
  {title: 'Set topic tags', action: 'expand', body: 'Topics help residents find the project from the homepage filters.'},
  {title: 'Plan participation', action: 'open'}
];

// Where each checklist card leads: two open a settings tab, the rest a stub until they're drawn.
export const CHECKLIST_TAB: Partial<Record<string, SettingsTab>> = {'Settings': 'General', 'Edit project page': 'Project page'};

function Build({phase, onSettings}: {phase: Phase; onSettings: (tab: SettingsTab) => void}) {
  const [stub, setStub] = useState<string | null>(null);
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
            <li key={c.title} data-gv="setup-card">
              {c.action === 'open'
                ? <SetupStep title={c.title} onPress={() => open(c.title)} />
                : <SetupStep action="expand" title={c.title}><p className="bo-note bo-phase-flush">{c.body}</p></SetupStep>}
            </li>
          ))}
        </ul>
        <div className="bo-phase-section-header bo-phase-section-gap">
          <h3 className="bo-phase-flush">{phase.method} setup</h3>
          <StatusBadge state={phase.status === 'Draft' ? 'draft' : 'live'}>{phase.status}</StatusBadge>
        </div>
        {phase.method === 'Ideation' ? <IdeationCards phase={phase} onOpen={setStub} /> : (
          <p className="bo-note">The {phase.method.toLowerCase()} setup cards: not in Figma yet.</p>
        )}
      </aside>
      <CardStub title={stub} onClose={() => setStub(null)} />
    </>
  );
}

// The phase's own cards, after the "Ideation · Build" Figma frame (Card types Required, Add, Review, To set).
function IdeationCards({phase, onOpen}: {phase: Phase; onOpen: (title: string) => void}) {
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
const COLUMNS = [['assignee', 'Assignee'], ['tags', 'Tags'], ['likes', 'Likes'], ['comments', 'Comments']] as const;
type Sort = {column: string | number; direction: 'ascending' | 'descending'};

function Manage({project, phase}: {project: Project; phase: Phase}) {
  // A draft phase has collected nothing yet; a published one shows its first week of ideas.
  const [ideas, setIdeas] = useState<Idea[]>(phase.status === 'Draft' ? [] : IDEAS);
  const [filters, setFiltersRaw] = useState<FilterValue>({});
  const [walk, setWalk] = useState<Walk | null>(null);
  const [query, setQuery] = useState('');
  const [searching, setSearching] = useState(false);
  const [selected, setSelected] = useState<Selection>(new Set());
  const [sort, setSort] = useState<Sort | undefined>();
  const [extra, setExtra] = useState<Set<string | number>>(new Set());
  const [updating, setUpdating] = useState(false);
  const [note, setNote] = useState('');
  const setFilters = (v: FilterValue) => { setFiltersRaw(v); setSelected(new Set()); };

  const facets = facetsFor(ideas);
  const q = query.trim().toLowerCase();
  const shown = ideas.filter(i => matches(i, filters) && (!walk?.test || walk.test(i)) && (!q || i.text.toLowerCase().includes(q)));
  if (sort) {
    const k = sort.column as 'text' | 'status' | 'likes' | 'comments';
    const sign = sort.direction === 'descending' ? -1 : 1;
    shown.sort((a, b) => sign * (typeof a[k] === 'number' ? (a[k] as number) - (b[k] as number) : String(a[k]).localeCompare(String(b[k]))));
  }
  const picked = selected === 'all' ? shown.map(i => i.id) : shown.filter(i => selected.has(i.id)).map(i => i.id);
  const edit = (change: (i: Idea) => Idea) => setIdeas(all => all.map(i => (picked.includes(i.id) ? change(i) : i)));
  const pickedIdeas = ideas.filter(i => picked.includes(i.id));
  const sharedTags = IDEA_TAGS.filter(t => pickedIdeas.length > 0 && pickedIdeas.every(i => i.tags.includes(t)));
  const n = picked.length;

  const actions: SelectionAction[] = [
    {id: 'status', label: 'Status', icon: icon(CircleCheck), menu: (
      <Menu aria-label="Set status" onAction={k => edit(i => ({...i, status: k as IdeaStatus}))}>
        {IDEA_STATUSES.map(s => <MenuItem key={s} id={s}>{s}</MenuItem>)}
      </Menu>
    )},
    {id: 'assign', label: 'Assign', icon: icon(User), menu: (
      <Menu aria-label="Assign to" onAction={k => edit(i => ({...i, assignee: k as Idea['assignee']}))}>
        {IDEA_ASSIGNEES.map(a => <MenuItem key={a} id={a}>{a}</MenuItem>)}
      </Menu>
    )},
    {id: 'tags', label: 'Tags', icon: icon(Tag), menu: (
      <Menu aria-label="Tags" selectionMode="multiple" selectedKeys={sharedTags}
        onSelectionChange={keys => {
          const on = new Set(keys === 'all' ? IDEA_TAGS : [...keys].map(String));
          edit(i => ({...i, tags: [...IDEA_TAGS].filter(t => on.has(t) || (i.tags.includes(t) && !sharedTags.includes(t)))}));
        }}>
        {IDEA_TAGS.map(t => <MenuItem key={t} id={t}>{t}</MenuItem>)}
      </Menu>
    )},
    {id: 'copy', label: 'Copy to phase', icon: icon(Copy), menu: (
      <Menu aria-label="Copy to phase" onAction={k => setNote(`${ideasWord(n)} copied to ${project.phases.find(p => p.id === k)?.title}.`)}>
        {project.phases.filter(p => p.id !== phase.id).map(p => <MenuItem key={p.id} id={p.id}>{p.title}</MenuItem>)}
      </Menu>
    )},
    {id: 'update', label: 'Official update', icon: icon(MessageSquareText)}
  ];

  return (
    <>
      <aside className="bo-phase-side bo-phase-stack" aria-label="Ideas overview">
        <div className="bo-phase-panel bo-phase-panel-tight">
          {WALKS.map(w => {
            const count = ideas.filter(i => (w.filter ? matches(i, w.filter) : w.test!(i))).length;
            const isOn = w.filter ? sameFilters(filters, w.filter) : walk?.key === w.key;
            return <StatRow key={w.key} label={w.label} value={String(count)} isNew={w.key === 'new' && count > 0}
              isStatic={count === 0} isSelected={isOn}
              onPress={() => {
                if (w.filter) setFilters(isOn ? {} : w.filter);
                else setWalk(isOn ? null : w);
                setSelected(new Set());
              }} />;
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
      <section className="bo-phase-panel bo-phase-grow bo-phase-manage" aria-label="Ideas">
        <div className="bo-phase-toolbar bo-phase-manage-toolbar">
          <div className="bo-phase-manage-lead">
            <SelectionBar count={n} actions={actions} onClear={() => setSelected(new Set())}
              onAction={id => id === 'update' && setUpdating(true)}>
              <h2 className="bo-section-title bo-phase-flush">{ideasWord(shown.length)}{walk && ` · ${walk.label}`}</h2>
              {walk && <Button variant="quiet" size={32} onPress={() => setWalk(null)}>Show all</Button>}
            </SelectionBar>
          </div>
          {searching && <SearchField aria-label="Search ideas" placeholder="Search ideas" value={query} onChange={setQuery} autoFocus
            onKeyDown={e => { if (e.key === 'Escape' && !query) setSearching(false); }} />}
          <IconButton variant="bordered" tone="strong" aria-label="Search ideas" aria-pressed={searching}
            onPress={() => { setSearching(s => !s); setQuery(''); }}>
            <Search aria-hidden size={16} />
          </IconButton>
          <FilterMenu aria-label="Filter ideas" facets={facets} value={filters} onChange={setFilters} countLabel={ideasWord} />
        </div>
        <FilterChips aria-label="Active filters" facets={facets} value={filters} onChange={setFilters} />
        <p role="status" className="bo-note bo-phase-flush">{note}</p>
        <DataTable aria-label="Ideas" density="compact" revealChecks selectionMode="multiple"
          selectedKeys={selected} onSelectionChange={setSelected} sortDescriptor={sort} onSortChange={d => setSort(d as Sort)}
          addColumn={(
            <DataTableAddColumn selectedKeys={extra} onSelectionChange={setExtra}>
              {COLUMNS.map(([id, label]) => <MenuItem key={id} id={id}>{label}</MenuItem>)}
            </DataTableAddColumn>
          )}>
          <DataTableHeader>
            <DataTableColumn id="text" isRowHeader allowsSorting>Idea</DataTableColumn>
            <DataTableColumn id="status" allowsSorting>Status</DataTableColumn>
            {extra.has('assignee') && <DataTableColumn id="assignee">Assignee</DataTableColumn>}
            {extra.has('tags') && <DataTableColumn id="tags">Tags</DataTableColumn>}
            {extra.has('likes') && <DataTableColumn id="likes" align="number" allowsSorting>Likes</DataTableColumn>}
            {extra.has('comments') && <DataTableColumn id="comments" align="number" allowsSorting>Comments</DataTableColumn>}
          </DataTableHeader>
          <DataTableBody renderEmptyState={() => (
            <DataTableEmpty>{ideas.length ? 'No ideas match these filters.' : 'No ideas here yet.'}</DataTableEmpty>
          )}>
            {shown.map(i => (
              <DataTableRow key={i.id} id={i.id} textValue={i.text}>
                <DataTableCell>
                  <DataTableText marks={i.warning && <TriangleAlert size={16} aria-label={`Content warning: ${i.warning}`} role="img" />}>
                    {i.text}
                  </DataTableText>
                </DataTableCell>
                <DataTableCell muted><span className="bo-phase-manage-nowrap">{i.status}</span></DataTableCell>
                {extra.has('assignee') && <DataTableCell muted><span className="bo-phase-manage-nowrap">{i.assignee}</span></DataTableCell>}
                {extra.has('tags') && <DataTableCell muted>{i.tags.join(', ')}</DataTableCell>}
                {extra.has('likes') && <DataTableCell align="number">{i.likes}</DataTableCell>}
                {extra.has('comments') && <DataTableCell align="number">{i.comments}</DataTableCell>}
              </DataTableRow>
            ))}
          </DataTableBody>
        </DataTable>
      </section>
      <Modal title="Official update" isOpen={updating} onOpenChange={setUpdating}
        footer={<>
          <Button variant="secondary" size={32} slot="close">Cancel</Button>
          <Button size={32} onPress={() => {
            edit(i => ({...i, replied: true}));
            setNote(`Official update posted on ${ideasWord(n)}. Each author is notified.`);
            setUpdating(false);
          }}>Publish</Button>
        </>}>
        <TextArea label="Official update" description={`Posted on ${ideasWord(n)}. Each author is notified.`}
          placeholder="Add an official update" />
      </Modal>
    </>
  );
}

// ── Project settings, Add a phase, and the stub behind a Build card ─────────────────────────────────────────────
// The settings cog opens the project's settings in a wide modal with side tabs, as the prototype's project settings.
export const SETTINGS_TABS = ['General', 'Project page', 'Input tags', 'Access rights', 'Audience', 'Messaging', 'Files', 'Events'] as const;
export type SettingsTab = typeof SETTINGS_TABS[number];
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
    <Modal title="Project settings" size="wide" isOpen={tab !== null} onOpenChange={o => { if (!o) onClose(); }}>
      <Tabs orientation="vertical" selectedKey={tab ?? 'General'} onSelectionChange={k => onTabChange(k as SettingsTab)}
        aria-label="Project settings">
        <TabList aria-label="Project settings">
          {SETTINGS_TABS.map(t => <Tab key={t} id={t}>{t}</Tab>)}
        </TabList>
        <TabPanels>
          {SETTINGS_TABS.map(t => (
            <TabPanel key={t} id={t}>
              <div className="bo-phase-stack">
                <h3 className="bo-section-title bo-phase-flush">{t}</h3>
                <p className="bo-note bo-phase-flush">{SETTINGS_ABOUT[t]}</p>
                {t === 'General' && <TextField label="Title" defaultValue={project.title} />}
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

/** What opens behind a Build card that has no screen of its own yet. */
export function CardStub({title, onClose}: {title: string | null; onClose: () => void}) {
  return (
    <Modal title={title ?? ''} isOpen={title !== null} onOpenChange={o => { if (!o) onClose(); }}
      footer={<Button size={32} slot="close">Done</Button>}>
      <p className="bo-note bo-phase-flush">{title}: not in Figma yet.</p>
    </Modal>
  );
}
