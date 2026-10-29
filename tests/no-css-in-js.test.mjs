import {describe, it, expect} from 'vitest';
import {readFileSync, readdirSync, statSync, existsSync} from 'node:fs';
import {join} from 'node:path';

// The platform is moving away from styled-components (29 Oct 2026): styles live in .css files on var(--gv-*).
const BANNED = /^(styled-components|@emotion\/.*|@stitches\/.*|@vanilla-extract\/.*|@linaria\/.*|tailwindcss|twin\.macro)$/;

const files = dir => readdirSync(dir).flatMap(f => {
  const p = join(dir, f);
  return statSync(p).isDirectory() ? files(p) : [p];
});

export const bannedDeps = pkg =>
  Object.keys({...pkg.dependencies, ...pkg.devDependencies, ...pkg.peerDependencies}).filter(d => BANNED.test(d));
export const bannedImports = (path, text) =>
  [...text.matchAll(/(?:from\s+|import\s+|require\()\s*['"]([^'"]+)['"]/g)]
    .filter(([, spec]) => BANNED.test(spec)).map(([, spec]) => `${path}: ${spec}`);

describe('no CSS-in-JS', () => {
  it('catches a styled-components dependency and import', () => {
    expect(bannedDeps({dependencies: {react: '18.3.1', 'styled-components': '6'}, devDependencies: {'@emotion/react': '11'}}))
      .toEqual(['styled-components', '@emotion/react']);
    expect(bannedImports('x.tsx', "import styled from 'styled-components';\nimport {Button} from './Button';"))
      .toEqual(['x.tsx: styled-components']);
  });
  it('package.json has none', () => {
    expect(bannedDeps(JSON.parse(readFileSync('package.json', 'utf8')))).toEqual([]);
  });
  it('no source file imports one', () => {
    const src = ['src', 'backoffice/src', '.storybook'].filter(existsSync).flatMap(files)
      .filter(f => /\.(ts|tsx|js|jsx|mjs)$/.test(f));
    expect(src.flatMap(f => bannedImports(f, readFileSync(f, 'utf8')))).toEqual([]);
  });
});
