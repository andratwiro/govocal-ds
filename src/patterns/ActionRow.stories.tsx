import {useEffect, useState} from 'react';
import type {Meta, StoryObj} from '@storybook/react-vite';
import {expect, screen, userEvent, waitFor, within} from 'storybook/test';
import {Download, FileChartColumn, FileText, Info, Link2, MessageSquare, Sparkles} from 'lucide-react';
import {Text} from 'react-aria-components/Text';
import {MenuItem} from '../components/Menu';
import {ActionRow, ActionRowList} from './ActionRow';

const meta: Meta<typeof ActionRow> = {
  title: 'Patterns/Project page/Action row',
  component: ActionRow,
  tags: ['autodocs', 'not-in-figma'],
  decorators: [Story => <div style={{width: 264}}><Story /></div>]
};
export default meta;
type Story = StoryObj<typeof ActionRow>;

const shareMenu = (
  <>
    <MenuItem id="messaging" textValue="Go to Messaging"><MessageSquare aria-hidden /><Text className="react-aria-Text gv-base-text" slot="label">Go to Messaging</Text></MenuItem>
    <MenuItem id="text" textValue="Add a text block to the page"><FileText aria-hidden /><Text className="react-aria-Text gv-base-text" slot="label">Add a text block to the page</Text></MenuItem>
    <MenuItem id="phase" textValue="Create an information phase"><Info aria-hidden /><Text className="react-aria-Text gv-base-text" slot="label">Create an information phase</Text></MenuItem>
  </>
);

/** Idle, with a badge, with the action's icon, with a description, working, done, with a menu and disabled. */
export const AllVariants: Story = {
  render: () => (
    <ActionRowList aria-label="Action rows">
      <ActionRow href="#messaging">Message participants</ActionRow>
      <ActionRow href="#review" badge="18 new">Review new ideas</ActionRow>
      <ActionRow href="#report" icon={<FileChartColumn />}>Add a report</ActionRow>
      <ActionRow href="#import" description="Paper forms or a spreadsheet">Import inputs</ActionRow>
      <ActionRow status="working" progress={40} description="Reading the results of this phase">Creating report</ActionRow>
      <ActionRow status="done" href="#builder">Report ready</ActionRow>
      <ActionRow icon={<Link2 />} menu={shareMenu}>Share results with participants</ActionRow>
      <ActionRow isDisabled icon={<Download />}>Download insights</ActionRow>
    </ActionRowList>
  )
};

export const Default: Story = {args: {children: 'Message participants', href: '#'}};

export const WithBadge: Story = {name: 'With badge', args: {children: 'Review new ideas', badge: '18 new', href: '#'}};

/** The Insights panel's rows: the action's icon at the end, where the chevron sits. */
export const WithIcon: Story = {name: 'With icon', args: {children: 'Get an AI Sensemaking summary', icon: <Sparkles />, href: '#'}};

export const WithDescription: Story = {
  name: 'With description',
  args: {children: 'Import inputs', description: 'Paper forms or a spreadsheet', href: '#'}
};

/**
 * The row is its own progress while the action runs: a ring (here 40%), `aria-disabled`, nothing to press. Leave
 * `progress` out for a ring that turns.
 */
export const Working: Story = {
  args: {children: 'Creating report', description: 'Reading the results of this phase', status: 'working', progress: 40}
};

/** It finished: a check on the primary tint; the row opens the result. */
export const Done: Story = {args: {children: 'Report ready', status: 'done', href: '#'}};

/** The row drops a menu as wide as itself (Share results with participants). */
export const WithMenu: Story = {
  name: 'With menu',
  args: {children: 'Share results with participants', icon: <Link2 />, menu: shareMenu}
};

/** Greyed and inert. */
export const Disabled: Story = {args: {children: 'Download insights', icon: <Download />, isDisabled: true}};

/** Nothing left to suggest: the list says so in place of its rows. */
export const EmptyList: Story = {name: 'Empty list', render: () => <ActionRowList aria-label="Recommended actions" />};

/** "Next actions" on the project page: rows in a stack. */
export const NextActions: Story = {
  name: 'Next actions',
  render: () => (
    <ActionRowList aria-label="Next actions">
      <ActionRow href="#messaging">Message participants</ActionRow>
      <ActionRow href="#reporting">Create report</ActionRow>
    </ActionRowList>
  )
};

function CreateReport() {
  const [secs, setSecs] = useState<number | null>(null);
  const [ready, setReady] = useState(false);
  useEffect(() => {
    if (secs == null || ready) return;
    if (secs === 0) {
      setReady(true);
      return;
    }
    const t = setTimeout(() => setSecs(s => (s ?? 1) - 1), 1000);
    return () => clearTimeout(t);
  }, [secs, ready]);
  if (ready) return <ActionRow status="done" onPress={() => { setReady(false); setSecs(null); }}>Report ready</ActionRow>;
  if (secs != null) return <ActionRow status="working" progress={((10 - secs) / 10) * 100} badge={`${secs}s`}>Creating report…</ActionRow>;
  return <ActionRow icon={<FileChartColumn />} onPress={() => setSecs(10)}>Create report</ActionRow>;
}

/**
 * The Insights panel's "Recommended actions": Create report runs in its row (a 10 s countdown, then Report ready; press
 * it again to start over), Share opens its menu.
 */
export const RecommendedActions: Story = {
  name: 'Recommended actions',
  render: () => (
    <ActionRowList aria-label="Recommended actions">
      <CreateReport />
      <ActionRow icon={<Link2 />} menu={shareMenu}>Share results with participants</ActionRow>
      <ActionRow icon={<Sparkles />} href="#ai">Get an AI Sensemaking summary</ActionRow>
      <ActionRow icon={<Download />} href="#download">Download insights</ActionRow>
    </ActionRowList>
  )
};

/**
 * The keys a row takes: Tab reaches each row that does something (a working row is skipped: nothing to press), Enter
 * runs it, and a menu row opens its menu. Its play function proves the component page's keyboard table.
 */
export const Keyboard: Story = {
  render: function Render() {
    const [pressed, setPressed] = useState(0);
    return (
      <div style={{display: 'flex', flexDirection: 'column', gap: 8}}>
        <ActionRowList aria-label="Next actions">
          <ActionRow onPress={() => setPressed(n => n + 1)}>Create report</ActionRow>
          <ActionRow status="working" progress={40} badge="6s">Creating report</ActionRow>
          <ActionRow icon={<Link2 />} menu={shareMenu}>Share results with participants</ActionRow>
        </ActionRowList>
        <span role="status">{pressed ? `Pressed ${pressed}` : 'Not pressed'}</span>
      </div>
    );
  },
  play: async ({canvasElement}) => {
    const canvas = within(canvasElement);
    await userEvent.tab();
    await expect(canvas.getByRole('link', {name: 'Create report'})).toHaveFocus();
    await userEvent.keyboard('{Enter}');
    await expect(canvas.getByRole('status')).toHaveTextContent('Pressed 1');
    await userEvent.tab();
    const share = canvas.getByRole('button', {name: /Share results with participants/});
    await expect(share).toHaveFocus();
    await userEvent.keyboard('{Enter}');
    const menu = await screen.findByRole('menu');
    await waitFor(() => expect(within(menu).getAllByRole('menuitem')[0]).toHaveFocus());
    await userEvent.keyboard('{Escape}');
    await waitFor(() => expect(screen.queryByRole('menu')).toBeNull());
    await waitFor(() => expect(share).toHaveFocus());
  }
};
