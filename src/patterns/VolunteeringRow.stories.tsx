import {useState} from 'react';
import {expect, screen, userEvent, waitFor, within} from 'storybook/test';
import {VolunteeringRow} from './VolunteeringRow';
import {Download, List, Plus} from 'lucide-react';
import {Card} from '../components/gv/Card';
import type {Meta, StoryFn} from '@storybook/react-vite';

const meta: Meta<typeof VolunteeringRow> = {
  title: 'Patterns/Participation methods/Volunteering row',
  component: VolunteeringRow,
  parameters: {
    layout: 'centered',
    design: {
      type: 'figma',
      url: 'https://www.figma.com/design/OkMTJrzoV6em7gkqribtjA/Go-Vocal-Design-System?node-id=33-483'
    }
  },
  tags: ['autodocs']
};

export default meta;
type Story = StoryFn<typeof VolunteeringRow>;

export const AllVariants: Story = () => (
  <div style={{display: 'flex', flexDirection: 'column', width: 500}}>
    <VolunteeringRow
      title="Tree-planting weekends"
      description="Help plant shade trees along the park promenade."
      volunteerCount={18}
      percent={100}
    />
    <VolunteeringRow
      title="Photograph the park"
      description="Before-and-after shots for the final report."
      volunteerCount={4}
      percent={22}
      isLast
    />
    <div style={{height: 'var(--gv-space-24)'}} />
    <VolunteeringRow layout="build" title="Tree-planting weekends" volunteerCount={0} />
    <VolunteeringRow layout="build" title="Photograph the park" volunteerCount={4} />
  </div>
);

export const Default: Story = () => (
  <div style={{width: 500}}>
    <VolunteeringRow
      title="Tree-planting weekends"
      description="Help plant shade trees along the park promenade."
      volunteerCount={18}
      percent={100}
    />
  </div>
);

export const Last: Story = () => (
  <div style={{width: 500}}>
    <VolunteeringRow
      title="Photograph the park"
      description="Before-and-after shots for the final report."
      volunteerCount={4}
      percent={22}
      isLast
    />
  </div>
);

/** One sign-up reads "1 volunteer" (the prototype's singular). */
export const OneVolunteer: Story = () => (
  <div style={{width: 500}}>
    <VolunteeringRow
      title="Repaint the park benches"
      description="One Saturday morning, paint and brushes provided."
      volunteerCount={1}
      percent={5}
      isLast
    />
  </div>
);
OneVolunteer.storyName = 'One volunteer';

/**
 * Not in Figma (the prototype's Causes card): in a volunteering phase's Build tab each cause is a smaller row, the
 * title over how many signed up, with Edit and Delete at the end.
 */
export const Build: Story = () => (
  <div style={{width: 412}}>
    <VolunteeringRow
      layout="build"
      title="Tree-planting weekends"
      volunteerCount={0}
      onEdit={() => {}}
      onDelete={() => {}}
    />
  </div>
);
Build.tags = ['not-in-figma'];

/**
 * The Causes card in a volunteering phase's Build tab: its causes, Add a cause, and Download volunteers greyed until
 * someone signs up (its tooltip says why).
 */
export const BuildInACard: Story = () => (
  <div style={{width: 444}}>
    <Card
      title="Causes"
      pills={[{label: '2 causes'}]}
      iconActions={[
        {icon: List, label: 'Reorder causes', tooltip: 'Reorder'},
        {icon: Plus, label: 'Add a cause', tooltip: 'Add a cause'},
        {icon: Download, label: 'Download volunteers', isDisabled: true, tooltip: 'Nobody has signed up yet'}
      ]}>
      <div>
        <VolunteeringRow
          layout="build"
          title="Tree-planting weekends"
          volunteerCount={0}
          onEdit={() => {}}
          onDelete={() => {}}
        />
        <VolunteeringRow
          layout="build"
          title="Photograph the park"
          volunteerCount={0}
          onEdit={() => {}}
          onDelete={() => {}}
        />
      </div>
    </Card>
  </div>
);
BuildInACard.storyName = 'Build · in a card';
BuildInACard.tags = ['not-in-figma'];

/**
 * The keys a Build row takes: Tab reaches Edit, then Delete, each showing its tooltip; Enter or Space presses it. Its
 * play function proves the component page's keyboard table.
 */
export const Keyboard: Story = () => {
  const [said, setSaid] = useState('Nothing pressed yet');
  return (
    <div style={{width: 412}}>
      <VolunteeringRow layout="build" title="Photograph the park" volunteerCount={4}
        onEdit={() => setSaid('Edit pressed')} onDelete={() => setSaid('Delete pressed')} isLast />
      <span role="status">{said}</span>
    </div>
  );
};
Keyboard.tags = ['not-in-figma'];
Keyboard.play = async ({canvasElement}) => {
  const canvas = within(canvasElement);
  await userEvent.tab();
  const edit = canvas.getByRole('button', {name: 'Edit Photograph the park'});
  await expect(edit).toHaveFocus();
  await waitFor(() => expect(screen.getByRole('tooltip', {name: 'Edit'})).toBeVisible());
  await userEvent.keyboard('{Enter}');
  await expect(canvas.getByRole('status')).toHaveTextContent('Edit pressed');
  await userEvent.tab();
  await expect(canvas.getByRole('button', {name: 'Delete Photograph the park'})).toHaveFocus();
  await userEvent.keyboard(' ');
  await expect(canvas.getByRole('status')).toHaveTextContent('Delete pressed');
};
