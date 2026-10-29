import {describe, it, expect} from 'vitest';
import {readFileSync, readdirSync} from 'node:fs';

const dir = 'src/components';
const css = readdirSync(dir).filter(f => f.endsWith('.css')).map(f => [f, readFileSync(`${dir}/${f}`, 'utf8')]);

describe('paint comes only from tokens', () => {
  it('has no raw colours outside tokens.css', () => {
    const offenders = css.filter(([, s]) => /#[0-9a-fA-F]{3,8}\b|\brgba?\(|\boklch\(|\bhsla?\(/.test(s)).map(([f]) => f);
    expect(offenders).toEqual([]);
  });
  it('has no dark-mode blocks (no dark tokens yet)', () => {
    expect(css.filter(([, s]) => s.includes('prefers-color-scheme: dark')).map(([f]) => f)).toEqual([]);
  });
  it('uses the token font, not system-ui', () => {
    expect(css.filter(([, s]) => /system-ui/.test(s)).map(([f]) => f)).toEqual([]);
  });
  it('theme.css imports the generated tokens', () => {
    expect(readFileSync(`${dir}/theme.css`, 'utf8')).toMatch(/@import ['"]\.\.\/tokens\.css['"]/);
  });
});
