import {useCallback, useMemo, useRef, useState, type ReactNode} from 'react';
import type {Key} from 'react-aria-components';
import {useDateFormatter, useNumberFormatter} from '../format';
import type {Meta, StoryObj} from '@storybook/react-vite';
import {expect, userEvent, waitFor, within} from 'storybook/test';
import {
  DataTable,
  DataTableAssignee,
  DataTableBody,
  DataTableCell,
  DataTableColumn,
  DataTableEmpty,
  DataTableHeader,
  DataTableOptions,
  DataTablePerson,
  DataTableRow,
  DataTableStack,
  DataTableTags,
  DataTableText,
  DataTableThumbnail,
  DataTableAddColumn,
  toKeySet
} from './DataTable';
import {MenuItem} from '../Menu';
import {SearchField} from '../SearchField';
import {Button} from '../Button';
import {NewDot} from './NewDot';
import {Pagination} from './Pagination';
import {Panel} from './Panel';
import {StatusBadge} from './StatusBadge';
import {EmptyState} from './EmptyState';
import {Skeleton} from './Skeleton';
import {Banner} from './Banner';
import {TableToolbar, TableToolbarHeading} from './TableToolbar';
import {ClipboardList, Download, Lock, Map as MapIcon, MapPin, Plus, SearchX, TriangleAlert, UserPlus, Users} from 'lucide-react';
import {FilterMenu, type FilterValue} from '../../patterns/FilterMenu';
import {FilterChips} from '../../patterns/FilterChips';
import {SelectionBar} from '../../patterns/SelectionBar';
import {StatCard} from '../../patterns/StatCard';
import {SidePanel, SidePanelRecordHead, SidePanelSection} from './SidePanel';
import {PropertyList, PropertyListItem} from './PropertyList';
import {inventPeople, sortPeople as sortList, type ListPerson} from '../../stories/data/people';
import {IDEA_FACETS} from '../../patterns/FilterMenu.stories';
import {
  DISMISS_WARNINGS, ExportMenu, IDEA_ACTIONS, IDEAS as MANAGE_IDEAS, METRICS, filterIdeas, ideaCount,
  type Idea as ManageIdea, type Metric
} from '../../stories/data/ideas';

type Direction = 'ascending' | 'descending';
type SortDescriptor = {column: string | number; direction: Direction};

const PEOPLE = [
  {id: 'a', name: 'Resident A', initials: 'RA', email: 'user1@example.org', role: 'Registered user', ideas: 12, joined: '2026-10-02'},
  {id: 'b', name: 'Manager B', initials: 'MB', email: 'user2@example.org', role: 'Project manager', ideas: 3, joined: '2026-08-14'},
  {id: 'c', name: 'Admin C', initials: 'AC', email: 'user3@example.org', role: 'Platform admin', ideas: 0, joined: '2025-12-19'},
  {id: 'd', name: 'Resident D', initials: 'RD', email: 'user4@example.org', role: 'Registered user', ideas: 27, joined: '2025-06-12'}
];
type Person = (typeof PEOPLE)[number];

// A date in the story's locale (the Locale toolbar), as the parts format theirs: "2 October 2026", "2. Oktober 2026".
function When({iso, isShort}: {iso: string; isShort?: boolean}) {
  const format = useDateFormatter(isShort ? {day: 'numeric', month: 'short', timeZone: 'UTC'}
    : {day: 'numeric', month: 'long', year: 'numeric', timeZone: 'UTC'});
  return <>{format.format(new Date(iso))}</>;
}

function sortPeople(list: Person[], sort: SortDescriptor) {
  const key = sort.column as keyof Person;
  const sign = sort.direction === 'descending' ? -1 : 1;
  return [...list].sort((a, b) => sign * String(a[key]).localeCompare(String(b[key]), undefined, {numeric: true}));
}

function PeopleTable({initialSort, selectable, initialSelection = [], empty, showChecksOnHover, framed, density}: {
  initialSort?: SortDescriptor;
  selectable?: boolean;
  initialSelection?: string[];
  empty?: boolean;
  showChecksOnHover?: boolean;
  framed?: boolean;
  density?: 'compact';
}) {
  const [sort, setSort] = useState<SortDescriptor | undefined>(initialSort);
  const [selected, setSelected] = useState<'all' | Iterable<string | number>>(new Set(initialSelection));
  const rows = useMemo(() => (empty ? [] : sort ? sortPeople(PEOPLE, sort) : PEOPLE), [sort, empty]);
  return (
    <DataTable aria-label="Users" sortDescriptor={sort} onSortChange={d => setSort(d as SortDescriptor)}
      showChecksOnHover={showChecksOnHover} isFramed={framed} density={density}
      selectionMode={selectable ? 'multiple' : 'none'} selectedKeys={selected}
      onSelectionChange={k => setSelected(k as typeof selected)}>
      <DataTableHeader>
        <DataTableColumn id="name" isRowHeader allowsSorting={!!initialSort}>Name</DataTableColumn>
        <DataTableColumn id="role">Role</DataTableColumn>
        <DataTableColumn id="ideas" align="number" allowsSorting={!!initialSort}>Ideas</DataTableColumn>
        <DataTableColumn id="joined" allowsSorting={!!initialSort}>Joined</DataTableColumn>
        <DataTableColumn id="options" align="options">Options</DataTableColumn>
      </DataTableHeader>
      <DataTableBody renderEmptyState={() => <DataTableEmpty>No users here.</DataTableEmpty>}>
        {rows.map(p => (
          <DataTableRow key={p.id} id={p.id} textValue={p.name}>
            <DataTableCell><DataTablePerson name={p.name} initials={p.initials} sub={p.email} /></DataTableCell>
            <DataTableCell>{p.role}</DataTableCell>
            <DataTableCell align="number">{p.ideas}</DataTableCell>
            <DataTableCell><When iso={p.joined} /></DataTableCell>
            <DataTableCell align="options">
              <DataTableOptions aria-label={`Options for ${p.name}`}>
                <MenuItem>Add to group</MenuItem>
                <MenuItem>Block user</MenuItem>
                <MenuItem>Delete user</MenuItem>
              </DataTableOptions>
            </DataTableCell>
          </DataTableRow>
        ))}
      </DataTableBody>
    </DataTable>
  );
}

const meta: Meta = {
  title: 'Components/Tables & lists/Data table',
  component: DataTable,
  parameters: {layout: 'padded'},
  tags: ['autodocs', 'not-in-figma', 'status:candidate']
};
export default meta;
type Story = StoryObj;

const Caption = ({children}: {children: ReactNode}) => (
  <h3 style={{margin: '0 0 8px', font: 'var(--gv-type-small-strong)', color: 'var(--gv-text-secondary)'}}>{children}</h3>
);

