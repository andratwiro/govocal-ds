import {useState} from 'react';
import {useNavigate} from 'react-router';
import {Clock, Mail, MessageSquare, Pencil, Plus, Send, User} from 'lucide-react';
import {Tabs, TabList, Tab, TabPanel, TabPanels} from '../../../src/components/Tabs';
import {DataTable, DataTableHeader, DataTableColumn, DataTableBody, DataTableRow, DataTableCell, DataTableStack,
  DataTableOptions} from '../../../src/components/gv/DataTable';
import {MenuItem} from '../../../src/components/Menu';
import {Button} from '../../../src/components/Button';
import {Switch} from '../../../src/components/Switch';
import {TextField} from '../../../src/components/TextField';
import {Select, SelectItem} from '../../../src/components/Select';
import {Label} from '../../../src/components/Form';
import {Card} from '../../../src/components/gv/Card';
import {StatusBadge} from '../../../src/components/gv/StatusBadge';
import {Badge} from '../../../src/components/gv/Badge';
import {ListRow} from '../../../src/components/gv/ListRow';
import {RichTextEditor} from '../../../src/components/gv/RichTextEditor';
import {IconButton} from '../../../src/components/gv/IconButton';
import {StatTile} from '../../../src/components/gv/StatTile';
import {Banner} from '../../../src/components/gv/Banner';
import {Divider} from '../../../src/components/gv/Divider';
import {ToastRegion, queue} from '../../../src/components/Toast';
import {Modal} from '../../../src/components/gv/Modal';
import {AUTOMATED, GROUP_SIZES, GROUPS, SENDER, SMS, SMS_BALANCE, type AutomatedEmail, type CustomEmail} from '../data-messaging';
import {Gap, GapLegend} from '../Gap';
import {Page} from './Page';
import {emailStore} from './MessagingPages';
import {SectionHeading} from '../SectionHeading';

const n = (v: number) => v.toLocaleString('en');
const pct = (v?: number) => (v == null ? '—' : `${v}%`);
const toast = (title: string, description?: string) => queue.add({title, description}, {timeout: 5000});

/** The custom emails as state, written through to the shared store (so the composer's route sees them). */
function useEmails() {
  const [emails, set] = useState(emailStore.emails);
  const setEmails = (f: (e: CustomEmail[]) => CustomEmail[]) => set(e => (emailStore.emails = f(e)));
  return [emails, setEmails] as const;
}

// ── Custom emails ──────────────────────────────────────────────────────────

type RowAction = 'stats' | 'edit' | 'copy' | 'delete';

function CustomEmailTable({emails, onAction}: {emails: CustomEmail[]; onAction: (e: CustomEmail, a: RowAction) => void}) {
  return (
    <DataTable aria-label="Custom emails">
      <DataTableHeader>
        <DataTableColumn isRowHeader>Subject</DataTableColumn>
        <DataTableColumn>Status</DataTableColumn><DataTableColumn>Date</DataTableColumn>
        <DataTableColumn align="number">Opened</DataTableColumn><DataTableColumn align="number">Clicked</DataTableColumn>
        <DataTableColumn align="options" hideLabel>Actions</DataTableColumn>
      </DataTableHeader>
      <DataTableBody>{emails.map(e => (
        // A sent email opens its statistics; a draft opens from its menu.
        <DataTableRow key={e.id} id={e.id} textValue={e.subject} href={e.status === 'Sent' ? `#/messaging/emails/custom/${e.id}` : undefined}>
          <DataTableCell>
            <DataTableStack strong sub={<>To: {e.to}{e.project && <> · Project: {e.project}</>}</>}>{e.subject}</DataTableStack>
          </DataTableCell>
          <DataTableCell><StatusBadge state={e.status === 'Sent' ? 'live' : 'draft'}>{e.status}</StatusBadge></DataTableCell>
          <DataTableCell><span className="bo-messaging-nowrap">{e.date}</span></DataTableCell>
          <DataTableCell align="number">{pct(e.opened)}</DataTableCell>
          <DataTableCell align="number">{pct(e.clicked)}</DataTableCell>
          <DataTableCell align="options">
            <DataTableOptions aria-label={`Actions for ${e.subject}`} onAction={k => onAction(e, k as RowAction)}>
              {e.status === 'Sent'
                ? <><MenuItem id="stats">Statistics</MenuItem><MenuItem id="copy">Duplicate</MenuItem></>
                : <><MenuItem id="edit">Edit</MenuItem><MenuItem id="copy">Duplicate</MenuItem><MenuItem id="delete">Delete</MenuItem></>}
            </DataTableOptions>
          </DataTableCell>
        </DataTableRow>))}
      </DataTableBody>
    </DataTable>
  );
}

