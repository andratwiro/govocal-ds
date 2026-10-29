import {useMemo, useState, type ComponentProps, type ReactNode} from 'react';
import {ChartColumn, Download, Mail, Plus, ShieldCheck, Users as UsersIcon, Zap} from 'lucide-react';
import {DataTable, DataTableHeader, DataTableColumn, DataTableBody, DataTableRow, DataTableCell, DataTableEmpty,
  DataTablePerson, DataTableStack, DataTableOptions} from '../../../src/components/gv/DataTable';
import {ListBox, ListBoxItem} from '../../../src/components/ListBox';
import {SearchField} from '../../../src/components/SearchField';
import {MenuTrigger, Menu, MenuItem} from '../../../src/components/Menu';
import {Button} from '../../../src/components/Button';
import {Card} from '../../../src/components/gv/Card';
import {Checkbox} from '../../../src/components/gv/Checkbox';
import {GROUPS, PEOPLE, SEGMENTS, type Person} from '../data-users';
import {Gap, GapLegend} from '../Gap';
import {Page} from './Page';

// React Aria's own types, read off the gv DataTable (the back office imports only the system).
type TableProps = ComponentProps<typeof DataTable>;
type Selection = Parameters<NonNullable<TableProps['onSelectionChange']>>[0];
type Sort = {column: 'name' | 'lastActive' | 'joined'; direction: 'ascending' | 'descending'};

const DESCRIPTION = 'Get an overview of all the people and organisations that registered on the platform. ' +
  'Add a selection of users to Manual groups or Smart groups.';

// "Resident E" → "RE".
const initials = (name: string) => name.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase();

function ago(minutes?: number) {
  if (minutes === undefined) return '';
  const units: [number, string][] = [[43200, 'month'], [10080, 'week'], [1440, 'day'], [60, 'hour'], [1, 'minute']];
  const [size, unit] = units.find(([s]) => minutes >= s) ?? [1, 'minute'];
  const n = Math.floor(minutes / size);
  return `${n} ${unit}${n === 1 ? '' : 's'} ago`;
}

const date = (iso: string) => new Date(`${iso}T00:00:00Z`).toLocaleDateString('en-US',
  {month: 'long', day: 'numeric', year: 'numeric', timeZone: 'UTC'});

function inView(view: string): Person[] {
  const group = GROUPS.find(g => g.id === view);
  if (group) return PEOPLE.filter(p => group.members.includes(p.id));
  const roles = SEGMENTS.find(s => s.id === view)?.roles;
  return roles ? PEOPLE.filter(p => roles.includes(p.role)) : PEOPLE;
}

function compare(a: Person, b: Person, column: string) {
  if (column === 'name') return a.name.localeCompare(b.name);
  // Never active sorts as the oldest activity.
  if (column === 'lastActive') return (b.lastActive ?? Number.MAX_SAFE_INTEGER) - (a.lastActive ?? Number.MAX_SAFE_INTEGER);
  return a.joined.localeCompare(b.joined);
}

function Count({label, count, icon, kind}: {label: string; count: number; icon?: ReactNode; kind?: string}) {
  return (
    <span className="bo-users-option">
      {icon}
      <span className="bo-users-option-label">{label}{kind && <span className="bo-visually-hidden"> ({kind})</span>}</span>
      <span className="bo-note">{count}</span>
    </span>
  );
}

function Sidebar({view, setView}: {view: string; setView: (v: string) => void}) {
  const [query, setQuery] = useState('');
  const groups = GROUPS.filter(g => g.label.toLowerCase().includes(query.toLowerCase()));
  const pick = (keys: Selection) => keys !== 'all' && keys.size > 0 && setView(String([...keys][0]));
  return (
    <aside className="bo-users-side">
      <ListBox aria-label="Users" selectionMode="single" selectedKeys={[view]} onSelectionChange={pick}>
        {SEGMENTS.map(s => (
          <ListBoxItem key={s.id} id={s.id} textValue={s.label}><Count label={s.label} count={inView(s.id).length} /></ListBoxItem>
        ))}
      </ListBox>
      <div className="bo-users-groups-head">
        <h2 className="bo-section-title" id="bo-users-groups">Groups</h2>
        <Button variant="quiet" size={32}><Plus aria-hidden size={16} />Add a new group</Button>
      </div>
      <SearchField aria-label="Search groups" placeholder="Search groups" value={query} onChange={setQuery} />
      <ListBox aria-labelledby="bo-users-groups" selectionMode="single" selectedKeys={[view]} onSelectionChange={pick}
        renderEmptyState={() => <p className="bo-note">No groups match.</p>}>
        {groups.map(g => {
          const Icon = g.kind === 'smart' ? Zap : UsersIcon;
          return (
            <ListBoxItem key={g.id} id={g.id} textValue={g.label}>
              <Count label={g.label} count={g.members.length}
                kind={`${g.kind} group`} icon={<Icon aria-hidden size={16} />} />
            </ListBoxItem>
          );
        })}
      </ListBox>
      <Button variant="primary" size={36}><Mail aria-hidden size={16} />Invite users</Button>
    </aside>
  );
}

function RowOptions({person}: {person: Person}) {
  const admin = person.role === 'Platform admin';
  return (
    <DataTableOptions aria-label={`Options for ${person.name}`}>
      <MenuItem>{admin ? 'Remove platform admin rights' : 'Make platform admin'}</MenuItem>
      <MenuItem>Add to group</MenuItem>
      <MenuItem>Block user</MenuItem>
      <MenuItem>Delete user</MenuItem>
    </DataTableOptions>
  );
}