/** The three looks: in a Card or Panel (default), standing alone (`isFramed`), and dense (`compact`). */
export const AllVariants: Story = {
  name: 'AllVariants',
  render: () => (
    <div style={{display: 'grid', gap: 32, maxWidth: 900}}>
      <div><Caption>Default</Caption><PeopleTable initialSort={{column: 'name', direction: 'ascending'}} /></div>
      <div><Caption>Framed</Caption><PeopleTable framed /></div>
      <div><Caption>Compact, checks on hover</Caption><PeopleTable density="compact" selectable showChecksOnHover initialSelection={['b']} /></div>
    </div>
  )
};

/** The prototype's back-office list: quiet headers, hairline rows, no zebra, a person cell and the "…" column. */
export const Default: Story = {render: () => <PeopleTable />};

/**
 * Sortable columns: the sorted one shows its arrow (↑ ascending, ↓ descending) and primary text; a sortable header
 * under the pointer gets a soft block and a quiet arrow. Press a header to sort or flip; `aria-sort` says which.
 */
export const SortedAscending: Story = {
  name: 'Sorted ascending',
  render: () => <PeopleTable initialSort={{column: 'name', direction: 'ascending'}} />
};

export const SortedDescending: Story = {
  name: 'Sorted descending',
  render: () => <PeopleTable initialSort={{column: 'joined', direction: 'descending'}} />
};

/**
 * Some rows checked: the header's select-all is indeterminate, and selects all at a press. With `showChecksOnHover` (as
 * here) unchecked rows show their box on hover, and the select-all shows while the table is hovered or focused, or
 * once anything is checked.
 */
export const SelectableSomeSelected: Story = {
  name: 'Select all · indeterminate',
  render: () => <PeopleTable selectable showChecksOnHover initialSelection={['b', 'c']} initialSort={{column: 'joined', direction: 'descending'}} />
};

/** Selection driven by the page's own select-all control: the header's check column stays empty. */
export const SelectableWithoutSelectAll: Story = {
  name: 'Selectable, without select all',
  render: () => (
    <DataTable aria-label="Users" selectionMode="multiple" defaultSelectedKeys={['a']}>
      <DataTableHeader showSelectAll={false}>
        <DataTableColumn isRowHeader>Name</DataTableColumn>
        <DataTableColumn>Role</DataTableColumn>
      </DataTableHeader>
      <DataTableBody>
        {PEOPLE.map(p => (
          <DataTableRow key={p.id} id={p.id} textValue={p.name}>
            <DataTableCell><DataTablePerson name={p.name} initials={p.initials} sub={p.email} /></DataTableCell>
            <DataTableCell>{p.role}</DataTableCell>
          </DataTableRow>
        ))}
      </DataTableBody>
    </DataTable>
  )
};

/** The person cell: gv Avatar, the name over its sub-line. */
export const PersonCell: Story = {
  name: 'Person cell',
  render: () => (
    <DataTable aria-label="People">
      <DataTableHeader><DataTableColumn isRowHeader>Name</DataTableColumn></DataTableHeader>
      <DataTableBody>
        <DataTableRow textValue="Resident A">
          <DataTableCell><DataTablePerson name="Resident A" initials="RA" sub="user1@example.org" /></DataTableCell>
        </DataTableRow>
        <DataTableRow textValue="Manager B">
          <DataTableCell><DataTablePerson name="Manager B" initials="MB" /></DataTableCell>
        </DataTableRow>
      </DataTableBody>
    </DataTable>
  )
};

/** Count columns are centred with tabular figures; a title stacks over its author and date. */
export const NumericColumns: Story = {
  name: 'Numeric columns',
  render: () => (
    <DataTable aria-label="Inputs" sortDescriptor={{column: 'comments', direction: 'descending'}}>
      <DataTableHeader>
        <DataTableColumn id="idea" isRowHeader allowsSorting>Idea</DataTableColumn>
        <DataTableColumn id="likes" align="number" allowsSorting>Likes</DataTableColumn>
        <DataTableColumn id="comments" align="number" allowsSorting>Comments</DataTableColumn>
      </DataTableHeader>
      <DataTableBody>
        {[['Covered bike parking at the station', 'Resident A · 1 week ago', 176, 11],
          ['More frequent buses on the north line', 'Resident D · 2 weeks ago', 142, 9],
          ['A pocket park on the old depot site', 'Manager B · 3 weeks ago', 18, 7]].map(([t, s, l, c]) => (
          <DataTableRow key={t} textValue={String(t)}>
            <DataTableCell><DataTableStack isStrong sub={s}>{t}</DataTableStack></DataTableCell>
            <DataTableCell align="number">{l}</DataTableCell>
            <DataTableCell align="number">{c}</DataTableCell>
          </DataTableRow>
        ))}
      </DataTableBody>
    </DataTable>
  )
};

/** Each row's "…" opens its options menu. */
export const RowOptions: Story = {name: 'Row options', render: () => <PeopleTable />};

export const Empty: Story = {render: () => <PeopleTable empty selectable />};

// ── Edge cases: what a list meets besides a page of rows (0, 1, 1,000; loading, error, no permission) ────────────
// Carbon's empty states and AgDS's data loading are the benchmarks. The empty body takes an Empty state, one of four
// kinds: nothing yet, nothing matches, it can't load, you may not see it. A first load has no rows to keep; a refresh
// keeps them while it fetches, and a refresh that fails keeps them and says so above.

function UsersTable({rows, empty, busy, pageSize}: {
  rows: readonly ListPerson[];
  empty?: ReactNode;
  busy?: boolean;
  pageSize?: number;
}) {
  const [page, setPage] = useState(1);
  const shown = pageSize ? rows.slice((page - 1) * pageSize, page * pageSize) : rows;
  const count = useNumberFormatter().format(rows.length);
  return (
    <div style={{maxWidth: 900}}>
      <Panel title="Registered users" isFlush toolbar={<TableToolbar heading={`${count} ${rows.length === 1 ? 'user' : 'users'}`} />}
        footer={pageSize && rows.length > pageSize
          ? <Pagination page={page} pageCount={Math.ceil(rows.length / pageSize)} onPageChange={setPage} aria-label="User pages" />
          : undefined}>
        <div aria-busy={busy || undefined}>
          <DataTable aria-label="Users">
            <DataTableHeader>
              <DataTableColumn id="name" isRowHeader>Name</DataTableColumn>
              <DataTableColumn id="role">Role</DataTableColumn>
              <DataTableColumn id="ideas" align="number">Ideas</DataTableColumn>
              <DataTableColumn id="joined">Joined</DataTableColumn>
              <DataTableColumn id="options" align="options" showLabel={false}>Options</DataTableColumn>
            </DataTableHeader>
            <DataTableBody items={shown} renderEmptyState={() => empty}>
              {p => <DataTableRow id={p.id} textValue={p.name}><PersonCells person={p} /></DataTableRow>}
            </DataTableBody>
          </DataTable>
        </div>
      </Panel>
    </div>
  );
}

