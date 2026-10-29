import type {ReactNode} from 'react';
export function Page({title, actions, children}: {title: string; actions?: ReactNode; children: ReactNode}) {
  return (
    <div className="bo-page">
      <header className="bo-page-header"><h1>{title}</h1>{actions && <div className="bo-actions">{actions}</div>}</header>
      {children}
    </div>
  );
}
