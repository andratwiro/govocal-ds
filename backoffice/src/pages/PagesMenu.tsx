import {useState} from 'react';
import {useNavigate} from 'react-router';
import {Eye, FileText, Lock, MoreHorizontal, Pencil, Plus, Trash2, X} from 'lucide-react';
import {AlertDialog, Badge, Banner, Button, DataTable, DataTableBody, DataTableCell, DataTableColumn, DataTableHeader,
  DataTableOptions, DataTableRow, DataTableStack, EmptyState, IconButton, Menu, MenuItem, MenuTrigger, Panel,
  SortableList, Stack, Switch, Tab, TabList, TabPanel, TabPanels, Tabs, toast} from 'govocal-ds';
import {MENU_ENTRIES, MENU_START, PAGE_META, PAGES_START, type MenuEntry} from '../data-pages-menu';
import {Page} from './Page';

const entry = (id: string) => MENU_ENTRIES.find(e => e.id === id)!;
const icon = (Icon: typeof Plus) => <Icon aria-hidden size={16} />;

// The menu and the pages as changed here: they outlive a visit to an editor, until a reload, so an Undo pressed
// after leaving the page still lands.
const store = {menu: [...MENU_START], pages: [...PAGES_START]};
function useStored<K extends keyof typeof store>(key: K) {
  const [value, set] = useState(store[key]);
  const update = (f: (v: string[]) => string[]) => set(store[key] = f(store[key]));
  return [value, update] as const;
}


type Update = (f: (v: string[]) => string[]) => void;

/** The navigation bar: a Panel over a Sortable list, Home pinned first above it, the rest dragged into their order. */
function MenuTab({menu, setMenu, pages}: {menu: string[]; setMenu: Update; pages: string[]}) {
  const navigate = useNavigate();
  const addable = MENU_ENTRIES.filter(e => !menu.includes(e.id) && (e.kind !== 'page' || pages.includes(e.id)));
  const items = menu.map(entry);
  // Home stays first, as in the real admin: it sits above the list, and the list holds the rest.
  const home = items.find(i => i.kind === 'home');
  const movable = items.filter(i => i.kind !== 'home');
  const reorder = (next: MenuEntry[]) => setMenu(() => [...(home ? [home.id] : []), ...next.map(i => i.id)]);
  const remove = (item: MenuEntry) => {
    const at = menu.indexOf(item.id);
    setMenu(m => m.filter(id => id !== item.id));
    toast(`${item.label} removed from the menu`, undefined, {action: 'Undo', onAction: () => setMenu(m => [...m.slice(0, at), item.id, ...m.slice(at)])});
  };
  const add = (id: string) => {
    setMenu(m => [...m, id]);
    toast(`${entry(id).label} added to the menu`, undefined, {action: 'Undo', onAction: () => setMenu(m => m.filter(x => x !== id))});
  };
  const edit = (item: MenuEntry) =>
    navigate(item.kind === 'home' ? '/pages-menu/homepage-builder' : `/pages-menu/navbar-items/edit/${item.id}`);
  // A row: the item, its kind, its "…" menu (Edit; Remove for every item but Home).
  const row = (item: MenuEntry) => {
    const pinned = item.kind === 'home';
    return <>
      <span>{item.label}</span>
      {item.kind === 'page' ? <Badge variant="outlined">Custom page</Badge> : <Badge>Default</Badge>}
      <span className="bo-push" />
      <MenuTrigger>
        <IconButton aria-label={`Options for ${item.label}`}>{icon(MoreHorizontal)}</IconButton>
        <Menu aria-label={`Options for ${item.label}`} onAction={k => k === 'edit' ? edit(item) : remove(item)}>
          <MenuItem id="edit" icon={icon(Pencil)}>{pinned ? 'Edit homepage' : 'Edit menu item'}</MenuItem>
          {!pinned && <MenuItem id="remove" icon={icon(X)}>Remove from menu</MenuItem>}
        </Menu>
      </MenuTrigger>
    </>;
  };
  return (
    <Panel title="Navigation bar" count={items.length} isFlush
      description="Organise the menu that appears across your site. Add new items and drag to reorder."
      actions={
        <MenuTrigger>
          <Button variant="primary" size={32} isDisabled={addable.length === 0}>{icon(Plus)}New menu item</Button>
          <Menu aria-label="New menu item" onAction={k => add(String(k))}>
            {addable.map(e => <MenuItem key={e.id} id={e.id} icon={icon(e.kind === 'page' ? FileText : Plus)}
              description={e.kind === 'page' ? 'Custom page' : 'Platform page'}>{e.label}</MenuItem>)}
          </Menu>
        </MenuTrigger>
      }>
      {/* Home: the lock where the others have their handle, in the list's row rhythm (Sortable list's 4 + 24 + 8). */}
      {home && (
        <div className="bo-pages-menu-home">
          <span className="bo-pages-menu-lock"><Lock aria-label="Always first" size={16} /></span>
          {row(home)}
        </div>
      )}
      <SortableList aria-label="Menu items" items={movable} onReorder={reorder} itemLabel={i => i.label}>
        {row}
      </SortableList>
    </Panel>
  );
}