const ONE_PERSON = inventPeople(1);
const THOUSAND_PEOPLE = inventPeople(1000);
const SOME_PEOPLE = inventPeople(6);

/** No rows yet, the first kind: what will fill the list, and the one way to start it. */
export const NoRows: Story = {
  name: 'Empty · nothing yet',
  render: () => (
    <UsersTable rows={[]} empty={(
      <EmptyState layout="panel" icon={<Users size={24} />} title="No registered users yet"
        description="People appear here once they sign up on the platform."
        actions={<Button variant="secondary">Invite people</Button>} />
    )} />
  )
};

/** Nothing matches the search or the filters, the second kind: the list isn't empty, the view is. One way back. */
export const NoResults: Story = {
  name: 'Empty · no results',
  render: () => (
    <UsersTable rows={[]} empty={(
      <EmptyState layout="panel" icon={<SearchX size={24} />} title="No users match “Riverside”"
        description="Check the spelling, or clear the filters to see everyone."
        actions={<Button variant="secondary">Clear filters</Button>} />
    )} />
  )
};

/** One row: the count says "1 user", the header and the "…" column keep their widths. */
export const OneRow: Story = {name: '1 row', render: () => <UsersTable rows={ONE_PERSON} />};

/**
 * 1,000 rows, 25 a page: the count says the whole list, the Pagination walks it. Past about 200 rows on one page, use
 * `isVirtualized` instead (the "Virtualized · 5,000 people" story).
 */
export const ThousandRows: Story = {name: '1,000 rows', render: () => <UsersTable rows={THOUSAND_PEOPLE} pageSize={25} />};

const LOADING_ROWS = Array.from({length: 5}, (_, i) => i);

/**
 * First load: nothing to show yet, so the rows are Skeleton placeholders in the table's own columns (it keeps its
 * shape, nothing jumps when the rows arrive) and the table is `aria-busy`. The count waits for the rows.
 */
export const FirstLoad: Story = {
  name: 'Loading · first load',
  render: () => (
    <div style={{maxWidth: 900}}>
      <Panel title="Registered users" isFlush toolbar={<TableToolbar heading={<Skeleton width={72} />} />}>
        <div aria-busy="true">
          <DataTable aria-label="Users">
            <DataTableHeader>
              <DataTableColumn id="name" isRowHeader>Name</DataTableColumn>
              <DataTableColumn id="role">Role</DataTableColumn>
              <DataTableColumn id="ideas" align="number">Ideas</DataTableColumn>
              <DataTableColumn id="joined">Joined</DataTableColumn>
            </DataTableHeader>
            <DataTableBody items={LOADING_ROWS.map(id => ({id}))}>
              {row => (
                <DataTableRow id={row.id} textValue="Loading">
                  <DataTableCell><Skeleton width={`${56 + (row.id % 3) * 12}%`} /></DataTableCell>
                  <DataTableCell><Skeleton width="64%" /></DataTableCell>
                  <DataTableCell align="number"><Skeleton width={24} /></DataTableCell>
                  <DataTableCell><Skeleton width="72%" /></DataTableCell>
                </DataTableRow>
              )}
            </DataTableBody>
          </DataTable>
        </div>
      </Panel>
    </div>
  )
};

/**
 * Refresh: the rows stay where they are while the list fetches again (a filter changed, a save came back), and the
 * table is `aria-busy`. No skeletons: replacing rows someone is reading with placeholders loses their place.
 */
export const Refreshing: Story = {name: 'Loading · refresh', render: () => <UsersTable rows={SOME_PEOPLE} busy />};

/** The list can't load, the third kind: say what happened in plain words and offer to try again. */
export const LoadError: Story = {
  name: 'Error · first load',
  render: () => (
    <UsersTable rows={[]} empty={(
      <EmptyState layout="panel" icon={<TriangleAlert size={24} />} title="The users couldn't load"
        description="Something went wrong on our side. Your data is safe."
        actions={<Button variant="secondary">Try again</Button>} />
    )} />
  )
};

/** A refresh that fails keeps the rows it had and says so above them, with a way to try again. */
export const RefreshError: Story = {
  name: 'Error · refresh',
  render: () => (
    <div style={{display: 'grid', gap: 12, maxWidth: 900}}>
      <Banner tone="warning" title="The list couldn't refresh" linkLabel="Try again" onLinkPress={() => {}}>
        These are the users as they were a minute ago.
      </Banner>
      <UsersTable rows={SOME_PEOPLE} />
    </div>
  )
};

/** You may not see this list, the fourth kind: say who can grant it. No rows, no count of what is hidden. */
export const NoPermission: Story = {
  name: 'No permission',
  render: () => (
    <UsersTable rows={[]} empty={(
      <EmptyState layout="panel" icon={<Lock size={24} />} title="You can't see the registered users"
        description="Only platform admins can see this list. Ask one to give you access." />
    )} />
  )
};

// ── Cells: thumbnails, assignees, tags, the Projects list ─────────────────────────────────────────
const FEW = MANAGE_IDEAS.slice(0, 6);
// Nobody sorts after every name, whichever the direction.
const byAssignee = (a: ManageIdea, b: ManageIdea, sign: number) =>
  !a.assignee || !b.assignee ? Number(!a.assignee) - Number(!b.assignee) : sign * a.assignee.localeCompare(b.assignee);

/**
 * A picture before the title (the Manage table's idea image): `DataTableText`'s `leading` takes a
 * `DataTableThumbnail`, a 32 rounded square. Rows without a picture start their text at the cell's edge, as in the
 * prototype.
 */
export const WithThumbnails: Story = {
  name: 'With thumbnails',
  render: () => (
    <div style={{maxWidth: 760}}>
      <DataTable aria-label="Ideas">
        <DataTableHeader>
          <DataTableColumn isRowHeader>Idea</DataTableColumn>
          <DataTableColumn>Published</DataTableColumn>
          <DataTableColumn align="number">Likes</DataTableColumn>
        </DataTableHeader>
        <DataTableBody>
          {FEW.map(i => (
            <DataTableRow key={i.id} id={i.id} textValue={i.title}>
              <DataTableCell>
                <DataTableText lines={2} leading={i.picture && <DataTableThumbnail src={i.picture} />}>{i.title}</DataTableText>
              </DataTableCell>
              <DataTableCell isMuted><When iso={i.published} isShort /></DataTableCell>
              <DataTableCell align="number">{i.likes}</DataTableCell>
            </DataTableRow>
          ))}
        </DataTableBody>
      </DataTable>
    </div>
  )
};

/**
 * Who handles each idea: `DataTableAssignee`, the Avatar and the name; nobody is the dashed ring and "Unassigned" in
 * quieter words. Sortable by name.
 */
