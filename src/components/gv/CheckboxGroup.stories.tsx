import {CheckboxGroup} from '../CheckboxGroup';
import {Checkbox} from './Checkbox';
import type {Meta, StoryFn} from '@storybook/react-vite';

const meta: Meta<typeof CheckboxGroup> = {
  title: 'Components/Forms/Checkbox group',
  component: CheckboxGroup,
  parameters: {
    layout: 'centered'
  },
  tags: ['autodocs', 'not-in-figma']
};

export default meta;
type Story = StoryFn<typeof CheckboxGroup>;

export const Example: Story = args => (
  <CheckboxGroup {...args}>
    <Checkbox value="soccer">Soccer</Checkbox>
    <Checkbox value="baseball">Baseball</Checkbox>
    <Checkbox value="basketball">Basketball</Checkbox>
  </CheckboxGroup>
);

Example.args = {
  label: 'Favorite sports'
};
