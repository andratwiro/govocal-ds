import {useState} from 'react';
import type {Meta, StoryObj} from '@storybook/react-vite';
import {CircleCheck, Copy, MessageSquareText, Tag, User} from 'lucide-react';
import {Button} from '../components/Button';
import {Menu, MenuItem} from '../components/Menu';
import {SelectionBar, type SelectionAction} from './SelectionBar';

const ic = (Icon: typeof Tag) => <Icon aria-hidden size={16} />;
const menu = (label: string, items: string[]) => (
  <Menu aria-label={label}>{items.map(i => <MenuItem key={i} id={i}>{i}</MenuItem>)}</Menu>
);
// The Manage tab's batch actions (invented values).
const ACTIONS: SelectionAction[] = [
  {id: 'status', label: 'Status', icon: ic(CircleCheck), menu: menu('Status', ['Proposed', 'Viewed', 'Under consideration', 'Accepted', 'Rejected', 'Implemented'])},
  {id: 'assign', label: 'Assign', icon: ic(User), menu: menu('Assign', ['Unassigned', 'Manager A', 'Manager B', 'Manager C'])},
  {id: 'tags', label: 'Tags', icon: ic(Tag), menu: menu('Tags', ['Cycling', 'Environment', 'Public space', 'Transport'])},
  {id: 'copy', label: 'Copy to phase', icon: ic(Copy), menu: menu('Copy to phase', ['Shortlist proposals', 'Community vote'])},
  {id: 'update', label: 'Official update', icon: ic(MessageSquareText)}
];

function Demo({initial}: {initial: number}) {
  const [count, setCount] = useState(initial);
  const [last, setLast] = useState('');
  return (
    <div style={{display: 'grid', gap: 12, width: 760}}>
      <SelectionBar count={count} actions={ACTIONS} onClear={() => setCount(0)} onAction={setLast}>
        <h3 style={{margin: 0, font: 'var(--gv-type-title)'}}>124 ideas</h3>
      </SelectionBar>
      <div style={{font: 'var(--gv-type-small)', color: 'var(--gv-text-secondary)'}}>
        {count === 0 ? <Button variant="quiet" size={32} onPress={() => setCount(1)}>Select an idea</Button> : last && `Pressed: ${last}`}
      </div>
    </div>
  );
}

const meta: Meta<typeof SelectionBar> = {
  title: 'Patterns/Manage tab/Selection bar',
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

/** Empty: nothing selected, the bar gives way to the list's own heading. */
export const Empty: Story = {render: () => <Demo initial={0} />};

/** Right to left (Arabic): the count at the right, actions flowing left, the × last. */
export const RightToLeft: Story = {name: 'Right to left', globals: {direction: 'rtl'}, render: () => <Demo initial={3} />};
