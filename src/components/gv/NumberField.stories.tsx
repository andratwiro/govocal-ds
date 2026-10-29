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
