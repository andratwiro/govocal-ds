import {useState} from 'react';
import {FileText, MapPin, Pencil, Plus, Tag, Trash2, CircleDot} from 'lucide-react';
import {Button} from '../../../src/components/Button';
import {TextField, TextArea} from '../../../src/components/TextField';
import {ColorField} from '../../../src/components/ColorField';
import {ColorSwatch} from '../../../src/components/ColorSwatch';
import {Select, SelectItem} from '../../../src/components/Select';
import {MenuItem} from '../../../src/components/Menu';
import {queue} from '../../../src/components/Toast';
import {DataTable, DataTableHeader, DataTableColumn, DataTableBody, DataTableRow, DataTableCell, DataTableOptions,
  DataTableStack} from '../../../src/components/gv/DataTable';
import {Panel} from '../../../src/components/gv/Panel';
import {Badge} from '../../../src/components/gv/Badge';
import {EmptyState} from '../../../src/components/gv/EmptyState';
import {AlertDialog} from '../../../src/components/gv/AlertDialog';
import {Modal} from '../../../src/components/gv/Modal';
import {RichTextEditor} from '../../../src/components/gv/RichTextEditor';
import {AREAS, INPUT_STATUS_CATEGORIES, INPUT_STATUSES, PLATFORM_TAGS, POLICIES, PROPOSAL_STATUS_CATEGORIES,
  PROPOSAL_STATUSES, type SettingsItem} from '../data-settings';

// Settings' list tabs (Tags, Areas, Statuses) and Policies: each list a Panel over a Data table, Add in the Panel's
// head, Edit and Delete in the row's "…" menu; Add and Edit open the same Modal, Delete confirms first.

const icon = (Icon: typeof Plus) => <Icon aria-hidden size={16} />;

/** Instant changes and saves say so in a Toast, with Undo where they can be taken back (docs/DECISIONS.md). */
export const toast = (title: string, undo?: () => void) =>
  queue.add({title, ...(undo && {action: 'Undo', onAction: undo})}, {timeout: 5000});

// The lists as changed here outlive a switch of tab (the tab panels unmount), until a reload, so Undo still lands.
const store: Record<string, SettingsItem[]> = {
  tags: PLATFORM_TAGS, areas: AREAS, input: INPUT_STATUSES, proposal: PROPOSAL_STATUSES
};
function useStored(key: string) {
  const [value, set] = useState(store[key]);
  const update = (f: (v: SettingsItem[]) => SettingsItem[]) => set(store[key] = f(store[key]));
  return [value, update] as const;
}

type ListConfig = {
  /** The store key. */
  id: string;
  title: string;
  help: string;
  /** "Add platform tag", and the modal's title for a new row. */
  add: string;
  /** The modal's title for an existing row. */
  edit: string;
  noun: string;
  /** The column heading of the name. */
  column: string;
  empty: {icon: typeof Plus; title: string; description: string};
  /** Statuses only: the category choices; also turns on the colour. */
  categories?: string[];
};

function ItemModal({config, item, onClose, onSave}: {config: ListConfig; item: SettingsItem | null; onClose: () => void; onSave: (i: SettingsItem) => void}) {
  const {noun, categories} = config;
  const [d, setD] = useState<SettingsItem>(item ?? {id: '', name: '', description: '', color: categories ? '#3B6FB6' : undefined,
    category: categories?.[0]});
  const Noun = noun[0].toUpperCase() + noun.slice(1);
  return (
    <Modal isOpen onOpenChange={o => { if (!o) onClose(); }} title={item ? config.edit : config.add}
      footer={<>
        <Button variant="secondary" onPress={onClose}>Cancel</Button>
        <Button variant="primary" isDisabled={!d.name.trim()} onPress={() => onSave(d)}>Save {noun}</Button>
      </>}>
      <div className="bo-settings-modal">
        <TextField label={`${Noun} name`} isRequired value={d.name} onChange={v => setD({...d, name: v})} />
        <TextArea label={`${Noun} description`} value={d.description} onChange={v => setD({...d, description: v})} />
        {categories && <>
          <ColorField label="Color" value={d.color} onChange={c => c && setD({...d, color: c.toString('hex')})} />
          <Select label="Category" value={d.category} onChange={v => setD({...d, category: String(v)})}
            description="The category that best represents the status. It helps the analysis of inputs.">
            {categories.map(c => <SelectItem key={c} id={c}>{c}</SelectItem>)}
          </Select>
        </>}
      </div>
    </Modal>
  );
}

