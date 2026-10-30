import {useState} from 'react';
import type {Meta, StoryObj} from '@storybook/react-vite';
import {expect, fn, userEvent, waitFor, within} from 'storybook/test';
import {Globe, Hash, Map as MapIcon, Type} from 'lucide-react';
import {AssistantPanel} from './AssistantPanel';
import {ChatMessage} from '../components/gv/ChatMessage';
import {ChatProgress} from '../components/gv/ChatProgress';
import {ItemChip} from '../components/gv/ItemChip';

const meta: Meta<typeof AssistantPanel> = {
  title: 'Patterns/Report builder/Assistant panel',
  component: AssistantPanel,
  tags: ['autodocs', 'not-in-figma'],
  parameters: {layout: 'padded'},
  args: {onSend: fn(), onStop: fn(), onAttach: fn(), onSuggestion: fn(), onGenerate: fn(), onClearScope: fn(),
    onAskAccountManager: fn()},
  // The report builder's end column: 360 wide, the window's height less the top bar.
  decorators: [Story => <div style={{height: 640, width: 360, maxWidth: '100%'}}><Story /></div>]
};
export default meta;
type Story = StoryObj<typeof AssistantPanel>;

const REPORT_PROMPTS = [
  {id: 'short', label: 'Make the summary shorter'},
  {id: 'who', label: 'Explain who took part'},
  {id: 'reach', label: 'Remove the Reach section'}
];
const BLOCK_PROMPTS = [
  {id: 'visitors', label: 'Add how many visitors took part'},
  {id: 'first', label: 'Lead with the first-time participants'}
];
const PREVIEW = [
  {id: 'ask', icon: <Type aria-hidden />, label: 'Change it by asking',
    description: '“Make the summary shorter”, “Turn what happens next into decisions”.'},
  {id: 'translate', icon: <Globe aria-hidden />, label: 'Translate the whole report',
    description: 'German for every page in one go, ready to check.'},
  {id: 'charts', icon: <MapIcon aria-hidden />, label: 'Charts the widgets don’t have',
    description: 'A map by area, how people feel per project, before and after.'}
];
const BLOCK = {label: 'By the numbers', icon: <Hash aria-hidden />};

const conversation = [
  <ChatMessage key="1" from="you">Remove the Reach section</ChatMessage>,
  <ChatMessage key="2" from="assistant" change="1 section removed. The version before is kept." onUndo={() => {}} onShowChange={() => {}}>
    I removed the Reach section, its numbers and its chart. Contents updated with it.
  </ChatMessage>
];

/** On, first run: nothing said yet; the openings sit at the foot above the composer. */
export const On: Story = {args: {suggestions: REPORT_PROMPTS}};

/** On, mid-conversation: the turns, then the openings, then the composer. */
export const Conversation: Story = {args: {suggestions: REPORT_PROMPTS, children: conversation}};

/** Off: the thread and composer at 45%; what it could do, why it is off, and whom to ask. */
export const Off: Story = {args: {isEnabled: false, previewItems: PREVIEW, children: conversation}};

/** An empty report: one opening, Generate (the page confirms in a Modal, then runs). */
export const EmptyReport: Story = {name: 'Empty report', args: {isEmpty: true}};

/** Generating: the steps tick off in the thread; no openings; send is a stop square. */
export const Generating: Story = {
  args: {
    isWorking: true,
    children: [
      <ChatMessage key="1" from="you">Generate a report from the folder</ChatMessage>,
      <ChatProgress key="2" steps={[
        {id: 'read', label: 'Reading the 6 projects across 3 spaces', status: 'done'},
        {id: 'count', label: 'Counting identifiable participants', status: 'done'},
        {id: 'write', label: 'Writing 8 sections'}
      ]} />
    ]
  }
};

