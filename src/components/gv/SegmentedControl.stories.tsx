import {List, Map as MapIcon} from 'lucide-react';
import {SegmentedControl, SegmentedControlItem} from './SegmentedControl';
import type {Meta, StoryObj} from '@storybook/react-vite';
import {expect, userEvent, within} from 'storybook/test';

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
  tags: ['autodocs', 'status:candidate']
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
      <SegmentedControl size={30} aria-label="Range" defaultSelectedKeys={['daily']} disallowEmptySelection>
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
    <SegmentedControl size={30} aria-label="Range" defaultSelectedKeys={['daily']} disallowEmptySelection>
      <SegmentedControlItem id="daily">Daily</SegmentedControlItem>
      <SegmentedControlItem id="weekly">Weekly</SegmentedControlItem>
    </SegmentedControl>
  )
};

/**
 * Not a Figma variant: an icon before each label in the small control (the Manage tab's List / Map switch). The icon
 * is 14 and `aria-hidden`; the word names the segment.
 */
export const IconAndLabelSmall: Story = {
  name: 'Icon and label · small',
  render: () => (
    <SegmentedControl size={30} aria-label="View" defaultSelectedKeys={['map']} disallowEmptySelection>
      <SegmentedControlItem id="list">
        <List aria-hidden />
        List
      </SegmentedControlItem>
      <SegmentedControlItem id="map">
        <MapIcon aria-hidden />
        Map
      </SegmentedControlItem>
    </SegmentedControl>
  )
};

/**
 * Not in Figma: the New dot with a tip that says what it stands for ("18 new ideas"), on hover and on keyboard focus,
 * read as the segment's description (the phase tabs).
 */
export const UnreadWithTooltip: Story = {
  name: 'Unread with tooltip',
  render: () => (
    <SegmentedControl aria-label="Phase" defaultSelectedKeys={['build']} selectionMode="single" disallowEmptySelection>
      <SegmentedControlItem id="build">Build</SegmentedControlItem>
      <SegmentedControlItem id="manage" isUnread tooltip="18 new ideas">
        Manage
      </SegmentedControlItem>
      <SegmentedControlItem id="insights">Insights</SegmentedControlItem>
    </SegmentedControl>
  )
};

/** The keyboard, proved by this story's play function (the Interactions panel): Tab reaches the chosen segment; → and
 * ← move between segments; Enter or Space picks the focused one; Tab leaves the control. */
export const Keyboard: Story = {
  render: () => (
    <SegmentedControl aria-label="View" selectionMode="single" defaultSelectedKeys={['list']} disallowEmptySelection>
      <SegmentedControlItem id="list">List</SegmentedControlItem>
      <SegmentedControlItem id="map">Map</SegmentedControlItem>
      <SegmentedControlItem id="table">Table</SegmentedControlItem>
    </SegmentedControl>
  ),
  play: async ({canvasElement}) => {
    const canvas = within(canvasElement);
    const list = canvas.getByRole('radio', {name: 'List'});
    const map = canvas.getByRole('radio', {name: 'Map'});
    await userEvent.tab();
    await expect(list).toHaveFocus();
    await userEvent.keyboard('{ArrowRight}');
    await expect(map).toHaveFocus();
    await expect(list).toBeChecked();
    await userEvent.keyboard('{Enter}');
    await expect(map).toBeChecked();
    await expect(list).not.toBeChecked();
    await userEvent.keyboard('{ArrowRight}');
    await userEvent.keyboard(' ');
    await expect(canvas.getByRole('radio', {name: 'Table'})).toBeChecked();
    await userEvent.keyboard('{ArrowLeft}');
    await expect(map).toHaveFocus();
    await userEvent.tab();
    await expect(map).not.toHaveFocus();
  }
};
