import type {ReactNode} from 'react';
import type {Meta, StoryObj} from '@storybook/react-vite';
import {Tag} from 'lucide-react';
import {Avatar} from './Avatar';
import {OptionList, type OptionListItem, type OptionListProps} from './OptionList';

// Invented values: an ideation phase's tags (with how many ideas carry each), statuses, people and topic tags.
const TAGS: OptionListItem[] = ['Cycling', 'Environment', 'Public space', 'Transport', 'Safety', 'Housing', 'Culture']
  .map((t, i) => ({id: t, label: t, count: [14, 28, 40, 33, 30, 12, 24][i]}));
const FEW_TAGS = TAGS.slice(0, 5);
const STATUSES: OptionListItem[] = ['Screening', 'Proposed', 'Viewed', 'Under consideration', 'Accepted', 'Rejected']
  .map(s => ({id: s, label: s}));
const PEOPLE: OptionListItem[] = [
  {id: 'Unassigned', label: 'Unassigned', icon: <Avatar size={16} isUnassigned />},
  ...['Manager A', 'Manager B', 'Manager C'].map(m => ({id: m, label: m, icon: <Avatar size={16} initials={m.slice(-1)} />}))
];
const TOPICS: OptionListItem[] = ['Mobility', 'Public transit', 'Cycling & bike lanes', 'Roads & traffic', 'Parking', 'Climate',
  'Energy', 'Air quality', 'Green spaces', 'Water & rivers', 'Waste & recycling', 'Biodiversity'].map(t => ({id: t, label: t}));
const ideas = (n: number) => `${n} ${n === 1 ? 'idea' : 'ideas'}`;
const tag = <Tag aria-hidden size={16} />;

/** The frame stands in for the popover the list opens in. */
function Frame({children}: {children: ReactNode}) {
  return (
    <div style={{width: 'fit-content', border: '1px solid var(--gv-border-control)', borderRadius: 12,
      background: 'var(--gv-surface-panel)', boxShadow: 'var(--gv-shadow-subtle)'}}>{children}</div>
  );
}

type DemoProps = Omit<OptionListProps, 'aria-label'> & {label?: string};
/** The list keeps its own value from `defaultValue`. */
function Demo({label = 'Tags', ...props}: DemoProps) {
  return <Frame><OptionList aria-label={label} {...props} /></Frame>;
}

const meta: Meta<typeof OptionList> = {
  title: 'Components/Forms/Option list',
  component: OptionList,
  tags: ['autodocs', 'not-in-figma'],
  parameters: {layout: 'centered'}
};
export default meta;
type Story = StoryObj<typeof OptionList>;

const Caption = ({children}: {children: ReactNode}) =>
  <figcaption style={{font: 'var(--gv-type-small)', color: 'var(--gv-text-secondary)', marginBottom: 8}}>{children}</figcaption>;

/** Each configuration side by side, as it shows in its popover. */
export const AllVariants: Story = {
  render: () => (
    <div style={{display: 'flex', flexWrap: 'wrap', gap: 24, alignItems: 'start', maxWidth: 1100}}>
      <figure style={{margin: 0}}><Caption>Multiple</Caption><Demo items={FEW_TAGS} icon={tag} defaultValue={['Cycling', 'Safety']} /></figure>
      <figure style={{margin: 0}}><Caption>Single</Caption><Demo label="Status" selectionMode="single" isSearchable={false} items={STATUSES} defaultValue={['Viewed']} /></figure>
      <figure style={{margin: 0}}><Caption>With counts</Caption><Demo items={FEW_TAGS} icon={tag} countLabel={ideas} defaultValue={['Transport']} /></figure>
      <figure style={{margin: 0}}><Caption>With search</Caption><Demo items={TAGS} icon={tag} countLabel={ideas} defaultValue={['Cycling']} /></figure>
      <figure style={{margin: 0}}><Caption>With footer</Caption>
        <Demo label="Topic tags" items={TOPICS} defaultValue={['Green spaces', 'Climate']} placeholder="Search tags..." searchLabel="Search tags"
          selectionLabel={n => (n ? `${n} ${n === 1 ? 'tag' : 'tags'} selected` : 'No tags selected')} />
      </figure>
      <figure style={{margin: 0}}><Caption>Empty</Caption><Demo items={[]} emptyLabel="No tags yet" /></figure>
    </div>
  )
};

/** Pick one: the statuses of an idea. The chosen one has a check at its end; choosing closes the popover. ↑↓ move,
 * Enter or Space chooses. */
export const Single: Story = {
  render: () => <Demo label="Status" selectionMode="single" isSearchable={false} items={STATUSES} defaultValue={['Viewed']} />
};

/** Pick several: the tags of an idea, each with the tag icon. Boxes show on ticked rows and the one under the pointer
 * or the keyboard; ticking keeps the list open. */
export const Multiple: Story = {
  render: () => <Demo items={FEW_TAGS} icon={tag} defaultValue={['Cycling', 'Safety']} />
};

/** A filter's values with how many ideas carry each ("14 ideas"), read with the value. */
export const WithCounts: Story = {
  name: 'With counts',
  render: () => <Demo items={FEW_TAGS} icon={tag} countLabel={ideas} defaultValue={['Transport']} />
};

/** Past five options a search leads the list ("Filter...", the magnifier first). Type to narrow it; ↑↓ still move
 * through the rows while the search keeps focus, Enter ticks. Esc empties the search, then closes. */
export const Searchable: Story = {
  name: 'With search',
  render: () => <Demo items={TAGS} icon={tag} countLabel={ideas} defaultValue={['Cycling']} />
};

/** People get their Avatar instead of the list's icon; Unassigned is the dashed one. */
export const People: Story = {
  name: 'With avatars',
  render: () => <Demo label="Assignee" items={PEOPLE} defaultValue={['Manager A']} />
};

/** The project's topic tags: a footer says how many are chosen and Done closes the popover. Tab moves from the search
 * to the list to Done. */
export const WithFooter: Story = {
  name: 'With footer',
  render: () => (
    <Demo label="Topic tags" items={TOPICS} defaultValue={['Green spaces', 'Climate']} placeholder="Search tags..." searchLabel="Search tags"
      selectionLabel={n => (n ? `${n} ${n === 1 ? 'tag' : 'tags'} selected` : 'No tags selected')} />
  )
};

/** No options yet: the list says so. A search that matches nothing says "No results". */
export const Empty: Story = {render: () => <Demo items={[]} emptyLabel="No tags yet" />};

/** Right to left (Arabic): box, icon and value from the right, the count at the left end. */
export const RightToLeft: Story = {
  name: 'Right to left',
  globals: {direction: 'rtl'},
  render: () => <Demo items={TAGS} icon={tag} countLabel={ideas} defaultValue={['Cycling', 'Safety']} />
};
