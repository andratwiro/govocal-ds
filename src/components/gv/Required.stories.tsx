import {Required} from './Required';
import type {Meta, StoryObj} from '@storybook/react-vite';

const meta: Meta<typeof Required> = {
  title: 'Components/Required',
  component: Required,
  parameters: {
    layout: 'centered',
    design: {
      type: 'figma',
      url: 'https://www.figma.com/design/OkMTJrzoV6em7gkqribtjA/Go-Vocal-Design-System?node-id=14-878'
    }
  },
  tags: ['autodocs']
};

export default meta;
type Story = StoryObj<typeof Required>;

export const AllVariants: Story = {
  render: () => (
    <div style={{display: 'flex', gap: 32}}>
      <Required placement="card" />
      <Required placement="field" />
    </div>
  )
};

export const Card: Story = {
  args: {placement: 'card'}
};

export const Field: Story = {
  args: {placement: 'field'}
};
