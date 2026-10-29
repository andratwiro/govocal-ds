'use client';
import {useState, type CSSProperties} from 'react';
import {parseDate, parseTime} from '@internationalized/date';
import type {DateValue} from 'react-aria-components/DatePicker';
import type {TimeValue} from 'react-aria-components/TimeField';
import {clsx} from 'clsx';
import {Plus, X} from 'lucide-react';
import {Button} from '../Button';
import {DatePicker} from '../DatePicker';
import {TimeField} from '../TimeField';
import {RequiredMarker} from './RequiredMarker';
import './DateRangeField.css';

/** The range as the field hands it back: React Aria date and time values (`String(value.start)` is "2026-11-02"). */
export interface DateRange {
  start: DateValue | null;
  /** No end: the range is open-ended. */
  end: DateValue | null;
  startTime: TimeValue | null;
  endTime: TimeValue | null;
}

/** The range as a page may give it: each part a React Aria value or an ISO string ("2026-11-02", "18:30"). A part
 * left out is empty. */
export interface DateRangeInput {
  start?: DateValue | string | null;
  end?: DateValue | string | null;
  startTime?: TimeValue | string | null;
  endTime?: TimeValue | string | null;
}

const date = (v: DateValue | string | null | undefined) => (typeof v === 'string' ? parseDate(v) : v ?? null);
const time = (v: TimeValue | string | null | undefined) => (typeof v === 'string' ? parseTime(v) : v ?? null);

/** Reads a range given with ISO strings ("2026-11-02", "18:30") or React Aria values into React Aria values.
 * A malformed string throws (`parseDate`), as React Aria does. */
export function toDateRange(input: DateRangeInput | null | undefined): DateRange {
  return {start: date(input?.start), end: date(input?.end), startTime: time(input?.startTime), endTime: time(input?.endTime)};
}

export interface DateRangeFieldProps {
  /** The field's label, e.g. "Dates". */
  label?: string;
  description?: string;
  isRequired?: boolean;
  isDisabled?: boolean;
  /** Adds a time field after each date (the prototype's event setup). */
  showTime?: boolean;
  /** A fixed zone name shown after the fields (no timezone picker yet), e.g. "Europe/Brussels". */
  timeZone?: string;
  /** The range (controlled): `{start: '2026-11-02', end: null}`. Dates as "YYYY-MM-DD" strings or React Aria
   * `DateValue`s, times as "HH:mm" or `TimeValue`s. */
  value?: DateRangeInput | null;
  /** The range it starts with (uncontrolled), in the same shapes as `value`. */
  defaultValue?: DateRangeInput | null;
  /** Called with the whole range whenever a part changes, as React Aria values. */
  onChange?: (value: DateRange) => void;
  /** Places the field (a grid area, a width); never paints it. */
  className?: string;
  style?: CSSProperties;
}

/**
 * Date range field (Figma not yet drawn; the prototype's `.pj-dates2`): two DatePickers joined by an "Add end date"
 * button, never the starter DateRangePicker, because a phase or event's end may stay open. Invalid when the end lands
 * before the start, said in words under the fields.
 *
 * ```tsx
 * <DateRangeField label="Dates" defaultValue={{start: '2026-11-02'}} onChange={r => save(String(r.start), r.end && String(r.end))} />
 * ```
 */
export function DateRangeField({
  label,
  description,
  isRequired,
  isDisabled,
  showTime,
  timeZone,
  value,
  defaultValue,
  onChange,
  className,
  style
}: DateRangeFieldProps) {
  const [inner, setInner] = useState<DateRange>(() => toDateRange(defaultValue));
  const current = value !== undefined ? toDateRange(value) : inner;
  const [endAdded, setEndAdded] = useState(false);
  const endShown = endAdded || current.end !== null;

  const isInvalid = Boolean(current.start && current.end && current.end.compare(current.start) < 0);

  function set(patch: Partial<DateRange>) {
    const next = {...current, ...patch};
    setInner(next);
    onChange?.(next);
  }

  const startLabel = label ? `${label}, start date` : 'Start date';
  const endLabel = label ? `${label}, end date` : 'End date';

  return (
    <div className={clsx('gv-date-range-field', className)} style={style}
      data-invalid={isInvalid || undefined} data-disabled={isDisabled || undefined}>
      {label && (
        <span className="gv-date-range-field__label">
          {label}
          {isRequired && <RequiredMarker />}
        </span>
      )}
      <div className="gv-date-range-field__row">
        <DatePicker
          aria-label={startLabel}
          value={current.start}
          onChange={start => set({start})}
          isRequired={isRequired}
          isDisabled={isDisabled}
          isInvalid={isInvalid}
        />
        {showTime && current.start && (
          <TimeField
            aria-label={label ? `${label}, start time` : 'Start time'}
            value={current.startTime}
            onChange={startTime => set({startTime})}
            isDisabled={isDisabled}
          />
        )}
        {endShown ? (
          <>
            <span className="gv-date-range-field__dash" aria-hidden="true">
              –
            </span>
            <DatePicker
              aria-label={endLabel}
              value={current.end}
              onChange={end => set({end})}
              isDisabled={isDisabled}
              isInvalid={isInvalid}
              minValue={current.start ?? undefined}
            />
            {showTime && current.end && (
              <TimeField
                aria-label={label ? `${label}, end time` : 'End time'}
                value={current.endTime}
                onChange={endTime => set({endTime})}
                isDisabled={isDisabled}
              />
            )}
            <Button
              variant="quiet"
              size={32}
              isDisabled={isDisabled}
              aria-label="Remove the end date"
              onPress={() => {
                setEndAdded(false);
                set({end: null, endTime: null});
              }}>
              <X aria-hidden size={16} />
            </Button>
          </>
        ) : (
          <Button variant="quiet" size={32} isDisabled={isDisabled} onPress={() => setEndAdded(true)}>
            <Plus aria-hidden size={16} />
            Add end date
          </Button>
        )}
        {timeZone && <span className="gv-date-range-field__zone">{timeZone}</span>}
      </div>
      {description && !isInvalid && <p className="gv-date-range-field__description">{description}</p>}
      {isInvalid && (
        <p className="gv-date-range-field__error" role="alert">
          The end date can't be before the start date.
        </p>
      )}
    </div>
  );
}