export const AssigneeColumn: Story = {
  name: 'Assignee column',
  render: () => {
    const [sort, setSort] = useState<SortDescriptor>({column: 'assignee', direction: 'ascending'});
    const rows = [...FEW].sort((a, b) => byAssignee(a, b, sort.direction === 'descending' ? -1 : 1));
    return (
      <div style={{maxWidth: 760}}>
        <DataTable aria-label="Ideas" sortDescriptor={sort} onSortChange={d => setSort(d as SortDescriptor)}>
          <DataTableHeader>
            <DataTableColumn isRowHeader>Idea</DataTableColumn>
            <DataTableColumn id="assignee" allowsSorting>Assignee</DataTableColumn>
          </DataTableHeader>
          <DataTableBody>
            {rows.map(i => (
              <DataTableRow key={i.id} id={i.id} textValue={i.title}>
                <DataTableCell><DataTableText lines={1}>{i.title}</DataTableText></DataTableCell>
                <DataTableCell><DataTableAssignee name={i.assignee} initials={i.assignee?.slice(-1)} /></DataTableCell>
              </DataTableRow>
            ))}
          </DataTableBody>
        </DataTable>
      </div>
    );
  }
};

/**
 * Tags: the first two as Badges, each clipped at 96, then "+N" for the rest, which names them on hover and to screen
 * readers ("Cycling, Environment and Transport, Safety").
 */
export const TagsColumn: Story = {
  name: 'Tags column (+N)',
  render: () => (
    <div style={{maxWidth: 760}}>
      <DataTable aria-label="Ideas">
        <DataTableHeader>
          <DataTableColumn isRowHeader>Idea</DataTableColumn>
          <DataTableColumn>Tags</DataTableColumn>
        </DataTableHeader>
        <DataTableBody>
          {[...FEW.slice(0, 4), {...FEW[4], tags: ['Public space and greenery', 'Environment', 'Culture']}].map(i => (
            <DataTableRow key={i.id} id={i.id} textValue={i.title}>
              <DataTableCell><DataTableText lines={1}>{i.title}</DataTableText></DataTableCell>
              <DataTableCell>{i.tags.length ? <DataTableTags items={i.tags} /> : <span style={{color: 'var(--gv-text-tertiary)'}}>–</span>}</DataTableCell>
            </DataTableRow>
          ))}
        </DataTableBody>
      </DataTable>
    </div>
  )
};

// Invented projects, as the prototype's Projects list draws them.
const PROJECTS = [
  {id: 'p1', name: 'A renewed riverside park', folder: '', people: 0, phase: 'Collect ideas', manager: undefined, published: false, who: 'Admins and managers', tone: 'teal' as const, icon: <MapPin />},
  {id: 'p2', name: 'Reimagine the old depot site', folder: '', people: 170, phase: 'Collect ideas', manager: undefined, published: true, who: 'Anyone', tone: 'teal' as const, icon: <MapPin />},
  {id: 'p3', name: 'Public health options survey', folder: '', people: 2, phase: 'Information', manager: 'Manager B', published: false, who: 'Anyone', tone: 'teal' as const, icon: <ClipboardList />},
  {id: 'p4', name: 'Your view on the tram extension', folder: '', people: 0, phase: 'Ended', manager: undefined, published: true, who: 'Anyone', tone: 'blue' as const, icon: <MapIcon />},
  {id: 'p5', name: 'Community assemblies', folder: 'Neighbourhood forums', people: 701, phase: 'Ended', manager: undefined, published: false, who: 'Anyone', tone: 'teal' as const, icon: <Users />},
  {id: 'p6', name: 'Showroom', folder: 'Participation garage', people: 8, phase: 'Volunteering', manager: 'Manager C', published: true, who: 'Anyone', tone: 'blue' as const, icon: <Users />}
];

/**
 * The Projects list's cells, in a framed table: the project's icon tile (a `DataTableThumbnail` with an icon) before
 * its name and folder, participants, the current phase, the manager ("Not assigned" when nobody), and the visibility
 * as a Status badge over who can see it. Pagination goes under it (the decision: every admin table pages).
 */
export const ProjectsListCells: Story = {
  name: 'Projects list cells',
  render: () => (
    <div style={{display: 'grid', gap: 12, maxWidth: 980}}>
      <DataTable aria-label="Projects" isFramed>
        <DataTableHeader>
          <DataTableColumn isRowHeader>Project</DataTableColumn>
          <DataTableColumn align="number">Participants</DataTableColumn>
          <DataTableColumn>Current phase</DataTableColumn>
          <DataTableColumn>Manager</DataTableColumn>
          <DataTableColumn>Visibility</DataTableColumn>
          <DataTableColumn align="options" showLabel={false}>Options</DataTableColumn>
        </DataTableHeader>
        <DataTableBody>
          {PROJECTS.map(p => (
            <DataTableRow key={p.id} id={p.id} textValue={p.name}>
              <DataTableCell>
                <DataTableStack leading={<DataTableThumbnail icon={p.icon} color={p.tone} />} sub={p.folder || undefined}>{p.name}</DataTableStack>
              </DataTableCell>
              <DataTableCell align="number">{p.people}</DataTableCell>
              <DataTableCell>{p.phase}</DataTableCell>
              <DataTableCell><DataTableAssignee name={p.manager} size={28} emptyLabel="Not assigned" /></DataTableCell>
              <DataTableCell>
                <DataTableStack sub={p.who}>
                  <StatusBadge status={p.published ? 'live' : 'draft'}>{p.published ? 'Published' : 'Draft'}</StatusBadge>
                </DataTableStack>
              </DataTableCell>
              <DataTableCell align="options">
                <DataTableOptions aria-label={`Options for ${p.name}`}>
                  <MenuItem>Edit</MenuItem>
                  <MenuItem>Copy</MenuItem>
                  <MenuItem>Delete</MenuItem>
                </DataTableOptions>
              </DataTableCell>
            </DataTableRow>
          ))}
        </DataTableBody>
      </DataTable>
      <Pagination page={1} pageCount={4} aria-label="Project pages" style={{justifySelf: 'end'}} />
    </div>
  )
};

