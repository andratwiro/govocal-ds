import {useState, type ReactNode} from 'react';
import type {Meta, StoryObj} from '@storybook/react-vite';
import {expect, fn, userEvent, within} from 'storybook/test';
import {BarChart3, FileText, Hash, Type} from 'lucide-react';
import {BlockFrame, BlockInsertLine} from './BlockFrame';
import {Stack} from './Stack';
import {Text} from './Text';

const meta: Meta<typeof BlockFrame> = {
  title: 'Components/Layout & containers/Block frame',
  component: BlockFrame,
  subcomponents: {BlockInsertLine},
  tags: ['autodocs', 'not-in-figma'],
  // Room above each block for its tag and toolbar, as on a sheet's margin.
  parameters: {layout: 'padded'},
  args: {label: 'By the numbers', icon: <Hash aria-hidden />, onSelect: fn(), onDeselect: fn(), onMoveUp: fn(),
    onMoveDown: fn(), onDuplicate: fn(), onDelete: fn()}
};
export default meta;
type Story = StoryObj<typeof BlockFrame>;

const Sheet = ({children}: {children: ReactNode}) => (
  <div style={{maxInlineSize: 560, paddingBlock: 'var(--gv-space-48)', paddingInline: 'var(--gv-space-40)'}}>
    {children}
  </div>
);

const Body = ({title = 'Executive summary'}: {title?: string}) => (
  <Stack gap="8">
    <Text elementType="h2" kind="document-heading" color="primary">{title}</Text>
    <Text elementType="p" kind="document-body">
      3,600 identifiable participants took part across 6 projects. The project totals include repeat participants.
    </Text>
  </Stack>
);

/** At rest: nothing but the content. Hover shows the grey frame and tag. */
export const Default: Story = {render: args => <Sheet><BlockFrame {...args}><Body title="By the numbers" /></BlockFrame></Sheet>};

/** Highlighted from elsewhere (its outline row is hovered): the hover look without the pointer. */
export const Highlighted: Story = {
  args: {isHighlighted: true},
  render: Default.render
};

/** Selected: the selected frame, the filled tag off the top start, the toolbar off the top end. */
export const Selected: Story = {args: {isSelected: true, canMoveUp: false}, render: Default.render};

/** Pinned (a title page): only Delete is left. */
export const Pinned: Story = {
  args: {isSelected: true, isPinned: true, label: 'Title page', icon: <FileText aria-hidden />},
  render: args => <Sheet><BlockFrame {...args}><Body title="Moving the city 2026" /></BlockFrame></Sheet>
};

/** Made by the assistant: the ✦ mark on the end edge, shown at rest too. */
export const AiMade: Story = {
  name: 'AI-made',
  args: {isAiMade: true, label: 'Summary', icon: <Type aria-hidden />},
  render: args => <Sheet><BlockFrame {...args}><Body /></BlockFrame></Sheet>
};

/** Being dragged: dimmed in place. */
export const Dragging: Story = {args: {isDragging: true, isHighlighted: true}, render: Default.render};

/** The insert line between two blocks: hidden until hover or focus; the target (the library is open for it) stays. */
export const InsertLine: Story = {
  name: 'Insert line',
  render: () => (
    <Sheet>
      <Stack>
        <Body title="Executive summary" />
        <BlockInsertLine onInsert={fn()} isAlwaysVisible />
        <Body title="Who took part" />
        <BlockInsertLine onInsert={fn()} isTarget />
        <Body title="What they said" />
      </Stack>
    </Sheet>
  )
};

type Block = {id: string; label: string; icon: ReactNode; ai?: boolean; pinned?: boolean};
const BLOCKS: Block[] = [
  {id: 'cover', label: 'Title page', icon: <FileText aria-hidden />, pinned: true},
  {id: 'summary', label: 'Executive summary', icon: <Type aria-hidden />, ai: true},
  {id: 'numbers', label: 'By the numbers', icon: <Hash aria-hidden />},
  {id: 'routes', label: 'Votes per route', icon: <BarChart3 aria-hidden />}
];

/** A page of blocks: press one to select it, move it with ↑ ↓, duplicate or delete it; Esc steps out. */
export const Live: Story = {
  render: () => {
    const [blocks, setBlocks] = useState(BLOCKS);
    const [selected, setSelected] = useState<string | null>('numbers');
    const move = (i: number, by: number) => setBlocks(b => {
      const next = [...b];
      [next[i], next[i + by]] = [next[i + by], next[i]];
      return next;
    });
    return (
      <Sheet>
        <Stack gap="48">
          {blocks.map((b, i) => (
            <BlockFrame key={b.id} label={b.label} icon={b.icon} isAiMade={b.ai} isPinned={b.pinned}
              isSelected={selected === b.id} onSelect={() => setSelected(b.id)} onDeselect={() => setSelected(null)}
              onMoveUp={() => move(i, -1)} onMoveDown={() => move(i, 1)} canMoveUp={i > 0 && !blocks[i - 1].pinned}
              canMoveDown={i < blocks.length - 1}
              onDuplicate={() => setBlocks(x => [...x.slice(0, i + 1), {...b, id: `${b.id}-copy-${x.length}`}, ...x.slice(i + 1)])}
              onDelete={() => { setBlocks(x => x.filter(y => y.id !== b.id)); setSelected(null); }}>
              <Body title={b.label} />
            </BlockFrame>
          ))}
        </Stack>
      </Sheet>
    );
  }
};

/** Right to left: the tag at the top right, the toolbar at the top left, the ✦ mark on the left edge. */
export const RightToLeft: Story = {
  name: 'Right to left',
  globals: {direction: 'rtl'},
  args: {isSelected: true, isAiMade: true},
  render: Default.render
};

/** Tab to the block, Enter selects it, Tab reaches its toolbar, Esc steps back to the block. */
export const Keyboard: Story = {
  render: args => {
    const [selected, setSelected] = useState(false);
    return (
      <Sheet>
        <BlockFrame {...args} isSelected={selected} onSelect={() => { setSelected(true); args.onSelect?.(); }}
          onDeselect={() => setSelected(false)}><Body title="By the numbers" /></BlockFrame>
      </Sheet>
    );
  },
  play: async ({canvasElement, args}) => {
    const canvas = within(canvasElement);
    const block = canvas.getByRole('group', {name: 'By the numbers'});
    await userEvent.tab();
    await expect(block).toHaveFocus();
    await userEvent.keyboard('{Enter}');
    await expect(args.onSelect).toHaveBeenCalledTimes(1);
    const tools = canvas.getByRole('toolbar', {name: 'By the numbers: block tools'});
    await userEvent.tab();
    await expect(within(tools).getByRole('button', {name: 'Move up'})).toHaveFocus();
    await userEvent.keyboard('{ArrowRight}');
    await expect(within(tools).getByRole('button', {name: 'Move down'})).toHaveFocus();
    await userEvent.keyboard('{Escape}');
    await expect(block).toHaveFocus();
    await expect(canvas.queryByRole('toolbar')).toBeNull();
  }
};
