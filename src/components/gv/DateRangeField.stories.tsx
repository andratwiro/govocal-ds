import {expect, userEvent, waitFor, within} from 'storybook/test';
import {useState} from 'react';
import {DateRangeField} from './DateRangeField';
import type {Meta, StoryObj} from '@storybook/react-vite';

const meta: Meta<typeof DateRangeField> = {
  title: 'Components/Forms/Date range field',
  component: DateRangeField,
  tags: ['autodocs', 'not-in-figma'],
  parameters: {layout: 'padded'}
};

export default meta;
type Story = StoryObj<typeof DateRangeField>;

/** A phase whose end isn't set yet (Survey Spotlight: "No dates yet"). */
export const StartOnly: Story = {
  name: 'Start only',
  args: {label: 'Dates', defaultValue: {start: '2026-11-02'}}
};

export const StartAndEnd: Story = {
  name: 'Start and end',
  args: {label: 'Dates', defaultValue: {start: '2026-11-02', end: '2026-12-14'}}
};

/** An event's setup: a start and end time beside each date. */
export const WithTimes: Story = {
  name: 'With times',
  args: {
    label: 'Dates',
    showTime: true,
    defaultValue: {start: '2026-11-02', startTime: '18:30', end: '2026-11-02', endTime: '20:00'}
  }
};

export const WithTimezone: Story = {
  name: 'With timezone',
  args: {label: 'Dates', showTime: true, defaultValue: {start: '2026-11-02', startTime: '18:30'}, timeZone: 'Europe/Brussels'}
};

export const Required: Story = {
  args: {label: 'Dates', isRequired: true}
};

/** The end can't land before the start: said in words under the row, not colour alone. */
export const Invalid: Story = {
  name: 'Invalid (end before start)',
  args: {label: 'Dates', defaultValue: {start: '2026-11-20', end: '2026-11-05'}}
};

/** Controlled, the page's own data as ISO strings: `value` takes "YYYY-MM-DD" and "HH:mm", `onChange` hands back
 * React Aria values, which `String()` turns back into the same strings. */
export const Controlled: Story = {
  render: function Controlled() {
    const [dates, setDates] = useState<{start: string | null; end: string | null}>({start: '2026-11-02', end: null});
    return (
      <div style={{display: 'grid', gap: 'var(--gv-space-12)'}}>
        <DateRangeField label="Dates" value={dates}
          onChange={r => setDates({start: r.start && String(r.start), end: r.end && String(r.end)})} />
        <output style={{font: 'var(--gv-type-small)', color: 'var(--gv-text-secondary)'}}>
          start: {dates.start ?? 'none'} · end: {dates.end ?? 'none'}
        </output>
      </div>
    );
  }
};

/** The keyboard, proved by this story's play function: the up arrow steps the focused part of a date; Enter on "Add end
 * date" shows the end date; Enter on its × takes it away again. */
export const Keyboard: Story = {
  args: {label: 'Dates', defaultValue: {start: '2026-11-02'}},
  play: async ({canvasElement}) => {
    const canvas = within(canvasElement);
    const start = canvas.getByRole('group', {name: 'Dates, start date'});
    const part = within(start).getAllByRole('spinbutton')[0];
    const before = Number(part.getAttribute('aria-valuenow'));
    part.focus();
    await userEvent.keyboard('{ArrowUp}');
    await waitFor(() => expect(Number(part.getAttribute('aria-valuenow'))).not.toBe(before));
    canvas.getByRole('button', {name: 'Add end date'}).focus();
    await userEvent.keyboard('{Enter}');
    await expect(await canvas.findByRole('group', {name: 'Dates, end date'})).toBeVisible();
    canvas.getByRole('button', {name: 'Remove the end date'}).focus();
    await userEvent.keyboard('{Enter}');
    await waitFor(() => expect(canvas.queryByRole('group', {name: 'Dates, end date'})).toBeNull());
    await expect(canvas.getByRole('button', {name: 'Add end date'})).toBeVisible();
  }
};
