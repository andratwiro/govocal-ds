import type {ReactNode} from 'react';

// A part of a page the system has no component or pattern for yet. It shows the content plainly,
// framed and named, so the page says what the system still lacks. Inline gaps (inside a table
// cell, a toolbar) get only a dashed outline; their names go in the page's GapLegend.
export function Gap({name, inline, children}: {name: string; inline?: boolean; children: ReactNode}) {
  if (inline) return <span className="bo-gap-inline" data-gap={name}>{children}</span>;
  return (
    <div className="bo-gap" data-gap={name}>
      <span className="bo-gap-label">Missing: {name}</span>
      {children}
    </div>
  );
}

export function GapLegend({names}: {names: string[]}) {
  return <p className="bo-note">Dashed outline: the system has no component yet for {names.join(', ')}.</p>;
}
