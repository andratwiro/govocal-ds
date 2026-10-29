import {useState} from 'react';
import type {Meta, StoryObj} from '@storybook/react-vite';
import {FilterChips} from './FilterChips';
import type {FilterValue} from './FilterMenu';
import {IDEA_FACETS} from './FilterMenu.stories';

function Demo({initial, showClear}: {initial: FilterValue; showClear?: boolean}) {
  const [value, setValue] = useState<FilterValue>(initial);
  const on = Object.values(value).some(v => v.length);
  return (
    <div style={{width: 720, display: 'grid', gap: 8}}>
      <FilterChips facets={IDEA_FACETS} value={value} onChange={setValue} showClear={showClear} />
      {!on && <p style={{margin: 0, font: 'var(--gv-type-small)', color: 'var(--gv-text-secondary)'}}>No filter on: the bar is gone.</p>}
    </div>
  );
}

const meta: Meta<typeof FilterChips> = {
  title: 'Patterns/Manage tab/Filter chips',
  component: FilterChips,
  tags: ['autodocs', 'not-in-figma'],
  parameters: {layout: 'padded'}
};
export default meta;
type Story = StoryObj<typeof FilterChips>;

/** The two filters of the Manage tab: an assignee and a tag. × removes one, Clear removes both. */
export const TwoFilters: Story = {name: 'Default', render: () => <Demo initial={{assignee: ['Manager A'], tags: ['Cycling']}} />};

/** Several values in one facet read "is any of" and list them. */
export const AnyOf: Story = {name: 'Any of', render: () => <Demo initial={{status: ['Proposed', 'Viewed', 'Under consideration']}} />};

/** Many filters wrap onto a second line; Clear stays at the end of the first. */
export const Wrapping: Story = {
  render: () => <Demo initial={{source: ['imported'], status: ['Proposed'], assignee: ['Unassigned', 'Manager B'],
    tags: ['Cycling', 'Safety'], reply: ['awaiting']}} />
};

/** Without the Clear button, for bars that put it elsewhere. */
export const WithoutClear: Story = {name: 'Without Clear', render: () => <Demo initial={{tags: ['Housing']}} showClear={false} />};

/** Empty: no filter on, nothing renders. */
export const Empty: Story = {render: () => <Demo initial={{}} />};

/** Right to left (Arabic): chips flow from the right, the × at each chip's end. */
export const RightToLeft: Story = {
  name: 'Right to left',
  globals: {direction: 'rtl'},
  render: () => <Demo initial={{assignee: ['Manager A'], tags: ['Cycling', 'Transport']}} />
};
