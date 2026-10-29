import {useMemo, useState, type ComponentProps} from 'react';
import {useNavigate} from 'react-router';
import {ArrowDown, ArrowUp, Calendar, Asterisk, ChartColumn, ChevronDown, ChevronLeft, ChevronRight, ClipboardList, Eye,
  FileText, Folder, FolderPlus, GripVertical, Info, LayoutGrid, Lightbulb, MapPin, Orbit, Plus, UserRound, Users, Vote}
  from 'lucide-react';
import {AlertDialog, Avatar, Badge, Button, ChoiceCard, DataTable, DataTableAssignee, DataTableBody, DataTableCell,
  DataTableColumn, DataTableEmpty, DataTableHeader, DataTableOptions, DataTableRow, DataTableStack, DataTableThumbnail,
  EmptyState, FilterChips, type FilterFacet, FilterMenu, type FilterValue, IconButton, Menu, MenuItem, MenuTrigger,
  Modal, Pagination, Panel, queue, SearchField, Select, SelectItem, StatusBadge, Tab, TableToolbar, TableToolbarHeading,
  TabList, TabPanel, TabPanels, Tabs, TextArea, TextField, ToastRegion} from 'govocal-ds';
import {DatePicker, DateRangePicker, Link, RadioGroup, ToggleButton} from 'govocal-ds/base';
import {PROJECTS, type Project} from '../data';
import {CALENDAR_START, FOLDERS, PENDING, SPACES, TEMPLATES, type Folder as FolderRow} from '../data-projects';
import {Gap, GapLegend} from '../Gap';
import {Page} from './Page';

// The view tabs, each with its icon as in the prototype's sub-nav.
const VIEWS = [
  {id: 'Projects', icon: LayoutGrid}, {id: 'Folders', icon: Folder}, {id: 'Spaces', icon: Orbit},
  {id: 'Calendar', icon: Calendar}, {id: 'Arrange projects', icon: GripVertical}
];
const SORTS = ['Recently viewed', 'Phase starting or ending soon', 'Recently created (new-old)',
  'Recently created (old-new)', 'Alphabetically (a-z)', 'Alphabetically (z-a)'];
const MONTHS = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October',
  'November', 'December'];
type Range = NonNullable<ComponentProps<typeof DateRangePicker>['value']>;
type Space = (typeof SPACES)[number];
const KNOWN = new Set(PROJECTS.map(p => p.id)); // projects that have an overview screen
const NO_FOLDER = 'No folder';
const NO_MANAGER = 'Not assigned';
// Every admin table pages (docs/DECISIONS.md): six projects a page; folders and spaces ten.
const PAGE_SIZE = 6;
const SHORT_PAGE = 10;

// A project's tile: its first phase's method as an icon; deciding methods (votes, polls) on the blue tile. Templates
// wear their method's tile too, in the Choice card's media slot.
const METHOD_ICONS: Record<string, typeof MapPin> = {
  Information: Info, Ideation: MapPin, Proposals: Lightbulb, Voting: Vote, Poll: ChartColumn, Survey: ClipboardList,
  'Document annotation': FileText, Volunteering: Users, 'Common ground': Users
};
const methodTile = (method: string) => {
  const Icon = METHOD_ICONS[method] ?? MapPin;
  return <DataTableThumbnail icon={<Icon aria-hidden />} tone={method === 'Voting' || method === 'Poll' ? 'blue' : 'teal'} />;
};
const ProjectTile = ({p}: {p: Project}) => methodTile(p.phases[0]?.method ?? '');

// The Filter menu's facets: each project carries one value per facet (a manager per name); a facet keeps the
// projects with any of its ticked values, and facets add up.
const visibilityOf = (p: Project) => (p.status === 'Live' ? 'Published' : 'Draft');
const facetValues: Record<string, (p: Project) => string[]> = {
  visibility: p => [visibilityOf(p)],
  folder: p => [p.folder ?? NO_FOLDER],
  manager: p => (p.managers?.length ? p.managers : [NO_MANAGER])
};
const countOf = (projects: Project[], facet: string, value: string) =>
  projects.filter(p => facetValues[facet](p).includes(value)).length;
