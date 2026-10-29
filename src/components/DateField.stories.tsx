import {DateField} from './DateField';
import type {Meta, StoryFn} from '@storybook/react-vite';

const meta: Meta<typeof DateField> = {
  component: DateField,
  parameters: {
    layout: 'centered'
  },
  tags: ['autodocs']
};

export default meta;
type Story = StoryFn<typeof DateField>;

export const Example: Story = args => <DateField {...args} />;

Example.args = {
  label: 'Event date'
};
