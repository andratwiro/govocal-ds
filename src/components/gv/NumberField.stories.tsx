import {Button} from '../Button';
import {expect, userEvent, within} from 'storybook/test';
import {NumberField} from '../NumberField';
import type {Meta, StoryObj} from '@storybook/react-vite';

const meta: Meta<typeof NumberField> = {
  title: 'Components/Forms/Number field',
  component: NumberField,
  parameters: {
    layout: 'centered',
    design: {
      type: 'figma',
      url: 'https://www.figma.com/design/OkMTJrzoV6em7gkqribtjA/Go-Vocal-Design-System?node-id=5-234'
    }
  },
  tags: ['autodocs']
};

export default meta;
type Story = StoryObj<typeof NumberField>;

export const Default: Story = {
  args: {label: 'Cookies', placeholder: '-'}
};

/** Proposal requirements, Voting Min / Max: the label sits beside the field, not above it. */
export const LabelAtTheSide: Story = {
  name: 'Label at the side',
  args: {label: 'Minimum budget', labelPosition: 'side', defaultValue: 100}
};

/** Voting's budget allocation: a fixed € sign inside the field, before the number. */
export const WithPrefix: Story = {
  name: 'With prefix',
  args: {label: 'Maximum', prefix: '€', defaultValue: 1000, minValue: 0}
};

/** The keyboard, proved by this story's play function: Tab lands in the number (the − and + buttons are for the
 * pointer and take no Tab stop); the up and down arrows step it by one, never past the minimum. */
export const Keyboard: Story = {
  render: () => (
    <div style={{display: 'flex', alignItems: 'end', gap: 12}}>
      <NumberField label="Number of spots" defaultValue={2} minValue={1} />
      <Button variant="secondary">Next</Button>
    </div>
  ),
  play: async ({canvasElement}) => {
    const canvas = within(canvasElement);
    const field = canvas.getByRole('textbox', {name: 'Number of spots'});
    await userEvent.tab();
    await expect(field).toHaveFocus();
    await userEvent.keyboard('{ArrowUp}');
    await expect(field).toHaveValue('3');
    await userEvent.keyboard('{ArrowDown}{ArrowDown}{ArrowDown}');
    await expect(field).toHaveValue('1');
    await userEvent.tab();
    await expect(canvas.getByRole('button', {name: 'Next'})).toHaveFocus();
  }
};
