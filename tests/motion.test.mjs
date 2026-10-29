import {describe, it, expect} from 'vitest';
import {readFileSync, readdirSync} from 'node:fs';

// Every stylesheet under src/ except the generated tokens.css, which is where the motion values live.
const css = readdirSync('src', {recursive: true}).filter(f => f.endsWith('.css') && f !== 'tokens.css')
  .map(f => [`src/${f}`, readFileSync(`src/${f}`, 'utf8')]);

const TIME = /(?<![\w.-])-?\d*\.?\d+m?s\b/g; // 120ms, .15s, 1.6s, -1s
const ZERO = /^-?0*\.?0+m?s$/; // 0s and 0ms are allowed
const EASING = /(?<![\w-])(ease|ease-in|ease-out|ease-in-out|linear|step-start|step-end)(?![\w-])|(?<![\w-])(cubic-bezier|steps|linear)\(/;

// Each declaration that writes a duration, or an easing in a transition, an animation or a custom property.
export function rawMotion(source) {
  const text = source.replace(/\/\*[\s\S]*?\*\//g, c => c.replace(/[^\n]/g, ' '));
  const hits = [];
  for (const m of text.matchAll(/([a-zA-Z-]+)\s*:\s*([^;{}]+)(?=[;}])/g)) {
    const [decl, prop, value] = m;
    const time = [...value.matchAll(TIME)].some(([t]) => !ZERO.test(t));
    const easing = /^(transition|animation)|^--/.test(prop) && EASING.test(value);
    if (time || easing) hits.push(`${text.slice(0, m.index).split('\n').length}: ${decl.replace(/\s+/g, ' ').trim()}`);
  }
  return hits;
}

describe('motion comes only from tokens', () => {
  it('catches raw durations and easings, and lets tokens and zero through', () => {
    expect(rawMotion('a { transition: color 120ms ease; }')).toHaveLength(1);
    expect(rawMotion('a { transition-duration: .15s; }')).toHaveLength(1);
    expect(rawMotion('a { animation: spin 1s infinite; }')).toHaveLength(1);
    expect(rawMotion('a { transition-timing-function: cubic-bezier(0.2, 0, 0, 1); }')).toHaveLength(1);
    expect(rawMotion('a { --curve: ease-out; }')).toHaveLength(1);
    expect(rawMotion('a {\n  transition:\n    opacity var(--gv-motion-duration-fast) linear;\n}')).toEqual(['2: transition: opacity var(--gv-motion-duration-fast) linear']);
    expect(rawMotion('a { transition: color var(--gv-motion-duration-fast) var(--gv-motion-easing-standard); }')).toEqual([]);
    expect(rawMotion('a { transition: none; transition-delay: 0s; animation-duration: 0ms; }')).toEqual([]);
    expect(rawMotion('a { background: linear-gradient(var(--x), var(--y)); animation-name: ease-pulse; }')).toEqual([]);
    expect(rawMotion('/* fades in 120 ms, ease */ a { width: 14px; }')).toEqual([]);
  });

  it('src CSS uses durations and easings only via var(--gv-motion-*)', () => {
    const offenders = css.flatMap(([f, s]) => rawMotion(s).map(hit => `${f}:${hit}`));
    expect(offenders).toEqual([]);
  });

  it('every loop stops under reduced motion (the loop token is not shortened: a 1ms loop would flicker)', () => {
    const loops = css.filter(([, s]) => /\binfinite\b/.test(s.replace(/\/\*[\s\S]*?\*\//g, '')));
    const unstopped = loops.filter(([, s]) => !/prefers-reduced-motion:\s*reduce\)[^]*?animation:\s*none/.test(s)).map(([f]) => f);
    expect(loops.length).toBeGreaterThan(0);
    expect(unstopped).toEqual([]);
  });
});
