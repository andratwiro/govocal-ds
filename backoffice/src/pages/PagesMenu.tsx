import {useState} from 'react';
import {ArrowUpDown, Eye, GripVertical, Lock, Pencil, Plus, Trash2} from 'lucide-react';
import {Tabs, TabList, Tab, TabPanel} from '../../../src/components/Tabs';
import {Button} from '../../../src/components/Button';
import {MenuTrigger, Menu, MenuItem} from '../../../src/components/Menu';
import {Switch} from '../../../src/components/Switch';
import {GridList, GridListItem} from '../../../src/components/GridList';
import {Card} from '../../../src/components/gv/Card';
import {Pill} from '../../../src/components/gv/Pill';
import {Status} from '../../../src/components/gv/Status';
import {IconButton} from '../../../src/components/gv/IconButton';
import {Divider} from '../../../src/components/gv/Divider';
import {MENU_ENTRIES, MENU_START, PAGE_META, type MenuEntry} from '../data-pages-menu';
import {Gap, GapLegend} from '../Gap';
import {Page} from './Page';
import {SectionHeading} from '../SectionHeading';

const entry = (id: string) => MENU_ENTRIES.find(e => e.id === id)!;
const move = (list: string[], id: string, by: number) => {
  const i = list.indexOf(id), j = i + by;
  // Home stays first, as in the real admin.
  if (j < 1 || j >= list.length) return list;
  const next = [...list];
  [next[i], next[j]] = [next[j], next[i]];
  return next;
};

type MenuProps = {menu: string[]; setMenu: (m: string[]) => void};

// One navigation bar item, as the prototype's page outline row: a grip (a lock when pinned), the
// label, then its actions at the end.
function MenuRow({item, index, count, menu, setMenu}: MenuProps & {item: MenuEntry; index: number; count: number}) {
  const pinned = item.kind === 'home';
  return (
    <GridListItem id={item.id} textValue={item.label}>
      <div className="bo-pages-menu-row">
        {pinned
          ? <span className="bo-pages-menu-grip"><Lock aria-label="Always first" size={16} /></span>
          : <Gap name="Drag-and-drop reordering" inline><span className="bo-pages-menu-grip"><GripVertical aria-hidden size={16} /></span></Gap>}
        <span className="bo-pages-menu-label">{item.label}</span>
        {item.kind !== 'page' && <Pill>Default</Pill>}
        <span className="bo-push" />
        <IconButton variant="bordered" aria-label={pinned ? 'Edit homepage' : `Edit ${item.label}`}>
          <Pencil aria-hidden size={16} />
        </IconButton>
        {!pinned && <>
          <Button variant="quiet" size={32} aria-label={`Remove ${item.label} from menu`} onPress={() => setMenu(menu.filter(id => id !== item.id))}>Remove from menu</Button>
          <MenuTrigger>
            <IconButton aria-label={`Reorder ${item.label}`}><ArrowUpDown aria-hidden size={16} /></IconButton>
            <Menu aria-label={`Reorder ${item.label}`} onAction={k => setMenu(move(menu, item.id, k === 'up' ? -1 : 1))}
              disabledKeys={[...(index <= 1 ? ['up'] : []), ...(index === count - 1 ? ['down'] : [])]}>
              <MenuItem id="up">Move up</MenuItem>
              <MenuItem id="down">Move down</MenuItem>
            </Menu>
          </MenuTrigger>
        </>}
      </div>
    </GridListItem>
  );
}

function MenuTab({menu, setMenu, pages}: MenuProps & {pages: string[]}) {
  const addable = MENU_ENTRIES.filter(e => !menu.includes(e.id) && (e.kind !== 'page' || pages.includes(e.id)));
  const items = menu.map(entry);
  return (
    <Card
      layout="stacked"
      title="Navigation bar"
      actions={
        <MenuTrigger>
          <Button variant="primary" size={32} isDisabled={addable.length === 0}><Plus aria-hidden size={16} />New menu item</Button>
          <Menu aria-label="New menu item" onAction={k => setMenu([...menu, String(k)])}>
            {addable.map(e => <MenuItem key={e.id} id={e.id}>{e.label}</MenuItem>)}
          </Menu>
        </MenuTrigger>
      }>
      <div className="bo-pages-menu-body">
        <p className="bo-note bo-pages-menu-intro">Organise the menu that appears across your site. Add new items and drag to reorder.</p>
        <GridList aria-label="Menu items" layout="stack" className="react-aria-GridList bo-pages-menu-list">
          {items.map((item, i) => <MenuRow key={item.id} item={item} index={i} count={items.length} menu={menu} setMenu={setMenu} />)}
        </GridList>
      </div>
    </Card>
  );
}

