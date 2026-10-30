import {useState, type ReactNode} from 'react';
import {expect, userEvent, waitFor, within} from 'storybook/test';
import type {Meta, StoryObj} from '@storybook/react-vite';
import {ExternalLink, SquarePen, Trash2} from 'lucide-react';
import {ToastRegion, queue} from '../components/Toast';
import {PropertyList, PropertyListItem} from '../components/gv/PropertyList';
import {DemoAssignee, DemoPhase, DemoStatus, DemoTags} from '../components/gv/PropertyList.stories';
import {ReactionCounts} from '../components/gv/ReactionCounts';
import {SidePanel, SidePanelActions, SidePanelRecordHead, SidePanelSection} from '../components/gv/SidePanel';
import {CommentComposer, CommentThread, type ThreadComment, type ThreadTab, type ThreadTarget} from './CommentThread';
import {DemoUpdates, FIRST_UPDATE} from './OfficialUpdate.stories';

// Invented residents and one invented team member ("Alex M.", the back office's signed-in admin).
const TEAM = {author: 'Alex M.', initials: 'A'};

export const COMMENTS: ThreadComment[] = [
  {id: 'c1', author: 'Nadia K.', time: '6 days ago', text: 'Could this also work for the east side of the park?',
    replies: [{id: 'c1r1', ...TEAM, time: '5 days ago', text: 'Good question: we are checking the east side with the parks team.'}]},
  {id: 'c2', author: 'Resident', time: '4 days ago', text: 'I agree, the evening light there is really poor.'},
  {id: 'c3', author: 'Tom R.', time: '2 days ago', text: 'Not sure about this. The path is already crowded at weekends.'},
  {id: 'c4', author: 'Aina B.', time: 'Today', text: 'This is the most useful one on the list.', isNew: true}
];
export const NEW_COMMENTS: ThreadComment[] = [
  {id: 'n1', author: 'Tom R.', time: '2 days ago', text: 'Not sure about this. The path is already crowded at weekends.'},
  {id: 'n2', author: 'Resident', time: 'Today', text: 'Please keep the old trees when you build this.', isNew: true},
  {id: 'n3', author: 'Aina B.', time: 'Today', text: 'This is the most useful one on the list.', isNew: true}
];
export const FLAGGED: ThreadComment[] = [
  {id: 'w1', author: 'Anonymous', time: 'Today', isNew: true, warning: 'Possibly offensive language',
    text: 'Whoever wrote this has no idea what they are talking about. Stay out of our park.'},
  {id: 'w2', author: 'Aina B.', time: 'Today', text: 'This is the most useful one on the list.', isNew: true},
  {id: 'w3', author: 'Tom R.', time: '2 days ago', text: 'Not sure about this. The path is already crowded at weekends.'}
];
export const INTERNAL: ThreadComment[] = [
  {id: 'i1', author: 'Sam V.', time: '3 days ago', text: 'Parks says the east side has no power line yet. Worth a site visit first?'},
  {id: 'i2', ...TEAM, time: 'Yesterday', text: 'Booked one for Thursday. I will post an official update after.'}
];

type Restore = (list: ThreadComment[]) => ThreadComment[];

/** The list without comment `id`, and how to put it back where it was. */
function without(list: ThreadComment[], id: string): [ThreadComment[], Restore] {
  const at = list.findIndex(c => c.id === id);
  if (at >= 0) {
    const gone = list[at];
    return [list.filter(c => c.id !== id), l => [...l.slice(0, at), gone, ...l.slice(at)]];
  }
  const parent = list.find(c => c.replies?.some(r => r.id === id));
  if (!parent) return [list, l => l];
  const [replies, put] = without(parent.replies!, id);
  return [list.map(c => (c.id === parent.id ? {...c, replies} : c)),
    l => l.map(c => (c.id === parent.id ? {...c, replies: put(c.replies ?? [])} : c))];
}

const withWarning = (list: ThreadComment[], id: string, warning: string | undefined): ThreadComment[] =>
  list.map(c => (c.id === id ? {...c, warning} : {...c, replies: c.replies && withWarning(c.replies, id, warning)}));

