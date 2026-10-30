import type {Meta, StoryObj} from '@storybook/react-vite';
import {Figure} from './Figure';
import {BarRow} from './BarRow';
import {ChartLegend} from './Chart';
import {Grid} from './Grid';
import {Quote} from './Quote';
import {Avatar} from './Avatar';
import {Stack} from './Stack';

const meta: Meta<typeof Figure> = {
  title: 'Components/Charts/Figure',
  component: Figure,
  tags: ['autodocs', 'not-in-figma'],
  parameters: {layout: 'padded'},
  args: {
    finding: 'Cycling leads in every district',
    measure: 'Share of votes per route, 3,600 participants',
    source: 'Go Vocal, Cycle lanes 2026'
  },
  decorators: [Story => <div style={{maxInlineSize: 640}}><Story /></div>]
};
export default meta;
type Story = StoryObj<typeof Figure>;

const ROUTES = [
  {label: 'Canal Road', share: 38, named: true},
  {label: 'Elm Street', share: 24},
  {label: 'Old Harbour loop', share: 17},
  {label: 'Millbrook link', share: 12},
  {label: 'North Quarter spur', share: 9}
];

const Bars = ({rows = ROUTES}: {rows?: typeof ROUTES}) => (
  <Stack gap="8">
    {rows.map(r => <BarRow key={r.label} label={r.label} percent={(r.share / 38) * 100} value={`${r.share}%`}
      barColor={r.named ? '--gv-chart-bar' : '--gv-chart-pass'} />)}
  </Stack>
);

/** The whole order: finding, measure, chart, foot (here the source). The bar the finding names is highlighted. */
export const Default: Story = {render: args => <Figure {...args}><Bars /></Figure>};

/** Every slot: a legend under the chart, then what is left out, a note and the source, one line each. */
export const FullFoot: Story = {
  name: 'Full foot',
  args: {
    truncation: 'Showing the top 3 of 5 routes',
    note: 'Participants could vote for more than one route.',
    legend: <ChartLegend align="start" items={[{label: 'Named in the finding', color: 'bar'}, {label: 'Other routes', color: 'pass'}]} />
  },
  render: args => <Figure {...args}><Bars rows={ROUTES.slice(0, 3)} /></Figure>
};

/** No finding: a measure and a chart only, named with `aria-label`. */
export const NoFinding: Story = {
  name: 'No finding',
  args: {finding: undefined, 'aria-label': 'Votes per route'},
  render: Default.render
};

/** Quotes as the body: participants' own words, side by side. */
export const WithQuotes: Story = {
  name: 'With quotes',
  args: {
    finding: 'People ask for shade on the walks they make every day',
    measure: 'In their own words: 2 Tree planting ideas',
    source: 'Go Vocal, Tree planting by street'
  },
  render: args => (
    <Figure {...args}>
      <Grid columns={2} gap="10">
        <Quote tag="Heat and shade" words="From June there is no shade at all between the tram and my door."
          author="Resident A" meta="North Quarter · 31 reactions" avatar={<Avatar initials="RA" size={28} />} />
        <Quote tag="Routes to school" words="Our children walk to school along Canal Road in full sun."
          author="Resident B" meta="Old Harbour · 24 reactions" avatar={<Avatar initials="RB" size={28} />} />
      </Grid>
    </Figure>
  )
};

/** Right to left: the bars grow from the right; the foot reads from the right. */
export const RightToLeft: Story = {
  name: 'Right to left',
  globals: {direction: 'rtl'},
  args: {truncation: 'Showing the top 3 of 5 routes'},
  render: args => <Figure {...args}><Bars rows={ROUTES.slice(0, 3)} /></Figure>
};
