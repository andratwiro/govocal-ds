import {ToggleButton} from './ToggleButton';
import type {Meta, StoryFn} from '@storybook/react-vite';

const meta: Meta<typeof ToggleButton> = {
  component: ToggleButton,
  parameters: {
    layout: 'centered'
  },
  tags: ['autodocs']
};

export default meta;

type Story = StoryFn<typeof ToggleButton>;

export const Example: Story = args => <ToggleButton {...args}>Pin</ToggleButton>;
