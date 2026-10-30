import {useState} from 'react';
import type {Meta, StoryObj} from '@storybook/react-vite';
import {expect, screen, userEvent, waitFor, within} from 'storybook/test';
import {CircleCheck, Inbox, MessageSquareText, Tag, User} from 'lucide-react';
import {Avatar} from '../components/gv/Avatar';
import {FilterMenu, type FilterFacet, type FilterValue} from './FilterMenu';
import {FilterChips} from './FilterChips';

// Invented values: the Manage tab's five facets, with how many ideas carry each value.
const ic = (Icon: typeof Tag) => <Icon aria-hidden size={16} />;
export const IDEA_FACETS: FilterFacet[] = [
  {id: 'source', label: 'Source', icon: ic(Inbox), items: [{id: 'online', label: 'Online', count: 110}, {id: 'imported', label: 'Imported', count: 14}]},
  {id: 'status', label: 'Status', icon: ic(CircleCheck), items: ['Proposed', 'Viewed', 'Under consideration', 'Accepted', 'Rejected', 'Implemented']
    .map((s, i) => ({id: s, label: s, count: [31, 22, 20, 19, 17, 15][i]}))},
  {id: 'assignee', label: 'Assignee', icon: ic(User), items: [
    {id: 'Unassigned', label: 'Unassigned', count: 48, icon: <Avatar size={16} isUnassigned />},
    ...['Manager A', 'Manager B', 'Manager C'].map((m, i) => ({id: m, label: m, count: [26, 25, 25][i], icon: <Avatar size={16} initials={m.slice(-1)} />}))
  ]},
  {id: 'tags', label: 'Tags', icon: ic(Tag), items: ['Cycling', 'Environment', 'Public space', 'Transport', 'Safety', 'Housing', 'Culture']
    .map((t, i) => ({id: t, label: t, count: [14, 28, 40, 33, 30, 12, 24][i]}))},
  {id: 'reply', label: 'Reply', icon: ic(MessageSquareText), items: [{id: 'awaiting', label: 'Awaiting reply', count: 40}, {id: 'replied', label: 'Replied', count: 84}]}
];
const ideas = (n: number) => `${n} ${n === 1 ? 'idea' : 'ideas'}`;

function Demo({initial = {}, open}: {initial?: FilterValue; open?: boolean}) {
  const [value, setValue] = useState<FilterValue>(initial);
  return (
    <div style={{display: 'grid', gap: 8, justifyItems: 'end', width: 640, minHeight: open ? 440 : undefined, alignContent: 'start'}}>
      <FilterMenu facets={IDEA_FACETS} value={value} onChange={setValue} countLabel={ideas} defaultOpen={open} />
      <div style={{justifySelf: 'stretch'}}><FilterChips facets={IDEA_FACETS} value={value} onChange={setValue} /></div>
    </div>
  );
}

const meta: Meta<typeof FilterMenu> = {
  title: 'Components/Tables & lists/Filter menu',
  component: FilterMenu,
  tags: ['autodocs', 'not-in-figma', 'status:candidate'],
  // IDEA_FACETS is shared data for the other filter stories, not a story.
  excludeStories: /^[A-Z_]+$/,
  parameters: {layout: 'padded'}
};
export default meta;
type Story = StoryObj<typeof FilterMenu>;

/** Nothing filtered: no dot on the button, no counts, no "Clear all filters". The chips below stay away. */
export const Empty: Story = {name: 'Default', render: () => <Demo />};

/** Open with nothing on: the five facets, each opening its submenu on hover or the arrow key. */
export const Open: Story = {render: () => <Demo open />};

/** Two filters on: the dot on the button, a count on Assignee and Tags, "Clear all filters" after a divider. */
export const Active: Story = {render: () => <Demo open initial={{assignee: ['Manager A'], tags: ['Cycling']}} />};

/** Ticking in a submenu adds a chip below; removing a chip unticks it here: one value, two views. */
export const InSyncWithChips: Story = {name: 'In sync with chips', render: () => <Demo initial={{status: ['Proposed', 'Viewed']}} />};

/** Right to left (Arabic): the menu opens from the button's end edge, submenus open towards the start. */
export const RightToLeft: Story = {
  name: 'Right to left',
  globals: {direction: 'rtl'},
  render: () => <Demo open initial={{assignee: ['Manager A'], tags: ['Cycling']}} />
};

/** The keyboard, proved by this story's play function (the Interactions panel): Enter on the button opens the facets;
 * ↓ moves; → opens a facet's options; Enter ticks one and the menus stay open; ← goes back to the facets; Esc closes
 * and focus returns to the button, which now says a filter is on. */
export const Keyboard: Story = {
  render: () => <Demo />,
  play: async ({canvasElement}) => {
    const canvas = within(canvasElement);
    await userEvent.tab();
    await expect(canvas.getByRole('button', {name: 'Filter'})).toHaveFocus();
    await userEvent.keyboard('{Enter}');
    const facets = await screen.findByRole('menu', {name: 'Filter'});
    const source = within(facets).getByRole('menuitem', {name: /^Source/});
    await waitFor(() => expect(source).toHaveFocus());
    await userEvent.keyboard('{ArrowDown}');
    await expect(within(facets).getByRole('menuitem', {name: /^Status/})).toHaveFocus();
    await userEvent.keyboard('{ArrowUp}');
    await userEvent.keyboard('{ArrowRight}');
    // A submenu is named by its row (React Aria labels it by the trigger), not by its own aria-label.
    const options = await screen.findByRole('menu', {name: /^Source/});
    const online = within(options).getByRole('menuitemcheckbox', {name: /^Online/});
    await waitFor(() => expect(online).toHaveFocus());
    await userEvent.keyboard('{Enter}');
    await expect(online).toHaveAttribute('aria-checked', 'true');
    await expect(options).toBeInTheDocument();
    await userEvent.keyboard('{ArrowLeft}');
    await waitFor(() => expect(options).not.toBeInTheDocument());
    await expect(source).toHaveFocus();
    await userEvent.keyboard('{Escape}');
    await waitFor(() => expect(screen.queryByRole('menu')).toBeNull());
    await waitFor(() => expect(canvas.getByRole('button', {name: 'Filter (1 on)'})).toHaveFocus());
  }
};
