import type {Meta, StoryObj} from '@storybook/react-vite';
import {expect, fn, userEvent, waitFor, within} from 'storybook/test';
import {BarChart3, Sparkles, Type} from 'lucide-react';
import {ActivityFeed, type ActivityChange, type ActivityEntry} from './ActivityFeed';
import {Avatar} from './Avatar';

const meta: Meta<typeof ActivityFeed> = {
  title: 'Components/Data display/Activity feed',
  component: ActivityFeed,
  tags: ['autodocs', 'not-in-figma', 'status:draft'],
  parameters: {layout: 'padded'},
  args: {onRestore: fn(), onChangePress: fn()},
  decorators: [Story => <div style={{maxWidth: 360}}><Story /></div>]
};
export default meta;
type Story = StoryObj<typeof ActivityFeed>;

const chart = <BarChart3 aria-hidden />;
const text = <Type aria-hidden />;
const CHART_NAMES = ['Votes per cycle lane route', 'Identifiable participants by project',
  'Identifiable participants by district', 'Participants per 1,000 residents', 'Reach by channel'];
const TEXT_NAMES = ['Summary', 'Project priorities', 'Who took part', 'Reach', 'What happens next'];
const many: ActivityChange[] = [
  {id: 'add', label: 'Upcoming events in Green Streets', icon: chart, status: 'added'},
  ...Array.from({length: 22}, (_, i) => i % 2
    ? {id: `c${i}`, label: CHART_NAMES[i % CHART_NAMES.length], icon: chart}
    : {id: `t${i}`, label: TEXT_NAMES[i % TEXT_NAMES.length], icon: text}),
  {id: 'gone', label: 'How people heard about the survey', icon: chart, status: 'removed'}
];

const ENTRIES: ActivityEntry[] = [
  {
    id: 'v4', day: 'Today', actor: 'You', action: 'edited 2 widgets', time: 'Today, 10:12 to 10:19', isCurrent: true,
    avatar: <Avatar initials="Y" size={28} />,
    changes: [{id: 's', label: 'Summary', icon: text}, {id: 'v', label: 'Votes per cycle lane route', icon: chart}]
  },
  {
    id: 'v3', day: 'Today', actor: 'Assistant', action: 'changed the report', time: 'Today, 09:41 · asked by Resident A',
    isAssistant: true, avatar: <Avatar initials="AI" size={28} />,
    prompt: 'Rewrite the whole report in a more formal tone, use the council’s four priority names everywhere, and add ' +
      'the upcoming events in Green Streets after the summary. Keep the charts as they are, but give each a finding.',
    summary: '22 changed, 1 added, 1 removed', changes: many
  },
  {
    id: 'v2', day: 'Today', actor: 'Resident A', action: 'removed 1 widget', time: 'Today, 09:30',
    avatar: <Avatar initials="RA" size={28} />,
    changes: [{id: 'g', label: 'How people heard about the survey', icon: chart, status: 'removed'}],
    note: 'One of these widgets is no longer in the report.'
  },
  {
    id: 'v1', day: 'Yesterday', actor: 'You', action: 'renamed a section', time: 'Yesterday, 16:05',
    avatar: <Avatar initials="Y" size={28} />,
    changes: [{id: 'r', label: 'Who took part', previousLabel: 'Participants', icon: text, status: 'renamed'}]
  }
];

/** Version history: day groups, the version showing now, an assistant run on the AI tint, chips, Restore. */
export const Default: Story = {args: {items: ENTRIES, onShowOlder: fn()}};

/** An assistant's run: the prompt quoted in three lines, the count, and many changes behind a toggle and a pager. */
export const AssistantRun: Story = {name: 'Assistant run', args: {items: [ENTRIES[1]]}};

/** Nothing saved yet. */
export const Empty: Story = {args: {items: []}};

/** Read only: no ⋯ menu, chips that can't be pressed. */
export const ReadOnly: Story = {name: 'Read only', args: {items: ENTRIES, onRestore: undefined, onChangePress: undefined}};

/** The survey editor's history: the same feed, other items. */
export const SurveyEditor: Story = {
  name: 'Survey editor',
  args: {
    items: [
      {id: 's2', day: 'Today', actor: 'You', action: 'added 2 questions', time: 'Today, 11:02', isCurrent: true,
        avatar: <Avatar initials="Y" size={28} />,
        changes: [{id: 'q1', label: 'How often do you cycle?', icon: <Sparkles aria-hidden />, status: 'added'},
          {id: 'q2', label: 'What would make you cycle more?', icon: text, status: 'added'}]},
      {id: 's1', day: 'Today', actor: 'You', action: 'created the survey', time: 'Today, 10:40',
        avatar: <Avatar initials="Y" size={28} />}
    ]
  }
};

/** Right to left: the accent edge on the right. */
export const RightToLeft: Story = {name: 'Right to left', globals: {direction: 'rtl'}, args: {items: ENTRIES}};

/** By keyboard: open the prompt, show the changes and page them, then restore a version from its ⋯ menu. */
export const Keyboard: Story = {
  args: {items: [ENTRIES[1]]},
  play: async ({canvasElement, args}) => {
    const canvas = within(canvasElement);
    await userEvent.tab();
    const prompt = canvas.getByRole('button', {name: 'Show full prompt'});
    await expect(prompt).toHaveFocus();
    await userEvent.keyboard('{Enter}');
    await expect(prompt).toHaveAttribute('aria-expanded', 'true');
    await userEvent.tab();
    const changes = canvas.getByRole('button', {name: 'Show 24 changes'});
    await expect(changes).toHaveFocus();
    await userEvent.keyboard('{Enter}');
    await expect(canvas.getByRole('button', {name: 'Added: Upcoming events in Green Streets'})).toBeInTheDocument();
    await userEvent.click(canvas.getByRole('button', {name: 'Page 3'}));
    await expect(canvas.getByText('Removed: How people heard about the survey')).toBeInTheDocument();
    const more = canvas.getByRole('button', {name: 'More'});
    await more.focus();
    await userEvent.keyboard('{Enter}');
    const item = await within(document.body).findByRole('menuitem', {name: 'Restore this version'});
    await waitFor(() => expect(item).toHaveFocus());
    await userEvent.keyboard('{Enter}');
    await expect(args.onRestore).toHaveBeenCalledWith('v3');
  }
};
