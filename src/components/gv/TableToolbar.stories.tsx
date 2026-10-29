import {useState} from 'react';
import type {Meta, StoryObj} from '@storybook/react-vite';
import {TableToolbar, TableToolbarHeading} from './TableToolbar';
import {SearchField} from '../SearchField';
import {FilterMenu, type FilterValue} from '../../patterns/FilterMenu';
import {FilterChips} from '../../patterns/FilterChips';
import {SelectionBar} from '../../patterns/SelectionBar';
import {IDEA_FACETS} from '../../patterns/FilterMenu.stories';
import {ExportMenu, IDEA_ACTIONS, IDEAS, filterIdeas, ideaCount} from './story-data/ideas';

/** A live toolbar over the invented ideas: the count follows the search and the filters. */
function Demo({initial = {}, query: initialQuery = '', withExport, selected: initialSelected = 0}: {
  initial?: FilterValue;
  query?: string;
  withExport?: boolean;
  selected?: number;
}) {
  const [value, setValue] = useState<FilterValue>(initial);
  const [query, setQuery] = useState(initialQuery);
  const [selected, setSelected] = useState(initialSelected);
  const [said, setSaid] = useState('');
  const shown = filterIdeas(IDEAS, {query, value}).length;
  return (
    <div style={{display: 'grid', gap: 8, width: 900}}>
      <TableToolbar start={
        <SelectionBar count={selected} items={IDEA_ACTIONS} onClear={() => setSelected(0)} onAction={setSaid}>
          <TableToolbarHeading>{ideaCount(shown)}</TableToolbarHeading>
        </SelectionBar>
      }>
        <SearchField isCollapsible aria-label="Search ideas" placeholder="Search" value={query} onChange={setQuery} />
        <FilterMenu facets={IDEA_FACETS} value={value} onChange={setValue} countLabel={ideaCount} />
        {withExport && <ExportMenu selected={selected} onExport={what => setSaid(`Export: ${what}`)} />}
      </TableToolbar>
      <FilterChips facets={IDEA_FACETS} value={value} onChange={setValue} />
      <p role="status" style={{margin: 0, font: 'var(--gv-type-small)', color: 'var(--gv-text-secondary)'}}>{said}</p>
    </div>
  );
}

const meta: Meta<typeof TableToolbar> = {
  title: 'Components/Tables & lists/Table toolbar',
  component: TableToolbar,
  subcomponents: {TableToolbarHeading},
  tags: ['autodocs', 'not-in-figma'],
  parameters: {layout: 'padded'}
};
export default meta;
type Story = StoryObj<typeof TableToolbar>;

/** Every state at once: plain, filtered, searching with the export, and with a selection. */
export const AllVariants: Story = {
  name: 'AllVariants',
  render: () => (
    <div style={{display: 'grid', gap: 32}}>
      <Demo />
      <Demo initial={{status: ['Proposed', 'Viewed']}} />
      <Demo query="park" withExport />
      <Demo selected={3} withExport />
    </div>
  )
};

/**
 * The Manage tab's row: the count at the start; at the end the search, folded into its button, and the Filter menu,
 * which wears its dot while a filter is on. The count follows both. Tab enters the tools once, ← → move between them.
 */
export const Default: Story = {render: () => <Demo initial={{status: ['Proposed', 'Viewed']}} />};

/** The export joins the tools: the download button opens the formats; "Selected ideas" waits for a selection. */
export const WithExport: Story = {name: 'With export', render: () => <Demo withExport />};

/** Searching: the field stays open while it holds a query, and ← → move its caret instead of the focus. */
export const Searching: Story = {render: () => <Demo query="park" withExport />};

/** Rows selected: the Selection bar takes the count's place; the tools at the end stay put. */
export const WithASelection: Story = {name: 'With a selection', render: () => <Demo selected={3} withExport />};

/** Right to left (Arabic): the count at the right, the tools at the left, the menus opening from their end edge. */
export const RightToLeft: Story = {
  name: 'Right to left',
  globals: {direction: 'rtl'},
  render: () => <Demo initial={{tags: ['Cycling']}} withExport />
};
