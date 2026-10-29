import {MyToastRegion, queue} from './Toast';
import {Button} from './Button';
import type {Meta, StoryObj} from '@storybook/react-vite';

interface ToastStoryArgs {
  title: string;
  description?: string;
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
    buttonLabel: {
      control: 'text',
      description: 'Label for the trigger button.'
    }
  },
  args: {
    title: '"Green Corridors for Riverside" deleted',
    description: '',
    buttonLabel: 'Show toast'
  }
};

export default meta;
type Story = StoryObj<ToastStoryArgs>;

export const AllStates: Story = {
  render: () => (
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
          onPress={() =>
            queue.add({
              title: '"Green Corridors for Riverside" deleted',
              description: undefined
            })
          }>
          Delete idea
        </Button>
      </div>
    </>
  )
};

export const Example: Story = {
  render: args => (
    <>
      <MyToastRegion />
      <Button
        onPress={() =>
          queue.add(
            {title: args.title, description: args.description},
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
          <ToastContent>
            <Text slot="title">{toast.content.title}</Text>
            {toast.content.description && (
              <Text slot="description">{toast.content.description}</Text>
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
    {title: args.title, description: args.description},
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
