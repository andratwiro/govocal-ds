import {Breadcrumbs} from './Breadcrumbs';
import type {Meta, StoryObj} from '@storybook/react-vite';

const meta: Meta<typeof Breadcrumbs> = {
  title: 'Components/Navigation/Breadcrumbs',
  component: Breadcrumbs,
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
type Story = StoryObj<typeof Breadcrumbs>;

export const AllVariants: Story = {
  render: () => (
    <div style={{display: 'flex', flexDirection: 'column', gap: 24}}>
      <Breadcrumbs variant="default" items={[{key: 'root', label: 'Projects', href: '#'}, {key: 'cur', label: 'Green Corridors for Riverside'}]} />
      <Breadcrumbs
        variant="editor"
        status="draft"
        items={[{key: 'root', label: 'Green Corridors for Riverside', href: '#'}, {key: 'cur', label: 'Collect ideas'}]}
      />
      <Breadcrumbs
        variant="editor"
        status="live"
        items={[{key: 'root', label: 'Green Corridors for Riverside', href: '#'}, {key: 'cur', label: 'Collect ideas'}]}
      />
    </div>
  )
};

export const Project: Story = {
  args: {
    variant: 'default',
    items: [
      {key: 'root', label: 'Projects', href: '#'},
      {key: 'cur', label: 'Green Corridors for Riverside'}
    ]
  }
};

export const PhaseDraft: Story = {
  name: 'Phase · Draft',
  args: {
    variant: 'editor',
    status: 'draft',
    items: [
      {key: 'root', label: 'Green Corridors for Riverside', href: '#'},
      {key: 'cur', label: 'Collect ideas'}
    ]
  }
};

export const PhaseLive: Story = {
  name: 'Phase · Live',
  args: {
    variant: 'editor',
    status: 'live',
    items: [
      {key: 'root', label: 'Green Corridors for Riverside', href: '#'},
      {key: 'cur', label: 'Collect ideas'}
    ]
  }
};
