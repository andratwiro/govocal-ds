import {useState} from 'react';
import type {Meta, StoryObj} from '@storybook/react-vite';
import {CircleCheck, Copy, Download, MessageSquareText, Tag, TriangleAlert, User, Users} from 'lucide-react';
import {Button} from '../components/Button';
import {Menu, MenuItem} from '../components/Menu';
import {SelectionBar, type SelectionAction} from './SelectionBar';

const ic = (Icon: typeof Tag) => <Icon aria-hidden size={16} />;
const menu = (label: string, items: string[]) => (
  <Menu aria-label={label}>{items.map(i => <MenuItem key={i} id={i}>{i}</MenuItem>)}</Menu>
);
// The phase Manage tab's bulk actions (invented values).
const ACTIONS: SelectionAction[] = [
  {id: 'status', label: 'Status', icon: ic(CircleCheck), menu: menu('Status', ['Proposed', 'Viewed', 'Under consideration', 'Accepted', 'Rejected', 'Implemented'])},
  {id: 'assign', label: 'Assign', icon: ic(User), menu: menu('Assign', ['Unassigned', 'Manager A', 'Manager B', 'Manager C'])},
  {id: 'tags', label: 'Tags', icon: ic(Tag), menu: menu('Tags', ['Cycling', 'Environment', 'Public space', 'Transport'])},
  {id: 'copy', label: 'Copy to phase', icon: ic(Copy), menu: menu('Copy to phase', ['Shortlist proposals', 'Community vote'])},
  {id: 'update', label: 'Official update', icon: ic(MessageSquareText)}
];

// The Users list's two: a menu of manual groups and an export.
const USER_ACTIONS: SelectionAction[] = [
  {id: 'group', label: 'Add to group', icon: ic(Users), menu: menu('Manual groups', ['Youth panel', 'Cyclists', 'Market traders'])},
  {id: 'export', label: 'Export selected', icon: ic(Download)}
];

// Shown after the others while the content-warnings view is on.
const DISMISS: SelectionAction = {id: 'dismiss-warnings', label: 'Dismiss warnings', icon: ic(TriangleAlert)};

function Demo({initial, actions = ACTIONS}: {initial: number; actions?: SelectionAction[]}) {
  const [count, setCount] = useState(initial);
  const [last, setLast] = useState('');
  return (
    <div style={{display: 'grid', gap: 12, width: 960}}>
      <SelectionBar count={count} items={actions} onClear={() => setCount(0)} onAction={setLast}>
        <h3 style={{margin: 0, font: 'var(--gv-type-title)'}}>124 ideas</h3>
      </SelectionBar>
      <div style={{font: 'var(--gv-type-small)', color: 'var(--gv-text-secondary)'}}>
        {count === 0 ? <Button variant="quiet" size={32} onPress={() => setCount(1)}>Select an idea</Button> : last && `Pressed: ${last}`}
      </div>
    </div>
  );
}

const meta: Meta<typeof SelectionBar> = {
  title: 'Patterns/Lists/Selection bar',
  component: SelectionBar,
  tags: ['autodocs', 'not-in-figma'],
  parameters: {layout: 'padded'}
};
export default meta;
type Story = StoryObj<typeof SelectionBar>;

/** One idea selected: the count, five actions, and the × that clears the selection. */
export const OneSelected: Story = {name: 'Default', render: () => <Demo initial={1} />};

/** Several selected: the same bar, the count follows. */
export const Many: Story = {render: () => <Demo initial={12} />};

/**
 * A contextual action: while the table shows only ideas with content warnings, "Dismiss warnings" joins the bar after
 * Official update. It leaves with the view.
 */
export const WithAContextualAction: Story = {
  name: 'With a contextual action',
  render: () => <Demo initial={2} actions={[...ACTIONS, DISMISS]} />
};

/** Empty: nothing selected, the bar gives way to the list's own heading. */
export const Empty: Story = {render: () => <Demo initial={0} />};

/** Users: the same bar with the two actions of the Users list, a menu and a plain action. */
export const UsersList: Story = {name: 'Users', render: () => <Demo initial={2} actions={USER_ACTIONS} />};

/** Right to left (Arabic): the count at the right, actions flowing left, the × last. */
export const RightToLeft: Story = {name: 'Right to left', globals: {direction: 'rtl'}, render: () => <Demo initial={3} />};
