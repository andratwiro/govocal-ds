import {useCallback, useMemo, useRef, useState, type ComponentProps, type ReactNode} from 'react';
import {useNavigate, useParams} from 'react-router';
import {Ban, ChartColumn, Download, Mail, MoreHorizontal, Pencil, Plus, SearchX, ShieldCheck, ShieldOff, Trash2, UserMinus,
  UserPlus, Users as UsersIcon, X, Zap} from 'lucide-react';
import {AlertDialog, Banner, Button, ChoiceCard, DataTable, DataTableBody, DataTableCell, DataTableColumn,
  DataTableHeader, DataTableOptions, DataTablePerson, DataTableRow, DataTableStack, EmptyState, IconButton, Inline, type Key,
  Link, Menu, MenuItem, MenuTrigger, Modal, MultilingualTextField, type Multiloc, OptionList, Panel, RadioGroup, SearchField, Select, type SelectionAction,
  SelectionBar, SelectItem, Separator, Stack, TableToolbar, TableToolbarHeading, Text, TextField, toast, toKeySet,
  VisuallyHidden, useNumberFormatter} from 'govocal-ds';
import {LOCALES} from '../data-settings';
import {ALL_PEOPLE, GROUPS, SEGMENTS, SMART_RULES, type Person} from '../data-users';
import {useDay} from '../dates';
import {PROJECTS} from '../data';
import {FOLDERS, SPACES} from '../data-projects';
import {Page} from './Page';

// React Aria's own types, read off the gv DataTable (the back office imports only the system).
type TableProps = ComponentProps<typeof DataTable>;
type Selection = Parameters<NonNullable<TableProps['onSelectionChange']>>[0];
type Sort = {column: 'name' | 'lastActive' | 'joined'; direction: 'ascending' | 'descending'};

// The admin's other user lists page (docs/DECISIONS.md); the Users list itself is virtualised.
export const PAGE_SIZE = 10;
export const usersWord = (count: number, n: (v: number) => string) => `${n(count)} ${count === 1 ? 'user' : 'users'}`;

const DESCRIPTION = 'Get an overview of all the people and organisations that registered on the platform. ' +
  'Add a selection of users to Manual groups or Smart groups.';

type Group = (typeof GROUPS)[number];

// The groups made or renamed here outlive a change of route (a group's page, a profile and back), until a reload.
export const groupStore: {groups: Group[]} = {groups: [...GROUPS]};
function useGroups() {
  const [groups, set] = useState(groupStore.groups);
  // The store first: an Undo pressed after leaving the page still lands.
  const setGroups = (f: (g: Group[]) => Group[]) => set(groupStore.groups = f(groupStore.groups));
  return [groups, setGroups] as const;
}

// The people, as changed here (a role, a block, a deletion): they outlive a change of route, until a reload.
export type Member = Person & {blocked?: boolean};
export const peopleStore: {people: Member[]} = {people: [...ALL_PEOPLE]};
function usePeople() {
  const [people, set] = useState(peopleStore.people);
  const setPeople = (f: (p: Member[]) => Member[]) => set(peopleStore.people = f(peopleStore.people));
  return [people, setPeople] as const;
}
const icon = (Icon: typeof Plus) => <Icon aria-hidden size={16} />;

// "Resident E" → "RE".
export const initials = (name: string) => name.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase();

export function ago(minutes?: number) {
  if (minutes === undefined) return '';
  const units: [number, string][] = [[43200, 'month'], [10080, 'week'], [1440, 'day'], [60, 'hour'], [1, 'minute']];
  const [size, unit] = units.find(([s]) => minutes >= s) ?? [1, 'minute'];
  const n = Math.floor(minutes / size);
  return `${n} ${unit}${n === 1 ? '' : 's'} ago`;
}


function inView(view: string, groups: Group[], people: Member[]): Member[] {
  // A blocked user leaves every list but Banned emails.
  if (view === 'banned') return people.filter(p => p.blocked);
  const active = people.filter(p => !p.blocked);
  const group = groups.find(g => g.id === view);
  if (group) return active.filter(p => group.members.includes(p.id));
  const roles = SEGMENTS.find(s => s.id === view)?.roles;
  return roles ? active.filter(p => roles.includes(p.role)) : active;
}

