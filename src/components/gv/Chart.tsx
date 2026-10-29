import {useId, useRef, useState, type CSSProperties, type KeyboardEvent, type PointerEvent, type ReactNode} from 'react';
import './Chart.css';
import type {PlacementProps} from '../className';

/**
 * The chart palette, one name per `--gv-chart-*` token. Anything that draws data (lines, bars,
 * swatches) takes one of these, never a raw colour.
 */
export type ChartColor =
  | 'line-primary' | 'line-secondary' | 'bar'
  | 'agree' | 'disagree' | 'pass'
  | 'blue-1' | 'blue-2' | 'blue-3' | 'blue-4' | 'blue-5'
  | 'green' | 'olive' | 'terracotta';


export interface ChartSeries {
  /** What the line counts ("Participants"): used in the legend and the spoken trend. */
  label: string;
  values: number[];
  /**
   * The line's colour. Figma draws lines in `line-primary` (brand) or `line-secondary` (orange). Defaults: one
   * series → `line-secondary` (as Figma's Line · 1 series); two → `line-primary`, then `line-secondary`.
   */
  color?: ChartColor;
}

const fmt = (n: number) => n.toLocaleString('en-GB', {maximumFractionDigits: 2});

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


/** One point in words, for the value card and the keyboard explorer: "23 Feb: Participants 0, Visitors 3". */
export function describePoint(series: {label: string; values: number[]}[], labels: string[] | undefined, i: number): string {
  const values = series.filter(s => s.values[i] != null).map(s => `${s.label} ${fmt(s.values[i])}`).join(', ');
  return labels?.[i] ? `${labels[i]}: ${values}` : values;
}

/** The point nearest a place across the plot (0 at the start, 1 at the end). */
export function nearestIndex(t: number, n: number): number {
  return n > 1 ? Math.round(Math.min(1, Math.max(0, t)) * (n - 1)) : 0;
}

const cx = (...c: (string | false | null | undefined)[]) => c.filter(Boolean).join(' ');

/* ───────────────────────────── Legend ───────────────────────────── */

export interface ChartLegendItem {
  label: ReactNode;
  color: ChartColor;
}

export interface ChartLegendProps extends PlacementProps {
  items: ChartLegendItem[];
  /**
   * The swatch: `dot`, round 9px (line charts); `square`, 8px, radius 2 (Statements: agree / disagree / pass).
   * @default 'dot'
   */
  variant?: 'dot' | 'square';
  align?: 'center' | 'start';
  /** The series picked out (its index): the other items dim, as their series do. */
  highlightedSeries?: number | null;
  /**
   * Hovering or focusing an item picks its series out (`index`), leaving gives `null`. When set, each item takes a
   * tab stop so the keyboard reaches it too. LineChart's own legend (`showLegend`) wires it to the lines.
   */
  onHighlightChange?: (index: number | null) => void;
}

/** The key under a chart: a swatch and a word per series. */
export function ChartLegend({items, variant = 'dot', align = 'center', highlightedSeries: highlighted = null, onHighlightChange, className, style}: ChartLegendProps) {
  const on = onHighlightChange;
  return (
    <ul className={cx('gv-chart-legend', `gv-chart-legend--${variant}`, `gv-chart-legend--${align}`, className)} style={style}>
      {items.map((it, i) => (
        <li
          key={i}
          className="gv-chart-legend__item"
          data-dimmed={(highlighted != null && highlighted !== i) || undefined}
          data-highlighted={highlighted === i || undefined}
          tabIndex={on ? 0 : undefined}
          onPointerEnter={on && (() => on(i))}
          onPointerLeave={on && (() => on(null))}
          onFocus={on && (() => on(i))}
          onBlur={on && (() => on(null))}>
          <span className="gv-chart-legend__swatch" data-chart-color={it.color} aria-hidden />
          {it.label}
        </li>
      ))}
    </ul>
  );
}

/* ───────────────────────────── Explorer: the hover and keyboard value card ─────────────────────────────
   Not in Figma (its charts are static). The prototype's dashboards show a marker and a value card under the
   pointer, and a back-office reader needs exact values, so every chart has them: the pointer picks the nearest
   point; the keyboard reaches the same through one tab stop on the plot (a slider over the points: arrows step,
   Home and End jump, Esc hides the card). The card is drawn for the eye only; the slider says the same words.
   React Aria has no chart parts, and its hover and focus hooks live in a package this one doesn't depend on, so
   these are plain pointer and key events; the focus ring is CSS :focus-visible. Chart coordinates are physical
   (time runs left to right in every language), so the layers are placed with `left` and the arrows are physical. */