/** Scoped to a block: the chip in the composer (× back to the whole report) and that block's prompts. */
export const ScopedToABlock: Story = {
  name: 'Scoped to a block',
  args: {
    scope: BLOCK, suggestions: BLOCK_PROMPTS,
    children: [
      <ChatMessage key="1" from="you" context={<ItemChip variant="quiet" icon={<Hash aria-hidden />} label="By the numbers" />}>
        Lead with first-time participants
      </ChatMessage>,
      <ChatMessage key="2" from="assistant" change="1 widget changed. The version before is kept." onUndo={() => {}} onShowChange={() => {}}>
        First-time participants now lead: 61% had never taken part before.
      </ChatMessage>
    ]
  }
};

/** Right to left. */
export const RightToLeft: Story = {name: 'Right to left', globals: {direction: 'rtl'}, args: ScopedToABlock.args};

interface Turn {id: number; from: 'you' | 'assistant'; text: string; change?: string; undone?: boolean; stopped?: boolean}

/** The whole loop, as the report builder runs it: ask, think, answer with Undo; stop; clear the scope. */
export const Live: Story = {
  render: () => {
    const [turns, setTurns] = useState<Turn[]>([]);
    const [working, setWorking] = useState<ReturnType<typeof setTimeout> | null>(null);
    const [scope, setScope] = useState<typeof BLOCK | undefined>(BLOCK);
    const add = (t: Omit<Turn, 'id'>) => setTurns(all => [...all, {...t, id: all.length}]);
    const send = (text: string) => {
      add({from: 'you', text});
      setWorking(setTimeout(() => {
        add({from: 'assistant', text: 'Done. I made that change.', change: '1 widget changed. The version before is kept.'});
        setWorking(null);
      }, 1200));
    };
    const stop = () => {
      if (working) clearTimeout(working);
      setWorking(null);
      add({from: 'assistant', text: '', stopped: true});
    };
    const prompts = scope ? BLOCK_PROMPTS : REPORT_PROMPTS;
    return (
      <AssistantPanel onSend={send} isWorking={working != null} onStop={stop} scope={scope}
        onClearScope={() => setScope(undefined)} suggestions={prompts}
        onSuggestion={id => send(prompts.find(p => p.id === id)!.label)}>
        {turns.map(t => (
          <ChatMessage key={t.id} from={t.from} change={t.change} status={t.stopped ? 'stopped' : t.undone ? 'undone' : 'done'}
            labels={{stopped: 'Stopped. The report was not changed.'}}
            onUndo={t.change ? () => setTurns(all => all.map(x => (x.id === t.id ? {...x, undone: true} : x))) : undefined}>
            {t.text || undefined}
          </ChatMessage>
        ))}
        {working != null && <ChatProgress />}
      </AssistantPanel>
    );
  }
};

/** By keyboard: clear the scope with its × (focus moves to the field), send a prompt with Enter, and stop it with the stop square. */
export const Keyboard: Story = {
  render: Live.render,
  play: async ({canvasElement}) => {
    const canvas = within(canvasElement);
    const panel = canvas.getByRole('region', {name: 'Assistant'});
    await expect(canvas.getByRole('heading', {name: 'What should change in by the numbers?'})).toBeInTheDocument();
    const clear = within(panel).getByRole('button', {name: 'Ask about the whole report'});
    await clear.focus();
    await userEvent.keyboard('{Enter}');
    await expect(await canvas.findByRole('heading', {name: 'What should it change?'})).toBeInTheDocument();
    const field = canvas.getByRole('textbox', {name: 'Ask the assistant'});
    await waitFor(() => expect(field).toHaveFocus());
    await userEvent.keyboard('Translate it to Spanish{Enter}');
    const stop = await canvas.findByRole('button', {name: 'Stop'});
    await userEvent.tab();
    await expect(stop).toHaveFocus();
    await userEvent.keyboard('{Enter}');
    await waitFor(() => expect(canvas.getByText('Stopped. The report was not changed.')).toBeInTheDocument());
  }
};
