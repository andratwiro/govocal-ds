import {RailSectionLabel} from './RailSectionLabel';
import type {Meta, StoryObj} from '@storybook/react-vite';

const meta: Meta<typeof RailSectionLabel> = {
  title: 'Components/Rail section label',
  component: RailSectionLabel,
  tags: ['autodocs'],
  parameters: {
    design: {
      type: 'figma',
      url: 'https://www.figma.com/design/OkMTJrzoV6em7gkqribtjA/Go-Vocal-Design-System?node-id=4-442'
    }
  }
};

export default meta;
type Story = StoryObj<typeof RailSectionLabel>;

export const AllVariants: Story = {
  render: () => (
    <div style={{display: 'flex', flexDirection: 'column', gap: 16, width: 264}}>
      <RailSectionLabel>Timeline</RailSectionLabel>
      <RailSectionLabel>Participation</RailSectionLabel>
    </div>
  )
};

export const Timeline: Story = {
  args: {children: 'Timeline'}
};
