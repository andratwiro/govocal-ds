import type {Meta, StoryObj} from '@storybook/react-vite';
import {Text, type TextKind} from './Text';

const meta: Meta<typeof Text> = {
  title: 'Components/Text/Text',
  component: Text,
  tags: ['autodocs', 'not-in-figma'],
  parameters: {layout: 'padded'},
  args: {kind: 'body', children: 'Green corridors for the riverside'}
};
export default meta;
type Story = StoryObj<typeof Text>;

const KINDS: TextKind[] = ['title', 'body', 'ui', 'small', 'stat'];

/** Every type style, regular and strong where it has a strong weight, in the primary colour. */
export const AllVariants: Story = {
  render: () => (
    <div style={{display: 'grid', gridTemplateColumns: 'auto auto', gap: 'var(--gv-space-12) var(--gv-space-32)', alignItems: 'baseline'}}>
      {KINDS.flatMap(kind => [
        <Text key={kind} kind="small" color="tertiary">{kind}</Text>,
        <span key={`${kind}-text`} style={{display: 'flex', gap: 'var(--gv-space-24)', alignItems: 'baseline'}}>
          <Text kind={kind} color="primary">{kind === 'stat' ? '1,248' : 'Collect ideas'}</Text>
          {(kind === 'body' || kind === 'ui' || kind === 'small') && <Text kind={kind} isStrong color="primary">Collect ideas</Text>}
        </span>
      ])}
    </div>
  )
};

/** The four colours, by emphasis, in Small: primary, secondary, meta (a record's author and date), tertiary. */
export const Colors: Story = {
  name: 'Colours',
  render: () => (
    <div style={{display: 'grid', gap: 'var(--gv-space-8)'}}>
      <Text kind="small" color="primary">Primary: the words that matter</Text>
      <Text kind="small" color="secondary">Secondary: what explains them</Text>
      <Text kind="small" color="meta">Meta: posted 2 days ago by Resident A</Text>
      <Text kind="small" color="tertiary">Tertiary: what can wait</Text>
    </div>
  )
};

/** A section title and its line: `elementType` makes the text a heading or a paragraph; it brings no margins. */
export const HeadingAndParagraph: Story = {
  name: 'Heading and paragraph',
  render: () => (
    <div style={{display: 'grid', gap: 'var(--gv-space-4)', maxWidth: 480}}>
      <Text elementType="h2" kind="body" isStrong color="primary">Where people stand</Text>
      <Text elementType="p" kind="small" color="meta">
        Reactions from the 124 ideas posted in this phase, counted when the phase ended.
      </Text>
    </div>
  )
};

/** The controls on the docs page drive this one. */
export const Playground: Story = {args: {kind: 'small', color: 'meta', children: 'Posted 2 days ago'}};
