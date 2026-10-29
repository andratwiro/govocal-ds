import {StatementRow} from './StatementRow';
import type {Meta, StoryFn} from '@storybook/react-vite';

const meta: Meta<typeof StatementRow> = {
  title: 'Components/Statement row',
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

/** Ranked by agreement, as the prototype's Insights › Statements card shows them. The fourth wraps. */
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