// ── The phase Manage tab's input table ────────────────────────────────────────────────────────────
// Invented ideas on invented streets and places.
const STATUSES = ['Proposed', 'Viewed', 'Under consideration', 'Accepted', 'Implemented', 'Rejected'] as const;
const IDEAS: {id: string; text: string; status: (typeof STATUSES)[number]; likes: number; comments: number; warning?: string}[] = [
  {id: 'i1', text: 'Organise open-air cinema nights on Wrenfield Avenue in summer. It would be a great way for neighbours to meet.', status: 'Viewed', likes: 41, comments: 6, warning: 'Possible personal data'},
  {id: 'i2', text: 'Build rain gardens along the north district so the street stops flooding after every heavy storm.', status: 'Rejected', likes: 12, comments: 3},
  {id: 'i3', text: 'Separate the bike lane from car traffic along Quillmoor Road: right now cyclists share the road with buses and it feels unsafe, especially near the school at drop-off time. A protected lane would make a huge difference.', status: 'Proposed', likes: 88, comments: 19},
  {id: 'i4', text: 'Widen the pavement on Tamsel Park. With prams, wheelchairs and shop terraces there is simply not enough room.', status: 'Under consideration', likes: 35, comments: 7},
  {id: 'i5', text: 'Set up a repair café near Tamsel Park where people can fix bikes, clothes and small appliances instead of throwing them away.', status: 'Viewed', likes: 27, comments: 4},
  {id: 'i6', text: 'Give Brindle Street a car-free Sunday once a month so children can play in the street safely.', status: 'Implemented', likes: 64, comments: 11},
  {id: 'i7', text: 'Create a safe school route from the ring road with crossing guards in the morning.', status: 'Accepted', likes: 52, comments: 8},
  {id: 'i8', text: 'Add charging points for e-bikes and e-scooters on the ring road.', status: 'Proposed', likes: 9, comments: 1},
  {id: 'i9', text: 'Host a yearly neighbourhood festival at the central library with food from the different communities living here.', status: 'Under consideration', likes: 47, comments: 15},
  {id: 'i10', text: 'Add a raised pedestrian crossing on Hollowbrook Square. Cars come round the corner far too fast and older residents are nervous crossing there.', status: 'Viewed', likes: 71, comments: 12, warning: 'Reported by a resident'},
  {id: 'i11', text: 'Fix the uneven cobblestones on Orchard Reach. People trip on them all the time, especially after rain.', status: 'Proposed', likes: 23, comments: 5},
  {id: 'i12', text: 'Open a small neighbourhood library box near the central library where people can swap books.', status: 'Implemented', likes: 18, comments: 2}
];
type Idea = (typeof IDEAS)[number];

const STATUS_FACET = IDEA_FACETS.filter(f => f.id === 'status');

function ManageTable() {
  const [query, setQuery] = useState('');
  const [filter, setFilter] = useState<FilterValue>({});
  const [sort, setSort] = useState<SortDescriptor>({column: 'text', direction: 'ascending'});
  const [extra, setExtra] = useState<Set<string | number>>(new Set());
  const [selected, setSelected] = useState<'all' | Iterable<string | number>>(new Set());
  const [opened, setOpened] = useState<Idea | undefined>();
  const statuses = filter.status ?? [];
  const rows = useMemo(() => {
    const q = query.toLowerCase();
    const found = IDEAS.filter(i => i.text.toLowerCase().includes(q) && (statuses.length === 0 || statuses.includes(i.status)));
    const key = sort.column as 'text' | 'status' | 'likes' | 'comments';
    const sign = sort.direction === 'descending' ? -1 : 1;
    return found.sort((a, b) => sign * (typeof a[key] === 'number'
      ? (a[key] as number) - (b[key] as number) : String(a[key]).localeCompare(String(b[key]))));
  }, [query, statuses, sort]);
  return (
    <div style={{display: 'grid', gap: 8, maxWidth: 760}}>
      <TableToolbar heading={`${rows.length} ideas`}>
        <SearchField isCollapsible aria-label="Search ideas" placeholder="Search" value={query} onChange={setQuery} />
        <FilterMenu facets={STATUS_FACET} value={filter} onChange={setFilter} aria-label="Filter ideas" />
      </TableToolbar>
      <FilterChips facets={STATUS_FACET} value={filter} onChange={setFilter} />
      <DataTable aria-label="Ideas" density="compact" showChecksOnHover selectionMode="multiple"
        selectedKeys={selected} onSelectionChange={k => setSelected(k as typeof selected)}
        onRowAction={key => setOpened(IDEAS.find(i => i.id === key))} openKey={opened?.id}
        sortDescriptor={sort} onSortChange={d => setSort(d as SortDescriptor)}
        addColumn={(
          <DataTableAddColumn selectedKeys={extra} onSelectionChange={setExtra}>
            <MenuItem id="likes">Likes</MenuItem>
            <MenuItem id="comments">Comments</MenuItem>
          </DataTableAddColumn>
        )}>
        <DataTableHeader>
          <DataTableColumn id="text" isRowHeader allowsSorting>Idea</DataTableColumn>
          <DataTableColumn id="status" allowsSorting>Status</DataTableColumn>
          {extra.has('likes') && <DataTableColumn id="likes" align="number" allowsSorting>Likes</DataTableColumn>}
          {extra.has('comments') && <DataTableColumn id="comments" align="number" allowsSorting>Comments</DataTableColumn>}
        </DataTableHeader>
        <DataTableBody renderEmptyState={() => <DataTableEmpty>No inputs match</DataTableEmpty>}>
          {rows.map(i => (
            <DataTableRow key={i.id} id={i.id} textValue={i.text}>
              <DataTableCell>
                <DataTableText marks={i.warning && <TriangleAlert size={16} aria-label={`Content warning: ${i.warning}`} role="img" />}>
                  {i.text}
                </DataTableText>
              </DataTableCell>
              <DataTableCell isMuted><span style={{whiteSpace: 'nowrap'}}>{i.status}</span></DataTableCell>
              {extra.has('likes') && <DataTableCell align="number">{i.likes}</DataTableCell>}
              {extra.has('comments') && <DataTableCell align="number">{i.comments}</DataTableCell>}
            </DataTableRow>
          ))}
        </DataTableBody>
      </DataTable>
      <p role="status" style={{font: 'var(--gv-type-small)', color: 'var(--gv-text-secondary)', margin: 0}}>
        {opened ? `Opened: ${opened.text.split('.')[0]}` : 'Click a row to open the input; tick its box to select it.'}
      </p>
    </div>
  );
}

/**
 * The phase Manage tab's input table: compact wrapping rows (up to three lines), a content-warning mark after the
 * idea, the quiet Status word, checkboxes on hover or once checked, sortable Idea and Status, a "+" that adds
 * Likes / Comments columns, and a row click that opens the input (marked by `openKey`), ticked rows or not. Above it, a
 * Table toolbar: the count follows the collapsible search and the status filter, which drive the rows the table is
 * given.
 */
export const ManageInputs: Story = {name: 'Manage inputs', render: () => <ManageTable />};


// ── The whole Manage table, in a Panel ─────────────────────────────────────────────────────────────
const PAGE_SIZE = 8;
type IdeaKey = 'title' | 'assignee' | 'status' | 'likes' | 'comments' | 'published';

function sortIdeas(list: ManageIdea[], sort: SortDescriptor) {
  const key = sort.column as IdeaKey;
  const sign = sort.direction === 'descending' ? -1 : 1;
  return [...list].sort((a, b) => {
    if (key === 'assignee') return byAssignee(a, b, sign);
    const x = a[key], y = b[key];
    return sign * (typeof x === 'number' && typeof y === 'number' ? x - y : String(x).localeCompare(String(y)));
  });
}

