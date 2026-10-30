import {useState} from 'react';
import {expect, userEvent, waitFor, within} from 'storybook/test';
import {Badge} from './Badge';
import {Lightbulb, MapPin} from 'lucide-react';
import type {Meta, StoryFn} from '@storybook/react-vite';

const meta: Meta<typeof Badge> = {
  title: 'Components/Status & feedback/Badge',
  component: Badge,
  parameters: {
    layout: 'centered',
    design: {
      type: 'figma',
      url: 'https://www.figma.com/design/OkMTJrzoV6em7gkqribtjA/Go-Vocal-Design-System?node-id=14-880'
    }
  },
  tags: ['autodocs']
};

export default meta;
type Story = StoryFn<typeof Badge>;

const row = {display: 'flex', alignItems: 'center', gap: 12};

/** Figma's set on the first row (Icon: Yes, No); below it the prototype's looks Figma doesn't draw yet. */
export const AllVariants: Story = () => (
  <div style={{display: 'grid', gap: 16}}>
    <div style={row}>
      <Badge icon={<Lightbulb aria-hidden size={14} />}>Idea</Badge>
      <Badge>6 questions</Badge>
    </div>
    <div style={row}>
      <Badge variant="outlined">Viewed</Badge>
      <Badge variant="value">Harbour</Badge>
      <Badge variant="count">2,184</Badge>
      <Badge onRemove={() => {}}>Cycling</Badge>
    </div>
  </div>
);

export const IconYes: Story = () => <Badge icon={<Lightbulb aria-hidden size={14} />}>Idea</Badge>;
IconYes.storyName = 'With icon';

export const IconNo: Story = () => <Badge>6 questions</Badge>;
IconNo.storyName = 'Without icon';

/** Not in Figma: a quiet status or a flag, e.g. "Viewed" on a Most liked row, "Beta" in a menu item, "you". */
export const Outlined: Story = () => (
  <div style={row}>
    <Badge variant="outlined">Viewed</Badge>
    <Badge variant="outlined">Beta</Badge>
    <Badge variant="outlined">you</Badge>
  </div>
);

/** Not in Figma: a value someone chose, on what it belongs to (a setup step's area, its topic tags). */
export const Value: Story = () => (
  <div style={row}>
    <Badge variant="value">Harbour</Badge>
    <Badge variant="value">2 tags</Badge>
    <Badge variant="value" icon={<MapPin aria-hidden size={14} />}>All areas</Badge>
  </div>
);

/** Not in Figma: a number beside a title or a group (a table's total, a tag group's size). Figures keep one width. */
export const Count: Story = () => (
  <div style={row}>
    <Badge variant="count">2</Badge>
    <Badge variant="count">48</Badge>
    <Badge variant="count">2,184</Badge>
  </div>
);

/** Not in Figma: a tag on an input, removed with its ×. Tab reaches each ×; Enter or Space removes. A list of these
 * belongs in a Tag picker, which adds arrow keys and Backspace. */
export const Removable: Story = () => {
  const [tags, setTags] = useState(['Cycling', 'Safety', 'Public space']);
  return (
    <div style={row}>
      {tags.map(t => <Badge key={t} onRemove={() => setTags(tags.filter(x => x !== t))}>{t}</Badge>)}
      {tags.length === 0 && <span style={{font: 'var(--gv-type-small)', color: 'var(--gv-text-secondary)'}}>No tags</span>}
    </div>
  );
};

/** The keyboard: Tab moves from one removable badge's × to the next; Enter or Space removes that badge. */
export const Keyboard: Story = () => {
  const [tags, setTags] = useState(['Cycling', 'Safety', 'Public space']);
  return (
    <div style={row}>
      {tags.map(t => <Badge key={t} onRemove={() => setTags(tags.filter(x => x !== t))}>{t}</Badge>)}
    </div>
  );
};
Keyboard.play = async ({canvasElement}) => {
  const canvas = within(canvasElement);
  await userEvent.tab();
  await expect(canvas.getByRole('button', {name: 'Remove Cycling'})).toHaveFocus();
  await userEvent.tab();
  await expect(canvas.getByRole('button', {name: 'Remove Safety'})).toHaveFocus();
  await userEvent.keyboard('{Enter}');
  await waitFor(() => expect(canvas.queryByText('Safety')).toBeNull());
  await userEvent.tab({shift: true});
  await expect(canvas.getByRole('button', {name: 'Remove Cycling'})).toHaveFocus();
  await userEvent.keyboard(' ');
  await waitFor(() => expect(canvas.queryByText('Cycling')).toBeNull());
  await expect(canvas.getByText('Public space')).toBeVisible();
};
