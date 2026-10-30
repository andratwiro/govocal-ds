import {useEffect, type ComponentType} from 'react';
import {expect, userEvent, waitFor, within} from 'storybook/test';
import {Toast, ToastRegion, queue, toast} from '../Toast';
import {Button} from '../Button';
import type {Meta, StoryObj} from '@storybook/react-vite';

interface ToastStoryArgs {
  title: string;
  description?: string;
  action?: string;
  timeout?: number;
  buttonLabel: string;
}

const meta: Meta<ToastStoryArgs> = {
  title: 'Components/Status & feedback/Toast',
  // The docs and the manifest read Toast's and ToastRegion's props; the stories' own args only drive Example.
  component: Toast as unknown as ComponentType<ToastStoryArgs>,
  subcomponents: {ToastRegion},
  parameters: {
    layout: 'centered'
  },
  tags: ['autodocs', 'not-in-figma'],
  argTypes: {
    title: {
      control: 'text',
      description: 'The title of the toast.'
    },
    description: {
      control: 'text',
      description: 'Optional description text.'
    },
    timeout: {
      control: 'number',
      description: 'Auto-dismiss timeout in milliseconds.'
    },
    action: {
      control: 'text',
      description: 'Optional text action under the words, e.g. "Undo". Pressing it closes the toast, then calls onAction.'
    },
    buttonLabel: {
      control: 'text',
      description: 'Label for the trigger button.'
    }
  },
  args: {
    title: '"Green Corridors for Riverside" deleted',
    description: '',
    action: 'Undo',
    buttonLabel: 'Show toast'
  }
};

export default meta;
type Story = StoryObj<ToastStoryArgs>;

/** The three toasts the prototype shows: a confirmation, a one-liner, and an undo. */
export const AllVariants: Story = {
  render: () => {
    useEffect(() => {
      queue.clear(); // the queue is global: start this story from an empty one
      const keys = [
        queue.add({title: 'Idea restored', icon: null}),
        queue.add({
          title: '"Green Corridors for Riverside" deleted',
          action: 'Undo',
          onAction: () => queue.add({title: 'Project restored', icon: null}, {timeout: 5000})
        }),
        queue.add({title: 'Your project is live', description: 'Public · anyone can take part.'})
      ];
      return () => keys.forEach(key => queue.close(key));
    }, []);
    return (
      <>
        <ToastRegion />
        <div style={{display: 'flex', gap: 12}}>
          <Button onPress={() => toast('Your project is live', 'Public · anyone can take part.')}>
            Publish now
          </Button>
          <Button
            variant="secondary"
            onPress={() =>
              toast('Idea archived', '"Shade sails over the Lagoon playground" moved to the archive.', {
                action: 'Undo',
                onAction: () => toast('Idea restored', undefined, {icon: null})
              })
            }>
            Archive idea
          </Button>
        </div>
      </>
    );
  }
};

/** The prototype's undo snackbar, shown on load: check icon, title, body, Undo and ×. */
export const WithUndo: Story = {
  name: 'With undo',
  render: () => {
    useEffect(() => {
      queue.clear(); // the queue is global: start this story from an empty one
      const key = queue.add({
        title: 'Idea archived',
        description: '"Shade sails over the Lagoon playground" moved to the archive.',
        action: 'Undo',
        onAction: () => queue.add({title: 'Idea restored', icon: null}, {timeout: 5000})
      });
      return () => queue.close(key);
    }, []);
    return <ToastRegion />;
  }
};

/** The one-liner: a Toast with no body and no action, same shell as the rest. */
export const Simple: Story = {
  render: () => {
    useEffect(() => {
      queue.clear();
      const key = queue.add({title: 'Idea restored', icon: null});
      return () => queue.close(key);
    }, []);
    return <ToastRegion />;
  }
};

/** Two toasts at once, newest on top. */
export const Stacked: Story = {
  render: () => {
    useEffect(() => {
      queue.clear();
      const keys = [
        queue.add({title: 'Idea restored', icon: null}),
        queue.add({
          title: '"Green Corridors for Riverside" deleted',
          action: 'Undo',
          onAction: () => {}
        })
      ];
      return () => keys.forEach(key => queue.close(key));
    }, []);
    return <ToastRegion />;
  }
};

export const Example: Story = {
  render: args => (
    <>
      <ToastRegion />
      <Button
        onPress={() =>
          toast(args.title, args.description || undefined, {
            action: args.action || undefined,
            ...(args.timeout != null ? {timeout: args.timeout} : {})
          })
        }>
        {args.buttonLabel}
      </Button>
    </>
  ),
  parameters: {
    docs: {
      source: {
        code: `import {AppProvider, toast} from 'govocal-ds';

// Once, at the app's root (it renders the one ToastRegion):
<AppProvider locale="en-GB"><App /></AppProvider>

// Anywhere after an action (5 seconds unless timeout says otherwise; 0 keeps it):
toast('"Green Corridors for Riverside" deleted', undefined, {action: 'Undo', onAction: restore});`
      }
    }
  }
};

/** The keyboard: Enter on "Archive idea" shows a toast with Undo; Tab reaches its Undo and ×; Enter on Undo takes the
 * change back (a plain "Idea restored" toast), Enter on × closes that one. Both stay until closed (`timeout: 0`). */
export const Keyboard: Story = {
  render: () => {
    useEffect(() => {
      queue.clear();
      return () => queue.clear();
    }, []);
    return (
      <>
        <ToastRegion />
        <Button variant="secondary" onPress={() => toast('Idea archived', 'Moved to the archive.', {
          action: 'Undo',
          timeout: 0,
          onAction: () => toast('Idea restored', undefined, {icon: null, timeout: 0})
        })}>
          Archive idea
        </Button>
      </>
    );
  },
  play: async ({canvasElement}) => {
    const canvas = within(canvasElement);
    const page = within(canvasElement.ownerDocument.body);
    const tabTo = async (name: string) => {
      for (let i = 0; i < 6 && canvasElement.ownerDocument.activeElement !== page.queryByRole('button', {name}); i++) {
        await userEvent.tab();
      }
      await expect(page.getByRole('button', {name})).toHaveFocus();
    };
    await userEvent.tab();
    await expect(canvas.getByRole('button', {name: 'Archive idea'})).toHaveFocus();
    await userEvent.keyboard('{Enter}');
    await waitFor(() => expect(page.getByText('Idea archived')).toBeVisible());
    await tabTo('Undo');
    await userEvent.keyboard('{Enter}');
    await waitFor(() => expect(page.queryByText('Idea archived')).toBeNull());
    await waitFor(() => expect(page.getByText('Idea restored')).toBeVisible());
    await tabTo('Close');
    await userEvent.keyboard('{Enter}');
    await waitFor(() => expect(page.queryByText('Idea restored')).toBeNull());
  }
};
