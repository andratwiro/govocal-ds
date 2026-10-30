import {useLocation} from 'react-router';
import {Banner, Link, PageHeader, Stack, Text} from 'govocal-ds';

// Where "To platform" (and the account menu) lead: a stand-in for the resident site, outside the back office.
export function Platform() {
  const {search} = useLocation();
  const note = search.includes('signed-out') ? 'You are signed out (demo: nothing was signed in).'
    : search.includes('profile') ? 'Your profile page lives on the resident site.'
    : search.includes('customer-portal') ? 'The customer portal opens here for admins.'
    : null;
  return (
    <Stack elementType="main" gap="12" alignItems="start" paddingBlock="24" paddingInline="32">
      <PageHeader title="Resident site (placeholder)" />
      {note && <Banner>{note}</Banner>}
      <Text elementType="p" kind="small" color="meta">The back office demo has no resident site: this page stands in for it.</Text>
      <Link href="#/dashboard">Back to the back office</Link>
    </Stack>
  );
}
