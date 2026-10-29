import {NavLink, Outlet, useMatch} from 'react-router';
import {NAV} from './nav';

export function Layout() {
  // Inside a phase the main nav folds to its icons (labels stay as the links' names), as in Tali's prototype,
  // so the phase screen's rail, panels and list get the width her frames give them.
  const inPhase = useMatch('/projects/:projectId/phases/:phaseId/:tab');
  return (
    <div className={inPhase ? 'bo-app bo-phase-shell' : 'bo-app'}>
      <nav className="bo-nav" aria-label="Main">
        <div className="bo-brand" aria-hidden>GV</div>
        <ul>{NAV.map(({id, label, icon: Icon}) => (
          <li key={id}><NavLink to={`/${id}`} className="bo-nav-link"><Icon aria-hidden size={16} /><span>{label}</span></NavLink></li>
        ))}</ul>
      </nav>
      <main className="bo-main"><Outlet /></main>
    </div>
  );
}