function projectFacets(projects: Project[], folders: FolderRow[]): FilterFacet[] {
  const option = (facet: string) => (id: string) => ({id, label: id, count: countOf(projects, facet, id)});
  const managers = [...new Set(projects.flatMap(p => p.managers ?? []))].sort();
  return [
    {id: 'visibility', label: 'Visibility', icon: <Eye aria-hidden size={16} />, options: ['Published', 'Draft'].map(option('visibility'))},
    {id: 'folder', label: 'Folder', icon: <Folder aria-hidden size={16} />,
      options: [NO_FOLDER, ...folders.map(f => f.name)].map(option('folder'))},
    {id: 'manager', label: 'Manager', icon: <UserRound aria-hidden size={16} />, options: [
      {...option('manager')(NO_MANAGER), icon: <Avatar size={16} isUnassigned />},
      ...managers.map(m => ({...option('manager')(m), icon: <Avatar size={16} initials={initial(m)} />}))
    ]}
  ];
}
const counted = (one: string, many: string) => (n: number) => `${n} ${n === 1 ? one : many}`;
const projectsWord = counted('project', 'projects');
const foldersWord = counted('folder', 'folders');
const spacesWord = counted('space', 'spaces');

// "Manager B" → "B": one letter keeps the 28 avatar clean, as in the prototype's single-initial avatars.
const initial = (name: string) => name.split(' ').pop()!.slice(0, 1).toUpperCase();
const time = (d?: string) => d ? Date.parse(d) : NaN;
const matches = (text: string, query: string) => text.toLowerCase().includes(query.trim().toLowerCase());
let created = 0;
const draft = (title: string, folder?: string): Project => ({
  id: `new-${++created}`, title, status: 'Draft', phases: [], participants: 0, current: 'Not started', managers: [],
  access: 'Admins and managers', start: '—', folder
});

/** One page of a list and its Pagination; a new search goes back to the first page. */
function usePages<T>(rows: T[], size: number) {
  const [page, setPage] = useState(1);
  const pageCount = Math.max(1, Math.ceil(rows.length / size));
  const current = Math.min(page, pageCount);
  return {current, pageCount, setPage, shown: rows.slice((current - 1) * size, current * size)};
}

// The first manager as the table's assignee cell; DataTableAssignee holds one person, so the others are a "+N"
// after it, named on hover and to screen readers.
function Managers({names}: {names?: string[]}) {
  const [first, ...rest] = names ?? [];
  return (
    <span className="bo-projects-person" title={names?.length ? names.join(', ') : undefined}>
      <DataTableAssignee name={first} emptyLabel={NO_MANAGER} size={28} />
      {rest.length > 0 && <span className="bo-note"><span aria-hidden>+{rest.length}</span>
        <span className="bo-visually-hidden">and {rest.join(', ')}</span></span>}
    </span>
  );
}

const Visibility = ({p}: {p: Project}) => (
  <DataTableStack sub={p.access}>
    <StatusBadge state={p.status === 'Live' ? 'live' : 'draft'}>{visibilityOf(p)}</StatusBadge>
  </DataTableStack>
);

// A folder's or space's projects: the count, the titles under it (the Data table's stacked cell).
const Inside = ({projects}: {projects: Project[]}) => (
  <DataTableStack sub={projects.length > 0 && projects.map(p => p.title).join(', ')}>{projectsWord(projects.length)}</DataTableStack>
);

type RowAction = 'duplicate' | 'move' | 'delete';

