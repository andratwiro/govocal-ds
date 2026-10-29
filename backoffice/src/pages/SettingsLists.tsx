import {useState} from 'react';
import {ArrowLeft, Pencil, Plus} from 'lucide-react';
import {Button} from '../../../src/components/Button';
import {TextField, TextArea} from '../../../src/components/TextField';
import {ColorField} from '../../../src/components/ColorField';
import {ColorSwatch} from '../../../src/components/ColorSwatch';
import {Select, SelectItem} from '../../../src/components/Select';
import {Card} from '../../../src/components/gv/Card';
import {Divider} from '../../../src/components/gv/Divider';
import {RichTextEditor} from '../../../src/components/gv/RichTextEditor';
import {IconButton} from '../../../src/components/gv/IconButton';
import {Modal} from '../../../src/components/gv/Modal';
import {Badge} from '../../../src/components/gv/Badge';
import {AREAS, INPUT_STATUS_CATEGORIES, INPUT_STATUSES, PLATFORM_TAGS, POLICIES, PROPOSAL_STATUS_CATEGORIES,
  PROPOSAL_STATUSES, type SettingsItem} from '../data-settings';

// Settings' list tabs (Tags, Areas, Statuses) and Policies, as the real admin: a list with its Add button and an Edit
// per row, both opening the same modal; Statuses first asks which statuses; Policies opens each text in the editor.

