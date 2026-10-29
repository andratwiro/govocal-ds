import {Menu, MenuTrigger, MenuItem, SubmenuTrigger} from './Menu';
import {Button} from './Button';
import type {Meta, StoryFn} from '@storybook/react-vite';

const meta: Meta<typeof Menu> = {
  component: Menu,
  parameters: {
    layout: 'centered'
  },
  tags: ['autodocs']
};

export default meta;
type Story = StoryFn<typeof Menu>;

export const Example: Story = args => (
  <MenuTrigger>
    <Button>Edit</Button>
    <Menu {...args}>
      <MenuItem>Favorite</MenuItem>
      <MenuItem>Edit</MenuItem>
      <MenuItem>Delete</MenuItem>
      <SubmenuTrigger>
        <MenuItem>Share</MenuItem>
        <Menu>
          <MenuItem>SMS</MenuItem>
          <MenuItem>Email</MenuItem>
        </Menu>
      </SubmenuTrigger>
    </Menu>
  </MenuTrigger>
);

Example.args = {};

export const AllStates: StoryFn<typeof Menu> = () => (
  <MenuTrigger isOpen>
    <Button>Phase actions</Button>
    <Menu>
      <MenuItem>Duplicate phase</MenuItem>
      <MenuItem>Move to timeline</MenuItem>
      <SubmenuTrigger>
        <MenuItem>Share</MenuItem>
        <Menu>
          <MenuItem>Copy link</MenuItem>
          <MenuItem>Invite by email</MenuItem>
        </Menu>
      </SubmenuTrigger>
      <MenuItem isDisabled>Archive</MenuItem>
      <MenuItem>Delete phase</MenuItem>
    </Menu>
  </MenuTrigger>
);
