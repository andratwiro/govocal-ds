import {useState} from 'react';
import {expect, userEvent, within} from 'storybook/test';
import type {Meta, StoryObj} from '@storybook/react-vite';
import {MessageSquareText} from 'lucide-react';
import {Button} from '../components/Button';
import {ToastRegion, queue} from '../components/Toast';
import {BulkOfficialUpdate, OfficialUpdate, OfficialUpdateForm, PostedOfficialUpdate, type PostedUpdate} from './OfficialUpdate';

export const FIRST_UPDATE: PostedUpdate = {
  id: 'u1',
  text: 'Thank you for this idea. The project team is looking into it and will post an update here.',
  date: '12 October 2026'
};
export const SECOND_UPDATE: PostedUpdate = {
  id: 'u2',
  text: 'The council has agreed to test this on Linden Avenue in July. We will share the dates here.',
  by: 'Parks and public space team',
  date: '27 October 2026'
};

/** One record's updates, live: Publish puts the new one on top, and its toast can take it back. */
export function DemoUpdates({initial = []}: {initial?: PostedUpdate[]}) {
  const [updates, setUpdates] = useState(initial);
  return (
    <OfficialUpdate updates={updates} onPublish={({text, name}) => {
      const update = {id: `u${Date.now()}`, text, by: name || undefined, date: 'Today'};
      setUpdates(list => [update, ...list]);
      queue.add({title: 'Official update published', description: 'The author and everyone following this idea will see it.',
        action: 'Undo', onAction: () => setUpdates(list => list.filter(u => u.id !== update.id))}, {timeout: 6000});
    }} />
  );
}

const meta: Meta<typeof OfficialUpdate> = {
  title: 'Patterns/Manage tab/Official update',
  component: OfficialUpdate,
  subcomponents: {PostedOfficialUpdate, OfficialUpdateForm, BulkOfficialUpdate},
  tags: ['autodocs', 'not-in-figma', 'status:candidate'],
  excludeStories: /^(Demo[A-Z]\w*|[A-Z_]+)$/,
  parameters: {layout: 'padded'},
  decorators: [Story => <><Story /><ToastRegion /></>]
};
export default meta;
type Story = StoryObj<typeof OfficialUpdate>;

/** No update yet, one posted, two posted (newest first, one under a chosen name), at the side panel's width. */
export const AllVariants: Story = {
  render: () => (
    <div style={{display: 'grid', gridTemplateColumns: 'repeat(3, 512px)', gap: 32, alignItems: 'start'}}>
      <DemoUpdates />
      <DemoUpdates initial={[FIRST_UPDATE]} />
      <DemoUpdates initial={[SECOND_UPDATE, FIRST_UPDATE]} />
    </div>
  )
};

/** No update yet: the words, the name people see ("The project team" when left empty), Publish. Publish is on once
 * there are words; the update then shows above the form, with an Undo toast. */
export const Empty: Story = {render: () => <div style={{width: 512}}><DemoUpdates /></div>};

/** One update posted: "Official update · The project team" on the stage grey, then the form for the next one. */
export const Posted: Story = {render: () => <div style={{width: 512}}><DemoUpdates initial={[FIRST_UPDATE]} /></div>};

/** The Selection bar's Official update, for two selected ideas: the same form in a Modal, its footer saying who it
 * goes to, then Send (on once there are words). Sending closes it, with an Undo toast. */
export const Bulk: Story = {
  parameters: {docs: {story: {inline: false, iframeHeight: 520}}},
  render: function Render() {
    const [open, setOpen] = useState(true);
    return (
      <>
        <Button variant="secondary" onPress={() => setOpen(true)}>
          <MessageSquareText aria-hidden size={16} />Official update
        </Button>
        <BulkOfficialUpdate count={2} isOpen={open} onOpenChange={setOpen}
          onSend={() => queue.add({title: 'Official update sent to 2 ideas',
            description: 'The authors and everyone following them will see it.', action: 'Undo'}, {timeout: 6000})} />
      </>
    );
  }
};

/**
 * The keys the form takes: Tab goes from the words to the name, then to Publish; Enter on Publish posts the update.
 * Try the keys here; an automated test presses them too (the Interactions panel).
 */
export const Keyboard: Story = {
  render: () => <div style={{width: 512}}><DemoUpdates /></div>,
  play: async ({canvasElement}) => {
    const canvas = within(canvasElement);
    await userEvent.tab();
    const words = canvas.getByRole('textbox', {name: 'Official update'});
    await expect(words).toHaveFocus();
    await userEvent.keyboard('We will test this in July.');
    await userEvent.tab();
    await expect(canvas.getByRole('textbox', {name: 'Name shown with the update'})).toHaveFocus();
    await userEvent.tab();
    await expect(canvas.getByRole('button', {name: 'Publish'})).toHaveFocus();
    await userEvent.keyboard('{Enter}');
    await expect(canvas.getByRole('article', {name: /^Official update · The project team/})).toHaveTextContent('We will test this in July.');
    await expect(words).toHaveValue('');
  }
};
