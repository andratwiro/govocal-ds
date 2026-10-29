import type {ReactNode} from 'react';
export function Page({title, description, actions, children}: {title: string; description?: string; actions?: ReactNode; children: ReactNode}) {
  return (
    <div className="bo-page">
      <header className="bo-page-header"><h1>{title}</h1>{actions && <div className="bo-actions">{actions}</div>}</header>
      {description && <p className="bo-note bo-page-description">{description}</p>}
      {children}
    </div>
  );
}
