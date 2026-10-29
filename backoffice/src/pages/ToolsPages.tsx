import {useState} from 'react';
import {Pencil, Plus, Trash2} from 'lucide-react';
import {Button} from '../../../src/components/Button';
import {TextField, TextArea} from '../../../src/components/TextField';
import {NumberField} from '../../../src/components/NumberField';
import {Switch} from '../../../src/components/Switch';
import {Select, SelectItem} from '../../../src/components/Select';
import {CheckboxGroup} from '../../../src/components/CheckboxGroup';
import {Table, TableHeader, Column, TableBody, Row, Cell} from '../../../src/components/Table';
import {Card} from '../../../src/components/gv/Card';
import {Checkbox} from '../../../src/components/gv/Checkbox';
import {IconButton} from '../../../src/components/gv/IconButton';
import {Modal} from '../../../src/components/gv/Modal';
import {Badge} from '../../../src/components/gv/Badge';
import {StatusBadge} from '../../../src/components/gv/StatusBadge';
import {HelpPopover} from '../../../src/components/gv/HelpPopover';
import {API_TOKENS, MCP_CLIENTS, POWER_BI_TEMPLATES, WEBHOOK_EVENTS, WEBHOOK_PROJECTS, WEBHOOKS,
  type ApiToken, type WebhookItem} from '../data-tools';
import {Gap} from '../Gap';
import {Page} from './Page';

// The tools' own pages, one route each under /tools, as in the real admin. Shallow: the list and its first action.
const TOOLS_CRUMB = [{key: 'tools', label: 'Tools', href: '#/tools'}];

/** "For more information, see our API documentation": the docs live outside the back office, so a popover says what they hold. */
function DocsNote({lead, docs, about}: {lead: string; docs: string; about: string}) {
  return (
    <span className="bo-tools-docs">
      {lead} For more information, see the
      <HelpPopover title={docs} triggerText={docs}><p>{about}</p></HelpPopover>
    </span>
  );
}

export function PublicApiTokens() {
  const [tokens, setTokens] = useState<ApiToken[]>(API_TOKENS);
  const [open, setOpen] = useState(false);
  const [name, setName] = useState('');
  const [created, setCreated] = useState<ApiToken | null>(null);
  const [copied, setCopied] = useState(false);
  const close = () => {
    if (created) setTokens(t => [...t, created]);
    setOpen(false); setName(''); setCreated(null); setCopied(false);
  };
  const create = () => setCreated({id: `t${tokens.length + 1}-${name}`, name: name.trim(), created: '29 Oct 2026', lastUsed: 'Never'});
  return (
    <Page title="Public API tokens" crumbs={TOOLS_CRUMB}
      description={<DocsNote lead="Manage your API tokens for the public API." docs="API documentation"
        about="The API documentation lists every endpoint, how to sign a request with a token, and the rate limits." />}
      actions={<Button variant="primary" size={32} onPress={() => setOpen(true)}><Plus aria-hidden size={16} />Create new token</Button>}>
      <Table aria-label="Public API tokens" className="react-aria-Table bo-tools-table">
        <TableHeader>
          <Column isRowHeader>Name</Column><Column>Created</Column><Column>Last used</Column>
          <Column><span className="bo-tools-sr">Actions</span></Column>
        </TableHeader>
        <TableBody renderEmptyState={() => <p className="bo-note">You do not have any tokens yet.</p>}>
          {tokens.map(t => (
            <Row key={t.id} id={t.id}>
              <Cell>{t.name}</Cell><Cell>{t.created}</Cell><Cell>{t.lastUsed}</Cell>
              <Cell>
                <IconButton aria-label={`Delete token: ${t.name}`} onPress={() => setTokens(ts => ts.filter(x => x.id !== t.id))}>
                  <Trash2 aria-hidden size={16} />
                </IconButton>
              </Cell>
            </Row>
          ))}
        </TableBody>
      </Table>
      <Modal isOpen={open} onOpenChange={o => { if (!o) close(); }}
        title={created ? 'Your token has been created' : 'Create a new token'}
        footer={created
          ? <Button variant="secondary" onPress={close}>Close</Button>
          : <>
            <Button variant="secondary" onPress={close}>Cancel</Button>
            <Button variant="primary" isDisabled={!name.trim()} onPress={create}>Create token</Button>
          </>}>
        {created
          ? <div className="bo-tools-form">
            <p>Your token has been created. Please copy the secret below and store it safely.</p>
            <TextField label="Secret" isReadOnly value={`gv_${created.name.length}a7f3c9e1b2d48f6a0`} />
            <p><strong>Important!</strong> You can only copy this secret once. If you close this window you will not be able to see it again.</p>
            <div className="bo-tools-row">
              <Button variant="secondary" size={32} onPress={() => setCopied(true)}>Copy secret</Button>
              <span role="status" className="bo-note">{copied ? 'Copied!' : ''}</span>
            </div>
          </div>
          : <div className="bo-tools-form">
            <p>Create a new token to use with the public API.</p>
            <TextField label="Name" placeholder="Give your token a name" value={name} onChange={setName} />
          </div>}
      </Modal>
    </Page>
  );
}

