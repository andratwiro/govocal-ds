import {useState} from 'react';
import type {Meta, StoryObj} from '@storybook/react-vite';
import {expect, fn, userEvent, waitFor, within} from 'storybook/test';
import {Hash, Sparkles} from 'lucide-react';
import {ChatChoices, ChatMessage} from './ChatMessage';
import {ItemChip} from './ItemChip';
import {Stack} from './Stack';

const meta: Meta<typeof ChatMessage> = {
  title: 'Components/AI/Chat message',
  component: ChatMessage,
  tags: ['autodocs', 'not-in-figma'],
  parameters: {layout: 'padded'},
  decorators: [Story => <div style={{maxWidth: 360}}><Story /></div>]
};
export default meta;
type Story = StoryObj<typeof ChatMessage>;

const scope = <ItemChip variant="quiet" icon={<Hash aria-hidden />} label="By the numbers" />;

/** Every state, as a thread would show them. */
export const AllVariants: Story = {
  name: 'All variants',
  render: () => (
    <Stack gap="12">
      <ChatMessage from="you">Remove the Reach section</ChatMessage>
      <ChatMessage from="assistant" change="1 section removed. The version before is kept." onUndo={fn()} onShowChange={fn()}>
        I removed the Reach section, its numbers and its chart. Contents updated with it.
      </ChatMessage>
      <ChatMessage from="you">Which project had the most participants?</ChatMessage>
      <ChatMessage from="assistant">
        <b>Tree planting by street</b> had the most participants: 1,286 of 3,600. I did not change the report.
      </ChatMessage>
      <ChatMessage from="you">Translate it to Spanish</ChatMessage>
      <ChatMessage from="assistant" status="stopped" labels={{stopped: 'Stopped. The report was not changed.'}} />
      <ChatMessage from="you" context={scope}>Lead with first-time participants</ChatMessage>
      <ChatMessage from="assistant" status="error" onRetry={fn()} />
    </Stack>
  )
};

/** Yours: a grey bubble at the end edge that keeps your line breaks. */
export const You: Story = {
  args: {from: 'you', children: 'Make the summary shorter.\nKeep the three numbers.'}
};

/** The assistant's: plain text, no bubble, bold allowed. An answer with no change says so. */
export const Assistant: Story = {
  args: {
    from: 'assistant',
    children: <>Tree planting by street had the most participants: <b>1,286 of 3,600</b>. I did not change the report.</>
  }
};

/** A reply that changed the document: the muted change line, then Undo this change and Show what changed. */
export const WithChange: Story = {
  name: 'With change',
  args: {
    from: 'assistant', change: '1 widget changed. The version before is kept.', onUndo: fn(), onShowChange: fn(),
    children: 'First-time participants now lead: 61% had never taken part before.'
  }
};

/** After Undo: the button turns off and stays, so the thread keeps the record. */
export const Undone: Story = {
  args: {...WithChange.args, status: 'undone'}
};

/** A reply that asks you to choose. Once you pick, both buttons turn off and the pick stays marked. */
export const Choice: Story = {
  render: () => {
    const [picked, setPicked] = useState<string | null>(null);
    return (
      <ChatMessage from="assistant"
        choices={<ChatChoices aria-label="Rebuild the widget?" value={picked} onChange={setPicked} items={[
          {id: 'rebuild', label: 'Rebuild it', variant: 'primary', icon: <Sparkles aria-hidden size={16} />},
          {id: 'keep', label: 'Keep it'}
        ]} />}>
        By the numbers is a built-in widget, so I can’t edit it. I can rebuild it as an editable copy with the same
        four numbers.
      </ChatMessage>
    );
  }
};

/** Failed: a danger mark, words that say nothing changed, and Retry. */
export const Failed: Story = {
  name: 'Error',
  args: {from: 'assistant', status: 'error', onRetry: fn()}
};

/** Stopped before it changed anything. The page names what was left alone. */
export const Stopped: Story = {
  args: {from: 'assistant', status: 'stopped', labels: {stopped: 'Stopped. The report was not changed.'}}
};

/** Still being written: a caret after the words (still under reduced motion). */
export const Streaming: Story = {
  args: {from: 'assistant', status: 'streaming', children: 'I rewrote the subtitle so it says what the report'}
};

/** You asked about one block: a quiet Item chip names it above your bubble. */
export const AboutABlock: Story = {
  name: 'About a block',
  args: {from: 'you', context: scope, children: 'Lead with first-time participants'}
};

/** Right to left: your bubble at the start edge (the end in Arabic), the actions mirrored. */
export const RightToLeft: Story = {
  name: 'Right to left',
  globals: {direction: 'rtl'},
  render: () => (
    <Stack gap="12">
      <ChatMessage from="you">Remove the Reach section</ChatMessage>
      <ChatMessage {...WithChange.args} from="assistant" />
    </Stack>
  )
};

/** Tab reaches Undo, then Show what changed; Enter runs each. A choice turns both buttons off and keeps focus. */
export const Keyboard: Story = {
  render: () => {
    const [undone, setUndone] = useState(false);
    const [picked, setPicked] = useState<string | null>(null);
    return (
      <Stack gap="12">
        <ChatMessage from="assistant" change="1 section removed. The version before is kept."
          status={undone ? 'undone' : 'done'} onUndo={() => setUndone(true)} onShowChange={() => {}}>
          I removed the Reach section.
        </ChatMessage>
        <ChatMessage from="assistant" choices={<ChatChoices aria-label="Rebuild the widget?" value={picked}
          onChange={setPicked} items={[{id: 'rebuild', label: 'Rebuild it', variant: 'primary'}, {id: 'keep', label: 'Keep it'}]} />}>
          Rebuild it as an editable copy?
        </ChatMessage>
      </Stack>
    );
  },
  play: async ({canvasElement}) => {
    const canvas = within(canvasElement);
    const undo = canvas.getByRole('button', {name: 'Undo this change'});
    await userEvent.tab();
    await expect(undo).toHaveFocus();
    await userEvent.tab();
    await expect(canvas.getByRole('button', {name: 'Show what changed'})).toHaveFocus();
    await userEvent.tab();
    const rebuild = canvas.getByRole('button', {name: 'Rebuild it'});
    await expect(rebuild).toHaveFocus();
    await userEvent.keyboard('{Enter}');
    await waitFor(() => expect(rebuild).toBeDisabled());
    await expect(canvas.getByRole('button', {name: 'Keep it'})).toBeDisabled();
    await expect(rebuild).toHaveAttribute('aria-pressed', 'true');
    await waitFor(() => expect(canvas.getByRole('group', {name: 'Rebuild the widget?'})).toHaveFocus());
    await undo.focus();
    await userEvent.keyboard('{Enter}');
    await waitFor(() => expect(undo).toBeDisabled());
  }
};
