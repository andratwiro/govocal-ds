/// <reference types="vite/client" />
import {useEffect, useState, type ReactNode} from 'react';
import {ArgTypes, Heading, Markdown, Primary, Stories, Title, useOf} from '@storybook/addon-docs/blocks';
import usageJson from '../foundations/usage.json';
import tokensJson from '../../public/tokens.json';
import {SECTIONS, STAGES, firstSentence, parseGuide} from '../../scripts/lib/guide.mjs';
import './ComponentPage.css';

/**
 * The component page: every Components and Patterns entry's docs page, in the thirteen sections of
 * `scripts/lib/guide.mjs`. The words come from the part's `<Name>.guide.md` beside its stories (docs/HOW-TO.md, "Write a
 * component page"); Purpose, Status, Variants and states and Tokens come from the code. A part with no guide yet shows
 * what the code gives and says the rest isn't written.
 */

// Every guide, by path from this folder ('../components/gv/Button.guide.md').
const GUIDES = import.meta.glob('../**/*.guide.md', {query: '?raw', import: 'default', eager: true}) as Record<string, string>;

const usage = usageJson as Record<string, string[]>;

/** Each token's "what it is for", from tokens.json: `--gv-surface-default` → its `$description`. */
const PURPOSE = new Map<string, string>();
(function walk(node: unknown, path: string[]) {
  if (!node || typeof node !== 'object') return;
  const n = node as Record<string, unknown>;
  if ('$value' in n) { PURPOSE.set(`--gv-${path.join('-')}`, String(n.$description ?? '')); return; }
  for (const [k, v] of Object.entries(n)) if (!k.startsWith('$')) walk(v, [...path, k]);
})(tokensJson, []);

/** What each lifecycle stage promises. Overview/Lifecycle (Task 5) gives the whole story. */
const STAGE_TEXT: Record<string, string> = {
  draft: 'Built and shown here, and you can design with it, but its look and settings may still change: no developer has reviewed it yet.',
  candidate: 'Its page is complete and it is waiting for a developer to review it. Small changes may still come.',
  stable: 'A developer has reviewed it. Changes to it are announced, with a note on what to update.'
};

/** The repo on GitHub, where the docs a guide cites (`docs/DECISIONS.md`) can be read from the page. */
const REPO = 'https://github.com/andratwiro/govocal-ds/blob/main/';

/** Guide Markdown as the page shows it: a cited repo doc becomes a link, and a keyboard row's proof reads in words. */
export function forReaders(md: string): string {
  return md
    .replace(/`?\b(docs\/[A-Z][A-Z-]*\.md)`?/g, (_, f: string) => `[${f}](${REPO}${f})`)
    .replace(/`play: (\w+)`/g, (_, s: string) => `the ${s} story`)
    .replace(/`e2e\/([\w-]+)\.spec\.ts`/g, (_, f: string) => `browser test (${f})`);
}

/** The words these pages use that a designer new to the system would have to ask about. */
const WORDS: [string, string][] = [
  ['Part', 'any entry under Components or Patterns: a component.'],
  ['Story', 'one set-up of the part, live; all of them are under Variants and states.'],
  ['Back office', "the platform's admin screens, rebuilt in this repo from these parts (/backoffice/). The examples in When to use come from it."],
  ['Words in code type', 'the names developers use for a setting (`isDisabled`, `labels`); the Props table at the bottom lists them. In a design, say what you want in words.'],
  ['labels', 'the words a part says on its own (a × button\'s name, "Clear"). They come in English and a screen passes them translated.'],
  ['Token', 'a named design value (colour, space, type) from Foundations. Tokens lists the ones this part uses.'],
  ['Not in Figma', 'the part exists in code with no Figma component yet: design from its stories, and ask the designer before drawing a new one.'],
  ['Built by agents', 'made by AI coding assistants; Provenance says whether a person has reviewed it.'],
  ['WAI-ARIA APG pattern', "the W3C's reference for how this kind of control works with a keyboard and a screen reader."],
  ['Focus, Tab stop', 'focus is where the keyboard is; a Tab stop is a place Tab lands on.'],
  ['Tested by', 'the automated test that proves a keyboard row: a story (open it, then its Interactions panel) or a browser test in the repo.'],
  ['You still own', 'what the person putting a screen together (designer or developer) still has to decide or provide.'],
  ['React Aria', 'the open-source library under the parts that gives them their keyboard and screen-reader behaviour.'],
  ['Sizes', 'plain numbers are pixels (32 = 32px). Type is size/line height: 13/20 = 13px text on a 20px line.']
];