type Draft = Omit<WebhookItem, 'id'>;
const EMPTY_HOOK: Draft = {name: '', url: '', events: [], project: 'All projects', enabled: true};

function WebhookModal({draft, isNew, onClose, onSave}: {draft: Draft; isNew: boolean; onClose: () => void; onSave: (d: Draft) => void}) {
  const [d, setD] = useState(draft);
  const set = (patch: Partial<Draft>) => setD(x => ({...x, ...patch}));
  const valid = d.name.trim() && /^https?:\/\/\S+$/.test(d.url) && d.events.length > 0;
  const label = isNew ? 'Create webhook' : 'Update webhook';
  return (
    <Modal isOpen onOpenChange={o => { if (!o) onClose(); }} size="wide"
      title={isNew ? 'Create a new webhook' : 'Edit webhook'}
      footer={<>
        <Button variant="secondary" onPress={onClose}>Cancel</Button>
        <Button variant="primary" isDisabled={!valid} onPress={() => onSave(d)}>{label}</Button>
      </>}>
      <div className="bo-tools-form">
        <p>{isNew ? 'Create a webhook to receive real-time notifications when events occur on your platform.' : 'Update the configuration of this webhook.'}</p>
        <TextField label="Name" placeholder="Give your webhook a name" value={d.name} onChange={v => set({name: v})} />
        <TextField label="URL" type="url" placeholder="https://your-domain.example/webhook" value={d.url} onChange={v => set({url: v})} />
        <CheckboxGroup label="Events" description="Select events to subscribe to" value={d.events} onChange={v => set({events: v})}>
          <div className="bo-tools-events">{WEBHOOK_EVENTS.map(e => <Checkbox key={e} value={e}>{e}</Checkbox>)}</div>
        </CheckboxGroup>
        <Select label="Project" value={d.project} onChange={v => set({project: String(v)})}>
          {WEBHOOK_PROJECTS.map(p => <SelectItem key={p} id={p}>{p}</SelectItem>)}
        </Select>
        <Switch isSelected={d.enabled} onChange={v => set({enabled: v})}>Enabled</Switch>
      </div>
    </Modal>
  );
}

export function Webhooks() {
  const [hooks, setHooks] = useState<WebhookItem[]>(WEBHOOKS);
  const [editing, setEditing] = useState<WebhookItem | 'new' | null>(null);
  const save = (d: Draft) => {
    if (editing === 'new') setHooks(h => [...h, {...d, id: `w${h.length + 1}-${d.name}`}]);
    else if (editing) setHooks(h => h.map(x => x.id === editing.id ? {...d, id: x.id} : x));
    setEditing(null);
  };
  return (
    <Page title="Webhooks" crumbs={TOOLS_CRUMB}
      description={<DocsNote lead="Configure webhooks to receive real-time notifications when events occur on your platform."
        docs="webhook documentation" about="The webhook documentation shows the payload of each event and how to check a request's signature with the secret token." />}
      actions={<Button variant="primary" size={32} onPress={() => setEditing('new')}><Plus aria-hidden size={16} />Create webhook</Button>}>
      <div className="bo-tools-scroll">
        <Table aria-label="Webhooks" className="react-aria-Table bo-tools-table">
          <TableHeader>
            <Column isRowHeader>Name</Column><Column>URL</Column><Column>Events</Column><Column>Project</Column>
            <Column>Enabled</Column><Column><span className="bo-tools-sr">Actions</span></Column>
          </TableHeader>
          <TableBody renderEmptyState={() => <p className="bo-note">You do not have any webhooks yet.</p>}>
            {hooks.map(h => (
              <Row key={h.id} id={h.id}>
                <Cell>{h.name}</Cell>
                <Cell>{h.url}</Cell>
                <Cell><span className="bo-tools-pills">{h.events.map(e => <Badge key={e}>{e}</Badge>)}</span></Cell>
                <Cell>{h.project}</Cell>
                <Cell><StatusBadge state={h.enabled ? 'live' : 'draft'}>{h.enabled ? 'Enabled' : 'Off'}</StatusBadge></Cell>
                <Cell>
                  <span className="bo-tools-row">
                    <IconButton aria-label={`Edit webhook: ${h.name}`} onPress={() => setEditing(h)}><Pencil aria-hidden size={16} /></IconButton>
                    <IconButton aria-label={`Delete webhook: ${h.name}`} onPress={() => setHooks(hs => hs.filter(x => x.id !== h.id))}>
                      <Trash2 aria-hidden size={16} />
                    </IconButton>
                  </span>
                </Cell>
              </Row>
            ))}
          </TableBody>
        </Table>
      </div>
      {editing && <WebhookModal key={editing === 'new' ? 'new' : editing.id} isNew={editing === 'new'}
        draft={editing === 'new' ? EMPTY_HOOK : editing} onClose={() => setEditing(null)} onSave={save} />}
    </Page>
  );
}