function ProjectTable({rows, onRowAction}: {rows: Project[]; onRowAction: (p: Project, a: RowAction) => void}) {
  const navigate = useNavigate();
  return (
    <DataTable aria-label="Projects">
      <DataTableHeader>
        <DataTableColumn isRowHeader>Project</DataTableColumn>
        <DataTableColumn align="number"><span className="bo-projects-icon-head"><Users aria-hidden size={16} /><span className="bo-visually-hidden">Participants</span></span></DataTableColumn>
        <DataTableColumn>Phase</DataTableColumn><DataTableColumn>Managers</DataTableColumn><DataTableColumn>Visibility</DataTableColumn>
        <DataTableColumn>Start</DataTableColumn><DataTableColumn>End</DataTableColumn>
        <DataTableColumn align="options" hideLabel>Actions</DataTableColumn>
      </DataTableHeader>
      <DataTableBody renderEmptyState={() => <DataTableEmpty>No projects match. Clear the search or the filters to see them all.</DataTableEmpty>}>
        {rows.map(p => (
          // A row opens its project's overview, as the real admin's rows do (new drafts have no overview here yet).
          <DataTableRow key={p.id} id={p.id} onAction={KNOWN.has(p.id) ? () => navigate(`/projects/${p.id}`) : undefined}>
            <DataTableCell textValue={p.title}>
              <DataTableStack leading={<ProjectTile p={p} />}
                sub={p.folder && <span className="bo-projects-folder"><Folder aria-hidden size={12} />{p.folder}</span>}>
                {KNOWN.has(p.id) ? <Link href={`#/projects/${p.id}`}>{p.title}</Link> : p.title}
              </DataTableStack>
            </DataTableCell>
            <DataTableCell align="number">{p.participants}</DataTableCell>
            <DataTableCell><DataTableStack sub={p.timeLeft}>{p.current}</DataTableStack></DataTableCell>
            <DataTableCell><Managers names={p.managers} /></DataTableCell>
            <DataTableCell><Visibility p={p} /></DataTableCell>
            <DataTableCell muted><span className="bo-projects-nowrap">{p.start}</span></DataTableCell>
            <DataTableCell muted><span className="bo-projects-nowrap">{p.end ?? '—'}</span></DataTableCell>
            <DataTableCell align="options">
              <DataTableOptions aria-label={`Actions for ${p.title}`} onAction={k => onRowAction(p, k as RowAction)}>
                <MenuItem id="duplicate">Duplicate</MenuItem>
                <MenuItem id="move">Move to folder</MenuItem>
                <MenuItem id="delete">Delete</MenuItem>
              </DataTableOptions>
            </DataTableCell>
          </DataTableRow>))}
      </DataTableBody>
    </DataTable>
  );
}

const folderItems = (folders: FolderRow[], icon?: boolean) =>
  [NO_FOLDER, ...folders.map(f => f.name)].map(f => (
    <SelectItem key={f} id={f} icon={icon ? <Folder aria-hidden size={16} /> : undefined}>{f}</SelectItem>
  ));
const orNone = (folder: string) => (folder === NO_FOLDER ? undefined : folder);
const closing = (onClose: () => void) => (open: boolean) => { if (!open) onClose(); };
const footer = (confirm: string, onConfirm: () => void, isDisabled?: boolean) => <>
  <Button variant="secondary" slot="close">Cancel</Button>
  <Button variant="primary" isDisabled={isDisabled} onPress={onConfirm}>{confirm}</Button>
</>;

/** From scratch, as in the prototype: a Space and a Folder, neither required; the project starts as a draft. */
function ScratchModal({folders, spaces, onClose, onCreate}: {folders: FolderRow[]; spaces: Space[]; onClose: () => void;
  onCreate: (folder?: string, space?: string) => void}) {
  const [folder, setFolder] = useState(NO_FOLDER);
  const [space, setSpace] = useState('none');
  return (
    <Modal title="New project" isOpen onOpenChange={closing(onClose)}
      footer={footer('Create project', () => onCreate(orNone(folder), space === 'none' ? undefined : space))}>
      {/* The prototype's two pills under the title (Select's "With search" and "With icons" stories). */}
      <div className="bo-projects-form">
        <div className="bo-projects-pills">
          <Select variant="pill" aria-label="Space" prefix="Space:" isSearchable searchPlaceholder="Search spaces"
            selectedKey={space} onSelectionChange={k => setSpace(String(k))}>
            {[{id: 'none', name: 'No space'}, ...spaces.map(s => ({id: s.name, name: s.name}))].map(s => (
              <SelectItem key={s.id} id={s.id} icon={<Asterisk aria-hidden size={16} />}>{s.name}</SelectItem>
            ))}
          </Select>
          <Select variant="pill" aria-label="Folder" prefix="Folder:" isSearchable searchPlaceholder="Search folders"
            selectedKey={folder} onSelectionChange={k => setFolder(String(k))}>{folderItems(folders, true)}</Select>
        </div>
        <p className="bo-note">Both are optional. The project opens as an untitled draft: name it from its overview.</p>
      </div>
    </Modal>
  );
}

/**
 * The template gallery: a search over Choice cards (the "With icon" story), one per template with its method's tile,
 * and one Use template in the foot, off until a template is chosen.
 */
