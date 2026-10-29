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
import {RequiredMarker, type RequiredMarkerLabels} from './RequiredMarker';
import {mergeLabels} from '../labels';
import './DateRangeField.css';

/** The words Date range field says itself (docs/API.md rule 11), with the Required marker's, which it hands on. */
export interface DateRangeFieldLabels extends RequiredMarkerLabels {
  /** The start date field's name, given the field's `label` (none when it has no label). */
  startDate: (label?: string) => string;
  /** The end date field's name, given the field's `label` (none when it has no label). */
  endDate: (label?: string) => string;
  /** The start time field's name, given the field's `label` (none when it has no label). */
  startTime: (label?: string) => string;
  /** The end time field's name, given the field's `label` (none when it has no label). */
  endTime: (label?: string) => string;
  /** The button that adds an end date. */
  addEnd: string;
  /** The × button's name. */
  removeEnd: string;
  /** The error under the fields when the end lands before the start. */
  endBeforeStart: string;
}

/** Date range field's English words; a page passes its own over them with `labels`. */
export const dateRangeFieldLabels: DateRangeFieldLabels = {
  startDate: label => (label ? `${label}, start date` : 'Start date'),
  endDate: label => (label ? `${label}, end date` : 'End date'),
  startTime: label => (label ? `${label}, start time` : 'Start time'),
  endTime: label => (label ? `${label}, end time` : 'End time'),
  addEnd: 'Add end date',
  removeEnd: 'Remove the end date',
  endBeforeStart: "The end date can't be before the start date.",
  required: 'Required'
};

/** The range as the field hands it back: React Aria date and time values (`String(value.start)` is "2026-11-02"). */
export interface DateRange {
  /** The start date; `null` when none is set. */
  start: DateValue | null;
  /** No end: the range is open-ended. */
  end: DateValue | null;
  /** The start time; `null` when none is set. */
  startTime: TimeValue | null;
  /** The end time; `null` when none is set. */
  endTime: TimeValue | null;
}

/** The range as a page may give it: each part a React Aria value or an ISO string ("2026-11-02", "18:30"). A part
 * left out is empty. */
export interface DateRangeInput {
  /** The start date. */
  start?: DateValue | string | null;
  /** The end date; left out or `null`, the range is open-ended. */
  end?: DateValue | string | null;
  /** The start time. */
  startTime?: TimeValue | string | null;
  /** The end time. */
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
  /** A grey line under the fields, hidden while the error shows. */
  description?: string;
  /** Whether a start date is required: adds the Required marker beside the label. */
  isRequired?: boolean;
  /** Whether the fields and the end-date button are greyed out. */
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
  /** Its own words (the fields' names, Add end date, the error), over `dateRangeFieldLabels`. */
  labels?: Partial<DateRangeFieldLabels>;
  /** Places the field (a grid area, a width); never paints it. */
  className?: string;
  /** Places the field; layout only. */
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
  labels,
  className,
  style
}: DateRangeFieldProps) {
  const l = mergeLabels(dateRangeFieldLabels, labels);
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

  return (
    <div className={clsx('gv-date-range-field', className)} style={style}
      data-invalid={isInvalid || undefined} data-disabled={isDisabled || undefined}>
      {label && (
        <span className="gv-date-range-field__label">
          {label}
          {isRequired && <RequiredMarker labels={l} />}
        </span>
      )}
      <div className="gv-date-range-field__row">
        <DatePicker
          aria-label={l.startDate(label)}
          value={current.start}
          onChange={start => set({start})}
          isRequired={isRequired}
          isDisabled={isDisabled}
          isInvalid={isInvalid}
        />
        {showTime && current.start && (
          <TimeField
            aria-label={l.startTime(label)}
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
              aria-label={l.endDate(label)}
              value={current.end}
              onChange={end => set({end})}
              isDisabled={isDisabled}
              isInvalid={isInvalid}
              minValue={current.start ?? undefined}
            />
            {showTime && current.end && (
              <TimeField
                aria-label={l.endTime(label)}
                value={current.endTime}
                onChange={endTime => set({endTime})}
                isDisabled={isDisabled}
              />
            )}
            <Button
              variant="quiet"
              size={32}
              isDisabled={isDisabled}
              aria-label={l.removeEnd}
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
            {l.addEnd}
          </Button>
        )}
        {timeZone && <span className="gv-date-range-field__zone">{timeZone}</span>}
      </div>
      {description && !isInvalid && <p className="gv-date-range-field__description">{description}</p>}
      {isInvalid && (
        <p className="gv-date-range-field__error" role="alert">
          {l.endBeforeStart}
        </p>
      )}
    </div>
  );
}
