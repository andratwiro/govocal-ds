import {useState} from 'react';
import {useParams} from 'react-router';
import {Download, Send, ShieldCheck} from 'lucide-react';
import {DataTable, DataTableHeader, DataTableColumn, DataTableBody, DataTableRow, DataTableCell, DataTableEmpty,
  DataTablePerson} from '../../../src/components/gv/DataTable';
import {Tabs, TabList, Tab, TabPanel} from '../../../src/components/Tabs';
import {TextArea} from '../../../src/components/TextField';
import {Select, SelectItem} from '../../../src/components/Select';
import {Button} from '../../../src/components/Button';
import {Meter} from '../../../src/components/Meter';
import {MyToastRegion, queue} from '../../../src/components/Toast';
import {Card} from '../../../src/components/gv/Card';
import {Kpi} from '../../../src/components/gv/Kpi';
import {Avatar} from '../../../src/components/gv/Avatar';
import {Status} from '../../../src/components/gv/Status';
import {Banner} from '../../../src/components/gv/Banner';
import {GROUPS, INVITATIONS, PARTICIPATION, PEOPLE, SEATS, type Invitation, type Person, type Role} from '../data-users';
import {date, initials} from './Users';
import {Page} from './Page';

// The Users page's first clicks, each on its own route as in the real admin: invitations, seats, a profile.
const USERS_CRUMB = [{key: 'users', label: 'Users', href: '#/users'}];
const ROLES: Role[] = ['Registered user', 'Platform admin', 'Project manager', 'Folder manager'];
const toast = (title: string, description?: string) => queue.add({title, description}, {timeout: 5000});

// ── Invitations ──────────────────────────────────────────────────────────────

function InviteForm({onSend}: {onSend: (emails: string[], role: Role) => void}) {
  const [emails, setEmails] = useState('');
  const [role, setRole] = useState<Role>('Registered user');
  const [message, setMessage] = useState('');
  const list = emails.split(/[\s,;]+/).filter(e => e.includes('@'));
  const send = () => { onSend(list, role); setEmails(''); setMessage(''); };
  return (
    <Card tone="manage" layout="stacked" title="Invite by email">
      <div className="bo-users-form">
        <TextArea label="Email addresses" description="Separate addresses with a comma or a new line."
          placeholder="name@example.org, other@example.org" value={emails} onChange={setEmails} />
        <div className="bo-users-pair">
          <Select label="Role" selectedKey={role} onSelectionChange={k => setRole(k as Role)}>
            {ROLES.map(r => <SelectItem key={r} id={r}>{r}</SelectItem>)}
          </Select>
          {/* "No group" is an item, not a placeholder: the starter Select's placeholder grey is under 4.5:1. */}
          <Select label="Add to a group" defaultSelectedKey="none">
            <SelectItem id="none">No group</SelectItem>
            {GROUPS.filter(g => g.kind === 'manual').map(g => <SelectItem key={g.id} id={g.id}>{g.label}</SelectItem>)}
          </Select>
        </div>
        <TextArea label="Invitation message" description="Added to the invitation email, above the button to sign up."
          value={message} onChange={setMessage} />
        <div className="bo-users-buttons">
          <span className="bo-note">{list.length === 1 ? '1 address' : `${list.length} addresses`}</span>
          <span className="bo-push" />
          <Button variant="primary" size={32} isDisabled={list.length === 0} onPress={send}><Send aria-hidden size={16} />Send invites</Button>
        </div>
      </div>
    </Card>
  );
}

function InvitationTable({invitations}: {invitations: Invitation[]}) {
  return (
    <Card tone="manage" title="All invitations" pills={[{label: String(invitations.length)}]}
      actions={<Button variant="quiet" size={32} onPress={() => toast('Export started', 'invitations.xlsx')}>
        <Download aria-hidden size={16} />Export all invitations</Button>}>
      <div className="bo-users-scroll">
        <DataTable aria-label="All invitations">
          <DataTableHeader>
            <DataTableColumn isRowHeader>Email</DataTableColumn>
            <DataTableColumn>Role</DataTableColumn>
            <DataTableColumn>Invited</DataTableColumn>
            <DataTableColumn>Status</DataTableColumn>
          </DataTableHeader>
          <DataTableBody renderEmptyState={() => <DataTableEmpty>No invitations yet.</DataTableEmpty>}>
            {invitations.map(i => (
              <DataTableRow key={i.id} id={i.id} textValue={i.email}>
                <DataTableCell>{i.email}</DataTableCell>
                <DataTableCell><span className="bo-users-nowrap">{i.role}</span></DataTableCell>
                <DataTableCell><span className="bo-users-nowrap">{i.invited}</span></DataTableCell>
                <DataTableCell><Status state={i.status === 'Accepted' ? 'live' : 'draft'}>{i.status}</Status></DataTableCell>
              </DataTableRow>
            ))}
          </DataTableBody>
        </DataTable>
      </div>
    </Card>
  );
}

