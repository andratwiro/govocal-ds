import {useEffect} from 'react';
import {MyToastRegion, queue} from './Toast';
import {Button} from './Button';
import type {Meta, StoryObj} from '@storybook/react-vite';

interface ToastStoryArgs {
  title: string;
  description?: string;
  action?: string;
  timeout?: number;
  buttonLabel: string;
}

const meta: Meta<ToastStoryArgs> = {
  title: 'Toast',
  parameters: {
    layout: 'centered'
  },
  tags: ['autodocs'],
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

/** The three toasts the prototype shows, open on load: confirmation, delete with Undo, and no icon. */
export const AllStates: Story = {
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
        <MyToastRegion />
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
    return <MyToastRegion />;
  }
};

export const Example: Story = {
  render: args => (
    <>
      <MyToastRegion />
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
        transform: () => {
          return `
const queue = new ToastQueue<MyToastContent>();

function MyToast(props: ToastProps<MyToastContent>) {
  return <Toast {...props} />;
}

function MyToastRegion() {
  return (
    <ToastRegion queue={queue}>
      {({toast}) => (
        <MyToast toast={toast}>
          {toast.content.icon !== null && (
            <span className="toast-icon" aria-hidden="true">{toast.content.icon ?? <Check strokeWidth={2.6} />}</span>
          )}
          <ToastContent>
            <Text slot="title">{toast.content.title}</Text>
            {toast.content.description && (
              <Text slot="description">{toast.content.description}</Text>
            )}
            {toast.content.action && (
              <Button className="toast-action" onPress={() => {
                queue.close(toast.key);
                toast.content.onAction?.();
              }}>
                {toast.content.action}
              </Button>
            )}
          </ToastContent>
          <Button slot="close" aria-label="Close" variant="quiet">
            <X size={16} />
          </Button>
        </MyToast>
      )}
    </ToastRegion>
  );
}

<>
  <MyToastRegion />
  <Button onPress={() => queue.add(
    {title: args.title, description: args.description, action: 'Undo', onAction: () => restore()},
    args.timeout ? {timeout: args.timeout} : undefined
  )}>
    {args.buttonLabel}
  </Button>
</>`;
        }
      }
    }
  }
};
