import {Button} from '../Button';
import {Plus} from 'lucide-react';
import type {Meta, StoryFn} from '@storybook/react-vite';

const meta: Meta<typeof Button> = {
  title: 'Components/Actions/Button',
  component: Button,
  parameters: {
    layout: 'centered',
    design: {
      type: 'figma',
      url: 'https://www.figma.com/design/OkMTJrzoV6em7gkqribtjA/Go-Vocal-Design-System?node-id=14-877'
    }
  },
  tags: ['autodocs']
};

export default meta;
type Story = StoryFn<typeof Button>;

/** Figma's Style × Size × Menu × State, plus pending; the quiet row is Not in Figma. */
export const AllStates: Story = () => (
  <div style={{display: 'flex', flexDirection: 'column', gap: 16}}>
    {(['primary', 'secondary'] as const).map(variant => (
      <div key={variant} style={{display: 'flex', alignItems: 'center', gap: 24}}>
        {([32, 36] as const).map(size => (
          <div key={size} style={{display: 'flex', alignItems: 'center', gap: 8}}>
            <Button variant={variant} size={size} onPress={() => {}}>
              Save
            </Button>
            <Button variant={variant} size={size} hasMenu onPress={() => {}}>
              {variant === 'primary' ? 'Publish' : 'Share'}
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
    <div style={{display: 'flex', alignItems: 'center', gap: 8}}>
      <Button variant="quiet" size={32} onPress={() => {}}>
        Show all
      </Button>
      <Button variant="quiet" size={32} onPress={() => {}}>
        <Plus aria-hidden size={16} />
        Add a manager
      </Button>
      <Button variant="quiet" size={32} isDisabled>
        Show all
      </Button>
    </div>
    <div style={{display: 'flex', alignItems: 'center', gap: 8}}>
      <Button variant="primary" tone="danger" onPress={() => {}}>
        Reset project
      </Button>
      <Button variant="primary" tone="danger" isDisabled>
        Reset project
      </Button>
      <Button variant="quiet" tone="danger" size={32} onPress={() => {}}>
        Delete
      </Button>
      <Button variant="quiet" tone="danger" size={32} isDisabled>
        Delete
      </Button>
    </div>
  </div>
);
AllStates.storyName = 'All Variants';

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
WithMenu.storyName = 'With menu';

export const Disabled: Story = args => <Button {...args}>Save</Button>;
Disabled.args = {
  variant: 'primary',
  isDisabled: true
};

/** Not in Figma: the prototype's tertiary text action. */
export const Quiet: Story = args => <Button {...args}>Edit</Button>;
Quiet.args = {
  variant: 'quiet',
  onPress: () => alert('Hello world!')
};

/**
 * Not in Figma: `tone="danger"` on the primary variant — a destructive confirm, e.g. the Alert
 * dialog's "Reset data" / "Delete" action.
 */
export const Danger: Story = args => <Button {...args}>Reset project</Button>;
Danger.args = {
  variant: 'primary',
  tone: 'danger',
  onPress: () => alert('Hello world!')
};

/** Not in Figma: `tone="danger"` on the quiet variant — an inline Delete in a row or toolbar. */
export const QuietDanger: Story = args => <Button {...args}>Delete</Button>;
QuietDanger.args = {
  variant: 'quiet',
  tone: 'danger',
  size: 32,
  onPress: () => alert('Hello world!')
};
QuietDanger.storyName = 'Quiet · danger';

export const Pending: Story = args => <Button {...args}>Save</Button>;
Pending.args = {
  variant: 'primary',
  isPending: true
};

/** Not in Figma as a Button (Figma's icon-only control is Icon button): square, radius 8. */
export const IconPlusTextVsIconOnly: Story = () => (
  <div style={{display: 'flex', alignItems: 'center', gap: 12}}>
    <Button variant="primary" onPress={() => {}}>
      <Plus aria-hidden size={16} />
      New project
    </Button>
    <Button variant="secondary" aria-label="New project" onPress={() => {}}>
      <Plus aria-hidden size={16} />
    </Button>
  </div>
);
IconPlusTextVsIconOnly.storyName = 'Icon and text, icon only';
