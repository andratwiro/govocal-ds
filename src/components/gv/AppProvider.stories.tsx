import type {Meta, StoryObj} from '@storybook/react-vite';
import {Archive} from 'lucide-react';
import {AppProvider} from './AppProvider';
import {Button} from '../Button';
import {ToastRegion, toast} from '../Toast';

const meta: Meta<typeof AppProvider> = {
  title: 'Components/Layout & containers/App provider',
  component: AppProvider,
  tags: ['autodocs', 'not-in-figma', 'status:draft'],
  parameters: {layout: 'padded'}
};
export default meta;
type Story = StoryObj<typeof AppProvider>;

/** A page inside the app: it calls `toast()` and mounts nothing. Its icon is drawn at 1.75 without saying so. */
function Page() {
  return (
    <Button variant="secondary" onPress={() => toast('Idea archived', '"Shade sails over the playground" moved to the archive.',
      {action: 'Undo', onAction: () => toast('Idea restored', undefined, {icon: null})})}>
      <Archive aria-hidden size={16} />Archive idea
    </Button>
  );
}

/** The app wrapped once: Archive idea shows a toast through `toast()`, at the window's bottom end. */
export const Default: Story = {
  args: {locale: 'en-GB'},
  render: args => <AppProvider {...args}><Page /></AppProvider>
};

/** A page that still mounts its own `ToastRegion`: inside the App provider it draws nothing, so the toast shows once. */
export const WithAPagesOwnRegion: Story = {
  name: 'With a page\'s own region',
  args: {locale: 'en-GB'},
  render: args => <AppProvider {...args}><Page /><ToastRegion /></AppProvider>
};
