import {useState} from 'react';
import type {Meta, StoryObj} from '@storybook/react-vite';
import {Card} from '../components/gv/Card';
import {NotificationEmail, NotificationRowList, NotificationRow} from './NotificationRow';

const meta: Meta<typeof NotificationRow> = {
  title: 'Patterns/Build tab/Notification row',
  component: NotificationRow,
  tags: ['autodocs', 'not-in-figma'],
  decorators: [Story => <div style={{width: 412}}><Story /></div>],
  args: {children: 'A reply on my comment', who: 'User who commented', when: 'User replies to comment'}
};
export default meta;
type Story = StoryObj<typeof NotificationRow>;

/* An ideation phase's emails, as the product words them; three are off by default. */
const EMAILS = [
  {id: 'delc', name: 'Deletion of my comment', who: 'User who commented', when: 'Comment is deleted', on: false},
  {id: 'cf', name: 'A comment on an idea that you follow', who: 'Users who follow the input', when: 'User comments', on: true},
  {id: 'rc', name: 'A reply on my comment', who: 'User who commented', when: 'User replies to comment', on: true},
  {id: 'pub', name: 'Publication of my input', who: 'User who published the input', when: 'Input is published', on: true},
  {id: 'ment', name: 'Mention in an update', who: 'User who is mentioned', when: 'User is mentioned', on: false},
  {id: 'uf', name: 'Update on an input that you follow', who: 'Users who follow the input', when: 'Input receives official feedback', on: true},
  {id: 'phst', name: 'Phase started', who: 'Users who follow the project or have participated', when: 'A phase starts', on: true},
  {id: 'stch', name: 'Status change of an input that you follow', who: 'Users who follow the input', when: 'Input status changes', on: true},
  {id: 'scrn', name: 'My input awaits screening', who: 'User who submitted the input', when: 'New input awaits screening', on: false}
];

/** On (a way to its page), off (greyed, nothing to open), and the email's page. */
export const AllVariants: Story = {
  render: () => (
    <div style={{display: 'flex', flexDirection: 'column', gap: 'var(--gv-space-24)'}}>
      <NotificationRowList>
        <NotificationRow who="User who commented" when="User replies to comment" onOpen={() => {}}>A reply on my comment</NotificationRow>
        <NotificationRow who="User who commented" when="Comment is deleted" defaultSelected={false}>Deletion of my comment</NotificationRow>
      </NotificationRowList>
      <EmailOpenRender />
    </div>
  )
};

/** On: the email goes out; the name and its lines open its page. */
export const On: Story = {args: {onOpen: () => {}}};

/** Off: the name greys and the row opens nothing (an email that is off isn't edited). */
export const Off: Story = {args: {children: 'Deletion of my comment', when: 'Comment is deleted', defaultSelected: false}};

function EmailOpenRender() {
  return (
    <NotificationEmail
      name="A reply on my comment"
      who="User who commented"
      when="User replies to comment"
      backLabel="Back to Ideation setup"
      onBack={() => {}}
      replyTo="support@example.org"
      subject="You've received a reply on your comment"
      title="Jane Doe replied to your comment"
      introduction="Jane Doe replied to the comment you wrote on an idea."
      buttonText="Read the reply"
    />
  );
}

/** The email's page, in the panel where the setup was: ←, the switch "Send this email", its fields. */
export const EmailOpen = {name: 'Email open', render: EmailOpenRender} satisfies Story;

/* A common ground phase sends four: Mention in an update is off by default. */
const COMMON_GROUND = ['pub', 'ment', 'uf', 'phst'].map(id => EMAILS.find(e => e.id === id)!);

function InACardRender({emails = COMMON_GROUND}: {emails?: typeof EMAILS}) {
  const [on, setOn] = useState(() => new Set(emails.filter(e => e.on).map(e => e.id)));
  const [open, setOpen] = useState<string | null>(null);
  const email = emails.find(e => e.id === open);
  if (email)
    return (
      <NotificationEmail
        name={email.name}
        who={email.who}
        when={email.when}
        backLabel="Back to Ideation setup"
        onBack={() => setOpen(null)}
        isSelected={on.has(email.id)}
        onChange={v => setOn(s => (v ? new Set(s).add(email.id) : new Set([...s].filter(id => id !== email.id))))}
        replyTo="support@example.org"
        subject={email.name}
        buttonText="View it"
      />
    );
  const n = on.size;
  return (
    <Card title="Notifications" control="expand" pills={[{label: n ? `${n} ${n === 1 ? 'email' : 'emails'} on` : 'Off'}]}>
      <NotificationRowList>
        {emails.map(e => (
          <NotificationRow
            key={e.id}
            who={e.who}
            when={e.when}
            isSelected={on.has(e.id)}
            onChange={v => setOn(s => (v ? new Set(s).add(e.id) : new Set([...s].filter(id => id !== e.id))))}
            onOpen={() => setOpen(e.id)}>
            {e.name}
          </NotificationRow>
        ))}
      </NotificationRowList>
    </Card>
  );
}

/**
 * A phase's Notifications card: closed, its pill counts the emails that are on ("3 emails on"); open, one row per
 * email. Press an email for its page, ← to come back.
 */
export const InACard: Story = {name: 'In a card', render: () => <InACardRender />};

/** An ideation phase's nine emails, open. */
export const IdeationEmails: Story = {
  name: 'Ideation emails',
  render: () => (
    <NotificationRowList>
      {EMAILS.map(e => (
        <NotificationRow key={e.id} who={e.who} when={e.when} defaultSelected={e.on} onOpen={() => {}}>
          {e.name}
        </NotificationRow>
      ))}
    </NotificationRowList>
  )
};
