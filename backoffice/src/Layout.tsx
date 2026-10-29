import {NavLink, Outlet} from 'react-router';
import {NAV} from './nav';

export function Layout() {
  return (
    <div className="bo-app">
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
