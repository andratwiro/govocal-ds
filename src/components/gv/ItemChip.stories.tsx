import {useState} from 'react';
import type {Meta, StoryObj} from '@storybook/react-vite';
import {expect, fn, userEvent, within} from 'storybook/test';
import {BarChart3, FileText, Hash, Type} from 'lucide-react';
import {ItemChip} from './ItemChip';
import {Inline} from './Inline';
import {Stack} from './Stack';
import {Text} from './Text';

const meta: Meta<typeof ItemChip> = {
  title: 'Components/AI/Item chip',
  component: ItemChip,
  tags: ['autodocs', 'not-in-figma', 'status:draft'],
  parameters: {layout: 'padded'},
  args: {label: 'Votes per cycle lane route', icon: <BarChart3 aria-hidden />}
};
export default meta;
type Story = StoryObj<typeof ItemChip>;

/** Every look and every status: outlined (history), filled (a composer), quiet (the line above a message). */
export const AllVariants: Story = {
  name: 'All variants',
  render: () => (
    <Stack gap="16">
      <Inline gap="6">
        <ItemChip icon={<Type aria-hidden />} label="Summary" />
        <ItemChip icon={<BarChart3 aria-hidden />} label="Upcoming events in Green Streets" status="added" />
        <ItemChip icon={<BarChart3 aria-hidden />} label="How people heard about the survey" status="removed" />
        <ItemChip icon={<Type aria-hidden />} label="Who took part" previousLabel="Participants" status="renamed" />
      </Inline>
      <Inline gap="6">
        <ItemChip variant="filled" icon={<FileText aria-hidden />} label="Title page" />
        <ItemChip variant="filled" icon={<Hash aria-hidden />} label="By the numbers" onRemove={fn()}
          labels={{remove: () => 'Ask about the whole report'}} />
      </Inline>
      <Inline gap="6">
        <ItemChip variant="quiet" icon={<Hash aria-hidden />} label="By the numbers" />
      </Inline>
    </Stack>
  )
};

/** The default: an outlined chip naming one item. */
export const Default: Story = {};

/** Pressed, it reveals the item (the page scrolls to it and flashes it). A removed item can't be pressed. */
export const Pressable: Story = {args: {onPress: fn()}};

/** With an ×: the composer's scope, named for what removing it does. */
export const Removable: Story = {
  args: {variant: 'filled', icon: <Hash aria-hidden />, label: 'By the numbers', onRemove: fn(),
    labels: {remove: () => 'Ask about the whole report'}}
};

/** A long name truncates; the whole name is its tooltip. */
export const LongName: Story = {
  name: 'Long name',
  render: args => <div style={{maxWidth: 200}}><ItemChip {...args} label="Identifiable participants by district and age group" /></div>
};

/** The composer's chip row: the block the prompt is about, × back to the whole report. */
export const InAComposer: Story = {
  name: 'In a composer',
  render: () => {
    const [scoped, setScoped] = useState(true);
    return scoped ? (
      <ItemChip variant="filled" icon={<Hash aria-hidden />} label="By the numbers" onRemove={() => setScoped(false)}
        labels={{remove: () => 'Ask about the whole report'}} />
    ) : <Text color="secondary">Asking about the whole report.</Text>;
  }
};

/** A version's changed items, as the Activity feed lists them. */
export const InHistory: Story = {
  name: 'In history',
  render: () => (
    <Inline gap="6" style={{maxWidth: 320}}>
      <ItemChip icon={<BarChart3 aria-hidden />} label="Upcoming events in Green Streets" status="added" onPress={fn()} />
      <ItemChip icon={<Type aria-hidden />} label="Summary" onPress={fn()} />
      <ItemChip icon={<Type aria-hidden />} label="Project priorities" onPress={fn()} />
      <ItemChip icon={<BarChart3 aria-hidden />} label="How people heard about the survey" status="removed" onPress={fn()} />
    </Inline>
  )
};

/** Off: neither the press nor the × works. */
export const Disabled: Story = {args: {onPress: fn(), onRemove: fn(), isDisabled: true}};

/** Right to left: the icon at the start, × at the end, both mirrored. */
export const RightToLeft: Story = {
  name: 'Right to left',
  globals: {direction: 'rtl'},
  args: {variant: 'filled', onRemove: fn()}
};

/** Tab reaches the press, then the ×; Enter runs each. A screen reader hears the status first. */
export const Keyboard: Story = {
  args: {onPress: fn(), onRemove: fn(), status: 'added'},
  play: async ({canvasElement, args}) => {
    const canvas = within(canvasElement);
    const reveal = canvas.getByRole('button', {name: 'Added: Votes per cycle lane route'});
    await userEvent.tab();
    await expect(reveal).toHaveFocus();
    await userEvent.keyboard('{Enter}');
    await expect(args.onPress).toHaveBeenCalledTimes(1);
    await userEvent.tab();
    await expect(canvas.getByRole('button', {name: 'Remove Votes per cycle lane route'})).toHaveFocus();
    await userEvent.keyboard('{Enter}');
    await expect(args.onRemove).toHaveBeenCalledTimes(1);
  }
};
