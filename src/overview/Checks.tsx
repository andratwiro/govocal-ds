import guardsJson from './guards.json';
import lastRunJson from './checks-last-run.json';
import breakItJson from './break-it.json';
import './Checks.css';

/**
 * Overview/Checks: every guard in tests/ and e2e/ in plain words, how to rerun it, and the counts from the last
 * `npm run check`; then what `npm run break-it` caught. The words live in guards.json (tests/checks-page.test.mjs
 * fails on a guard without a line); the counts are written by scripts/check.mjs and scripts/break-it.mjs.
 */

type Guard = {group: string; what: string};
type Counts = {passed?: number; failed?: number; skipped?: number; flaky?: number};
type Step = {name: string; label: string; status: string; seconds?: number; totals?: Counts; files?: Record<string, Counts>};
type LastRun = {ranAt: string | null; commit: string | null; steps: Step[]};
type Caught = {check: string; test: string; message: string};
type BreakIt = {ranAt: string; commit: string; seconds: number; faults: {name: string; file: string; says: string; caughtBy: Caught[]}[]};

const guards = guardsJson as Record<string, Guard>;
const lastRun = lastRunJson as LastRun;
const breakIt = breakItJson as BreakIt;

const GROUPS = ['Tokens and paint', 'Structure and CSS', 'Public API and docs', 'Words and locale', 'Components behave',
  'Back office screens', 'Site and Storybook'];

const date = (iso: string) => new Date(iso).toLocaleString('en-GB', {dateStyle: 'medium', timeStyle: 'short', timeZone: 'UTC'}) + ' UTC';
const counts = (c?: Counts) => !c ? 'not run' : [
  c.passed ? `${c.passed} passed` : '', c.failed ? `${c.failed} failed` : '', c.flaky ? `${c.flaky} flaky` : '',
  c.skipped ? `${c.skipped} skipped` : ''].filter(Boolean).join(', ') || 'none';
const rerun = (file: string) => file.startsWith('e2e/')
  ? `E2E_PORT=4173 npx playwright test ${file}` : `npx vitest run ${file}`;

/** The steps of the last `npm run check`, with their counts. */
export function ChecksLastRun() {
  if (!lastRun.ranAt) return <p className="gv-checks">Not run yet: <code>npm run check</code> writes its counts here.</p>;
  return (
    <div className="gv-checks">
      <table>
        <thead><tr><th>Step</th><th>Result</th><th>Counts</th><th>Time</th></tr></thead>
        <tbody>{lastRun.steps.map(s => (
          <tr key={s.name}>
            <td>{s.label}</td><td className="gv-checks__status" data-status={s.status}>{s.status}</td><td>{s.totals ? counts(s.totals) : '—'}</td>
            <td>{s.seconds === undefined ? '—' : `${s.seconds} s`}</td>
          </tr>))}
        </tbody>
      </table>
      <p className="gv-checks__meta">Last run {date(lastRun.ranAt)}, on commit <code>{lastRun.commit}</code>.</p>
    </div>
  );
}

/** What `npm run break-it` broke, and which check went red for each fault. */
export function BreakItResults() {
  const caught = breakIt.faults.filter(f => f.caughtBy.length).length;
  return (
    <div className="gv-checks">
      <table>
        <thead><tr><th>Fault</th><th>What was changed</th><th>Went red</th></tr></thead>
        <tbody>{breakIt.faults.map(f => (
          <tr key={f.name}>
            <td>{f.name}</td>
            <td>{f.says} (<code>{f.file}</code>)</td>
            <td className="gv-checks__status" data-status={f.caughtBy.length ? 'caught' : 'failed'}>{f.caughtBy.length ? f.caughtBy.map(c => (
              <div key={c.check} className="gv-checks__caught">
                <code>{c.check}</code>
                <span className="gv-checks__message">{c.message}</span>
              </div>)) : 'Not caught'}</td>
          </tr>))}
        </tbody>
      </table>
      <p className="gv-checks__meta">{caught} of {breakIt.faults.length} faults caught, in {breakIt.seconds} seconds;
        run {date(breakIt.ranAt)}, on commit <code>{breakIt.commit}</code>.</p>
    </div>
  );
}

/** Every guard, grouped, with its plain-words line, the last run's counts and the command that reruns it alone. */
export function GuardList() {
  const files: Record<string, Counts> = Object.assign({}, ...lastRun.steps.map(s => s.files ?? {}));
  const byGroup = GROUPS.map(g => [g, Object.entries(guards).filter(([, v]) => v.group === g)] as const);
  return (
    <div className="gv-checks">
      {byGroup.map(([group, list]) => list.length > 0 && (
        <section key={group}>
          <h3>{group} ({list.length})</h3>
          <table>
            <thead><tr><th>Guard</th><th>What it proves</th><th>Last run</th><th>Rerun it</th></tr></thead>
            <tbody>{list.map(([file, g]) => (
              <tr key={file}>
                <td><code>{file}</code></td><td>{g.what}</td>
                <td className="gv-checks__status" data-status={!files[file] ? 'not run' : files[file].failed ? 'failed' : 'passed'}>
                  {counts(files[file])}</td>
                <td><code>{rerun(file)}</code></td>
              </tr>))}
            </tbody>
          </table>
        </section>))}
    </div>
  );
}
