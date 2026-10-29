import {LegendRow} from './LegendRow';
import type {Meta, StoryFn} from '@storybook/react-vite';

const meta: Meta<typeof LegendRow> = {
  title: 'Components/Charts/Legend row',
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

/** Figma's Demographic · age legend, 341 wide: one swatch per age group, in the five chart blues. */
export const AllVariants: Story = () => (
  <div style={{display: 'flex', flexDirection: 'column', gap: 8, width: 341}}>
    <LegendRow color="--gv-chart-blue-1" label="18–24" value="16%" />
    <LegendRow color="--gv-chart-blue-2" label="25–34" value="29%" />
    <LegendRow color="--gv-chart-blue-3" label="35–44" value="23%" />
    <LegendRow color="--gv-chart-blue-4" label="45–54" value="17%" />
    <LegendRow color="--gv-chart-blue-5" label="55+" value="15%" />
  </div>
);

export const Default: Story = () => (
  <div style={{width: 341}}>
    <LegendRow color="--gv-chart-blue-1" label="18–24" value="16%" />
  </div>
);

/**
 * `count` adds a column before the share (the Common Ground panel's "Where people stand"): counts in the primary
 * colour, shares in the secondary, both right-aligned so stacked rows line up. Not seen yet takes the track's grey.
 */
export const CountAndPercent: Story = () => (
  <div style={{display: 'flex', flexDirection: 'column', gap: 8, width: 341}}>
    <LegendRow color="--gv-chart-agree" label="Agree" count={21} value="3%" />
    <LegendRow color="--gv-chart-disagree" label="Disagree" count={88} value="14%" />
    <LegendRow color="--gv-chart-pass" label="Unsure" count={12} value="2%" />
    <LegendRow color="--gv-surface-neutral" label="Not seen yet" count={519} value="81%" />
  </div>
);
CountAndPercent.storyName = 'Count and percent';

/**
 * Linked to a chart (Not in Figma): hovering or focusing a row picks its series out and the other rows dim with
 * their series (`onHighlightChange`, `highlighted`, `dimmed`). Here the second row is picked out.
 * Chart › Line · with legend rows shows it driving a chart.
 */
export const Highlighted: Story = () => (
  <div style={{display: 'flex', flexDirection: 'column', gap: 8, width: 341}}>
    <LegendRow color="--gv-chart-blue-1" label="18–24" value="16%" isDimmed />
    <LegendRow color="--gv-chart-blue-2" label="25–34" value="29%" isHighlighted />
    <LegendRow color="--gv-chart-blue-3" label="35–44" value="23%" isDimmed />
  </div>
);
