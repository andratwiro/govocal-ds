import {useMemo, useState, type ComponentProps, type ReactNode} from 'react';
import {useNavigate, useParams} from 'react-router';
import {ChartColumn, Download, Mail, Pencil, Plus, ShieldCheck, Trash2, Users as UsersIcon, Zap} from 'lucide-react';
import {AlertDialog, Button, Card, CardRadio, CardRadioGroup, DataTable, DataTableBody, DataTableCell, DataTableColumn,
  DataTableEmpty, DataTableHeader, DataTableOptions, DataTablePerson, DataTableRow, DataTableStack, Menu, MenuItem,
  Modal, Pagination, Panel, queue, SearchField, Select, type SelectionAction, SelectionBar, SelectItem, TableToolbar,
  TableToolbarHeading, TextField, ToastRegion} from 'govocal-ds';
import {ListBox, ListBoxItem} from 'govocal-ds/base';
import {GROUPS, PEOPLE, SEGMENTS, SMART_RULES, type Person} from '../data-users';
import {Gap} from '../Gap';
import {Page} from './Page';

// React Aria's own types, read off the gv DataTable (the back office imports only the system).
type TableProps = ComponentProps<typeof DataTable>;
type Selection = Parameters<NonNullable<TableProps['onSelectionChange']>>[0];
type Sort = {column: 'name' | 'lastActive' | 'joined'; direction: 'ascending' | 'descending'};

// Every admin table pages (docs/DECISIONS.md).
export const PAGE_SIZE = 10;
export const usersWord = (n: number) => `${n} ${n === 1 ? 'user' : 'users'}`;

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

// The people, as changed here (a role, a block, a deletion): they outlive a change of route, until a reload.
export type Member = Person & {blocked?: boolean};
export const peopleStore: {people: Member[]} = {people: [...PEOPLE]};
function usePeople() {
  const [people, set] = useState(peopleStore.people);
  const setPeople = (f: (p: Member[]) => Member[]) => set(p => (peopleStore.people = f(p)));
  return [people, setPeople] as const;
}
const toast = (title: string, description?: string) => queue.add({title, description}, {timeout: 5000});

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

function inView(view: string, groups: Group[], people: Member[]): Member[] {
  // A blocked user leaves every list but Banned emails.
  if (view === 'banned') return people.filter(p => p.blocked);
  const active = people.filter(p => !p.blocked);
  const group = groups.find(g => g.id === view);
  if (group) return active.filter(p => group.members.includes(p.id));
  const roles = SEGMENTS.find(s => s.id === view)?.roles;
  return roles ? active.filter(p => roles.includes(p.role)) : active;
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

function Sidebar({view, setView, all, people, onAddGroup}: {
  view: string; setView: (v: string) => void; all: Group[]; people: Member[]; onAddGroup: () => void;
}) {
  const navigate = useNavigate();
  const [query, setQuery] = useState('');
  const groups = all.filter(g => g.label.toLowerCase().includes(query.toLowerCase()));
  const pick = (keys: Selection) => keys !== 'all' && keys.size > 0 && setView(String([...keys][0]));
  return (
    <aside className="bo-users-side">
      <ListBox aria-label="Users" selectionMode="single" selectedKeys={[view]} onSelectionChange={pick}>
        {SEGMENTS.map(s => (
          <ListBoxItem key={s.id} id={s.id} textValue={s.label}><Count label={s.label} count={inView(s.id, all, people).length} /></ListBoxItem>
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
              <Count label={g.label} count={inView(g.id, all, people).length}
                kind={`${g.kind} group`} icon={<Icon aria-hidden size={16} />} />
            </ListBoxItem>
          );
        })}
      </ListBox>
      <Button variant="primary" size={36} onPress={() => navigate('/users/invitations')}><Mail aria-hidden size={16} />Invite users</Button>
    </aside>
  );
}

type RowAction = 'admin' | 'group' | 'block' | 'delete';

function RowOptions({person, onAction}: {person: Person; onAction: (a: RowAction) => void}) {
  const admin = person.role === 'Platform admin';
  return (
    <DataTableOptions aria-label={`Options for ${person.name}`} onAction={k => onAction(k as RowAction)}>
      <MenuItem id="admin">{admin ? 'Remove platform admin rights' : 'Make platform admin'}</MenuItem>
      <MenuItem id="group">Add to group</MenuItem>
      <MenuItem id="block">Block user</MenuItem>
      <MenuItem id="delete">Delete user</MenuItem>
    </DataTableOptions>
  );
}

