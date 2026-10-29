import {SegmentedControl, Segment} from './SegmentedControl';
import type {Meta, StoryObj} from '@storybook/react-vite';

const meta: Meta<typeof SegmentedControl> = {
  title: 'Components/Segmented control',
  component: SegmentedControl,
  parameters: {
    layout: 'centered',
    design: {
      type: 'figma',
      url: 'https://www.figma.com/design/OkMTJrzoV6em7gkqribtjA/Go-Vocal-Design-System?node-id=14-883'
    }
  },
  tags: ['autodocs']
};

export default meta;
type Story = StoryObj<typeof SegmentedControl>;

export const AllVariants: Story = {
  render: () => (
    <div style={{display: 'flex', flexDirection: 'column', gap: 24}}>
      <SegmentedControl defaultSelectedKeys={['build']} selectionMode="single">
        <Segment id="build">Build</Segment>
        <Segment id="manage">Manage</Segment>
        <Segment id="insights">Insights</Segment>
      </SegmentedControl>
      <SegmentedControl defaultSelectedKeys={['manage']} selectionMode="single">
        <Segment id="build">Build</Segment>
        <Segment id="manage">Manage</Segment>
        <Segment id="insights">Insights</Segment>
      </SegmentedControl>
      <SegmentedControl defaultSelectedKeys={['insights']} selectionMode="single">
        <Segment id="build">Build</Segment>
        <Segment id="manage">Manage</Segment>
        <Segment id="insights">Insights</Segment>
      </SegmentedControl>
      <SegmentedControl defaultSelectedKeys={['build']} selectionMode="single">
        <Segment id="build">Build</Segment>
        <Segment id="insights">Insights</Segment>
      </SegmentedControl>
      <SegmentedControl defaultSelectedKeys={['insights']} selectionMode="single">
        <Segment id="build">Build</Segment>
        <Segment id="manage" isUnread>
          Manage
        </Segment>
        <Segment id="insights">Insights</Segment>
      </SegmentedControl>
    </div>
  )
};

export const Build: Story = {
  render: () => (
    <SegmentedControl defaultSelectedKeys={['build']} selectionMode="single">
      <Segment id="build">Build</Segment>
      <Segment id="manage">Manage</Segment>
      <Segment id="insights">Insights</Segment>
    </SegmentedControl>
  )
};

export const TwoTabs: Story = {
  render: () => (
    <SegmentedControl defaultSelectedKeys={['build']} selectionMode="single">
      <Segment id="build">Build</Segment>
      <Segment id="insights">Insights</Segment>
    </SegmentedControl>
  )
};

export const InsightsManageUnread: Story = {
  render: () => (
    <SegmentedControl defaultSelectedKeys={['insights']} selectionMode="single">
      <Segment id="build">Build</Segment>
      <Segment id="manage" isUnread>
        Manage
      </Segment>
      <Segment id="insights">Insights</Segment>
    </SegmentedControl>
  )
};
