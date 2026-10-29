import type {Meta, StoryObj} from '@storybook/react-vite';
import {expect, screen, userEvent, waitFor, within} from 'storybook/test';
import {useState, type ReactNode} from 'react';
import {DialogTrigger} from 'react-aria-components';
import {Button} from '../Button';
import {AlertDialog} from './AlertDialog';

const meta: Meta<typeof AlertDialog> = {
  title: 'Components/Overlays/Alert dialog',
  component: AlertDialog,
  tags: ['autodocs', 'not-in-figma'],
  parameters: {
    // Each open dialog gets its own frame on the docs page.
    docs: {story: {inline: false, iframeHeight: 420}}
  }
};
export default meta;
type Story = StoryObj<typeof AlertDialog>;

/** Story helper: a trigger button + the dialog, open on load. */
function Open({label, open = true, children}: {label: string; open?: boolean; children: ReactNode}) {
  return (
    <DialogTrigger defaultOpen={open}>
      <Button variant="secondary">{label}</Button>
      {children}
    </DialogTrigger>
  );
}

function ConfirmDialog() {
  return (
    <AlertDialog
      title="Download the results (PDF)"
      confirmLabel="Download PDF"
      onCancel={() => {}}
      onConfirm={() => {}}>
      <p>
        We'll build a shareable PDF with the participation snapshot and each phase's results — ready to send to your
        team or manager.
      </p>
    </AlertDialog>
  );
}

function DestructiveDialog({onCancel = () => {}, onConfirm = () => {}}: {onCancel?: () => void; onConfirm?: () => void}) {
  return (
    <AlertDialog
      tone="danger"
      title="Delete this group?"
      confirmLabel="Delete group"
      onCancel={onCancel}
      onConfirm={onConfirm}>
      <p>Managers in this group keep their account, but lose the permissions it grants. This can't be undone.</p>
    </AlertDialog>
  );
}

function TypeToConfirmDialog() {
  return (
    <AlertDialog
      tone="danger"
      title="Reset all participation data?"
      confirmLabel="Reset data"
      confirmText={{match: 'Reset'}}
      onCancel={() => {}}
      onConfirm={() => {}}>
      <p>
        This permanently deletes all inputs, comments, votes, reactions, survey and poll responses, volunteers and
        event registrants from this project. This can't be undone.
      </p>
    </AlertDialog>
  );
}

function ImpactListDialog() {
  return (
    <AlertDialog
      title="Edit form"
      confirmLabel="Yes, continue"
      labels={{cancel: 'No, cancel'}}
      onCancel={() => {}}
      onConfirm={() => {}}
      impact={[
        {tone: 'danger', title: 'Delete a question', description: "You'll lose response data linked to that question in all phases using the same form"},
        {tone: 'warning', title: 'Add or reorder questions', description: 'Your response data may be inaccurate'},
        {tone: 'success', title: 'Edit text', description: "Fixing a typo? It won't affect your response data"}
      ]}>
      <p>Ideation, voting, and budgeting phases in this project share a single input form. Any edits you make here will apply to all of them.</p>
    </AlertDialog>
  );
}

/** One trigger per dialog: press one to open it. The line under them says how Destructive last closed: Cancel, Esc
 * and a click outside call `onCancel`, the confirm calls `onConfirm`; both close it. */
export const AllVariants: Story = {
  parameters: {docs: {story: {inline: true}}},
  render: function AllVariants() {
    const [said, setSaid] = useState('');
    return (
      <div style={{display: 'grid', gap: 'var(--gv-space-12)'}}>
        <div style={{display: 'flex', gap: 'var(--gv-space-8)', flexWrap: 'wrap'}}>
          <Open label="Confirm" open={false}><ConfirmDialog /></Open>
          <Open label="Destructive" open={false}>
            <DestructiveDialog onCancel={() => setSaid('onCancel')} onConfirm={() => setSaid('onConfirm')} />
          </Open>
          <Open label="Type to confirm" open={false}><TypeToConfirmDialog /></Open>
          <Open label="With impact list" open={false}><ImpactListDialog /></Open>
        </div>
        <output style={{font: 'var(--gv-type-small)', color: 'var(--gv-text-secondary)'}}>{said && `Last: ${said}`}</output>
      </div>
    );
  }
};

/** A plain confirm, no danger, no icon ("Download the results (PDF)"). */
export const Confirm: Story = {
  render: () => <Open label="Confirm"><ConfirmDialog /></Open>
};

/** `tone="danger"`: the warning icon, a danger confirm, and focus starts on Cancel. */
export const Destructive: Story = {
  render: () => <Open label="Destructive"><DestructiveDialog /></Open>
};

/** Loses data for good: the confirm stays disabled until the exact word is typed. */
export const TypeToConfirm: Story = {
  name: 'Type to confirm',
  render: () => <Open label="Type to confirm"><TypeToConfirmDialog /></Open>
};

/** Rows of consequences before the confirm (the Edit form warning). */
export const WithImpactList: Story = {
  name: 'With impact list',
  render: () => <Open label="With impact list"><ImpactListDialog /></Open>
};

/** The keyboard, proved by this story's play function (the Interactions panel): Enter on the button opens the dialog
 * with focus on the dialog itself; Tab reaches Cancel first, then the confirm, and stays inside; Enter on the confirm
 * closes it and puts focus back on the button. */
export const Keyboard: Story = {
  render: function KeyboardDemo() {
    const [said, setSaid] = useState('');
    return (
      <div style={{display: 'grid', gap: 'var(--gv-space-12)', justifyItems: 'start'}}>
        <DialogTrigger>
          <Button variant="secondary">Download results</Button>
          <AlertDialog title="Download the results (PDF)" confirmLabel="Download PDF"
            onCancel={() => setSaid('Cancelled')} onConfirm={() => setSaid('Downloading')}>
            <p>We'll build a shareable PDF with the participation snapshot and each phase's results.</p>
          </AlertDialog>
        </DialogTrigger>
        <output>{said}</output>
      </div>
    );
  },
  play: async ({canvasElement}) => {
    const canvas = within(canvasElement);
    const trigger = canvas.getByRole('button', {name: 'Download results'});
    await userEvent.tab();
    await expect(trigger).toHaveFocus();
    await userEvent.keyboard('{Enter}');
    const dialog = await screen.findByRole('alertdialog', {name: 'Download the results (PDF)'});
    await waitFor(() => expect(dialog).toHaveFocus());
    const cancel = within(dialog).getByRole('button', {name: 'Cancel'});
    const confirm = within(dialog).getByRole('button', {name: 'Download PDF'});
    await userEvent.tab();
    await expect(cancel).toHaveFocus();
    await userEvent.tab();
    await expect(confirm).toHaveFocus();
    await userEvent.tab();
    await expect(cancel).toHaveFocus();
    await userEvent.tab({shift: true});
    await expect(confirm).toHaveFocus();
    await userEvent.keyboard('{Enter}');
    await waitFor(() => expect(screen.queryByRole('alertdialog')).toBeNull());
    await expect(canvas.getByText('Downloading')).toBeInTheDocument();
    await waitFor(() => expect(trigger).toHaveFocus());
  }
};