function ManagePanel() {
  const [query, setQuery] = useState('');
  const [filter, setFilter] = useState<FilterValue>({status: ['Proposed', 'Viewed', 'Under consideration']});
  const [metric, setMetric] = useState<Metric | undefined>();
  const [sort, setSort] = useState<SortDescriptor>({column: 'likes', direction: 'descending'});
  const [page, setPage] = useState(1);
  const [extra, setExtra] = useState<Set<string | number>>(new Set(['comments']));
  const [selected, setSelected] = useState<Set<string | number>>(new Set());
  const [said, setSaid] = useState('Click a row to open the idea.');

  // A new search, filter or quick view starts again from the first page.
  const fresh = <T,>(set: (v: T) => void) => (v: T) => { set(v); setPage(1); };
  const found = useMemo(() => sortIdeas(filterIdeas(MANAGE_IDEAS, {query, value: filter, metric}), sort), [query, filter, metric, sort]);
  const pageCount = Math.max(1, Math.ceil(found.length / PAGE_SIZE));
  const current = Math.min(page, pageCount);
  const rows = found.slice((current - 1) * PAGE_SIZE, current * PAGE_SIZE);
  const actions = metric === 'warnings' ? [...IDEA_ACTIONS, DISMISS_WARNINGS] : IDEA_ACTIONS;
  const total = (m: Metric) => MANAGE_IDEAS.filter(METRICS[m].test).length;

  return (
    <div style={{display: 'grid', gap: 16, maxWidth: 1080}}>
      <div style={{display: 'grid', gridTemplateColumns: 'repeat(3, minmax(0, 1fr))', gap: 12}}>
        {(Object.keys(METRICS) as Metric[]).map(m => (
          <StatCard key={m} label={METRICS[m].label} value={String(total(m))}
            caption={metric === m ? 'Showing these below' : 'Show these below'}
            onPress={() => fresh(setMetric)(metric === m ? undefined : m)} />
        ))}
      </div>
      <Panel title="Collect ideas" description="Everything posted in this phase. Select ideas for batch actions; click one to open it." isFlush
        actions={<Button variant="secondary" size={32}><Plus aria-hidden size={16} />Add input</Button>}
        toolbar={(
          <>
            <TableToolbar start={(
              <SelectionBar count={selected.size} items={actions} onClear={() => setSelected(new Set())}
                onAction={id => { setSaid(id === 'dismiss-warnings' ? `Dismissed the warnings on ${ideaCount(selected.size)}.` : `Official update for ${ideaCount(selected.size)}.`); }}>
                <TableToolbarHeading>{ideaCount(found.length)}</TableToolbarHeading>
              </SelectionBar>
            )}>
              <SearchField isCollapsible aria-label="Search ideas" placeholder="Search" value={query} onChange={fresh(setQuery)} />
              <FilterMenu facets={IDEA_FACETS} value={filter} onChange={fresh(setFilter)} countLabel={ideaCount} />
              <ExportMenu selected={selected.size} onExport={what => setSaid(`Export started: ${what}.xlsx`)} />
            </TableToolbar>
            <FilterChips facets={IDEA_FACETS} value={filter} onChange={fresh(setFilter)}
              metric={metric && METRICS[metric].label} onMetricRemove={() => fresh(setMetric)(undefined)} />
          </>
        )}
        footer={<Pagination page={current} pageCount={pageCount} onPageChange={setPage} aria-label="Idea pages" />}>
        <DataTable aria-label="Ideas" showChecksOnHover selectionMode="multiple"
          selectedKeys={selected} onSelectionChange={k => setSelected(toKeySet(k, [...selected, ...rows.map(r => r.id)]))}
          sortDescriptor={sort} onSortChange={d => setSort(d as SortDescriptor)}
          addColumn={(
            <DataTableAddColumn selectedKeys={extra} onSelectionChange={setExtra}>
              <MenuItem id="comments">Comments</MenuItem>
              <MenuItem id="published">Published</MenuItem>
            </DataTableAddColumn>
          )}>
          <DataTableHeader>
            <DataTableColumn id="title" isRowHeader allowsSorting>Idea</DataTableColumn>
            <DataTableColumn id="assignee" allowsSorting>Assignee</DataTableColumn>
            <DataTableColumn id="tags">Tags</DataTableColumn>
            <DataTableColumn id="status" allowsSorting>Status</DataTableColumn>
            <DataTableColumn id="likes" align="number" allowsSorting>Likes</DataTableColumn>
            {extra.has('comments') && <DataTableColumn id="comments" align="number" allowsSorting>Comments</DataTableColumn>}
            {extra.has('published') && <DataTableColumn id="published" allowsSorting>Published</DataTableColumn>}
          </DataTableHeader>
          <DataTableBody renderEmptyState={() => <DataTableEmpty>No ideas match. Clear the filters to see them all.</DataTableEmpty>}>
            {rows.map(i => (
              <DataTableRow key={i.id} id={i.id} textValue={i.title} onAction={() => setSaid(`Opened: ${i.title}`)}>
                <DataTableCell>
                  <DataTableText lines={2} leading={i.picture && <DataTableThumbnail src={i.picture} />}
                    marks={(i.isNew || i.warnings) && <>
                      {i.isNew && <NewDot aria-label="New" />}
                      {i.warnings && <TriangleAlert size={16} role="img" aria-label={`${i.warnings} content ${i.warnings === 1 ? 'warning' : 'warnings'}`} />}
                    </>}>
                    {i.title}
                  </DataTableText>
                </DataTableCell>
                <DataTableCell><DataTableAssignee name={i.assignee} initials={i.assignee?.slice(-1)} /></DataTableCell>
                <DataTableCell>{i.tags.length ? <DataTableTags items={i.tags} /> : null}</DataTableCell>
                <DataTableCell isMuted><span style={{whiteSpace: 'nowrap'}}>{i.status}</span></DataTableCell>
                <DataTableCell align="number">{i.likes}</DataTableCell>
                {extra.has('comments') && <DataTableCell align="number">{i.comments}</DataTableCell>}
                {extra.has('published') && <DataTableCell isMuted><span style={{whiteSpace: 'nowrap'}}><When iso={i.published} isShort /></span></DataTableCell>}
              </DataTableRow>
            ))}
          </DataTableBody>
        </DataTable>
      </Panel>
      <p role="status" style={{margin: 0, font: 'var(--gv-type-small)', color: 'var(--gv-text-secondary)'}}>{said}</p>
    </div>
  );
}

/**
 * The Manage tab's table whole, everything working: the quick views above (each a stat; pressing one filters the
 * table and adds its chip), a Panel with the phase, its description and "Add input"; in its toolbar row the count
 * (it follows the search, filters and quick view), the collapsible search, the Filter menu with its dot and the
 * export; the filter chips with the quick view's chip first; the table with pictures, new and warning marks,
 * assignees, tags, sortable columns, checks on hover and a "+" for more columns; and the Pagination in the foot.
 * Select rows and the Selection bar takes the count's place ("Dismiss warnings" joins it in the Content warnings
 * view). Click a row: the line under the panel says what opened.
 */
