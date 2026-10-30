import type {Meta, StoryObj} from '@storybook/react-vite';
import {useCallback, useEffect, useRef, useState, type FormEvent, type ReactNode} from 'react';
import {expect, userEvent, waitFor, within} from 'storybook/test';
import {RefreshCw} from 'lucide-react';
import {
  AppProvider, Button, DataTable, DataTableBody, DataTableCell, DataTableColumn, DataTableHeader, DataTableRow, EmptyState,
  Link, Pagination, SegmentedControl, SegmentedControlItem, Skeleton, TextField, VisuallyHidden, type Key, type PaginationLabels
} from 'govocal-ds';
import './IntegrationSeams.css';

/**
 * Integration seams, a recipe: the four places where the system stops and an app starts (a router, a form library,
 * translated words, data that loads or fails), each marked with who wires what. The stand-ins (a router, a form
 * library, a translate function, a server) are a few lines each, so the seam is plain to see; a real app hands in its
 * own. Each story has a play function that proves the seam in the browser. Copy the markup. Not in Figma.
 */
const meta: Meta = {
  title: 'Patterns/Recipes/Integration seams',
  tags: ['autodocs', 'not-in-figma'],
  parameters: {layout: 'padded'}
};
export default meta;
type Story = StoryObj;

/** The "who wires what" box every seam story carries: the system's side and the app's side. */
function WhoWires({system, app, children}: {system: ReactNode[]; app: ReactNode[]; children: ReactNode}) {
  return (
    <div className="gv-seam">
      <div className="gv-seam__demo">{children}</div>
      <section className="gv-seam__who" aria-label="Who wires what">
        <div>
          <h3 className="gv-seam__heading">The system does</h3>
          <ul className="gv-seam__list">{system.map((s, i) => <li key={i}>{s}</li>)}</ul>
        </div>
        <div>
          <h3 className="gv-seam__heading">Your app does</h3>
          <ul className="gv-seam__list">{app.map((s, i) => <li key={i}>{s}</li>)}</ul>
        </div>
      </section>
    </div>
  );
}

// ── 1. A router link ────────────────────────────────────────────────────────────────────────────────────────────