const COLLATOR = new Intl.Collator('en');
function compare(a: Person, b: Person, column: string) {
  if (column === 'name') return COLLATOR.compare(a.name, b.name);
  // Never active sorts as the oldest activity.
  if (column === 'lastActive') return (b.lastActive ?? Number.MAX_SAFE_INTEGER) - (a.lastActive ?? Number.MAX_SAFE_INTEGER);
  return a.joined.localeCompare(b.joined);
}

function Sidebar({view, setView, all, people, onAddGroup}: {
  view: string; setView: (v: string) => void; all: Group[]; people: Member[]; onAddGroup: () => void;
}) {
  const navigate = useNavigate();
  const pick = (ids: string[]) => ids[0] && setView(ids[0]);
  // The role lists and the groups: two single-choice Option lists, each row's count at its end; the groups' list
  // carries its own search. A row is chosen while its list is the one in view.
  const segments = SEGMENTS.map(s => ({id: s.id, label: s.label, count: inView(s.id, all, people).length}));
  const groups = all.map(g => {
    const Icon = g.kind === 'smart' ? Zap : UsersIcon;
    return {id: g.id, label: g.label, count: inView(g.id, all, people).length, icon: <Icon aria-hidden size={16} />};
  });
  return (
    <Stack elementType="aside" gap="12">
      <OptionList aria-label="Users" selectionMode="single" isSearchable={false} items={segments}
        value={segments.some(s => s.id === view) ? [view] : []} onChange={pick} />
      <Inline gap="8" wrap="nowrap" justifyContent="space-between">
        <Text elementType="h2" kind="body" isStrong color="primary" className="bo-users-groups-title">Groups</Text>
        <Button variant="quiet" size={32} onPress={onAddGroup}><Plus aria-hidden size={16} />Add a new group</Button>
      </Inline>
      <OptionList aria-label="Groups" selectionMode="single" isSearchable items={groups} placeholder="Search groups"
        labels={{search: () => 'Search groups'}} emptyLabel="No groups match."
        value={groups.some(g => g.id === view) ? [view] : []} onChange={pick} />
      <Button variant="primary" size={36} onPress={() => navigate('/users/invitations')}><Mail aria-hidden size={16} />Invite users</Button>
    </Stack>
  );
}

type RowAction = 'admin' | 'group' | 'ungroup' | 'block' | 'unblock' | 'delete';

/** A row's menu (Menu's "With icons" story): the rights and groups first, then, apart, what removes the user. In a
 * manual group's list it also takes the user out of that group; under Banned emails, Block becomes Unblock. */
function RowOptions({person, blocked, inManualGroup, onAction}: {
  person: Member; blocked: boolean; inManualGroup: boolean; onAction: (a: RowAction) => void;
}) {
  const admin = person.role === 'Platform admin';
  return (
    <DataTableOptions aria-label={`Options for ${person.name}`} onAction={k => onAction(k as RowAction)}>
      <MenuItem id="admin" icon={icon(admin ? ShieldOff : ShieldCheck)}>{admin ? 'Remove platform admin rights' : 'Make platform admin'}</MenuItem>
      <MenuItem id="group" icon={icon(UserPlus)}>Add to group</MenuItem>
      {inManualGroup && <MenuItem id="ungroup" icon={icon(UserMinus)}>Remove from group</MenuItem>}
      <Separator />
      {blocked
        ? <MenuItem id="unblock" icon={icon(Ban)}>Unblock user</MenuItem>
        : <MenuItem id="block" icon={icon(Ban)}>Block user</MenuItem>}
      <MenuItem id="delete" icon={icon(Trash2)}>Delete user</MenuItem>
    </DataTableOptions>
  );
}

/** What an empty list says, by list: a role nobody holds, an empty group, no bans or bounces. */
function emptyCopy(view: string, group?: Group): {title: string; description: string} {
  if (group?.kind === 'manual') return {title: 'No members yet',
    description: 'Tick users in Registered users and choose Add to group, or use a row\'s Add to group.'};
  if (group) return {title: 'Nobody meets the rules yet', description: 'Users who meet this group\'s rules join it by themselves.'};
  if (view === 'banned') return {title: 'No banned emails', description: 'A user you block shows here, and can be unblocked from their row.'};
  if (view === 'bounces') return {title: 'No email bounces', description: 'Addresses our emails could not reach show here.'};
  const label = SEGMENTS.find(s => s.id === view)?.label.toLowerCase() ?? 'users';
  return {title: `No ${label} yet`, description: 'Give someone this role from their row or their profile.'};
}

