import {useState} from 'react';
import type {Meta, StoryObj} from '@storybook/react-vite';
import {expect, fn, userEvent, waitFor, within} from 'storybook/test';
import {Hash} from 'lucide-react';
import {PromptComposer, type PromptComposerAttachment} from './PromptComposer';
import {ItemChip} from './ItemChip';
import {Stack} from './Stack';
import {Text} from './Text';

const meta: Meta<typeof PromptComposer> = {
  title: 'Components/AI/Prompt composer',
  component: PromptComposer,
  tags: ['autodocs', 'not-in-figma', 'status:draft'],
  parameters: {layout: 'padded'},
  args: {onSend: fn(), onAttach: fn()},
  decorators: [Story => <div style={{maxWidth: 320}}><Story /></div>]
};
export default meta;
type Story = StoryObj<typeof PromptComposer>;

const scope = (onRemove = fn()) => (
  <ItemChip variant="filled" icon={<Hash aria-hidden />} label="By the numbers" onRemove={onRemove}
    labels={{remove: () => 'Ask about the whole report'}} />
);

/** Empty, the state it starts in: send is grey and off until something is written. Enter sends, Shift+Enter makes a new line. */
export const Default: Story = {};

/** A prompt to send: the round button turns ink. */
export const Ready: Story = {args: {defaultValue: 'Make the summary shorter'}};

/**
 * The assistant is working on the prompt just sent (it went into the Chat thread above, so the field is empty again):
 * the field locks, the paperclip is off, and send becomes a stop square.
 */
export const Working: Story = {args: {isWorking: true, onStop: fn()}};

/** About one block of a report: its chip first in the row; its × goes back to asking about the whole report. */
export const WithContext: Story = {name: 'With context', args: {context: scope()}};

/** Files the screen accepted: a chip each, with an × to remove it. Send still needs words in the field. */
export const WithAttachment: Story = {
  name: 'With attachment',
  render: args => {
    const [files, setFiles] = useState<PromptComposerAttachment[]>([{id: 'a', name: 'Council priorities 2026.pdf'}]);
    return <PromptComposer {...args} attachments={files} onRemoveAttachment={id => setFiles(f => f.filter(x => x.id !== id))} />;
  }
};

/** A file the screen refused: a red line with a mark, above the field (under the chips, when there are any). */
export const FileError: Story = {
  name: 'File error',
  args: {onFiles: fn(), onAttach: undefined, fileError: 'This file is over 25 MB. Attach a smaller one.'}
};

/**
 * Files dragged over the box (a screen that takes files, `onFiles`): it lights up in the AI tint and says "Drop to
 * attach" until they leave or drop. The look shows only while files are over it, so the story drags one in.
 */
export const DropTarget: Story = {
  name: 'Drop target',
  args: {onFiles: fn(), onAttach: undefined},
  play: async ({canvasElement}) => {
    const canvas = within(canvasElement);
    const dataTransfer = new DataTransfer();
    dataTransfer.items.add(new File(['%PDF'], 'Council priorities 2026.pdf', {type: 'application/pdf'}));
    canvas.getByRole('textbox', {name: 'Ask the assistant'})
      .dispatchEvent(new DragEvent('dragenter', {bubbles: true, cancelable: true, dataTransfer}));
    await waitFor(() => expect(canvas.getByText('Drop to attach')).toBeInTheDocument());
  }
};

/** Switched off, when the assistant isn't available on the account: field and buttons off, the box faded. The screen says why around it (Assistant panel's "off" state). */
export const Disabled: Story = {args: {isDisabled: true}};

/** Without a way to attach: no paperclip. */
export const NoAttach: Story = {name: 'No attach', args: {onAttach: undefined}};

/** A long prompt grows the field from 56px to 160px tall, then it scrolls. */
export const LongPrompt: Story = {
  name: 'Long prompt',
  args: {defaultValue: 'Rewrite the whole report in a more formal tone, use the four priority names everywhere, ' +
    'and add the upcoming events in Green Streets after the summary. Keep the charts as they are, but give each a ' +
    'one-line finding above it that says what it shows. Then shorten the summary to three sentences.'}
};

/** Right to left: the paperclip at the start edge (right), send at the end (left). */
export const RightToLeft: Story = {name: 'Right to left', globals: {direction: 'rtl'}, args: {context: scope()}};

/** Type and Enter sends and clears; Shift+Enter is a new line; while working, the stop square takes the press. */
export const Keyboard: Story = {
  render: () => {
    const [sent, setSent] = useState<string[]>([]);
    const [working, setWorking] = useState(false);
    return (
      <Stack gap="12">
        <PromptComposer isWorking={working} onStop={() => setWorking(false)}
          onSend={p => { setSent(s => [...s, p]); setWorking(true); }} />
        <Text color="secondary">{sent.length ? `Sent: ${sent.join(' | ')}` : 'Not part of the composer: what you send shows here'}</Text>
      </Stack>
    );
  },
  play: async ({canvasElement}) => {
    const canvas = within(canvasElement);
    const field = canvas.getByRole('textbox', {name: 'Ask the assistant'});
    await userEvent.click(field);
    await userEvent.keyboard('Make it shorter{Shift>}{Enter}{/Shift}please');
    await expect(field).toHaveValue('Make it shorter\nplease');
    await userEvent.keyboard('{Enter}');
    await waitFor(() => expect(field).toHaveValue(''));
    await expect(canvas.getByText(/Sent: Make it shorter/)).toBeInTheDocument();
    const stop = canvas.getByRole('button', {name: 'Stop'});
    await expect(field).toHaveAttribute('readonly');
    await userEvent.tab();
    await expect(stop).toHaveFocus();
    await userEvent.keyboard('{Enter}');
    await waitFor(() => expect(canvas.getByRole('button', {name: 'Send'})).toBeDisabled());
    await waitFor(() => expect(field).toHaveFocus());
  }
};
