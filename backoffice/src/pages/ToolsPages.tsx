import {useState} from 'react';
import {useNavigate} from 'react-router';
import {Bot, Copy, Download, KeyRound, Pencil, Plus, Trash2, Webhook} from 'lucide-react';
import {Button} from '../../../src/components/Button';
import {TextField, TextArea} from '../../../src/components/TextField';
import {NumberField} from '../../../src/components/NumberField';
import {Switch} from '../../../src/components/Switch';
import {Select, SelectItem} from '../../../src/components/Select';
import {CheckboxGroup} from '../../../src/components/CheckboxGroup';
import {MenuItem} from '../../../src/components/Menu';
import {ToastRegion, queue} from '../../../src/components/Toast';
import {DataTable, DataTableHeader, DataTableColumn, DataTableBody, DataTableRow, DataTableCell, DataTableOptions,
  DataTableTags} from '../../../src/components/gv/DataTable';
import {Panel} from '../../../src/components/gv/Panel';
import {EmptyState} from '../../../src/components/gv/EmptyState';
import {Banner} from '../../../src/components/gv/Banner';
import {Checkbox} from '../../../src/components/gv/Checkbox';
import {IconButton} from '../../../src/components/gv/IconButton';
import {Modal} from '../../../src/components/gv/Modal';
import {AlertDialog} from '../../../src/components/gv/AlertDialog';
import {StatusBadge} from '../../../src/components/gv/StatusBadge';
import {HelpPopover} from '../../../src/components/gv/HelpPopover';
import {API_TOKENS, MCP_CLIENTS, POWER_BI_TEMPLATES, WEBHOOK_EVENTS, WEBHOOK_PROJECTS, WEBHOOKS,
  type ApiToken, type WebhookItem} from '../data-tools';
import {Gap} from '../Gap';
import {Page} from './Page';

