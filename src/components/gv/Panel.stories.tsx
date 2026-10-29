import {useState} from 'react';
import type {Meta, StoryObj} from '@storybook/react-vite';
import {ExternalLink, Plus, SquarePen} from 'lucide-react';
import {Panel} from './Panel';
import {Pagination} from './Pagination';
import {DataTable, DataTableBody, DataTableCell, DataTableColumn, DataTableHeader, DataTablePerson, DataTableRow} from './DataTable';
import {StatusBadge} from './StatusBadge';
import {Button} from '../Button';
import {TextArea, TextField} from '../TextField';
import {PORTRAITS} from './story-images';

const meta: Meta<typeof Panel> = {
  title: 'Components/Layout & containers/Panel',
  component: Panel,
  parameters: {layout: 'padded'},
  tags: ['autodocs', 'not-in-figma']
};
export default meta;
type Story = StoryObj<typeof Panel>;

// Invented participants and emails.
const PEOPLE = [
  {id: 'a', name: 'Resident A', initials: 'RA', email: 'user1@example.org', role: 'Registered user', joined: '27 August 2026'},
  {id: 'e', name: 'Resident E', initials: 'RE', email: 'user5@example.org', role: 'Registered user', joined: '4 December 2025'},
  {id: 'b', name: 'Manager B', initials: 'MB', email: 'user2@example.org', role: 'Project manager', joined: '7 November 2025'},
  {id: 'c', name: 'Admin C', initials: 'AC', email: 'user3@example.org', role: 'Platform admin', joined: '24 September 2025'}
];

function Participants() {
  return (
    <DataTable aria-label="All participants">
      <DataTableHeader>
        <DataTableColumn isRowHeader>Name</DataTableColumn>
        <DataTableColumn>Role</DataTableColumn>
        <DataTableColumn>Joined</DataTableColumn>
      </DataTableHeader>
      <DataTableBody>
        {PEOPLE.map((p, i) => (
          <DataTableRow key={p.id} id={p.id} textValue={p.name}>
            <DataTableCell><DataTablePerson name={p.name} initials={p.initials} src={PORTRAITS[i]} sub={p.email} /></DataTableCell>
            <DataTableCell>{p.role}</DataTableCell>
            <DataTableCell>{p.joined}</DataTableCell>
          </DataTableRow>
        ))}
      </DataTableBody>
    </DataTable>
  );
}

const EMAILS = [
  {title: 'The park plan is live: share your ideas', state: 'live' as const, words: 'Sent', meta: 'Sent to 170 recipients · 14 May 2026 · 62% opened'},
  {title: 'Voting is open: help pick the shortlist', state: 'live' as const, words: 'Sent', meta: 'Sent to 148 recipients · 2 June 2026 · 58% opened'},
  {title: 'Thank you for taking part: here is what we heard', state: 'draft' as const, words: 'Draft', meta: 'Not sent yet'}
];

function Emails() {
  return (
    <ul style={{listStyle: 'none', margin: 0, padding: 0}}>
      {EMAILS.map((e, i) => (
        <li key={e.title} style={{display: 'flex', alignItems: 'center', gap: 16, padding: '14px 20px',
          borderTop: i ? '1px solid var(--gv-divider-default)' : undefined}}>
          <div style={{flex: 1, display: 'grid', gap: 4}}>
            <span style={{font: 'var(--gv-type-ui-strong)'}}>{e.title}</span>
            <span style={{display: 'flex', alignItems: 'center', gap: 8, font: 'var(--gv-type-small)', color: 'var(--gv-text-secondary)'}}>
              <StatusBadge state={e.state}>{e.words}</StatusBadge>{e.meta}
            </span>
          </div>
          <Button variant="secondary" size={32}>
            {e.state === 'draft' ? <SquarePen aria-hidden size={16} /> : <ExternalLink aria-hidden size={16} />}
            {e.state === 'draft' ? 'Manage' : 'View'}
          </Button>
        </li>
      ))}
    </ul>
  );
}

