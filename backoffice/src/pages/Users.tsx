import {useMemo, useState, type ComponentProps, type ReactNode} from 'react';
import {useNavigate, useParams} from 'react-router';
import {ChartColumn, Download, Mail, Pencil, Plus, ShieldCheck, Trash2, Users as UsersIcon, Zap} from 'lucide-react';
import {DataTable, DataTableHeader, DataTableColumn, DataTableBody, DataTableRow, DataTableCell, DataTableEmpty,
  DataTablePerson, DataTableStack, DataTableOptions} from '../../../src/components/gv/DataTable';
import {ListBox, ListBoxItem} from '../../../src/components/ListBox';
import {SearchField} from '../../../src/components/SearchField';
import {MenuTrigger, Menu, MenuItem} from '../../../src/components/Menu';
import {Button} from '../../../src/components/Button';
import {Card} from '../../../src/components/gv/Card';
import {Checkbox} from '../../../src/components/gv/Checkbox';
import {Modal} from '../../../src/components/gv/Modal';
import {TextField} from '../../../src/components/TextField';
import {Select, SelectItem} from '../../../src/components/Select';
import {MyToastRegion, queue} from '../../../src/components/Toast';
import {GROUPS, PEOPLE, SEGMENTS, SMART_RULES, type Person} from '../data-users';
import {Gap, GapLegend} from '../Gap';
import {Page} from './Page';

// React Aria's own types, read off the gv DataTable (the back office imports only the system).
type TableProps = ComponentProps<typeof DataTable>;
type Selection = Parameters<NonNullable<TableProps['onSelectionChange']>>[0];
type Sort = {column: 'name' | 'lastActive' | 'joined'; direction: 'ascending' | 'descending'};

const DESCRIPTION = 'Get an overview of all the people and organisations that registered on the platform. ' +
  'Add a selection of users to Manual groups or Smart groups.';

type Group = (typeof GROUPS)[number];

// The groups made or renamed here outlive a change of route (a group's page, a profile and back), until a reload.
const groupStore: {groups: Group[]} = {groups: [...GROUPS]};
function useGroups() {
  const [groups, set] = useState(groupStore.groups);
  const setGroups = (f: (g: Group[]) => Group[]) => set(g => (groupStore.groups = f(g)));
  return [groups, setGroups] as const;
}

// "Resident E" → "RE".
export const initials = (name: string) => name.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase();

function ago(minutes?: number) {
  if (minutes === undefined) return '';
  const units: [number, string][] = [[43200, 'month'], [10080, 'week'], [1440, 'day'], [60, 'hour'], [1, 'minute']];
  const [size, unit] = units.find(([s]) => minutes >= s) ?? [1, 'minute'];
  const n = Math.floor(minutes / size);
  return `${n} ${unit}${n === 1 ? '' : 's'} ago`;
}

export const date = (iso: string) => new Date(`${iso}T00:00:00Z`).toLocaleDateString('en-US',
  {month: 'long', day: 'numeric', year: 'numeric', timeZone: 'UTC'});

