import {useState} from 'react';
import type {Meta, StoryObj} from '@storybook/react-vite';
import {expect, userEvent, waitFor, within} from 'storybook/test';
import {FilterChips} from './FilterChips';
import type {FilterValue} from './FilterMenu';
import {IDEA_FACETS} from './FilterMenu.stories';

function Demo({initial, showClear, metric: initialMetric}: {initial: FilterValue; showClear?: boolean; metric?: string}) {
  const [value, setValue] = useState<FilterValue>(initial);
  const [metric, setMetric] = useState(initialMetric);
  const on = Object.values(value).some(v => v.length) || !!metric;
  return (
    <div style={{width: 720, display: 'grid', gap: 8}}>
      <FilterChips facets={IDEA_FACETS} value={value} onChange={setValue} showClear={showClear}
        metric={metric} onMetricRemove={() => setMetric(undefined)} />
      {!on && <p style={{margin: 0, font: 'var(--gv-type-small)', color: 'var(--gv-text-secondary)'}}>No filter on: the bar is gone.</p>}
    </div>
  );
}

const meta: Meta<typeof FilterChips> = {
  title: 'Components/Tables & lists/Filter chips',
  component: FilterChips,
  tags: ['autodocs', 'not-in-figma', 'status:candidate'],
  parameters: {layout: 'padded'}
};
export default meta;
type Story = StoryObj<typeof FilterChips>;

/** Two filters on (the phase Manage tab's): an assignee and a tag. × removes one, Clear removes both. */
export const TwoFilters: Story = {name: 'Default', render: () => <Demo initial={{assignee: ['Manager A'], tags: ['Cycling']}} />};

/** Several values in one facet read "is any of" and list them. */
export const AnyOf: Story = {name: 'Any of', render: () => <Demo initial={{status: ['Proposed', 'Viewed', 'Under consideration']}} />};

/** Many filters wrap onto a second line; Clear stays at the end of the first. */
export const Wrapping: Story = {
  render: () => <Demo initial={{source: ['imported'], status: ['Proposed'], assignee: ['Unassigned', 'Manager B'],
    tags: ['Cycling', 'Safety'], reply: ['awaiting']}} />
};

/** Without the Clear button, when one Clear is enough: the Filter menu has its own "Clear all filters". */
export const WithoutClear: Story = {name: 'Without Clear', render: () => <Demo initial={{tags: ['Housing']}} showClear={false} />};

/**
 * A quick view picked from the stats above the table ("New ideas") filters it too: a chip with its name only, first
 * in the bar, beside the facet chips. Its × turns the view off; Clear turns off everything.
 */
export const MetricChip: Story = {name: 'Metric chip', render: () => <Demo initial={{assignee: ['Unassigned']}} metric="New ideas" />};

/** Empty: no filter on, so nothing shows (this story is blank on purpose) and the list below moves up. */
export const Empty: Story = {render: () => <Demo initial={{}} />};

/** Right to left (Arabic): chips flow from the right, the × at each chip's end. */
export const RightToLeft: Story = {
  name: 'Right to left',
  globals: {direction: 'rtl'},
  render: () => <Demo initial={{assignee: ['Manager A'], tags: ['Cycling', 'Transport']}} />
};

/** The keyboard, proved by this story's play function (the Interactions panel): Tab enters the chips once; → and ←
 * move between them; Delete (or Backspace) turns the focused filter off and focus moves to a neighbour; the next Tab
 * reaches Clear, and Enter on it turns every filter off. */
export const Keyboard: Story = {
  render: () => <Demo initial={{assignee: ['Manager A'], tags: ['Cycling']}} />,
  play: async ({canvasElement}) => {
    const canvas = within(canvasElement);
    const assignee = canvas.getByRole('row', {name: /^Assignee/});
    await userEvent.tab();
    await expect(assignee).toHaveFocus();
    await userEvent.keyboard('{ArrowRight}');
    await expect(canvas.getByRole('row', {name: /^Tags/})).toHaveFocus();
    await userEvent.keyboard('{Delete}');
    await waitFor(() => expect(canvas.queryByRole('row', {name: /^Tags/})).toBeNull());
    await waitFor(() => expect(canvas.getByRole('row', {name: /^Assignee/})).toHaveFocus());
    await userEvent.tab();
    await expect(canvas.getByRole('button', {name: 'Clear'})).toHaveFocus();
    await userEvent.keyboard('{Enter}');
    await expect(canvas.getByText('No filter on: the bar is gone.')).toBeInTheDocument();
  }
};