interface ExploreSeries {
  label: string;
  color: ChartColor;
  values: number[];
}

interface ChartStageProps {
  className?: string;
  style?: CSSProperties;
  /** The drawing (an svg filling the stage). */
  children: ReactNode;
  interactive: boolean;
  /** The slider's name ("Participants and Visitors values"). */
  name: string;
  series: ExploreSeries[];
  /** One per point: the card's title and the start of the spoken value. */
  labels?: string[];
  n: number;
  /** A point's place across the stage, 0–1. */
  xAt: (i: number) => number;
  /** A point's height in the stage, 0 (top) – 1 (bottom). */
  yAt: (series: number, i: number) => number;
  /** The series picked out from outside (a legend): its card row is strong, the others' dots dim. */
  emphasis: number | null;
  /** The line under the pointer (within 12px of it), or null. */
  onHoverSeries?: (series: number | null) => void;
  /** The point shown, or null when the card is hidden. */
  onActiveChange?: (i: number | null) => void;
}

/** How close the pointer must come to a line to pick it out. */
const LINE_REACH = 12;

function ChartStage({className, style, children, interactive, name, series, labels, n, xAt, yAt, emphasis, onHoverSeries, onActiveChange}: ChartStageProps) {
  const ref = useRef<HTMLDivElement>(null);
  const [index, setIndex] = useState(0);
  /** Who shows the card: the pointer, the keyboard, or nobody. */
  const [shown, setShown] = useState<'pointer' | 'keyboard' | null>(null);
  const keyboard = useRef(false);

  const show = (i: number, by: 'pointer' | 'keyboard') => {
    setIndex(i);
    setShown(by);
    onActiveChange?.(i);
  };
  const hide = () => {
    setShown(null);
    onActiveChange?.(null);
  };

  const onPointer = (e: PointerEvent<HTMLDivElement>) => {
    const box = ref.current?.getBoundingClientRect();
    if (!box || !box.width || !n) return;
    const t = (e.clientX - box.left) / box.width;
    show(nearestIndex(t, n), 'pointer');
    if (!onHoverSeries) return;
    // The line under the pointer: each series' height at the pointer's x, between its two nearest points.
    const p = Math.min(1, Math.max(0, t)) * Math.max(0, n - 1);
    const i0 = Math.floor(p), i1 = Math.min(n - 1, Math.ceil(p));
    let best: number | null = null, bestGap = LINE_REACH;
    series.forEach((s, k) => {
      if (s.values[i0] == null || s.values[i1] == null) return;
      const y = (yAt(k, i0) + (yAt(k, i1) - yAt(k, i0)) * (p - i0)) * box.height;
      const gap = Math.abs(e.clientY - box.top - y);
      if (gap <= bestGap) { best = k; bestGap = gap; }
    });
    onHoverSeries(best);
  };

  const onLeave = () => {
    onHoverSeries?.(null);
    if (keyboard.current) setShown('keyboard');
    else hide();
  };

  const onKeyDown = (e: KeyboardEvent<HTMLDivElement>) => {
    const step: Record<string, number> = {ArrowRight: 1, ArrowUp: 1, ArrowLeft: -1, ArrowDown: -1};
    if (e.key in step) show(Math.min(n - 1, Math.max(0, index + step[e.key])), 'keyboard');
    else if (e.key === 'Home') show(0, 'keyboard');
    else if (e.key === 'End') show(n - 1, 'keyboard');
    else if (e.key === 'Escape' && shown) {
      // Only a shown card takes Esc; with none, Esc goes on to close the dialog the chart sits in.
      hide();
      e.stopPropagation();
    } else return;
    e.preventDefault();
  };

  const x = xAt(index);
  const text = describePoint(series, labels, index);
  const picked = emphasis;

  return (
    <div
      ref={ref}
      className={cx('gv-chart-stage', className)}
      style={style}
      data-exploring={shown ?? undefined}
      onPointerMove={interactive ? onPointer : undefined}
      onPointerDown={interactive ? onPointer : undefined}
      onPointerLeave={interactive ? onLeave : undefined}>
      {children}
      {interactive && shown && n > 0 && (
        <>
          <span className="gv-chart-guide" style={{left: `${x * 100}%`}} aria-hidden />
          {series.map((s, k) =>
            s.values[index] == null ? null : (
              <span
                key={k}
                className="gv-chart-dot"
                data-chart-color={s.color}
                data-dimmed={(picked != null && picked !== k) || undefined}
                style={{left: `${x * 100}%`, top: `${yAt(k, index) * 100}%`}}
                aria-hidden
              />
            )
          )}
          <div className="gv-chart-card" data-side={x > 0.5 ? 'before' : 'after'} style={{left: `${x * 100}%`}} aria-hidden>
            {labels?.[index] && <div className="gv-chart-card__title">{labels[index]}</div>}
            {series.map((s, k) =>
              s.values[index] == null ? null : (
                <div key={k} className="gv-chart-card__row" data-highlighted={picked === k || undefined}>
                  <span className="gv-chart-card__swatch" data-chart-color={s.color} />
                  <span className="gv-chart-card__label">{s.label}</span>
                  <span className="gv-chart-card__value">{fmt(s.values[index])}</span>
                </div>
              )
            )}
          </div>
        </>
      )}
      {interactive && n > 0 && (
        <div
          className="gv-chart-explore"
          role="slider"
          tabIndex={0}
          aria-label={name}
          aria-orientation="horizontal"
          aria-valuemin={1}
          aria-valuemax={n}
          aria-valuenow={index + 1}
          aria-valuetext={text}
          onKeyDown={onKeyDown}
          onFocus={e => {
            keyboard.current = e.currentTarget.matches(':focus-visible');
            if (keyboard.current) show(index, 'keyboard');
          }}
          onBlur={() => {
            keyboard.current = false;
            hide();
          }}
        />
      )}
    </div>
  );
}