function TemplateGallery({onClose, onUse}: {onClose: () => void; onUse: (template: string) => void}) {
  const [query, setQuery] = useState('');
  const [chosen, setChosen] = useState<string | null>(null);
  const list = TEMPLATES.filter(t => matches(t.title, query));
  return (
    <Modal title="Start from a template" size="wide" isOpen onOpenChange={closing(onClose)}
      footer={footer('Use template', () => chosen && onUse(chosen), !chosen || !list.some(t => t.title === chosen))}>
      <div className="bo-projects-gallery">
        <div className="bo-projects-gallery-head">
          <p className="bo-note">{list.length} templates available</p>
          <SearchField aria-label="Search the templates" placeholder="Search the templates" value={query} onChange={setQuery} />
        </div>
        {list.length ? (
          <RadioGroup aria-label="Templates" className="bo-projects-templates" value={chosen}
            onChange={setChosen}>
            {list.map(t => (
              <ChoiceCard key={t.title} value={t.title} media={methodTile(t.method)} description={t.summary}>{t.title}</ChoiceCard>
            ))}
          </RadioGroup>
        ) : <EmptyState size="panel" headingLevel="none" title="No templates match" description="Try another word." />}
      </div>
    </Modal>
  );
}

/** The product's second step: title, start date and folder of the project made from the template. */
function TemplateCreate({template, folders, onClose, onCreate}: {template: string; folders: FolderRow[];
  onClose: () => void; onCreate: (title: string, folder?: string) => void}) {
  const [title, setTitle] = useState('');
  const [folder, setFolder] = useState(NO_FOLDER);
  return (
    <Modal title={`Create a project based on the template '${template}'`} isOpen onOpenChange={closing(onClose)}
      footer={footer('Create project', () => onCreate(title.trim() || template, orNone(folder)))}>
      <div className="bo-projects-form">
        <TextField label="The title of your project" placeholder="Type the name of the project" value={title} onChange={setTitle} />
        <DatePicker label="The start date of your project" />
        <Select label="Project folder" selectedKey={folder} onSelectionChange={k => setFolder(String(k))}>{folderItems(folders)}</Select>
      </div>
    </Modal>
  );
}

/** New folder and New space: a name (required) and a short description. */
function NameModal({kind, onClose, onCreate}: {kind: 'folder' | 'space'; onClose: () => void; onCreate: (name: string) => void}) {
  const [name, setName] = useState('');
  return (
    <Modal title={`New ${kind}`} isOpen onOpenChange={closing(onClose)}
      footer={footer(`Create ${kind}`, () => onCreate(name.trim()), !name.trim())}>
      <div className="bo-projects-form">
        <TextField label={kind === 'folder' ? 'Folder name' : 'Space name'} isRequired value={name} onChange={setName} />
        <TextArea label="Short description"
          description={kind === 'folder' ? 'Shown on the folder card on the platform.' : 'Seen by admins and the space\'s managers.'} />
      </div>
    </Modal>
  );
}

function MoveModal({project, folders, onClose, onMove}: {project: Project; folders: FolderRow[]; onClose: () => void;
  onMove: (folder?: string) => void}) {
  const [folder, setFolder] = useState(project.folder ?? NO_FOLDER);
  return (
    <Modal title="Move to folder" isOpen onOpenChange={closing(onClose)} footer={footer('Move', () => onMove(orNone(folder)))}>
      <Select label="Folder" description={`Where ${project.title} is listed, here and on the platform.`} isSearchable
        searchPlaceholder="Search folders" selectedKey={folder} onSelectionChange={k => setFolder(String(k))}>
        {folderItems(folders, true)}
      </Select>
    </Modal>
  );
}

function DeleteModal({project, onClose, onDelete}: {project: Project; onClose: () => void; onDelete: () => void}) {
  return (
    <AlertDialog tone="danger" title="Delete this project?" confirmLabel="Delete project" isOpen
      onOpenChange={closing(onClose)} onConfirm={onDelete}>
      <p>{project.title} and everything collected in it will be deleted.</p>
    </AlertDialog>
  );
}

