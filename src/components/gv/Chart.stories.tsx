import type {Meta, StoryObj} from '@storybook/react-vite';
import {useState} from 'react';
import {LineChart, Sparkline as SparklineChart, ChartLegend} from './Chart';
import {LegendRow} from './LegendRow';

const figma = (id: string) => ({
  design: {type: 'figma', url: `https://www.figma.com/design/OkMTJrzoV6em7gkqribtjA/Go-Vocal-Design-System?node-id=${id}`}
});

const WEEKS = ['16 Feb', '23 Feb', '02 Mar', '09 Mar', '16 Mar', '23 Mar'];
const PARTICIPANTS = [1, 0, 1, 10, 0, 1];
const VISITORS = [0, 3, 9, 9, 6, 6];
const VISITORS_DOC = [2, 5, 9, 14, 11, 7];
/** Votes cast on "Green Corridors for Riverside", cumulative over 21 days. */
const VOTES = [12, 18, 24, 28, 35, 48, 62, 71, 78, 89, 94, 108, 124, 142, 168, 198, 228, 258, 291, 318, 342];
const DAYS = VOTES.map((_, i) => `${i + 1} May`);

const meta: Meta<typeof LineChart> = {
  title: 'Components/Charts/Chart',
  component: LineChart,
  tags: ['autodocs'],
  parameters: {...figma('23-219'), layout: 'padded'},
  decorators: [Story => <div style={{width: 730}}><Story /></div>]
};
export default meta;
type Story = StoryObj<typeof LineChart>;

/**
 * Every Figma variant, top to bottom as in the Figma set. Each one speaks its trend as its aria-label. Hover a
 * line chart for its values (Interactive below says how).
 */
export const AllVariants: Story = {
  render: () => (
    <div style={{display: 'flex', flexDirection: 'column', gap: 24}}>
      <LineChart labels={WEEKS} series={[{label: 'Participants', values: PARTICIPANTS}, {label: 'Visitors', values: VISITORS}]} />
      <LineChart labels={WEEKS} series={[{label: 'Visitors', values: VISITORS_DOC}]} />
      <SparklineChart label="Votes cast" values={VOTES} />
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

export const Sparkline: Story = {
  render: () => <SparklineChart label="Votes cast" values={VOTES} />,
  parameters: figma('23-218')
};

/** Two series with the legend the Dashboard card puts under it. */
export const WithLegend: Story = {
  name: 'Line · 2 series, with legend',
  args: {labels: WEEKS, showLegend: true, series: [{label: 'Participants', values: PARTICIPANTS}, {label: 'Visitors', values: VISITORS}]}
};

/** Big counts get round steps: monthly registrations across the platform. */
export const LargeNumbers: Story = {
  name: 'Line · large numbers',
  args: {
    labels: ['Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct'],
    series: [{label: 'Registrations', values: [412, 538, 611, 702, 690, 845, 1012, 1284], color: 'line-primary'}]
  }
};

/** A small sparkline with no guides, as it sits under a Stat tile. */
export const SparklineSmall: Story = {
  name: 'Sparkline · small',
  render: () => (
    <div style={{width: 200}}>
      <SparklineChart label="Participants" values={[20, 24, 31, 28, 35, 44, 52, 61]} height={34} showGrid={false} />
    </div>
  )
};

export const Legends: Story = {
  render: () => (
    <div style={{display: 'flex', flexDirection: 'column', gap: 16}}>
      <ChartLegend items={[{label: 'Participants', color: 'line-primary'}, {label: 'Visitors', color: 'line-secondary'}]} />
      <ChartLegend variant="square" align="start" items={[{label: 'Agree', color: 'agree'}, {label: 'Disagree', color: 'disagree'}, {label: 'Pass', color: 'pass'}]} />
    </div>
  )
};

/**
 * Not in Figma (its charts are static); the prototype's dashboards have it, and a back-office reader needs exact
 * values. Hover the plot: a guide, a dot on each line and a card with the date and every value follow the pointer
 * to the nearest point; the line under the pointer is picked out and the others dim. The keyboard does the same
 * through one tab stop on the plot: arrows step from point to point, Home and End jump to the ends, Esc hides the
 * card. A screen reader hears each point as it moves ("09 Mar: Participants 10, Visitors 9"). Hover or focus a
 * legend item to pick its series out.
 */
export const Interactive: Story = {
  name: 'Line · interactive',
  args: {labels: WEEKS, showLegend: true, series: [{label: 'Participants', values: PARTICIPANTS}, {label: 'Visitors', values: VISITORS}]}
};

/**
 * With `labels`, a Sparkline takes the same card and keyboard explorer (the card names the day). Without them, or
 * with `interactive={false}` inside something pressable, it stays a picture.
 */
export const SparklineInteractive: Story = {
  name: 'Sparkline · interactive',
  render: () => <SparklineChart label="Votes cast" labels={DAYS} values={VOTES} />
};

/**
 * Legend rows beside a chart pick its series out: hover or focus one and its line stays, the other dims
 * (`highlightedSeries`). The prototype's Internal adoption card.
 */
export const WithLegendRows: Story = {
  name: 'Line · with legend rows',
  render: function Render() {
    const [picked, setPicked] = useState<number | null>(null);
    const rows = [
      {label: 'Admins · 12', value: '9 active', color: '--gv-chart-line-primary'},
      {label: 'Project managers · 31', value: '22 active', color: '--gv-chart-line-secondary'}
    ];
    return (
      <div style={{display: 'flex', flexDirection: 'column', gap: 16}}>
        <div style={{display: 'flex', flexDirection: 'column', gap: 8, width: 341}}>
          {rows.map((r, i) => (
            <LegendRow key={r.label} color={r.color} label={r.label} value={r.value}
              isHighlighted={picked === i} isDimmed={picked != null && picked !== i}
              onHighlightChange={on => setPicked(on ? i : null)} />
          ))}
        </div>
        <LineChart
          labels={['Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct']}
          highlightedSeries={picked}
          series={[
            {label: 'Active admins', values: [6, 7, 7, 8, 8, 9, 9, 9]},
            {label: 'Active project managers', values: [12, 14, 15, 15, 18, 19, 21, 22]}
          ]}
        />
      </div>
    );
  }
};