/** A record's thread, live: posts land at once, Delete and Dismiss warning apply at once with an Undo toast. */
export function DemoThread({comments: first, internal: firstInternal, defaultTab}: {
  comments: ThreadComment[];
  internal?: ThreadComment[];
  defaultTab?: ThreadTab;
}) {
  const [comments, setComments] = useState(first);
  const [internal, setInternal] = useState(firstInternal);
  const setOf = (tab: ThreadTab) => (tab === 'internal'
    ? (f: (l: ThreadComment[]) => ThreadComment[]) => setInternal(l => f(l ?? []))
    : setComments);
  const post = (text: string, {tab, replyTo}: ThreadTarget) => {
    const c: ThreadComment = {id: `p${Date.now()}`, ...TEAM, time: 'Just now', text};
    setOf(tab)(list => (replyTo
      ? list.map(x => (x.id === replyTo ? {...x, replies: [...(x.replies ?? []), c]} : x))
      : [...list, c]));
  };
  const remove = (id: string, tab: ThreadTab) => {
    const [next, restore] = without(tab === 'internal' ? internal ?? [] : comments, id);
    setOf(tab)(() => next);
    queue.add({title: 'Comment deleted', action: 'Undo', onAction: () => setOf(tab)(restore)}, {timeout: 6000});
  };
  const dismiss = (id: string) => {
    const was = [comments, ...comments.map(c => c.replies ?? [])].flat().find(c => c.id === id)?.warning;
    setComments(l => withWarning(l, id, undefined));
    queue.add({title: 'Content warning dismissed', action: 'Undo', onAction: () => setComments(l => withWarning(l, id, was))},
      {timeout: 6000});
  };
  return (
    <CommentThread comments={comments} internal={internal} defaultTab={defaultTab} me={TEAM.initials}
      onPost={post} onDelete={remove} onDismissWarning={dismiss} />
  );
}

const meta: Meta<typeof CommentThread> = {
  title: 'Patterns/Manage tab/Comment thread',
  component: CommentThread,
  subcomponents: {CommentComposer},
  tags: ['autodocs', 'not-in-figma', 'status:candidate'],
  excludeStories: /^(Demo[A-Z]\w*|[A-Z_]+)$/,
  parameters: {layout: 'padded'},
  decorators: [Story => <><Story /><ToastRegion /></>]
};
export default meta;
type Story = StoryObj<typeof CommentThread>;

const at512 = (node: ReactNode) => <div style={{width: 512}}>{node}</div>;

/** The thread's states at the side panel's width: comments with a team reply, new ones, a content warning, none, and
 * the internal conversation. */
export const AllVariants: Story = {
  render: () => (
    <div style={{display: 'grid', gridTemplateColumns: 'repeat(2, 512px)', gap: 48, alignItems: 'start'}}>
      <DemoThread comments={COMMENTS} internal={INTERNAL} />
      <DemoThread comments={NEW_COMMENTS} internal={[]} />
      <DemoThread comments={FLAGGED} internal={[]} />
      <DemoThread comments={[]} internal={[]} />
      <DemoThread comments={COMMENTS} internal={INTERNAL} defaultTab="internal" />
    </div>
  )
};

/** Comments (5) and Internal conversation (2): residents' comments oldest first, a team reply under its comment, the
 * newest one on the stage grey with "New", then the team's composer. Reply points the composer at a comment; Delete
 * applies at once, with an Undo toast; ⌘/Ctrl + Enter posts. */
export const Default: Story = {render: () => at512(<DemoThread comments={COMMENTS} internal={INTERNAL} />)};

/** Comments the team hasn't seen yet: each on the stage grey, with "New" after its time. */
export const New: Story = {render: () => at512(<DemoThread comments={NEW_COMMENTS} internal={[]} />)};

/** A comment the automatic check flagged: the amber line under its head, and "Dismiss warning" beside Reply and
 * Delete. Dismissing applies at once, with an Undo toast. */
export const ContentWarning: Story = {
  name: 'Content warning',
  render: () => at512(<DemoThread comments={FLAGGED} internal={[]} />)
};

/** No comments yet: the line, then the composer. */
export const Empty: Story = {render: () => at512(<DemoThread comments={[]} internal={[]} />)};

/** The team's internal conversation: residents never see it; its composer says so. */
export const InternalConversation: Story = {
  name: 'Internal conversation',
  render: () => at512(<DemoThread comments={COMMENTS} internal={INTERNAL} defaultTab="internal" />)
};

