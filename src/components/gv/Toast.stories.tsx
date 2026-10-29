import {useEffect} from 'react';
import {ToastRegion, queue} from '../Toast';
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
          <Button
            onPress={() =>
              queue.add({
                title: 'Your project is live',
                description: 'Public · anyone can take part.'
              })
            }>
            Publish now
          </Button>
          <Button
            variant="secondary"
            onPress={() =>
              queue.add({
                title: 'Idea archived',
                body: '"Shade sails over the Lagoon playground" moved to the archive.',
                action: 'Undo',
                onAction: () => queue.add({title: 'Idea restored', icon: null})
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
        body: '"Shade sails over the Lagoon playground" moved to the archive.',
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
          queue.add(
            {title: args.title, description: args.description, action: args.action || undefined},
            args.timeout ? {timeout: args.timeout} : undefined
          )
        }>
        {args.buttonLabel}
      </Button>
    </>
  ),
  parameters: {
    docs: {
      source: {
        code: `import {ToastRegion, queue} from 'src/components/Toast';

// Once per page, at its root:
<ToastRegion />

// Anywhere after an action:
queue.add({title: '"Green Corridors for Riverside" deleted', action: 'Undo', onAction: restore});`
      }
    }
  }
};
