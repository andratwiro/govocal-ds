'use client';
import {useState} from 'react';
import type {DateValue} from 'react-aria-components/DatePicker';
import type {TimeValue} from 'react-aria-components/TimeField';
import {Plus, X} from 'lucide-react';
import {Button} from '../Button';
import {DatePicker} from '../DatePicker';
import {TimeField} from '../TimeField';
import {RequiredMarker} from './RequiredMarker';
import './DateRangeField.css';

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
  start?: DateValue | null;
  defaultStart?: DateValue | null;
  onStartChange?: (value: DateValue | null) => void;
  end?: DateValue | null;
  defaultEnd?: DateValue | null;
  onEndChange?: (value: DateValue | null) => void;
  startTime?: TimeValue | null;
  defaultStartTime?: TimeValue | null;
  onStartTimeChange?: (value: TimeValue | null) => void;
  endTime?: TimeValue | null;
  defaultEndTime?: TimeValue | null;
  onEndTimeChange?: (value: TimeValue | null) => void;
}

/**
 * Date range field (Figma not yet drawn; the prototype's `.pj-dates2`): two DatePickers joined by
 * an "Add end date" link, never the starter DateRangePicker — a phase or event's end may stay
 * open-ended (§C). Invalid when the end lands before the start, said in words under the fields.
 */
export function DateRangeField({
  label,
  description,
  isRequired,
  isDisabled,
  showTime,
  timeZone,
  start,
  defaultStart = null,
  onStartChange,
  end,
  defaultEnd = null,
  onEndChange,
  startTime,
  defaultStartTime = null,
  onStartTimeChange,
  endTime,
  defaultEndTime = null,
  onEndTimeChange
}: DateRangeFieldProps) {
  const [innerStart, setInnerStart] = useState<DateValue | null>(defaultStart);
  const [innerEnd, setInnerEnd] = useState<DateValue | null>(defaultEnd);
  const [innerStartTime, setInnerStartTime] = useState<TimeValue | null>(defaultStartTime);
  const [innerEndTime, setInnerEndTime] = useState<TimeValue | null>(defaultEndTime);
  const [endShown, setEndShown] = useState(Boolean(end ?? defaultEnd));

  const currentStart = start ?? innerStart;
  const currentEnd = end ?? innerEnd;
  const currentStartTime = startTime ?? innerStartTime;
  const currentEndTime = endTime ?? innerEndTime;

  const isInvalid = Boolean(currentStart && currentEnd && currentEnd.compare(currentStart) < 0);

  function setStart(value: DateValue | null) {
    setInnerStart(value);
    onStartChange?.(value);
  }
  function setEnd(value: DateValue | null) {
    setInnerEnd(value);
    onEndChange?.(value);
  }
  function setStartTime(value: TimeValue | null) {
    setInnerStartTime(value);
    onStartTimeChange?.(value);
  }
  function setEndTime(value: TimeValue | null) {
    setInnerEndTime(value);
    onEndTimeChange?.(value);
  }

  const startLabel = label ? `${label}, start date` : 'Start date';
  const endLabel = label ? `${label}, end date` : 'End date';

  return (
    <div className="gv-date-range-field" data-invalid={isInvalid || undefined} data-disabled={isDisabled || undefined}>
      {label && (
        <span className="gv-date-range-field__label">
          {label}
          {isRequired && <RequiredMarker />}
        </span>
      )}
      <div className="gv-date-range-field__row">
        <DatePicker
          aria-label={startLabel}
          value={currentStart}
          onChange={setStart}
          isRequired={isRequired}
          isDisabled={isDisabled}
          isInvalid={isInvalid}
        />
        {showTime && currentStart && (
          <TimeField
            aria-label={label ? `${label}, start time` : 'Start time'}
            value={currentStartTime}
            onChange={setStartTime}
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
              value={currentEnd}
              onChange={setEnd}
              isDisabled={isDisabled}
              isInvalid={isInvalid}
              minValue={currentStart ?? undefined}
            />
            {showTime && currentEnd && (
              <TimeField
                aria-label={label ? `${label}, end time` : 'End time'}
                value={currentEndTime}
                onChange={setEndTime}
                isDisabled={isDisabled}
              />
            )}
            <Button
              variant="quiet"
              size={32}
              isDisabled={isDisabled}
              aria-label="Remove the end date"
              onPress={() => {
                setEndShown(false);
                setEnd(null);
                setEndTime(null);
              }}>
              <X aria-hidden size={16} />
            </Button>
          </>
        ) : (
          <Button variant="quiet" size={32} isDisabled={isDisabled} onPress={() => setEndShown(true)}>
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
