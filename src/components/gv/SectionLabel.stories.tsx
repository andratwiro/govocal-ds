import {User} from 'lucide-react';
import {SectionLabel} from './SectionLabel';
import type {Meta, StoryObj} from '@storybook/react-vite';

const meta: Meta<typeof SectionLabel> = {
  title: 'Components/Text/Section label',
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

/** Figma's only variant: plain text, not a heading, no icon. The icon below is code's. */
export const Default: Story = {
  args: {children: 'Timeline'}
};

/**
 * A heading (here level 3) that a screen reader can jump to. It looks the same as Default on purpose: the difference is
 * only heard. In Messaging, each kind of automated email is one.
 */
export const AsAHeading: Story = {
  name: 'As a heading',
  args: {children: 'Spotlight', headingLevel: 3}
};

/** A 16px icon before the words, as over Access rights' "Who can participate" choices. */
export const WithIcon: Story = {
  name: 'With icon',
  args: {children: 'Who can participate', icon: <User aria-hidden />, headingLevel: 3}
};
