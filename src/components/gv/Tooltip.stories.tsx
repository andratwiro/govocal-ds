import {Tooltip, TooltipTrigger} from './Tooltip';
import {Button} from './Button';
import {Save} from 'lucide-react';
import type {Meta, StoryFn} from '@storybook/react-vite';

const meta: Meta<typeof Tooltip> = {
  component: Tooltip,
  parameters: {
    layout: 'centered'
  },
  tags: ['autodocs']
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
export const AllStates: StoryFn<typeof Tooltip> = () => (
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