/** The draft being written: sender and recipients, then subject and message (the real admin's campaign form). */
function DraftComposer({email, onSave, onSend}: {
  email: CustomEmail; onSave: (patch: Partial<CustomEmail>) => void; onSend: (patch: Partial<CustomEmail>) => void;
}) {
  const [to, setTo] = useState(email.to);
  const [subject, setSubject] = useState(email.subject);
  const [body, setBody] = useState(email.body);
  const [bold, setBold] = useState(false);
  const [italic, setItalic] = useState(false);
  const [list, setList] = useState(false);
  const label = `Draft: ${email.subject}`;
  return (
    <section aria-label={label} className="bo-messaging-section">
      <Card tone="manage" title={label} summary={email.status === 'Scheduled' ? `Scheduled for ${email.date}` : email.date}>
        <div className="bo-messaging-form">
          <div className="bo-messaging-pair">
            <TextField label="From" defaultValue={SENDER.from} />
            <TextField label="Replies should go to" defaultValue={SENDER.replyTo} />
          </div>
          <Select label="To" selectedKey={to} onSelectionChange={k => setTo(String(k))}>
            {GROUPS.map(g => <SelectItem key={g} id={g}>{g}</SelectItem>)}
          </Select>
          <Divider />
          <TextField label="Subject" value={subject} onChange={setSubject} />
          <div className="bo-messaging-field">
            <Label aria-hidden>Email message</Label>
            <RichTextEditor aria-label="Email message" placeholder="Write your message" value={body} onChange={setBody}
              bold={bold} onBoldChange={setBold} italic={italic} onItalicChange={setItalic} list={list} onListChange={setList} />
          </div>
          <div className="bo-messaging-buttons">
            <Button variant="quiet" size={32} onPress={() => onSave({to, subject: subject.trim() || 'Untitled email', body})}>Save as draft</Button>
            <span className="bo-push" />
            <Button variant="secondary" size={32} onPress={() => toast('Preview sent', `To ${SENDER.replyTo}`)}>
              <Mail aria-hidden size={16} />Send a preview</Button>
            <Button variant="primary" size={32} onPress={() => onSend({to, subject: subject.trim() || 'Untitled email', body})}>
              <Send aria-hidden size={16} />Send now</Button>
          </div>
        </div>
      </Card>
    </section>
  );
}

let copies = 0;

function CustomEmails() {
  const navigate = useNavigate();
  const [emails, setEmails] = useEmails();
  const [draftId, setDraftId] = useState(emails.find(e => e.status === 'Draft' && e.body)?.id);
  const [deleting, setDeleting] = useState<CustomEmail | null>(null);
  const draft = emails.find(e => e.id === draftId && e.status !== 'Sent');
  const update = (id: string, patch: Partial<CustomEmail>) => setEmails(list => list.map(e => (e.id === id ? {...e, ...patch} : e)));
  const onAction = (e: CustomEmail, a: RowAction) => {
    if (a === 'stats') navigate(`/messaging/emails/custom/${e.id}`);
    else if (a === 'edit') setDraftId(e.id);
    else if (a === 'delete') setDeleting(e);
    else {
      const copy: CustomEmail = {...e, id: `${e.id}-copy-${++copies}`, subject: `Copy of ${e.subject}`, status: 'Draft',
        date: 'Edited 29 Oct 2026', opened: undefined, clicked: undefined};
      setEmails(list => {
        const i = list.findIndex(x => x.id === e.id);
        return [...list.slice(0, i + 1), copy, ...list.slice(i + 1)];
      });
      toast('Email duplicated', `${copy.subject} is a draft.`);
    }
  };
  const save = (patch: Partial<CustomEmail>) => {
    if (!draft) return;
    update(draft.id, {...patch, date: 'Edited 29 Oct 2026'});
    toast('Draft saved', patch.subject);
  };
  const send = (patch: Partial<CustomEmail>) => {
    if (!draft) return;
    update(draft.id, {...patch, status: 'Sent', date: '29 Oct 2026, just now', opened: 0, clicked: 0});
    const to = patch.to ?? draft.to;
    toast('Email sent', `“${patch.subject}” is on its way to ${n(GROUP_SIZES[to] ?? 0)} recipients.`);
    setDraftId(undefined);
  };
  const remove = () => {
    if (!deleting) return;
    setEmails(list => list.filter(e => e.id !== deleting.id));
    toast('Draft deleted', deleting.subject);
    setDeleting(null);
  };
  return (
    <>
      <div className="bo-messaging-intro">
        <p className="bo-note">Send out custom emails and check statistics.</p>
        <Button variant="primary" size={32} onPress={() => navigate('/messaging/emails/custom/new')}><Plus aria-hidden size={16} />Create email</Button>
      </div>
      <div className="bo-messaging-stack">
        <CustomEmailTable emails={emails} onAction={onAction} />
        {draft
          ? <DraftComposer key={draft.id} email={draft} onSave={save} onSend={send} />
          : <p className="bo-note">Choose Edit on a draft to open it here.</p>}
      </div>
      <Modal title="Delete this draft?" isOpen={deleting !== null} onOpenChange={o => { if (!o) setDeleting(null); }}
        footer={<>
          <Button variant="secondary" slot="close">Cancel</Button>
          <Button variant="primary" onPress={remove}>Delete draft</Button>
        </>}>
        <p>{deleting?.subject} will be deleted. This cannot be undone.</p>
      </Modal>
    </>
  );
}

