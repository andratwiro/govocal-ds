import {defineConfig} from '@playwright/test';
// E2E_PORT lets worktrees run their e2e side by side; each serves its own dist.
const port = process.env.E2E_PORT ?? '4173';
export default defineConfig({
  testDir: 'e2e',
  // On CI, failures also become annotations on the run, readable without the job log, and an HTML report with a
  // trace of the retried test is kept as the run's artifact. A test that passes on a retry shows as flaky, not red.
  reporter: process.env.CI ? [['github'], ['list'], ['html', {open: 'never'}]] : 'list',
  retries: process.env.CI ? 2 : 0,
  forbidOnly: !!process.env.CI,
  use: {baseURL: `http://127.0.0.1:${port}`, trace: 'on-first-retry'},
  webServer: {command: `node scripts/lib/serve.mjs dist ${port}`, url: `http://127.0.0.1:${port}`, reuseExistingServer: true}
});
