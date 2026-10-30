import {useState} from 'react';
import type {Meta, StoryObj} from '@storybook/react-vite';
import {expect, userEvent, waitFor, within} from 'storybook/test';
import {ChevronDown} from 'lucide-react';
import {SortableList} from './SortableList';
import {IconButton} from './IconButton';
import {Text} from './Text';

const meta: Meta<typeof SortableList> = {
  title: 'Components/Tables & lists/Sortable list',
  component: SortableList,
  tags: ['autodocs', 'not-in-figma', 'status:draft'],
  parameters: {layout: 'padded'},
  decorators: [Story => <div style={{maxInlineSize: 360}}><Story /></div>]
};
export default meta;
type Story = StoryObj<typeof SortableList>;

type Figure = {id: string; value: string; label: string};
const FIGURES: Figure[] = [
  {id: 'participants', value: '3,600', label: 'Participants'},
  {id: 'first', value: '61%', label: 'Took part for the first time'},
  {id: 'projects', value: '6', label: 'Projects'},
  {id: 'anonymous', value: '540', label: 'Anonymous submissions'}
];

const Row = ({f}: {f: Figure}) => (
  <>
    <Text kind="ui" isStrong color="primary">{f.value}</Text>
    <Text kind="ui" color="secondary">{f.label}</Text>
  </>
);

/** A report's key figures, in their order: drag a handle, or use the keyboard. */
export const Default: Story = {
  render: () => {
    const [items, setItems] = useState(FIGURES);
    return (
      <SortableList aria-label="Numbers" items={items} onReorder={setItems} itemLabel={f => `${f.value} ${f.label}`}>
        {f => <Row f={f} />}
      </SortableList>
    );
  }
};

/** Rows with a trailing control: a chevron that would open the row's fields. */
export const WithActions: Story = {
  name: 'With actions',
  render: () => {
    const [items, setItems] = useState(FIGURES);
    return (
      <SortableList aria-label="Numbers" items={items} onReorder={setItems} itemLabel={f => `${f.value} ${f.label}`}>
        {f => (
          <>
            <Row f={f} />
            <IconButton aria-label={`Edit ${f.label}`} size={24} style={{marginInlineStart: 'auto'}}>
              <ChevronDown aria-hidden />
            </IconButton>
          </>
        )}
      </SortableList>
    );
  }
};

/** Off while the report generates: the handles do nothing. */
export const Disabled: Story = {
  render: () => (
    <SortableList aria-label="Numbers" items={FIGURES} onReorder={() => {}} itemLabel={f => `${f.value} ${f.label}`} isDisabled>
      {f => <Row f={f} />}
    </SortableList>
  )
};

/** Right to left: the handle at the start (the right). */
export const RightToLeft: Story = {name: 'Right to left', globals: {direction: 'rtl'}, render: Default.render};

/** Keyboard: Tab to the first handle, Enter picks it up, ↓ moves the drop line, Enter drops it there. */
export const Keyboard: Story = {
  render: Default.render,
  play: async ({canvasElement}) => {
    const canvas = within(canvasElement);
    const rows = () => canvas.getAllByRole('row').map(r => r.textContent);
    // React Aria draws the rows a moment after the list: wait for them.
    await canvas.findAllByRole('row');
    await expect(rows()[0]).toContain('Participants');
    const handle = canvas.getByRole('button', {name: 'Move 3,600 Participants'});
    handle.focus();
    await userEvent.keyboard('{Enter}');
    await userEvent.keyboard('{ArrowDown}');
    await userEvent.keyboard('{ArrowDown}');
    await userEvent.keyboard('{Enter}');
    await waitFor(() => expect(rows()[0]).toContain('Took part for the first time'));
  }
};
