import {describe, it, expect} from 'vitest';
import {readFileSync, existsSync} from 'node:fs';
import {execSync} from 'node:child_process';
import {createHash} from 'node:crypto';

// 29 Oct 2026: nothing in the repo names a person, the site or the docs. Say "Figma", "the prototype",
// "the designer", or "Not in Figma". The names are kept as hashes so this file names nobody either.
const NAMES = new Set(['6fa29cc695ff56e2', 'ad4b388c696c4250', 'f074d7b772fd6204', 'bb9942ae03a06c73',
  '0267b4de6d285df3', '3dfbf1fbdbf9d2eb', '0ab2e6e613f5649e', '7a282d3b73dd053d', 'c30d8b13bcc759e8',
  '78e0b1fdb55ecbc6', '84313ef39b0a979f', '72534c4a93ddc043']);
const HER = /\bher (prototype|Figma|tokens|system|look|spec|frames?|file|seat|account|agent)\b/i;
const TEXT = /\.(tsx?|jsx?|mjs|mdx?|css|html|json|ya?ml|txt)$/;

const hash = w => createHash('sha256').update(w).digest('hex').slice(0, 16);
export const named = (line, names = NAMES) =>
  HER.test(line) || line.toLowerCase().split(/[^a-z]+/).some(w => w && names.has(hash(w)));

describe('no names in the repo', () => {
  it('catches a name and a "her …"', () => {
    const zed = new Set([hash('zed')]);
    expect(named("Components from Zed's Figma", zed)).toBe(true);
    expect(named('Built from h' + 'er prototype')).toBe(true);
    expect(named('<EditorTool icon={Italic} label="Italic" />', zed)).toBe(false);
    expect(named('token, broken, ironed')).toBe(false);
  });
  it('no tracked file names anyone', () => {
    const tracked = execSync('git ls-files -z', {encoding: 'utf8'}).split('\0')
      .filter(f => TEXT.test(f) && f !== 'package-lock.json' && existsSync(f));
    const hits = tracked.flatMap(f => readFileSync(f, 'utf8').split('\n')
      .map((l, i) => named(l) ? `${f}:${i + 1}` : null).filter(Boolean));
    expect(hits).toEqual([]);
  });
});
