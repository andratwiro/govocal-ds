import type {ReactNode} from 'react';
import type {Meta, StoryObj} from '@storybook/react-vite';
import {expect, userEvent, within} from 'storybook/test';
import {ArrowUpDown, Asterisk, Folder, Globe, Lock, Users} from 'lucide-react';
import {Select, SelectItem} from '../Select';
import {Avatar} from './Avatar';

// Invented data: a platform's spaces and folders, an idea's statuses, a project's managers, visibility levels.
const SPACES = ['City parks', 'Mobility programme', 'Climate action', 'Neighbourhood budgets', 'Youth engagement', 'Main site'];
const FOLDERS = ['No folder', 'Riverside redevelopment', 'Green corridors', 'School streets'];
const STATUSES = ['Screening', 'Proposed', 'Viewed', 'Under consideration', 'Accepted', 'Rejected', 'Implemented'];
const MANAGERS = ['Manager A', 'Manager B', 'Manager C'];
const SORTS = ['Newest', 'Oldest', 'Most liked', 'Most commented'];
const ic = (Icon: typeof Globe, size = 16) => <Icon aria-hidden size={size} />;

const spaces = () => SPACES.map(s => <SelectItem key={s} id={s} icon={ic(Asterisk)}>{s}</SelectItem>);
const folders = () => FOLDERS.map(f => <SelectItem key={f} id={f} icon={ic(Folder)}>{f}</SelectItem>);
const statuses = () => STATUSES.map(s => <SelectItem key={s} id={s}>{s}</SelectItem>);
const people = () => [
  <SelectItem key="none" id="none" textValue="Unassigned" icon={<Avatar size={16} isUnassigned />}>Unassigned</SelectItem>,
  ...MANAGERS.map(m => <SelectItem key={m} id={m} icon={<Avatar size={16} initials={m.slice(-1)} />}>{m}</SelectItem>)
];
const visibility = () => [
  <SelectItem key="public" id="public" icon={ic(Globe)} description="Appears on the platform for everyone.">Public</SelectItem>,
  <SelectItem key="groups" id="groups" icon={ic(Users)} description="Only people in the groups you choose.">Selected groups</SelectItem>,
  <SelectItem key="private" id="private" icon={ic(Lock)} description="Hidden until you share the link.">Private</SelectItem>
];

const meta: Meta<typeof Select> = {
  title: 'Components/Forms/Select',
  component: Select,
  parameters: {layout: 'centered'},
  tags: ['autodocs', 'not-in-figma']
};
export default meta;
type Story = StoryObj<typeof Select>;

const Row = ({label, children}: {label: string; children: ReactNode}) => (
  <div style={{display: 'grid', gridTemplateColumns: '120px auto', alignItems: 'center', gap: 16}}>
    <span style={{font: 'var(--gv-type-small)', color: 'var(--gv-text-secondary)'}}>{label}</span>
    <div style={{display: 'flex', alignItems: 'center', gap: 12}}>{children}</div>
  </div>
);

/** Each trigger, closed: a field, the two pills, quiet, and disabled. Each story below opens on click, Enter, Space or
 * ↓; ↑↓ move, Enter chooses, Esc closes and gives focus back to the trigger. */
export const AllVariants: Story = {
  render: () => (
    <div style={{display: 'grid', gap: 20}}>
      <Row label="Field">
        <Select label="Status" defaultValue="Viewed">{statuses()}</Select>
        <Select label="Assignee" placeholder="Choose a person">{people()}</Select>
      </Row>
      <Row label="Pill · 28">
        <Select variant="pill" aria-label="Space" prefix="Space:" defaultValue="City parks" isSearchable>{spaces()}</Select>
        <Select variant="pill" aria-label="Folder" defaultValue="Riverside redevelopment">{folders()}</Select>
      </Row>
      <Row label="Pill · 22">
        <Select variant="pill" size={22} aria-label="Status" defaultValue="Viewed">{statuses()}</Select>
        <Select variant="pill" size={22} aria-label="Assignee" defaultValue="none">{people()}</Select>
      </Row>
      <Row label="Quiet">
        <Select variant="quiet" aria-label="Sort" prefix="Sort:" icon={ic(ArrowUpDown)} defaultValue="Newest">
          {SORTS.map(s => <SelectItem key={s} id={s}>{s}</SelectItem>)}
        </Select>
      </Row>
      <Row label="Disabled">
        <Select label="Status" defaultValue="Viewed" isDisabled>{statuses()}</Select>
        <Select variant="pill" aria-label="Space" prefix="Space:" defaultValue="City parks" isDisabled>{spaces()}</Select>
      </Row>
    </div>
  )
};

