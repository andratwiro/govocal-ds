/// <reference types="vite/client" />
'use client';
import {useEffect, useRef, useState, type CSSProperties} from 'react';
import {illustrationNames, type IllustrationName} from '../../illustrations/names';
import './Illustration.css';

export type {IllustrationName};

/**
 * How an illustration moves.
 * - `auto` (default): plays for at most 5 s once it is on screen, then rests on its still (WCAG 2.2.2). A scene whose
 *   story is longer than 5 s rests until hovered instead.
 * - `once`: plays its story one time, then rests.
 * - `loop`: plays until paused. Only where the person started it or a pause control is next to it.
 * - `hover`: rests; plays while the pointer is over it (or over the nearest `[data-illustration-host]`, e.g. a card)
 *   or keyboard focus is inside that host. Each hover starts the story again.
 * - `still`: never moves.
 * Reduced motion always shows the still.
 */
export type IllustrationMotion = 'auto' | 'once' | 'loop' | 'hover' | 'still';

export type IllustrationGroup = 'Empty states' | 'Method scenes' | 'Other';

export interface IllustrationInfo {
  /** Its name, as `Illustration`'s `name` takes it. */
  name: IllustrationName;
  /** The drawing's own size (its viewBox). */
  width: number;
  /** The drawing's own height (its viewBox). */
  height: number;
  /** The gallery group it is listed under. */
  group: IllustrationGroup;
  /** The motion it is drawn for. */
  motion: IllustrationMotion;
  /**
   * One run of its story in cycles of the loop motion token (the file's `--gvi-cycle`); 0 = it never moves. In
   * seconds: `cycleSeconds(info)`.
   */
  loops: number;
  /** Widths (px) it is meant to be shown at. */
  sizes: number[];
  /** Where it comes from in the prototype. */
  source: string;
}

const files = import.meta.glob('../../illustrations/*.svg', {query: '?raw', import: 'default', eager: true}) as Record<
  string,
  string
>;

const attr = (svg: string, name: string) => svg.match(new RegExp(`<svg[^>]*\\s${name}="([^"]*)"`))?.[1] ?? '';

function read(name: IllustrationName): {svg: string; info: IllustrationInfo} {
  const svg = files[`../../illustrations/${name}.svg`] ?? '';
  const [, , w = 0, h = 0] = attr(svg, 'viewBox').split(/\s+/).map(Number);
  return {
    svg,
    info: {
      name,
      width: w,
      height: h,
      group: (attr(svg, 'data-group') || 'Other') as IllustrationGroup,
      motion: (attr(svg, 'data-motion') || 'still') as IllustrationMotion,
      loops: Number(svg.match(/--gvi-cycle:\s*calc\(var\(--gv-motion-duration-loop\)\s*\*\s*([\d.]+)\)/)?.[1]) || 0,
      sizes: attr(svg, 'data-sizes').split(/\s+/).filter(Boolean).map(Number),
      source: attr(svg, 'data-source')
    }
  };
}

const registry = Object.fromEntries(illustrationNames.map(n => [n, read(n)])) as Record<
  IllustrationName,
  ReturnType<typeof read>
>;

/** Every illustration with what the gallery shows about it, in name order. */
export const illustrations: IllustrationInfo[] = illustrationNames.map(n => registry[n].info);

/** Nothing moves unbidden for longer than this (WCAG 2.2.2 Pause, Stop, Hide). */
export const AUTO_LIMIT_S = 5;

/** The loop motion token in seconds as the page has it (1.6 s where the tokens aren't loaded). */
export function loopSeconds(): number {
  if (typeof document === 'undefined') return 1.6;
  const v = getComputedStyle(document.documentElement).getPropertyValue('--gv-motion-duration-loop').trim();
  const m = v.match(/^([\d.]+)(m?s)$/);
  return m ? Number(m[1]) / (m[2] === 'ms' ? 1000 : 1) : 1.6;
}

/** Seconds one run of an illustration's story takes; 0 = it never moves. */
export const cycleSeconds = (info: IllustrationInfo) => info.loops * loopSeconds();

type Plan = {kind: 'still'} | {kind: 'loop'} | {kind: 'hover'} | {kind: 'timed'; ms: number};

export function motionPlan(motion: IllustrationMotion, cycle: number): Plan {
  if (!cycle || motion === 'still') return {kind: 'still'};
  if (motion === 'loop') return {kind: 'loop'};
  if (motion === 'hover') return {kind: 'hover'};
  if (motion === 'once') return {kind: 'timed', ms: cycle * 1000};
  if (cycle > AUTO_LIMIT_S) return {kind: 'hover'};
  return {kind: 'timed', ms: Math.floor(AUTO_LIMIT_S / cycle) * cycle * 1000};
}

