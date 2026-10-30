import type {Meta, StoryObj} from '@storybook/react-vite';
import {expect, fn, userEvent, within} from 'storybook/test';
import {Globe, Map as MapIcon, Type} from 'lucide-react';
import {PromptSuggestions} from './PromptSuggestions';
import {Button} from '../Button';

const meta: Meta<typeof PromptSuggestions> = {
  title: 'Components/AI/Prompt suggestions',
  component: PromptSuggestions,
  tags: ['autodocs', 'not-in-figma', 'status:draft'],
  parameters: {layout: 'padded'},
  args: {onAction: fn()},
  decorators: [Story => <div style={{maxWidth: 320}}><Story /></div>]
};
export default meta;
type Story = StoryObj<typeof PromptSuggestions>;

/** About the whole report: two or three prompts to send as they are. */
export const Report: Story = {
  args: {
    heading: 'What should it change?',
    items: [
      {id: 'short', label: 'Make the summary shorter'},
      {id: 'who', label: 'Explain who took part'},
      {id: 'reach', label: 'Remove the Reach section'}
    ]
  }
};

/** About one block: the heading names it and the prompts are its own. */
export const Scoped: Story = {
  args: {
    heading: 'What should change in by the numbers?',
    items: [
      {id: 'visitors', label: 'Add how many visitors took part'},
      {id: 'first', label: 'Lead with the first-time participants'}
    ]
  }
};

/** An empty report: one opening, which starts a generate run (the page confirms first). */
export const EmptyReport: Story = {
  name: 'Empty report',
  args: {heading: 'What should it change?', items: [{id: 'generate', label: 'Generate a report from the folder'}]}
};

/** Switched off: what it could do, not pressable, and whom to ask. */
export const NotSwitchedOn: Story = {
  name: 'Not switched on',
  args: {
    kind: 'preview',
    heading: 'What the assistant could do here',
    items: [
      {id: 'ask', icon: <Type aria-hidden />, label: 'Change it by asking',
        description: '“Make the summary shorter”, “Turn what happens next into decisions”.'},
      {id: 'translate', icon: <Globe aria-hidden />, label: 'Translate the whole report',
        description: 'German for every page in one go, ready to check.'},
      {id: 'charts', icon: <MapIcon aria-hidden />, label: 'Charts the widgets don’t have',
        description: 'A map by area, how people feel per project, before and after.'}
    ],
    footer: <><span>Not switched on for this platform.</span><Button variant="secondary" size={32}>Ask your account manager</Button></>
  }
};

/** While the assistant works the rows are off (a page usually hides them instead). */
export const Disabled: Story = {args: {...Report.args, isDisabled: true}};

/** Right to left: ✦ at the start edge. */
export const RightToLeft: Story = {name: 'Right to left', globals: {direction: 'rtl'}, args: Report.args};

/** Tab moves row to row; Enter sends that row. */
export const Keyboard: Story = {
  args: Report.args,
  play: async ({canvasElement, args}) => {
    const canvas = within(canvasElement);
    await userEvent.tab();
    await expect(canvas.getByRole('button', {name: 'Make the summary shorter'})).toHaveFocus();
    await userEvent.tab();
    await expect(canvas.getByRole('button', {name: 'Explain who took part'})).toHaveFocus();
    await userEvent.keyboard('{Enter}');
    await expect(args.onAction).toHaveBeenCalledWith('who');
  }
};
