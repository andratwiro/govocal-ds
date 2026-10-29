import {copyFile, mkdir, access} from 'node:fs/promises';
await mkdir('dist', {recursive: true});
await copyFile('site/index.html', 'dist/index.html');
for (const part of ['storybook', 'backoffice']) {
  await access(`dist/${part}/index.html`).catch(() => { throw new Error(`dist/${part} missing: run its build first`); });
}
console.log('dist/ assembled');
