import {Breadcrumb} from './Breadcrumb';
import type {Meta, StoryObj} from '@storybook/react-vite';

const meta: Meta<typeof Breadcrumb> = {
  title: 'Components/Breadcrumb',
  component: Breadcrumb,
  parameters: {
    layout: 'centered',
    design: {
      type: 'figma',
      url: 'https://www.figma.com/design/OkMTJrzoV6em7gkqribtjA/Go-Vocal-Design-System?node-id=14-875'
    }
  },
  tags: ['autodocs']
};

export default meta;
type Story = StoryObj<typeof Breadcrumb>;

export const AllVariants: Story = {
  render: () => (
    <div style={{display: 'flex', flexDirection: 'column', gap: 24}}>
      <Breadcrumb level="project" items={[{key: 'root', label: 'Projects', href: '#'}, {key: 'cur', label: 'Green Corridors for Riverside'}]} />
      <Breadcrumb
        level="phase"
        phaseState="draft"
        items={[{key: 'root', label: 'Green Corridors for Riverside', href: '#'}, {key: 'cur', label: 'Collect ideas'}]}
      />
      <Breadcrumb
        level="phase"
        phaseState="live"
        items={[{key: 'root', label: 'Green Corridors for Riverside', href: '#'}, {key: 'cur', label: 'Collect ideas'}]}
      />
    </div>
  )
};

export const Project: Story = {
  args: {
    level: 'project',
    items: [
      {key: 'root', label: 'Projects', href: '#'},
      {key: 'cur', label: 'Green Corridors for Riverside'}
    ]
  }
};

export const PhaseDraft: Story = {
  args: {
    level: 'phase',
    phaseState: 'draft',
    items: [
      {key: 'root', label: 'Green Corridors for Riverside', href: '#'},
      {key: 'cur', label: 'Collect ideas'}
    ]
  }
};

export const PhaseLive: Story = {
  args: {
    level: 'phase',
    phaseState: 'live',
    items: [
      {key: 'root', label: 'Green Corridors for Riverside', href: '#'},
      {key: 'cur', label: 'Collect ideas'}
    ]
  }
};
