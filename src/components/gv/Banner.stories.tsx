import type {Meta, StoryObj} from '@storybook/react-vite';
import {useState} from 'react';
import {ExternalLink} from 'lucide-react';
import {Button} from '../Button';
import {Banner} from './Banner';

const meta: Meta<typeof Banner> = {
  title: 'Components/Status & feedback/Banner',
  component: Banner,
  tags: ['autodocs'],
  parameters: {
    design: {type: 'figma', url: 'https://www.figma.com/design/OkMTJrzoV6em7gkqribtjA/Go-Vocal-Design-System?node-id=33-479'}
  }
};
export default meta;
type Story = StoryObj<typeof Banner>;

const long =
  'Konveio keeps the participation data for this document on its side, so only visitor numbers are available here. ' +
  'After the phase closes, visit your Konveio dashboard for a summary of the feedback and to download the raw participation data.';

export const AllVariants: Story = {
  render: () => (
    <div style={{display: 'flex', flexDirection: 'column', gap: 16, width: 500}}>
      <Banner type="info-link" linkLabel="Go to project" linkHref="#">
        Goes live when you publish the project.
      </Banner>
      <Banner tone="info">{long}</Banner>
      <Banner tone="neutral">From registration fields. Groups with fewer than 5 respondents are hidden.</Banner>
      <Banner tone="warning" title="Screening is on">
        There are 5 ideas. Participants cannot see them until you approve them.
      </Banner>
      <Banner tone="success">Your email "Results are in: what we heard" was sent to 2,184 participants.</Banner>
      <Banner tone="ai" linkLabel="Open AI analysis" onLinkPress={() => {}}>
        Explore AI-powered summaries and view individual submissions.
      </Banner>
    </div>
  )
};

/** Tone=Info · link (type="info-link", kept for the calls that still pass it) */
export const InfoLink: Story = {
  name: 'Info · link',
  args: {type: 'info-link', children: 'Goes live when you publish the project.', linkLabel: 'Go to project', linkHref: '#'},
  decorators: [Story => <div style={{width: 444}}><Story /></div>],
  parameters: {design: {type: 'figma', url: 'https://www.figma.com/design/OkMTJrzoV6em7gkqribtjA/Go-Vocal-Design-System?node-id=24-207'}}
};

/** Tone=Info */
export const Info: Story = {
  args: {tone: 'info', children: long},
  decorators: [Story => <div style={{width: 500}}><Story /></div>],
  parameters: {design: {type: 'figma', url: 'https://www.figma.com/design/OkMTJrzoV6em7gkqribtjA/Go-Vocal-Design-System?node-id=24-523'}}
};

/** Tone=Neutral: not in Figma yet, the review's quieter note (Community monitor, phase status). */
export const Neutral: Story = {
  tags: ['not-in-figma'],
  args: {tone: 'neutral', children: 'From registration fields. Groups with fewer than 5 respondents are hidden.'},
  decorators: [Story => <div style={{width: 500}}><Story /></div>]
};

/** Tone=Warning: not in Figma yet, the prototype's screening/content-warning yellow. */
export const Warning: Story = {
  tags: ['not-in-figma'],
  args: {tone: 'warning', title: 'Screening is on', children: 'There are 5 ideas. Participants cannot see them until you approve them.'},
  decorators: [Story => <div style={{width: 400}}><Story /></div>]
};

/** Tone=Success: not in Figma yet, the "sent" confirmation strip. */
export const Success: Story = {
  tags: ['not-in-figma'],
  args: {tone: 'success', children: 'Your email "Results are in: what we heard" was sent to 2,184 participants.'},
  decorators: [Story => <div style={{width: 500}}><Story /></div>]
};

/** Tone=AI: not in Figma yet, the Insights "Open AI analysis" row. */
export const AI: Story = {
  name: 'AI',
  tags: ['not-in-figma'],
  args: {tone: 'ai', linkLabel: 'Open AI analysis', children: 'Explore AI-powered summaries and view individual submissions.'},
  decorators: [Story => <div style={{width: 500}}><Story /></div>]
};

/** A bold line above the message (the screening banner). */
export const WithTitle: Story = {
  name: 'With title',
  args: {tone: 'warning', title: 'Screening is on', children: 'There are 5 ideas. Participants cannot see them until you approve them.'},
  decorators: [Story => <div style={{width: 400}}><Story /></div>]
};

/** A block action under the message (the screening banner's "Review"). */
export const WithAction: Story = {
  name: 'With action',
  args: {
    tone: 'warning',
    title: 'Screening is on',
    children: 'There are 5 ideas. Participants cannot see them until you approve them.',
    action: <Button variant="secondary" size={32} onPress={() => {}}>Review</Button>
  },
  decorators: [Story => <div style={{width: 400}}><Story /></div>]
};

/** A dismiss × in the corner. */
export const Dismissible: Story = {
  render: () => {
    function Demo() {
      const [open, setOpen] = useState(true);
      if (!open) return <Button variant="secondary" size={32} onPress={() => setOpen(true)}>Show the banner again</Button>;
      return (
        <Banner tone="warning" title="Screening is on" onDismiss={() => setOpen(false)}>
          There are 5 ideas. Participants cannot see them until you approve them.
        </Banner>
      );
    }
    return <div style={{width: 400}}><Demo /></div>;
  }
};

/** Any icon in place of the tone's default (here the AI link's external-open mark). */
export const CustomIcon: Story = {
  name: 'Custom icon',
  args: {
    tone: 'ai',
    icon: <ExternalLink aria-hidden size={16} strokeWidth={1.75} />,
    children: 'Explore AI-powered summaries and view individual submissions.'
  },
  decorators: [Story => <div style={{width: 500}}><Story /></div>]
};

/** The Build tab's Dates card: a compact strip, one state per tone. */
export const PhaseStatus: Story = {
  name: 'Phase status',
  render: () => (
    <div style={{display: 'flex', flexDirection: 'column', gap: 8, width: 320}}>
      <Banner compact tone="neutral" title="Not started">Starts in 4 days</Banner>
      <Banner compact tone="success" title="Live">Ends in 3 days</Banner>
      <Banner compact tone="neutral" title="Ended">Closed on 12 Dec</Banner>
    </div>
  )
};