function inView(view: string, groups: Group[]): Person[] {
  const group = groups.find(g => g.id === view);
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

function Sidebar({view, setView, all, onAddGroup}: {
  view: string; setView: (v: string) => void; all: Group[]; onAddGroup: () => void;
}) {
  const navigate = useNavigate();
  const [query, setQuery] = useState('');
  const groups = all.filter(g => g.label.toLowerCase().includes(query.toLowerCase()));
  const pick = (keys: Selection) => keys !== 'all' && keys.size > 0 && setView(String([...keys][0]));
  return (
    <aside className="bo-users-side">
      <ListBox aria-label="Users" selectionMode="single" selectedKeys={[view]} onSelectionChange={pick}>
        {SEGMENTS.map(s => (
          <ListBoxItem key={s.id} id={s.id} textValue={s.label}><Count label={s.label} count={inView(s.id, all).length} /></ListBoxItem>
        ))}
      </ListBox>
      <div className="bo-users-groups-head">
        <h2 className="bo-section-title" id="bo-users-groups">Groups</h2>
        <Button variant="quiet" size={32} onPress={onAddGroup}><Plus aria-hidden size={16} />Add a new group</Button>
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
      <Button variant="primary" size={36} onPress={() => navigate('/users/invitations')}><Mail aria-hidden size={16} />Invite users</Button>
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

function UserTable({view, groups, onEditGroup, onDeleteGroup}: {
  view: string; groups: Group[]; onEditGroup: () => void; onDeleteGroup: () => void;
}) {
  const group = groups.find(g => g.id === view);
  const title = SEGMENTS.find(s => s.id === view)?.label ?? group?.label ?? '';
  const [query, setQuery] = useState('');
  const [selected, setSelected] = useState<Selection>(new Set());
  const [sort, setSort] = useState<Sort>({column: 'joined', direction: 'descending'});
  const all = inView(view, groups);
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
              {groups.filter(g => g.kind === 'manual').map(g => <MenuItem key={g.id}>{g.label}</MenuItem>)}
            </Menu>
          </MenuTrigger>
          <Button variant="quiet" size={32}><Download aria-hidden size={16} />Export selected</Button>
        </>
      ) : <Button variant="quiet" size={32}><Download aria-hidden size={16} />Export all</Button>}
      <SearchField aria-label="Search users" placeholder="Search" value={query} onChange={setQuery} />
    </div>
  );

  return (
    <Card tone="manage" title={title} pills={[{label: String(all.length)}]} actions={group && (
      <span className="bo-users-actions">
        <Button variant="quiet" size={32} onPress={onEditGroup}><Pencil aria-hidden size={16} />Edit Group</Button>
        <Button variant="quiet" size={32} onPress={onDeleteGroup}><Trash2 aria-hidden size={16} />Delete Group</Button>
      </span>
    )}>
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
            <DataTableRow key={p.id} id={p.id} textValue={p.name} href={`#/users/${p.id}`}>
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
  const navigate = useNavigate();
  return (
    <span className="bo-users-actions">
      <Button variant="secondary" size={32} onPress={() => navigate('/users/seats')}><ShieldCheck aria-hidden size={16} />Seats overview</Button>
      <Button variant="secondary" size={32} onPress={() => navigate('/dashboard/users')}><ChartColumn aria-hidden size={16} />User insights</Button>
    </span>
  );
}

/** The real admin's two kinds of group: hand-picked members, or rules that fill the group by themselves. */
const KINDS = [
  {kind: 'manual' as const, title: 'Create a normal group', note: 'Add users to it by hand, from the users list.', icon: UsersIcon},
  {kind: 'smart' as const, title: 'Create a smart group', note: 'Users who meet its rules join it by themselves.', icon: Zap}
];

/** Add a new group (choose the kind, then name it) and Edit Group (rename it): one modal, two starts. */
function GroupModal({editing, onClose, onSave}: {
  editing?: Group; onClose: () => void; onSave: (label: string, kind: Group['kind']) => void;
}) {
  const [kind, setKind] = useState<Group['kind'] | null>(editing?.kind ?? null);
  const [name, setName] = useState(editing?.label ?? '');
  const title = editing ? 'Edit Group' : 'Add a new group';
  const footer = kind && (
    <>
      {!editing && <Button variant="quiet" size={32} onPress={() => setKind(null)}>Back</Button>}
      <Button variant="primary" size={32} isDisabled={!name.trim()} onPress={() => onSave(name.trim(), kind)}>Save group</Button>
    </>
  );
  return (
    <Modal title={title} isOpen onOpenChange={open => !open && onClose()} footer={footer || undefined}>
      {!kind ? (
        <div className="bo-users-kinds">
          {KINDS.map(({kind: k, title: t, note, icon: Icon}) => (
            <Button key={k} variant="secondary" size={36} onPress={() => setKind(k)}>
              <Icon aria-hidden size={16} />
              <span className="bo-users-kind"><span>{t}</span><span className="bo-note">{note}</span></span>
            </Button>
          ))}
        </div>
      ) : (
        <div className="bo-users-form">
          <TextField label="Name of the group" value={name} onChange={setName} autoFocus />
          {kind === 'smart' && (
            <Gap name="Smart group rules">
              <Select label="Rule" placeholder="Choose a rule">
                {SMART_RULES.map(r => <SelectItem key={r} id={r}>{r}</SelectItem>)}
              </Select>
            </Gap>
          )}
        </div>
      )}
    </Modal>
  );
}

function DeleteGroupModal({group, onClose, onDelete}: {group: Group; onClose: () => void; onDelete: () => void}) {
  return (
    <Modal title="Delete Group" isOpen onOpenChange={open => !open && onClose()} footer={
      <>
        <Button variant="quiet" size={32} onPress={onClose}>Cancel</Button>
        <Button variant="primary" size={32} onPress={onDelete}>Delete</Button>
      </>}>
      <p>Delete {group.label}? Its {group.members.length} members stay on the platform.</p>
    </Modal>
  );
}

const slug = (label: string) => label.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '') || 'group';

export function Users() {
  const navigate = useNavigate();
  const {groupId} = useParams();
  const [groups, setGroups] = useGroups();
  const [segment, setSegment] = useState('all');
  const [modal, setModal] = useState<'add' | 'edit' | 'delete' | null>(null);
  const group = groups.find(g => g.id === groupId);
  const view = group ? group.id : segment;
  // A group has its own page (the real admin's /users/:groupId); the role lists stay on /users.
  const setView = (id: string) => {
    if (groups.some(g => g.id === id)) navigate(`/users/groups/${id}`);
    else { setSegment(id); if (groupId) navigate('/users'); }
  };
  const save = (label: string, kind: Group['kind']) => {
    if (modal === 'edit' && group) {
      setGroups(gs => gs.map(g => (g.id === group.id ? {...g, label} : g)));
      queue.add({title: 'Group saved'}, {timeout: 5000});
    } else {
      let id = slug(label);
      while (groups.some(g => g.id === id)) id += '-2';
      setGroups(gs => [...gs, {id, label, kind, members: []}]);
      queue.add({title: 'Group created', description: label}, {timeout: 5000});
      navigate(`/users/groups/${id}`);
    }
    setModal(null);
  };
  const remove = () => {
    setGroups(gs => gs.filter(g => g.id !== group!.id));
    queue.add({title: 'Group deleted'}, {timeout: 5000});
    setModal(null); setSegment('all'); navigate('/users');
  };
  return (
    <Page title="Users" actions={<HeaderActions />}>
      <GapLegend names={['Pagination']} />
      <div className="bo-split">
        <Sidebar view={view} setView={setView} all={groups} onAddGroup={() => setModal('add')} />
        {/* A fresh table per view: search and selection belong to the list they were made in. */}
        <UserTable key={view} view={view} groups={groups} onEditGroup={() => setModal('edit')} onDeleteGroup={() => setModal('delete')} />
      </div>
      {(modal === 'add' || (modal === 'edit' && group)) && (
        <GroupModal key={modal} editing={modal === 'edit' ? group : undefined} onClose={() => setModal(null)} onSave={save} />
      )}
      {modal === 'delete' && group && <DeleteGroupModal group={group} onClose={() => setModal(null)} onDelete={remove} />}
      <MyToastRegion />
    </Page>
  );
}
