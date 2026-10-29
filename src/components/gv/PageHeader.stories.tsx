import type {Meta, StoryObj} from '@storybook/react-vite';
import {Plus} from 'lucide-react';
import {PageHeader} from './PageHeader';
import {Breadcrumbs} from './Breadcrumbs';
import {Button} from '../Button';

const meta: Meta<typeof PageHeader> = {
  title: 'Components/Layout & containers/Page header',
  component: PageHeader,
  tags: ['autodocs', 'not-in-figma'],
  parameters: {layout: 'padded'},
  decorators: [Story => <div style={{maxWidth: 960}}><Story /></div>]
};
export default meta;
type Story = StoryObj<typeof PageHeader>;

/** A top-level page: its title, its action at the row's end, a line about it. */
export const Default: Story = {
  args: {
    title: 'Reporting',
    description: 'Customise your report and share it with internal stakeholders or the community as a web link or a PDF.',
    actions: <Button size={32}><Plus aria-hidden size={16} />Create a report</Button>
  }
};

/** A sub-page: the trail back to its parent above the title. */
export const WithBreadcrumbs: Story = {
  name: 'With breadcrumbs',
  args: {
    title: 'Public API tokens',
    description: 'Tokens let other tools read this platform\'s data.',
    breadcrumbs: <Breadcrumbs items={[{key: 'tools', label: 'Tools', href: '#tools'}, {key: 'tokens', label: 'Public API tokens'}]} />,
    actions: <Button size={32}>Create token</Button>
  }
};

/** The title alone. */
export const TitleOnly: Story = {name: 'Title only', args: {title: 'Projects'}};
