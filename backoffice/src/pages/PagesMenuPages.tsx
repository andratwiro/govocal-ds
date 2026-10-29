import {useState} from 'react';
import {useNavigate, useParams} from 'react-router';
import {Eye, FileQuestion} from 'lucide-react';
import {Banner, Button, Divider, EmptyState, Panel, queue, Radio, RadioGroup, SectionToggle, Tab, TabList, TabPanel,
  TabPanels, Tabs, TextField, ToastRegion} from 'govocal-ds';
import {CUSTOM_PAGE_SECTIONS, HOME_SECTIONS, MENU_ENTRIES, NAV_NAMES, PAGE_INTRO, PAGE_META, type PageSection} from '../data-pages-menu';
import {LOCALES} from '../data-settings';
import {Gap} from '../Gap';
import {Page} from './Page';

// The first screens behind Pages & menu: the homepage builder, a navbar item's form, a custom page's editor and
// its view. Shallow, as the real admin's routes under /pages-menu.
const CRUMB = [{key: 'pages-menu', label: 'Pages & menu', href: '#/pages-menu'}];

/** Save, which turns off until something changes again; the save says so in a Toast. */
function SaveButton({label, isDisabled, done, onSave}: {label: string; isDisabled: boolean; done: string; onSave: () => void}) {
  return (
    <Button variant="primary" size={32} isDisabled={isDisabled}
      onPress={() => { onSave(); queue.add({title: done}, {timeout: 5000}); }}>{label}</Button>
  );
}

/** The section list with a switch per section; `onChange` gets the whole new state. */
function SectionList({sections, on, onChange}: {sections: PageSection[]; on: Record<string, boolean>; onChange: (on: Record<string, boolean>) => void}) {
  return (
    <ul className="bo-pages-menu-sections" aria-label="Sections">
      {sections.map((s, i) => (
        <li key={s.id}>
          {i > 0 && <Divider />}
          <SectionToggle title={s.title} description={s.description} isSelected={on[s.id]} isDisabled={s.locked}
            onChange={v => onChange({...on, [s.id]: v})} />
        </li>
      ))}
    </ul>
  );
}

const initial = (sections: PageSection[]) => Object.fromEntries(sections.map(s => [s.id, s.on]));

export function HomepageBuilder() {
  const [on, setOn] = useState(() => initial(HOME_SECTIONS));
  const [dirty, setDirty] = useState(false);
  const shown = HOME_SECTIONS.filter(s => on[s.id]);
  return (
    <Page title="Homepage" crumbs={CRUMB} description="Turn the homepage's sections on and off. The preview follows.">
      <div className="bo-pages-menu-split">
        <Panel title="Sections" count={`${shown.length} of ${HOME_SECTIONS.length} shown`}
          description="This page consists of the following sections. You can turn them on or off."
          footer={<SaveButton label="Save homepage" isDisabled={!dirty} done="Homepage saved" onSave={() => setDirty(false)} />}>
          <SectionList sections={HOME_SECTIONS} on={on} onChange={o => { setOn(o); setDirty(true); }} />
        </Panel>
        <Panel title="Preview" description="The homepage's sections, top to bottom.">
          <Gap name="Homepage preview">
            <ol className="bo-pages-menu-preview" aria-label="Homepage preview">
              {shown.map(s => <li key={s.id} className="bo-note">{s.title}</li>)}
            </ol>
          </Gap>
        </Panel>
      </div>
      <ToastRegion />
    </Page>
  );
}

/** A menu item or page that isn't there: the Empty state, with the way back. */
function NotFound({title, what}: {title: string; what: string}) {
  const navigate = useNavigate();
  return (
    <Page title={title} crumbs={CRUMB}>
      <EmptyState layout="page" icon={<FileQuestion size={24} />} title={`This ${what} does not exist`}
        description="It may have been deleted. Pages & menu lists everything there is."
        actions={<Button variant="secondary" size={32} onPress={() => navigate('/pages-menu')}>Back to Pages & menu</Button>} />
    </Page>
  );
}

// One form per item: moving to another item's route starts afresh.
export function NavbarItemEdit() {
  const {itemId = ''} = useParams();
  return <NavbarItemForm key={itemId} itemId={itemId} />;
}

