import {expect, userEvent, within} from 'storybook/test';
import {CheckboxGroup} from '../CheckboxGroup';
import {Checkbox} from './Checkbox';
import type {Meta, StoryFn} from '@storybook/react-vite';

const meta: Meta<typeof CheckboxGroup> = {
  title: 'Components/Forms/Checkbox group',
  component: CheckboxGroup,
  parameters: {
    layout: 'centered'
  },
  tags: ['autodocs', 'not-in-figma', 'status:candidate']
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

/** The keyboard, proved by this story's play function: Tab moves from box to box (each is its own stop), Space ticks
 * the focused one, and Shift+Tab goes back. */
export const Keyboard: Story = () => (
  <CheckboxGroup label="Topics" defaultValue={['nature']}>
    <Checkbox value="nature">Nature</Checkbox>
    <Checkbox value="transport">Transport</Checkbox>
    <Checkbox value="housing">Housing</Checkbox>
  </CheckboxGroup>
);
Keyboard.play = async ({canvasElement}) => {
  const canvas = within(canvasElement);
  const nature = canvas.getByRole('checkbox', {name: 'Nature'});
  const transport = canvas.getByRole('checkbox', {name: 'Transport'});
  await userEvent.tab();
  await expect(nature).toHaveFocus();
  await userEvent.tab();
  await expect(transport).toHaveFocus();
  await userEvent.keyboard(' ');
  await expect(transport).toBeChecked();
  await expect(nature).toBeChecked();
  await userEvent.tab({shift: true});
  await expect(nature).toHaveFocus();
};
