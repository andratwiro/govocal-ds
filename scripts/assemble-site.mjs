import {copyFile, mkdir, access} from 'node:fs/promises';
await mkdir('dist', {recursive: true});
await copyFile('site/index.html', 'dist/index.html');
// The token set as DTCG, beside Storybook: the closed set an agent picks from (npm run tokens:build writes it).
await copyFile('public/tokens.json', 'dist/tokens.json');
for (const part of ['storybook', 'backoffice']) {
  await access(`dist/${part}/index.html`).catch(() => { throw new Error(`dist/${part} missing: run its build first`); });
}
console.log('dist/ assembled');
