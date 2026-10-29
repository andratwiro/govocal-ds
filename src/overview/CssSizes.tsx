import {useEffect, useState} from 'react';

// Every part's stylesheet as the package ships it (source CSS, before the host's bundler minifies it), read when this
// block mounts, so the numbers are always today's. Base parts live in src/components/, Components in
// src/components/gv/, Patterns in src/patterns/.
const sheets = import.meta.glob(['../components/**/*.css', '../patterns/**/*.css'], {query: '?raw', import: 'default'});

type Row = {part: string; tier: string; bytes: number; gzip: number};

async function gzipSize(text: string) {
  if (typeof CompressionStream === 'undefined') return NaN;
  const stream = new Blob([text]).stream().pipeThrough(new CompressionStream('gzip'));
  return (await new Response(stream).arrayBuffer()).byteLength;
}

const tierOf = (path: string) => path.includes('/patterns/') ? 'Pattern' : path.includes('/gv/') ? 'Component' : 'Base';
const kb = (n: number) => Number.isNaN(n) ? '–' : `${(n / 1024).toFixed(1)} kB`;

/** The CSS each part brings, largest first, with the total: the facts behind "how heavy is it" on Questions for developers. */
export function CssSizes() {
  const [rows, setRows] = useState<Row[] | null>(null);
  useEffect(() => {
    let live = true;
    Promise.all(Object.entries(sheets).map(async ([path, load]) => {
      const text = (await load()) as string;
      return {part: path.replace(/^.*\/|\.css$/g, ''), tier: tierOf(path), bytes: new Blob([text]).size, gzip: await gzipSize(text)};
    })).then(r => live && setRows(r.sort((a, b) => b.bytes - a.bytes)));
    return () => { live = false; };
  }, []);
  if (!rows) return <p>Measuring…</p>;
  const total = rows.reduce((t, r) => ({bytes: t.bytes + r.bytes, gzip: t.gzip + r.gzip}), {bytes: 0, gzip: 0});
  return (
    <>
      <p>
        <strong>{rows.length} stylesheets, {kb(total.bytes)} in all, {kb(total.gzip)} gzipped one by one</strong> (a
        bundle that gzips them together comes out smaller). A screen pays only for the parts it imports: each part
        imports its own stylesheet.
      </p>
      <details>
        <summary>Every stylesheet, largest first</summary>
        <table>
          <thead><tr><th>Stylesheet</th><th>Tier</th><th>Size</th><th>Gzipped</th></tr></thead>
          <tbody>{rows.map(r => (
            <tr key={`${r.tier}/${r.part}`}><td>{r.part}</td><td>{r.tier}</td><td>{kb(r.bytes)}</td><td>{kb(r.gzip)}</td></tr>
          ))}</tbody>
        </table>
      </details>
    </>
  );
}
