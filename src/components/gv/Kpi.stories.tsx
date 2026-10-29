import type {Meta, StoryObj} from '@storybook/react-vite';
import {Kpi} from './Kpi';
import {Sparkline} from './Chart';

const figma = (id: string) => ({
  design: {type: 'figma', url: `https://www.figma.com/design/OkMTJrzoV6em7gkqribtjA/Go-Vocal-Design-System?node-id=${id}`}
});

const meta: Meta<typeof Kpi> = {
  title: 'Components/KPI',
  component: Kpi,
  tags: ['autodocs'],
  parameters: figma('33-480'),
  argTypes: {
    type: {control: 'inline-radio', options: ['default', 'tall', 'with-note']}
  }
};
export default meta;
type Story = StoryObj<typeof Kpi>;

/** Every Figma variant side by side, as they sit in a dashboard's KPI band. */
export const AllVariants: Story = {
  render: () => (
    <div style={{display: 'grid', gridTemplateColumns: 'repeat(3, 184px)', gap: 24, alignItems: 'start'}}>
      <Kpi type="default" label="Visitors" value="312" />
      <Kpi type="tall" label="Visitors" value="23" />
      <Kpi type="with-note" label="Voters" value="1" note="updating live" />
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

/** A KPI band from "Green Corridors for Riverside": the prototype's six-up Insights row. */
export const Band: Story = {
  render: () => (
    <div style={{display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: 10, width: 960}}>
      <Kpi label="Visitors" value="1,284" />
      <Kpi label="Phase participants" value="873" />
      <Kpi label="Ideas" value="392" />
      <Kpi label="Comments" value="1,105" />
      <Kpi label="Reactions" value="4,060" />
      <Kpi label="Participation rate" value="56.5%" />
    </div>
  )
};

/** The slot under the value takes a Sparkline: the prototype's "stat card with sparkline". */
export const WithSparkline: Story = {
  name: 'With note and sparkline',
  render: () => (
    <div style={{width: 240}}>
      <Kpi type="with-note" label="Participants" value="873" note="Last 30 days: +61">
        <Sparkline values={[20, 24, 31, 28, 35, 44, 52, 61]} height={34} grid={false} />
      </Kpi>
    </div>
  )
};
