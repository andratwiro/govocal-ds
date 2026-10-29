import type {Meta, StoryObj} from '@storybook/react-vite';
import {PanelSection} from './PanelSection';
import {ActionRow} from './ActionRow';

const meta: Meta<typeof PanelSection> = {
  title: 'Patterns/Panel section',
  component: PanelSection,
  tags: ['autodocs'],
  decorators: [Story => <div style={{width: 264}}><Story /></div>]
};
export default meta;
type Story = StoryObj<typeof PanelSection>;

export const Default: Story = {
  args: {title: 'Next actions', children: <><ActionRow href="#">Message participants</ActionRow><ActionRow href="#">Create report</ActionRow></>}
};

export const WithNote: Story = {
  args: {title: 'Before you publish', aside: '0 of 6 ready', children: <p style={{margin: 0}}>The setup steps.</p>}
};

/** Folded until opened (prototype "Project details"). */
export const Collapsible: Story = {
  args: {title: 'Project details', collapsible: true, children: <p style={{margin: 0}}>Dates, folder, visibility.</p>}
};

export const CollapsibleOpen: Story = {
  args: {title: 'Project details', collapsible: true, defaultExpanded: true, children: <p style={{margin: 0}}>Dates, folder, visibility.</p>}
};