/* ───────────────────────────── Line chart ───────────────────────────── */

export interface LineChartProps extends PlacementProps {
  /** One or two series (Figma: Line · 1 series, Line · 2 series), one value per label. */
  series: ChartSeries[];
  /** The x axis, one label per value ("16 Feb"). */
  labels: string[];
  /** Top of the y axis. Default: a round ceiling over the data, in four steps from 0. */
  max?: number;
  /** Height of the plot area in px (axis labels add 34). Figma: 141. */
  height?: number;
  /** Draw the series legend under the chart (Dashboard card · Participation over time). @default false */
  showLegend?: boolean;
  /**
   * The hover and keyboard value card (Not in Figma): a marker and the values at the nearest point; the plot is one
   * tab stop, arrows step through the points. Off for a chart drawn only as a picture.
   * @default true
   */
  isInteractive?: boolean;
  /**
   * A series picked out from outside the chart (its index), as a Legend row beside it does: the others dim.
   * The chart's own legend and the pointer pick one out by themselves.
   */
  highlightedSeries?: number | null;
  /** Replaces the generated trend sentence. */
  'aria-label'?: string;
}

const VB_W = 1000;

/** Figma "Chart" · Line: gridded line chart with a y axis from 0 and dated x labels. Plain SVG. */
export function LineChart({series, labels, max, height = 141, showLegend = false, isInteractive: interactive = true, highlightedSeries = null, className, style, ...rest}: LineChartProps) {
  const [legendPick, setLegendPick] = useState<number | null>(null);
  const [hovered, setHovered] = useState<number | null>(null);
  const [active, setActive] = useState<number | null>(null);
  const dataMax = Math.max(0, ...series.flatMap(s => s.values));
  const scale = max != null ? {max, ticks: [0, 1, 2, 3, 4].map(i => +((i * max) / 4).toPrecision(12))} : niceScale(dataMax);
  const n = Math.max(labels.length, ...series.map(s => s.values.length));
  const x = (i: number) => (n > 1 ? (i / (n - 1)) * VB_W : VB_W / 2);
  const y = (v: number) => height * (1 - v / (scale.max || 1));
  const label = rest['aria-label'] ?? describeChart(series, labels);
  // Outside first (a Legend row beside the chart), then the chart's own legend, then the line under the pointer.
  const picked = highlightedSeries ?? legendPick ?? hovered;
  const colors: ChartColor[] = series.map((s, i) =>
    s.color ?? (series.length === 1 || i > 0 ? 'line-secondary' : 'line-primary'));

  return (
    <div className={cx('gv-line-chart', className)} style={style}>
      <div className="gv-line-chart__body" style={{'--plot-height': `${height}px`} as CSSProperties}>
        <div className="gv-line-chart__y" aria-hidden>
          {[...scale.ticks].reverse().map(t => <span key={t}>{fmt(t)}</span>)}
        </div>
        <ChartStage
          className="gv-line-chart__stage"
          interactive={interactive}
          name={`${series.map(s => s.label).join(' and ')} values`}
          series={series.map((s, i) => ({label: s.label, color: colors[i], values: s.values}))}
          labels={labels}
          n={n}
          xAt={i => x(i) / VB_W}
          yAt={(k, i) => y(series[k].values[i]) / height}
          emphasis={picked}
          onHoverSeries={setHovered}
          onActiveChange={setActive}>
          <svg className="gv-line-chart__plot" viewBox={`0 0 ${VB_W} ${height}`} preserveAspectRatio="none" height={height} role="img" aria-label={label} focusable="false">
            {scale.ticks.map(t => (
              <line key={t} className="gv-line-chart__grid" x1={0} x2={VB_W} y1={y(t)} y2={y(t)} vectorEffect="non-scaling-stroke" />
            ))}
            {series.map((s, i) => ({s, i})).reverse().map(({s, i}) => (
              <polyline
                key={i}
                className="gv-line-chart__line"
                data-chart-color={colors[i]}
                data-highlighted={picked === i || undefined}
                data-dimmed={(picked != null && picked !== i) || undefined}
                points={s.values.map((v, j) => `${x(j).toFixed(1)},${y(v).toFixed(1)}`).join(' ')}
                vectorEffect="non-scaling-stroke"
              />
            ))}
          </svg>
        </ChartStage>
        <div className="gv-line-chart__x" aria-hidden>
          {labels.map((l, i) => (
            <span key={i} data-active={active === i || undefined} style={{left: `${(x(i) / VB_W) * 100}%`}}>{l}</span>
          ))}
        </div>
      </div>
      {showLegend && (
        <ChartLegend
          items={series.map((s, i) => ({label: s.label, color: colors[i]}))}
          highlightedSeries={highlightedSeries ?? legendPick}
          onHighlightChange={interactive ? setLegendPick : undefined}
        />
      )}
    </div>
  );
}