/** Where a record has no internal conversation (a voting option): one "Comments (n)" heading, no tabs. */
export const CommentsOnly: Story = {
  name: 'Comments only',
  render: () => at512(<DemoThread comments={FLAGGED} />)
};

function PanelProperties() {
  const [status, setStatus] = useState('Viewed');
  const [assignee, setAssignee] = useState('Manager B');
  const [tags, setTags] = useState(['Culture']);
  return (
    <PropertyList aria-label="Idea details">
      <PropertyListItem label="Status"><DemoStatus value={status} onChange={setStatus} /></PropertyListItem>
      <PropertyListItem label="Assignee"><DemoAssignee value={assignee} onChange={setAssignee} /></PropertyListItem>
      <PropertyListItem label="Tags"><DemoTags value={tags} onChange={setTags} /></PropertyListItem>
      <PropertyListItem label="Phase"><DemoPhase phase="Collect ideas" /></PropertyListItem>
    </PropertyList>
  );
}

/** The whole Manage-tab panel for one idea, as the back office composes it: the idea and its counts and quick
 * actions, its properties, its official update, then the thread, a hairline between each. The panel has no Save: each
 * part applies its change at once. */
export const InASidePanel: Story = {
  name: 'In a side panel',
  parameters: {layout: 'fullscreen'},
  render: () => (
    <div style={{padding: 24, background: 'var(--gv-surface-app)'}}>
      <div style={{width: 560, height: 860}}>
        <SidePanel isInline label="Collect ideas" labels={{previous: 'Previous idea', next: 'Next idea'}} position={{current: 3, total: 124}}>
          <SidePanelSection>
            <SidePanelRecordHead author="Hana M." date="26 October 2026" actions={(
              <SidePanelActions items={[
                {id: 'edit', label: 'Edit', icon: <SquarePen aria-hidden size={16} />},
                {id: 'view', label: 'View on the site', icon: <ExternalLink aria-hidden size={16} />},
                {id: 'delete', label: 'Delete', icon: <Trash2 aria-hidden size={16} />}
              ]}>
                <ReactionCounts likes={74} dislikes={5} comments={5} />
              </SidePanelActions>
            )}>
              Organise open-air cinema nights on Linden Avenue in summer. It would be a great way for neighbours to meet.
            </SidePanelRecordHead>
          </SidePanelSection>
          <SidePanelSection><PanelProperties /></SidePanelSection>
          <SidePanelSection><DemoUpdates initial={[FIRST_UPDATE]} /></SidePanelSection>
          <SidePanelSection><DemoThread comments={COMMENTS} internal={INTERNAL} /></SidePanelSection>
        </SidePanel>
      </div>
    </div>
  )
};

/**
 * The keys the thread takes: Tab reaches the tabs, the arrows move between Comments and Internal conversation; Tab
 * goes on to each comment's actions; Enter on Reply moves focus to the composer, where Enter starts a new line. Try the keys here; an automated test presses them too (the Interactions panel).
 */
export const Keyboard: Story = {
  render: () => at512(<DemoThread comments={COMMENTS} internal={INTERNAL} />),
  play: async ({canvasElement}) => {
    const canvas = within(canvasElement);
    await userEvent.tab();
    await expect(canvas.getByRole('tab', {name: 'Comments (5)'})).toHaveFocus();
    await userEvent.keyboard('{ArrowRight}');
    const internal = canvas.getByRole('tab', {name: 'Internal conversation (2)'});
    await expect(internal).toHaveFocus();
    await waitFor(() => expect(internal).toHaveAttribute('aria-selected', 'true'));
    await userEvent.keyboard('{ArrowLeft}');
    await waitFor(() => expect(canvas.getByRole('tab', {name: 'Comments (5)'})).toHaveAttribute('aria-selected', 'true'));
    await userEvent.tab();
    const reply = canvas.getByRole('button', {name: 'Reply to Nadia K.'});
    await expect(reply).toHaveFocus();
    await userEvent.keyboard('{Enter}');
    const field = canvas.getByRole('textbox', {name: 'Reply to Nadia K.'});
    await waitFor(() => expect(field).toHaveFocus());
    await userEvent.keyboard('First line{Enter}second line');
    await expect(field).toHaveValue('First line\nsecond line');
    await expect(canvas.getByRole('list', {name: 'Comments'})).not.toHaveTextContent('second line');
  }
};
