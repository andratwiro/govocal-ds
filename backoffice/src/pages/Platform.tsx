import {useLocation} from 'react-router';
import {Banner, Link} from 'govocal-ds';

// Where "To platform" (and the account menu) lead: a stand-in for the resident site, outside the back office.
export function Platform() {
  const {search} = useLocation();
  const note = search.includes('signed-out') ? 'You are signed out (demo: nothing was signed in).'
    : search.includes('profile') ? 'Your profile page lives on the resident site.'
    : search.includes('customer-portal') ? 'The customer portal opens here for admins.'
    : null;
  return (
    <main className="bo-platform">
      <div className="bo-page">
        <header className="bo-page-bar"><h1>Resident site (placeholder)</h1></header>
        {note && <Banner>{note}</Banner>}
        <p className="bo-note">The back office demo has no resident site: this page stands in for it.</p>
        <Link href="#/dashboard">Back to the back office</Link>
      </div>
    </main>
  );
}