function PagesTab({menu, setMenu, pages, setPages}: MenuProps & {pages: string[]; setPages: (p: string[]) => void}) {
  return (
    <Card
      layout="stacked"
      title="Custom pages"
      actions={<Button variant="primary" size={32}><Plus aria-hidden size={16} />New custom page</Button>}>
      <div className="bo-pages-menu-body">
        <p className="bo-note bo-pages-menu-intro">Every custom page you’ve built. Edit content, view, or delete a page.</p>
        {pages.length === 0
          ? <p className="bo-note">You haven’t created any custom pages yet.</p>
          : <ul className="bo-pages-menu-pages" aria-label="Custom pages">
            {pages.map((id, i) => {
              const page = entry(id), meta = PAGE_META[id], inMenu = menu.includes(id);
              return (
                <li key={id} className="bo-pages-menu-page">
                  {i > 0 && <Divider />}
                  <div className="bo-pages-menu-row">
                    <span className="bo-pages-menu-title">
                      <span className="bo-pages-menu-label">{page.label}</span>
                      <span className="bo-note">/pages/{meta.slug} · {meta.edited}</span>
                    </span>
                    <Status state={inMenu ? 'live' : 'draft'}>{inMenu ? 'In menu' : 'Not in menu'}</Status>
                    <span className="bo-push" />
                    <Switch isSelected={inMenu}
                      onChange={on => setMenu(on ? [...menu, id] : menu.filter(m => m !== id))} aria-label={`Show ${page.label} in menu`}>Show in menu</Switch>
                    <IconButton variant="bordered" aria-label={`Edit page: ${page.label}`}><Pencil aria-hidden size={16} /></IconButton>
                    <IconButton variant="bordered" aria-label={`View page: ${page.label}`}><Eye aria-hidden size={16} /></IconButton>
                    <IconButton variant="bordered" aria-label={`Delete page: ${page.label}`}
                      onPress={() => { setPages(pages.filter(p => p !== id)); setMenu(menu.filter(m => m !== id)); }}>
                      <Trash2 aria-hidden size={16} />
                    </IconButton>
                  </div>
                </li>
              );
            })}
          </ul>}
        <p className="bo-note">Terms and conditions, the privacy policy and the cookie policy are edited in Settings.</p>
      </div>
    </Card>
  );
}

export function PagesMenu() {
  const [menu, setMenu] = useState(MENU_START);
  const [pages, setPages] = useState(MENU_ENTRIES.filter(e => e.kind === 'page').map(e => e.id));
  return (
    <Page title="Pages & menu" description="The navigation bar residents see on every page, and the custom pages it can link to.">
      <Tabs defaultSelectedKey="menu">
        <TabList aria-label="Pages & menu sections">
          <Tab id="menu">Menu</Tab>
          <Tab id="pages">Pages</Tab>
        </TabList>
        <TabPanel id="menu" className="react-aria-TabPanel bo-pages-menu-panel"><SectionHeading>Menu</SectionHeading><MenuTab menu={menu} setMenu={setMenu} pages={pages} /></TabPanel>
        <TabPanel id="pages" className="react-aria-TabPanel bo-pages-menu-panel">
          <SectionHeading>Pages</SectionHeading>
          <PagesTab menu={menu} setMenu={setMenu} pages={pages} setPages={setPages} />
        </TabPanel>
      </Tabs>
      <GapLegend names={['drag-and-drop reordering (Move up and Move down stand in)']} />
    </Page>
  );
}