/** A stand-in router: it keeps the path in state, as react-router or TanStack Router would keep it in theirs. */
function RouterLinkDemo() {
  const [path, setPath] = useState('/projects');
  return (
    <WhoWires
      system={[<>Every <code>Link</code>, menu item and tab with an <code>href</code> asks React Aria&apos;s router to go there.</>,
        <><code>AppProvider</code> passes your <code>navigate</code> and <code>useHref</code> to it.</>]}
      app={[<>Hands its router&apos;s <code>navigate</code> to <code>AppProvider</code>.</>,
        <>Hands <code>useHref</code>, so the address a link shows matches the router (here a <code>#</code> address).</>]}>
      <AppProvider navigate={to => setPath(to)} useHref={to => `#${to}`}>
        <nav aria-label="Stand-in pages" className="gv-seam__row">
          <Link href="/projects">Projects</Link>
          <Link href="/projects/green-corridors">Green Corridors</Link>
          <Link href="/users">Users</Link>
        </nav>
        <p role="status" className="gv-seam__status">The router is on <strong>{path}</strong></p>
      </AppProvider>
    </WhoWires>
  );
}

/**
 * A link routed by the app. A press calls the app's `navigate` (here a stand-in that keeps the path in state); the page
 * doesn't reload, and the link's address comes from the app's `useHref`. The play function presses a link and checks
 * the router moved and the browser didn't.
 */
export const RouterLink: Story = {
  name: 'Router link',
  render: () => <RouterLinkDemo />,
  play: async ({canvasElement}) => {
    const canvas = within(canvasElement);
    const before = canvasElement.ownerDocument.defaultView!.location.href;
    const link = canvas.getByRole('link', {name: 'Green Corridors'});
    await expect(link).toHaveAttribute('href', '#/projects/green-corridors');
    await userEvent.click(link);
    await expect(canvas.getByRole('status')).toHaveTextContent('/projects/green-corridors');
    await expect(canvasElement.ownerDocument.defaultView!.location.href).toBe(before);
  }
};

// ── 2. A field wired to a form library ─────────────────────────────────────────────────────────────────────────

type Rules = {required?: string};
/**
 * A stand-in form library, the shape react-hook-form and its kind share: `register(name)` hands a field its name, its
 * value, its change handler and a ref; submit checks the rules and focuses the first field that fails, through that ref.
 */
function useStandInForm<V extends Record<string, string>>(defaults: V) {
  const [values, setValues] = useState(defaults);
  const [errors, setErrors] = useState<Partial<Record<keyof V, string>>>({});
  const refs = useRef(new Map<keyof V, HTMLInputElement | null>());
  const rules = useRef(new Map<keyof V, Rules>());
  const register = (name: keyof V & string, r: Rules = {}) => {
    rules.current.set(name, r);
    return {
      name, value: values[name], isInvalid: !!errors[name], errorMessage: errors[name],
      onChange: (v: string) => setValues(old => ({...old, [name]: v})),
      inputRef: (el: HTMLInputElement | null) => { refs.current.set(name, el); }
    };
  };
  const handleSubmit = (onValid: (v: V) => void) => (e: FormEvent) => {
    e.preventDefault();
    const found: Partial<Record<keyof V, string>> = {};
    for (const [name, r] of rules.current) if (r.required && !values[name].trim()) found[name] = r.required;
    setErrors(found);
    const first = Object.keys(found)[0] as keyof V | undefined;
    if (first) refs.current.get(first)?.focus();
    else onValid(values);
  };
  return {register, handleSubmit};
}

function FormLibraryDemo() {
  const {register, handleSubmit} = useStandInForm({title: '', slug: ''});
  const [saved, setSaved] = useState<string | null>(null);
  return (
    <WhoWires
      system={[<>Fields take <code>name</code>, <code>value</code> / <code>onChange</code> and <code>inputRef</code>, and put the name and the ref on the real input.</>,
        <>Fields show <code>isInvalid</code> and <code>errorMessage</code>, and say the error to a screen reader.</>,
        <><code>validationBehavior=&quot;aria&quot;</code> keeps the browser&apos;s own checks out of the way.</>]}
      app={[<>Picks the form library and owns the values, the rules and the submit.</>,
        <>Hands each field what the library registers for it.</>,
        <>Moves focus to the first field to fix, through the ref.</>]}>
      <form onSubmit={handleSubmit(v => setSaved(v.title))} noValidate className="gv-seam__form" aria-label="New project">
        <TextField label="Title" isRequired validationBehavior="aria" {...register('title', {required: 'Give the project a title.'})} />
        <TextField label="Address" description="Left empty, it is made from the title." validationBehavior="aria" {...register('slug')} />
        <div><Button type="submit">Save</Button></div>
        {saved && <p role="status" className="gv-seam__status">Saved “{saved}”</p>}
      </form>
    </WhoWires>
  );
}

/**
 * A field wired to a form library (a stand-in with react-hook-form's shape). The name and the ref reach the real input:
 * Save with an empty title shows the error and puts focus in the field; Save with a title saves. The play function does
 * both. The react-hook-form version, with `Controller`, is on Overview › For developers.
 */
export const FormLibraryField: Story = {
  name: 'Field in a form library',
  render: () => <FormLibraryDemo />,
  play: async ({canvasElement}) => {
    const canvas = within(canvasElement);
    const title = canvas.getByRole('textbox', {name: /^Title/});
    await expect(title).toHaveAttribute('name', 'title');
    await userEvent.click(canvas.getByRole('button', {name: 'Save'}));
    await waitFor(() => expect(title).toHaveFocus());
    await expect(title).toHaveAttribute('aria-invalid', 'true');
    await expect(canvas.getByText('Give the project a title.')).toBeVisible();
    await userEvent.type(title, 'Green Corridors');
    await userEvent.click(canvas.getByRole('button', {name: 'Save'}));
    await expect(canvas.getByRole('status')).toHaveTextContent('Saved “Green Corridors”');
  }
};

// ── 3. Strings from a translate function ───────────────────────────────────────────────────────────────────────

/** A stand-in message catalogue and translate function, as react-intl's `formatMessage` would be in the platform. */
const MESSAGES = {
  'en-GB': {search: 'Search ideas', pagination: 'Pages', previous: 'Previous', next: 'Next', page: 'Page {page}'},
  'nl-BE': {search: 'Ideeën zoeken', pagination: 'Paginering', previous: 'Vorige', next: 'Volgende', page: 'Pagina {page}'}
} as const;
type Locale = keyof typeof MESSAGES;
const translate = (locale: Locale) => (id: keyof typeof MESSAGES['en-GB'], values: Record<string, string> = {}) =>
  MESSAGES[locale][id].replace(/\{(\w+)\}/g, (_, k: string) => values[k] ?? '');

function TranslatedDemo() {
  const [locale, setLocale] = useState<Locale>('en-GB');
  const t = translate(locale);
  // The part's own words, from the app's catalogue. A phrase with a number gets it already written in the locale.
  const labels: PaginationLabels = {
    pagination: t('pagination'), previous: t('previous'), next: t('next'), page: (_page, formatted) => t('page', {page: formatted})
  };
  return (
    <WhoWires
      system={[<>Takes every word it shows as a prop (<code>label</code>) or as <code>labels</code>, with English defaults.</>,
        <>Writes numbers and dates the locale&apos;s way (1,240 in English, 1.240 in Dutch) and hands them to your phrases.</>,
        <>Never translates and never joins words into sentences.</>]}
      app={[<>Owns the message catalogues and the translate function.</>,
        <>Passes the words in, and the locale to <code>AppProvider</code>.</>,
        <>Owns the language switch.</>]}>
      <SegmentedControl aria-label="Language" selectionMode="single" disallowEmptySelection selectedKeys={[locale]}
        onSelectionChange={(keys: Set<Key>) => { const k = [...keys][0]; if (k) setLocale(k as Locale); }}>
        <SegmentedControlItem id="en-GB">English</SegmentedControlItem>
        <SegmentedControlItem id="nl-BE">Nederlands</SegmentedControlItem>
      </SegmentedControl>
      <AppProvider locale={locale}>
        <div className="gv-seam__stack" lang={locale}>
          <TextField label={t('search')} type="search" />
          <Pagination pageCount={1240} labels={labels} />
        </div>
      </AppProvider>
    </WhoWires>
  );
}

/**
 * Words from the app's translate function (a stand-in catalogue in English and Dutch). The field's label is a prop;
 * Pagination's own words come as `labels`; its page numbers are written by the locale and handed to the app's phrase.
 * The play function switches to Dutch and checks the words and the number.
 */
export const TranslatedStrings: Story = {
  name: 'Strings from a translate function',
  render: () => <TranslatedDemo />,
  play: async ({canvasElement}) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByRole('navigation', {name: 'Pages'})).toBeVisible();
    await expect(canvas.getByRole('button', {name: 'Page 1,240'})).toBeVisible();
    await userEvent.click(canvas.getByRole('radio', {name: 'Nederlands'}));
    await expect(canvas.getByRole('searchbox', {name: 'Ideeën zoeken'})).toBeVisible();
    await expect(canvas.getByRole('navigation', {name: 'Paginering'})).toBeVisible();
    await expect(canvas.getByRole('button', {name: 'Volgende'})).toBeVisible();
    await expect(canvas.getByRole('button', {name: 'Pagina 1.240'})).toBeVisible();
  }
};

// ── 4. A table driven from loading to error to data ────────────────────────────────────────────────────────────

const IDEAS = [
  {id: 'i1', title: 'More trees on Elm Lane', comments: 12},
  {id: 'i2', title: 'Bike lane by the school', comments: 31},
  {id: 'i3', title: 'Benches in Park Row', comments: 4}
];
type Idea = typeof IDEAS[number];
type Load = {state: 'loading'} | {state: 'error'} | {state: 'data'; rows: Idea[]};

/** A stand-in server: the first request fails, the next one answers. */
function useStandInIdeas(delay = 400) {
  const calls = useRef(0);
  const [load, setLoad] = useState<Load>({state: 'loading'});
  const fetchIdeas = useCallback(() => {
    setLoad({state: 'loading'});
    const n = ++calls.current;
    return window.setTimeout(() => setLoad(n === 1 ? {state: 'error'} : {state: 'data', rows: IDEAS}), delay);
  }, [delay]);
  useEffect(() => { const t = fetchIdeas(); return () => window.clearTimeout(t); }, [fetchIdeas]);
  return {load, retry: fetchIdeas};
}

function TableStatesDemo() {
  const {load, retry} = useStandInIdeas();
  return (
    <WhoWires
      system={[<>Draws each state: Skeleton while it loads, Empty state for an error (or nothing, or no permission), the Data table for rows.</>,
        <>Takes the rows as <code>items</code>; never fetches.</>]}
      app={[<>Fetches, and knows whether it is loading, failed or done.</>,
        <>Picks the state to draw, writes the words, and retries.</>,
        <>Says &quot;Loading&quot; to a screen reader while the skeleton shows.</>]}>
      {load.state === 'loading' && (
        <div role="status" className="gv-seam__stack">
          <VisuallyHidden>Loading ideas…</VisuallyHidden>
          {[0, 1, 2].map(i => <Skeleton key={i} width="100%" height={20} />)}
        </div>
      )}
      {load.state === 'error' && (
        <EmptyState layout="panel" icon={<RefreshCw aria-hidden size={24} />} title="The ideas didn't load"
          description="Check your connection and try again."
          actions={<Button variant="secondary" onPress={retry}>Try again</Button>} />
      )}
      {load.state === 'data' && (
        <DataTable aria-label="Ideas">
          <DataTableHeader>
            <DataTableColumn isRowHeader>Idea</DataTableColumn>
            <DataTableColumn>Comments</DataTableColumn>
          </DataTableHeader>
          <DataTableBody items={load.rows}>
            {idea => <DataTableRow id={idea.id} textValue={idea.title}>
              <DataTableCell>{idea.title}</DataTableCell>
              <DataTableCell>{idea.comments}</DataTableCell>
            </DataTableRow>}
          </DataTableBody>
        </DataTable>
      )}
    </WhoWires>
  );
}

/**
 * A table driven by the app's data, from loading to an error to rows (a stand-in server fails the first request). The
 * app decides which state to draw; the system draws it. The play function waits out the loading, presses Try again and
 * checks the rows arrive.
 */
export const TableLoadingErrorData: Story = {
  name: 'Table · loading, error, data',
  render: () => <TableStatesDemo />,
  play: async ({canvasElement}) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByRole('status')).toHaveTextContent('Loading ideas…');
    await userEvent.click(await canvas.findByRole('button', {name: 'Try again'}, {timeout: 3000}));
    const table = await canvas.findByRole('grid', {name: 'Ideas'}, {timeout: 3000});
    // React Aria draws the rows a moment after the table.
    await waitFor(() => expect(within(table).getAllByRole('row')).toHaveLength(IDEAS.length + 1));
    await expect(within(table).getByRole('rowheader', {name: 'Bike lane by the school'})).toBeVisible();
  }
};
