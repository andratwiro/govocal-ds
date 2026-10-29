import {StatRow} from './StatRow';
import type {Meta, StoryFn} from '@storybook/react-vite';

const meta: Meta<typeof StatRow> = {
  title: 'Components/Stat row',
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
    <div style={{width: 292, background: 'var(--gv-surface-hover)', borderRadius: 'var(--gv-radius-8)'}}>
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

export const Hover: Story = () => (
  <div style={{width: 292}}>
    <StatRow label="New comments" value="33" href="/projects/green-corridors/manage/comments" />
  </div>
);
Hover.parameters = {
  docs: {description: {story: 'Hover the row to see `--gv-surface-hover` and the chevron turn primary.'}}
};

export const Static: Story = () => (
  <div style={{width: 276}}>
    <StatRow label="New statements" value="4" isStatic />
  </div>
);