/* ───────────────────────────── Sparkline ───────────────────────────── */

export interface SparklineProps extends PlacementProps {
  values: number[];
  /** What is counted ("Votes cast"): starts the spoken trend and names the value card's row. */
  label?: string;
  /** Optional dates, one per value, so the spoken trend can name the peak and the value card its date. */
  labels?: string[];
  /** Height in px. Figma: 110 (Votes over time); 34 fits under a Stat tile. */
  height?: number;
  /** Dashed guides at a quarter, half and three quarters. @default true */
  showGrid?: boolean;
  /** The soft fill under the line. @default true */
  showArea?: boolean;
  /** The line's colour. @default 'line-primary' */
  color?: ChartColor;
  /**
   * The hover and keyboard value card, as on LineChart. On when `labels` name the points (the card says when);
   * off inside something pressable (a Stat card that opens a detail), where a second tab stop can't sit.
   * @default labels != null
   */
  isInteractive?: boolean;
  /** Replaces the generated trend sentence. */
  'aria-label'?: string;
}

/** Figma "Chart" · Sparkline: a bare trend line with a fading fill, no axes. Plain SVG. */
export function Sparkline({values, label = 'Trend', labels, height = 110, showGrid: grid = true, showArea: area = true, color = 'line-primary', isInteractive: interactive = labels != null, className, style, ...rest}: SparklineProps) {
  const id = 'gv-spark-' + useId().replace(/[^a-zA-Z0-9_-]/g, '');
  const [hovered, setHovered] = useState<number | null>(null);
  const pad = Math.min(8, height / 10);
  const lo = Math.min(0, ...values), hi = Math.max(lo + 1, ...values);
  const n = values.length;
  const pts = values.map((v, i) => [n > 1 ? (i / (n - 1)) * VB_W : VB_W / 2, height - pad - ((v - lo) / (hi - lo)) * (height - pad * 2)]);
  const line = pts.map(([px, py], i) => `${i ? 'L' : 'M'}${px.toFixed(1)} ${py.toFixed(1)}`).join(' ');
  const words = rest['aria-label'] ?? describeSeries(label, values, labels);

  const svg = (
    <svg
      className={cx('gv-sparkline', !interactive && className)}
      style={interactive ? undefined : style}
      data-chart-color={color}
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
      {n > 0 && <path className="gv-sparkline__line" data-highlighted={hovered === 0 || undefined} d={line} vectorEffect="non-scaling-stroke" />}
    </svg>
  );
  if (!interactive) return svg;

  return (
    <ChartStage
      className={cx('gv-sparkline-stage', className)}
      style={style}
      interactive
      name={`${label} values`}
      series={[{label, color, values}]}
      labels={labels}
      n={n}
      xAt={i => pts[i][0] / VB_W}
      yAt={(_, i) => pts[i][1] / height}
      emphasis={null}
      onHoverSeries={setHovered}>
      {svg}
    </ChartStage>
  );
}