export const InAPanel: Story = {name: 'In a panel', render: () => <ManagePanel />};

// ── Bulk selection and an open row, with a Side panel ─────────────────────────────────────────────
const OPEN_LIST = MANAGE_IDEAS.slice(0, 10);
const rowOf = (id: string) => document.querySelector<HTMLElement>(`[aria-label="Ideas"] [role="row"][data-key="${id}"]`);

function BulkAndOpen() {
  const [selected, setSelected] = useState<Set<string | number>>(new Set(['idea-2', 'idea-5']));
  const [open, setOpen] = useState<string | null>('idea-3');
  const [said, setSaid] = useState('');
  const at = OPEN_LIST.findIndex(i => i.id === open);
  const idea = at >= 0 ? OPEN_LIST[at] : undefined;
  return (
    <div style={{minHeight: '100vh', boxSizing: 'border-box', padding: 24, background: 'var(--gv-surface-app)'}}>
      <div style={{display: 'grid', gap: 8, width: 720}}>
        <Panel title="Collect ideas" isFlush
          toolbar={(
            <TableToolbar start={(
              <SelectionBar count={selected.size} items={IDEA_ACTIONS} onClear={() => setSelected(new Set())}
                onAction={id => setSaid(`${id} for ${ideaCount(selected.size)}`)}>
                <TableToolbarHeading>{ideaCount(OPEN_LIST.length)}</TableToolbarHeading>
              </SelectionBar>
            )} />
          )}>
          <DataTable aria-label="Ideas" selectionMode="multiple"
            selectedKeys={selected} onSelectionChange={k => setSelected(toKeySet(k, OPEN_LIST.map(i => i.id)))}
            onRowAction={key => setOpen(String(key))} openKey={open}>
            <DataTableHeader>
              <DataTableColumn id="title" isRowHeader>Idea</DataTableColumn>
              <DataTableColumn id="assignee">Assignee</DataTableColumn>
              <DataTableColumn id="likes" align="number">Likes</DataTableColumn>
            </DataTableHeader>
            <DataTableBody>
              {OPEN_LIST.map(i => (
                <DataTableRow key={i.id} id={i.id} textValue={i.title}>
                  <DataTableCell><DataTableText lines={1}>{i.title}</DataTableText></DataTableCell>
                  <DataTableCell><DataTableAssignee name={i.assignee} initials={i.assignee?.slice(-1)} /></DataTableCell>
                  <DataTableCell align="number">{i.likes}</DataTableCell>
                </DataTableRow>
              ))}
            </DataTableBody>
          </DataTable>
        </Panel>
        <p role="status" style={{margin: 0, font: 'var(--gv-type-small)', color: 'var(--gv-text-secondary)'}}>{said}</p>
      </div>
      <SidePanel isOpen={idea !== undefined} label="Collect ideas" labels={{previous: 'Previous idea', next: 'Next idea'}}
        position={idea ? {current: at + 1, total: OPEN_LIST.length} : undefined}
        onPositionChange={n => setOpen(OPEN_LIST[n - 1].id)}
        onOpenChange={o => !o && setOpen(null)}
        returnFocus={() => (open ? rowOf(open) : null)}>
        {idea && (
          <SidePanelSection>
            <SidePanelRecordHead author={idea.author}
              date={<When iso={idea.published} />}>
              {idea.title}
            </SidePanelRecordHead>
          </SidePanelSection>
        )}
      </SidePanel>
    </div>
  );
}

/**
 * Bulk selection and an open row on one table, with the Side panel beside it. Tick rows with their checkboxes (or
 * Space, or a Shift / ⌘ / Ctrl click): the Selection bar takes the count's place. Click a row (or Enter on it) to open
 * it in the panel, ticked rows or not: `onRowAction` opens, `openKey` marks the open row (tint, start bar,
 * `aria-current`). The pager walks the list and the mark follows; Esc or × closes the panel back to the row. The
 * selection is `toKeySet(selection, allKeys)`, which turns the header's "all" into keys.
 */
export const WithBulkSelectionAndAnOpenRow: Story = {
  name: 'With bulk selection and an open row',
  parameters: {layout: 'fullscreen', docs: {story: {inline: false, iframeHeight: 720}}},
  render: () => <BulkAndOpen />
};

// ── Long lists: virtualised ──────────────────────────────────────────────────────────────────────
const USER_ACTIONS = [
  {id: 'group', label: 'Add to group', icon: <UserPlus aria-hidden size={16} />},
  {id: 'export', label: 'Export', icon: <Download aria-hidden size={16} />}
];
const usersWord = (n: number, number: Intl.NumberFormat) => `${number.format(n)} ${n === 1 ? 'user' : 'users'}`;

function PersonCells({person}: {person: ListPerson}) {
  return (
    <>
      <DataTableCell><DataTablePerson name={person.name} initials={person.initials} sub={person.email} /></DataTableCell>
      <DataTableCell>{person.role}</DataTableCell>
      <DataTableCell align="number">{person.ideas}</DataTableCell>
      <DataTableCell><When iso={person.joined} /></DataTableCell>
      <DataTableCell align="options">
        <DataTableOptions aria-label={`Options for ${person.name}`}>
          <MenuItem>Add to group</MenuItem>
          <MenuItem>Block user</MenuItem>
        </DataTableOptions>
      </DataTableCell>
    </>
  );
}