/** The custom pages: a Panel over a Data table, the menu switch in its row, delete confirmed first. */
function PagesTab({menu, setMenu, pages, setPages}: {menu: string[]; setMenu: Update; pages: string[]; setPages: Update}) {
  const navigate = useNavigate();
  const [deleting, setDeleting] = useState<MenuEntry | null>(null);
  const showInMenu = (page: MenuEntry, on: boolean) => {
    setMenu(m => on ? [...m, page.id] : m.filter(x => x !== page.id));
    toast(on ? `${page.label} added to the menu` : `${page.label} removed from the menu`, undefined, {action: 'Undo', onAction: () => setMenu(m => on ? m.filter(x => x !== page.id) : [...m, page.id])});
  };
  const remove = (page: MenuEntry) => {
    setPages(p => p.filter(x => x !== page.id));
    setMenu(m => m.filter(x => x !== page.id));
    setDeleting(null);
    toast(`${page.label} deleted`);
  };
  const create = (variant: 'primary' | 'secondary') => (
    <Button variant={variant} size={32} onPress={() => navigate('/pages-menu/pages/new')}>{icon(Plus)}New custom page</Button>
  );
  return (
    <Stack gap="16">
      <Panel title="Custom pages" count={pages.length} isFlush={pages.length > 0} actions={create('primary')}
        description="Every custom page you’ve built. Edit content, view, or delete a page.">
        {pages.length ? (
          <DataTable aria-label="Custom pages">
            <DataTableHeader>
              <DataTableColumn isRowHeader>Page</DataTableColumn>
              <DataTableColumn>Last edited</DataTableColumn>
              <DataTableColumn>In menu</DataTableColumn>
              <DataTableColumn align="options" showLabel={false}>Actions</DataTableColumn>
            </DataTableHeader>
            <DataTableBody>
              {pages.map(id => {
                const page = entry(id), meta = PAGE_META[id], inMenu = menu.includes(id);
                return (
                  <DataTableRow key={id} id={id}>
                    <DataTableCell textValue={page.label}>
                      <DataTableStack isStrong sub={`/pages/${meta.slug}`}>{page.label}</DataTableStack>
                    </DataTableCell>
                    <DataTableCell isMuted>{meta.edited}</DataTableCell>
                    <DataTableCell>
                      <Switch isSelected={inMenu} aria-label={`Show ${page.label} in menu`} onChange={on => showInMenu(page, on)}>
                        {inMenu ? 'In menu' : 'Not in menu'}
                      </Switch>
                    </DataTableCell>
                    <DataTableCell align="options">
                      <DataTableOptions aria-label={`Options for page: ${page.label}`}
                        onAction={k => k === 'edit' ? navigate(`/pages-menu/pages/${id}`)
                          : k === 'view' ? navigate(`/pages-menu/pages/${id}/view`) : setDeleting(page)}>
                        <MenuItem id="edit" icon={icon(Pencil)}>Edit page</MenuItem>
                        <MenuItem id="view" icon={icon(Eye)}>View page</MenuItem>
                        <MenuItem id="delete" icon={icon(Trash2)}>Delete page</MenuItem>
                      </DataTableOptions>
                    </DataTableCell>
                  </DataTableRow>
                );
              })}
            </DataTableBody>
          </DataTable>
        ) : (
          <EmptyState layout="panel" headingLevel={3} icon={<FileText size={24} />} title="You haven’t created any custom pages yet"
            description="A custom page holds text, projects and events on one topic, and can be linked from the menu."
            actions={create('secondary')} />
        )}
      </Panel>
      <Banner tone="info" linkLabel="Go to Settings" linkHref="#/settings">
        Terms and conditions, the privacy policy and the cookie policy are edited in Settings.
      </Banner>
      <AlertDialog tone="danger" isOpen={!!deleting} onOpenChange={o => { if (!o) setDeleting(null); }} title="Delete page?"
        confirmLabel="Delete page" onConfirm={() => { if (deleting) remove(deleting); }}>
        <p>{deleting?.label} leaves the platform and the menu. Links to it stop working. This cannot be undone.</p>
      </AlertDialog>
    </Stack>
  );
}

export function PagesMenu() {
  const [menu, setMenu] = useStored('menu');
  const [pages, setPages] = useStored('pages');
  return (
    <Page title="Pages & menu" description="The navigation bar residents see on every page, and the custom pages it can link to.">
      <Tabs defaultSelectedKey="menu">
        <TabList aria-label="Pages & menu sections">
          <Tab id="menu" count={menu.length}>Menu</Tab>
          <Tab id="pages" count={pages.length}>Pages</Tab>
        </TabList>
        <TabPanels>
          <TabPanel id="menu" className="bo-pages-menu-panel">
            <MenuTab menu={menu} setMenu={setMenu} pages={pages} />
          </TabPanel>
          <TabPanel id="pages" className="bo-pages-menu-panel">
            <PagesTab menu={menu} setMenu={setMenu} pages={pages} setPages={setPages} />
          </TabPanel>
        </TabPanels>
      </Tabs>
    </Page>
  );
}
