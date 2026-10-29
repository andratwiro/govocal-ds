import type {Meta, StoryObj} from '@storybook/react-vite';
import {expect, screen, userEvent, waitFor, within} from 'storybook/test';
import {HelpPopover} from './HelpPopover';

const meta: Meta<typeof HelpPopover> = {
  title: 'Components/Overlays/Help popover',
  component: HelpPopover,
  tags: ['autodocs', 'not-in-figma'],
  parameters: {layout: 'centered'}
};
export default meta;
type Story = StoryObj<typeof HelpPopover>;

const help = <p>Each token lets one custom integration read the platform's data. Revoke a token to cut that integration off.</p>;

/** The help icon on a tool card. */
export const Icon: Story = {name: 'Default', args: {title: 'Public API Access', children: help}};

/** A text trigger: "Learn more". */
export const LearnMore: Story = {name: 'Learn more', args: {title: 'Online deliberation workshops', triggerText: 'Learn more', children: help}};

/** Open on load, to see the popover itself. */
export const Open: Story = {
  args: {title: 'Public API Access', children: help},
  play: async ({canvasElement}) => {
    canvasElement.querySelector<HTMLButtonElement>('button')?.click();
  }
};

/** The keyboard, proved by this story's play function (the Interactions panel): Tab reaches the help icon; Enter opens
 * the popover with focus in it; Esc closes it and puts focus back on the icon. Space opens it too. */
export const Keyboard: Story = {
  args: {title: 'Public API Access', children: help},
  play: async ({canvasElement}) => {
    const icon = within(canvasElement).getByRole('button', {name: 'Help: Public API Access'});
    await userEvent.tab();
    await expect(icon).toHaveFocus();
    await userEvent.keyboard('{Enter}');
    const dialog = await screen.findByRole('dialog', {name: 'Public API Access'});
    await waitFor(() => expect(dialog).toHaveFocus());
    await userEvent.keyboard('{Escape}');
    await waitFor(() => expect(screen.queryByRole('dialog')).toBeNull());
    await waitFor(() => expect(icon).toHaveFocus());
    await userEvent.keyboard(' ');
    await screen.findByRole('dialog', {name: 'Public API Access'});
    await userEvent.keyboard('{Escape}');
    await waitFor(() => expect(screen.queryByRole('dialog')).toBeNull());
  }
};
