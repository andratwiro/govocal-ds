import {CalendarDate, Time} from '@internationalized/date';
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
  args: {label: 'Dates', defaultStart: new CalendarDate(2026, 11, 2)}
};

export const StartAndEnd: Story = {
  name: 'Start and end',
  args: {
    label: 'Dates',
    defaultStart: new CalendarDate(2026, 11, 2),
    defaultEnd: new CalendarDate(2026, 12, 14)
  }
};

/** An event's setup: a start and end time beside each date. */
export const WithTimes: Story = {
  name: 'With times',
  args: {
    label: 'Dates',
    showTime: true,
    defaultStart: new CalendarDate(2026, 11, 2),
    defaultStartTime: new Time(18, 30),
    defaultEnd: new CalendarDate(2026, 11, 2),
    defaultEndTime: new Time(20, 0)
  }
};

export const WithTimezone: Story = {
  name: 'With timezone',
  args: {
    label: 'Dates',
    showTime: true,
    defaultStart: new CalendarDate(2026, 11, 2),
    defaultStartTime: new Time(18, 30),
    timeZone: 'Europe/Brussels'
  }
};

export const Required: Story = {
  args: {label: 'Dates', isRequired: true}
};

/** The end can't land before the start: said in words under the row, not colour alone. */
export const Invalid: Story = {
  name: 'Invalid (end before start)',
  args: {
    label: 'Dates',
    defaultStart: new CalendarDate(2026, 11, 20),
    defaultEnd: new CalendarDate(2026, 11, 5)
  }
};
