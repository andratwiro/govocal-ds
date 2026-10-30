import {useState} from 'react';
import {useParams} from 'react-router';
import {Download, MailX, RotateCw, SearchX, Send, ShieldCheck, ShieldOff, Trash2, UserX, Users as UsersIcon} from 'lucide-react';
import {Avatar, Badge, Banner, BarRow, Button, DataTable, DataTableBody, DataTableCell, DataTableColumn, DataTableHeader,
  DataTableOptions, DataTablePerson, DataTableRow, EmptyState, Inline, Link, MenuItem, Pagination, Panel, PropertyList,
  PropertyListItem, SearchField, Select, SelectItem, Separator, Stack, StatTile, Tab, TableToolbar, TabList, TabPanel,
  TabPanels, Tabs, Text, TextArea, TileGrid, toast} from 'govocal-ds';
import {INVITATIONS, PARTICIPATION, SEATS, SEATS_A_MONTH_AGO, type Invitation, type Person, type Role} from '../data-users';
import {ago, assignedTo, groupStore, initials, PAGE_SIZE, peopleStore} from './Users';
import {TODAY, useDay} from '../dates';
import {Page} from './Page';

// The Users page's first clicks, each on its own route as in the real admin: invitations, seats, a profile.
const USERS_CRUMB = [{key: 'users', label: 'Users', href: '#/users'}];
/** The roles an invitation can give, each with what it lets someone do (Select's "With descriptions" story). */
const ROLES: {role: Role; note: string}[] = [
  {role: 'Registered user', note: 'Takes part: posts, comments and votes.'},
  {role: 'Platform admin', note: 'Manages everything on the platform. Takes an admin seat.'},
  {role: 'Project manager', note: 'Manages the projects you give them. Takes a manager seat.'},
  {role: 'Folder manager', note: 'Manages a folder and its projects. Takes a manager seat.'}
];
const icon = (Icon: typeof Send) => <Icon aria-hidden size={16} />;

/** The page of a list to show, and how many pages it has (every admin table pages: docs/DECISIONS.md). */
function usePage<T>(list: T[]) {
  const [page, setPage] = useState(1);
  const pageCount = Math.max(1, Math.ceil(list.length / PAGE_SIZE));
  const current = Math.min(page, pageCount);
  return {page: current, pageCount, setPage, shown: list.slice((current - 1) * PAGE_SIZE, current * PAGE_SIZE)};
}

// ── Invitations ──────────────────────────────────────────────────────────────

/** Invite by email: a form in a Panel, its count and Send invites in the foot (one form shape, docs/DECISIONS.md). */
function InviteForm({onSend}: {onSend: (emails: string[], role: Role) => void}) {
  const [emails, setEmails] = useState('');
  const [role, setRole] = useState<Role>('Registered user');
  const [message, setMessage] = useState('');
  const list = emails.split(/[\s,;]+/).filter(e => e.includes('@'));
  const send = () => { onSend(list, role); setEmails(''); setMessage(''); };
  return (
    <Panel title="Invite by email" description="Each address gets a link to sign up, with the role and group you choose."
      footer={(
        <Inline gap="8">
          <Text kind="small" color="meta">{list.length === 1 ? '1 address' : `${list.length} addresses`}</Text>
          <Button variant="primary" size={32} isDisabled={list.length === 0} onPress={send}>{icon(Send)}Send invites</Button>
        </Inline>
      )}>
      <Stack gap="16" className="bo-users-form">
        <TextArea label="Email addresses" description="Separate addresses with a comma or a new line."
          placeholder="name@example.org, other@example.org" value={emails} onChange={setEmails} />
        <TileGrid minTileWidth={220}>
          <Select label="Role" selectedKey={role} onSelectionChange={k => setRole(k as Role)}>
            {ROLES.map(r => <SelectItem key={r.role} id={r.role} textValue={r.role} description={r.note}>{r.role}</SelectItem>)}
          </Select>
          <Select label="Add to a group" placeholder="No group">
            {groupStore.groups.filter(g => g.kind === 'manual').map(g => (
              <SelectItem key={g.id} id={g.id} icon={icon(UsersIcon)}>{g.label}</SelectItem>
            ))}
          </Select>
        </TileGrid>
        <TextArea label="Invitation message" description="Added to the invitation email, above the button to sign up."
          value={message} onChange={setMessage} />
      </Stack>
    </Panel>
  );
}

