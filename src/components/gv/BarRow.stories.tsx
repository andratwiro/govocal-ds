import {BarRow} from './BarRow';
import type {Meta, StoryFn} from '@storybook/react-vite';

const meta: Meta<typeof BarRow> = {
  title: 'Components/Bar row',
  component: BarRow,
  parameters: {
    layout: 'centered',
    design: {
      type: 'figma',
      url: 'https://www.figma.com/design/OkMTJrzoV6em7gkqribtjA/Go-Vocal-Design-System?node-id=33-482'
    }
  },
  tags: ['autodocs']
};

export default meta;
type Story = StoryFn<typeof BarRow>;

export const AllVariants: Story = () => (
  <div style={{display: 'flex', flexDirection: 'column', gap: 4, width: 420}}>
    <BarRow label="Proposed" percent={18} value="18% · 6" barColor="--gv-chart-blue-2" />
    <BarRow label="Under consideration" percent={45} value="45% · 15" barColor="--gv-chart-blue-3" />
    <BarRow label="Not selected" />
  </div>
);

export const Default: Story = () => (
  <div style={{width: 420}}>
    <BarRow label="Proposed" percent={18} value="18% · 6" barColor="--gv-chart-blue-2" />
  </div>
);

export const Empty: Story = () => (
  <div style={{width: 420}}>
    <BarRow label="Under review" />
  </div>
);