type ListConfig = {
  title: string;
  help: string;
  /** "Add platform tag", and the modal's title for a new row. */
  add: string;
  /** The modal's title for an existing row. */
  edit: string;
  noun: string;
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

function ItemList({config, start, back}: {config: ListConfig; start: SettingsItem[]; back?: () => void}) {
  const [items, setItems] = useState(start);
  const [editing, setEditing] = useState<SettingsItem | 'new' | null>(null);
  const save = (d: SettingsItem) => {
    if (editing === 'new') setItems(xs => [...xs, {...d, id: `new${xs.length}-${d.name}`}]);
    else setItems(xs => xs.map(x => x.id === d.id ? d : x));
    setEditing(null);
  };
  return (
    <div className="bo-settings-stack">
      {back && <div><Button variant="quiet" size={32} onPress={back}><ArrowLeft aria-hidden size={16} />All statuses</Button></div>}
      <Card title={config.title} layout="stacked"
        actions={<Button variant="primary" size={32} onPress={() => setEditing('new')}><Plus aria-hidden size={16} />{config.add}</Button>}>
        <div className="bo-settings-section">
          <p className="bo-note bo-settings-help">{config.help}</p>
          <ul className="bo-settings-list" aria-label={config.title}>
            {items.map((item, i) => (
              <li key={item.id}>
                {i > 0 && <Divider />}
                <div className="bo-settings-row">
                  {item.color && <ColorSwatch color={item.color} aria-label={`Colour of ${item.name}`} />}
                  <span className="bo-settings-row-text">
                    <span>{item.name}</span>
                    {item.description && <span className="bo-note">{item.description}</span>}
                  </span>
                  {item.category && <Badge>{item.category}</Badge>}
                  <Button variant="secondary" size={32} aria-label={`Edit ${item.name}`} onPress={() => setEditing(item)}>
                    <Pencil aria-hidden size={16} />Edit
                  </Button>
                </div>
              </li>
            ))}
          </ul>
        </div>
      </Card>
      {editing && <ItemModal key={editing === 'new' ? 'new' : editing.id} config={config}
        item={editing === 'new' ? null : editing} onClose={() => setEditing(null)} onSave={save} />}
    </div>
  );
}

export function TagsTab() {
  return <ItemList start={PLATFORM_TAGS} config={{title: 'Platform tags', add: 'Add platform tag', edit: 'Edit platform tag', noun: 'tag',
    help: 'Platform tags are used to categorize projects, for example on the homepage. You add them to a project in its settings.'}} />;
}

export function AreasTab() {
  return <ItemList start={AREAS} config={{title: 'Areas', add: 'Add area', edit: 'Edit area', noun: 'area',
    help: 'Define the geographical areas (neighbourhoods, quarters…) residents can choose when they register. Areas can be linked to projects and used for smart groups.'}} />;
}

const STATUS_KINDS = {
  input: {title: 'Input statuses', button: 'Edit input statuses', start: INPUT_STATUSES, categories: INPUT_STATUS_CATEGORIES,
    help: 'Manage the status that can be assigned to participant input within a project. The status is publicly visible and helps in keeping participants informed.'},
  proposal: {title: 'Proposal statuses', button: 'Edit proposal statuses', start: PROPOSAL_STATUSES, categories: PROPOSAL_STATUS_CATEGORIES,
    help: 'Manage the status that can be assigned to proposals within a project. The status is publicly visible and helps in keeping participants informed.'}
};

export function StatusesTab() {
  const [kind, setKind] = useState<keyof typeof STATUS_KINDS | null>(null);
  if (kind) {
    const k = STATUS_KINDS[kind];
    return <ItemList key={kind} start={k.start} back={() => setKind(null)}
      config={{title: k.title, add: 'Add status', edit: 'Edit status', noun: 'status', categories: k.categories, help: k.help}} />;
  }
  return (
    <div className="bo-settings-stack">
      {(Object.keys(STATUS_KINDS) as (keyof typeof STATUS_KINDS)[]).map(id => {
        const k = STATUS_KINDS[id];
        return (
          <Card key={id} title={k.title} layout="stacked"
            actions={<Button variant="secondary" size={32} onPress={() => setKind(id)}><Pencil aria-hidden size={16} />{k.button}</Button>}>
            <div className="bo-settings-section">
              <p className="bo-note bo-settings-help">{k.help}</p>
              <div className="bo-settings-pills">{k.start.map(s => <Badge key={s.id}>{s.name}</Badge>)}</div>
            </div>
          </Card>
        );
      })}
    </div>
  );
}

function PolicyEditor({id, name, text}: {id: string; name: string; text: string}) {
  const [open, setOpen] = useState(false);
  const [value, setValue] = useState(text);
  const [bold, setBold] = useState(false);
  const [italic, setItalic] = useState(false);
  const [list, setList] = useState(false);
  const [dirty, setDirty] = useState(false);
  const [saved, setSaved] = useState(false);
  return (
    <div className="bo-settings-policy" id={`policy-${id}`}>
      <div className="bo-settings-row">
        <span className="bo-settings-row-text">{name}</span>
        <Button variant="secondary" size={32} aria-expanded={open} onPress={() => setOpen(o => !o)} aria-label={`Edit ${name}`}>
          <Pencil aria-hidden size={16} />{open ? 'Close' : 'Edit'}
        </Button>
      </div>
      {open && <div className="bo-settings-section">
        <RichTextEditor aria-label={name} placeholder={`The ${name.toLowerCase()} residents read`} value={value}
          onChange={v => { setValue(v); setDirty(true); setSaved(false); }}
          bold={bold} onBoldChange={setBold} italic={italic} onItalicChange={setItalic} list={list} onListChange={setList} />
        <div className="bo-settings-actions">
          <Button variant="primary" aria-label={`Save ${name}`} isDisabled={!dirty}
            onPress={() => { setDirty(false); setSaved(true); }}>Save</Button>
          <span role="status" className="bo-note">{saved ? `${name} saved` : ''}</span>
        </div>
      </div>}
    </div>
  );
}

export function PoliciesTab() {
  return (
    <div className="bo-settings-stack">
      <Card title="Platform policies" layout="stacked">
        <div className="bo-settings-section">
          <p className="bo-note bo-settings-help">Edit your platform's terms and conditions and privacy policy. Other pages, including the About and FAQ pages, are edited in Pages & menu.</p>
          <ul className="bo-settings-list" aria-label="Platform policies">
            {POLICIES.map((p, i) => <li key={p.id}>{i > 0 && <Divider />}<PolicyEditor {...p} /></li>)}
          </ul>
        </div>
      </Card>
    </div>
  );
}