/** The Folders and Spaces tabs: the same Panel as the project list, its count and search in the toolbar row. */
function GroupPanel<T extends {name: string; managers: string[]}>({title, description, word, rows, inside, status}: {
  title: 'Folders' | 'Spaces'; description: string; word: (n: number) => string; rows: T[];
  inside: (row: T) => Project[]; status?: (row: T) => 'Published' | 'Draft';
}) {
  const [query, setQuery] = useState('');
  const found = rows.filter(r => matches(r.name, query));
  const {current, pageCount, setPage, shown} = usePages(found, SHORT_PAGE);
  const singular = title === 'Folders' ? 'folder' : 'space';
  return (
    <Panel title={title} description={description} isFlush
      toolbar={(
        <TableToolbar aria-label={`${singular[0].toUpperCase()}${singular.slice(1)} tools`} heading={word(found.length)}>
          <SearchField aria-label={`Search ${title.toLowerCase()}`} placeholder="Search" value={query}
            onChange={q => { setQuery(q); setPage(1); }} />
        </TableToolbar>
      )}
      footer={<Pagination page={current} pageCount={pageCount} onPageChange={setPage} aria-label={`${singular[0].toUpperCase()}${singular.slice(1)} pages`} />}>
      <DataTable aria-label={title}>
        <DataTableHeader>
          <DataTableColumn isRowHeader>{singular === 'folder' ? 'Folder' : 'Space'}</DataTableColumn>
          <DataTableColumn>Projects</DataTableColumn><DataTableColumn>Managers</DataTableColumn>
          {status && <DataTableColumn>Visibility</DataTableColumn>}
        </DataTableHeader>
        <DataTableBody renderEmptyState={() => <DataTableEmpty>No {title.toLowerCase()} match.</DataTableEmpty>}>
          {shown.map(r => (
            <DataTableRow key={r.name} id={r.name}>
              <DataTableCell textValue={r.name}>
                <DataTableStack leading={<DataTableThumbnail tone="teal"
                  icon={singular === 'folder' ? <Folder aria-hidden /> : <Orbit aria-hidden />} />}>{r.name}</DataTableStack>
              </DataTableCell>
              <DataTableCell textValue={projectsWord(inside(r).length)}><Inside projects={inside(r)} /></DataTableCell>
              <DataTableCell><Managers names={r.managers} /></DataTableCell>
              {status && <DataTableCell>
                <StatusBadge state={status(r) === 'Published' ? 'live' : 'draft'}>{status(r)}</StatusBadge>
              </DataTableCell>}
            </DataTableRow>
          ))}
        </DataTableBody>
      </DataTable>
    </Panel>
  );
}

/** The month's running projects in a Panel, the month its title. The real admin draws a timeline; the system has none. */
function CalendarView({projects}: {projects: Project[]}) {
  const [at, setAt] = useState(CALENDAR_START);
  const move = (by: number) => setAt(({year, month}) => {
    const m = month + by;
    return {year: year + Math.floor(m / 12), month: (m + 12) % 12};
  });
  const label = `${MONTHS[at.month]} ${at.year}`;
  const from = Date.UTC(at.year, at.month, 1), to = Date.UTC(at.year, at.month + 1, 1);
  const running = projects.filter(p => {
    const start = time(p.start), end = time(p.end);
    return start < to && (Number.isNaN(end) || end >= from);
  });
  return (
    <Panel title={label} count={running.length} description="Projects running at some point in the month." isFlush
      actions={<>
        <IconButton variant="bordered" aria-label="Previous month" onPress={() => move(-1)}><ChevronLeft aria-hidden size={16} /></IconButton>
        <IconButton variant="bordered" aria-label="Next month" onPress={() => move(1)}><ChevronRight aria-hidden size={16} /></IconButton>
      </>}>
      {running.length ? (
        <Gap name="Project timeline">
          <DataTable aria-label={label}>
            <DataTableHeader>
              <DataTableColumn isRowHeader>Project</DataTableColumn><DataTableColumn>Dates</DataTableColumn>
              <DataTableColumn>Phase</DataTableColumn>
            </DataTableHeader>
            <DataTableBody>
              {running.map(p => (
                <DataTableRow key={p.id} id={p.id}>
                  <DataTableCell textValue={p.title}><DataTableStack leading={<ProjectTile p={p} />}>{p.title}</DataTableStack></DataTableCell>
                  <DataTableCell muted><span className="bo-projects-nowrap">{p.start} – {p.end ?? 'no end date'}</span></DataTableCell>
                  <DataTableCell><DataTableStack sub={p.timeLeft}>{p.current}</DataTableStack></DataTableCell>
                </DataTableRow>
              ))}
            </DataTableBody>
          </DataTable>
        </Gap>
      ) : <EmptyState size="panel" headingLevel="none" icon={<Calendar aria-hidden />} title={`No projects run in ${label}`}
        description="Pick another month with the arrows." />}
    </Panel>
  );
}

