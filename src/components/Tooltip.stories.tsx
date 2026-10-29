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
    <Button>
      <Save size={18} />
    </Button>
    <Tooltip {...args}>Save</Tooltip>
  </TooltipTrigger>
);

export const AllStates: StoryFn<typeof Tooltip> = () => (
  <div style={{display: 'flex', gap: 32}}>
    <TooltipTrigger isOpen>
      <Button>Publish project</Button>
      <Tooltip>Platform menu</Tooltip>
    </TooltipTrigger>
    <TooltipTrigger isOpen>
      <Button>Green Corridors for Riverside</Button>
      <Tooltip>
        Private, so it does not appear on the homepage, in search or in widgets.
      </Tooltip>
    </TooltipTrigger>
  </div>
);