/** What a manager manages: the projects, folders and spaces that name them (the invented platform's data). */
export function assignedTo(person: Person): {id: string; label: string; href?: string}[] {
  if (person.role === 'Registered user' || person.role === 'Platform admin') return [];
  return [
    ...PROJECTS.filter(p => p.managers?.includes(person.name)).map(p => ({id: p.id, label: p.title, href: `#/projects/${p.id}`})),
    ...FOLDERS.filter(f => f.managers.includes(person.name)).map(f => ({id: `folder-${f.name}`, label: f.name})),
    ...SPACES.filter(s => s.managers.includes(person.name)).map(s => ({id: `space-${s.name}`, label: s.name}))
  ];
}

/** Under a manager's role: how many items they manage, a link to the profile that lists them; "No assigned items". */
function AssignedItems({person}: {person: Person}) {
  if (person.role === 'Registered user' || person.role === 'Platform admin') return null;
  const items = assignedTo(person);
  if (items.length === 0) return <>No assigned items</>;
  return <Link href={`#/users/${person.id}`}>{items.length === 1 ? '1 assigned item' : `${items.length} assigned items`}</Link>;
}

function UserTable({view, groups, people, onEditGroup, onDeleteGroup, onRowAction, onAddToGroup, onRemoveFromGroup}: {
  view: string; groups: Group[]; people: Member[]; onEditGroup: () => void; onDeleteGroup: () => void;
  onRowAction: (p: Member, a: RowAction) => void; onAddToGroup: (ids: string[], groupId: string) => void;
  onRemoveFromGroup: (ids: string[]) => void;
}) {
  const {format: n} = useNumberFormatter();
  const day = useDay();
  const group = groups.find(g => g.id === view);
  const title = SEGMENTS.find(s => s.id === view)?.label ?? group?.label ?? '';
  const [query, setQuery] = useState('');
  const [selected, setSelected] = useState<Set<Key>>(new Set());
  const [sort, setSort] = useState<Sort>({column: 'joined', direction: 'descending'});
  const all = useMemo(() => inView(view, groups, people), [view, groups, people]);
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
  // One scrolling list, no pages (the Data table's "Virtualized" story): the header's select-all ticks every row in
  // view, that is every row the search and the list leave, all 5,000 if nothing narrows them.
  const ids = rows.filter(r => selected.has(r.id)).map(r => r.id);
  const onSelect = (keys: Selection) => setSelected(toKeySet<Key>(keys, rows.map(r => r.id)));
  const count = ids.length;
  // A row's cells read the menu's handler and the list's kind: stable, and named in the body's `dependencies`, so
  // the table reuses the rows it built until one of them changes.
  const act = useRef(onRowAction);
  act.current = onRowAction;
  const onAct = useCallback((p: Member, a: RowAction) => act.current(p, a), []);
  const exportUsers = (count: number) => toast('Export started', `${usersWord(count, n)} in users.xlsx`);

  const manualGroup = group?.kind === 'manual';
  const actions: SelectionAction[] = [
    {id: 'group', label: 'Add to group', icon: icon(UserPlus), menu: (
      <Menu aria-label="Manual groups" onAction={k => { onAddToGroup(ids, String(k)); setSelected(new Set()); }}>
        {groups.filter(g => g.kind === 'manual').map(g => <MenuItem key={g.id} id={g.id} icon={icon(UsersIcon)}>{g.label}</MenuItem>)}
      </Menu>
    )},
    ...(manualGroup ? [{id: 'ungroup', label: 'Remove from group', icon: icon(UserMinus)}] : []),
    {id: 'export', label: 'Export selected', icon: icon(Download)}
  ];
  const onBulk = (id: string) => {
    if (id === 'export') exportUsers(count);
    if (id === 'ungroup') { onRemoveFromGroup(ids); setSelected(new Set()); }
  };
  const {title: emptyTitle, description: emptyText} = emptyCopy(view, group);

  // The toolbar row (the Data table's "In a panel" story): the count, which follows the search, gives way to the
  // Selection bar while rows are ticked; the export and the search stay put at the end.
  const toolbar = (
    <TableToolbar aria-label="User tools" start={(
      <SelectionBar count={count} items={actions} onAction={onBulk}
        onClear={() => setSelected(new Set())}>
        <TableToolbarHeading>{usersWord(rows.length, n)}</TableToolbarHeading>
      </SelectionBar>
    )}>
      <Button variant="quiet" size={32} onPress={() => exportUsers(all.length)}><Download aria-hidden size={16} />Export all</Button>
      <SearchField aria-label="Search users" placeholder="Search" value={query} onChange={setQuery} />
    </TableToolbar>
  );

  return (
    <Panel title={title} description={view === 'all' ? DESCRIPTION : undefined} isFlush toolbar={toolbar}
      actions={group && (
        // Edit stays a button; Delete goes in the "…" menu after a separator, as on every other screen's rows.
        <Inline elementType="span" gap="4" wrap="nowrap">
          <Button variant="quiet" size={32} onPress={onEditGroup}><Pencil aria-hidden size={16} />Edit group</Button>
          <MenuTrigger>
            <IconButton aria-label={`More actions for ${group.label}`}><MoreHorizontal aria-hidden size={16} /></IconButton>
            <Menu aria-label={`More actions for ${group.label}`} onAction={k => (k === 'delete' ? onDeleteGroup() : exportUsers(all.length))}>
              <MenuItem id="export" icon={icon(Download)}>Export the group</MenuItem>
              <Separator />
              <MenuItem id="delete" icon={icon(Trash2)}>Delete group</MenuItem>
            </Menu>
          </MenuTrigger>
        </Inline>
      )}>
      {/* A smart group says why its list can't be edited by hand (the Banner's info tone). */}
      {group?.kind === 'smart' && (
        <div className="bo-users-note">
          <Banner tone="info">This is a smart group: users who meet its rules join it, and leave it, by themselves.</Banner>
        </div>
      )}
      {/* Nothing in the list, or nothing found: the Empty state, as every admin list (docs/DECISIONS.md). */}
      {rows.length === 0 ? (
        query ? (
          <EmptyState layout="panel" headingLevel={3} icon={<SearchX size={24} />} title="No users match"
            description="Try another name or email address." />
        ) : (
          <EmptyState layout="panel" headingLevel={3} icon={<UsersIcon size={24} />} title={emptyTitle} description={emptyText} />
        )
      ) : (
        // The table takes its height from this box: as tall as its rows, up to most of the window, then it
        // scrolls inside itself under its pinned header and draws only the rows in view.
        <div className="bo-users-rows">
          <DataTable aria-label={title} className="bo-users-table" isVirtualized rowLines={2} selectionMode="multiple"
            selectedKeys={selected}
            onSelectionChange={onSelect} sortDescriptor={sort} onSortChange={onSort}>
            {/* The header's check column is the one select-all (docs/DECISIONS.md): no toolbar "Select" checkbox. */}
            <DataTableHeader>
              <DataTableColumn id="name" isRowHeader allowsSorting width="2fr">Name</DataTableColumn>
              <DataTableColumn id="role" width="1.5fr">Role</DataTableColumn>
              <DataTableColumn id="lastActive" allowsSorting>Last active</DataTableColumn>
              <DataTableColumn id="joined" allowsSorting>Joined</DataTableColumn>
              <DataTableColumn id="options" align="options" showLabel={false}>Options</DataTableColumn>
            </DataTableHeader>
            <DataTableBody items={rows} dependencies={[manualGroup, onAct]}>
              {p => (
                <DataTableRow id={p.id} textValue={p.name} href={`#/users/${p.id}`}>
                  <DataTableCell><DataTablePerson name={p.name} initials={initials(p.name)} sub={p.email} /></DataTableCell>
                  <DataTableCell>
                    <DataTableStack sub={<AssignedItems person={p} />}>{p.role}</DataTableStack>
                  </DataTableCell>
                  <DataTableCell>{ago(p.lastActive)}</DataTableCell>
                  <DataTableCell>{day(p.joined)}</DataTableCell>
                  <DataTableCell align="options">
                    <RowOptions person={p} blocked={!!p.blocked} inManualGroup={manualGroup} onAction={a => onAct(p, a)} />
                  </DataTableCell>
                </DataTableRow>
              )}
            </DataTableBody>
          </DataTable>
        </div>
      )}
    </Panel>
  );
}

