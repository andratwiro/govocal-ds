// `npm run break-it`: proof that the guards bite. It copies the repo to a temp folder (node_modules symlinked, never
// copied), makes four faults one at a time (an undefined token, a raw hex colour, a renamed prop, a missing label),
// runs the cheap checks after each (the unit guards and the typecheck: no build, no browser) and prints which check
// failed for each fault. The repo itself is never touched, except for the result, written to
// src/overview/break-it.json for Overview/Checks (`--no-save` skips that).
//
// A clean copy is checked first: a check that is already red proves nothing, so it is left out of the results.
import {spawn, execSync} from 'node:child_process';
import {cpSync, mkdtempSync, mkdirSync, readFileSync, rmSync, symlinkSync, writeFileSync, existsSync} from 'node:fs';
import {tmpdir} from 'node:os';
import {dirname, join, resolve} from 'node:path';

const ROOT = resolve(import.meta.dirname, '..');
const OUT = join(ROOT, 'src/overview/break-it.json');

/** Each fault: the file it breaks and the edit, as a mistake a person or an agent could make. */
export const FAULTS = [
  {
    name: 'An undefined token',
    file: 'src/components/gv/Badge.css',
    find: /var\(--gv-text-([a-z-]+)\)/,
    replace: 'var(--gv-text-$1-strong)',
    says: 'a guessed token name, `--gv-text-…-strong`, that tokens.css never defines'
  },
  {
    name: 'A raw hex colour',
    file: 'src/components/gv/Panel.css',
    find: /(\n\s*(?:background|background-color|color):\s*)var\(--gv-[a-z0-9-]+\)/,
    replace: '$1#e8eaed',
    says: 'a colour typed as `#e8eaed` instead of a token'
  },
  {
    name: 'A renamed prop',
    file: 'src/components/gv/Panel.tsx',
    find: /(export interface PanelProps[^{]*\{[\s\S]*?\n\s*)title(\??:)/,
    replace: '$1heading$2',
    says: "Panel's `title` prop renamed `heading`, while pages still pass `title`"
  },
  {
    name: 'A missing label',
    file: 'backoffice/src/pages/ProjectPhase.tsx',
    find: /(<IconButton\b[^>]*?) aria-label=(?:"[^"]*"|\{[^}]*\})/,
    replace: '$1',
    says: 'an icon-only button with its `aria-label` dropped, so a screen reader announces nothing'
  }
];

/** Runs a command in `cwd`; resolves with its exit code and output, never rejects. */
function run(cmd, args, cwd) {
  return new Promise(done => {
    const child = spawn(cmd, args, {cwd, env: {...process.env, FORCE_COLOR: '0', CI: ''}});
    let out = '';
    child.stdout.on('data', d => (out += d));
    child.stderr.on('data', d => (out += d));
    child.on('close', code => done({code, out}));
  });
}

const npx = join(dirname(process.execPath), 'npx');
const short = s => s.replace(/\s+/g, ' ').trim().slice(0, 220);

/** The cheap checks: the typecheck, and every unit guard. Returns the failures, one per check. */
async function checks(dir) {
  const report = join(dir, '.break-it-vitest.json');
  // One after the other: side by side they fight for memory on a busy machine, and a killed run would read as red.
  const types = await run(npx, ['tsc', '--noEmit'], dir);
  const unit = await run(npx, ['vitest', 'run', '--reporter=json', `--outputFile=${report}`, '--maxWorkers=4'], dir);
  const failed = [];
  if (unit.code !== 0) {
    const json = existsSync(report) ? JSON.parse(readFileSync(report, 'utf8')) : {testResults: []};
    for (const file of json.testResults) {
      const bad = file.assertionResults.filter(a => a.status === 'failed');
      if (!bad.length && file.status !== 'failed') continue;
      const check = file.name.slice(dir.length + 1);
      failed.push({check, test: bad[0]?.fullName ?? '(the file did not load)',
        message: short(bad[0]?.failureMessages?.[0]?.split('\n')[0] ?? file.message ?? '')});
    }
    if (!failed.length) failed.push({check: 'npm test', test: '', message: short(unit.out.slice(-400))});
  }
  if (types.code !== 0) {
    const first = types.out.split('\n').find(l => /error TS\d+/.test(l)) ?? types.out;
    failed.push({check: 'npm run typecheck', test: 'tsc --noEmit', message: short(first)});
  }
  return failed;
}

async function main() {
  const started = Date.now();
  const dir = mkdtempSync(join(tmpdir(), 'govocal-break-it-'));
  try {
    // The tracked and the new files, as git sees them; node_modules is a link to the real one.
    const files = execSync('git ls-files -co --exclude-standard -z', {cwd: ROOT, encoding: 'utf8'}).split('\0')
      .filter(f => f && f !== 'node_modules' && existsSync(join(ROOT, f)));
    for (const f of files) {
      mkdirSync(dirname(join(dir, f)), {recursive: true});
      cpSync(join(ROOT, f), join(dir, f));
    }
    symlinkSync(join(ROOT, 'node_modules'), join(dir, 'node_modules'));
    // Some guards ask git which files exist (tests/no-names.test.mjs).
    execSync('git init -q && git add -A', {cwd: dir});
    // usage.json is generated (and ignored); the typecheck reads it.
    execSync(`"${process.execPath}" scripts/token-usage.mjs`, {cwd: dir, stdio: 'ignore'});
    console.log(`Copied ${files.length} files to ${dir} (node_modules linked).`);

    const clean = await checks(dir);
    const red = new Set(clean.map(f => f.check));
    for (const c of clean) console.log(`Already red before any fault, so left out: ${c.check}\n        ${c.message}`);

    const results = [];
    for (const [i, fault] of FAULTS.entries()) {
      const path = join(dir, fault.file);
      const before = readFileSync(path, 'utf8');
      const after = before.replace(fault.find, fault.replace);
      if (after === before) throw new Error(`${fault.name}: the target in ${fault.file} moved; update FAULTS in scripts/break-it.mjs`);
      writeFileSync(path, after);
      const caughtBy = (await checks(dir)).filter(f => !red.has(f.check));
      writeFileSync(path, before);
      results.push({name: fault.name, file: fault.file, says: fault.says, caughtBy});
      console.log(`\n${i + 1}. ${fault.name}: ${fault.says} (${fault.file})`);
      if (!caughtBy.length) console.log('   NOT CAUGHT: no check failed.');
      for (const c of caughtBy) console.log(`   red: ${c.check}${c.test ? ` › ${c.test}` : ''}\n        ${c.message}`);
    }
    const seconds = Math.round((Date.now() - started) / 1000);
    const caught = results.filter(r => r.caughtBy.length).length;
    console.log(`\n${caught} of ${results.length} faults caught, in ${seconds} s.`);
    if (!process.argv.includes('--no-save')) {
      const commit = execSync('git rev-parse --short HEAD', {cwd: ROOT, encoding: 'utf8'}).trim();
      writeFileSync(OUT, JSON.stringify({ranAt: new Date().toISOString(), commit, seconds, faults: results}, null, 2) + '\n');
      console.log(`Saved to ${OUT.slice(ROOT.length + 1)} for Overview/Checks.`);
    }
    process.exitCode = caught === results.length ? 0 : 1;
  } finally {
    rmSync(dir, {recursive: true, force: true});
  }
}

if (import.meta.url === `file://${process.argv[1]}`) await main();