function NavbarItemForm({itemId}: {itemId: string}) {
  const item = MENU_ENTRIES.find(e => e.id === itemId);
  const [names, setNames] = useState<Record<string, string>>(() => ({en: item?.label ?? '', ...NAV_NAMES[itemId]}));
  const [dirty, setDirty] = useState(false);
  if (!item) return <NotFound title="Menu item not found" what="menu item" />;
  const missing = LOCALES.filter(l => !names[l.id]?.trim());
  return (
    <Page title={item.label} crumbs={CRUMB}>
      <Panel title="Name in navbar" description="The name of this item in the navigation bar, in every platform language."
        footer={<SaveButton label="Save page" isDisabled={!dirty} done="Page successfully saved" onSave={() => setDirty(false)} />}>
        <div className="bo-pages-menu-form">
          {missing.length > 0 && <Banner tone="warning" title="Provide a title for all languages.">
            Missing: {missing.map(l => l.label).join(', ')}. Residents using that language see the English name.
          </Banner>}
          {LOCALES.map(l => (
            <TextField key={l.id} label={`Name in navbar (${l.label})`} value={names[l.id] ?? ''}
              onChange={v => { setNames(n => ({...n, [l.id]: v})); setDirty(true); }} />
          ))}
        </div>
      </Panel>
      <ToastRegion />
    </Page>
  );
}

const slugify = (s: string) => s.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '')
  .replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');

/** Create custom page (no id) or edit one: Settings and Content tabs, one Save for both, in the page head. */
export function CustomPageEditor() {
  const {pageId} = useParams();
  return <CustomPageForm key={pageId ?? 'new'} pageId={pageId} />;
}

function CustomPageForm({pageId}: {pageId?: string}) {
  const navigate = useNavigate();
  const page = pageId ? MENU_ENTRIES.find(e => e.id === pageId && e.kind === 'page') : undefined;
  const [title, setTitle] = useState(page?.label ?? '');
  const [slug, setSlug] = useState(pageId ? PAGE_META[pageId]?.slug ?? '' : '');
  const [slugTouched, setSlugTouched] = useState(!!page);
  const [linked, setLinked] = useState('none');
  const [on, setOn] = useState(() => initial(CUSTOM_PAGE_SECTIONS));
  const [dirty, setDirty] = useState(false);
  if (pageId && !page) return <NotFound title="Page not found" what="custom page" />;
  const touch = () => setDirty(true);
  const isNew = !page;
  const shown = CUSTOM_PAGE_SECTIONS.filter(s => on[s.id]).length;
  return (
    <Page title={isNew ? 'Create custom page' : page.label} crumbs={CRUMB}
      actions={<span className="bo-pages-menu-actions">
        {!isNew && <Button variant="secondary" size={32} onPress={() => navigate(`/pages-menu/pages/${page.id}/view`)}>
          <Eye aria-hidden size={16} />View page</Button>}
        <SaveButton label="Save custom page" isDisabled={!title.trim() || !dirty}
          done={isNew ? 'Page successfully created' : 'Page successfully saved'} onSave={() => setDirty(false)} />
      </span>}>
      <Tabs defaultSelectedKey="settings">
        <TabList aria-label="Custom page sections">
          <Tab id="settings">Settings</Tab>
          <Tab id="content">Content</Tab>
        </TabList>
        <TabPanels>
          <TabPanel id="settings" className="react-aria-TabPanel bo-pages-menu-panel">
            <Panel title="Page settings" description="The page's title, its address on the platform, and what it links to.">
              <div className="bo-pages-menu-form">
                <TextField label="Title" isRequired placeholder="Enter a title" value={title}
                  onChange={v => { setTitle(v); if (!slugTouched) setSlug(slugify(v)); touch(); }} />
                <TextField label="Slug" value={slug} description="Lowercase letters (a-z), numbers (0-9) and hyphens only."
                  onChange={v => { setSlug(v); setSlugTouched(true); touch(); }} />
                <RadioGroup label="Linked items" description="Select which items and related events can be displayed on the page."
                  value={linked} onChange={v => { setLinked(v); touch(); }}>
                  <Radio value="none">None</Radio>
                  <Radio value="area">By area</Radio>
                  <Radio value="tags">By tag(s)</Radio>
                </RadioGroup>
              </div>
            </Panel>
          </TabPanel>
          <TabPanel id="content" className="react-aria-TabPanel bo-pages-menu-panel">
            <Panel title="Page content" count={`${shown} of ${CUSTOM_PAGE_SECTIONS.length} shown`}
              description="This page consists of the following sections. You can turn them on or off.">
              <SectionList sections={CUSTOM_PAGE_SECTIONS} on={on} onChange={o => { setOn(o); touch(); }} />
            </Panel>
          </TabPanel>
        </TabPanels>
      </Tabs>
      <ToastRegion />
    </Page>
  );
}

/** A custom page as residents see it: shallow, the title and its opening text. */
export function CustomPageView() {
  const {pageId = ''} = useParams();
  const page = MENU_ENTRIES.find(e => e.id === pageId && e.kind === 'page');
  if (!page) return <NotFound title="Page not found" what="custom page" />;
  return (
    <Page title={page.label} crumbs={[...CRUMB, {key: 'edit', label: 'Edit page', href: `#/pages-menu/pages/${page.id}`}]}
      description={`/pages/${PAGE_META[page.id].slug} on the platform`}>
      <Gap name="Platform page view">
        <p>{PAGE_INTRO[page.id]}</p>
      </Gap>
    </Page>
  );
}
