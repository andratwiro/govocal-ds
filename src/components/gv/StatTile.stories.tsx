import type {Meta, StoryObj} from '@storybook/react-vite';
import {StatTile} from './StatTile';
import {Sparkline} from './Chart';

const figma = (id: string) => ({
  design: {type: 'figma', url: `https://www.figma.com/design/OkMTJrzoV6em7gkqribtjA/Go-Vocal-Design-System?node-id=${id}`}
});

const meta: Meta<typeof StatTile> = {
  title: 'Components/Data display/Stat tile',
  component: StatTile,
  tags: ['autodocs'],
  parameters: figma('33-480'),
  argTypes: {
    type: {control: 'inline-radio', options: ['default', 'tall', 'with-note']}
  }
};
export default meta;
type Story = StoryObj<typeof StatTile>;

/** Every Figma variant side by side, as they sit in a dashboard's band of stat tiles. */
export const AllVariants: Story = {
  render: () => (
    <div style={{display: 'grid', gridTemplateColumns: 'repeat(3, 184px)', gap: 24, alignItems: 'start'}}>
      <StatTile type="default" label="Visitors" value="312" />
      <StatTile type="tall" label="Visitors" value="23" />
      <StatTile type="with-note" label="Voters" value="1" note="updating live" />
    </div>
  )
};

export const Default: Story = {
  args: {type: 'default', label: 'Visitors', value: '312'},
  decorators: [Story => <div style={{width: 184}}><Story /></div>],
  parameters: figma('24-214')
};

export const Tall: Story = {
  args: {type: 'tall', label: 'Visitors', value: '23'},
  decorators: [Story => <div style={{width: 145}}><Story /></div>],
  parameters: figma('24-560')
};

export const WithNote: Story = {
  name: 'With note',
  args: {type: 'with-note', label: 'Voters', value: '1', note: 'updating live'},
  decorators: [Story => <div style={{width: 181}}><Story /></div>],
  parameters: figma('26-487')
};

/**
 * A band of stat tiles from "Green Corridors for Riverside": the prototype's six-up Insights row, in its 764 column. Five fit
 * in a row; a long label wraps and the tiles in that row stretch to match.
 */
export const Band: Story = {
  render: () => (
    <div style={{display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: 10, width: 764}}>
      <StatTile label="Visitors" value="1,284" />
      <StatTile label="Phase participants" value="873" />
      <StatTile label="Ideas" value="392" />
      <StatTile label="Comments" value="1,105" />
      <StatTile label="Reactions" value="4,060" />
      <StatTile label="Participation rate" value="56.5%" />
    </div>
  )
};

/** The slot under the value takes a Sparkline: the prototype's "stat card with sparkline". */
export const WithSparkline: Story = {
  name: 'With note and sparkline',
  render: () => (
    <div style={{width: 240}}>
      <StatTile type="with-note" label="Participants" value="873" note="Last 30 days: +61">
        <Sparkline values={[20, 24, 31, 28, 35, 44, 52, 61]} height={34} grid={false} />
      </StatTile>
    </div>
  )
};

/**
 * `trend` puts the change under the number (the prototype's Document tab: "↑ 12% 7-day change"): green up, red down,
 * grey flat. The arrow and the words a screen reader hears ("Up 12%, 7-day change") say the direction, so it never
 * rests on colour alone. Not in Figma.
 */
export const WithTrend: Story = {
  name: 'With trend',
  render: () => (
    <div style={{display: 'grid', gridTemplateColumns: 'repeat(3, 200px)', gap: 24, alignItems: 'start'}}>
      <StatTile label="Visitors" value="48" trend={{direction: 'up', value: '12%', label: '7-day change'}} />
      <StatTile label="Comments" value="31" trend={{direction: 'down', value: '8%', label: '7-day change'}} />
      <StatTile label="Reactions" value="112" trend={{direction: 'flat', value: '0%', label: '7-day change'}} />
    </div>
  )
};

/**
 * A phase with nothing counted yet (the prototype's freshly published Ideation tab): every tile shows 0, the same tile
 * as with data, so the band keeps its shape and fills in place. Not in Figma.
 */
export const Empty: Story = {
  render: () => (
    <div style={{display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: 10, width: 764}}>
      <StatTile label="Visitors" value="0" />
      <StatTile label="Phase participants" value="0" />
      <StatTile label="Ideas" value="0" />
      <StatTile label="Comments" value="0" />
      <StatTile label="Reactions" value="0" />
      <StatTile label="Participation rate" value="0%" />
    </div>
  )
};

/**
 * `info` puts a help icon after the label; pressing it opens a Help popover with what the number means (never a
 * hover-only tip, which touch and keyboard can't reach). Not in Figma.
 */
export const WithInfo: Story = {
  name: 'With info',
  render: () => (
    <div style={{width: 220}}>
      <StatTile
        label="Participation rate"
        value="56.5%"
        info="Phase participants as a share of the people who visited the project while this phase was open."
      />
    </div>
  )
};