// ── Automated emails ───────────────────────────────────────────────────────

/** Who gets it and what sends it, on two lines with the product's person and clock icons (prototype). */
function WhoAndWhen({email}: {email: AutomatedEmail}) {
  return (
    <span className="bo-messaging-meta bo-note">
      <span className="bo-messaging-meta-item"><User aria-hidden size={12} />{email.who}</span>
      <span className="bo-messaging-meta-item"><Clock aria-hidden size={12} />{email.trigger}</span>
    </span>
  );
}

function AutomatedList({on, setOn, onEdit}: {on: Record<string, boolean>; setOn: (id: string, v: boolean) => void; onEdit: (id: string) => void}) {
  return (
    <div className="bo-messaging-stack">
      {AUTOMATED.map(g => {
        const all = g.types.flatMap(t => t.emails);
        const count = all.filter(e => on[e.id]).length;
        return (
          <Card key={g.role} tone="manage" title={g.role} summary={`${count} of ${all.length} on`}>
            <div className="bo-messaging-groups">
              {g.types.map(t => (
                <div key={t.type} className="bo-messaging-group">
                  <span><Badge>{t.type}</Badge></span>
                  <ul className="bo-messaging-rows" aria-label={`${g.role}: ${t.type}`}>
                    {t.emails.map(e => (
                      <li key={e.id} className="bo-messaging-row">
                        <Switch aria-label={e.name} isSelected={on[e.id]} onChange={v => setOn(e.id, v)}>
                          <span className="bo-messaging-name">
                            <span>{e.name}</span>
                            <WhoAndWhen email={e} />
                          </span>
                        </Switch>
                        <IconButton aria-label={`Edit ${e.name}`} isDisabled={!on[e.id]} onPress={() => onEdit(e.id)}>
                          <Pencil aria-hidden size={16} />
                        </IconButton>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </Card>
        );
      })}
    </div>
  );
}

/** One automated email: its fields on the left, the email itself on the right (the prototype's edit + stage). */
function AutomatedEditor({email}: {email: AutomatedEmail}) {
  const [subject, setSubject] = useState(email.subject);
  const [title, setTitle] = useState(email.title ?? '');
  const [intro, setIntro] = useState(email.intro);
  const [button, setButton] = useState(email.button ?? '');
  return (
    <section aria-label={email.name} className="bo-messaging-section">
      <Card tone="manage" title={email.name}>
        <div className="bo-messaging-form">
          <WhoAndWhen email={email} />
          <TextField label="Replies should go to" defaultValue={SENDER.replyTo} />
          <Divider />
          <TextField label="Subject" value={subject} onChange={setSubject} />
          {email.title != null && <TextField label="Title" value={title} onChange={setTitle} />}
          <div className="bo-messaging-field">
            <Label aria-hidden>Introduction</Label>
            <RichTextEditor aria-label="Introduction" placeholder="Write an introduction" value={intro} onChange={setIntro} />
          </div>
          {email.button != null && <TextField label="Button text" value={button} onChange={setButton} />}
          <Divider />
          <div className="bo-messaging-buttons">
            <span className="bo-note">Preview</span>
            <span className="bo-push" />
            <Button variant="secondary" size={32} onPress={() => toast('Test email sent', `“${subject}” to ${SENDER.replyTo}`)}>
              <Send aria-hidden size={16} />Send me a test email</Button>
          </div>
          <Gap name="Email preview">
            <dl className="bo-messaging-mailhead">
              <dt className="bo-note">To</dt><dd>{email.who}</dd>
              <dt className="bo-note">From</dt><dd>{SENDER.from}</dd>
              <dt className="bo-note">Reply-To</dt><dd>{SENDER.replyTo}</dd>
              <dt className="bo-note">Subject</dt><dd>{subject}</dd>
            </dl>
            <Divider />
            <div className="bo-messaging-mailbody">
              <strong>{title || subject}</strong>
              {intro && <p>{intro}</p>}
              {button && <span><Button variant="primary" size={32}>{button}</Button></span>}
            </div>
          </Gap>
        </div>
      </Card>
    </section>
  );
}

function AutomatedEmails() {
  const emails = AUTOMATED.flatMap(g => g.types.flatMap(t => t.emails));
  const [on, setOnMap] = useState<Record<string, boolean>>(() => Object.fromEntries(emails.map(e => [e.id, e.on])));
  const [editing, setEditing] = useState<string | null>('pub');
  const setOn = (id: string, v: boolean) => {
    setOnMap(m => ({...m, [id]: v}));
    if (!v && editing === id) setEditing(null);
  };
  const current = emails.find(e => e.id === editing);
  return (
    <>
      <div className="bo-messaging-intro">
        <p className="bo-note">Emails sent automatically when something happens on the platform. Turn one off, or edit its content.</p>
      </div>
      <GapLegend names={['Email preview']} />
      <div className="bo-messaging-split">
        <AutomatedList on={on} setOn={setOn} onEdit={setEditing} />
        {current
          ? <AutomatedEditor key={current.id} email={current} />
          : <p className="bo-note">Choose an email that is on to edit it.</p>}
      </div>
    </>
  );
}

// ── SMS ────────────────────────────────────────────────────────────────────

function Sms() {
  const navigate = useNavigate();
  const used = SMS_BALANCE.usedCampaigns + SMS_BALANCE.usedTests;
  return (
    <>
      <div className="bo-messaging-intro">
        <p className="bo-note">Send text messages to your participants.</p>
        <Button variant="primary" size={32} onPress={() => navigate('/messaging/texting/new')}><Plus aria-hidden size={16} />Create SMS</Button>
      </div>
      <div className="bo-messaging-stack">
        <div className="bo-messaging-kpis">
          <StatTile label="SMS credits remaining" value={n(SMS_BALANCE.purchased - used)} note={`of ${n(SMS_BALANCE.purchased)} credits purchased`} />
          <StatTile label="SMS campaigns" value={n(SMS_BALANCE.usedCampaigns)} type="tall" />
          <StatTile label="Test messages" value={n(SMS_BALANCE.usedTests)} type="tall" />
          <StatTile label="Total used" value={n(used)} type="tall" />
        </div>
        <Banner>A message too long for one SMS is sent in several parts, and each part costs a credit for every recipient.</Banner>
        <Card tone="manage" title="Campaigns" summary={`${SMS.length} messages`}>
          <ul className="bo-messaging-list" aria-label="SMS campaigns">
            {SMS.map(s => (
              <li key={s.id}>
                <ListRow title={`${s.label}: ${s.body}`}
                  status={s.status === 'Sent' ? `Sent ${s.date} · ${n(s.delivered!)} delivered` : `Draft · ${s.date.replace('Edited ', '')}`} />
              </li>
            ))}
          </ul>
        </Card>
      </div>
    </>
  );
}

const CHANNELS = [
  {id: 'custom', label: 'Custom emails', icon: Mail, body: <CustomEmails />},
  {id: 'automated', label: 'Automated emails', icon: Clock, body: <AutomatedEmails />},
  {id: 'sms', label: 'SMS', icon: MessageSquare, body: <Sms />}
];

export function Messaging() {
  return (
    <Page title="Messaging">
      <Tabs defaultSelectedKey="custom">
        <TabList aria-label="Messaging channels">
          {CHANNELS.map(({id, label, icon: Icon}) => (
            <Tab key={id} id={id}><span className="bo-messaging-tab"><Icon aria-hidden size={16} />{label}</span></Tab>
          ))}
        </TabList>
        <TabPanels>
          {CHANNELS.map(c => <TabPanel key={c.id} id={c.id}><SectionHeading>{c.label}</SectionHeading>{c.body}</TabPanel>)}
        </TabPanels>
      </Tabs>
      <ToastRegion />
    </Page>
  );
}
