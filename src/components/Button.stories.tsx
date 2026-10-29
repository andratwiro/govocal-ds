import {Button} from './Button';
import type {Meta, StoryFn} from '@storybook/react-vite';

const meta: Meta<typeof Button> = {
  title: 'Button',
  component: Button,
  parameters: {
    layout: 'centered'
  },
  tags: ['autodocs']
};

export default meta;
type Story = StoryFn<typeof Button>;

export const Primary: Story = args => <Button {...args}>Publish</Button>;
Primary.args = {
  variant: 'primary',
  onPress: () => alert('Hello world!')
};

export const Secondary: Story = args => <Button {...args}>Share</Button>;
Secondary.args = {
  variant: 'secondary',
  onPress: () => alert('Hello world!')
};

export const Sizes: Story = args => (
  <div style={{display: 'flex', alignItems: 'center', gap: 12}}>
    <Button {...args} size={32}>
      Save
    </Button>
    <Button {...args} size={36}>
      Save
    </Button>
  </div>
);
Sizes.args = {
  variant: 'primary',
  onPress: () => alert('Hello world!')
};

export const WithMenu: Story = args => (
  <Button {...args} hasMenu>
    Publish
  </Button>
);
WithMenu.args = {
  variant: 'primary',
  onPress: () => alert('Hello world!')
};

export const Disabled: Story = args => <Button {...args}>Save</Button>;
Disabled.args = {
  variant: 'primary',
  isDisabled: true
};

export const Pending: Story = args => <Button {...args}>Save</Button>;
Pending.args = {
  variant: 'primary',
  isPending: true
};

export const AllStates: Story = () => (
  <div style={{display: 'flex', flexDirection: 'column', gap: 16}}>
    {(['primary', 'secondary'] as const).map(variant => (
      <div key={variant} style={{display: 'flex', alignItems: 'center', gap: 12}}>
        {([32, 36] as const).map(size => (
          <div key={size} style={{display: 'flex', gap: 8}}>
            <Button variant={variant} size={size} onPress={() => {}}>
              Save
            </Button>
            <Button variant={variant} size={size} isDisabled>
              Save
            </Button>
            <Button variant={variant} size={size} isPending>
              Save
            </Button>
          </div>
        ))}
      </div>
    ))}
  </div>
);