export function UserInvitations() {
  const [invitations, setInvitations] = useState(INVITATIONS);
  const [tab, setTab] = useState<string>('invite');
  const send = (emails: string[], role: Role) => {
    setInvitations(list => [...emails.map((email, n) => (
      {id: `new-${list.length + n}`, email, role, invited: 'October 29, 2026', status: 'Pending' as const})), ...list]);
    toast(emails.length === 1 ? '1 invitation sent' : `${emails.length} invitations sent`, 'They appear under All invitations.');
  };
  return (
    <Page title="Invitations" crumbs={USERS_CRUMB}
      description="Invite people to the platform by email. They get a link to sign up, with the role and group you choose.">
      <Tabs selectedKey={tab} onSelectionChange={k => setTab(String(k))}>
        <TabList aria-label="Invitations">
          <Tab id="invite">Invite users</Tab>
          <Tab id="all">All invitations</Tab>
        </TabList>
        <TabPanel id="invite"><div className="bo-users-panel"><InviteForm onSend={send} /></div></TabPanel>
        <TabPanel id="all"><div className="bo-users-panel"><InvitationTable invitations={invitations} /></div></TabPanel>
      </Tabs>
      <MyToastRegion />
    </Page>
  );
}

// ── Seats overview ───────────────────────────────────────────────────────────

function PeopleTable({label, people}: {label: string; people: Person[]}) {
  return (
    <Card tone="manage" title={label} pills={[{label: String(people.length)}]}>
      <div className="bo-users-scroll">
        <DataTable aria-label={label}>
          <DataTableHeader>
            <DataTableColumn isRowHeader>Name</DataTableColumn>
            <DataTableColumn>Role</DataTableColumn>
            <DataTableColumn>Joined</DataTableColumn>
          </DataTableHeader>
          <DataTableBody>
            {people.map(p => (
              <DataTableRow key={p.id} id={p.id} textValue={p.name} href={`#/users/${p.id}`}>
                <DataTableCell><DataTablePerson name={p.name} initials={initials(p.name)} sub={p.email} /></DataTableCell>
                <DataTableCell><span className="bo-users-nowrap">{p.role}</span></DataTableCell>
                <DataTableCell><span className="bo-users-nowrap">{date(p.joined)}</span></DataTableCell>
              </DataTableRow>
            ))}
          </DataTableBody>
        </DataTable>
      </div>
    </Card>
  );
}

export function SeatsOverview() {
  const admins = PEOPLE.filter(p => p.role === 'Platform admin');
  const managers = PEOPLE.filter(p => p.role.endsWith('manager'));
  return (
    <Page title="Seats overview" crumbs={USERS_CRUMB}
      description="Your plan includes a number of admin and manager seats. Everyone else takes part for free.">
      <div className="bo-users-stack">
        <div className="bo-users-kpis">
          <Kpi label="Admin seats used" value={admins.length} note={`of ${SEATS.admins} in your plan`} />
          <Kpi label="Admin seats available" value={SEATS.admins - admins.length} type="tall" />
          <Kpi label="Manager seats used" value={managers.length} note={`of ${SEATS.managers} in your plan`} />
          <Kpi label="Manager seats available" value={SEATS.managers - managers.length} type="tall" />
        </div>
        <div className="bo-users-pair">
          <Meter label="Admin seats" value={admins.length} maxValue={SEATS.admins} valueLabel={`${admins.length} of ${SEATS.admins}`} />
          <Meter label="Manager seats" value={managers.length} maxValue={SEATS.managers} valueLabel={`${managers.length} of ${SEATS.managers}`} />
        </div>
        <Banner>Need more seats? Your Go Vocal success manager can add them to your plan.</Banner>
        <PeopleTable label="Admins" people={admins} />
        <PeopleTable label="Managers" people={managers} />
      </div>
    </Page>
  );
}

// ── A user's profile ─────────────────────────────────────────────────────────

export function UserProfile() {
  const {userId} = useParams();
  const person = PEOPLE.find(p => p.id === userId);
  const [role, setRole] = useState<Role | undefined>(person?.role);
  if (!person) return <Page title="User not found" crumbs={USERS_CRUMB}><p className="bo-note">This user is not on the platform.</p></Page>;
  const done = PARTICIPATION[person.id] ?? {ideas: 0, comments: 0, votes: 0, projects: 0};
  const admin = role === 'Platform admin';
  const toggleAdmin = () => {
    setRole(admin ? 'Registered user' : 'Platform admin');
    toast(admin ? `${person.name} is no longer a platform admin` : `${person.name} is now a platform admin`);
  };
  return (
    <Page title={person.name} crumbs={USERS_CRUMB}
      actions={<Button variant="secondary" size={32} onPress={toggleAdmin}><ShieldCheck aria-hidden size={16} />
        {admin ? 'Remove platform admin rights' : 'Make platform admin'}</Button>}>
      <div className="bo-users-stack">
        <Card tone="manage" layout="stacked" title="Profile">
          <div className="bo-users-profile">
            <Avatar initials={initials(person.name)} />
            <dl className="bo-users-facts">
              <dt className="bo-note">Email</dt><dd>{person.email ?? 'No email (signed up by phone)'}</dd>
              <dt className="bo-note">Role</dt><dd>{role}</dd>
              <dt className="bo-note">Joined</dt><dd>{date(person.joined)}</dd>
            </dl>
          </div>
        </Card>
        <section aria-label="Participation" className="bo-users-kpis">
          <Kpi label="Ideas" value={done.ideas} />
          <Kpi label="Comments" value={done.comments} />
          <Kpi label="Votes" value={done.votes} />
          <Kpi label="Projects" value={done.projects} />
        </section>
      </div>
      <MyToastRegion />
    </Page>
  );
}
