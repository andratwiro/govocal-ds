import {useId, type CSSProperties, type ReactNode} from 'react';
import './Chart.css';

/**
 * The chart palette, one name per `--gv-chart-*` token. Anything that draws data (lines, bars,
 * swatches) takes one of these, never a raw colour.
 */
export type ChartColor =
  | 'line-primary' | 'line-secondary' | 'bar'
  | 'agree' | 'disagree' | 'pass'
  | 'blue-1' | 'blue-2' | 'blue-3' | 'blue-4' | 'blue-5'
  | 'green' | 'olive' | 'terracotta';

/** Figma "Chart" draws a line in the primary (brand) or secondary (orange) series colour. */
export type ChartTone = 'primary' | 'secondary';

export interface ChartSeries {
  /** What the line counts ("Participants"): used in the legend and the spoken trend. */
  label: string;
  values: number[];
  /** Defaults: one series → secondary (as Figma's Line · 1 series); two → primary, then secondary. */
  tone?: ChartTone;
}

const fmt = (n: number) => n.toLocaleString('en-GB', {maximumFractionDigits: 2});
const toneColor = (tone: ChartTone): ChartColor => (tone === 'primary' ? 'line-primary' : 'line-secondary');

/** A y axis from 0 in `steps` equal, round steps (Figma: 0·3·6·9·12, 0·4·8·12·16). */
export function niceScale(dataMax: number, steps = 4): {max: number; ticks: number[]} {
  const raw = (dataMax > 0 ? dataMax : steps) / steps;
  const mag = 10 ** Math.floor(Math.log10(raw));
  const step = [1, 2, 3, 4, 5, 6, 8, 10].map(m => m * mag).find(s => s >= raw - 1e-9) ?? 10 * mag;
  const ticks = Array.from({length: steps + 1}, (_, i) => +(i * step).toPrecision(12));
  return {max: ticks[steps], ticks};
}

/** One series in words: where it started, where it ended, and an inner peak if there was one. */
export function describeSeries(label: string, values: number[], labels?: string[]): string {
  if (!values.length) return `${label}: no data`;
  const first = values[0], last = values[values.length - 1];
  const max = Math.max(...values), at = values.indexOf(max);
  const peak = max > first && max > last
    ? `, peaking at ${fmt(max)}${labels?.[at] ? ` on ${labels[at]}` : ''}` : '';
  if (values.every(v => v === first)) return `${label} stayed at ${fmt(first)}`;
  if (first === last) return `${label} began and ended at ${fmt(first)}${peak}`;
  return `${label} ${last > first ? 'rose' : 'fell'} from ${fmt(first)} to ${fmt(last)}${peak}`;
}

/** The whole chart in words: the default aria-label of a LineChart. */
export function describeChart(series: ChartSeries[], labels: string[]): string {
  const range = labels.length > 1 ? `, ${labels[0]} to ${labels[labels.length - 1]}` : '';
  return `Line chart${range}. ${series.map(s => describeSeries(s.label, s.values, labels) + '.').join(' ')}`;
}

/* ───────────────────────────── Legend ───────────────────────────── */

export interface ChartLegendItem {
  label: ReactNode;
  color: ChartColor;
}

export interface ChartLegendProps {
  items: ChartLegendItem[];
  /** `dot`: round 9px (line charts). `square`: 8px, radius 2 (Statements: agree / disagree / pass). */
  shape?: 'dot' | 'square';
  align?: 'center' | 'start';
  className?: string;
}

/** The key under a chart: a swatch and a word per series. */
export function ChartLegend({items, shape = 'dot', align = 'center', className}: ChartLegendProps) {
  return (
    <ul className={['gv-chart-legend', `gv-chart-legend--${shape}`, `gv-chart-legend--${align}`, className].filter(Boolean).join(' ')}>
      {items.map((it, i) => (
        <li key={i} className="gv-chart-legend__item">
          <span className="gv-chart-legend__swatch" data-chart-color={it.color} aria-hidden />
          {it.label}
        </li>
      ))}
    </ul>
  );
}

/* ───────────────────────────── Line chart ───────────────────────────── */

export interface LineChartProps {
  /** One or two series (Figma: Line · 1 series, Line · 2 series), one value per label. */
  series: ChartSeries[];
  /** The x axis, one label per value ("16 Feb"). */
  labels: string[];
  /** Top of the y axis. Default: a round ceiling over the data, in four steps from 0. */
  max?: number;
  /** Height of the plot area in px (axis labels add 34). Figma: 141. */
  height?: number;
  /** Draw the series legend under the chart (Dashboard card · Participation over time). */
  legend?: boolean;
  /** Replaces the generated trend sentence. */
  'aria-label'?: string;
  className?: string;
}

const VB_W = 1000;

