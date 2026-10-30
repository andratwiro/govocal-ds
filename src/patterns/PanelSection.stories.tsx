import type {Meta, StoryObj} from '@storybook/react-vite';
import {expect, screen, userEvent, waitFor, within} from 'storybook/test';
import {PanelSection} from './PanelSection';
import {ActionRow} from './ActionRow';

const meta: Meta<typeof PanelSection> = {
  title: 'Patterns/Project page/Panel section',
  component: PanelSection,
  tags: ['autodocs', 'not-in-figma', 'status:candidate'],
  decorators: [Story => <div style={{width: 264}}><Story /></div>]
};
export default meta;
type Story = StoryObj<typeof PanelSection>;

export const Default: Story = {
  args: {title: 'Next actions', children: <><ActionRow href="#">Message participants</ActionRow><ActionRow href="#">Create report</ActionRow></>}
};

export const WithNote: Story = {
  name: 'With note',
  args: {title: 'Before you publish', aside: '0 of 6 ready', children: <p style={{margin: 0}}>The setup steps.</p>}
};

/** Folded until opened (prototype "Project details"). */
export const Collapsible: Story = {
  args: {title: 'Project details', isCollapsible: true, children: <p style={{margin: 0}}>Dates, folder, visibility.</p>}
};

export const CollapsibleOpen: Story = {
  name: 'Collapsible, open',
  args: {title: 'Project details', isCollapsible: true, defaultExpanded: true, children: <p style={{margin: 0}}>Dates, folder, visibility.</p>}
};

/**
 * A collapsible section by keyboard: Tab reaches its header, Enter or Space folds and unfolds it. Try the keys here; an automated test presses them too (the Interactions panel).
 */
export const Keyboard: Story = {
  args: {title: 'Project details', isCollapsible: true, children: <p style={{margin: 0}}>Dates, folder, visibility.</p>},
  play: async ({canvasElement}) => {
    const canvas = within(canvasElement);
    const header = canvas.getByRole('button', {name: 'Project details'});
    await userEvent.tab();
    await expect(header).toHaveFocus();
    await expect(header).toHaveAttribute('aria-expanded', 'false');
    await userEvent.keyboard('{Enter}');
    await expect(header).toHaveAttribute('aria-expanded', 'true');
    await expect(canvas.getByText('Dates, folder, visibility.')).toBeVisible();
    await userEvent.keyboard(' ');
    await expect(header).toHaveAttribute('aria-expanded', 'false');
  }
};