function VirtualPeople() {
  // Generated once per mount (a few milliseconds); each rendered row writes its date in the story's locale.
  const people = useMemo(() => inventPeople(5000), []);
  const [sort, setSort] = useState<SortDescriptor>({column: 'name', direction: 'ascending'});
  const [selected, setSelected] = useState<Set<Key>>(new Set());
  const [open, setOpen] = useState<string | null>(null);
  const [said, setSaid] = useState('Click a row to open the person; tick boxes for bulk actions.');
  const rows = useMemo(() => sortList(people, String(sort.column), sort.direction), [people, sort]);
  const number = useNumberFormatter();
  const at = open == null ? -1 : rows.findIndex(p => p.id === open);
  const person = at >= 0 ? rows[at] : undefined;
  return (
    <div style={{minHeight: '100vh', boxSizing: 'border-box', padding: 24, background: 'var(--gv-surface-app)'}}>
      <div style={{display: 'grid', gap: 8, maxWidth: 920}}>
        <Panel title="Registered users" isFlush
          toolbar={(
            <TableToolbar start={(
              <SelectionBar count={selected.size} items={USER_ACTIONS} onClear={() => setSelected(new Set())}
                onAction={id => setSaid(`${id === 'export' ? 'Export' : 'Add to group'}: ${usersWord(selected.size, number)}`)}>
                <TableToolbarHeading>{usersWord(rows.length, number)}</TableToolbarHeading>
              </SelectionBar>
            )} />
          )}>
          <DataTable aria-label="Users" isVirtualized rowLines={2} style={{height: 560}}
            selectionMode="multiple" selectedKeys={selected}
            onSelectionChange={k => setSelected(toKeySet<Key>(k, rows.map(p => p.id)))}
            sortDescriptor={sort} onSortChange={d => setSort(d as SortDescriptor)}
            onRowAction={key => setOpen(String(key))} openKey={open}>
            <DataTableHeader>
              <DataTableColumn id="name" isRowHeader allowsSorting width="2fr">Name</DataTableColumn>
              <DataTableColumn id="role" allowsSorting>Role</DataTableColumn>
              <DataTableColumn id="ideas" align="number" allowsSorting>Ideas</DataTableColumn>
              <DataTableColumn id="joined" allowsSorting>Joined</DataTableColumn>
              <DataTableColumn id="options" align="options" showLabel={false}>Options</DataTableColumn>
            </DataTableHeader>
            <DataTableBody items={rows}>
              {p => <DataTableRow id={p.id} textValue={p.name}><PersonCells person={p} /></DataTableRow>}
            </DataTableBody>
          </DataTable>
        </Panel>
        <p role="status" style={{margin: 0, font: 'var(--gv-type-small)', color: 'var(--gv-text-secondary)'}}>{said}</p>
      </div>
      <SidePanel isOpen={person !== undefined} label="Registered users" labels={{previous: 'Previous user', next: 'Next user'}}
        position={person ? {current: at + 1, total: rows.length} : undefined}
        onPositionChange={n => setOpen(rows[n - 1].id)}
        onOpenChange={o => !o && setOpen(null)}>
        {person && (
          <SidePanelSection>
            <SidePanelRecordHead title={person.name}>{person.email}</SidePanelRecordHead>
            <PropertyList aria-label="Details">
              <PropertyListItem label="Role">{person.role}</PropertyListItem>
              <PropertyListItem label="Ideas">{person.ideas}</PropertyListItem>
              <PropertyListItem label="Joined"><When iso={person.joined} /></PropertyListItem>
            </PropertyList>
          </SidePanelSection>
        )}
      </SidePanel>
    </div>
  );
}

/**
 * A long list, virtualised: 5,000 invented people, of whom the table draws only the few dozen in view (`isVirtualized`).
 * The same table otherwise: sort by any column, tick rows (the header's box ticks all 5,000, which `toKeySet` turns
 * into 5,000 keys), click a row to open it beside the table (`openKey` keeps its mark as it scrolls away and back), and
 * the keyboard walks every row (↑ ↓, Page Up / Down, Home / End). What it needs: a bounded height (`style={{height:
 * 560}}` here), one row height (`rowLines={2}`: a name over an email), rows as `items` with a function, and a `width`
 * on a column that wants more than its even share.
 */
export const Virtualized5000People: Story = {
  name: 'Virtualized · 5,000 people',
  parameters: {layout: 'fullscreen', docs: {story: {inline: false, iframeHeight: 760}}},
  render: () => <VirtualPeople />
};

const PAGE = 100;
const TOTAL = 1000;

function LoadingMore() {
  const [people, setPeople] = useState(() => inventPeople(PAGE));
  const [isLoading, setLoading] = useState(false);
  const busy = useRef(false);
  // A page of 100 arrives 400 ms after the last row comes near the view, up to 1,000 (an invented server).
  const loadMore = useCallback(() => {
    if (busy.current) return;
    busy.current = true;
    setLoading(true);
    setTimeout(() => {
      setPeople(list => [...list, ...inventPeople(PAGE, list.length + 1)]);
      setLoading(false);
      busy.current = false;
    }, 400);
  }, []);
  const hasMore = people.length < TOTAL;
  const number = useNumberFormatter();
  return (
    <div style={{boxSizing: 'border-box', padding: 24, maxWidth: 968}}>
      <Panel title="Registered users" isFlush toolbar={<TableToolbar heading={`${number.format(people.length)} of ${usersWord(TOTAL, number)} loaded`} />}>
        <DataTable aria-label="Users" isVirtualized rowLines={2} style={{height: 480}}>
          <DataTableHeader>
            <DataTableColumn id="name" isRowHeader width="2fr">Name</DataTableColumn>
            <DataTableColumn id="role">Role</DataTableColumn>
            <DataTableColumn id="ideas" align="number">Ideas</DataTableColumn>
            <DataTableColumn id="joined">Joined</DataTableColumn>
            <DataTableColumn id="options" align="options" showLabel={false}>Options</DataTableColumn>
          </DataTableHeader>
          <DataTableBody items={people} onLoadMore={hasMore ? loadMore : undefined} isLoading={isLoading}>
            {p => <DataTableRow id={p.id} textValue={p.name}><PersonCells person={p} /></DataTableRow>}
          </DataTableBody>
        </DataTable>
      </Panel>
    </div>
  );
}

/**
 * A list that arrives in pages as it scrolls (infinite loading): `DataTableBody`'s `onLoadMore` runs when the last row
 * comes near the view, `isLoading` shows "Loading more…" under it while the page fetches, and the new rows join
 * `items`. Pass `onLoadMore` only while more remain. Here 100 at a time, up to 1,000.
 */
export const VirtualizedLoadingMore: Story = {
  name: 'Virtualized · loading more',
  parameters: {layout: 'fullscreen', docs: {story: {inline: false, iframeHeight: 640}}},
  render: () => <LoadingMore />
};

/** Right to left (Arabic): columns, padding, the check column and the "…" mirror. */
export const RightToLeft: Story = {
  name: 'Right to left',
  globals: {direction: 'rtl'},
  render: () => <PeopleTable selectable initialSelection={['a']} initialSort={{column: 'joined', direction: 'descending'}} />
};

/** The keyboard, proved by this story's play function (the Interactions panel): Tab enters the table on a row, the
 * arrows walk the rows, Space ticks the focused row, Tab leaves for the row's "…" and the next control. */
export const Keyboard: Story = {
  render: () => <PeopleTable selectable initialSort={{column: 'name', direction: 'ascending'}} />,
  play: async ({canvasElement}) => {
    const grid = within(canvasElement).getByRole('grid', {name: 'Users'});
    const focusedRow = () => document.activeElement?.closest('[role="row"]');
    const row = (name: string) => within(grid).getByRole('row', {name: new RegExp(name)});
    await userEvent.tab();
    await waitFor(() => expect(focusedRow()).toBe(row('Admin C')));
    await userEvent.keyboard('{ArrowDown}');
    await waitFor(() => expect(focusedRow()).toBe(row('Manager B')));
    await userEvent.keyboard('{ArrowUp}');
    await waitFor(() => expect(focusedRow()).toBe(row('Admin C')));
    await userEvent.keyboard(' ');
    await waitFor(() => expect(row('Admin C')).toHaveAttribute('aria-selected', 'true'));
    await userEvent.keyboard(' ');
    await waitFor(() => expect(row('Admin C')).toHaveAttribute('aria-selected', 'false'));
  }
};
