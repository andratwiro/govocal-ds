'use client';
import {
  Calendar as AriaCalendar,
  CalendarCell as AriaCalendarCell,
  CalendarGrid as AriaCalendarGrid,
  CalendarHeading,
  type CalendarProps as AriaCalendarProps,
  type DateValue,
  type CalendarCellProps,
  type CalendarGridProps
} from 'react-aria-components/Calendar';
import {Text} from './Content';
import {ChevronLeft, ChevronRight} from 'lucide-react';
import {Button} from './Button';
import './Calendar.css';
import {keepClass} from './className';
import clsx from 'clsx';

export interface CalendarProps<T extends DateValue> extends AriaCalendarProps<T> {
  errorMessage?: string;
}

/** A month grid to pick one date; React Aria's Calendar. For a date in a form, use DatePicker or Date range field. */
export function Calendar<T extends DateValue>({errorMessage, ...props}: CalendarProps<T>) {
  let months = props.visibleDuration?.months || 1;
  return (
    <AriaCalendar {...props} className={keepClass(props.className, 'gv-base-calendar')}>
      <div className="months">
        {Array.from({length: months}, (_, i) => (
          <div key={i} className="month">
            <header>
              {i === 0 && (
                <Button slot="previous" variant="quiet">
                  <ChevronLeft />
                </Button>
              )}
              <CalendarHeading className="react-aria-CalendarHeading gv-base-calendar-heading" offset={{months: i}} />
              {i === months - 1 && (
                <Button slot="next" variant="quiet">
                  <ChevronRight />
                </Button>
              )}
            </header>
            <CalendarGrid offset={{months: i}}>{date => <CalendarCell date={date} />}</CalendarGrid>
          </div>
        ))}
      </div>
      {errorMessage && <Text slot="errorMessage">{errorMessage}</Text>}
    </AriaCalendar>
  );
}

export function CalendarCell(props: CalendarCellProps) {
  return (
    <AriaCalendarCell
      {...props}
      className={keepClass(props.className, 'gv-base-calendar-cell', 'button-base')}
      data-variant="quiet"
    />
  );
}

export function CalendarGrid(props: CalendarGridProps) {
  return <AriaCalendarGrid {...props} className={clsx('react-aria-CalendarGrid gv-base-calendar-grid', props.className)} />;
}