function PagedParticipants() {
  const [page, setPage] = useState(1);
  return (
    <Panel title="All participants" count={2184} description="Everyone who has taken part in this project." flush
      footer={<Pagination page={page} pageCount={8} onPageChange={setPage} aria-label="Participant pages" />}>
      <Participants />
    </Panel>
  );
}

/** A plain panel; with a count and description; with a head action; with a foot. */
export const AllVariants: Story = {
  name: 'AllVariants',
  render: () => (
    <div style={{display: 'grid', gridTemplateColumns: 'repeat(2, minmax(0, 1fr))', gap: 24, maxWidth: 1100}}>
      <Panel title="About this project">
        <p style={{margin: 0, font: 'var(--gv-type-body)'}}>Residents pick what changes in the old depot site first.</p>
      </Panel>
      <Panel title="All participants" count={2184} description="Everyone who has taken part in this project.">
        <p style={{margin: 0, font: 'var(--gv-type-body)'}}>The table goes here.</p>
      </Panel>
      <Panel title="Custom emails" description="Send custom emails to participants and check how they did."
        actions={<Button size={32}><Plus aria-hidden size={16} />Create email</Button>}>
        <p style={{margin: 0, font: 'var(--gv-type-body)'}}>The emails go here.</p>
      </Panel>
      <Panel title="New email" footer={<><Button variant="secondary" size={32}>Cancel</Button><Button size={32}>Send</Button></>}>
        <p style={{margin: 0, font: 'var(--gv-type-body)'}}>The form goes here.</p>
      </Panel>
    </div>
  )
};

/** A title over a padded body. */
export const Default: Story = {
  render: () => (
    <div style={{maxWidth: 560}}>
      <Panel title="About this project">
        <p style={{margin: 0, font: 'var(--gv-type-body)'}}>
          Residents pick what changes in the old depot site first: a pocket park, covered bike parking or a market hall.
        </p>
      </Panel>
    </div>
  )
};

/** The Audience table's card: "All participants" with its count Badge and a description, the table flush. */
export const WithCountAndDescription: Story = {
  name: 'With count and description',
  render: () => (
    <div style={{maxWidth: 900}}>
      <Panel title="All participants" count={2184} description="Everyone who has taken part in this project." flush>
        <Participants />
      </Panel>
    </div>
  )
};

/** The Messaging panel: a primary action at the head's end, a flush list of emails. */
export const WithActions: Story = {
  name: 'With actions',
  render: () => (
    <div style={{maxWidth: 900}}>
      <Panel title="Custom emails" description="Send custom emails to participants and check how they did." flush
        actions={<Button size={32}><Plus aria-hidden size={16} />Create email</Button>}>
        <Emails />
      </Panel>
    </div>
  )
};

/** A foot under a lighter hairline: the table's Pagination. */
export const WithFooter: Story = {
  name: 'With footer',
  render: () => <div style={{maxWidth: 900}}><PagedParticipants /></div>
};

/** The email composer: the form in the body, Cancel and Send in the foot. */
export const InAComposer: Story = {
  name: 'In a composer',
  render: () => (
    <div style={{maxWidth: 720}}>
      <Panel title="New email" description="All participants · 2,184 recipients"
        footer={<><Button variant="secondary" size={32}>Cancel</Button><Button size={32}>Send</Button></>}>
        <div style={{display: 'grid', gap: 16}}>
          <TextField label="Subject" defaultValue="Voting is open: help pick the shortlist" />
          <TextArea label="Message" defaultValue="The shortlist is ready. You have until 16 November to vote." />
        </div>
      </Panel>
    </div>
  )
};

/** Right to left (Arabic): the title and count at the right, the action at the left; the count in Arabic digits. */
export const RightToLeft: Story = {
  name: 'Right to left',
  globals: {direction: 'rtl'},
  render: () => (
    <div style={{maxWidth: 900}}>
      <Panel title="All participants" count={2184} description="Everyone who has taken part in this project."
        actions={<Button size={32}><Plus aria-hidden size={16} />Invite</Button>} flush>
        <Participants />
      </Panel>
    </div>
  )
};
