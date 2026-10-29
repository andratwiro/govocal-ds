import {defineConfig} from '@playwright/test';
// E2E_PORT lets worktrees run their e2e side by side; each serves its own dist.
const port = process.env.E2E_PORT ?? '4173';
export default defineConfig({
  testDir: 'e2e',
  // On CI, failures also become annotations on the run, readable without the job log.
  reporter: process.env.CI ? [['github'], ['list']] : 'list',
  use: {baseURL: `http://127.0.0.1:${port}`},
  webServer: {command: `node scripts/lib/serve.mjs dist ${port}`, url: `http://127.0.0.1:${port}`, reuseExistingServer: true}
});
