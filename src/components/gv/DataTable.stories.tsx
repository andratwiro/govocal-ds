import {useMemo, useState} from 'react';
import type {Meta, StoryObj} from '@storybook/react-vite';
import {
  DataTable,
  DataTableBody,
  DataTableCell,
  DataTableColumn,
  DataTableEmpty,
  DataTableHeader,
  DataTableOptions,
  DataTablePerson,
  DataTableRow,
  DataTableStack,
  DataTableText,
  DataTableAddColumn
} from './DataTable';
import {MenuItem, MenuTrigger, Menu} from '../Menu';
import {SearchField} from '../SearchField';
import {IconButton} from './IconButton';
import {ListFilter, Search, TriangleAlert} from 'lucide-react';

type Direction = 'ascending' | 'descending';
type SortDescriptor = {column: string | number; direction: Direction};

const PEOPLE = [
  {id: 'a', name: 'Resident A', initials: 'RA', email: 'user1@example.org', role: 'Registered user', ideas: 12, joined: '2026-10-02'},
  {id: 'b', name: 'Manager B', initials: 'MB', email: 'user2@example.org', role: 'Project manager', ideas: 3, joined: '2026-08-14'},
  {id: 'c', name: 'Admin C', initials: 'AC', email: 'user3@example.org', role: 'Platform admin', ideas: 0, joined: '2025-12-19'},
  {id: 'd', name: 'Resident D', initials: 'RD', email: 'user4@example.org', role: 'Registered user', ideas: 27, joined: '2025-06-12'}
];
type Person = (typeof PEOPLE)[number];

const date = (iso: string) => new Date(iso).toLocaleDateString('en-GB', {day: 'numeric', month: 'long', year: 'numeric'});

function sortPeople(list: Person[], sort: SortDescriptor) {
  const key = sort.column as keyof Person;
  const sign = sort.direction === 'descending' ? -1 : 1;
  return [...list].sort((a, b) => sign * String(a[key]).localeCompare(String(b[key]), undefined, {numeric: true}));
}

