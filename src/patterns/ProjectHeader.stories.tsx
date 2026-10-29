import type {Meta, StoryObj} from '@storybook/react-vite';
import {ProjectHeader} from './ProjectHeader';

const meta: Meta<typeof ProjectHeader> = {
  title: 'Patterns/Project page/Project header',
  component: ProjectHeader,
  tags: ['autodocs'],
  parameters: {
    design: {type: 'figma', url: 'https://www.figma.com/design/OkMTJrzoV6em7gkqribtjA/Go-Vocal-Design-System?node-id=14-876'}
  },
  args: {projectName: 'Green Corridors for Riverside', phaseName: 'Collect ideas'}
};
export default meta;
type Story = StoryObj<typeof ProjectHeader>;

export const AllVariants: Story = {
  render: args => (
    <div style={{display: 'flex', flexDirection: 'column', alignItems: 'flex-start', gap: 16}}>
      <ProjectHeader {...args} level="project" />
      <ProjectHeader {...args} level="phase-draft" />
      <ProjectHeader {...args} level="phase-live" />
    </div>
  )
};

/** Level=Project */
export const Project: Story = {
  args: {level: 'project'},
  parameters: {design: {type: 'figma', url: 'https://www.figma.com/design/OkMTJrzoV6em7gkqribtjA/Go-Vocal-Design-System?node-id=4-58'}}
};

/** Level=Phase · Draft */
export const PhaseDraft: Story = {
  name: 'Phase · Draft',
  args: {level: 'phase-draft'},
  parameters: {design: {type: 'figma', url: 'https://www.figma.com/design/OkMTJrzoV6em7gkqribtjA/Go-Vocal-Design-System?node-id=4-392'}}
};

/** Level=Phase · Live */
export const PhaseLive: Story = {
  name: 'Phase · Live',
  args: {level: 'phase-live', phaseName: 'Vote on proposals'},
  parameters: {design: {type: 'figma', url: 'https://www.figma.com/design/OkMTJrzoV6em7gkqribtjA/Go-Vocal-Design-System?node-id=5-473'}}
};
