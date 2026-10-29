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
    <VolunteeringRow variant="build" title="Tree-planting weekends" volunteerCount={0} />
    <VolunteeringRow variant="build" title="Photograph the park" volunteerCount={4} />
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
      variant="build"
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
          variant="build"
          title="Tree-planting weekends"
          volunteerCount={0}
          onEdit={() => {}}
          onDelete={() => {}}
        />
        <VolunteeringRow
          variant="build"
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
