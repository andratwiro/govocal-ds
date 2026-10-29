import {useState} from 'react';
import {DialogTrigger} from 'react-aria-components';
import {expect, userEvent, waitFor, within} from 'storybook/test';
import {Button} from '../Button';
import {FileList, type FileListItemData} from './FileList';
import {DropZone} from './DropZone';
import {Modal} from './Modal';
import type {Meta, StoryObj} from '@storybook/react-vite';

const meta: Meta<typeof FileList> = {
  title: 'Components/Data display/File list',
  component: FileList,
  tags: ['autodocs', 'not-in-figma'],
  parameters: {layout: 'padded'}
};

export default meta;
type Story = StoryObj<typeof FileList>;

const files: FileListItemData[] = [
  {id: '1', name: 'consultation-summary.pdf', meta: 'PDF · 340 KB', url: '#'},
  {id: '2', name: 'street.webp', meta: 'JPG · 1.2 MB', url: '#'},
  {id: '3', name: 'budget-breakdown.xlsx', meta: 'XLSX · 58 KB', url: '#'}
];

export const Default: Story = {
  args: {'aria-label': 'Attachments', items: files, onDelete: () => {}}
};

export const Empty: Story = {
  args: {'aria-label': 'Attachments', items: []}
};

export const WithAddButton: Story = {
  name: 'With footer',
  args: {
    'aria-label': 'Attachments',
    items: files.slice(0, 1),
    onDelete: () => {},
    footer: (
      <Button variant="secondary" size={32}>
        Add a file
      </Button>
    )
  }
};

/** Deleting one file after another, the page's handler reading its own list (`items.filter(…)`): each Delete
 * removes its file, however many came before it. */
export const Deleting: Story = {
  render: function Deleting() {
    const [items, setItems] = useState(files);
    return <FileList aria-label="Attachments" items={items} onDelete={item => setItems(items.filter(f => f.id !== item.id))} />;
  }
};

/** The Attachments dialog: a compact Drop zone, the list, Done (the prototype's `#pj-attachdlg`). */
function AttachmentsModal() {
  const [items, setItems] = useState<FileListItemData[]>(files.slice(0, 2));
  return (
    <Modal title="Attachments" footer={<Button variant="secondary" slot="close">Done</Button>}>
      <DropZone density="compact" acceptedFileTypes={['*']}>
        Drop a file here or browse
      </DropZone>
      <div style={{marginTop: 16}}>
        <FileList
          aria-label="Attachments"
          items={items}
          onDelete={item => setItems(current => current.filter(f => f.id !== item.id))}
        />
      </div>
    </Modal>
  );
}

export const InADialog: Story = {
  name: 'In a dialog',
  render: () => (
    <DialogTrigger defaultOpen>
      <Button variant="secondary">Attachments</Button>
      <AttachmentsModal />
    </DialogTrigger>
  ),
  parameters: {docs: {story: {inline: false, iframeHeight: 520}}}
};

/** The keyboard: Tab reaches the list on its first row, ↓ and ↑ move between rows, → and ← move between a row's
 * links, Enter follows the focused link (here Delete). */
export const Keyboard: Story = {
  render: function Keyboard() {
    const [items, setItems] = useState(files);
    return <FileList aria-label="Attachments" items={items} onDelete={item => setItems(items.filter(f => f.id !== item.id))} />;
  },
  play: async ({canvasElement}) => {
    const canvas = within(canvasElement);
    await userEvent.tab();
    await expect(canvas.getByRole('row', {name: /consultation-summary\.pdf/})).toHaveFocus();
    await userEvent.keyboard('{ArrowDown}');
    const row = canvas.getByRole('row', {name: /street\.webp/});
    await expect(row).toHaveFocus();
    await userEvent.keyboard('{ArrowRight}');
    await expect(within(row).getByRole('link', {name: 'View'})).toHaveFocus();
    await userEvent.keyboard('{ArrowRight}');
    await expect(within(row).getByRole('link', {name: 'Delete'})).toHaveFocus();
    await userEvent.keyboard('{Enter}');
    await waitFor(() => expect(canvas.queryByRole('row', {name: /street\.webp/})).toBeNull());
    await expect(canvas.getAllByRole('row')).toHaveLength(2);
  }
};
