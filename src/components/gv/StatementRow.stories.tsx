import {StatementRow} from './StatementRow';
import {LegendRow} from './LegendRow';
import type {Meta, StoryFn} from '@storybook/react-vite';

const meta: Meta<typeof StatementRow> = {
  title: 'Components/Charts/Statement row',
  component: StatementRow,
  parameters: {
    layout: 'padded',
    design: {
      type: 'figma',
      url: 'https://www.figma.com/design/OkMTJrzoV6em7gkqribtjA/Go-Vocal-Design-System?node-id=24-225'
    }
  },
  tags: ['autodocs']
};

export default meta;
type Story = StoryFn<typeof StatementRow>;

/** The prototype's Insights card stacks its rows 14 apart. */
const Frame = ({children, width = 730}: {children: React.ReactNode; width?: number}) => (
  <div style={{display: 'flex', flexDirection: 'column', gap: 14, width}}>{children}</div>
);

const ROWS = [
  {statement: 'The park needs much more shade for hot days.', a: 80, d: 12, p: 8},
  {statement: 'Evening events would make the park feel safer.', a: 76, d: 9, p: 15},
  {statement: 'A car-free park loop on Sundays is worth trying.', a: 59, d: 31, p: 10},
  {
    statement:
      'We should widen the main paths for prams and wheelchairs, even where it means losing some of the grass along the lagoon.',
    a: 48,
    d: 40,
    p: 12
  },
  {statement: 'The central lawn should stay exactly as it is.', a: 21, d: 67, p: 12}
];

/**
 * Ranked by agreement, as the prototype's Insights › Statements card shows them. The fourth wraps. Hover a row: its
 * bar darkens a step and a card gives every share.
 */
export const AllVariants: Story = () => (
  <Frame>
    {ROWS.map(r => (
      <StatementRow
        key={r.statement}
        statement={r.statement}
        agreePercent={r.a}
        disagreePercent={r.d}
        passPercent={r.p}
        summary={`${r.a}% agree`}
      />
    ))}
  </Frame>
);

export const Default: Story = () => (
  <Frame>
    <StatementRow
      statement="The park needs much more shade for hot days."
      agreePercent={80}
      disagreePercent={12}
      passPercent={8}
      summary="80% agree"
    />
  </Frame>
);

/** A longer caption: the value column grows past 72 rather than wrap. */
export const LongValue: Story = () => (
  <Frame>
    <StatementRow
      statement="The central lawn should stay exactly as it is."
      agreePercent={21}
      disagreePercent={67}
      passPercent={12}
      summary="67% disagree"
    />
  </Frame>
);
LongValue.storyName = 'Long value';

/** Not in Figma: in a narrow column the row stacks, as the prototype's does on a small screen. */
export const Narrow: Story = () => (
  <Frame width={360}>
    {ROWS.slice(0, 3).map(r => (
      <StatementRow
        key={r.statement}
        statement={r.statement}
        agreePercent={r.a}
        disagreePercent={r.d}
        passPercent={r.p}
        summary={`${r.a}% agree`}
      />
    ))}
  </Frame>
);

/**
 * Four shares (the Manage panel's "Where people stand"): the bar alone (no `statement`), the three answers 2 apart
 * and the rest of the track who hasn't seen it yet (`unseenPercent`). Legend rows with counts sit under it. Hover
 * the bar for every share with its count.
 */
export const FourShares: Story = () => (
  <div style={{display: 'flex', flexDirection: 'column', gap: 16, width: 510, paddingBlockStart: 120}}>
    <StatementRow
      agreePercent={3}
      disagreePercent={14}
      passPercent={2}
      unseenPercent={81}
      passLabel="Unsure"
      counts={{agree: 21, disagree: 88, pass: 12, unseen: 519}}
    />
    <div style={{display: 'flex', flexDirection: 'column', gap: 8}}>
      <LegendRow color="--gv-chart-agree" label="Agree" count={21} value="3%" />
      <LegendRow color="--gv-chart-disagree" label="Disagree" count={88} value="14%" />
      <LegendRow color="--gv-chart-pass" label="Unsure" count={12} value="2%" />
      <LegendRow color="--gv-surface-pill" label="Not seen yet" count={519} value="81%" />
    </div>
  </div>
);
FourShares.storyName = 'Four shares';

/** With `counts`, the hover card gives the people behind each share ("34 · 80%"); the row still prints the agree share. */
export const WithCounts: Story = () => (
  <Frame width={730}>
    <div style={{blockSize: 96}} aria-hidden />
    <StatementRow
      statement="The park needs much more shade for hot days."
      agreePercent={80}
      disagreePercent={12}
      passPercent={8}
      summary="80% agree"
      counts={{agree: 34, disagree: 5, pass: 3}}
    />
  </Frame>
);
WithCounts.storyName = 'With counts';
