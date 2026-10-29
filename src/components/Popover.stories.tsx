import {Popover} from './Popover';
import {Button} from './Button';
import {DialogTrigger} from './Dialog';
import {Heading} from './Content';
import {HelpCircle} from 'lucide-react';
import './stories.css';
import type {Meta, StoryFn} from '@storybook/react-vite';

const meta: Meta<typeof Popover> = {
  component: Popover,
  parameters: {
    layout: 'centered'
  },
  tags: ['autodocs']
};

export default meta;
type Story = StoryFn<typeof Popover>;

export const Example: Story = args => (
  <DialogTrigger>
    <Button aria-label="Help">
      <HelpCircle size={18} />
    </Button>
    <Popover {...args} className="react-aria-Popover popover-padding">
      <Heading slot="title">Help</Heading>
      <p>For help accessing your account, please contact support.</p>
    </Popover>
  </DialogTrigger>
);
