import {User} from 'lucide-react';
import {SectionLabel} from './SectionLabel';
import type {Meta, StoryObj} from '@storybook/react-vite';

const meta: Meta<typeof SectionLabel> = {
  title: 'Components/Layout & containers/Section label',
  component: SectionLabel,
  tags: ['autodocs'],
  parameters: {
    design: {
      type: 'figma',
      url: 'https://www.figma.com/design/OkMTJrzoV6em7gkqribtjA/Go-Vocal-Design-System?node-id=4-442'
    }
  },
  decorators: [Story => <div style={{width: 264}}><Story /></div>]
};

export default meta;
type Story = StoryObj<typeof SectionLabel>;

/** The places it labels: the rail's three sections, an Insights card's group, the Create report checklist. */
export const AllVariants: Story = {
  render: () => (
    <div style={{display: 'flex', flexDirection: 'column'}}>
      <SectionLabel>Timeline</SectionLabel>
      <SectionLabel>Spotlight</SectionLabel>
      <SectionLabel>Events</SectionLabel>
      <SectionLabel>Who is voting</SectionLabel>
      <SectionLabel>Project context</SectionLabel>
      <SectionLabel icon={<User aria-hidden />}>Who can participate</SectionLabel>
    </div>
  )
};

/** Figma's single variant: plain text, no heading. */
export const Default: Story = {
  args: {children: 'Timeline'}
};

/** `headingLevel` makes it a heading (here an h3) a screen reader can jump to; the look doesn't change. */
export const AsAHeading: Story = {
  name: 'As a heading',
  args: {children: 'Phases', headingLevel: 3}
};

/** A 16 icon before the words, as Access rights opens its choices. */
export const WithIcon: Story = {
  name: 'With icon',
  args: {children: 'Who can participate', icon: <User aria-hidden />, headingLevel: 3}
};