function UserTable({view, groups, people, onEditGroup, onDeleteGroup, onRowAction, onAddToGroup}: {
  view: string; groups: Group[]; people: Member[]; onEditGroup: () => void; onDeleteGroup: () => void;
  onRowAction: (p: Person, a: RowAction) => void; onAddToGroup: (ids: string[], groupId: string) => void;
}) {
  const group = groups.find(g => g.id === view);
  const title = SEGMENTS.find(s => s.id === view)?.label ?? group?.label ?? '';
  const [query, setQuery] = useState('');
  const [selected, setSelected] = useState<Selection>(new Set());
  const [sort, setSort] = useState<Sort>({column: 'joined', direction: 'descending'});
  const [page, setPage] = useState(1);
  const all = inView(view, groups, people);
  const rows = useMemo(() => {
    const q = query.toLowerCase();
    const found = all.filter(p => p.name.toLowerCase().includes(q) || p.email?.toLowerCase().includes(q));
    const sign = sort.direction === 'descending' ? -1 : 1;
    return found.sort((a, b) => sign * compare(a, b, sort.column));
  }, [all, query, sort]);
  const pageCount = Math.max(1, Math.ceil(rows.length / PAGE_SIZE));
  const current = Math.min(page, pageCount);
  const shown = rows.slice((current - 1) * PAGE_SIZE, current * PAGE_SIZE);
  const search = (q: string) => { setQuery(q); setPage(1); };
  // The prototype's sortable headers: pressing the sorted one flips it; a new column starts A-Z for names and
  // newest first for dates.
  const onSort = ({column, direction}: {column: string | number; direction: Sort['direction']}) =>
    setSort(s => s.column === column ? {column: s.column, direction}
      : {column: column as Sort['column'], direction: column === 'name' ? 'ascending' : 'descending'});
  // The header's select-all ticks the page shown (a known page, docs/DECISIONS.md); ticks on other pages stay.
  const ids = selected === 'all' ? shown.map(r => r.id) : rows.filter(r => selected.has(r.id)).map(r => r.id);
  const onSelect = (keys: Selection) =>
    setSelected(keys === 'all' ? new Set([...ids, ...shown.map(r => r.id)]) : keys);
  const count = ids.length;
  const exportUsers = (n: number) => toast('Export started', `${n === 1 ? '1 user' : `${n} users`} in users.xlsx`);

  const actions: SelectionAction[] = [
    {id: 'group', label: 'Add to group', icon: <UsersIcon aria-hidden size={16} />, menu: (
      <Menu aria-label="Manual groups" onAction={k => { onAddToGroup(ids, String(k)); setSelected(new Set()); }}>
        {groups.filter(g => g.kind === 'manual').map(g => <MenuItem key={g.id} id={g.id}>{g.label}</MenuItem>)}
      </Menu>
    )},
    {id: 'export', label: 'Export selected', icon: <Download aria-hidden size={16} />}
  ];

  // The toolbar row (the Data table's "In a panel" story): the count, which follows the search, gives way to the
  // Selection bar while rows are ticked; the export and the search stay put at the end.
  const toolbar = (
    <TableToolbar aria-label="User tools" start={(
      <SelectionBar count={count} actions={actions} onAction={id => id === 'export' && exportUsers(count)}
        onClear={() => setSelected(new Set())}>
        <TableToolbarHeading>{usersWord(rows.length)}</TableToolbarHeading>
      </SelectionBar>
    )}>
      <Button variant="quiet" size={32} onPress={() => exportUsers(all.length)}><Download aria-hidden size={16} />Export all</Button>
      <SearchField aria-label="Search users" placeholder="Search" value={query} onChange={search} />
    </TableToolbar>
  );

  return (
    <Panel title={title} description={view === 'all' ? DESCRIPTION : undefined} isFlush toolbar={toolbar}
      actions={group && (
        <>
          <Button variant="quiet" size={32} onPress={onEditGroup}><Pencil aria-hidden size={16} />Edit Group</Button>
          <Button variant="quiet" tone="danger" size={32} onPress={onDeleteGroup}><Trash2 aria-hidden size={16} />Delete Group</Button>
        </>
      )}
      footer={<Pagination page={current} pageCount={pageCount} onPageChange={setPage} aria-label="User pages" />}>
        <div className="bo-users-scroll">
        <DataTable aria-label={title} selectionMode="multiple" selectedKeys={selected} onSelectionChange={onSelect}
          sortDescriptor={sort} onSortChange={onSort}>
          {/* The header's check column is the one select-all (docs/DECISIONS.md): no toolbar "Select" checkbox. */}
          <DataTableHeader>
            <DataTableColumn id="name" isRowHeader allowsSorting>Name</DataTableColumn>
            <DataTableColumn id="role">Role</DataTableColumn>
            <DataTableColumn id="lastActive" allowsSorting>Last active</DataTableColumn>
            <DataTableColumn id="joined" allowsSorting>Joined</DataTableColumn>
            <DataTableColumn id="options" align="options">Options</DataTableColumn>
          </DataTableHeader>
          <DataTableBody renderEmptyState={() => <DataTableEmpty>No users here.</DataTableEmpty>}>{shown.map(p => (
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
              <DataTableCell align="options"><RowOptions person={p} onAction={a => onRowAction(p, a)} /></DataTableCell>
            </DataTableRow>))}
          </DataTableBody>
        </DataTable>
        </div>
    </Panel>
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
  {kind: 'manual' as const, title: 'Create a normal group', note: 'Add users to it by hand, from the users list.'},
  {kind: 'smart' as const, title: 'Create a smart group', note: 'Users who meet its rules join it by themselves.'}
];

/** Add a new group (choose the kind, then name it) and Edit Group (rename it): one modal, two starts. */
function GroupModal({editing, onClose, onSave}: {
  editing?: Group; onClose: () => void; onSave: (label: string, kind: Group['kind']) => void;
}) {
  const [kind, setKind] = useState<Group['kind'] | null>(editing?.kind ?? null);
  const [name, setName] = useState(editing?.label ?? '');
  const title = editing ? 'Edit Group' : 'Add a new group';
  const footer = (
    <>
      <Button variant="quiet" size={32} onPress={onClose}>Cancel</Button>
      <Button variant="primary" size={32} isDisabled={!kind || !name.trim()} onPress={() => kind && onSave(name.trim(), kind)}>Save group</Button>
    </>
  );
  return (
    <Modal title={title} isOpen onOpenChange={open => !open && onClose()} footer={footer}>
      <div className="bo-users-modal">
      {/* The choice cards (the gv Card, stacked, with its radio list), as the phase's Survey options. */}
      {!editing && (
        <Card layout="stacked" title="Kind of group">
          <CardRadioGroup aria-label="Kind of group" value={kind} onChange={v => setKind(v as Group['kind'])}>
            {KINDS.map(({kind: k, title: t, note}) => (
              <CardRadio key={k} value={k} description={note}>{t}</CardRadio>
            ))}
          </CardRadioGroup>
        </Card>
      )}
      {kind && (
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
      </div>
    </Modal>
  );
}

function DeleteGroupModal({group, onClose, onDelete}: {group: Group; onClose: () => void; onDelete: () => void}) {
  // A confirm, not a form: the Alert dialog (no ×, Esc cancels, focus starts on Cancel).
  return (
    <AlertDialog tone="danger" title="Delete this group?" confirmLabel="Delete group" isOpen
      onOpenChange={open => !open && onClose()} onConfirm={onDelete}>
      <p>{group.label} is deleted. Its {group.members.length} members stay on the platform.</p>
    </AlertDialog>
  );
}

/** A row's Add to group: one of the manual groups (smart groups fill themselves). */
function AddToGroupModal({person, groups, onClose, onAdd}: {
  person: Person; groups: Group[]; onClose: () => void; onAdd: (groupId: string) => void;
}) {
  const manual = groups.filter(g => g.kind === 'manual');
  const [groupId, setGroupId] = useState(manual[0]?.id);
  return (
    <Modal title="Add to group" isOpen onOpenChange={open => !open && onClose()} footer={
      <>
        <Button variant="quiet" size={32} onPress={onClose}>Cancel</Button>
        <Button variant="primary" size={32} isDisabled={!groupId} onPress={() => groupId && onAdd(groupId)}>Add to group</Button>
      </>}>
      <div className="bo-users-modal">
        <p>Add {person.name} to a manual group.</p>
        <Select label="Group" selectedKey={groupId} onSelectionChange={k => setGroupId(String(k))}>
          {manual.map(g => <SelectItem key={g.id} id={g.id}>{g.label}</SelectItem>)}
        </Select>
      </div>
    </Modal>
  );
}

/** Block user and Delete user ask first: one is undone from Banned emails, the other cannot be undone. */
function ConfirmUserModal({person, kind, onClose, onConfirm}: {
  person: Person; kind: 'block' | 'delete'; onClose: () => void; onConfirm: () => void;
}) {
  const block = kind === 'block';
  return (
    <AlertDialog tone="danger" title={block ? 'Block this user?' : 'Delete this user?'} confirmLabel={block ? 'Block user' : 'Delete user'}
      isOpen onOpenChange={open => !open && onClose()} onConfirm={onConfirm}>
      <p>{block
        ? `${person.name} can no longer sign in or take part. They move to Banned emails.`
        : `${person.name} and their account are deleted. Their inputs stay, without a name. This cannot be undone.`}</p>
    </AlertDialog>
  );
}

const slug = (label: string) => label.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '') || 'group';

export function Users() {
  const navigate = useNavigate();
  const {groupId} = useParams();
  const [groups, setGroups] = useGroups();
  const [segment, setSegment] = useState('all');
  const [people, setPeople] = usePeople();
  const [modal, setModal] = useState<'add' | 'edit' | 'delete' | null>(null);
  const [ask, setAsk] = useState<{kind: 'group' | 'block' | 'delete'; person: Person} | null>(null);
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
  const addToGroup = (ids: string[], groupId: string) => {
    const target = groups.find(g => g.id === groupId);
    if (!target) return;
    setGroups(gs => gs.map(g => (g.id === groupId ? {...g, members: [...new Set([...g.members, ...ids])]} : g)));
    toast(ids.length === 1 ? `1 user added to ${target.label}` : `${ids.length} users added to ${target.label}`);
    setAsk(null);
  };
  const onRowAction = (person: Person, a: RowAction) => {
    if (a !== 'admin') { setAsk({kind: a, person}); return; }
    // As on the profile page: the admin rights go on and off from the same item.
    const admin = person.role === 'Platform admin';
    setPeople(ps => ps.map(p => (p.id === person.id ? {...p, role: admin ? 'Registered user' : 'Platform admin'} : p)));
    toast(admin ? `${person.name} is no longer a platform admin` : `${person.name} is now a platform admin`);
  };
  const confirm = () => {
    if (!ask) return;
    const {kind, person} = ask;
    if (kind === 'block') {
      setPeople(ps => ps.map(p => (p.id === person.id ? {...p, blocked: true} : p)));
      toast(`${person.name} is blocked`, 'They are listed under Banned emails.');
    } else {
      setPeople(ps => ps.filter(p => p.id !== person.id));
      setGroups(gs => gs.map(g => ({...g, members: g.members.filter(m => m !== person.id)})));
      toast(`${person.name} is deleted`);
    }
    setAsk(null);
  };
  return (
    <Page title="Users" actions={<HeaderActions />}>
      <div className="bo-split">
        <Sidebar view={view} setView={setView} all={groups} people={people} onAddGroup={() => setModal('add')} />
        {/* A fresh table per view: search and selection belong to the list they were made in. */}
        <UserTable key={view} view={view} groups={groups} people={people} onEditGroup={() => setModal('edit')}
          onDeleteGroup={() => setModal('delete')} onRowAction={onRowAction} onAddToGroup={addToGroup} />
      </div>
      {(modal === 'add' || (modal === 'edit' && group)) && (
        <GroupModal key={modal} editing={modal === 'edit' ? group : undefined} onClose={() => setModal(null)} onSave={save} />
      )}
      {modal === 'delete' && group && <DeleteGroupModal group={group} onClose={() => setModal(null)} onDelete={remove} />}
      {ask?.kind === 'group' && (
        <AddToGroupModal person={ask.person} groups={groups} onClose={() => setAsk(null)} onAdd={id => addToGroup([ask.person.id], id)} />
      )}
      {(ask?.kind === 'block' || ask?.kind === 'delete') && (
        <ConfirmUserModal person={ask.person} kind={ask.kind} onClose={() => setAsk(null)} onConfirm={confirm} />
      )}
      <ToastRegion />
    </Page>
  );
}
