import {describe, it, expect} from 'vitest';
import {scanUsage} from '../scripts/lib/usage.mjs';

describe('scanUsage', () => {
  const map = scanUsage([
    {path: 'src/components/Button.css', text: '.b{color:var(--gv-text-inverse);background:var(--gv-action-primary)}'},
    {path: 'src/components/Menu.css', text: '.m{background:var(--gv-action-primary)}'},
    {path: 'backoffice/src/layout.css', text: 'body{background:var(--gv-surface-app, var(--gv-surface-panel))}'}
  ]);
  it('maps each token to the components that use it', () => {
    expect(map['--gv-action-primary']).toEqual(['Button', 'Menu']);
    expect(map['--gv-surface-panel']).toEqual(['Back office']);
  });
});