function InvitationTable({invitations, onResend, onDelete}: {
  invitations: Invitation[]; onResend: (i: Invitation) => void; onDelete: (i: Invitation) => void;
}) {
  const day = useDay();
  const [query, setQuery] = useState('');
  const found = invitations.filter(i => i.email.toLowerCase().includes(query.trim().toLowerCase()));
  const {page, pageCount, setPage, shown} = usePage(found);
  // One count, in the toolbar, following the search (docs/DECISIONS.md).
  return (
    <Panel title="All invitations" isFlush
      actions={<Button variant="quiet" size={32} onPress={() => toast('Export started', 'invitations.xlsx')}>
        {icon(Download)}Export all invitations</Button>}
      toolbar={(
        <TableToolbar aria-label="Invitation tools"
          heading={`${found.length} ${found.length === 1 ? 'invitation' : 'invitations'}`} headingLevel={3}>
          <SearchField aria-label="Search invitations" placeholder="Search by email" value={query}
            onChange={q => { setQuery(q); setPage(1); }} />
        </TableToolbar>
      )}
      footer={found.length > 0 && <Pagination page={page} pageCount={pageCount} onPageChange={setPage} aria-label="Invitation pages" />}>
      {found.length === 0 ? (
        query
          ? <EmptyState layout="panel" headingLevel={3} icon={<SearchX size={24} />} title="No invitations match" description="Try another email address." />
          : <EmptyState layout="panel" headingLevel={3} icon={<MailX size={24} />} title="No invitations yet"
              description="Invitations you send show here, with whether they were accepted." />
      ) : (
      <div className="bo-users-scroll">
        <DataTable aria-label="All invitations">
          <DataTableHeader>
            <DataTableColumn isRowHeader>Email</DataTableColumn>
            <DataTableColumn>Role</DataTableColumn>
            <DataTableColumn>Invited</DataTableColumn>
            <DataTableColumn>Status</DataTableColumn>
            <DataTableColumn align="options" showLabel={false}>Options</DataTableColumn>
          </DataTableHeader>
          <DataTableBody>
            {shown.map(i => (
              <DataTableRow key={i.id} id={i.id} textValue={i.email}>
                <DataTableCell>{i.email}</DataTableCell>
                <DataTableCell>{i.role}</DataTableCell>
                <DataTableCell>{day(i.invited)}</DataTableCell>
                {/* A status of an invitation, not of a project: a Badge (outlined while it waits). */}
                <DataTableCell><Badge variant={i.status === 'Pending' ? 'outlined' : 'filled'}>{i.status}</Badge></DataTableCell>
                <DataTableCell align="options">
                  <DataTableOptions aria-label={`Options for ${i.email}`}
                    onAction={k => (k === 'resend' ? onResend(i) : onDelete(i))}>
                    {i.status === 'Pending' && <MenuItem id="resend" icon={icon(RotateCw)}>Resend invitation</MenuItem>}
                    {i.status === 'Pending' && <Separator />}
                    <MenuItem id="delete" icon={icon(Trash2)}>Delete invitation</MenuItem>
                  </DataTableOptions>
                </DataTableCell>
              </DataTableRow>
            ))}
          </DataTableBody>
        </DataTable>
      </div>
      )}
    </Panel>
  );
}

export function UserInvitations() {
  const [invitations, setInvitations] = useState(INVITATIONS);
  const [tab, setTab] = useState<string>('invite');
  const send = (emails: string[], role: Role) => {
    setInvitations(list => [...emails.map((email, n) => (
      {id: `new-${list.length + n}`, email, role, invited: TODAY, status: 'Pending' as const})), ...list]);
    toast(emails.length === 1 ? '1 invitation sent' : `${emails.length} invitations sent`, 'They appear under All invitations.');
  };
  // Delete is instant, with Undo (docs/DECISIONS.md): the invitation goes back where it was.
  const remove = (i: Invitation) => {
    const at = invitations.indexOf(i);
    setInvitations(list => list.filter(x => x.id !== i.id));
    toast('Invitation deleted', i.email, {action: 'Undo', onAction: () => setInvitations(list => [...list.slice(0, at), i, ...list.slice(at)])});
  };
  return (
    <Page title="Invitations" crumbs={USERS_CRUMB}
      description="Invite people to the platform by email. They get a link to sign up, with the role and group you choose.">
      <Tabs selectedKey={tab} onSelectionChange={k => setTab(String(k))}>
        <TabList aria-label="Invitations">
          <Tab id="invite">Invite users</Tab>
          <Tab id="all" count={invitations.length}>All invitations</Tab>
        </TabList>
        <TabPanels>
        <TabPanel id="invite"><div className="bo-users-panel"><InviteForm onSend={send} /></div></TabPanel>
        <TabPanel id="all"><div className="bo-users-panel">
          <InvitationTable invitations={invitations} onDelete={remove}
            onResend={i => toast('Invitation sent again', i.email)} />
        </div></TabPanel>
        </TabPanels>
      </Tabs>
    </Page>
  );
}

