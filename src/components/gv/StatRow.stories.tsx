import {useState} from 'react';
import {expect, userEvent, within} from 'storybook/test';
import {StatRow} from './StatRow';
import type {Meta, StoryFn} from '@storybook/react-vite';

const meta: Meta<typeof StatRow> = {
  title: 'Components/Data display/Stat row',
  component: StatRow,
  parameters: {
    layout: 'centered',
    design: {
      type: 'figma',
      url: 'https://www.figma.com/design/OkMTJrzoV6em7gkqribtjA/Go-Vocal-Design-System?node-id=14-886'
    }
  },
  tags: ['autodocs', 'status:candidate']
};

export default meta;
type Story = StoryFn<typeof StatRow>;

export const AllVariants: Story = () => (
  <div style={{display: 'flex', gap: 24, flexWrap: 'wrap', width: 1200}}>
    <div style={{width: 292}}>
      <StatRow label="Waiting for a reply" value="40" href="#" />
    </div>
    <div style={{width: 292}}>
      <StatRow label="New ideas" value="18" isNew href="#" />
    </div>
    <div style={{width: 292, background: 'var(--gv-surface-hovered)', borderRadius: 'var(--gv-radius-8)'}}>
      <StatRow label="New comments" value="33" href="#" />
    </div>
    <div style={{width: 276}}>
      <StatRow label="New statements" value="4" isStatic />
    </div>
  </div>
);

export const Default: Story = () => (
  <div style={{width: 292}}>
    <StatRow label="Waiting for a reply" value="40" href="/projects/green-corridors/manage" />
  </div>
);

export const DefaultNew: Story = () => (
  <div style={{width: 292}}>
    <StatRow label="New ideas" value="18" isNew href="/projects/green-corridors/manage/ideas" />
  </div>
);
DefaultNew.storyName = 'Default · new';

export const Hover: Story = () => (
  <div style={{width: 292}}>
    <StatRow label="New comments" value="33" href="/projects/green-corridors/manage/comments" />
  </div>
);
Hover.parameters = {
  docs: {description: {story: 'Hover the row to see `--gv-surface-hovered` and the chevron turn primary.'}}
};

export const Static: Story = () => (
  <div style={{width: 276}}>
    <StatRow label="New statements" value="4" isStatic />
  </div>
);

/**
 * Not in Figma. The prototype's Manage metrics as one stack (an 80 pitch, the hover areas touching): the first row's
 * filter is on, so it stays painted as hovered with a dark chevron until it is pressed again.
 */
export const Selected: Story = () => (
  <div style={{display: 'flex', flexDirection: 'column', width: 292}}>
    <StatRow label="Waiting for a reply" value="40" isSelected onPress={() => {}} />
    <StatRow label="Unassigned" value="48" isSelected={false} onPress={() => {}} />
    <StatRow label="New ideas" value="18" isNew isSelected={false} onPress={() => {}} />
    <StatRow label="New comments" value="33" isSelected={false} onPress={() => {}} />
  </div>
);

/** The keyboard: Tab moves from row to row (a static row is skipped). A filter row (`isSelected` passed) is a toggle
 * button: Enter or Space presses it, turning its filter on or off, and it says whether it is pressed. The new dot's
 * name comes through `labels`. */
export const Keyboard: Story = () => {
  const [on, setOn] = useState<string | null>(null);
  const rows = [['Waiting for a reply', '40'], ['Unassigned', '48']];
  return (
    <div style={{display: 'flex', flexDirection: 'column', width: 292}}>
      <StatRow label="Total ideas" value="124" isStatic />
      <StatRow label="Nuevas ideas" value="18" isNew isStatic labels={{new: 'Nuevo'}} />
      {rows.map(([label, value]) => (
        <StatRow key={label} label={label} value={value} isSelected={on === label}
          onPress={() => setOn(o => (o === label ? null : label))} />
      ))}
    </div>
  );
};
Keyboard.play = async ({canvasElement}) => {
  const canvas = within(canvasElement);
  await expect(canvas.getByRole('img', {name: 'Nuevo'})).toBeVisible();
  const waiting = canvas.getByRole('button', {name: /Waiting for a reply/});
  const unassigned = canvas.getByRole('button', {name: /Unassigned/});
  await expect(waiting).toHaveAttribute('aria-pressed', 'false');
  await userEvent.tab();
  await expect(waiting).toHaveFocus();
  await userEvent.keyboard('{Enter}');
  await expect(waiting).toHaveAttribute('aria-pressed', 'true');
  await userEvent.tab();
  await expect(unassigned).toHaveFocus();
  await userEvent.keyboard(' ');
  await expect(unassigned).toHaveAttribute('aria-pressed', 'true');
  await expect(waiting).toHaveAttribute('aria-pressed', 'false');
  await userEvent.keyboard(' ');
  await expect(unassigned).toHaveAttribute('aria-pressed', 'false');
};