export function EsriIntegration() {
  const [key, setKey] = useState('');
  const [saved, setSaved] = useState(false);
  return (
    <Page title="Esri Maps" crumbs={TOOLS_CRUMB}
      description="Add your Esri API key to allow importing your map layers from ArcGIS Online in the map tabs in projects.">
      <Card title="Esri API key" layout="stacked">
        <div className="bo-tools-form">
          <TextField label="Esri API key" placeholder="Paste API key here" value={key} onChange={v => { setKey(v); setSaved(false); }} />
          <div className="bo-tools-row">
            <Button variant="primary" isDisabled={!key.trim()} onPress={() => setSaved(true)}>Save key</Button>
            <span role="status" className="bo-note">{saved ? 'API key saved' : ''}</span>
          </div>
        </div>
      </Card>
    </Page>
  );
}

export function PowerBi() {
  const [ready, setReady] = useState('');
  return (
    <Page title="Power BI templates" crumbs={TOOLS_CRUMB}
      description="Note: to use either of these Power BI templates, first create a set of credentials for the public API, under Tools.">
      <div className="bo-tools-cards">
        {POWER_BI_TEMPLATES.map(t => (
          <Card key={t.id} title={t.title} layout="stacked">
            <div className="bo-tools-form">
              <p className="bo-tools-text">{t.text}</p>
              <div className="bo-tools-row">
                <Button variant="secondary" size={32} onPress={() => setReady(t.id)}>{t.button}</Button>
                <span role="status" className="bo-note">{ready === t.id ? `${t.title} ready: ${t.file}` : ''}</span>
              </div>
            </div>
          </Card>
        ))}
      </div>
    </Page>
  );
}

export function McpAuthorizations() {
  const [clients, setClients] = useState(MCP_CLIENTS);
  const [revoking, setRevoking] = useState<string | null>(null);
  const target = clients.find(c => c.id === revoking);
  return (
    <Page title="MCP authorizations" crumbs={TOOLS_CRUMB}
      description="View and manage client authorizations for your MCP (Model Context Protocol) integrations.">
      <Table aria-label="MCP authorizations" className="react-aria-Table bo-tools-table">
        <TableHeader>
          <Column isRowHeader>Client name</Column><Column>Client ID</Column><Column><span className="bo-tools-sr">Actions</span></Column>
        </TableHeader>
        <TableBody renderEmptyState={() => <p className="bo-note">You have no MCP authorizations yet.</p>}>
          {clients.map(c => (
            <Row key={c.id} id={c.id}>
              <Cell>{c.name}</Cell><Cell>{c.clientId}</Cell>
              <Cell><Button variant="secondary" size={32} aria-label={`Revoke access: ${c.name}`} onPress={() => setRevoking(c.id)}>Revoke access</Button></Cell>
            </Row>
          ))}
        </TableBody>
      </Table>
      <Modal isOpen={!!target} onOpenChange={o => { if (!o) setRevoking(null); }} title="Revoke access"
        footer={<>
          <Button variant="secondary" onPress={() => setRevoking(null)}>Cancel</Button>
          <Button variant="primary" onPress={() => { setClients(cs => cs.filter(c => c.id !== revoking)); setRevoking(null); }}>Revoke access</Button>
        </>}>
        <p>Revoke the access of {target?.name}? It will need to be re-authorized before it can connect again.</p>
      </Modal>
    </Page>
  );
}

export function Widget() {
  const [count, setCount] = useState(3);
  const [header, setHeader] = useState(true);
  const code = `<iframe src="https://platform.example/widgets/projects?limit=${count}&header=${header}" title="Projects"></iframe>`;
  return (
    <Page title="Widget" crumbs={TOOLS_CRUMB}
      description="Create a widget, customize it and add it to your own website to attract people to this platform.">
      <div className="bo-tools-split">
        <Card title="Settings" layout="stacked">
          <div className="bo-tools-form">
            <NumberField label="Number of projects" minValue={1} maxValue={12} value={count} onChange={setCount} />
            <Switch isSelected={header} onChange={setHeader}>Show the header</Switch>
            <TextArea label="Embed code" isReadOnly value={code} description="Paste this into the website that shows the widget." />
          </div>
        </Card>
        <Gap name="Widget preview">
          <p className="bo-note">The widget as it shows on another website: {count} project cards{header ? ', under a header' : ''}.</p>
        </Gap>
      </div>
    </Page>
  );
}