// ── Seats overview ───────────────────────────────────────────────────────────

function PeopleTable({label, people, empty}: {label: string; people: Person[]; empty: string}) {
  const day = useDay();
  const {page, pageCount, setPage, shown} = usePage(people);
  return (
    <Panel title={label} count={people.length} isFlush
      footer={people.length > 0 && <Pagination page={page} pageCount={pageCount} onPageChange={setPage} aria-label={`${label} pages`} />}>
      {people.length === 0 ? <EmptyState layout="panel" headingLevel={3} icon={<UsersIcon size={24} />} title={empty} /> : (
      <div className="bo-users-scroll">
        <DataTable aria-label={label}>
          <DataTableHeader>
            <DataTableColumn isRowHeader>Name</DataTableColumn>
            <DataTableColumn>Role</DataTableColumn>
            <DataTableColumn>Joined</DataTableColumn>
          </DataTableHeader>
          <DataTableBody>
            {shown.map(p => (
              <DataTableRow key={p.id} id={p.id} textValue={p.name} href={`#/users/${p.id}`}>
                <DataTableCell><DataTablePerson name={p.name} initials={initials(p.name)} sub={p.email} /></DataTableCell>
                <DataTableCell>{p.role}</DataTableCell>
                <DataTableCell>{day(p.joined)}</DataTableCell>
              </DataTableRow>
            ))}
          </DataTableBody>
        </DataTable>
      </div>
      )}
    </Panel>
  );
}

/** A month's change in seats taken, as a Stat tile's trend. */
const trend = (now: number, before: number) => ({
  direction: now > before ? 'up' as const : now < before ? 'down' as const : 'flat' as const,
  value: `${now > before ? '+' : ''}${now - before}`, label: 'since last month'
});

export function SeatsOverview() {
  const people = peopleStore.people.filter(p => !p.blocked);
  const admins = people.filter(p => p.role === 'Platform admin');
  const managers = people.filter(p => p.role.endsWith('manager'));
  return (
    <Page title="Seats overview" crumbs={USERS_CRUMB}
      description="Your plan includes a number of admin and manager seats. Everyone else takes part for free.">
      <Stack gap="16">
        {/* Stat tiles with their trend and, behind the help icon, what counts (Stat tile's "With trend", "With info"). */}
        <TileGrid minTileWidth={160} density="compact">
          <StatTile label="Admin seats used" value={admins.length} note={`of ${SEATS.admins} in your plan`}
            trend={trend(admins.length, SEATS_A_MONTH_AGO.admins)} info="Every platform admin takes one admin seat." />
          <StatTile label="Admin seats available" value={SEATS.admins - admins.length} layout="tall"
            info="Admin seats left in your plan before it needs more." />
          <StatTile label="Manager seats used" value={managers.length} note={`of ${SEATS.managers} in your plan`}
            trend={trend(managers.length, SEATS_A_MONTH_AGO.managers)}
            info="Every project, folder or space manager takes one manager seat." />
          <StatTile label="Manager seats available" value={SEATS.managers - managers.length} layout="tall"
            info="Manager seats left in your plan before it needs more." />
        </TileGrid>
        {/* How full each kind of seat is: a Bar row each (the share filled, "2 of 5" at the end), in one Panel. */}
        <Panel title="Seats in your plan">
          <Stack gap="8">
            <BarRow label="Admin seats" percent={(admins.length / SEATS.admins) * 100} value={`${admins.length} of ${SEATS.admins}`} />
            <BarRow label="Manager seats" percent={(managers.length / SEATS.managers) * 100} value={`${managers.length} of ${SEATS.managers}`} />
          </Stack>
        </Panel>
        <Banner tone="info">Need more seats? Your Go Vocal success manager can add them to your plan.</Banner>
        <PeopleTable label="Admins" people={admins} empty="No admins hold a seat" />
        <PeopleTable label="Managers" people={managers} empty="No managers hold a seat" />
      </Stack>
    </Page>
  );
}