function UserTable({view}: {view: string}) {
  const title = SEGMENTS.find(s => s.id === view)?.label ?? GROUPS.find(g => g.id === view)!.label;
  const [query, setQuery] = useState('');
  const [selected, setSelected] = useState<Selection>(new Set());
  const [sort, setSort] = useState<Sort>({column: 'joined', direction: 'descending'});
  const all = inView(view);
  const rows = useMemo(() => {
    const q = query.toLowerCase();
    const found = all.filter(p => p.name.toLowerCase().includes(q) || p.email?.toLowerCase().includes(q));
    const sign = sort.direction === 'descending' ? -1 : 1;
    return found.sort((a, b) => sign * compare(a, b, sort.column));
  }, [all, query, sort]);
  // The prototype's sortable headers: pressing the sorted one flips it; a new column starts A-Z for names and
  // newest first for dates.
  const onSort = ({column, direction}: {column: string | number; direction: Sort['direction']}) =>
    setSort(s => s.column === column ? {column: s.column, direction}
      : {column: column as Sort['column'], direction: column === 'name' ? 'ascending' : 'descending'});
  const count = selected === 'all' ? rows.length : rows.filter(r => selected.has(r.id)).length;

  const toolbar = (
    <div className="bo-users-toolbar">
      <Checkbox isSelected={count > 0 && count === rows.length} isIndeterminate={count > 0 && count < rows.length}
        onChange={on => setSelected(on ? new Set(rows.map(r => r.id)) : new Set())}>
        {count > 0 ? `${count} selected` : 'Select'}
      </Checkbox>
      <span className="bo-push" />
      {count > 0 ? (
        <>
          <MenuTrigger>
            <Button variant="secondary" size={32} hasMenu><UsersIcon aria-hidden size={16} />Add to group</Button>
            <Menu aria-label="Manual groups">
              {GROUPS.filter(g => g.kind === 'manual').map(g => <MenuItem key={g.id}>{g.label}</MenuItem>)}
            </Menu>
          </MenuTrigger>
          <Button variant="quiet" size={32}><Download aria-hidden size={16} />Export selected</Button>
        </>
      ) : <Button variant="quiet" size={32}><Download aria-hidden size={16} />Export all</Button>}
      <SearchField aria-label="Search users" placeholder="Search" value={query} onChange={setQuery} />
    </div>
  );

  return (
    <Card tone="manage" title={title} pills={[{label: String(all.length)}]}>
      <div className="bo-users-body">
        {view === 'all' && <p className="bo-note">{DESCRIPTION}</p>}
        {toolbar}
        <div className="bo-users-scroll">
        <DataTable aria-label={title} selectionMode="multiple" selectedKeys={selected} onSelectionChange={setSelected}
          sortDescriptor={sort} onSortChange={onSort}>
          {/* The toolbar's Select checkbox is the one select-all, so the header's check column stays empty. */}
          <DataTableHeader selectAll={false}>
            <DataTableColumn id="name" isRowHeader allowsSorting>Name</DataTableColumn>
            <DataTableColumn id="role">Role</DataTableColumn>
            <DataTableColumn id="lastActive" allowsSorting>Last active</DataTableColumn>
            <DataTableColumn id="joined" allowsSorting>Joined</DataTableColumn>
            <DataTableColumn id="options" align="options">Options</DataTableColumn>
          </DataTableHeader>
          <DataTableBody renderEmptyState={() => <DataTableEmpty>No users here.</DataTableEmpty>}>{rows.map(p => (
            <DataTableRow key={p.id} id={p.id} textValue={p.name}>
              <DataTableCell>
                <DataTablePerson name={p.name} initials={initials(p.name)}
                  sub={p.email && <span className="bo-users-nowrap">{p.email}</span>} />
              </DataTableCell>
              <DataTableCell>
                <span className="bo-users-nowrap">
                  <DataTableStack sub={p.role !== 'Registered user' && 'Assigned items'}>{p.role}</DataTableStack>
                </span>
              </DataTableCell>
              <DataTableCell><span className="bo-users-nowrap">{ago(p.lastActive)}</span></DataTableCell>
              <DataTableCell><span className="bo-users-nowrap">{date(p.joined)}</span></DataTableCell>
              <DataTableCell align="options"><RowOptions person={p} /></DataTableCell>
            </DataTableRow>))}
          </DataTableBody>
        </DataTable>
        </div>
        <Gap name="Pagination" inline><span className="bo-note">Page 1 of 1</span></Gap>
      </div>
    </Card>
  );
}

function HeaderActions() {
  return (
    <span className="bo-users-actions">
      <Button variant="secondary" size={32}><ShieldCheck aria-hidden size={16} />Seats overview</Button>
      <Button variant="secondary" size={32}><ChartColumn aria-hidden size={16} />User insights</Button>
    </span>
  );
}

export function Users() {
  const [view, setView] = useState('all');
  return (
    <Page title="Users" actions={<HeaderActions />}>
      <GapLegend names={['Pagination']} />
      <div className="bo-split">
        <Sidebar view={view} setView={setView} />
        {/* A fresh table per view: search and selection belong to the list they were made in. */}
        <UserTable key={view} view={view} />
      </div>
    </Page>
  );
}
