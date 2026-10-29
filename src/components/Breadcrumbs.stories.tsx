import {Breadcrumbs, Breadcrumb} from './Breadcrumbs';
import {Link} from './Link';
import type {Meta, StoryFn} from '@storybook/react-vite';

const meta: Meta<typeof Breadcrumbs> = {
  component: Breadcrumbs,
  parameters: {
    layout: 'centered'
  },
  tags: ['autodocs']
};

export default meta;
type Story = StoryFn<typeof Breadcrumbs>;

export const Example: Story = args => (
  <Breadcrumbs {...args}>
    <Breadcrumb href="/">Home</Breadcrumb>
    <Breadcrumb href="/react-aria/">React Aria</Breadcrumb>
    <Breadcrumb>Breadcrumbs</Breadcrumb>
  </Breadcrumbs>
);
