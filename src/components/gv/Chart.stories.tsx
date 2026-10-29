import type {Meta, StoryObj} from '@storybook/react-vite';
import {LineChart, Sparkline, ChartLegend} from './Chart';

const figma = (id: string) => ({
  design: {type: 'figma', url: `https://www.figma.com/design/OkMTJrzoV6em7gkqribtjA/Go-Vocal-Design-System?node-id=${id}`}
});

const WEEKS = ['16 Feb', '23 Feb', '02 Mar', '09 Mar', '16 Mar', '23 Mar'];
const PARTICIPANTS = [1, 0, 1, 10, 0, 1];
const VISITORS = [0, 3, 9, 9, 6, 6];
const VISITORS_DOC = [2, 5, 9, 14, 11, 7];
/** Votes cast on "Green Corridors for Riverside", cumulative over 21 days. */
const VOTES = [12, 18, 24, 28, 35, 48, 62, 71, 78, 89, 94, 108, 124, 142, 168, 198, 228, 258, 291, 318, 342];

const meta: Meta<typeof LineChart> = {
  title: 'Components/Chart',
  component: LineChart,
  tags: ['autodocs'],
  parameters: {...figma('23-219'), layout: 'padded'},
  decorators: [Story => <div style={{width: 730}}><Story /></div>]
};
export default meta;
type Story = StoryObj<typeof LineChart>;

/** Every Figma variant, top to bottom as in the Figma set. Each one speaks its trend as its aria-label. */
export const AllVariants: Story = {
  render: () => (
    <div style={{display: 'flex', flexDirection: 'column', gap: 24}}>
      <LineChart labels={WEEKS} series={[{label: 'Participants', values: PARTICIPANTS}, {label: 'Visitors', values: VISITORS}]} />
      <LineChart labels={WEEKS} series={[{label: 'Visitors', values: VISITORS_DOC}]} />
      <Sparkline label="Votes cast" values={VOTES} />
    </div>
  )
};

export const Line2Series: Story = {
  name: 'Line · 2 series',
  args: {labels: WEEKS, series: [{label: 'Participants', values: PARTICIPANTS}, {label: 'Visitors', values: VISITORS}]},
  parameters: figma('23-192')
};

export const Line1Series: Story = {
  name: 'Line · 1 series',
  args: {labels: WEEKS, series: [{label: 'Visitors', values: VISITORS_DOC}]},
  parameters: figma('23-211')
};

export const SparklineStory: Story = {
  name: 'Sparkline',
  render: () => <Sparkline label="Votes cast" values={VOTES} />,
  parameters: figma('23-218')
};

/** Two series with the legend the Dashboard card puts under it. */
export const WithLegend: Story = {
  name: 'Line · 2 series, with legend',
  args: {labels: WEEKS, legend: true, series: [{label: 'Participants', values: PARTICIPANTS}, {label: 'Visitors', values: VISITORS}]}
};

/** Big counts get round steps: monthly registrations across the platform. */
export const LargeNumbers: Story = {
  name: 'Line · large numbers',
  args: {
    labels: ['Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct'],
    series: [{label: 'Registrations', values: [412, 538, 611, 702, 690, 845, 1012, 1284], tone: 'primary'}]
  }
};

/** A small sparkline with no guides, as it sits under a KPI. */
export const SparklineSmall: Story = {
  name: 'Sparkline · small',
  render: () => (
    <div style={{width: 200}}>
      <Sparkline label="Participants" values={[20, 24, 31, 28, 35, 44, 52, 61]} height={34} grid={false} />
    </div>
  )
};

export const Legends: Story = {
  render: () => (
    <div style={{display: 'flex', flexDirection: 'column', gap: 16}}>
      <ChartLegend items={[{label: 'Participants', color: 'line-primary'}, {label: 'Visitors', color: 'line-secondary'}]} />
      <ChartLegend shape="square" align="start" items={[{label: 'Agree', color: 'agree'}, {label: 'Disagree', color: 'disagree'}, {label: 'Pass', color: 'pass'}]} />
    </div>
  )
};
