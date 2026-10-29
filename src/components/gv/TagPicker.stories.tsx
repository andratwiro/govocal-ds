import type {ReactNode} from 'react';
import type {Meta, StoryObj} from '@storybook/react-vite';
import {TagPicker, type TagPickerProps} from './TagPicker';
import type {OptionListItem} from './OptionList';

// Invented tags of an ideation phase.
const TAGS: OptionListItem[] = ['Cycling', 'Environment', 'Public space', 'Transport', 'Safety', 'Housing', 'Culture']
  .map(t => ({id: t, label: t}));

type DemoProps = Omit<TagPickerProps, 'aria-label' | 'items'> & {items?: OptionListItem[]};
/** The picker keeps its own value from `defaultValue`. */
function Demo({items = TAGS, ...props}: DemoProps) {
  return <TagPicker aria-label="Tags" items={items} {...props} />;
}

/** A side panel's property row: the label on the left, the picker beside it. */
const Row = ({label, children}: {label: string; children: ReactNode}) => (
  <div style={{display: 'grid', gridTemplateColumns: '96px 1fr', alignItems: 'center', gap: 16, width: 420}}>
    <span style={{font: 'var(--gv-type-ui)', color: 'var(--gv-text-secondary)'}}>{label}</span>
    {children}
  </div>
);

const meta: Meta<typeof TagPicker> = {
  title: 'Components/Forms/Tag picker',
  component: TagPicker,
  tags: ['autodocs', 'not-in-figma'],
  parameters: {layout: 'centered'}
};
export default meta;
type Story = StoryObj<typeof TagPicker>;

/** Each state in an input's property rows. */
export const AllVariants: Story = {
  render: () => (
    <div style={{display: 'grid', gap: 16}}>
      <Row label="Default"><Demo defaultValue={['Cycling', 'Safety']} /></Row>
      <Row label="Empty"><Demo /></Row>
      <Row label="Many"><Demo defaultValue={['Cycling', 'Environment', 'Public space', 'Transport', 'Safety', 'Housing']} /></Row>
      <Row label="Disabled"><Demo defaultValue={['Cycling', 'Safety']} isDisabled /></Row>
    </div>
  )
};

/** An input's tags. Tab reaches the tags (←→ between them, Delete or Backspace removes one), then Add tag; Enter or
 * Space opens the list with focus in its search, where ↑↓ move and Enter ticks while the list stays open; Esc empties
 * the search, then closes the list and gives focus back to Add tag. */
export const Default: Story = {render: () => <Row label="Tags"><Demo defaultValue={['Cycling', 'Safety']} /></Row>};

/** No tags yet: only Add tag. */
export const Empty: Story = {render: () => <Row label="Tags"><Demo /></Row>};

/** More tags than fit a line: they wrap, and Add tag goes under them. */
export const Many: Story = {
  render: () => <Row label="Tags"><Demo defaultValue={['Cycling', 'Environment', 'Public space', 'Transport', 'Safety', 'Housing']} /></Row>
};

/** The tags without their ×, Add tag greyed. */
export const Disabled: Story = {render: () => <Row label="Tags"><Demo defaultValue={['Cycling', 'Safety']} isDisabled /></Row>};
