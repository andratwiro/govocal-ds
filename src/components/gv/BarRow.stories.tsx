import {BarRow} from './BarRow';
import type {Meta, StoryFn} from '@storybook/react-vite';

const meta: Meta<typeof BarRow> = {
  title: 'Components/Charts/Bar row',
  component: BarRow,
  parameters: {
    layout: 'centered',
    design: {
      type: 'figma',
      url: 'https://www.figma.com/design/OkMTJrzoV6em7gkqribtjA/Go-Vocal-Design-System?node-id=33-482'
    }
  },
  tags: ['autodocs', 'status:candidate']
};

export default meta;
type Story = StoryFn<typeof BarRow>;

/** Figma's rows, then the additions: a two-line label, no value, and the hover card (`detail`). */
export const AllVariants: Story = () => (
  <div style={{display: 'flex', flexDirection: 'column', gap: 4, width: 420}}>
    <BarRow label="Proposed" percent={18} value="18% · 6" barColor="--gv-chart-blue-2" />
    <BarRow label="Under consideration" percent={45} value="45% · 15" barColor="--gv-chart-blue-3" />
    <BarRow label="Not selected" />
    <BarRow label="Green spaces, trees and shade along the river" percent={33} labelLines={2} />
    <BarRow label="Riverside Park" percent={72} value="1,284" detail="1,284 of 3,410 inputs · 38%" />
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

/**
 * `labelLines={2}`: a longer name wraps onto a second line, then cuts off (the AI summary's Top themes, where the
 * label column is narrow). No `value`, so the bar runs to the end.
 */
export const TwoLineLabel: Story = () => (
  <div style={{display: 'flex', flexDirection: 'column', gap: 4, width: 372}}>
    <BarRow label="Facilities for all ages" percent={83} labelLines={2} />
    <BarRow label="Safety and lighting" percent={50} labelLines={2} />
    <BarRow label="Green spaces, trees and shade along the river" percent={33} labelLines={2} />
    <BarRow label="Dog-friendly areas" percent={17} labelLines={2} />
  </div>
);
TwoLineLabel.storyName = 'Two-line label';

/** No `value`: the row has no value cell and the bar takes its room (the AI summary's Top themes). */
export const WithoutValue: Story = () => (
  <div style={{display: 'flex', flexDirection: 'column', gap: 4, width: 372}}>
    <BarRow label="Facilities for all ages" percent={83} />
    <BarRow label="Safety and lighting" percent={50} />
  </div>
);
WithoutValue.storyName = 'Without value';

/**
 * Hover a row: its bar darkens a step. Where the row prints only a count (or only a share), `detail` gives the exact
 * count and share in a card over the bar's end; screen readers read it with the label. Not in Figma.
 */
export const WithDetail: Story = () => (
  <div style={{display: 'flex', flexDirection: 'column', gap: 4, width: 420, paddingBlockStart: 40}}>
    <BarRow label="Riverside Park" percent={100} value="1,284" detail="1,284 of 3,410 inputs · 38%" />
    <BarRow label="Green Corridors" percent={64} value="822" detail="822 of 3,410 inputs · 24%" />
    <BarRow label="Market Square" percent={31} value="398" detail="398 of 3,410 inputs · 12%" />
  </div>
);
WithDetail.storyName = 'With detail';
