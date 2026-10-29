import type {Decorator, Meta, StoryObj} from '@storybook/react-vite';
import {Sparkles} from 'lucide-react';
import {Button} from '../Button';
import {SegmentedControl, SegmentedControlItem} from '../SegmentedControl';
import {ChartLegend, LineChart, Sparkline} from './Chart';
import {Kpi} from './Kpi';
import {
  DashboardBars,
  DashboardCard,
  DashboardDemographic,
  DashboardRanking,
  DashboardStatements,
  DashboardTopics
} from './DashboardCard';

const figma = (id: string) => ({
  design: {type: 'figma', url: `https://www.figma.com/design/OkMTJrzoV6em7gkqribtjA/Go-Vocal-Design-System?node-id=${id}`}
});

/* ── Invented data: a Riverside park consultation and a participatory-budget vote ── */
const WEEKS = ['16 Feb', '23 Feb', '02 Mar', '09 Mar', '16 Mar', '23 Mar'];
const STATEMENTS = [
  {statement: 'Put drinking fountains at every park entrance.', agree: 81, disagree: 7, pass: 12},
  {statement: 'The park needs much more shade for hot days.', agree: 80, disagree: 9, pass: 11},
  {statement: 'Evening events would make the park feel safer.', agree: 76, disagree: 12, pass: 12},
  {statement: 'Dogs should be kept on a lead near the playground.', agree: 66, disagree: 21, pass: 13},
  {statement: 'Keep one quiet zone with no music at all.', agree: 60, disagree: 22, pass: 18},
  {statement: 'A car-free park loop on Sundays is worth trying.', agree: 59, disagree: 30, pass: 11},
  {statement: 'We should widen the main paths for prams and wheelchairs.', agree: 48, disagree: 31, pass: 21},
  {statement: 'Cyclists and walkers should share the lagoon path.', agree: 38, disagree: 45, pass: 17},
  {statement: 'The central lawn should stay exactly as it is.', agree: 21, disagree: 58, pass: 21},
  {statement: 'People who complain about noise should just move away.', agree: 17, disagree: 71, pass: 12}
];
const STATUSES = [
  {label: 'Proposed', percent: 18, count: 6, color: 'blue-2'},
  {label: 'Viewed', percent: 30, count: 10, color: 'blue-3'},
  {label: 'Under consideration', percent: 15, count: 5, color: 'blue-1'},
  {label: 'Accepted', percent: 18, count: 6, color: 'agree'},
  {label: 'Rejected', percent: 15, count: 5, color: 'disagree'},
  {label: 'Implemented', percent: 3, count: 1, color: 'green'}
] as const;
const OPTIONS = [
  {title: 'Green Corridors for Riverside', votes: 214},
  {title: 'Shade sails over the Lagoon playground', votes: 168},
  {title: 'A covered bike park at Market Square', votes: 121},
  {title: 'Night lighting on the canal towpath', votes: 77},
  {title: 'Community fridge at the library', votes: 42}
];
const VOTES = [12, 18, 24, 28, 35, 48, 62, 71, 78, 89, 94, 108, 124, 142, 168, 198, 228, 258, 291, 318, 342];
const AGES = [
  {label: '18–24', percent: 16, color: 'blue-1'},
  {label: '25–34', percent: 29, color: 'blue-2'},
  {label: '35–44', percent: 23, color: 'blue-3'},
  {label: '45–54', percent: 17, color: 'blue-4'},
  {label: '55+', percent: 15, color: 'blue-5'}
] as const;
const COMMUTES = [
  {label: 'Bicycle', percent: 41, color: 'green'},
  {label: 'Public transport', percent: 26, color: 'blue-2'},
  {label: 'Walking', percent: 20, color: 'olive'},
  {label: 'Car', percent: 13, color: 'terracotta'}
] as const;
const SUMMARY =
  'Many respondents emphasized the need for more inclusive, multi-generational and accessible park spaces, with frequent ' +
  'calls for facilities that serve children, teenagers, adults and seniors. Safety was also a recurring concern, with some ' +
  'users reporting feeling unsafe in the park area.';