// ── A user's profile ─────────────────────────────────────────────────────────

export function UserProfile() {
  const {userId} = useParams();
  const day = useDay();
  // The list's changes (a role, a group, a deletion) show here too.
  const person = peopleStore.people.find(p => p.id === userId);
  const [role, setRoleState] = useState<Role | undefined>(person?.role);
  if (!person) {
    return (
      <Page title="User not found" crumbs={USERS_CRUMB}>
        <EmptyState icon={<UserX size={24} />} headingLevel={2} title="This user is not on the platform"
          description="They may have been deleted. Their inputs stay, without a name." />
      </Page>
    );
  }
  const done = PARTICIPATION[person.id] ?? {ideas: 0, comments: 0, votes: 0, projects: 0};
  const groups = groupStore.groups.filter(g => g.members.includes(person.id));
  const assigned = role ? assignedTo({...person, role}) : [];
  const admin = role === 'Platform admin';
  const setRole = (next: Role) => {
    setRoleState(next);
    peopleStore.people = peopleStore.people.map(p => (p.id === person.id ? {...p, role: next} : p));
  };
  // At once, with Undo, as from the list's row menu.
  const toggleAdmin = () => {
    const was = role!;
    setRole(admin ? 'Registered user' : 'Platform admin');
    toast(admin ? `${person.name} is no longer a platform admin` : `${person.name} is now a platform admin`, undefined, {action: 'Undo', onAction: () => setRole(was)});
  };
  return (
    <Page title={person.name} crumbs={USERS_CRUMB}
      actions={<Button variant="secondary" size={32} onPress={toggleAdmin}>{icon(admin ? ShieldOff : ShieldCheck)}
        {admin ? 'Remove platform admin rights' : 'Make platform admin'}</Button>}>
      <Stack gap="16">
        {/* The facts as a Property list (label · value rows), the person's Avatar beside them. */}
        <Panel title="Profile">
          <Inline gap="16" alignItems="start" wrap="nowrap">
            <Avatar initials={initials(person.name)} />
            <PropertyList>
              <PropertyListItem label="Email" emptyLabel="No email">{person.email ?? 'No email (signed up by phone)'}</PropertyListItem>
              <PropertyListItem label="Role">{role}</PropertyListItem>
              <PropertyListItem label="Joined">{day(person.joined)}</PropertyListItem>
              <PropertyListItem label="Last active" emptyLabel="Not since joining">{ago(person.lastActive)}</PropertyListItem>
              {/* What a manager manages: the list the Users table's "assigned items" link leads to. */}
              {role !== 'Registered user' && role !== 'Platform admin' && (
                <PropertyListItem label="Assigned items" emptyLabel="No assigned items">
                  {assigned.length > 0 && (
                    <Inline elementType="span" gap="4">{assigned.map(a => a.href
                      ? <Link key={a.id} href={a.href}>{a.label}</Link>
                      : <Badge key={a.id} variant="value">{a.label}</Badge>)}</Inline>
                  )}
                </PropertyListItem>
              )}
              <PropertyListItem label="Groups" emptyLabel="In no group">
                {groups.length > 0 && (
                  <Inline elementType="span" gap="4">{groups.map(g => <Badge key={g.id} variant="value">{g.label}</Badge>)}</Inline>
                )}
              </PropertyListItem>
            </PropertyList>
          </Inline>
        </Panel>
        {/* A count of 0 is a tile like the others (Stat tile's Empty story): the band keeps its shape. */}
        <Panel title="Participation" description="What this user did on the platform, across every project.">
          <TileGrid minTileWidth={160} density="compact">
            <StatTile label="Ideas" value={done.ideas} />
            <StatTile label="Comments" value={done.comments} />
            <StatTile label="Votes" value={done.votes} />
            <StatTile label="Projects" value={done.projects} info="Projects this user took part in, in any phase." />
          </TileGrid>
        </Panel>
      </Stack>
    </Page>
  );
}