function ItemList({config}: {config: ListConfig}) {
  const [items, setItems] = useStored(config.id);
  const [editing, setEditing] = useState<SettingsItem | 'new' | null>(null);
  const [deleting, setDeleting] = useState<SettingsItem | null>(null);
  const save = (d: SettingsItem) => {
    if (editing === 'new') {
      const id = `new-${config.id}-${Date.now()}`;
      setItems(xs => [...xs, {...d, id}]);
      toast(`${d.name} added`, () => setItems(xs => xs.filter(x => x.id !== id)));
    } else {
      setItems(xs => xs.map(x => x.id === d.id ? d : x));
      toast(`${d.name} saved`);
    }
    setEditing(null);
  };
  const remove = (item: SettingsItem) => {
    const at = store[config.id].findIndex(x => x.id === item.id);
    setItems(xs => xs.filter(x => x.id !== item.id));
    setDeleting(null);
    toast(`${item.name} deleted`, () => setItems(xs => [...xs.slice(0, at), item, ...xs.slice(at)]));
  };
  const add = (variant: 'primary' | 'secondary') => (
    <Button variant={variant} size={32} onPress={() => setEditing('new')}>{icon(Plus)}{config.add}</Button>
  );
  const Empty = config.empty.icon;
  return (
    <>
      <Panel title={config.title} headingLevel={3} count={items.length} description={config.help}
        flush={items.length > 0} actions={add('primary')}>
        {items.length ? (
          <DataTable aria-label={config.title}>
            <DataTableHeader>
              <DataTableColumn isRowHeader>{config.column}</DataTableColumn>
              {config.categories && <DataTableColumn>Category</DataTableColumn>}
              <DataTableColumn align="options" showLabel={false}>Actions</DataTableColumn>
            </DataTableHeader>
            <DataTableBody>
              {items.map(item => (
                <DataTableRow key={item.id} id={item.id} textValue={item.name}>
                  <DataTableCell textValue={item.name}>
                    <DataTableStack isStrong sub={item.description || undefined}
                      leading={item.color && <ColorSwatch color={item.color} aria-label={`Colour of ${item.name}`} />}>
                      {item.name}
                    </DataTableStack>
                  </DataTableCell>
                  {config.categories && <DataTableCell>{item.category && <Badge>{item.category}</Badge>}</DataTableCell>}
                  <DataTableCell align="options">
                    <DataTableOptions aria-label={`Options for ${item.name}`}
                      onAction={k => k === 'edit' ? setEditing(item) : setDeleting(item)}>
                      <MenuItem id="edit" icon={icon(Pencil)}>Edit {config.noun}</MenuItem>
                      <MenuItem id="delete" icon={icon(Trash2)}>Delete {config.noun}</MenuItem>
                    </DataTableOptions>
                  </DataTableCell>
                </DataTableRow>
              ))}
            </DataTableBody>
          </DataTable>
        ) : (
          <EmptyState size="panel" headingLevel={4} icon={<Empty size={24} />} title={config.empty.title}
            description={config.empty.description} action={add('secondary')} />
        )}
      </Panel>
      {editing && <ItemModal key={editing === 'new' ? 'new' : editing.id} config={config}
        item={editing === 'new' ? null : editing} onClose={() => setEditing(null)} onSave={save} />}
      <AlertDialog tone="danger" isOpen={!!deleting} onOpenChange={o => { if (!o) setDeleting(null); }}
        title={`Delete ${config.noun}?`} confirmLabel={`Delete ${config.noun}`} onConfirm={() => { if (deleting) remove(deleting); }}>
        <p>{deleting?.name} is taken off everything that carries it.</p>
      </AlertDialog>
    </>
  );
}

export function TagsTab() {
  return (
    <div className="bo-settings-stack">
      <ItemList config={{id: 'tags', title: 'Platform tags', add: 'Add platform tag', edit: 'Edit platform tag', noun: 'tag', column: 'Tag',
        help: 'Platform tags are used to categorize projects, for example on the homepage. You add them to a project in its settings.',
        empty: {icon: Tag, title: 'No platform tags yet', description: 'Tags you add here can be given to projects, so residents find them by theme.'}}} />
    </div>
  );
}