function HeaderActions() {
  const navigate = useNavigate();
  return (
    <Inline elementType="span" gap="8" wrap="nowrap">
      <Button variant="secondary" size={32} onPress={() => navigate('/users/seats')}><ShieldCheck aria-hidden size={16} />Seats overview</Button>
      <Button variant="secondary" size={32} onPress={() => navigate('/dashboard/users')}><ChartColumn aria-hidden size={16} />User insights</Button>
    </Inline>
  );
}

// The platform's languages (Settings' Platform configuration).
const LANGUAGES = LOCALES.map(l => l.id);

/** The real admin's two kinds of group: hand-picked members, or rules that fill the group by themselves. */
const KINDS = [
  {kind: 'manual' as const, title: 'Create a normal group', note: 'Add users to it by hand, from the users list.'},
  {kind: 'smart' as const, title: 'Create a smart group', note: 'Users who meet its rules join it by themselves.'}
];

type Rule = {id: number; rule: string | null; value: string | null};
let nextRule = 2;

/**
 * A smart group's rules, composed on the page (one use, so it stays here): a row per rule, the rule and its value as
 * two Selects, a remove ×, then "Add a rule". Users who meet every rule join the group.
 */
function SmartRules({rules, setRules}: {rules: Rule[]; setRules: (f: (r: Rule[]) => Rule[]) => void}) {
  const set = (id: number, patch: Partial<Rule>) => setRules(rs => rs.map(r => (r.id === id ? {...r, ...patch} : r)));
  return (
    <Stack gap="8">
      {/* slot={null}: inside the Choice card's radio, a Text would otherwise take its description slot. */}
      <Text elementType="p" kind="small" color="meta" slot={null}>Users who meet every rule join the group, and leave it, by themselves.</Text>
      {rules.map((r, i) => (
        <Inline key={r.id} gap="8" wrap="nowrap" alignItems="end">
          <Select label={`Rule ${i + 1}`} placeholder="Choose a rule" value={r.rule} className="bo-users-rule"
            onChange={k => set(r.id, {rule: String(k), value: null})}>
            {SMART_RULES.map(o => <SelectItem key={o.id} id={o.id}>{o.label}</SelectItem>)}
          </Select>
          <Select label={`Value ${i + 1}`} placeholder="Choose a value" value={r.value} className="bo-users-rule"
            isDisabled={!r.rule} onChange={k => set(r.id, {value: String(k)})}>
            {(SMART_RULES.find(o => o.id === r.rule)?.values ?? []).map(v => <SelectItem key={v} id={v}>{v}</SelectItem>)}
          </Select>
          <IconButton aria-label={`Remove rule ${i + 1}`} isDisabled={rules.length === 1}
            onPress={() => setRules(rs => rs.filter(x => x.id !== r.id))}><X aria-hidden size={16} /></IconButton>
        </Inline>
      ))}
      <span>
        <Button variant="quiet" size={32} onPress={() => setRules(rs => [...rs, {id: nextRule++, rule: null, value: null}])}>
          <Plus aria-hidden size={16} />Add a rule</Button>
      </span>
    </Stack>
  );
}

