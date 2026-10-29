import {defineConfig} from 'vite';
import react from '@vitejs/plugin-react';
import {readFileSync} from 'node:fs';
import {resolve} from 'node:path';

// 'govocal-ds', 'govocal-ds/base' and 'govocal-ds/tokens.css': package.json's exports are the one list of entry points.
const pkgDir = resolve(import.meta.dirname, '..');
const {name, exports} = JSON.parse(readFileSync(resolve(pkgDir, 'package.json'), 'utf8'));
const alias = Object.entries<string>(exports).map(([entry, file]) => ({
  find: new RegExp(`^${(name + entry.slice(1)).replace(/[.*+?^${}()|[\]\\/]/g, '\\$&')}$`),
  replacement: resolve(pkgDir, file)
}));

export default defineConfig({
  root: import.meta.dirname,
  base: './',
  plugins: [react()],
  resolve: {alias},
  build: {outDir: '../dist/backoffice', emptyOutDir: true}
});
