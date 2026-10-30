import {useState, type ReactNode} from 'react';
import type {Meta, StoryObj} from '@storybook/react-vite';
import {expect, userEvent, waitFor, within} from 'storybook/test';
import {ChatThread} from './ChatThread';
import {ChatMessage} from './ChatMessage';
import {ChatProgress} from './ChatProgress';
import {PromptComposer} from './PromptComposer';
import {PromptSuggestions} from './PromptSuggestions';

const meta: Meta<typeof ChatThread> = {
  title: 'Components/AI/Chat thread',
  component: ChatThread,
  tags: ['autodocs', 'not-in-figma', 'status:draft'],
  parameters: {layout: 'padded'},
  // The thread fills its container's height: here a 560 column, as the report builder's end column.
  decorators: [Story => <div style={{height: 560, maxWidth: 360}}><Story /></div>]
};
export default meta;
type Story = StoryObj<typeof ChatThread>;

const PROMPTS = [
  {id: 'short', label: 'Make the summary shorter'},
  {id: 'who', label: 'Explain who took part'},
  {id: 'reach', label: 'Remove the Reach section'}
];
const openings = <PromptSuggestions heading="What should it change?" items={PROMPTS} />;
const composer = <PromptComposer onSend={() => {}} onAttach={() => {}} />;

const TURNS: ReactNode[] = [
  <ChatMessage key="1" from="you">Remove the Reach section</ChatMessage>,
  <ChatMessage key="2" from="assistant" change="1 section removed. The version before is kept." onUndo={() => {}} onShowChange={() => {}}>
    I removed the Reach section, its numbers and its chart. Contents updated with it.
  </ChatMessage>,
  <ChatMessage key="3" from="you">Which project had the most participants?</ChatMessage>,
  <ChatMessage key="4" from="assistant">Tree planting by street had the most participants: 1,286 of 3,600. I did not change the report.</ChatMessage>
];

/** First run: nothing said yet, the openings at the foot above the composer. */
export const Empty: Story = {args: {openings, composer}};

/** A conversation: the turns, then the openings, then the composer. */
export const Conversation: Story = {args: {openings, composer, children: TURNS}};

/** Working: the progress row last, no openings, the composer's stop square. */
export const Working: Story = {
  args: {
    composer: <PromptComposer onSend={() => {}} isWorking onStop={() => {}} />,
    children: [...TURNS, <ChatMessage key="5" from="you">Translate it to Spanish</ChatMessage>, <ChatProgress key="6" />]
  }
};

/** Long: it opens at the latest turn. Scroll up and "Jump to latest" appears. */
export const Long: Story = {
  args: {openings, composer, children: [...TURNS, ...TURNS, ...TURNS].map((t, i) => <div key={i}>{t}</div>)}
};

/** Switched off: the thread steps back to 45% and takes no presses; the composer is off too. */
export const Disabled: Story = {
  args: {
    isDisabled: true, children: TURNS.slice(0, 2),
    composer: <PromptComposer onSend={() => {}} isDisabled />,
    openings: <PromptSuggestions kind="preview" heading="What the assistant could do here"
      items={[{id: 'ask', label: 'Change it by asking', description: '“Make the summary shorter”.'}]} />
  }
};

/** Right to left: your bubbles at the left, the composer mirrored. */
export const RightToLeft: Story = {name: 'Right to left', globals: {direction: 'rtl'}, args: Conversation.args};

/** A working conversation: send a prompt and the reply arrives at the foot, kept in view. */
export const Live: Story = {
  render: () => {
    const [turns, setTurns] = useState<{id: number; from: 'you' | 'assistant'; text: string}[]>([]);
    const [working, setWorking] = useState(false);
    const send = (text: string) => {
      setTurns(t => [...t, {id: t.length, from: 'you', text}]);
      setWorking(true);
      setTimeout(() => {
        setTurns(t => [...t, {id: t.length, from: 'assistant', text: 'In the real product I would make that change. Here, try one of the suggestions.'}]);
        setWorking(false);
      }, 900);
    };
    return (
      <ChatThread
        openings={!working && <PromptSuggestions heading="What should it change?" items={PROMPTS}
          onAction={id => send(PROMPTS.find(p => p.id === id)!.label)} />}
        composer={<PromptComposer onSend={send} isWorking={working} onStop={() => setWorking(false)} />}>
        {turns.map(t => <ChatMessage key={t.id} from={t.from}>{t.text}</ChatMessage>)}
        {working && <ChatProgress />}
      </ChatThread>
    );
  }
};

/** A suggestion pressed by keyboard sends it, focus moves to the field, and the reply lands in the log. */
export const Keyboard: Story = {
  render: Live.render,
  play: async ({canvasElement}) => {
    const canvas = within(canvasElement);
    await userEvent.tab();
    const first = canvas.getByRole('button', {name: 'Make the summary shorter'});
    await expect(first).toHaveFocus();
    await userEvent.keyboard('{Enter}');
    const log = canvas.getByRole('log', {name: 'Conversation'});
    await expect(within(log).getByText('Make the summary shorter')).toBeInTheDocument();
    await waitFor(() => expect(canvas.getByRole('textbox', {name: 'Ask the assistant'})).toHaveFocus());
    await waitFor(() => expect(within(log).getByText(/try one of the suggestions/)).toBeInTheDocument(), {timeout: 3000});
  }
};