export function AreasTab() {
  return (
    <div className="bo-settings-stack">
      <ItemList config={{id: 'areas', title: 'Areas', add: 'Add area', edit: 'Edit area', noun: 'area', column: 'Area',
        help: 'Define the geographical areas (neighbourhoods, quarters…) residents can choose when they register. Areas can be linked to projects and used for smart groups.',
        empty: {icon: MapPin, title: 'No areas yet', description: 'Areas you add here are offered to residents when they register.'}}} />
    </div>
  );
}

export function StatusesTab() {
  const status = {noun: 'status', column: 'Status', edit: 'Edit status',
    empty: {icon: CircleDot, title: 'No statuses yet', description: 'Every input needs a status to move through.'}};
  return (
    <div className="bo-settings-stack">
      <ItemList config={{...status, id: 'input', title: 'Input statuses', add: 'Add input status', categories: INPUT_STATUS_CATEGORIES,
        help: 'Manage the status that can be assigned to participant input within a project. The status is publicly visible and helps in keeping participants informed.'}} />
      <ItemList config={{...status, id: 'proposal', title: 'Proposal statuses', add: 'Add proposal status', categories: PROPOSAL_STATUS_CATEGORIES,
        help: 'Manage the status that can be assigned to proposals within a project. The status is publicly visible and helps in keeping participants informed.'}} />
    </div>
  );
}

type Policy = (typeof POLICIES)[number];

/** One policy's text in the Rich text editor, in a wide Modal; Save in the foot. */
function PolicyModal({policy, text, onClose, onSave}: {policy: Policy; text: string; onClose: () => void; onSave: (t: string) => void}) {
  const [value, setValue] = useState(text);
  const [bold, setBold] = useState(false);
  const [italic, setItalic] = useState(false);
  const [list, setList] = useState(false);
  return (
    <Modal isOpen size="wide" onOpenChange={o => { if (!o) onClose(); }} title={`Edit ${policy.name.toLowerCase()}`}
      footer={<>
        <Button variant="secondary" onPress={onClose}>Cancel</Button>
        <Button variant="primary" aria-label={`Save ${policy.name}`} isDisabled={value === text} onPress={() => onSave(value)}>Save</Button>
      </>}>
      <RichTextEditor aria-label={policy.name} placeholder={`The ${policy.name.toLowerCase()} residents read`} value={value}
        onChange={setValue} bold={bold} onBoldChange={setBold} italic={italic} onItalicChange={setItalic} list={list} onListChange={setList} />
    </Modal>
  );
}

export function PoliciesTab() {
  const [texts, setTexts] = useState<Record<string, string>>(() => Object.fromEntries(POLICIES.map(p => [p.id, p.text])));
  const [editing, setEditing] = useState<Policy | null>(null);
  return (
    <div className="bo-settings-stack">
      <Panel title="Platform policies" headingLevel={3} count={POLICIES.length} flush
        description="Edit your platform's terms and conditions and privacy policy. Other pages, including the About and FAQ pages, are edited in Pages & menu.">
        <DataTable aria-label="Platform policies">
          <DataTableHeader>
            <DataTableColumn isRowHeader>Policy</DataTableColumn>
            <DataTableColumn align="options" showLabel={false}>Actions</DataTableColumn>
          </DataTableHeader>
          <DataTableBody>
            {POLICIES.map(p => (
              <DataTableRow key={p.id} id={p.id} textValue={p.name}>
                <DataTableCell textValue={p.name}>
                  <DataTableStack isStrong leading={icon(FileText)} sub={texts[p.id]}>{p.name}</DataTableStack>
                </DataTableCell>
                <DataTableCell align="options">
                  <DataTableOptions aria-label={`Options for ${p.name}`} onAction={() => setEditing(p)}>
                    <MenuItem id="edit" icon={icon(Pencil)}>Edit {p.name.toLowerCase()}</MenuItem>
                  </DataTableOptions>
                </DataTableCell>
              </DataTableRow>
            ))}
          </DataTableBody>
        </DataTable>
      </Panel>
      {editing && <PolicyModal key={editing.id} policy={editing} text={texts[editing.id]} onClose={() => setEditing(null)}
        onSave={t => { setTexts(x => ({...x, [editing.id]: t})); setEditing(null); toast(`${editing.name} saved`); }} />}
    </div>
  );
}
