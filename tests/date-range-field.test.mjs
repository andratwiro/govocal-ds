import {describe, it, expect} from 'vitest';
import {createElement as h} from 'react';
import {renderToStaticMarkup} from 'react-dom/server';
import {CalendarDate} from '@internationalized/date';
import {DateRangeField, toDateRange} from '../src/components/gv/DateRangeField.tsx';

// The day segments a DatePicker draws, in order: "11/2/2026" → ['11', '2', '2026'] (en-US, the default locale).
const days = html => [...html.matchAll(/data-type="(?:month|day|year)"[^>]*>([^<]*)</g)].map(m => m[1]);

describe('Date range field: ISO strings', () => {
  it('reads value and defaultValue as YYYY-MM-DD strings', () => {
    const r = toDateRange({start: '2026-11-02', end: '2026-12-14', startTime: '18:30'});
    expect(r.start).toEqual(new CalendarDate(2026, 11, 2));
    expect(r.end?.toString()).toBe('2026-12-14');
    expect(r.startTime?.toString()).toBe('18:30:00');
    expect(r.endTime).toBeNull();
  });
  it('keeps date objects and empty ends as they are', () => {
    const start = new CalendarDate(2026, 11, 2);
    expect(toDateRange({start, end: null})).toEqual({start, end: null, startTime: null, endTime: null});
    expect(toDateRange(null)).toEqual({start: null, end: null, startTime: null, endTime: null});
  });
  it('draws a string value in its pickers, the end shown when it has one', () => {
    const html = renderToStaticMarkup(h(DateRangeField, {label: 'Dates', defaultValue: {start: '2026-11-02', end: '2026-12-14'}}));
    expect(days(html)).toEqual(['11', '2', '2026', '12', '14', '2026']);
    expect(html).not.toContain('Add end date');
  });
  it('a start only offers "Add end date"', () => {
    const html = renderToStaticMarkup(h(DateRangeField, {label: 'Dates', value: {start: '2026-11-02'}}));
    expect(days(html)).toEqual(['11', '2', '2026']);
    expect(html).toContain('Add end date');
  });
  it('an end before the start is invalid, in words', () => {
    const html = renderToStaticMarkup(h(DateRangeField, {defaultValue: {start: '2026-11-20', end: '2026-11-05'}}));
    expect(html).toContain('The end date can&#x27;t be before the start date.');
  });
  it('places with className and style on its root', () => {
    const html = renderToStaticMarkup(h(DateRangeField, {className: 'page-dates', style: {gridArea: 'dates'}}));
    expect(html).toMatch(/^<div class="gv-date-range-field page-dates" style="grid-area:dates"/);
  });
});
