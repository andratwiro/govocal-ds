import {expect, userEvent, within} from 'storybook/test';
import {Button} from '../Button';
import {RadioGroup, Radio} from '../RadioGroup';
import type {Meta, StoryFn} from '@storybook/react-vite';

const meta: Meta<typeof RadioGroup> = {
  title: 'Components/Forms/Radio group',
  component: RadioGroup,
  parameters: {
    layout: 'centered'
  },
  tags: ['autodocs', 'not-in-figma']
};

export default meta;

type Story = StoryFn<typeof RadioGroup>;

export const Example: Story = args => (
  <RadioGroup {...args}>
    <Radio value="soccer">Soccer</Radio>
    <Radio value="baseball">Baseball</Radio>
    <Radio value="basketball">Basketball</Radio>
  </RadioGroup>
);

Example.args = {
  label: 'Favorite sport'
};

/** As in the prototype's New project modal: options with a description, side by side, and disabled. */
export const AllStates: StoryFn<typeof RadioGroup> = () => (
  <div style={{display: 'flex', gap: 48, alignItems: 'flex-start'}}>
    <RadioGroup label="Who can find it" defaultValue="public">
      <Radio value="public" description="Appears on the homepage, in the project list and in search.">
        Public
      </Radio>
      <Radio value="private" description="Hidden from those places. Only people with the link can reach it.">
        Private
      </Radio>
    </RadioGroup>
    <div style={{display: 'flex', flexDirection: 'column', gap: 32}}>
      <RadioGroup label="Survey type" orientation="horizontal" defaultValue="native">
        <Radio value="native">Built-in survey</Radio>
        <Radio value="external">External survey</Radio>
      </RadioGroup>
      <RadioGroup label="Voting method" defaultValue="single" isDisabled>
        <Radio value="single">Single choice</Radio>
        <Radio value="multiple">Multiple choice</Radio>
      </RadioGroup>
    </div>
  </div>
);

/** The keyboard, proved by this story's play function: Tab lands on the chosen option (one stop for the group), the
 * arrow keys move and choose, and the next Tab leaves the group. */
export const Keyboard: Story = () => (
  <div style={{display: 'flex', flexDirection: 'column', gap: 16, alignItems: 'flex-start'}}>
    <RadioGroup label="Who can find it" defaultValue="private">
      <Radio value="public">Public</Radio>
      <Radio value="private">Private</Radio>
      <Radio value="link">Only with the link</Radio>
    </RadioGroup>
    <Button variant="secondary">After the group</Button>
  </div>
);
Keyboard.play = async ({canvasElement}) => {
  const canvas = within(canvasElement);
  const radio = (name: string) => canvas.getByRole('radio', {name});
  await userEvent.tab();
  await expect(radio('Private')).toHaveFocus();
  await userEvent.keyboard('{ArrowDown}');
  await expect(radio('Only with the link')).toHaveFocus();
  await expect(radio('Only with the link')).toBeChecked();
  await userEvent.keyboard('{ArrowUp}');
  await userEvent.keyboard('{ArrowUp}');
  await expect(radio('Public')).toBeChecked();
  await userEvent.tab();
  await expect(canvas.getByRole('button', {name: 'After the group'})).toHaveFocus();
};
