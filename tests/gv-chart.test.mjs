import {describe, it, expect} from 'vitest';
import {niceScale, describeSeries, describeChart, describePoint, nearestIndex} from '../src/components/gv/Chart.tsx';

describe('niceScale (Figma "Chart": four steps from 0)', () => {
  it('matches the Figma axes', () => {
    expect(niceScale(10)).toEqual({max: 12, ticks: [0, 3, 6, 9, 12]});
    expect(niceScale(14)).toEqual({max: 16, ticks: [0, 4, 8, 12, 16]});
  });
  it('rounds big counts to a round step', () => {
    expect(niceScale(342).ticks).toEqual([0, 100, 200, 300, 400]);
    expect(niceScale(1284).max).toBe(1600);
  });
  it('never collapses an empty series', () => {
    expect(niceScale(0)).toEqual({max: 4, ticks: [0, 1, 2, 3, 4]});
  });
});

describe('trend words (the chart aria-label)', () => {
  const dates = ['16 Feb', '23 Feb', '02 Mar', '09 Mar', '16 Mar', '23 Mar'];
  it('says where a series went and where it peaked', () => {
    expect(describeSeries('Visitors', [2, 5, 9, 14, 11, 7], dates))
      .toBe('Visitors rose from 2 to 7, peaking at 14 on 09 Mar');
  });
  it('says fell, and flat', () => {
    expect(describeSeries('Votes', [9, 4, 1], ['Mon', 'Tue', 'Wed'])).toBe('Votes fell from 9 to 1');
    expect(describeSeries('Votes', [3, 3, 3], ['Mon', 'Tue', 'Wed'])).toBe('Votes stayed at 3');
    expect(describeSeries('Votes', [12, 18, 342])).toBe('Votes rose from 12 to 342');
  });
  it('names the range and every series', () => {
    expect(describeChart([{label: 'Participants', values: [1, 0, 1, 10, 0, 1]}, {label: 'Visitors', values: [0, 3, 9, 9, 6, 6]}], dates))
      .toBe('Line chart, 16 Feb to 23 Mar. Participants began and ended at 1, peaking at 10 on 09 Mar. Visitors rose from 0 to 6, peaking at 9 on 02 Mar.');
  });
});

describe('a point in words (the value card and the keyboard explorer)', () => {
  const series = [{label: 'Participants', values: [1, 0, 1, 10]}, {label: 'Visitors', values: [0, 3, 9, 9]}];
  it('names the date, then every series', () => {
    expect(describePoint(series, ['16 Feb', '23 Feb', '02 Mar', '09 Mar'], 3)).toBe('09 Mar: Participants 10, Visitors 9');
  });
  it('leaves out a series with no value there, and the date when there is none', () => {
    expect(describePoint([{label: 'Votes', values: [1284]}, {label: 'Comments', values: []}], undefined, 0)).toBe('Votes 1284');
  });
  it('writes numbers as the locale does (the parts pass the React Aria locale\'s formatter)', () => {
    const votes = [{label: 'Votes', values: [1284.5]}];
    expect(describePoint(votes, undefined, 0, {format: new Intl.NumberFormat('en-GB').format})).toBe('Votes 1,284.5');
    expect(describePoint(votes, undefined, 0, {format: new Intl.NumberFormat('de-DE').format})).toBe('Votes 1.284,5');
  });
  it('picks the nearest point across the plot', () => {
    expect(nearestIndex(0, 6)).toBe(0);
    expect(nearestIndex(0.49, 6)).toBe(2);
    expect(nearestIndex(0.51, 6)).toBe(3);
    expect(nearestIndex(1.2, 6)).toBe(5);
    expect(nearestIndex(0.7, 1)).toBe(0);
  });
});
