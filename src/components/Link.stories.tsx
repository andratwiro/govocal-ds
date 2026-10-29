import {Link} from './Link';
import type {Meta, StoryFn} from '@storybook/react-vite';

const meta: Meta<typeof Link> = {
  component: Link,
  parameters: {
    layout: 'centered'
  },
  tags: ['autodocs']
};

export default meta;
type Story = StoryFn<typeof Link>;

export const Example: Story = args => <Link {...args}>The missing link</Link>;

Example.args = {
  href: 'https://www.imdb.com/title/tt6348138/',
  target: '_blank'
};

export const AllStates: StoryFn<typeof Link> = () => (
  <div style={{display: 'flex', gap: 24}}>
    <Link href="#">See in the prototype</Link>
    <Link href="#" isDisabled>
      Make default
    </Link>
  </div>
);
