import type {ReactNode} from 'react';

// A part of a page the system has no component or pattern for yet. It shows the content plainly,
// framed and named, so the page says what the system still lacks.
export function Gap({name, children}: {name: string; children: ReactNode}) {
  return (
    <div className="bo-gap" data-gap={name}>
      <span className="bo-gap-label">Missing: {name}</span>
      {children}
    </div>
  );
}