// The tools' own pages, one route each under /tools, as in the real admin. Lists are a Panel over a Data table
// (Empty state when nothing is left), forms a Panel with Save in its foot, confirms an Alert dialog, feedback a Toast.
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
  const [deleting, setDeleting] = useState<ApiToken | null>(null);
  const close = () => {
    if (created) setTokens(t => [...t, created]);
    setOpen(false); setName(''); setCreated(null); setCopied(false);
  };
  const create = () => setCreated({id: `t${tokens.length + 1}-${name}`, name: name.trim(), created: '29 Oct 2026', lastUsed: 'Never'});
  const remove = (t: ApiToken) => {
    setTokens(ts => ts.filter(x => x.id !== t.id));
    setDeleting(null);
    queue.add({title: 'Token deleted', description: t.name}, {timeout: 5000});
  };
  const createButton = (variant: 'primary' | 'secondary') => (
    <Button variant={variant} size={32} onPress={() => setOpen(true)}><Plus aria-hidden size={16} />Create new token</Button>
  );
  return (
    <Page title="Public API tokens" crumbs={TOOLS_CRUMB}
      description={<DocsNote lead="Manage your API tokens for the public API." docs="API documentation"
        about="The API documentation lists every endpoint, how to sign a request with a token, and the rate limits." />}>
      <Panel title="Tokens" count={tokens.length} flush={tokens.length > 0} actions={createButton('primary')}
        description="Each token lets one custom integration read the platform's data. Delete a token to cut that integration off.">
        {tokens.length ? (
          <DataTable aria-label="Public API tokens">
            <DataTableHeader>
              <DataTableColumn isRowHeader>Name</DataTableColumn>
              <DataTableColumn>Created</DataTableColumn>
              <DataTableColumn>Last used</DataTableColumn>
              <DataTableColumn align="options" showLabel={false}>Actions</DataTableColumn>
            </DataTableHeader>
            <DataTableBody>
              {tokens.map(t => (
                <DataTableRow key={t.id} id={t.id}>
                  <DataTableCell>{t.name}</DataTableCell>
                  <DataTableCell isMuted>{t.created}</DataTableCell>
                  <DataTableCell isMuted>{t.lastUsed}</DataTableCell>
                  <DataTableCell align="options">
                    <IconButton aria-label={`Delete token: ${t.name}`} onPress={() => setDeleting(t)}>
                      <Trash2 aria-hidden size={16} />
                    </IconButton>
                  </DataTableCell>
                </DataTableRow>
              ))}
            </DataTableBody>
          </DataTable>
        ) : (
          <EmptyState size="panel" icon={<KeyRound size={24} />} title="You do not have any tokens yet"
            description="Create a token for each integration that reads the platform's data." action={createButton('secondary')} />
        )}
      </Panel>
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
            <Banner tone="warning" title="Important!">
              You can only copy this secret once. If you close this window you will not be able to see it again.
            </Banner>
            <div className="bo-tools-row">
              <Button variant="secondary" size={32} isDisabled={copied} onPress={() => setCopied(true)}>
                <Copy aria-hidden size={16} />{copied ? 'Copied!' : 'Copy secret'}
              </Button>
            </div>
          </div>
          : <div className="bo-tools-form">
            <p>Create a new token to use with the public API.</p>
            <TextField label="Name" placeholder="Give your token a name" value={name} onChange={setName} />
          </div>}
      </Modal>
      <AlertDialog tone="danger" isOpen={!!deleting} onOpenChange={o => { if (!o) setDeleting(null); }} title="Delete token?"
        confirmLabel="Delete token" onConfirm={() => { if (deleting) remove(deleting); }}>
        <p>Integrations that use {deleting?.name} stop working at once. This cannot be undone.</p>
      </AlertDialog>
      <ToastRegion />
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
  const [deleting, setDeleting] = useState<WebhookItem | null>(null);
  const save = (d: Draft) => {
    if (editing === 'new') {
      setHooks(h => [...h, {...d, id: `w${h.length + 1}-${d.name}`}]);
      queue.add({title: 'Webhook created', description: d.name}, {timeout: 5000});
    } else if (editing) {
      setHooks(h => h.map(x => x.id === editing.id ? {...d, id: x.id} : x));
      queue.add({title: 'Webhook updated', description: d.name}, {timeout: 5000});
    }
    setEditing(null);
  };
  const remove = (w: WebhookItem) => {
    setHooks(hs => hs.filter(x => x.id !== w.id));
    setDeleting(null);
    queue.add({title: 'Webhook deleted', description: w.name}, {timeout: 5000});
  };
  const createButton = (variant: 'primary' | 'secondary') => (
    <Button variant={variant} size={32} onPress={() => setEditing('new')}><Plus aria-hidden size={16} />Create webhook</Button>
  );
  return (
    <Page title="Webhooks" crumbs={TOOLS_CRUMB}
      description={<DocsNote lead="Configure webhooks to receive real-time notifications when events occur on your platform."
        docs="webhook documentation" about="The webhook documentation shows the payload of each event and how to check a request's signature with the secret token." />}>
      <Panel title="All webhooks" count={hooks.length} flush={hooks.length > 0} actions={createButton('primary')}
        description="Each webhook calls a URL of yours when one of its events happens.">
        {hooks.length ? (
          <div className="bo-tools-scroll">
            <DataTable aria-label="Webhooks">
              <DataTableHeader>
                <DataTableColumn isRowHeader>Name</DataTableColumn>
                <DataTableColumn>URL</DataTableColumn>
                <DataTableColumn>Events</DataTableColumn>
                <DataTableColumn>Project</DataTableColumn>
                <DataTableColumn>Enabled</DataTableColumn>
                <DataTableColumn align="options" showLabel={false}>Actions</DataTableColumn>
              </DataTableHeader>
              <DataTableBody>
                {hooks.map(h => (
                  <DataTableRow key={h.id} id={h.id}>
                    <DataTableCell>{h.name}</DataTableCell>
                    <DataTableCell isMuted>{h.url}</DataTableCell>
                    <DataTableCell><DataTableTags items={h.events} /></DataTableCell>
                    <DataTableCell>{h.project}</DataTableCell>
                    <DataTableCell><StatusBadge state={h.enabled ? 'live' : 'draft'}>{h.enabled ? 'Enabled' : 'Off'}</StatusBadge></DataTableCell>
                    <DataTableCell align="options">
                      <DataTableOptions aria-label={`Options for webhook: ${h.name}`}
                        onAction={k => k === 'edit' ? setEditing(h) : setDeleting(h)}>
                        <MenuItem id="edit" icon={<Pencil aria-hidden size={16} />}>Edit webhook</MenuItem>
                        <MenuItem id="delete" icon={<Trash2 aria-hidden size={16} />}>Delete webhook</MenuItem>
                      </DataTableOptions>
                    </DataTableCell>
                  </DataTableRow>
                ))}
              </DataTableBody>
            </DataTable>
          </div>
        ) : (
          <EmptyState size="panel" icon={<Webhook size={24} />} title="You do not have any webhooks yet"
            description="Create a webhook to tell another service when something happens here." action={createButton('secondary')} />
        )}
      </Panel>
      {editing && <WebhookModal key={editing === 'new' ? 'new' : editing.id} isNew={editing === 'new'}
        draft={editing === 'new' ? EMPTY_HOOK : editing} onClose={() => setEditing(null)} onSave={save} />}
      <AlertDialog tone="danger" isOpen={!!deleting} onOpenChange={o => { if (!o) setDeleting(null); }} title="Delete webhook?"
        confirmLabel="Delete webhook" onConfirm={() => { if (deleting) remove(deleting); }}>
        <p>{deleting?.name} stops receiving events. This cannot be undone.</p>
      </AlertDialog>
      <ToastRegion />
    </Page>
  );
}

