import {StatRow} from './StatRow';
import type {Meta, StoryFn} from '@storybook/react-vite';

const meta: Meta<typeof StatRow> = {
  title: 'Components/Data display/Stat row',
  component: StatRow,
  parameters: {
    layout: 'centered',
    design: {
      type: 'figma',
      url: 'https://www.figma.com/design/OkMTJrzoV6em7gkqribtjA/Go-Vocal-Design-System?node-id=14-886'
    }
  },
  tags: ['autodocs']
};

export default meta;
type Story = StoryFn<typeof StatRow>;

export const AllVariants: Story = () => (
  <div style={{display: 'flex', gap: 24, flexWrap: 'wrap', width: 1200}}>
    <div style={{width: 292}}>
      <StatRow label="Waiting for a reply" value="40" href="#" />
    </div>
    <div style={{width: 292}}>
      <StatRow label="New ideas" value="18" isNew href="#" />
    </div>
    <div style={{width: 292, background: 'var(--gv-surface-hovered)', borderRadius: 'var(--gv-radius-8)'}}>
      <StatRow label="New comments" value="33" href="#" />
    </div>
    <div style={{width: 276}}>
      <StatRow label="New statements" value="4" isStatic />
    </div>
  </div>
);

export const Default: Story = () => (
  <div style={{width: 292}}>
    <StatRow label="Waiting for a reply" value="40" href="/projects/green-corridors/manage" />
  </div>
);

export const DefaultNew: Story = () => (
  <div style={{width: 292}}>
    <StatRow label="New ideas" value="18" isNew href="/projects/green-corridors/manage/ideas" />
  </div>
);
DefaultNew.storyName = 'Default · new';

export const Hover: Story = () => (
  <div style={{width: 292}}>
    <StatRow label="New comments" value="33" href="/projects/green-corridors/manage/comments" />
  </div>
);
Hover.parameters = {
  docs: {description: {story: 'Hover the row to see `--gv-surface-hovered` and the chevron turn primary.'}}
};

export const Static: Story = () => (
  <div style={{width: 276}}>
    <StatRow label="New statements" value="4" isStatic />
  </div>
);

/**
 * Not in Figma. The prototype's Manage metrics as one stack (an 80 pitch, the hover areas touching): the first row's
 * filter is on, so it stays painted as hovered with a dark chevron until it is pressed again.
 */
export const Selected: Story = () => (
  <div style={{display: 'flex', flexDirection: 'column', width: 292}}>
    <StatRow label="Waiting for a reply" value="40" isSelected onPress={() => {}} />
    <StatRow label="Unassigned" value="48" onPress={() => {}} />
    <StatRow label="New ideas" value="18" isNew onPress={() => {}} />
    <StatRow label="New comments" value="33" onPress={() => {}} />
  </div>
);
