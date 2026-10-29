import {Link} from './Link';
import {Plus} from 'lucide-react';
import type {Meta, StoryFn} from '@storybook/react-vite';

const meta: Meta<typeof Link> = {
  component: Link,
  parameters: {
    layout: 'centered'
  },
  tags: ['autodocs'],
  argTypes: {
    size: {control: 'radio', options: [undefined, 'small', 'medium']}
  }
};

export default meta;
type Story = StoryFn<typeof Link>;

export const Example: Story = args => <Link {...args}>How it works</Link>;

Example.args = {
  href: '#',
  size: 'medium'
};

/** The prototype's tertiary: small in rows and cards, medium for a section's action, inline in a sentence. */
export const AllStates: StoryFn<typeof Link> = () => (
  <div style={{display: 'flex', flexDirection: 'column', gap: 20, alignItems: 'flex-start', font: 'var(--gv-type-ui)'}}>
    <div style={{display: 'flex', gap: 24, alignItems: 'center'}}>
      <Link href="#" size="small">
        Make default
      </Link>
      <Link href="#" size="small">
        <Plus /> Add tag
      </Link>
      <Link href="#" size="small" isDisabled>
        Copy to phase
      </Link>
    </div>
    <div style={{display: 'flex', gap: 24, alignItems: 'center'}}>
      <Link href="#" size="medium">
        <Plus /> New phase
      </Link>
      <Link href="#" size="medium">
        Expand all
      </Link>
    </div>
    <p style={{margin: 0, color: 'var(--gv-text-secondary)'}}>
      Residents see this page once you publish. <Link href="#">Preview it</Link> first.
    </p>
  </div>
);