/** Add a new group (choose the kind, then name it) and Edit group (rename it): one modal, two starts. */
function GroupModal({editing, onClose, onSave}: {
  editing?: Group; onClose: () => void; onSave: (label: string, kind: Group['kind']) => void;
}) {
  const [kind, setKind] = useState<Group['kind'] | null>(editing?.kind ?? null);
  const [rules, setRules] = useState<Rule[]>([{id: 1, rule: null, value: null}]);
  const [names, setNames] = useState<Multiloc>(editing ? {[LANGUAGES[0]]: editing.label} : {});
  // The list shows the name in the platform's first language.
  const name = names[LANGUAGES[0]] ?? '';
  const title = editing ? 'Edit group' : 'Add a new group';
  const footer = (
    <>
      <Button variant="quiet" size={32} onPress={onClose}>Cancel</Button>
      <Button variant="primary" size={32} isDisabled={!kind || !name.trim()} onPress={() => kind && onSave(name.trim(), kind)}>Save group</Button>
    </>
  );
  return (
    <Modal title={title} isOpen onOpenChange={open => !open && onClose()} footer={footer}>
      <Stack gap="16">
      {/* The kinds are Choice cards in a RadioGroup (Choice card's stories); a smart group's rules open under its
          card once it is chosen (the card's `revealed` slot). */}
      {!editing && (
        <RadioGroup label="Kind of group" value={kind} onChange={v => setKind(v as Group['kind'])}>
          {KINDS.map(({kind: k, title: t, note}) => (
            <ChoiceCard key={k} value={k} description={note} media={icon(k === 'smart' ? Zap : UsersIcon)}
              revealed={k === 'smart' && <SmartRules rules={rules} setRules={setRules} />}>{t}</ChoiceCard>
          ))}
        </RadioGroup>
      )}
      {kind && <MultilingualTextField label="Name of the group" isRequired locales={LANGUAGES} value={names} onChange={setNames} autoFocus />}
      </Stack>
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
    <Modal description={`Add ${person.name} to a manual group.`} title="Add to group" isOpen onOpenChange={open => !open && onClose()} footer={
      <>
        <Button variant="quiet" size={32} onPress={onClose}>Cancel</Button>
        <Button variant="primary" size={32} isDisabled={!groupId} onPress={() => groupId && onAdd(groupId)}>Add to group</Button>
      </>}>
      <Stack gap="16">
        <Select label="Group" selectedKey={groupId} onSelectionChange={k => setGroupId(String(k))}>
          {manual.map(g => <SelectItem key={g.id} id={g.id}>{g.label}</SelectItem>)}
        </Select>
      </Stack>
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
  const [ask, setAsk] = useState<{kind: 'group' | 'block' | 'delete'; person: Member} | null>(null);
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
      toast('Group saved');
    } else {
      let id = slug(label);
      while (groups.some(g => g.id === id)) id += '-2';
      setGroups(gs => [...gs, {id, label, kind, members: []}]);
      toast('Group created', label);
      navigate(`/users/groups/${id}`);
    }
    setModal(null);
  };
  const remove = () => {
    setGroups(gs => gs.filter(g => g.id !== group!.id));
    toast('Group deleted');
    setModal(null); setSegment('all'); navigate('/users');
  };
  const addToGroup = (ids: string[], groupId: string) => {
    const target = groups.find(g => g.id === groupId);
    if (!target) return;
    const added = ids.filter(id => !target.members.includes(id));
    const members = (f: (m: string[]) => string[]) => setGroups(gs => gs.map(g => (g.id === groupId ? {...g, members: f(g.members)} : g)));
    members(m => [...m, ...added]);
    toast(ids.length === 1 ? `1 user added to ${target.label}` : `${ids.length} users added to ${target.label}`, undefined, {action: 'Undo', onAction: () => members(m => m.filter(id => !added.includes(id)))});
    setAsk(null);
  };
  // Out of a manual group at once, with Undo (the group's own list, its row menu or the Selection bar).
  const removeFromGroup = (ids: string[]) => {
    if (!group) return;
    const before = group.members;
    setGroups(gs => gs.map(g => (g.id === group.id ? {...g, members: g.members.filter(m => !ids.includes(m))} : g)));
    toast(ids.length === 1 ? `1 user removed from ${group.label}` : `${ids.length} users removed from ${group.label}`, undefined, {action: 'Undo', onAction: () => setGroups(gs => gs.map(g => (g.id === group.id ? {...g, members: before} : g)))});
  };
  const setRole = (id: string, role: Person['role']) => setPeople(ps => ps.map(p => (p.id === id ? {...p, role} : p)));
  const setBlocked = (id: string, blocked: boolean) => setPeople(ps => ps.map(p => (p.id === id ? {...p, blocked} : p)));
  const onRowAction = (person: Member, a: RowAction) => {
    if (a === 'group' || a === 'block' || a === 'delete') { setAsk({kind: a, person}); return; }
    if (a === 'ungroup') { removeFromGroup([person.id]); return; }
    if (a === 'unblock') {
      setBlocked(person.id, false);
      toast(`${person.name} is unblocked`, 'They can sign in and take part again.', {action: 'Undo', onAction: () => setBlocked(person.id, true)});
      return;
    }
    // As on the profile page: the admin rights go on and off from the same item, at once, with Undo.
    const admin = person.role === 'Platform admin';
    setRole(person.id, admin ? 'Registered user' : 'Platform admin');
    toast(admin ? `${person.name} is no longer a platform admin` : `${person.name} is now a platform admin`, undefined, {action: 'Undo', onAction: () => setRole(person.id, person.role)});
  };
  const confirm = () => {
    if (!ask) return;
    const {kind, person} = ask;
    if (kind === 'block') {
      setBlocked(person.id, true);
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
          onDeleteGroup={() => setModal('delete')} onRowAction={onRowAction} onAddToGroup={addToGroup}
          onRemoveFromGroup={removeFromGroup} />
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
    </Page>
  );
}