/* ── One element per Figma variant, reused by the variant stories and AllVariants ── */
const cards = {
  statements: (
    <DashboardCard
      type="statements"
      title="Statements"
      subtitle="Where the community aligns and where it splits."
      legend={<ChartLegend shape="square" align="start" items={[{label: 'Agree', color: 'agree'}, {label: 'Disagree', color: 'disagree'}, {label: 'Pass', color: 'pass'}]} />}>
      <DashboardStatements items={STATEMENTS} />
    </DashboardCard>
  ),
  visitors: (
    <DashboardCard type="visitors-over-time" title="Visitors over time">
      <LineChart labels={WEEKS} series={[{label: 'Visitors', values: [2, 5, 9, 14, 11, 7]}]} />
    </DashboardCard>
  ),
  participation: (
    <DashboardCard type="participation-over-time" title="Participation over time">
      <LineChart legend labels={WEEKS} series={[{label: 'Participants', values: [1, 0, 1, 10, 0, 1]}, {label: 'Visitors', values: [0, 3, 9, 9, 6, 6]}]} />
    </DashboardCard>
  ),
  ai: (
    <DashboardCard
      type="ai-summary"
      icon={<Sparkles />}
      title="What are people saying?"
      footer={<>1 / 34<Button variant="secondary">Explore</Button></>}>
      <p>{SUMMARY}</p>
    </DashboardCard>
  ),
  topics: (
    <DashboardCard type="topic-breakdown" title="Topic breakdown">
      <DashboardTopics
        items={[
          {id: 'ai', label: 'AI topic distribution', meta: '34 inputs · 0 topics'},
          {id: 'manual', label: 'Manual tags by participants', meta: '78 inputs · 37 topics'}
        ]}
        onAction={id => console.log('open', id)}
      />
    </DashboardCard>
  ),
  status: (
    <DashboardCard type="status-breakdown" title="Status breakdown">
      <DashboardBars items={[...STATUSES]} />
    </DashboardCard>
  ),
  votes: (
    <DashboardCard
      type="votes-over-time"
      title="Participation over time"
      subtitle="Votes cast · cumulative"
      action={
        <SegmentedControl aria-label="Range" disallowEmptySelection defaultSelectedKeys={['daily']}>
          <SegmentedControlItem id="daily">Daily</SegmentedControlItem>
          <SegmentedControlItem id="weekly">Weekly</SegmentedControlItem>
        </SegmentedControl>
      }>
      <Sparkline label="Votes cast" values={VOTES} />
    </DashboardCard>
  ),
  ranking: (
    <DashboardCard type="live-ranking" title="Live ranking" subtitle="By votes · updating live">
      <DashboardRanking items={OPTIONS} />
    </DashboardCard>
  ),
  age: (
    <DashboardCard type="demographic-age">
      <DashboardDemographic label="Age group" items={[...AGES]} />
    </DashboardCard>
  ),
  commute: (
    <DashboardCard type="demographic-commute">
      <DashboardDemographic label="Primary commute" items={[...COMMUTES]} />
    </DashboardCard>
  )
};

const meta: Meta<typeof DashboardCard> = {
  title: 'Components/Dashboard card',
  component: DashboardCard,
  tags: ['autodocs'],
  parameters: {...figma('33-481'), layout: 'padded'}
};
export default meta;
type Story = StoryObj<typeof DashboardCard>;

const wide: Decorator = Story => <div style={{width: 764}}><Story /></div>;
const half: Decorator = Story => <div style={{width: 375}}><Story /></div>;

/** Every Figma variant, laid out the way the prototype's Insights tab stacks them. */
export const AllVariants: Story = {
  render: () => (
    <div style={{display: 'flex', flexDirection: 'column', gap: 24, width: 764}}>
      <div style={{display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 14}}>
        <Kpi label="Voters" value="384" note="updating live" />
        <Kpi label="Votes" value="622" note="updating live" />
        <Kpi label="Avg per voter" value="1.6" note="multiple picks" />
        <Kpi label="Participation" value="14%" note="of visitors" />
      </div>
      {cards.statements}
      {cards.visitors}
      {cards.participation}
      <div style={{display: 'grid', gridTemplateColumns: '1.4fr 1fr', gap: 14}}>
        {cards.ai}
        {cards.topics}
      </div>
      {cards.status}
      {cards.votes}
      {cards.ranking}
      <div style={{display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14}}>
        {cards.age}
        {cards.commute}
      </div>
    </div>
  )
};

export const Statements: Story = {render: () => cards.statements, decorators: [wide], parameters: figma('24-333')};
export const VisitorsOverTime: Story = {name: 'Visitors over time', render: () => cards.visitors, decorators: [wide], parameters: figma('24-546')};
export const ParticipationOverTime: Story = {name: 'Participation over time', render: () => cards.participation, decorators: [wide], parameters: figma('24-591')};
export const AiSummary: Story = {name: 'AI summary', render: () => cards.ai, decorators: [Story => <div style={{width: 438}}><Story /></div>], parameters: figma('25-336')};
export const TopicBreakdown: Story = {name: 'Topic breakdown', render: () => cards.topics, decorators: [Story => <div style={{width: 313}}><Story /></div>], parameters: figma('25-357')};
export const StatusBreakdown: Story = {name: 'Status breakdown', render: () => cards.status, decorators: [wide], parameters: figma('25-383')};
export const VotesOverTime: Story = {name: 'Votes over time', render: () => cards.votes, decorators: [wide], parameters: figma('26-507')};
export const LiveRanking: Story = {name: 'Live ranking', render: () => cards.ranking, decorators: [wide], parameters: figma('26-516')};
export const DemographicAge: Story = {name: 'Demographic · age', render: () => cards.age, decorators: [half], parameters: figma('26-561')};
export const DemographicCommute: Story = {name: 'Demographic · commute', render: () => cards.commute, decorators: [half], parameters: figma('26-593')};
