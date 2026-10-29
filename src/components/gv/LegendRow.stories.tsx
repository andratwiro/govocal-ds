import {LegendRow} from './LegendRow';
import type {Meta, StoryFn} from '@storybook/react-vite';

const meta: Meta<typeof LegendRow> = {
  title: 'Components/Legend row',
  component: LegendRow,
  parameters: {
    layout: 'centered',
    design: {
      type: 'figma',
      url: 'https://www.figma.com/design/OkMTJrzoV6em7gkqribtjA/Go-Vocal-Design-System?node-id=26-523'
    }
  },
  tags: ['autodocs']
};

export default meta;
type Story = StoryFn<typeof LegendRow>;

export const AllVariants: Story = () => (
  <div style={{display: 'flex', flexDirection: 'column', gap: 8, width: 240}}>
    <LegendRow color="--gv-chart-blue-1" label="18–24" value="16%" />
    <LegendRow color="--gv-chart-blue-3" label="25–34" value="28%" />
    <LegendRow color="--gv-chart-blue-5" label="35–44" value="22%" />
    <LegendRow color="--gv-chart-green" label="45–64" value="24%" />
    <LegendRow color="--gv-chart-olive" label="65+" value="10%" />
  </div>
);

export const Default: Story = () => (
  <div style={{width: 240}}>
    <LegendRow color="--gv-chart-blue-1" label="18–24" value="16%" />
  </div>
);
