import {useMemo, useState, type ComponentProps} from 'react';
import {useNavigate} from 'react-router';
import {ArrowDown, ArrowUp, Calendar, ChevronDown, ChevronLeft, ChevronRight, Eye, FileText, Folder, FolderPlus,
  GripVertical, LayoutGrid, MapPin, Orbit, Plus, UserRound, Users} from 'lucide-react';
import {DataTable, DataTableHeader, DataTableColumn, DataTableBody, DataTableRow, DataTableCell, DataTableOptions,
  DataTableEmpty}
  from '../../../src/components/gv/DataTable';
import {Tabs, TabList, Tab, TabPanel, TabPanels} from '../../../src/components/Tabs';
import {Select, SelectItem} from '../../../src/components/Select';
import {SearchField} from '../../../src/components/SearchField';
import {ToggleButton} from '../../../src/components/ToggleButton';
import {DateRangePicker} from '../../../src/components/DateRangePicker';
import {DatePicker} from '../../../src/components/DatePicker';
import {TextField, TextArea} from '../../../src/components/TextField';
import {MenuTrigger, Menu, MenuItem} from '../../../src/components/Menu';
import {MyToastRegion, queue} from '../../../src/components/Toast';
import {Button} from '../../../src/components/Button';
import {Link} from '../../../src/components/Link';
import {Avatar} from '../../../src/components/gv/Avatar';
import {StatusBadge} from '../../../src/components/gv/StatusBadge';
import {Badge} from '../../../src/components/gv/Badge';
import {Modal} from '../../../src/components/gv/Modal';
import {Card} from '../../../src/components/gv/Card';
import {IconButton} from '../../../src/components/gv/IconButton';
import {FilterChips} from '../../../src/patterns/FilterChips';
import {FilterMenu, type FilterFacet, type FilterValue} from '../../../src/patterns/FilterMenu';
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
      {...option('manager')(NO_MANAGER), icon: <Avatar size={16} unassigned />},
      ...managers.map(m => ({...option('manager')(m), icon: <Avatar size={16} initials={initial(m)} />}))
    ]}
  ];
}
const projectsWord = (n: number) => `${n} ${n === 1 ? 'project' : 'projects'}`;

// "Manager B" → "B": one letter keeps the 28 avatar clean, as in the prototype's single-initial avatars.
const initial = (name: string) => name.split(' ').pop()!.slice(0, 1).toUpperCase();
const time = (d?: string) => d ? Date.parse(d) : NaN;
let created = 0;
const draft = (title: string, folder?: string): Project => ({
  id: `new-${++created}`, title, status: 'Draft', phases: [], participants: 0, current: 'Not started', managers: [],
  access: 'Admins and managers', start: '—', folder
});

function Managers({names}: {names?: string[]}) {
  if (!names?.length) {
    return <span className="bo-projects-person"><Avatar unassigned /><span className="bo-note">Not assigned</span></span>;
  }
  const [first, ...rest] = names;
  return (
    <span className="bo-projects-person" title={names.join(', ')}>
      <Avatar initials={initial(first)} />
      <span>{first}{rest.length > 0 && <span className="bo-note"> +{rest.length}</span>}</span>
    </span>
  );
}

const Visibility = ({p}: {p: Project}) => (
  <span className="bo-projects-visibility">
    <StatusBadge state={p.status === 'Live' ? 'live' : 'draft'}>{p.status === 'Live' ? 'Published' : 'Draft'}</StatusBadge>
    <span className="bo-note">{p.access}</span>
  </span>
);

type RowAction = 'duplicate' | 'move' | 'delete';

