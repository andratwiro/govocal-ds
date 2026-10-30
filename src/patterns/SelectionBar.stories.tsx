import {useState} from 'react';
import type {Meta, StoryObj} from '@storybook/react-vite';
import {expect, userEvent, waitFor, within} from 'storybook/test';
import {CircleCheck, Copy, Download, MessageSquareText, Tag, TriangleAlert, User, Users} from 'lucide-react';
import {Button} from '../components/Button';
import {Menu, MenuItem} from '../components/Menu';
import {DataTable, DataTableBody, DataTableCell, DataTableColumn, DataTableHeader, DataTableRow} from '../components/gv/DataTable';
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
  title: 'Components/Tables & lists/Selection bar',
  component: SelectionBar,
  tags: ['autodocs', 'not-in-figma', 'status:candidate'],
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

/** The keyboard, proved by this story's play function (the Interactions panel): Tab enters the bar once, on its first
 * action; → and ← move between the actions and the ×; Enter presses one; Enter on × clears the selection. */
export const Keyboard: Story = {
  render: () => <Demo initial={2} actions={USER_ACTIONS} />,
  play: async ({canvasElement}) => {
    const canvas = within(canvasElement);
    const bar = within(canvas.getByRole('toolbar', {name: 'Selection actions'}));
    await userEvent.tab();
    await expect(bar.getByRole('button', {name: 'Add to group'})).toHaveFocus();
    await userEvent.keyboard('{ArrowRight}');
    await expect(bar.getByRole('button', {name: 'Export selected'})).toHaveFocus();
    await userEvent.keyboard('{Enter}');
    await expect(canvas.getByText('Pressed: export')).toBeInTheDocument();
    await userEvent.keyboard('{ArrowRight}');
    await expect(bar.getByRole('button', {name: 'Clear selection'})).toHaveFocus();
    await userEvent.keyboard('{ArrowLeft}');
    await expect(bar.getByRole('button', {name: 'Export selected'})).toHaveFocus();
    await userEvent.keyboard('{ArrowRight}');
    await userEvent.keyboard('{Enter}');
    await expect(canvas.queryByRole('toolbar')).toBeNull();
    await expect(canvas.getByRole('button', {name: 'Select an idea'})).toBeInTheDocument();
  }
};

const IDEAS = [
  {id: 'shade', title: 'Shade sails over the Lagoon playground'},
  {id: 'bike', title: 'Bike lane by the school'},
  {id: 'trees', title: 'More trees on Elm Lane'}
];

/** Over the table it acts on. When the bar leaves while it holds focus (× or an action clears the selection), focus
 * goes to that table rather than falling to the page; the play function proves it. */
export const WithATable: Story = {
  name: 'With a table',
  render: function Render() {
    const [selected, setSelected] = useState<Set<string>>(new Set(['bike']));
    return (
      <section style={{display: 'grid', gap: 12, width: 720}}>
        <SelectionBar count={selected.size} items={USER_ACTIONS} onClear={() => setSelected(new Set())}>
          <h3 style={{margin: 0, font: 'var(--gv-type-title)'}}>3 ideas</h3>
        </SelectionBar>
        <DataTable aria-label="Ideas" selectionMode="multiple" selectedKeys={selected}
          onSelectionChange={k => setSelected(new Set(k === 'all' ? IDEAS.map(i => i.id) : [...k].map(String)))}>
          <DataTableHeader>
            <DataTableColumn isRowHeader>Idea</DataTableColumn>
          </DataTableHeader>
          <DataTableBody>
            {IDEAS.map(i => (
              <DataTableRow key={i.id} id={i.id} textValue={i.title}><DataTableCell>{i.title}</DataTableCell></DataTableRow>
            ))}
          </DataTableBody>
        </DataTable>
      </section>
    );
  },
  play: async ({canvasElement}) => {
    const canvas = within(canvasElement);
    const table = canvas.getByRole('grid', {name: 'Ideas'});
    await userEvent.click(canvas.getByRole('button', {name: 'Clear selection'}));
    await waitFor(() => expect(canvas.queryByRole('toolbar')).toBeNull());
    await waitFor(() => expect(table.contains(document.activeElement)).toBe(true));
  }
};