function PeopleTable({initialSort, selectable, initialSelection = [], empty}: {
  initialSort?: SortDescriptor;
  selectable?: boolean;
  initialSelection?: string[];
  empty?: boolean;
}) {
  const [sort, setSort] = useState<SortDescriptor | undefined>(initialSort);
  const [selected, setSelected] = useState<'all' | Iterable<string | number>>(new Set(initialSelection));
  const rows = useMemo(() => (empty ? [] : sort ? sortPeople(PEOPLE, sort) : PEOPLE), [sort, empty]);
  return (
    <DataTable aria-label="Users" sortDescriptor={sort} onSortChange={d => setSort(d as SortDescriptor)}
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
            <DataTableCell>{date(p.joined)}</DataTableCell>
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
  title: 'Components/Data display/Data table',
  parameters: {layout: 'padded'},
  tags: ['autodocs', 'not-in-figma']
};
export default meta;
type Story = StoryObj;

/** The prototype's back-office list: quiet headers, hairline rows, no zebra, a person cell and the "…" column. */
export const Default: Story = {render: () => <PeopleTable />};

/** Sortable columns: the sorted one shows its chevron and primary text; press a header to sort or flip. */
export const SortedAscending: Story = {
  name: 'Sorted ascending',
  render: () => <PeopleTable initialSort={{column: 'name', direction: 'ascending'}} />
};

export const SortedDescending: Story = {
  name: 'Sorted descending',
  render: () => <PeopleTable initialSort={{column: 'joined', direction: 'descending'}} />
};

/** Multiple selection with the gv Checkbox; the header checkbox selects all (indeterminate when some are). */
export const SelectableSomeSelected: Story = {
  name: 'Selectable, some selected',
  render: () => <PeopleTable selectable initialSelection={['b', 'c']} initialSort={{column: 'joined', direction: 'descending'}} />
};

/** Selection driven by the page's own select-all control: the header's check column stays empty. */
export const SelectableWithoutSelectAll: Story = {
  name: 'Selectable, without select all',
  render: () => (
    <DataTable aria-label="Users" selectionMode="multiple" defaultSelectedKeys={['a']}>
      <DataTableHeader selectAll={false}>
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
            <DataTableCell><DataTableStack strong sub={s}>{t}</DataTableStack></DataTableCell>
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

/** Right to left (Arabic): columns, padding, the check column and the "…" mirror. */
export const RightToLeft: Story = {
  name: 'Right to left',
  globals: {direction: 'rtl'},
  render: () => <PeopleTable selectable initialSelection={['a']} initialSort={{column: 'joined', direction: 'descending'}} />
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

function ManageTable() {
  const [query, setQuery] = useState('');
  const [searching, setSearching] = useState(false);
  const [statuses, setStatuses] = useState<Set<string | number>>(new Set());
  const [sort, setSort] = useState<SortDescriptor>({column: 'text', direction: 'ascending'});
  const [extra, setExtra] = useState<Set<string | number>>(new Set());
  const [selected, setSelected] = useState<'all' | Iterable<string | number>>(new Set());
  const [opened, setOpened] = useState<Idea | undefined>();
  const rows = useMemo(() => {
    const q = query.toLowerCase();
    const found = IDEAS.filter(i => i.text.toLowerCase().includes(q) && (statuses.size === 0 || statuses.has(i.status)));
    const key = sort.column as 'text' | 'status' | 'likes' | 'comments';
    const sign = sort.direction === 'descending' ? -1 : 1;
    return found.sort((a, b) => sign * (typeof a[key] === 'number'
      ? (a[key] as number) - (b[key] as number) : String(a[key]).localeCompare(String(b[key]))));
  }, [query, statuses, sort]);
  return (
    <div style={{display: 'grid', gap: 8, maxWidth: 760}}>
      <div style={{display: 'flex', alignItems: 'center', gap: 8}}>
        <h3 style={{margin: 0, flex: 1, font: 'var(--gv-type-title)'}}>{rows.length} ideas</h3>
        {searching && <SearchField aria-label="Search ideas" placeholder="Search" value={query} onChange={setQuery} autoFocus />}
        <IconButton variant="bordered" tone="strong" aria-label="Search ideas" aria-pressed={searching}
          onPress={() => { setSearching(s => !s); setQuery(''); }}>
          <Search aria-hidden size={16} />
        </IconButton>
        <MenuTrigger>
          <IconButton variant="bordered" tone="strong" aria-label="Filter ideas"><ListFilter aria-hidden size={16} /></IconButton>
          <Menu aria-label="Filter by status" selectionMode="multiple" selectedKeys={statuses}
            onSelectionChange={k => setStatuses(new Set(k === 'all' ? STATUSES : k))}>
            {STATUSES.map(st => <MenuItem key={st} id={st}>{st}</MenuItem>)}
          </Menu>
        </MenuTrigger>
      </div>
      <DataTable aria-label="Ideas" density="compact" revealChecks selectionMode="multiple"
        selectedKeys={selected} onSelectionChange={k => setSelected(k as typeof selected)}
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
            <DataTableRow key={i.id} id={i.id} textValue={i.text} onAction={() => setOpened(i)}>
              <DataTableCell>
                <DataTableText marks={i.warning && <TriangleAlert size={16} aria-label={`Content warning: ${i.warning}`} role="img" />}>
                  {i.text}
                </DataTableText>
              </DataTableCell>
              <DataTableCell muted><span style={{whiteSpace: 'nowrap'}}>{i.status}</span></DataTableCell>
              {extra.has('likes') && <DataTableCell align="number">{i.likes}</DataTableCell>}
              {extra.has('comments') && <DataTableCell align="number">{i.comments}</DataTableCell>}
            </DataTableRow>
          ))}
        </DataTableBody>
      </DataTable>
      <p role="status" style={{font: 'var(--gv-type-small)', color: 'var(--gv-text-secondary)', margin: 0}}>
        {opened ? `Opened: ${opened.text.split('.')[0]}` : 'Click a row to open the input.'}
      </p>
    </div>
  );
}

/**
 * The phase Manage tab's input table: compact wrapping rows (up to three lines), a content-warning mark after the
 * idea, the quiet Status word, checkboxes on hover or once checked, sortable Idea and Status, a "+" that adds
 * Likes / Comments columns, and a row click that opens the input. Search and the status filter are the page's
 * (the icon buttons above the table), driving the rows it passes in.
 */
export const ManageInputs: Story = {name: 'Manage inputs', render: () => <ManageTable />};
