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
  draft: 'Built and in use, but its look and props may still change. Nothing is stable until a developer has reviewed its API.',
  candidate: 'Its page is complete and it is ready for a developer to review its API. Small changes may still come.',
  stable: 'A developer has reviewed its API. Changes to it are announced and come with a migration note.'
};

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
  const {sections} = parseGuide(guide ?? '');
  const ids = usePartIds();
  const a11y = useA11y(title);

  const purpose = firstSentence(component?.__docgenInfo?.description || parameters.docs?.description?.component || '');
  const stage = preparedMeta.tags.find(t => t.startsWith('status:'))?.slice('status:'.length);
  const status = stage && STAGES.includes(stage) ? stage : 'draft';
  const cssName = parameters.fileName?.match(/([^/]+)\.stories\.tsx$/)?.[1] ?? '';
  const tokens = Object.entries(usage).filter(([, users]) => users.includes(cssName)).map(([t]) => t).sort();

  const made: Record<string, ReactNode> = {
    Purpose: purpose ? <p className="gv-sb-page__purpose">{purpose}</p> : <p>No doc comment yet.</p>,
    Status: (
      <p className="gv-sb-page__status">
        <span className="gv-sb-page__stage" data-stage={status}>{status[0].toUpperCase() + status.slice(1)}</span>{' '}
        {STAGE_TEXT[status]}
      </p>
    ),
    'Variants and states': <Stories title={<></>} includePrimary={false} />,
    Tokens: tokens.length ? (
      <>
        <p>The tokens {name}'s stylesheet paints with (from <code>npm run tokens:usage</code>). Change one in Foundations and
          every part that uses it follows.</p>
        <table className="gv-sb-page__tokens">
          <thead><tr><th>Token</th><th>What it is for</th></tr></thead>
          <tbody>{tokens.map(t => <tr key={t}><td><code>{t}</code></td><td>{PURPOSE.get(t) ?? ''}</td></tr>)}</tbody>
        </table>
      </>
    ) : <p>No stylesheet of its own: it is painted by the parts it is made of.</p>,
    Provenance: sections.Provenance ? <Text ids={ids}>{sections.Provenance}</Text> : <p>Not yet recorded.</p>,
    Accessibility: (
      <>
        {sections.Accessibility && <Text ids={ids}>{sections.Accessibility}</Text>}
        <p className="gv-sb-page__a11y">
          {a11y ? `Automated checks (axe, every story in both directions): ${a11y.violations === 0 ? 'no findings' :
            `${a11y.violations} finding${a11y.violations === 1 ? '' : 's'}`} across ${a11y.stories} stories. ` : ''}
          <a href="./?path=/docs/overview-accessibility--docs" target="_top">Overview › Accessibility</a> has every part's
          results. Findings are reported, never blocking.
        </p>
      </>
    )
  };

  const shown = guide ? SECTIONS : ['Purpose', 'Status', 'Variants and states', 'Tokens', 'Provenance'];
  return (
    <div className="gv-sb-page" data-guide={guide ? 'written' : 'not-written'}>
      <Title />
      {shown.flatMap(s => {
        const body = made[s] ?? (sections[s] ? <Text ids={ids}>{sections[s]}</Text> : null);
        const out = [<Section key={s} name={s}>{body}</Section>];
        if (s === 'Status') {
          out.push(<div key="primary" className="gv-sb-page__primary"><Primary /></div>);
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
        <p>For developers: the props {name} takes, from its code.</p>
        <ArgTypes />
      </section>
    </div>
  );
}

