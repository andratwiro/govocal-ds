import {useEffect, useState} from 'react';
import './A11yOverview.css';

type Item = {story: string; direction: string; rule: string; impact: string; help: string; helpUrl: string; nodes: number; targets: string[]};
type Component = {title: string; stories: number; violations: number; byRule: Record<string, number>; worst: string | null; items: Item[]};
type Results = {generatedAt: string; palette: string; components: Component[]};

export function A11yOverview() {
  const [data, setData] = useState<Results | null>(null);
  const [missing, setMissing] = useState(false);
  useEffect(() => {
    fetch('./a11y-results.json').then(r => (r.ok ? r.json() : Promise.reject())).then(setData).catch(() => setMissing(true));
  }, []);
  if (missing) return <p>No results yet. They are made on every deploy (<code>npm run build && npm run a11y:scan</code> locally).</p>;
  if (!data) return <p>Loading…</p>;
  return (
    <div className="gv-a11y">
      <p>WCAG 2.2 AA checks by axe, every story in left-to-right and Arabic right-to-left. Results hold for {data.palette}.
        Axe finds roughly half of real issues: keyboard and screen-reader checks still need a person.</p>
      <p>WCAG 2.2 AA is the front office's bar. This system serves the back office for now, so the design is followed
        as drawn: a finding below is <strong>reported, not blocking</strong> — it never fails a build and is never by
        itself a reason to change a colour, size, weight or spacing.</p>
      <table>
        <thead><tr><th>Component</th><th>Stories</th><th>Violations</th><th>Rules</th></tr></thead>
        <tbody>{data.components.map(c => (
          <tr key={c.title} data-worst={c.worst ?? 'none'}>
            <td>
              <a href={`?path=/docs/${c.title.toLowerCase().replace(/[^a-z0-9]+/g, '-')}--docs`} target="_top">{c.title}</a>
              {c.violations > 0 && (
                <details>
                  <summary>{c.stories} {c.stories === 1 ? 'story' : 'stories'} scanned</summary>
                  <table className="gv-a11y-items">
                    <thead><tr><th>Story</th><th>Direction</th><th>Rule</th><th>Impact</th><th>Target</th></tr></thead>
                    <tbody>{c.items.map((item, i) => (
                      <tr key={i} data-impact={item.impact}>
                        <td>{item.story}</td>
                        <td>{item.direction}</td>
                        <td><a href={item.helpUrl} target="_blank" rel="noreferrer" title={item.help}>{item.rule}</a></td>
                        <td>{item.impact}</td>
                        <td>{item.targets.length ? item.targets.join(', ') : `${item.nodes} node(s)`}</td>
                      </tr>))}
                    </tbody>
                  </table>
                </details>
              )}
            </td>
            <td>{c.stories}</td>
            <td>{c.violations === 0 ? 'None' : c.violations}</td>
            <td>{Object.entries(c.byRule).map(([rule, n]) => {
              const item = c.items.find(i => i.rule === rule)!;
              return <a key={rule} href={item.helpUrl} target="_blank" rel="noreferrer">{rule} ({n})</a>;
            })}</td>
          </tr>))}
        </tbody>
      </table>
      <p className="gv-a11y-meta">Scanned {new Date(data.generatedAt).toLocaleString('en-GB')}.</p>
    </div>
  );
}
