import {useState} from 'react';
import type {Meta, StoryObj} from '@storybook/react-vite';
import {expect, screen, userEvent, waitFor, within} from 'storybook/test';
import {Dialog, DialogTrigger} from 'react-aria-components';
import {Link as LinkIcon} from 'lucide-react';
import {Button} from '../components/Button';
import {Popover} from '../components/Popover';
import {Select, SelectItem} from '../components/Select';
import {TextField} from '../components/TextField';
import {Avatar} from '../components/gv/Avatar';
import {Badge} from '../components/gv/Badge';
import {SectionLabel} from '../components/gv/SectionLabel';
import './AccessPopover.css';

/**
 * A recipe, not a component (NAMING: a pattern used on one page, the project overview's Share): who can open a
 * project, from the header. Share ▾ opens a light popover anchored to the header: an invite field and Invite, the
 * people with access (avatar, name, email, a role Select or "Owner"), then Copy link. Copy the `AccessPopover`
 * function and AccessPopover.css into the page; it becomes a component when a second page needs it. Not the Modal's
 * Share story: this stays in the header and keeps the page in view. Not in Figma.
 */
const meta: Meta = {
  title: 'Patterns/Project page/Access popover',
  tags: ['autodocs', 'not-in-figma', 'status:draft'],
  parameters: {layout: 'padded'},
  decorators: [Story => <div style={{display: 'flex', justifyContent: 'flex-end', minHeight: 420}}><Story /></div>]
};
export default meta;
type Story = StoryObj;

/* Invented: a project's team. */
interface Person {
  id: string;
  name: string;
  email: string;
  /** `owner`, or one of ROLES' ids. */
  role: string;
  isYou?: boolean;
}

const PEOPLE: Person[] = [
  {id: 'sc', name: 'Sofia Costa', email: 'sofia@meridian.example', role: 'owner', isYou: true},
  {id: 'dv', name: 'Daan Verhoeven', email: 'daan@meridian.example', role: 'edit'},
  {id: 'ak', name: 'Aisha Karimi', email: 'aisha@meridian.example', role: 'view'}
];

const ROLES = [
  {id: 'edit', label: 'Can edit'},
  {id: 'view', label: 'Can view'}
];

const initials = (name: string) => name.split(' ').map(w => w[0]).join('').slice(0, 2);

/** The recipe: Share ▾ and its popover. Words are the page's; pass the page's own in its language. */
function AccessPopover({defaultPeople = PEOPLE, defaultOpen}: {defaultPeople?: Person[]; defaultOpen?: boolean}) {
  const [people, setPeople] = useState(defaultPeople);
  const [emails, setEmails] = useState('');
  const invite = () => {
    const added = emails.split(',').map(e => e.trim()).filter(Boolean)
      .map(email => ({id: email, name: email.split('@')[0], email, role: 'view'}));
    if (added.length) setPeople(p => [...p, ...added]);
    setEmails('');
  };
  return (
    <DialogTrigger defaultOpen={defaultOpen}>
      <Button variant="secondary" size={32} hasMenu>Share</Button>
      <Popover placement="bottom end" offset={6} showArrow={false}>
        <Dialog aria-label="Share" className="gv-access-popover">
          <form className="gv-access-popover__invite" onSubmit={e => { e.preventDefault(); invite(); }}>
            <SectionLabel>Invite people</SectionLabel>
            <div className="gv-access-popover__invite-row">
              <TextField aria-label="Email or group" placeholder="Email or group, separated by commas" value={emails}
                onChange={setEmails} />
              <Button type="submit" size={32}>Invite</Button>
            </div>
          </form>
          <div>
            <SectionLabel>People with access</SectionLabel>
            <ul className="gv-access-popover__people" aria-label="People with access">
              {people.map(p => (
                <li key={p.id} className="gv-access-popover__person">
                  <Avatar initials={initials(p.name)} />
                  <span className="gv-access-popover__who">
                    <span className="gv-access-popover__name">
                      {p.name}
                      {p.isYou && <Badge variant="outlined">you</Badge>}
                    </span>
                    <span className="gv-access-popover__email">{p.email}</span>
                  </span>
                  {p.role === 'owner' ? (
                    <span className="gv-access-popover__owner">Owner</span>
                  ) : (
                    <Select aria-label={`Role for ${p.name}`} variant="quiet" value={p.role}
                      onChange={role => setPeople(all => all.map(q => (q.id === p.id ? {...q, role: String(role)} : q)))}>
                      {ROLES.map(r => <SelectItem key={r.id} id={r.id}>{r.label}</SelectItem>)}
                    </Select>
                  )}
                </li>
              ))}
            </ul>
          </div>
          <Button variant="secondary" className="gv-access-popover__copy">
            <LinkIcon aria-hidden size={16} />
            Copy link
          </Button>
        </Dialog>
      </Popover>
    </DialogTrigger>
  );
}

/** Share ▾ opens the popover under the header's button: invite by email or group, the people with access and their
 * roles, Copy link. Esc closes it back onto Share. */
export const Default: Story = {render: () => <AccessPopover defaultOpen />};

/** Closed: the header's Share ▾, as the overview shows it. */
export const Closed: Story = {render: () => <AccessPopover />};

/** Only the owner so far: no role to change. */
export const OnlyTheOwner: Story = {name: 'Only the owner', render: () => <AccessPopover defaultPeople={PEOPLE.slice(0, 1)} defaultOpen />};

/** Right to left: the popover opens from the header's end, now the left. */
export const RightToLeft: Story = {name: 'Right to left', globals: {direction: 'rtl'}, render: () => <AccessPopover defaultOpen />};

/** The keyboard: Enter on Share opens the popover with focus inside it; typing an email and Enter invites; Esc closes
 * back onto Share. */
export const Keyboard: Story = {
  render: () => <AccessPopover />,
  play: async ({canvasElement}) => {
    const share = within(canvasElement).getByRole('button', {name: 'Share'});
    share.focus();
    await userEvent.keyboard('{Enter}');
    const dialog = await screen.findByRole('dialog', {name: 'Share'});
    await userEvent.type(within(dialog).getByRole('textbox', {name: 'Email or group'}), 'lena@meridian.example{Enter}');
    await expect(within(dialog).getByText('lena@meridian.example')).toBeVisible();
    await userEvent.keyboard('{Escape}');
    await waitFor(() => expect(screen.queryByRole('dialog')).toBeNull());
    await waitFor(() => expect(share).toHaveFocus());
  }
};
