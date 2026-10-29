import {DatePicker} from './DatePicker';
import type {Meta, StoryFn} from '@storybook/react-vite';

const meta: Meta<typeof DatePicker> = {
  component: DatePicker,
  parameters: {
    layout: 'centered'
  },
  tags: ['autodocs']
};

export default meta;
type Story = StoryFn<typeof DatePicker>;

export const Example: Story = args => <DatePicker {...args} />;

Example.args = {
  label: 'Event date'
};

export const AllStates: StoryFn<typeof DatePicker> = () => (
  <div style={{display: 'flex', gap: 24}}>
    <DatePicker label="Ideation phase starts" />
    <DatePicker label="Ideation phase ends" isDisabled />
  </div>
);
