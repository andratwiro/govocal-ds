import {Modal} from './Modal';
import {Dialog, DialogTrigger} from './Dialog';
import {TextField} from './TextField';
import {Button} from './Button';
import {Heading} from './Content';
import type {Meta, StoryFn} from '@storybook/react-vite';

const meta: Meta<typeof Modal> = {
  component: Modal,
  parameters: {
    layout: 'centered'
  },
  tags: ['autodocs']
};

export default meta;
type Story = StoryFn<typeof Modal>;

export const Example: Story = args => (
  <DialogTrigger>
    <Button>Sign up…</Button>
    <Modal {...args}>
      <Dialog>
        <form>
          <Heading slot="title">Sign up</Heading>
          <TextField autoFocus label="First Name" placeholder="Enter your first name" />
          <TextField label="Last Name" placeholder="Enter your last name" />
          <Button slot="close">Submit</Button>
        </form>
      </Dialog>
    </Modal>
  </DialogTrigger>
);
