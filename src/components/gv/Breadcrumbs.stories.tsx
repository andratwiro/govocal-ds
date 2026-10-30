import {Breadcrumbs} from './Breadcrumbs';
import type {Meta, StoryObj} from '@storybook/react-vite';
import {useState} from 'react';
import {expect, userEvent, within} from 'storybook/test';
import {Button} from '../Button';

const meta: Meta<typeof Breadcrumbs> = {
  title: 'Components/Navigation/Breadcrumbs',
  component: Breadcrumbs,
  parameters: {
    layout: 'centered',
    design: {
      type: 'figma',
      url: 'https://www.figma.com/design/OkMTJrzoV6em7gkqribtjA/Go-Vocal-Design-System?node-id=14-875'
    }
  },
  tags: ['autodocs', 'status:candidate']
};

export default meta;
type Story = StoryObj<typeof Breadcrumbs>;

export const AllVariants: Story = {
  render: () => (
    <div style={{display: 'flex', flexDirection: 'column', gap: 24}}>
      <Breadcrumbs variant="default" items={[{key: 'root', label: 'Projects', href: '#'}, {key: 'cur', label: 'Green Corridors for Riverside'}]} />
      <Breadcrumbs
        variant="editor"
        status="draft"
        items={[{key: 'root', label: 'Green Corridors for Riverside', href: '#'}, {key: 'cur', label: 'Collect ideas'}]}
      />
      <Breadcrumbs
        variant="editor"
        status="live"
        items={[{key: 'root', label: 'Green Corridors for Riverside', href: '#'}, {key: 'cur', label: 'Collect ideas'}]}
      />
    </div>
  )
};

export const Project: Story = {
  args: {
    variant: 'default',
    items: [
      {key: 'root', label: 'Projects', href: '#'},
      {key: 'cur', label: 'Green Corridors for Riverside'}
    ]
  }
};

export const PhaseDraft: Story = {
  name: 'Phase · Draft',
  args: {
    variant: 'editor',
    status: 'draft',
    items: [
      {key: 'root', label: 'Green Corridors for Riverside', href: '#'},
      {key: 'cur', label: 'Collect ideas'}
    ]
  }
};

export const PhaseLive: Story = {
  name: 'Phase · Live',
  args: {
    variant: 'editor',
    status: 'live',
    items: [
      {key: 'root', label: 'Green Corridors for Riverside', href: '#'},
      {key: 'cur', label: 'Collect ideas'}
    ]
  }
};

/** The keyboard, proved by this story's play function (the Interactions panel): Tab reaches each crumb that leads
 * somewhere and skips the current page; Enter follows a crumb. */
export const Keyboard: Story = {
  render: function KeyboardDemo() {
    const [said, setSaid] = useState('');
    return (
      <div style={{display: 'grid', gap: 12, justifyItems: 'start'}}>
        <Breadcrumbs items={[
          {key: 'root', label: 'Projects', onPress: () => setSaid('Went to Projects')},
          {key: 'cur', label: 'Green Corridors for Riverside'}
        ]} />
        <Button variant="secondary">Edit project</Button>
        <output>{said}</output>
      </div>
    );
  },
  play: async ({canvasElement}) => {
    const canvas = within(canvasElement);
    // React Aria draws the crumbs a moment after the trail: wait for them before Tab.
    const projects = await canvas.findByRole('link', {name: 'Projects'});
    await userEvent.tab();
    await expect(projects).toHaveFocus();
    await expect(canvas.getByText('Green Corridors for Riverside')).toHaveAttribute('aria-current', 'page');
    await userEvent.tab();
    await expect(canvas.getByRole('button', {name: 'Edit project'})).toHaveFocus();
    await userEvent.tab({shift: true});
    await expect(projects).toHaveFocus();
    await userEvent.keyboard('{Enter}');
    await expect(canvas.getByText('Went to Projects')).toBeInTheDocument();
  }
};
