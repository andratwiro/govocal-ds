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