/** Figma "Chart" · Line: gridded line chart with a y axis from 0 and dated x labels. Plain SVG. */
export function LineChart({series, labels, max, height = 141, legend = false, className, ...rest}: LineChartProps) {
  const dataMax = Math.max(0, ...series.flatMap(s => s.values));
  const scale = max != null ? {max, ticks: [0, 1, 2, 3, 4].map(i => +((i * max) / 4).toPrecision(12))} : niceScale(dataMax);
  const tones: ChartTone[] = series.map((s, i) => s.tone ?? (series.length === 1 ? 'secondary' : i === 0 ? 'primary' : 'secondary'));
  const n = Math.max(labels.length, ...series.map(s => s.values.length));
  const x = (i: number) => (n > 1 ? (i / (n - 1)) * VB_W : VB_W / 2);
  const y = (v: number) => height * (1 - v / (scale.max || 1));
  const label = rest['aria-label'] ?? describeChart(series, labels);

  return (
    <div className={['gv-line-chart', className].filter(Boolean).join(' ')} role="img" aria-label={label}>
      <div className="gv-line-chart__body" style={{'--plot-height': `${height}px`} as CSSProperties}>
        <div className="gv-line-chart__y">
          {[...scale.ticks].reverse().map(t => <span key={t}>{fmt(t)}</span>)}
        </div>
        <svg className="gv-line-chart__plot" viewBox={`0 0 ${VB_W} ${height}`} preserveAspectRatio="none" height={height} focusable="false">
          {scale.ticks.map(t => (
            <line key={t} className="gv-line-chart__grid" x1={0} x2={VB_W} y1={y(t)} y2={y(t)} vectorEffect="non-scaling-stroke" />
          ))}
          {series.map((s, i) => ({s, i})).reverse().map(({s, i}) => (
            <polyline
              key={i}
              className="gv-line-chart__line"
              data-chart-color={toneColor(tones[i])}
              points={s.values.map((v, j) => `${x(j).toFixed(1)},${y(v).toFixed(1)}`).join(' ')}
              vectorEffect="non-scaling-stroke"
            />
          ))}
        </svg>
        <div className="gv-line-chart__x">
          {labels.map((l, i) => (
            <span key={i} style={{left: `${(x(i) / VB_W) * 100}%`}}>{l}</span>
          ))}
        </div>
      </div>
      {legend && <ChartLegend items={series.map((s, i) => ({label: s.label, color: toneColor(tones[i])}))} />}
    </div>
  );
}

/* ───────────────────────────── Sparkline ───────────────────────────── */

export interface SparklineProps {
  values: number[];
  /** What is counted ("Votes cast"): starts the spoken trend. */
  label?: string;
  /** Optional dates, one per value, so the spoken trend can name the peak. */
  labels?: string[];
  /** Height in px. Figma: 110 (Votes over time); 34 fits under a KPI. */
  height?: number;
  /** Dashed guides at a quarter, half and three quarters. */
  grid?: boolean;
  /** The soft fill under the line. */
  area?: boolean;
  tone?: ChartTone;
  /** Replaces the generated trend sentence. */
  'aria-label'?: string;
  className?: string;
}

/** Figma "Chart" · Sparkline: a bare trend line with a fading fill, no axes. Plain SVG. */
export function Sparkline({values, label = 'Trend', labels, height = 110, grid = true, area = true, tone = 'primary', className, ...rest}: SparklineProps) {
  const id = 'gv-spark-' + useId().replace(/[^a-zA-Z0-9_-]/g, '');
  const pad = Math.min(8, height / 10);
  const lo = Math.min(0, ...values), hi = Math.max(lo + 1, ...values);
  const n = values.length;
  const pts = values.map((v, i) => [n > 1 ? (i / (n - 1)) * VB_W : VB_W / 2, height - pad - ((v - lo) / (hi - lo)) * (height - pad * 2)]);
  const line = pts.map(([px, py], i) => `${i ? 'L' : 'M'}${px.toFixed(1)} ${py.toFixed(1)}`).join(' ');
  const words = rest['aria-label'] ?? describeSeries(label, values, labels);

  return (
    <svg
      className={['gv-sparkline', className].filter(Boolean).join(' ')}
      data-chart-color={toneColor(tone)}
      viewBox={`0 0 ${VB_W} ${height}`}
      preserveAspectRatio="none"
      height={height}
      role="img"
      aria-label={words}
      focusable="false">
      {area && (
        <defs>
          <linearGradient id={id} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor="currentColor" stopOpacity={0.16} />
            <stop offset="1" stopColor="currentColor" stopOpacity={0} />
          </linearGradient>
        </defs>
      )}
      {grid && [0.25, 0.5, 0.75].map(f => (
        <line key={f} className="gv-sparkline__grid" x1={0} x2={VB_W} y1={height * f} y2={height * f} vectorEffect="non-scaling-stroke" />
      ))}
      {area && n > 1 && <path d={`${line} L${VB_W} ${height} L0 ${height} Z`} fill={`url(#${id})`} />}
      {n > 0 && <path className="gv-sparkline__line" d={line} vectorEffect="non-scaling-stroke" />}
    </svg>
  );
}
