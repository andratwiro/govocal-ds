import {SegmentedControl, SegmentedControlItem} from './SegmentedControl';
import type {Meta, StoryObj} from '@storybook/react-vite';

const meta: Meta<typeof SegmentedControl> = {
  title: 'Components/Actions/Segmented control',
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
        <SegmentedControlItem id="build">Build</SegmentedControlItem>
        <SegmentedControlItem id="manage">Manage</SegmentedControlItem>
        <SegmentedControlItem id="insights">Insights</SegmentedControlItem>
      </SegmentedControl>
      <SegmentedControl defaultSelectedKeys={['manage']} selectionMode="single">
        <SegmentedControlItem id="build">Build</SegmentedControlItem>
        <SegmentedControlItem id="manage">Manage</SegmentedControlItem>
        <SegmentedControlItem id="insights">Insights</SegmentedControlItem>
      </SegmentedControl>
      <SegmentedControl defaultSelectedKeys={['insights']} selectionMode="single">
        <SegmentedControlItem id="build">Build</SegmentedControlItem>
        <SegmentedControlItem id="manage">Manage</SegmentedControlItem>
        <SegmentedControlItem id="insights">Insights</SegmentedControlItem>
      </SegmentedControl>
      <SegmentedControl defaultSelectedKeys={['build']} selectionMode="single">
        <SegmentedControlItem id="build">Build</SegmentedControlItem>
        <SegmentedControlItem id="insights">Insights</SegmentedControlItem>
      </SegmentedControl>
      <SegmentedControl defaultSelectedKeys={['insights']} selectionMode="single">
        <SegmentedControlItem id="build">Build</SegmentedControlItem>
        <SegmentedControlItem id="manage" isUnread>
          Manage
        </SegmentedControlItem>
        <SegmentedControlItem id="insights">Insights</SegmentedControlItem>
      </SegmentedControl>
      <SegmentedControl size="small" aria-label="Range" defaultSelectedKeys={['daily']} disallowEmptySelection>
        <SegmentedControlItem id="daily">Daily</SegmentedControlItem>
        <SegmentedControlItem id="weekly">Weekly</SegmentedControlItem>
      </SegmentedControl>
    </div>
  )
};

export const Build: Story = {
  render: () => (
    <SegmentedControl defaultSelectedKeys={['build']} selectionMode="single">
      <SegmentedControlItem id="build">Build</SegmentedControlItem>
      <SegmentedControlItem id="manage">Manage</SegmentedControlItem>
      <SegmentedControlItem id="insights">Insights</SegmentedControlItem>
    </SegmentedControl>
  )
};

export const TwoTabs: Story = {
  name: 'Build · 2 tabs',
  render: () => (
    <SegmentedControl defaultSelectedKeys={['build']} selectionMode="single">
      <SegmentedControlItem id="build">Build</SegmentedControlItem>
      <SegmentedControlItem id="insights">Insights</SegmentedControlItem>
    </SegmentedControl>
  )
};

export const InsightsManageUnread: Story = {
  name: 'Insights · Manage unread',
  render: () => (
    <SegmentedControl defaultSelectedKeys={['insights']} selectionMode="single">
      <SegmentedControlItem id="build">Build</SegmentedControlItem>
      <SegmentedControlItem id="manage" isUnread>
        Manage
      </SegmentedControlItem>
      <SegmentedControlItem id="insights">Insights</SegmentedControlItem>
    </SegmentedControl>
  )
};

/** Not a Figma variant: the range switch in a dashboard card's header (Dashboard card · Votes over time). */
export const SmallRangeSwitch: Story = {
  name: 'Small · range switch',
  render: () => (
    <SegmentedControl size="small" aria-label="Range" defaultSelectedKeys={['daily']} disallowEmptySelection>
      <SegmentedControlItem id="daily">Daily</SegmentedControlItem>
      <SegmentedControlItem id="weekly">Weekly</SegmentedControlItem>
    </SegmentedControl>
  )
};