/** The order of projects on the platform's homepage. Buttons move them until the system has drag and drop. */
function ArrangeView({projects}: {projects: Project[]}) {
  const [order, setOrder] = useState(() => projects.map(p => p.id));
  const ids = [...order.filter(id => projects.some(p => p.id === id)), ...projects.map(p => p.id).filter(id => !order.includes(id))];
  const swap = (i: number, j: number) => {
    const next = [...ids];
    [next[i], next[j]] = [next[j], next[i]];
    setOrder(next);
  };
  return (
    <Panel title="Homepage order" count={ids.length} description="The order projects appear in on the platform's homepage." isFlush
      footer={<GapLegend names={['Drag-and-drop reordering']} />}>
      <DataTable aria-label="Project order">
        <DataTableHeader>
          <DataTableColumn align="number">Position</DataTableColumn>
          <DataTableColumn isRowHeader>Project</DataTableColumn>
          <DataTableColumn>Visibility</DataTableColumn>
          <DataTableColumn align="options" hideLabel>Move</DataTableColumn>
        </DataTableHeader>
        <DataTableBody>
          {ids.map((id, i) => {
            const p = projects.find(x => x.id === id)!;
            return (
              <DataTableRow key={id} id={id}>
                <DataTableCell align="number">{i + 1}</DataTableCell>
                <DataTableCell textValue={p.title}>
                  <span className="bo-projects-name">
                    <Gap name="Drag-and-drop reordering" inline><GripVertical aria-hidden size={16} /></Gap>
                    <DataTableStack leading={<ProjectTile p={p} />} sub={p.folder}>{p.title}</DataTableStack>
                  </span>
                </DataTableCell>
                <DataTableCell><Visibility p={p} /></DataTableCell>
                <DataTableCell align="options">
                  <span className="bo-projects-move">
                    <IconButton aria-label={`Move ${p.title} up`} isDisabled={i === 0} onPress={() => swap(i, i - 1)}>
                      <ArrowUp aria-hidden size={16} />
                    </IconButton>
                    <IconButton aria-label={`Move ${p.title} down`} isDisabled={i === ids.length - 1} onPress={() => swap(i, i + 1)}>
                      <ArrowDown aria-hidden size={16} />
                    </IconButton>
                  </span>
                </DataTableCell>
              </DataTableRow>
            );
          })}
        </DataTableBody>
      </DataTable>
    </Panel>
  );
}

type Dialog = {kind: 'scratch'} | {kind: 'gallery'} | {kind: 'template'; template: string} | {kind: 'folder'} |
  {kind: 'space'} | {kind: 'move'; project: Project} | {kind: 'delete'; project: Project} | null;