const prefersReduced = () =>
  typeof window !== 'undefined' && typeof window.matchMedia === 'function' &&
  window.matchMedia('(prefers-reduced-motion: reduce)').matches;

export interface IllustrationProps {
  /** Which illustration (a file in src/illustrations/). */
  name: IllustrationName;
  /** Width in px; the height follows the drawing. Default: the drawing's own width. */
  size?: number;
  /**
   * Crops the drawing to this height (px) around its middle. A method scene is a square stage whose middle band is
   * its cover: the picker card at rest shows `size={320} height={168}`.
   */
  height?: number;
  /** @default 'auto' */
  motion?: IllustrationMotion;
  /** Freezes the animation where it is (animation-play-state on the root), e.g. from a pause button. */
  isPaused?: boolean;
  /** What the picture says, when it says something the text around it doesn't. Leave out for decoration. */
  alt?: string;
  /** Places the illustration (a margin, a grid area); never paints it. */
  className?: string;
  /** Places the illustration; it can't change the drawing. */
  style?: CSSProperties;
}

/**
 * An illustration: one self-contained SVG file drawn inline, so it paints with the page's `--gv-*` tokens. Content,
 * not a component: the drawings live in src/illustrations/ and the designer owns them. Not in Figma.
 */
export function Illustration({name, size, height, motion = 'auto', isPaused, alt, className, style}: IllustrationProps) {
  const {svg, info} = registry[name];
  const plan = motionPlan(motion, cycleSeconds(info));
  const ref = useRef<HTMLSpanElement>(null);
  const [playing, setPlaying] = useState(plan.kind === 'loop');
  const [reduced, setReduced] = useState(prefersReduced);

  useEffect(() => {
    if (typeof window === 'undefined' || typeof window.matchMedia !== 'function') return;
    const q = window.matchMedia('(prefers-reduced-motion: reduce)');
    const sync = () => setReduced(q.matches);
    q.addEventListener('change', sync);
    return () => q.removeEventListener('change', sync);
  }, []);

  const planKey = plan.kind === 'timed' ? `timed:${plan.ms}` : plan.kind;
  useEffect(() => {
    const el = ref.current;
    if (!el || reduced) return setPlaying(false);
    if (plan.kind === 'still') return setPlaying(false);
    if (plan.kind === 'loop') return setPlaying(true);
    if (plan.kind === 'hover') {
      setPlaying(false);
      const host = (el.closest('[data-illustration-host]') as HTMLElement | null) ?? el;
      const on = () => setPlaying(true);
      const off = () => setPlaying(false);
      const blur = (e: FocusEvent) => { if (!host.contains(e.relatedTarget as Node | null)) off(); };
      host.addEventListener('pointerenter', on);
      host.addEventListener('pointerleave', off);
      host.addEventListener('focusin', on);
      host.addEventListener('focusout', blur);
      return () => {
        host.removeEventListener('pointerenter', on);
        host.removeEventListener('pointerleave', off);
        host.removeEventListener('focusin', on);
        host.removeEventListener('focusout', blur);
      };
    }
    // Timed: start when it is first on screen, rest a beat before the last run ends (its last frame is the still).
    const ms = plan.ms;
    let timer: ReturnType<typeof setTimeout> | undefined;
    const start = () => {
      setPlaying(true);
      timer = setTimeout(() => setPlaying(false), Math.max(0, ms - 80));
    };
    if (typeof IntersectionObserver === 'undefined') {
      start();
      return () => clearTimeout(timer);
    }
    setPlaying(false);
    const io = new IntersectionObserver(entries => {
      if (entries.some(e => e.isIntersecting)) {
        io.disconnect();
        start();
      }
    }, {threshold: 0.25});
    io.observe(el);
    return () => {
      io.disconnect();
      clearTimeout(timer);
    };
    // planKey stands for plan; name restarts the story when the drawing changes.
  }, [planKey, reduced, name]); // eslint-disable-line react-hooks/exhaustive-deps

  const w = size ?? info.width;
  const box: CSSProperties = height !== undefined
    ? {width: w, height}
    : {width: w, aspectRatio: `${info.width} / ${info.height}`};

  return (
    <span
      ref={ref}
      className={['gv-illustration', className].filter(Boolean).join(' ')}
      data-name={name}
      data-motion={motion}
      data-state={playing ? 'play' : 'rest'}
      data-paused={isPaused || undefined}
      role={alt ? 'img' : undefined}
      aria-label={alt || undefined}
      aria-hidden={alt ? undefined : true}
      style={{...box, ...style}}
      dangerouslySetInnerHTML={{__html: svg}}
    />
  );
}
