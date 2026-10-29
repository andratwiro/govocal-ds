import {useState} from 'react';
import type {Meta, StoryObj} from '@storybook/react-vite';
import {Tag} from 'lucide-react';
import {FilterOptions, type FilterOption} from './FilterOptions';
import {IDEA_FACETS} from './FilterMenu.stories';

const TAGS = IDEA_FACETS.find(f => f.id === 'tags')!.options;
const ASSIGNEES = IDEA_FACETS.find(f => f.id === 'assignee')!.options;
const ideas = (n: number) => `${n} ${n === 1 ? 'idea' : 'ideas'}`;

function Demo({options, initial = [], searchable, icon = true}: {options: FilterOption[]; initial?: string[]; searchable?: boolean; icon?: boolean}) {
  const [selected, setSelected] = useState<string[]>(initial);
  // The frame stands in for the submenu's popover.
  return (
    <div style={{width: 'fit-content', border: '1px solid var(--gv-border-control)', borderRadius: 12, background: 'var(--gv-surface-panel)'}}>
      <FilterOptions aria-label="Tags" options={options} selected={selected} onChange={setSelected}
        icon={icon ? <Tag aria-hidden size={16} /> : undefined} countLabel={ideas} searchable={searchable} />
    </div>
  );
}

const meta: Meta<typeof FilterOptions> = {
  title: 'Patterns/Filter options',
  component: FilterOptions,
  tags: ['autodocs']
};
export default meta;
type Story = StoryObj<typeof FilterOptions>;

/** The Tags submenu: "Filter..." over seven tags, Cycling ticked. Type to narrow, hover a row to see its box. */
export const Searchable: Story = {render: () => <Demo options={TAGS} initial={['Cycling']} />};

/** Five options or fewer: no search. People get their gv Avatar instead of the facet icon. */
export const People: Story = {render: () => <Demo options={ASSIGNEES} initial={['Manager A']} />};

/** Nothing ticked: boxes show only on the hovered row. */
export const NoneTicked: Story = {render: () => <Demo options={TAGS} />};

/** Empty: a facet with no values yet says so. */
export const Empty: Story = {render: () => <Demo options={[]} searchable />};

/** Without icons or counts. */
export const Plain: Story = {render: () => <Demo options={TAGS.map(({id, label}) => ({id, label}))} icon={false} />};

/** Right to left (Arabic): box, icon and value from the right, the count at the left end. */
export const RightToLeft: Story = {
  globals: {direction: 'rtl'},
  render: () => <Demo options={TAGS} initial={['Cycling', 'Safety']} />
};