export function Projects() {
  const [view, setView] = useState<string>('Projects');
  const [projects, setProjects] = useState(PROJECTS);
  const [folders, setFolders] = useState(FOLDERS);
  const [spaces, setSpaces] = useState<Space[]>(SPACES);
  const [range, setRange] = useState<Range | null>(null);
  const [filters, setFilters] = useState<FilterValue>({});
  const [dialog, setDialog] = useState<Dialog>(null);
  const [query, setQuery] = useState('');
  const [sort, setSort] = useState(SORTS[0]);
  const [pending, setPending] = useState(false);
  const close = () => setDialog(null);

  const rows = useMemo(() => {
    // The date range keeps the projects running at some point in it (a project with no dates yet never matches).
    const from = range && new Date(range.start.year, range.start.month - 1, range.start.day).getTime();
    const to = range && new Date(range.end.year, range.end.month - 1, range.end.day).getTime();
    const inRange = (p: Project) => from === null || to === null ||
      (time(p.start) <= to && (Number.isNaN(time(p.end)) || time(p.end) >= from));
    const list = projects.filter(p => matches(p.title, query) && (!pending || PENDING.has(p.id)) && inRange(p) &&
      Object.entries(filters).every(([facet, on]) => !on.length || facetValues[facet](p).some(v => on.includes(v))));
    const by = (f: (a: Project, b: Project) => number) => [...list].sort(f);
    switch (sort) {
      case 'Alphabetically (a-z)': return by((a, b) => a.title.localeCompare(b.title));
      case 'Alphabetically (z-a)': return by((a, b) => b.title.localeCompare(a.title));
      case 'Phase starting or ending soon': return by((a, b) => (time(a.end) || Infinity) - (time(b.end) || Infinity));
      case 'Recently created (old-new)': return [...list].reverse();
      default: return list;
    }
  }, [projects, query, sort, pending, range, filters]);
  const facets = useMemo(() => projectFacets(projects, folders), [projects, folders]);
  const {current, pageCount, setPage, shown} = usePages(rows, PAGE_SIZE);
  // A new search, sort, filter or date range starts again from the first page.
  const fresh = <T,>(set: (v: T) => void) => (v: T) => { set(v); setPage(1); };

  const add = (p: Project, after?: string) => setProjects(list => {
    if (!after) return [p, ...list];
    const i = list.findIndex(x => x.id === after);
    return [...list.slice(0, i + 1), p, ...list.slice(i + 1)];
  });
  const remove = (id: string) => setProjects(list => list.filter(p => p.id !== id));
  const update = (id: string, patch: Partial<Project>) => setProjects(list => list.map(p => p.id === id ? {...p, ...patch} : p));
  const create = (title: string, folder?: string, space?: string) => {
    const project = draft(title, folder);
    add(project);
    // The chosen Space keeps the new draft: it shows in the Spaces view.
    if (space) setSpaces(list => list.map(s => (s.name === space ? {...s, projects: [...s.projects, project.id]} : s)));
    close();
    queue.add({title: 'Project created',
      description: `${title} is a draft until you publish it${space ? `, in the ${space} space` : ''}.`}, {timeout: 5000});
  };
  // Instant changes say so in a Toast with Undo (docs/DECISIONS.md); Delete asks first, then offers Undo too.
  const onRowAction = (p: Project, a: RowAction) => {
    if (a !== 'duplicate') return setDialog({kind: a, project: p});
    const copy = {...draft(`Copy of ${p.title}`, p.folder), managers: p.managers, access: p.access};
    add(copy, p.id);
    queue.add({title: 'Project duplicated', description: `${copy.title} is a draft.`, action: 'Undo',
      onAction: () => remove(copy.id)}, {timeout: 5000});
  };
  const moveTo = (p: Project, folder?: string) => {
    update(p.id, {folder});
    close();
    queue.add({title: folder ? `Moved to ${folder}` : 'Taken out of its folder', description: p.title, action: 'Undo',
      onAction: () => update(p.id, {folder: p.folder})}, {timeout: 5000});
  };
  const destroy = (p: Project) => {
    const at = projects.findIndex(x => x.id === p.id);
    remove(p.id);
    close();
    queue.add({title: 'Project deleted', description: p.title, action: 'Undo',
      onAction: () => setProjects(list => [...list.slice(0, at), p, ...list.slice(at)])}, {timeout: 5000});
  };
  const named = (kind: 'folder' | 'space', name: string) => {
    if (kind === 'folder') setFolders(list => [...list, {name, status: 'Draft', managers: []}]);
    else setSpaces(list => [...list, {name, projects: [], managers: []}]);
    close();
    queue.add({title: kind === 'folder' ? 'Folder created' : 'Space created',
      description: `${name} is in the ${kind === 'folder' ? 'Folders' : 'Spaces'} view.`}, {timeout: 5000});
  };

  // The head's action follows the tab, as in the real admin: New project, New folder, New space.
  const actions = view === 'Folders' ? (
    <Button variant="primary" size={32} onPress={() => setDialog({kind: 'folder'})}><FolderPlus aria-hidden size={16} />New folder</Button>
  ) : view === 'Spaces' ? (
    <Button variant="primary" size={32} onPress={() => setDialog({kind: 'space'})}><Plus aria-hidden size={16} />New space</Button>
  ) : (
    <MenuTrigger>
      <Button variant="primary" size={32}><Plus aria-hidden size={16} />New project<ChevronDown aria-hidden size={16} /></Button>
      <Menu aria-label="New project" onAction={k => setDialog({kind: k === 'template' ? 'gallery' : 'scratch'})}>
        <MenuItem id="scratch" icon={<FileText aria-hidden size={16} />}>From scratch</MenuItem>
        <MenuItem id="template" icon={<LayoutGrid aria-hidden size={16} />}>Use a template</MenuItem>
      </Menu>
    </MenuTrigger>
  );

  // The list's toolbar row (Panel's "With a toolbar" story): the count, which follows every control, at the start;
  // the sort (Select quiet), Pending approval, the dates, the Filter menu and the search at the end; the chips under it.
  const toolbar = (
    <>
      <TableToolbar aria-label="Project tools" heading={projectsWord(rows.length)}>
        <Select variant="quiet" aria-label="Sort" prefix="Sort:" selectedKey={sort} onSelectionChange={k => fresh(setSort)(String(k))}>
          {SORTS.map(s => <SelectItem key={s} id={s}>{s}</SelectItem>)}
        </Select>
        <ToggleButton isSelected={pending} onChange={fresh(setPending)}>Pending approval</ToggleButton>
        <DateRangePicker aria-label="Dates" value={range} onChange={fresh(setRange)} />
        <FilterMenu aria-label="Filter projects" facets={facets} value={filters} onChange={fresh(setFilters)} countLabel={projectsWord} />
        <SearchField aria-label="Search projects" placeholder="Search" value={query} onChange={fresh(setQuery)} />
      </TableToolbar>
      <FilterChips aria-label="Active filters" facets={facets} value={filters} onChange={fresh(setFilters)} />
    </>
  );

  return (
    <Page title="Projects" actions={actions}>
      <Tabs selectedKey={view} onSelectionChange={k => setView(String(k))}>
        <TabList aria-label="Project views">
          {VIEWS.map(({id, icon: Icon}) => (
            <Tab key={id} id={id}>
              <span className="bo-projects-tab">
                <Icon aria-hidden size={16} />{id}{id === 'Spaces' && <span aria-hidden><Badge>New</Badge></span>}
              </span>
            </Tab>
          ))}
        </TabList>
        <TabPanels>
          <TabPanel id="Projects" className="react-aria-TabPanel bo-projects-view">
            {/* Numbered pages in place of "Scroll down to load more" (docs/DECISIONS.md). */}
            <Panel title="All projects" description="Open a project to set it up, or use its menu to copy, move or delete it."
              isFlush toolbar={toolbar}
              footer={<Pagination page={current} pageCount={pageCount} onPageChange={setPage} aria-label="Project pages" />}>
              <ProjectTable rows={shown} onRowAction={onRowAction} />
            </Panel>
          </TabPanel>
          <TabPanel id="Folders" className="react-aria-TabPanel bo-projects-view">
            <GroupPanel title="Folders" description="Folders group projects on the platform, each with its own page."
              word={foldersWord} rows={folders} inside={f => projects.filter(p => p.folder === f.name)} status={f => f.status} />
          </TabPanel>
          <TabPanel id="Spaces" className="react-aria-TabPanel bo-projects-view">
            <GroupPanel title="Spaces" description="Spaces group projects across folders for the admins who manage them."
              word={spacesWord} rows={spaces} inside={s => projects.filter(p => s.projects.includes(p.id))} />
          </TabPanel>
          <TabPanel id="Calendar" className="react-aria-TabPanel bo-projects-view"><CalendarView projects={projects} /></TabPanel>
          <TabPanel id="Arrange projects" className="react-aria-TabPanel bo-projects-view"><ArrangeView projects={projects} /></TabPanel>
        </TabPanels>
      </Tabs>

      {dialog?.kind === 'scratch' && <ScratchModal folders={folders} spaces={spaces} onClose={close} onCreate={(f, sp) => create('Untitled project', f, sp)} />}
      {dialog?.kind === 'gallery' && <TemplateGallery onClose={close} onUse={t => setDialog({kind: 'template', template: t})} />}
      {dialog?.kind === 'template' && <TemplateCreate template={dialog.template} folders={folders} onClose={close} onCreate={create} />}
      {(dialog?.kind === 'folder' || dialog?.kind === 'space') &&
        <NameModal kind={dialog.kind} onClose={close} onCreate={name => named(dialog.kind as 'folder' | 'space', name)} />}
      {dialog?.kind === 'move' && <MoveModal project={dialog.project} folders={folders} onClose={close} onMove={f => moveTo(dialog.project, f)} />}
      {dialog?.kind === 'delete' && <DeleteModal project={dialog.project} onClose={close} onDelete={() => destroy(dialog.project)} />}
      <ToastRegion />
    </Page>
  );
}
