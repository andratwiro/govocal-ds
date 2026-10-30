import {expect, userEvent, waitFor, within} from 'storybook/test';
import {useState} from 'react';
import type {Meta, StoryObj} from '@storybook/react-vite';
import {SearchField} from '../SearchField';

const meta: Meta<typeof SearchField> = {
  title: 'Components/Forms/Search field',
  component: SearchField,
  parameters: {layout: 'centered'},
  tags: ['autodocs', 'not-in-figma', 'status:candidate']
};
export default meta;
type Story = StoryObj<typeof SearchField>;

// Invented ideas, for the stories that search something.
const IDEAS = ['Covered bike parking at the station', 'More frequent buses on the north line', 'A pocket park on the old depot site',
  'Rain gardens along the north district', 'A repair café near Tamsel Park'];

function Results({query}: {query: string}) {
  const found = IDEAS.filter(i => i.toLowerCase().includes(query.toLowerCase()));
  return (
    <p role="status" style={{margin: 0, font: 'var(--gv-type-small)', color: 'var(--gv-text-secondary)'}}>
      {query ? `${found.length} of ${IDEAS.length} ideas match “${query}”` : `${IDEAS.length} ideas`}
    </p>
  );
}

function Collapsible({defaultExpanded, initial = ''}: {defaultExpanded?: boolean; initial?: string}) {
  const [query, setQuery] = useState(initial);
  return (
    <div style={{display: 'grid', gap: 12, justifyItems: 'end', width: 320}}>
      <SearchField isCollapsible defaultExpanded={defaultExpanded} aria-label="Search ideas" placeholder="Search ideas"
        value={query} onChange={setQuery} />
      <Results query={query} />
    </div>
  );
}

/** Every look: empty, filled (with the ×), with a label, disabled, and the collapsible one closed and open. */
export const AllVariants: Story = {
  name: 'AllVariants',
  render: () => (
    <div style={{display: 'grid', gridTemplateColumns: 'repeat(2, 240px)', gap: 24, alignItems: 'end'}}>
      <SearchField aria-label="Search projects" placeholder="Search projects" />
      <SearchField aria-label="Search projects" placeholder="Search projects" defaultValue="Bike lane" />
      <SearchField label="Search" placeholder="Search projects" />
      <SearchField aria-label="Search projects" placeholder="Search projects" isDisabled />
      <div><SearchField isCollapsible aria-label="Search ideas" placeholder="Search ideas" /></div>
      <SearchField isCollapsible defaultExpanded aria-label="Search ideas" placeholder="Search ideas" />
    </div>
  )
};

/** The magnifier leads, the placeholder says what is searched; a × appears at the end once there is text. */
export const Example: Story = {
  name: 'Default',
  render: () => {
    const [query, setQuery] = useState('');
    return (
      <div style={{display: 'grid', gap: 12, width: 280}}>
        <SearchField aria-label="Search ideas" placeholder="Search ideas" value={query} onChange={setQuery} />
        <Results query={query} />
      </div>
    );
  }
};

/** A visible label and a description, for a search that stands in a form. */
export const WithLabel: Story = {
  name: 'With label',
  render: () => <div style={{width: 280}}><SearchField label="Projects" description="Search by title or folder." placeholder="Search projects" /></div>
};

/**
 * A toolbar's search: a bordered icon button (tooltip "Search") that opens into a 180 field with focus in it.
 * Typing narrows the list; Esc clears the text, a second Esc folds it and puts focus back on the button.
 * Leaving it empty folds it too; it stays open while it holds a query.
 */
export const CollapsibleStory: Story = {name: 'Collapsible', render: () => <Collapsible />};

/** Open, holding a query: it stays open until the query is cleared. */
export const CollapsibleOpen: Story = {name: 'Collapsible · open', render: () => <Collapsible initial="park" />};

/** Filled: the × clears the text (as Esc does) and keeps focus in the field. */
export const Filled: Story = {
  render: () => <div style={{width: 280}}><SearchField aria-label="Search ideas" placeholder="Search ideas" defaultValue="Bike lane" /></div>
};

export const Disabled: Story = {
  render: () => (
    <div style={{display: 'flex', gap: 12, alignItems: 'center'}}>
      <div style={{width: 240}}><SearchField aria-label="Search ideas" placeholder="Search ideas" isDisabled /></div>
      <SearchField isCollapsible aria-label="Search ideas" isDisabled />
    </div>
  )
};

/** Right to left (Arabic): the magnifier at the right, the × at the left; the collapsible field grows leftwards. */
export const RightToLeft: Story = {
  name: 'Right to left',
  globals: {direction: 'rtl'},
  render: () => (
    <div style={{display: 'grid', gap: 16, width: 280}}>
      <SearchField aria-label="Search ideas" placeholder="Search ideas" defaultValue="Bike lane" />
      <Collapsible />
    </div>
  )
};

/** The keyboard, proved by this story's play function: on the collapsible field, Enter on the search button opens it
 * with focus inside; Esc clears the text; a second Esc folds it and puts focus back on the button. */
export const Keyboard: Story = {
  render: () => <Collapsible />,
  play: async ({canvasElement}) => {
    const canvas = within(canvasElement);
    await userEvent.tab();
    await expect(canvas.getByRole('button', {name: 'Search ideas'})).toHaveFocus();
    await userEvent.keyboard('{Enter}');
    const field = await canvas.findByRole('searchbox', {name: 'Search ideas'});
    await waitFor(() => expect(field).toHaveFocus());
    await userEvent.keyboard('depot');
    await expect(canvas.getByRole('status')).toHaveTextContent('1 of 5 ideas match');
    await userEvent.keyboard('{Escape}');
    await expect(field).toHaveValue('');
    await userEvent.keyboard('{Escape}');
    await waitFor(() => expect(canvas.getByRole('button', {name: 'Search ideas'})).toHaveFocus());
  }
};