export function EsriIntegration() {
  const [key, setKey] = useState('');
  const [connected, setConnected] = useState(false);
  const save = () => {
    setConnected(true);
    queue.add({title: 'API key saved', description: 'Maps in projects can now import layers from ArcGIS Online.'}, {timeout: 5000});
  };
  return (
    <Page title="Esri Maps" crumbs={TOOLS_CRUMB}
      description="Add your Esri API key to allow importing your map layers from ArcGIS Online in the map tabs in projects.">
      <Panel title="Esri API key" description="You find the key in your ArcGIS developer dashboard."
        actions={<StatusBadge state={connected ? 'live' : 'draft'}>{connected ? 'Connected' : 'Not connected'}</StatusBadge>}
        footer={<Button variant="primary" isDisabled={!key.trim()} onPress={save}>Save key</Button>}>
        <div className="bo-tools-form">
          <TextField label="Esri API key" placeholder="Paste API key here" value={key} onChange={setKey} />
        </div>
      </Panel>
      <ToastRegion />
    </Page>
  );
}

export function PowerBi() {
  const navigate = useNavigate();
  return (
    <Page title="Power BI templates" crumbs={TOOLS_CRUMB}
      description="Ready-made Power BI templates that read the platform's data through the public API.">
      <div className="bo-tools-stack">
        <Banner linkLabel="Public API tokens" onLinkPress={() => navigate('/tools/public-api-tokens')}>
          To use either of these Power BI templates, first create a set of credentials for the public API.
        </Banner>
        <div className="bo-tools-cards">
          {POWER_BI_TEMPLATES.map(t => (
            <Panel key={t.id} title={t.title}
              footer={(
                <Button variant="secondary" size={32}
                  onPress={() => queue.add({title: 'Download started', description: `${t.title}: ${t.file}`}, {timeout: 5000})}>
                  <Download aria-hidden size={16} />{t.button}
                </Button>
              )}>
              <p className="bo-tools-text">{t.text}</p>
            </Panel>
          ))}
        </div>
      </div>
      <ToastRegion />
    </Page>
  );
}

export function McpAuthorizations() {
  const [clients, setClients] = useState(MCP_CLIENTS);
  const [revoking, setRevoking] = useState<string | null>(null);
  const target = clients.find(c => c.id === revoking);
  const revoke = () => {
    if (target) queue.add({title: 'Access revoked', description: target.name}, {timeout: 5000});
    setClients(cs => cs.filter(c => c.id !== revoking));
    setRevoking(null);
  };
  return (
    <Page title="MCP authorizations" crumbs={TOOLS_CRUMB}
      description="View and manage client authorizations for your MCP (Model Context Protocol) integrations.">
      <Panel title="Authorized clients" count={clients.length} flush={clients.length > 0}
        description="AI agents that may act on the platform for you.">
        {clients.length ? (
          <DataTable aria-label="MCP authorizations">
            <DataTableHeader>
              <DataTableColumn isRowHeader>Client name</DataTableColumn>
              <DataTableColumn>Client ID</DataTableColumn>
              <DataTableColumn showLabel={false}>Actions</DataTableColumn>
            </DataTableHeader>
            <DataTableBody>
              {clients.map(c => (
                <DataTableRow key={c.id} id={c.id}>
                  <DataTableCell>{c.name}</DataTableCell>
                  <DataTableCell isMuted>{c.clientId}</DataTableCell>
                  <DataTableCell>
                    <Button variant="quiet" tone="danger" size={32} aria-label={`Revoke access: ${c.name}`}
                      onPress={() => setRevoking(c.id)}>Revoke access</Button>
                  </DataTableCell>
                </DataTableRow>
              ))}
            </DataTableBody>
          </DataTable>
        ) : (
          <EmptyState size="panel" icon={<Bot size={24} />} title="You have no MCP authorizations yet"
            description="An AI agent shows up here once you allow it to connect." />
        )}
      </Panel>
      <AlertDialog tone="danger" isOpen={!!target} onOpenChange={o => { if (!o) setRevoking(null); }} title="Revoke access?"
        confirmLabel="Revoke access" onConfirm={revoke}>
        <p>{target?.name} loses its access. It will need to be re-authorized before it can connect again.</p>
      </AlertDialog>
      <ToastRegion />
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
        <Panel title="Settings" description="What the widget shows."
          footer={(
            <Button variant="secondary" size={32} onPress={() => queue.add({title: 'Embed code copied'}, {timeout: 5000})}>
              <Copy aria-hidden size={16} />Copy embed code
            </Button>
          )}>
          <div className="bo-tools-form">
            <NumberField label="Number of projects" minValue={1} maxValue={12} value={count} onChange={setCount} />
            <Switch isSelected={header} onChange={setHeader}>Show the header</Switch>
            <TextArea label="Embed code" isReadOnly value={code} description="Paste this into the website that shows the widget." />
          </div>
        </Panel>
        <Panel title="Preview" description="The widget as it shows on another website.">
          <Gap name="Widget preview">
            <p className="bo-note">{count} project cards{header ? ', under a header' : ''}.</p>
          </Gap>
        </Panel>
      </div>
      <ToastRegion />
    </Page>
  );
}
