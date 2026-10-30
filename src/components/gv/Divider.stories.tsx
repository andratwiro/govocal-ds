import {Divider} from './Divider';
import type {Meta, StoryObj} from '@storybook/react-vite';

const meta: Meta<typeof Divider> = {
  title: 'Components/Layout & containers/Divider',
  component: Divider,
  parameters: {
    layout: 'centered',
    design: {
      type: 'figma',
      url: 'https://www.figma.com/design/OkMTJrzoV6em7gkqribtjA/Go-Vocal-Design-System?node-id=5-303'
    }
  },
  tags: ['autodocs', 'status:candidate']
};

export default meta;
type Story = StoryObj<typeof Divider>;

export const AllVariants: Story = {
  render: () => (
    <div style={{display: 'flex', flexDirection: 'column', gap: 24, width: 320}}>
      <div>
        <p style={{margin: 0}}>Horizontal</p>
        <Divider />
      </div>
      <div style={{display: 'flex', gap: 16, height: 48, alignItems: 'center'}}>
        <span>Vertical</span>
        <Divider orientation="vertical" />
        <span>between items</span>
      </div>
    </div>
  )
};

export const Horizontal: Story = {
  render: () => (
    <div style={{width: 320}}>
      <p style={{margin: '0 0 8px'}}>Green Corridors for Riverside</p>
      <Divider />
      <p style={{margin: '8px 0 0'}}>Collect ideas · 42 submitted</p>
    </div>
  )
};

export const Vertical: Story = {
  render: () => (
    <div style={{display: 'flex', gap: 16, height: 32, alignItems: 'center'}}>
      <span>Build</span>
      <Divider orientation="vertical" />
      <span>Manage</span>
    </div>
  )
};