/** The guide beside a stories file: './src/components/gv/Button.stories.tsx' → that folder's Button.guide.md. */
export function guideFor(fileName: string | undefined): string | undefined {
  if (!fileName) return undefined;
  return GUIDES[fileName.replace(/^\.\/src\//, '../').replace(/\.stories\.tsx$/, '.guide.md')];
}

/** Part name (lower case) → its docs id, from Storybook's index, for linking the names a guide puts in bold. */
function usePartIds() {
  const [ids, setIds] = useState<Map<string, string>>(new Map());
  useEffect(() => {
    fetch('./index.json').then(r => (r.ok ? r.json() : Promise.reject())).then((index: {entries: Record<string, {id: string; title: string; type: string}>}) => {
      const map = new Map<string, string>();
      for (const e of Object.values(index.entries)) {
        if (e.type === 'docs' && /^(Components|Patterns)\//.test(e.title)) map.set(e.title.split('/').at(-1)!.toLowerCase(), e.id);
      }
      setIds(map);
    }).catch(() => {});
  }, []);
  return ids;
}

/** This part's axe results on the last deploy (`npm run a11y:scan`), when the file is there. */
function useA11y(title: string) {
  const [row, setRow] = useState<{stories: number; violations: number} | null>(null);
  useEffect(() => {
    fetch('./a11y-results.json').then(r => (r.ok ? r.json() : Promise.reject()))
      .then((d: {components: {title: string; stories: number; violations: number}[]}) => setRow(d.components.find(c => c.title === title) ?? null))
      .catch(() => {});
  }, [title]);
  return row;
}

function Text({children, ids}: {children: string; ids: Map<string, string>}) {
  children = forReaders(children);
  const Strong = ({children: c}: {children?: ReactNode}) => {
    // markdown-to-jsx hands the words over as an array of strings.
    const words = [c].flat().every(x => typeof x === 'string') ? [c].flat().join('') : undefined;
    const id = words ? ids.get(words.toLowerCase()) : undefined;
    return id ? <a href={`./?path=/docs/${id}`} target="_top"><strong>{c}</strong></a> : <strong>{c}</strong>;
  };
  const A = (props: {href?: string; children?: ReactNode}) => <a href={props.href} target="_blank" rel="noreferrer">{props.children}</a>;
  return <Markdown options={{overrides: {strong: Strong, a: A}}}>{children}</Markdown>;
}

function Section({name, children}: {name: string; children: ReactNode}) {
  return <section className="gv-sb-page__section" data-section={name}><Heading>{name}</Heading>{children}</section>;
}

export function ComponentPage() {
  const {preparedMeta} = useOf('meta', ['meta']);
  const title = preparedMeta.title;
  const name = title.split('/').at(-1)!;
  const parameters = preparedMeta.parameters as {fileName?: string; docs?: {description?: {component?: string}}};
  const component = preparedMeta.component as {__docgenInfo?: {description?: string}} | undefined;
  const guide = guideFor(parameters.fileName);
  const hasProps = Boolean(component);
  const {sections} = parseGuide(guide ?? '');
  const ids = usePartIds();
  const a11y = useA11y(title);

  const purpose = firstSentence(component?.__docgenInfo?.description || parameters.docs?.description?.component || '');
  const stage = preparedMeta.tags.find(t => t.startsWith('status:'))?.slice('status:'.length);
  const status = stage && STAGES.includes(stage) ? stage : 'draft';
  const cssName = parameters.fileName?.match(/([^/]+)\.stories\.tsx$/)?.[1] ?? '';
  const tokens = Object.entries(usage).filter(([, users]) => users.includes(cssName)).map(([t]) => t).sort();

  const made: Record<string, ReactNode> = {
    Purpose: purpose ? <div className="gv-sb-page__purpose"><Text ids={ids}>{purpose}</Text></div> : <p>No doc comment yet.</p>,
    Status: (
      <p className="gv-sb-page__status">
        <span className="gv-sb-page__stage" data-stage={status}>{status[0].toUpperCase() + status.slice(1)}:</span>{' '}
        {STAGE_TEXT[status]}
      </p>
    ),
    'Variants and states': <Stories title={<></>} includePrimary />,
    Tokens: tokens.length ? (
      <>
        <p>The design tokens (named colours, spaces and type from Foundations) {name}'s own styles use. Change one in
          Foundations and every part that uses it follows. "What it is for" is the token's job across the whole system, so
          it can name other places than this part.</p>
        <table className="gv-sb-page__tokens">
          <thead><tr><th>Token</th><th>What it is for</th></tr></thead>
          <tbody>{tokens.map(t => <tr key={t}><td><code>{t}</code></td><td>{PURPOSE.get(t) || `${name}'s own token.`}</td></tr>)}</tbody>
        </table>
      </>
    ) : <p>No styles of its own: its look comes from the parts it is made of.</p>,
    Provenance: sections.Provenance ? <Text ids={ids}>{sections.Provenance}</Text> : <p>Not yet recorded.</p>,
    Accessibility: (
      <>
        {sections.Accessibility && <Text ids={ids}>{sections.Accessibility}</Text>}
        <p className="gv-sb-page__a11y">
          {a11y ? `Automated checks (axe, every story left to right and right to left): ${a11y.violations === 0 ? 'no findings' :
            `${a11y.violations} finding${a11y.violations === 1 ? '' : 's'}`} across ${a11y.stories} stories. ` : ''}
          <a href="./?path=/docs/overview-accessibility--docs" target="_top">Overview › Accessibility</a> has every part's
          automated check results (axe, an accessibility checker). A finding there is reported for the team to fix; it
          doesn't stop a change from shipping.
        </p>
      </>
    )
  };

  const shown = guide ? SECTIONS : ['Purpose', 'Status', 'Variants and states', 'Tokens', 'Provenance'];
  return (
    <div className="gv-sb-page" data-guide={guide ? 'written' : 'not-written'}>
      <Title />
      <details className="gv-sb-page__words">
        <summary>Words on this page</summary>
        <dl>{WORDS.map(([w, d]) => <div key={w}><dt>{w}</dt><dd><Text ids={ids}>{d}</Text></dd></div>)}</dl>
      </details>
      {shown.flatMap(s => {
        const body = made[s] ?? (sections[s] ? <Text ids={ids}>{sections[s]}</Text> : null);
        const out = [<Section key={s} name={s}>{body}</Section>];
        if (s === 'Status') {
          out.push(
            <div key="primary" className="gv-sb-page__primary">
              <Primary />
              <p className="gv-sb-page__caption">Its first story, live. This and every other story are under Variants and states, with their names.</p>
            </div>
          );
          if (!guide) out.push(
            <p key="note" className="gv-sb-page__note">
              The guidance for {name} isn't written yet: when to use it, when not to, its anatomy, keyboard, content and
              related parts. Until it is, its stories below and its doc comment are the reference.
            </p>
          );
        }
        return out;
      })}
      <section className="gv-sb-page__section" data-section="Props">
        <Heading>Props</Heading>
        {hasProps ? <>
          <p>For developers: the settings (props) {name} takes, from its code. The words in code type on this page are these
            names. "Places, never paints" means the setting can position the part on a page but not change its colours or
            type.</p>
          <ArgTypes />
        </> : <p>{name} is a recipe, not a component: there are no settings. Developers copy its markup from the stories' code.</p>}
      </section>
    </div>
  );
}