/** A form's field: its label above, as wide as the Select (200 unless the page sets it), the list as wide as the
 * field. A description and an error line go under it. */
export const Field: Story = {
  render: () => (
    <Select label="Status" description="People see the status on the idea." defaultValue="Viewed">{statuses()}</Select>
  )
};

/** New project's Space ("Space: City parks ▾"): a round grey chip as wide as its value, the chosen option's icon at
 * its start. 22 tall (`size={22}`) in a side panel's property rows. */
export const Pill: Story = {
  render: () => (
    <div style={{display: 'grid', gap: 16, justifyItems: 'start'}}>
      <Select variant="pill" aria-label="Space" prefix="Space:" defaultValue="City parks">{spaces()}</Select>
      <Select variant="pill" size={22} aria-label="Status" defaultValue="Viewed">{statuses()}</Select>
    </div>
  )
};

/** A toolbar's sort: no fill until hovered, a secondary prefix before the value. */
export const Quiet: Story = {
  render: () => (
    <Select variant="quiet" aria-label="Sort" prefix="Sort:" icon={ic(ArrowUpDown)} defaultValue="Newest">
      {SORTS.map(s => <SelectItem key={s} id={s}>{s}</SelectItem>)}
    </Select>
  )
};

/** A long list gets a search over it ("Search spaces", the magnifier first). Focus goes to the search when it opens;
 * typing narrows the list while ↑↓ move through what is left and Enter chooses. A check marks the chosen option. */
export const WithSearch: Story = {
  name: 'With search',
  render: () => (
    <Select variant="pill" aria-label="Space" prefix="Space:" defaultValue="City parks" isSearchable
      searchPlaceholder="Search spaces">
      {spaces()}
    </Select>
  )
};

/** A 16 icon before each option; the chosen one's shows in the trigger. */
export const WithIcons: Story = {
  name: 'With icons',
  render: () => <Select variant="pill" aria-label="Folder" prefix="Folder:" defaultValue="Green corridors">{folders()}</Select>
};

/** People: a 16 Avatar before each, Unassigned the dashed one. */
export const WithAvatars: Story = {
  name: 'With avatars',
  render: () => <Select label="Assignee" defaultValue="none">{people()}</Select>
};

/** A line under each option says what it does; the trigger shows the name only. */
export const WithDescriptions: Story = {
  name: 'With descriptions',
  render: () => (
    <Select label="Visibility" defaultValue="public" style={{width: 280}}>
      {visibility()}
    </Select>
  )
};

/** Can't be opened or focused; the value stays readable. */
export const Disabled: Story = {
  render: () => <Select label="Status" defaultValue="Viewed" isDisabled>{statuses()}</Select>
};

/** A search that matches nothing: the list says "No results". */
export const EmptySearch: Story = {
  name: 'Empty search',
  render: () => (
    <div style={{minHeight: 200}}>
      <Select variant="pill" aria-label="Space" prefix="Space:" defaultValue="City parks" isSearchable
        searchPlaceholder="Search spaces">
        {spaces()}
      </Select>
    </div>
  ),
  play: async ({canvasElement}) => {
    await userEvent.click(within(canvasElement).getByRole('button'));
    const page = within(canvasElement.ownerDocument.body);
    await userEvent.type(await page.findByRole('searchbox', {name: 'Search spaces'}), 'zzz');
    await expect(await page.findByText('No results')).toBeVisible();
  }
};