function ProjectTable({rows, onRowAction}: {rows: Project[]; onRowAction: (p: Project, a: RowAction) => void}) {
  const navigate = useNavigate();
  return (
    <DataTable aria-label="Projects" framed>
      <DataTableHeader>
        <DataTableColumn isRowHeader>Project</DataTableColumn>
        <DataTableColumn><span className="bo-projects-icon-head"><Users aria-hidden size={16} /><span className="bo-visually-hidden">Participants</span></span></DataTableColumn>
        <DataTableColumn>Phase</DataTableColumn><DataTableColumn>Managers</DataTableColumn><DataTableColumn>Visibility</DataTableColumn>
        <DataTableColumn>Start</DataTableColumn><DataTableColumn>End</DataTableColumn>
        <DataTableColumn align="options" hideLabel>Actions</DataTableColumn>
      </DataTableHeader>
      <DataTableBody renderEmptyState={() => <DataTableEmpty>No projects match these filters.</DataTableEmpty>}>{rows.map(p => (
        // A row opens its project's overview, as the real admin's rows do (new drafts have no overview here yet).
        <DataTableRow key={p.id} id={p.id} onAction={KNOWN.has(p.id) ? () => navigate(`/projects/${p.id}`) : undefined}>
          <DataTableCell textValue={p.title}>
            <span className="bo-projects-name">
              <Gap name="Project thumbnail" inline><MapPin aria-hidden size={16} /></Gap>
              <span>
                {KNOWN.has(p.id) ? <Link href={`#/projects/${p.id}`}>{p.title}</Link> : <span>{p.title}</span>}
                {p.folder && <span className="bo-note bo-projects-folder"><Folder aria-hidden size={12} />{p.folder}</span>}
              </span>
            </span>
          </DataTableCell>
          <DataTableCell><span className="bo-projects-nowrap">{p.participants}</span></DataTableCell>
          <DataTableCell>{p.current}{p.timeLeft && <div className="bo-note">{p.timeLeft}</div>}</DataTableCell>
          <DataTableCell><Managers names={p.managers} /></DataTableCell>
          <DataTableCell><Visibility p={p} /></DataTableCell>
          <DataTableCell><span className="bo-projects-nowrap">{p.start}</span></DataTableCell>
          <DataTableCell><span className="bo-projects-nowrap">{p.end ?? '—'}</span></DataTableCell>
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

const folderItems = (folders: FolderRow[]) =>
  [NO_FOLDER, ...folders.map(f => f.name)].map(f => <SelectItem key={f} id={f}>{f}</SelectItem>);

/** From scratch, as in the prototype: a Space and a Folder, neither required; the project starts as a draft. */
function ScratchModal({folders, spaces, onClose, onCreate}: {folders: FolderRow[]; spaces: Space[]; onClose: () => void;
  onCreate: (folder?: string, space?: string) => void}) {
  const [folder, setFolder] = useState(NO_FOLDER);
  const [space, setSpace] = useState('none');
  return (
    <Modal title="New project" isOpen onOpenChange={o => { if (!o) onClose(); }}
      footer={<>
        <Button variant="secondary" slot="close">Cancel</Button>
        <Button variant="primary" onPress={() => onCreate(folder === NO_FOLDER ? undefined : folder, space === 'none' ? undefined : space)}>Create project</Button>
      </>}>
      <div className="bo-projects-form">
        <Select label="Space" selectedKey={space} onSelectionChange={k => setSpace(String(k))}>
          {[<SelectItem key="none" id="none">No space</SelectItem>, ...spaces.map(s => <SelectItem key={s.name} id={s.name}>{s.name}</SelectItem>)]}
        </Select>
        <Select label="Folder" selectedKey={folder} onSelectionChange={k => setFolder(String(k))}>{folderItems(folders)}</Select>
        <p className="bo-note">Both are optional. The project opens as an untitled draft: name it from its overview.</p>
      </div>
    </Modal>
  );
}

/** The template gallery, as today's product: a searchable grid of templates, each with Use template. */
function TemplateGallery({onClose, onUse}: {onClose: () => void; onUse: (template: string) => void}) {
  const [query, setQuery] = useState('');
  const list = TEMPLATES.filter(t => t.title.toLowerCase().includes(query.toLowerCase()));
  return (
    <Modal title="Start from a template" size="wide" isOpen onOpenChange={o => { if (!o) onClose(); }}>
      <div className="bo-projects-gallery">
        <div className="bo-projects-gallery-head">
          <p className="bo-note">{list.length} templates available</p>
          <SearchField aria-label="Search the templates" placeholder="Search the templates" value={query} onChange={setQuery} />
        </div>
        <ul className="bo-projects-templates">
          {list.map(t => (
            <li key={t.title}>
              <Card layout="stacked" title={t.title}>
                <div className="bo-projects-template">
                  <Gap name="Template image" inline><span className="bo-projects-template-art"><LayoutGrid aria-hidden size={32} /></span></Gap>
                  <p>{t.summary}</p>
                  <Button variant="secondary" size={32} aria-label={`Use template: ${t.title}`} onPress={() => onUse(t.title)}>Use template</Button>
                </div>
              </Card>
            </li>
          ))}
        </ul>
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
    <Modal title={`Create a project based on the template '${template}'`} isOpen onOpenChange={o => { if (!o) onClose(); }}
      footer={<>
        <Button variant="secondary" slot="close">Cancel</Button>
        <Button variant="primary" onPress={() => onCreate(title.trim() || template, folder === NO_FOLDER ? undefined : folder)}>
          Create project
        </Button>
      </>}>
      <div className="bo-projects-form">
        <TextField label="The title of your project" placeholder="Type the name of the project" value={title} onChange={setTitle} />
        <DatePicker label="The start date of your project" />
        <Select label="Project folder" selectedKey={folder} onSelectionChange={k => setFolder(String(k))}>{folderItems(folders)}</Select>
      </div>
    </Modal>
  );
}

function FolderModal({onClose, onCreate}: {onClose: () => void; onCreate: (name: string) => void}) {
  const [name, setName] = useState('');
  return (
    <Modal title="New folder" isOpen onOpenChange={o => { if (!o) onClose(); }}
      footer={<>
        <Button variant="secondary" slot="close">Cancel</Button>
        <Button variant="primary" isDisabled={!name.trim()} onPress={() => onCreate(name.trim())}>Create folder</Button>
      </>}>
      <div className="bo-projects-form">
        <TextField label="Folder name" isRequired value={name} onChange={setName} />
        <TextArea label="Short description" description="Shown on the folder card on the platform." />
      </div>
    </Modal>
  );
}

function MoveModal({project, folders, onClose, onMove}: {project: Project; folders: FolderRow[]; onClose: () => void;
  onMove: (folder?: string) => void}) {
  const [folder, setFolder] = useState(project.folder ?? NO_FOLDER);
  return (
    <Modal title="Move to folder" isOpen onOpenChange={o => { if (!o) onClose(); }}
      footer={<>
        <Button variant="secondary" slot="close">Cancel</Button>
        <Button variant="primary" onPress={() => onMove(folder === NO_FOLDER ? undefined : folder)}>Move</Button>
      </>}>
      <div className="bo-projects-form">
        <p>{project.title}</p>
        <Select label="Folder" selectedKey={folder} onSelectionChange={k => setFolder(String(k))}>{folderItems(folders)}</Select>
      </div>
    </Modal>
  );
}

function DeleteModal({project, onClose, onDelete}: {project: Project; onClose: () => void; onDelete: () => void}) {
  return (
    <Modal title="Delete this project?" isOpen onOpenChange={o => { if (!o) onClose(); }}
      footer={<>
        <Button variant="secondary" slot="close">Cancel</Button>
        <Button variant="primary" onPress={onDelete}>Delete project</Button>
      </>}>
      <p>{project.title} and everything collected in it will be deleted. This cannot be undone.</p>
    </Modal>
  );
}

function FoldersView({folders, projects}: {folders: FolderRow[]; projects: Project[]}) {
  return (
    <DataTable aria-label="Folders" framed>
      <DataTableHeader>
        <DataTableColumn isRowHeader>Folder</DataTableColumn><DataTableColumn>Projects</DataTableColumn>
        <DataTableColumn>Managers</DataTableColumn><DataTableColumn>Visibility</DataTableColumn>
      </DataTableHeader>
      <DataTableBody>{folders.map(f => {
        const inside = projects.filter(p => p.folder === f.name);
        return (
          <DataTableRow key={f.name} id={f.name}>
            <DataTableCell textValue={f.name}>
              <span className="bo-projects-name"><Folder aria-hidden size={16} /><span>{f.name}</span></span>
            </DataTableCell>
            <DataTableCell textValue={`${inside.length} projects`}>
              <span>{inside.length} {inside.length === 1 ? 'project' : 'projects'}</span>
              {inside.length > 0 && <div className="bo-note">{inside.map(p => p.title).join(', ')}</div>}
            </DataTableCell>
            <DataTableCell><Managers names={f.managers} /></DataTableCell>
            <DataTableCell><StatusBadge state={f.status === 'Published' ? 'live' : 'draft'}>{f.status}</StatusBadge></DataTableCell>
          </DataTableRow>
        );
      })}
      </DataTableBody>
    </DataTable>
  );
}

function SpacesView({projects, spaces}: {projects: Project[]; spaces: Space[]}) {
  return (
    <DataTable aria-label="Spaces" framed>
      <DataTableHeader>
        <DataTableColumn isRowHeader>Space</DataTableColumn><DataTableColumn>Projects</DataTableColumn>
        <DataTableColumn>Managers</DataTableColumn>
      </DataTableHeader>
      <DataTableBody>{spaces.map(s => {
        const inside = projects.filter(p => s.projects.includes(p.id));
        return (
          <DataTableRow key={s.name} id={s.name}>
            <DataTableCell textValue={s.name}>
              <span className="bo-projects-name"><Orbit aria-hidden size={16} /><span>{s.name}</span></span>
            </DataTableCell>
            <DataTableCell textValue={`${inside.length} projects`}>
              <span>{inside.length} {inside.length === 1 ? 'project' : 'projects'}</span>
              <div className="bo-note">{inside.map(p => p.title).join(', ')}</div>
            </DataTableCell>
            <DataTableCell><Managers names={s.managers} /></DataTableCell>
          </DataTableRow>
        );
      })}
      </DataTableBody>
    </DataTable>
  );
}

/** The month's running projects. The real admin draws them as a timeline; the system has none yet. */
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
    <div className="bo-projects-calendar">
      <div className="bo-projects-calendar-head">
        <IconButton aria-label="Previous month" onPress={() => move(-1)}><ChevronLeft aria-hidden size={16} /></IconButton>
        <h2 className="bo-section-title">{label}</h2>
        <IconButton aria-label="Next month" onPress={() => move(1)}><ChevronRight aria-hidden size={16} /></IconButton>
      </div>
      <Gap name="Project timeline">
        {running.length ? (
          <ul aria-label={label} className="bo-projects-calendar-list">
            {running.map(p => (
              <li key={p.id} className="bo-projects-calendar-item">
                <span>{p.title}</span>
                <span className="bo-note">{p.start} – {p.end ?? 'no end date'}</span>
                <StatusBadge state={p.status === 'Live' ? 'live' : 'draft'}>{p.current ?? ''}</StatusBadge>
              </li>
            ))}
          </ul>
        ) : <p className="bo-note">No projects run in {label}.</p>}
      </Gap>
    </div>
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
    <>
      <p className="bo-note">The order projects appear in on the platform's homepage.</p>
      <ol aria-label="Project order" className="bo-projects-order">
        {ids.map((id, i) => {
          const p = projects.find(x => x.id === id)!;
          return (
            <li key={id} className="bo-projects-order-item">
              <Gap name="Drag-and-drop reordering" inline><GripVertical aria-hidden size={16} /></Gap>
              <span className="bo-push">{p.title}</span>
              <IconButton aria-label={`Move ${p.title} up`} isDisabled={i === 0} onPress={() => swap(i, i - 1)}>
                <ArrowUp aria-hidden size={16} />
              </IconButton>
              <IconButton aria-label={`Move ${p.title} down`} isDisabled={i === ids.length - 1} onPress={() => swap(i, i + 1)}>
                <ArrowDown aria-hidden size={16} />
              </IconButton>
            </li>
          );
        })}
      </ol>
    </>
  );
}

type Dialog = {kind: 'scratch'} | {kind: 'gallery'} | {kind: 'template'; template: string} | {kind: 'folder'} |
  {kind: 'move'; project: Project} | {kind: 'delete'; project: Project} | null;

export function Projects() {
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
    const list = projects.filter(p => p.title.toLowerCase().includes(query.toLowerCase()) && (!pending || PENDING.has(p.id)) &&
      inRange(p) &&
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

  const add = (p: Project, after?: string) => setProjects(list => {
    if (!after) return [p, ...list];
    const i = list.findIndex(x => x.id === after);
    return [...list.slice(0, i + 1), p, ...list.slice(i + 1)];
  });
  const create = (title: string, folder?: string, space?: string) => {
    const project = draft(title, folder);
    add(project);
    // The chosen Space keeps the new draft: it shows in the Spaces view.
    if (space) setSpaces(list => list.map(s => (s.name === space ? {...s, projects: [...s.projects, project.id]} : s)));
    close();
    queue.add({title: 'Project created',
      description: `${title} is a draft until you publish it${space ? `, in the ${space} space` : ''}.`}, {timeout: 5000});
  };
  const onRowAction = (p: Project, a: RowAction) => {
    if (a === 'duplicate') {
      add({...draft(`Copy of ${p.title}`, p.folder), managers: p.managers, access: p.access}, p.id);
      queue.add({title: 'Project duplicated', description: `Copy of ${p.title} is a draft.`}, {timeout: 5000});
    } else setDialog({kind: a, project: p});
  };
  const update = (id: string, patch: Partial<Project>) => setProjects(list => list.map(p => p.id === id ? {...p, ...patch} : p));

  const actions = (
    <span className="bo-projects-actions">
      <Button variant="secondary" size={32} onPress={() => setDialog({kind: 'folder'})}><FolderPlus aria-hidden size={16} />New folder</Button>
      <MenuTrigger>
        <Button variant="primary" size={32}><Plus aria-hidden size={16} />New project<ChevronDown aria-hidden size={16} /></Button>
        <Menu aria-label="New project" onAction={k => setDialog({kind: k === 'template' ? 'gallery' : 'scratch'})}>
          <MenuItem id="scratch"><FileText aria-hidden size={16} />From scratch</MenuItem>
          <MenuItem id="template"><LayoutGrid aria-hidden size={16} />Use a template</MenuItem>
        </Menu>
      </MenuTrigger>
    </span>
  );

  return (
    <Page title="Projects" actions={actions}>
      <Tabs defaultSelectedKey="Projects">
        <div className="bo-tabs-row">
          <TabList aria-label="Project views">
            {VIEWS.map(({id, icon: Icon}) => (
              <Tab key={id} id={id}>
                <span className="bo-projects-tab">
                  <Icon aria-hidden size={16} />{id}{id === 'Spaces' && <span aria-hidden><Badge>New</Badge></span>}
                </span>
              </Tab>
            ))}
          </TabList>
          <SearchField aria-label="Search projects" placeholder="Search projects" value={query} onChange={setQuery} />
        </div>
        <TabPanels>
        <TabPanel id="Projects">
          <div className="bo-filters bo-projects-filters">
            <Select aria-label="Sort" selectedKey={sort} onSelectionChange={k => setSort(String(k))}>
              {SORTS.map(s => <SelectItem key={s} id={s}>{s}</SelectItem>)}
            </Select>
            <ToggleButton isSelected={pending} onChange={setPending}>Pending approval</ToggleButton>
            <DateRangePicker aria-label="Dates" value={range} onChange={setRange} />
            <FilterMenu aria-label="Filter projects" facets={facets} value={filters} onChange={setFilters} countLabel={projectsWord} />
          </div>
          <FilterChips aria-label="Active filters" facets={facets} value={filters} onChange={setFilters} />
          <GapLegend names={['Project thumbnail']} />
          <ProjectTable rows={rows} onRowAction={onRowAction} />
          <p className="bo-note bo-projects-foot">All projects have been loaded</p>
        </TabPanel>
        <TabPanel id="Folders"><FoldersView folders={folders} projects={projects} /></TabPanel>
        <TabPanel id="Spaces"><SpacesView projects={projects} spaces={spaces} /></TabPanel>
        <TabPanel id="Calendar"><CalendarView projects={projects} /></TabPanel>
        <TabPanel id="Arrange projects">
          <GapLegend names={['Drag-and-drop reordering']} />
          <ArrangeView projects={projects} />
        </TabPanel>
        </TabPanels>
      </Tabs>

      {dialog?.kind === 'scratch' && <ScratchModal folders={folders} spaces={spaces} onClose={close} onCreate={(f, sp) => create('Untitled project', f, sp)} />}
      {dialog?.kind === 'gallery' && <TemplateGallery onClose={close} onUse={t => setDialog({kind: 'template', template: t})} />}
      {dialog?.kind === 'template' && <TemplateCreate template={dialog.template} folders={folders} onClose={close} onCreate={create} />}
      {dialog?.kind === 'folder' && <FolderModal onClose={close} onCreate={name => {
        setFolders(list => [...list, {name, status: 'Draft', managers: []}]);
        close();
        queue.add({title: 'Folder created', description: `${name} is in the Folders view.`}, {timeout: 5000});
      }} />}
      {dialog?.kind === 'move' && <MoveModal project={dialog.project} folders={folders} onClose={close} onMove={folder => {
        update(dialog.project.id, {folder});
        close();
      }} />}
      {dialog?.kind === 'delete' && <DeleteModal project={dialog.project} onClose={close} onDelete={() => {
        setProjects(list => list.filter(p => p.id !== dialog.project.id));
        close();
      }} />}
      <MyToastRegion />
    </Page>
  );
}
