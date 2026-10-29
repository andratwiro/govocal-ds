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
  tags: ['autodocs']
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
    <StatRow label="Unassigned" value="48" onPress={() => {}} />
    <StatRow label="New ideas" value="18" isNew onPress={() => {}} />
    <StatRow label="New comments" value="33" onPress={() => {}} />
  </div>
);

/** The keyboard: Tab moves from row to row (a static row is skipped), Enter presses the focused one, here turning its
 * filter on (`isSelected`, read as the current item). */
export const Keyboard: Story = () => {
  const [on, setOn] = useState<string | null>(null);
  const rows = [['Waiting for a reply', '40'], ['Unassigned', '48']];
  return (
    <div style={{display: 'flex', flexDirection: 'column', width: 292}}>
      <StatRow label="Total ideas" value="124" isStatic />
      {rows.map(([label, value]) => (
        <StatRow key={label} label={label} value={value} isSelected={on === label}
          onPress={() => setOn(o => (o === label ? null : label))} />
      ))}
    </div>
  );
};
Keyboard.play = async ({canvasElement}) => {
  const canvas = within(canvasElement);
  const waiting = canvas.getByRole('link', {name: /Waiting for a reply/});
  const unassigned = canvas.getByRole('link', {name: /Unassigned/});
  await userEvent.tab();
  await expect(waiting).toHaveFocus();
  await userEvent.keyboard('{Enter}');
  await expect(waiting).toHaveAttribute('aria-current', 'true');
  await userEvent.tab();
  await expect(unassigned).toHaveFocus();
  await userEvent.keyboard('{Enter}');
  await expect(unassigned).toHaveAttribute('aria-current', 'true');
  await expect(waiting).not.toHaveAttribute('aria-current');
};
