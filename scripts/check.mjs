// `npm run check`: every check in one command, in the order a failure is cheapest to find: the typecheck, the unit
// guards (tests/), the build, then the browser tests (e2e/) against the build. The e2e server listens on E2E_PORT
// (4173 when unset), as in playwright.config.ts: pick a free one when another run is going.
//
// It stops at the first red step. Each full run's counts are written to src/overview/checks-last-run.json, which
// Overview/Checks shows (`--no-save` skips that). Extra arguments go to Playwright (`npm run check -- --workers=2`);
// naming spec files makes a partial run, which is not saved.
import {spawn, execSync} from 'node:child_process';
import {existsSync, readFileSync, rmSync, writeFileSync} from 'node:fs';
import {tmpdir} from 'node:os';
import {dirname, join, resolve} from 'node:path';

const ROOT = resolve(import.meta.dirname, '..');
const OUT = join(ROOT, 'src/overview/checks-last-run.json');
const npm = join(dirname(process.execPath), 'npm');
const npx = join(dirname(process.execPath), 'npx');
const save = !process.argv.includes('--no-save');
const extra = process.argv.slice(2).filter(a => a !== '--no-save');
const tmp = name => join(tmpdir(), `govocal-check-${process.pid}-${name}.json`);

function run(cmd, args, env = {}) {
  return new Promise(done => {
    const child = spawn(cmd, args, {cwd: ROOT, stdio: 'inherit', env: {...process.env, ...env}});
    child.on('close', code => done(code ?? 1));
  });
}

/** Per test file: passed, failed, skipped. */
function vitestCounts(file) {
  if (!existsSync(file)) return null;
  const json = JSON.parse(readFileSync(file, 'utf8'));
  const files = {};
  for (const r of json.testResults) {
    const c = {passed: 0, failed: 0, skipped: 0};
    for (const a of r.assertionResults) c[a.status === 'passed' ? 'passed' : a.status === 'failed' ? 'failed' : 'skipped']++;
    files[r.name.slice(ROOT.length + 1)] = c;
  }
  return files;
}

function playwrightCounts(file) {
  if (!existsSync(file)) return null;
  const json = JSON.parse(readFileSync(file, 'utf8'));
  const files = {};
  const walk = (suite, path) => {
    for (const spec of suite.specs ?? []) for (const t of spec.tests) {
      const c = (files[`e2e/${spec.file ?? path}`] ??= {passed: 0, failed: 0, skipped: 0, flaky: 0});
      const status = t.status === 'expected' ? 'passed' : t.status === 'unexpected' ? 'failed' : t.status === 'flaky' ? 'flaky' : 'skipped';
      c[status]++;
    }
    for (const s of suite.suites ?? []) walk(s, s.file ?? path);
  };
  for (const s of json.suites) walk(s, s.file);
  return files;
}

const total = files => Object.values(files ?? {}).reduce((t, c) => {
  for (const [k, v] of Object.entries(c)) t[k] = (t[k] ?? 0) + v;
  return t;
}, {});

const steps = [
  {name: 'typecheck', label: 'Typecheck', cmd: npm, args: ['run', 'typecheck']},
  {name: 'unit', label: 'Unit guards (tests/)', cmd: npx, args: ['vitest', 'run', '--reporter=default', '--reporter=json',
    `--outputFile.json=${tmp('vitest')}`], counts: () => vitestCounts(tmp('vitest'))},
  {name: 'build', label: 'Build', cmd: npm, args: ['run', 'build']},
  {name: 'e2e', label: `Browser tests (e2e/), port ${process.env.E2E_PORT ?? '4173'}`, cmd: npx,
    args: ['playwright', 'test', '--reporter=list,json', ...extra],
    env: {PLAYWRIGHT_JSON_OUTPUT_NAME: tmp('playwright')}, counts: () => playwrightCounts(tmp('playwright'))}
];

const result = {ranAt: new Date().toISOString(), commit: execSync('git rev-parse --short HEAD', {cwd: ROOT, encoding: 'utf8'}).trim(),
  partial: extra.some(a => !a.startsWith('-')), steps: []};
let ok = true;
for (const step of steps) {
  if (!ok) { result.steps.push({name: step.name, label: step.label, status: 'not run'}); continue; }
  console.log(`\n▶ ${step.label}`);
  const started = Date.now();
  const code = await run(step.cmd, step.args, step.env);
  const files = step.counts?.() ?? null;
  const entry = {name: step.name, label: step.label, status: code === 0 ? 'passed' : 'failed',
    seconds: Math.round((Date.now() - started) / 1000)};
  if (files) Object.assign(entry, {totals: total(files), files});
  result.steps.push(entry);
  ok = code === 0;
}
for (const name of ['vitest', 'playwright']) rmSync(tmp(name), {force: true});

console.log('\n' + result.steps.map(s => `${s.status === 'passed' ? '✓' : s.status === 'failed' ? '✗' : '·'} ${s.label}: ${s.status}` +
  (s.totals ? ` (${Object.entries(s.totals).filter(([, v]) => v).map(([k, v]) => `${v} ${k}`).join(', ')})` : '') +
  (s.seconds !== undefined ? `, ${s.seconds} s` : '')).join('\n'));
if (save && !result.partial) {
  writeFileSync(OUT, JSON.stringify(result, null, 2) + '\n');
  console.log(`Saved to ${OUT.slice(ROOT.length + 1)} for Overview/Checks.`);
}
process.exitCode = ok ? 0 : 1;
