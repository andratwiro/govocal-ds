import {Tooltip, TooltipTrigger} from '../Tooltip';
import {Button} from '../Button';
import {Save} from 'lucide-react';
import {useEffect, useRef} from 'react';
import type {Meta, StoryFn} from '@storybook/react-vite';
import {expect, screen, userEvent, waitFor, within} from 'storybook/test';

const meta: Meta<typeof Tooltip> = {
  title: 'Components/Overlays/Tooltip',
  component: Tooltip,
  parameters: {
    layout: 'centered'
  },
  tags: ['autodocs', 'not-in-figma', 'status:candidate']
};

export default meta;

type Story = StoryFn<typeof Tooltip>;

export const Example: Story = args => (
  <TooltipTrigger>
    <Button aria-label="Save">
      <Save size={16} />
    </Button>
    <Tooltip {...args}>Save</Tooltip>
  </TooltipTrigger>
);

/** One line up to 320, then even lines; the tail only on the project's step cards. */
export const AllVariants: StoryFn<typeof Tooltip> = () => (
  <div style={{display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 72, paddingTop: 48}}>
    <TooltipTrigger isOpen>
      <Button variant="secondary">Platform menu</Button>
      <Tooltip>Show the platform menu</Tooltip>
    </TooltipTrigger>
    <TooltipTrigger isOpen>
      <Button variant="secondary">Private</Button>
      <Tooltip>Private, so it does not appear on the homepage, in search or in widgets.</Tooltip>
    </TooltipTrigger>
    <TooltipTrigger isOpen>
      <Button variant="secondary">Collect ideas</Button>
      <Tooltip showArrow>Step 2 of 4 · open until 12 Dec</Tooltip>
    </TooltipTrigger>
  </div>
);

/** Two lines: the text wraps, balanced, and the box hugs the longer line (quick actions, icon actions). */
export const TwoLines: StoryFn<typeof Tooltip> = () => (
  <div style={{paddingTop: 48}}>
    <TooltipTrigger isOpen>
      <Button variant="secondary">Private</Button>
      <Tooltip>Private, so it does not appear on the homepage, in search or in widgets.</Tooltip>
    </TooltipTrigger>
  </div>
);
TwoLines.storyName = 'Two lines';

/** The keyboard, proved by this story's play function (the Interactions panel): Tab onto a control shows its tooltip at
 * once, Esc hides it while focus stays, and Tab away hides it. */
export const Keyboard: StoryFn<typeof Tooltip> = () => (
  <div style={{display: 'flex', gap: 8, paddingTop: 48}}>
    <Button variant="secondary">Cancel</Button>
    <TooltipTrigger>
      <Button aria-label="Save"><Save aria-hidden size={16} /></Button>
      <Tooltip>Save</Tooltip>
    </TooltipTrigger>
    <Button variant="secondary">Share</Button>
  </div>
);
Keyboard.play = async ({canvasElement}) => {
  const canvas = within(canvasElement);
  const save = canvas.getByRole('button', {name: 'Save'});
  await userEvent.tab();
  await expect(canvas.getByRole('button', {name: 'Cancel'})).toHaveFocus();
  await userEvent.tab();
  await expect(save).toHaveFocus();
  await waitFor(() => expect(screen.getByRole('tooltip')).toHaveTextContent('Save'));
  await userEvent.keyboard('{Escape}');
  await waitFor(() => expect(screen.queryByRole('tooltip')).toBeNull());
  await expect(save).toHaveFocus();
  await userEvent.tab({shift: true});
  await userEvent.tab();
  await waitFor(() => expect(screen.getByRole('tooltip')).toBeInTheDocument());
  await userEvent.tab();
  await expect(canvas.getByRole('button', {name: 'Share'})).toHaveFocus();
  await waitFor(() => expect(screen.queryByRole('tooltip')).toBeNull());
};

/** A page that moves focus itself on load (a dialog's first field, a route's first link) shows no tooltip: it opens on
 * keyboard focus or hover only, never on a focus nobody asked for. The play function proves it: focus lands on Save
 * with no tooltip; Tab away and back shows it. */
export const FocusOnLoad: StoryFn<typeof Tooltip> = () => {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => ref.current?.querySelector('button')?.focus(), []);
  return (
    <div ref={ref} style={{display: 'flex', gap: 8, paddingTop: 48}}>
      <TooltipTrigger>
        <Button aria-label="Save"><Save aria-hidden size={16} /></Button>
        <Tooltip>Save</Tooltip>
      </TooltipTrigger>
      <Button variant="secondary">Share</Button>
    </div>
  );
};
FocusOnLoad.storyName = 'Focus on load';
FocusOnLoad.play = async ({canvasElement}) => {
  const canvas = within(canvasElement);
  const save = canvas.getByRole('button', {name: 'Save'});
  await waitFor(() => expect(save).toHaveFocus());
  await new Promise(resolve => setTimeout(resolve, 400));
  await expect(screen.queryByRole('tooltip')).toBeNull();
  await userEvent.tab();
  await userEvent.tab({shift: true});
  await waitFor(() => expect(screen.getByRole('tooltip')).toHaveTextContent('Save'));
};
