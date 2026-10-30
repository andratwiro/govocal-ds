import {useMemo, useState} from 'react';
import {useNavigate} from 'react-router';
import {BarChart3, CircleCheck, Clock, Copy, Mail, MessageSquare, Pencil, Plus, Send, Trash2} from 'lucide-react';
import {AlertDialog, Banner, Button, DataTable, DataTableBody, DataTableCell, DataTableColumn, DataTableEmpty,
  DataTableHeader, DataTableOptions, DataTableRow, DataTableStack, Divider, EmptyState, FilterChips, type FilterFacet,
  FilterMenu, type FilterValue, MenuItem, NotificationEmail, NotificationRow, NotificationRowList, Pagination, Panel,
  RichTextEditor, SearchField, SectionLabel, Select, SelectItem, StatTile, StatusBadge, Tab, TableToolbar, TabList,
  TabPanel, TabPanels, Tabs, Text, TextField, toast} from 'govocal-ds';
import {Label} from 'govocal-ds/base';
import {AUTOMATED, GROUP_SIZES, GROUPS, SENDER, SMS, SMS_BALANCE, type AutomatedEmail, type CustomEmail} from '../data-messaging';
import {Gap, GapLegend} from '../Gap';
import {Page} from './Page';
import {emailStore, sentText, usePages} from './MessagingPages';
import {SectionHeading} from '../SectionHeading';

const n = (v: number) => v.toLocaleString('en');
const pct = (v?: number) => (v == null ? '—' : `${v}%`);
const emailsWord = (v: number) => `${n(v)} ${v === 1 ? 'email' : 'emails'}`;
const smsWord = (v: number) => `${n(v)} ${v === 1 ? 'message' : 'messages'}`;

/** The custom emails as state, written through to the shared store (so the composer's route sees them). */
function useEmails() {
  const [emails, set] = useState(emailStore.emails);
  const setEmails = (f: (e: CustomEmail[]) => CustomEmail[]) => set(e => (emailStore.emails = f(e)));
  return [emails, setEmails] as const;
}

// ── Custom emails ──────────────────────────────────────────────────────────

type RowAction = 'stats' | 'edit' | 'copy' | 'delete';

// Every admin table pages (docs/DECISIONS.md).
const PAGE_SIZE = 10;
const STATUSES: CustomEmail['status'][] = ['Sent', 'Scheduled', 'Draft'];

const emailFacets = (emails: CustomEmail[]): FilterFacet[] => [
  {id: 'status', label: 'Status', icon: <CircleCheck aria-hidden size={16} />,
    items: STATUSES.map(s => ({id: s, label: s, count: emails.filter(e => e.status === s).length}))},
  {id: 'to', label: 'Recipients', icon: <Mail aria-hidden size={16} />,
    items: GROUPS.map(g => ({id: g, label: g, count: emails.filter(e => e.to === g).length}))}
];

/**
 * The list's Panel (Panel's "With a toolbar" story): Create email at the head's end; the count, the Filter menu and
 * the search in the toolbar row, the chips under it; the table flush; its pages in the foot.
 */
function CustomEmailTable({emails, onAction, onCreate}: {
  emails: CustomEmail[]; onAction: (e: CustomEmail, a: RowAction) => void; onCreate: () => void;
}) {
  const [query, setQuery] = useState('');
  const [filters, setFilters] = useState<FilterValue>({});
  const facets = useMemo(() => emailFacets(emails), [emails]);
  const q = query.trim().toLowerCase();
  const rows = emails.filter(e => (!q || e.subject.toLowerCase().includes(q))
    && (!filters.status?.length || filters.status.includes(e.status))
    && (!filters.to?.length || filters.to.includes(e.to)));
  const {current, pageCount, setPage, shown} = usePages(rows, PAGE_SIZE);
  // A new search or filter starts again from the first page.
  const fresh = <T,>(set: (v: T) => void) => (v: T) => { set(v); setPage(1); };
  const create = <Button variant="primary" size={32} onPress={onCreate}><Plus aria-hidden size={16} />Create email</Button>;
  if (emails.length === 0) {
    // Nothing sent or drafted yet: the real admin's first-email screen.
    return (
      <Panel title="Custom emails" headingLevel={3} description="Send out custom emails and check statistics.">
        <EmptyState icon={<Mail aria-hidden size={24} />} title="Send your first email" headingLevel={4}
          description="Easily connect with your participants by sending them emails. Choose who to contact and track your engagement."
          actions={create} />
      </Panel>
    );
  }
  return (
    <Panel title="Custom emails" headingLevel={3} description="Send out custom emails and check statistics." isFlush
      actions={create}
      toolbar={<>
        <TableToolbar aria-label="Email tools" headingLevel={4} heading={emailsWord(rows.length)}>
          <FilterMenu aria-label="Filter emails" facets={facets} value={filters} onChange={fresh(setFilters)} countLabel={emailsWord} />
          <SearchField aria-label="Search emails" placeholder="Search" value={query} onChange={fresh(setQuery)} />
        </TableToolbar>
        <FilterChips aria-label="Active filters" facets={facets} value={filters} onChange={fresh(setFilters)} />
      </>}
      footer={<Pagination page={current} pageCount={pageCount} onPageChange={setPage} aria-label="Email pages" />}>
    <div className="bo-messaging-scroll">
    <DataTable aria-label="Custom emails">
      <DataTableHeader>
        <DataTableColumn isRowHeader>Subject</DataTableColumn>
        <DataTableColumn>Status</DataTableColumn><DataTableColumn>Date</DataTableColumn>
        <DataTableColumn align="number">Opened</DataTableColumn><DataTableColumn align="number">Clicked</DataTableColumn>
        <DataTableColumn align="options" showLabel={false}>Actions</DataTableColumn>
      </DataTableHeader>
      <DataTableBody renderEmptyState={() => <DataTableEmpty>No emails match. Clear the search or the filters to see them all.</DataTableEmpty>}>
        {shown.map(e => (
        // A sent email opens its statistics; a draft opens from its menu.
        <DataTableRow key={e.id} id={e.id} textValue={e.subject} href={e.status === 'Sent' ? `#/messaging/emails/custom/${e.id}` : undefined}>
          <DataTableCell>
            <DataTableStack isStrong sub={<>To: {e.to}{e.project && <> · Project: {e.project}</>}</>}>{e.subject}</DataTableStack>
          </DataTableCell>
          <DataTableCell><StatusBadge status={e.status === 'Sent' ? 'live' : 'draft'}>{e.status}</StatusBadge></DataTableCell>
          <DataTableCell><span className="bo-messaging-nowrap">{e.date}</span></DataTableCell>
          <DataTableCell align="number">{pct(e.opened)}</DataTableCell>
          <DataTableCell align="number">{pct(e.clicked)}</DataTableCell>
          <DataTableCell align="options">
            <DataTableOptions aria-label={`Actions for ${e.subject}`} onAction={k => onAction(e, k as RowAction)}>
              {e.status === 'Sent'
                ? <>
                  <MenuItem id="stats" icon={<BarChart3 aria-hidden size={16} />}>Statistics</MenuItem>
                  <MenuItem id="copy" icon={<Copy aria-hidden size={16} />}>Duplicate</MenuItem>
                </>
                : <>
                  <MenuItem id="edit" icon={<Pencil aria-hidden size={16} />}>Edit</MenuItem>
                  <MenuItem id="copy" icon={<Copy aria-hidden size={16} />}>Duplicate</MenuItem>
                  <MenuItem id="delete" icon={<Trash2 aria-hidden size={16} />}>Delete</MenuItem>
                </>}
            </DataTableOptions>
          </DataTableCell>
        </DataTableRow>))}
      </DataTableBody>
    </DataTable>
    </div>
    </Panel>
  );
}

/** The draft being written: sender and recipients, then subject and message (the real admin's campaign form). */
function DraftComposer({email, onSave, onSend, onCancel}: {
  email: CustomEmail; onSave: (patch: Partial<CustomEmail>) => void; onSend: (patch: Partial<CustomEmail>) => void;
  onCancel: () => void;
}) {
  const [to, setTo] = useState(email.to);
  const [subject, setSubject] = useState(email.subject);
  const [body, setBody] = useState(email.body);
  const [bold, setBold] = useState(false);
  const [italic, setItalic] = useState(false);
  const [list, setList] = useState(false);
  const label = `Draft: ${email.subject}`;
  const patch = () => ({to, subject: subject.trim() || 'Untitled email', body});
  // The composer's Panel (Panel's "In a composer" story): the form in the body, Cancel and Send in the foot. The
  // Panel is the region, named by its title.
  return (
    <Panel title={label} headingLevel={3} description={email.status === 'Scheduled' ? `Scheduled for ${email.date}` : email.date}
      footer={<>
        <Button variant="secondary" size={32} onPress={onCancel}>Cancel</Button>
        <Button variant="quiet" size={32} onPress={() => onSave(patch())}>Save as draft</Button>
        <Button variant="secondary" size={32} onPress={() => toast('Preview sent', `To ${SENDER.replyTo}`)}>
          <Mail aria-hidden size={16} />Send a preview</Button>
        <Button variant="primary" size={32} onPress={() => onSend(patch())}><Send aria-hidden size={16} />Send now</Button>
      </>}>
        <div className="bo-messaging-fields">
          <div className="bo-messaging-pair">
            <TextField label="From" defaultValue={SENDER.from} />
            <TextField label="Replies should go to" defaultValue={SENDER.replyTo} />
          </div>
          <Select label="To" selectedKey={to} onSelectionChange={k => setTo(String(k))}
            description={`${n(GROUP_SIZES[to] ?? 0)} recipients`}>
            {GROUPS.map(g => <SelectItem key={g} id={g}>{g}</SelectItem>)}
          </Select>
          <Divider />
          <TextField label="Subject" value={subject} onChange={setSubject} />
          <div className="bo-messaging-field">
            <Label aria-hidden>Email message</Label>
            <RichTextEditor aria-label="Email message" placeholder="Write your message" value={body} onChange={setBody}
              isBold={bold} onBoldChange={setBold} isItalic={italic} onItalicChange={setItalic} isList={list} onListChange={setList} />
          </div>
        </div>
    </Panel>
  );
}

let copies = 0;

function CustomEmails() {
  const navigate = useNavigate();
  const [emails, setEmails] = useEmails();
  const [draftId, setDraftId] = useState(emails.find(e => e.status === 'Draft' && e.body)?.id);
  const [deleting, setDeleting] = useState<CustomEmail | null>(null);
  // The "sent" confirmation stays on the list (a success Banner) until dismissed: the composer's route leaves it here too.
  const [sent, setSent] = useState(emailStore.sent);
  const confirmSent = (text?: string) => setSent(emailStore.sent = text);
  const draft = emails.find(e => e.id === draftId && e.status !== 'Sent');
  const update = (id: string, patch: Partial<CustomEmail>) => setEmails(list => list.map(e => (e.id === id ? {...e, ...patch} : e)));
  const insertAt = (email: CustomEmail, at: number) => setEmails(list => [...list.slice(0, at), email, ...list.slice(at)]);
  const onAction = (e: CustomEmail, a: RowAction) => {
    if (a === 'stats') navigate(`/messaging/emails/custom/${e.id}`);
    else if (a === 'edit') setDraftId(e.id);
    else if (a === 'delete') setDeleting(e);
    else {
      const copy: CustomEmail = {...e, id: `${e.id}-copy-${++copies}`, subject: `Copy of ${e.subject}`, status: 'Draft',
        date: 'Edited 29 Oct 2026', opened: undefined, clicked: undefined};
      insertAt(copy, emails.findIndex(x => x.id === e.id) + 1);
      toast('Email duplicated', `${copy.subject} is a draft.`, {action: 'Undo', onAction: () => setEmails(list => list.filter(x => x.id !== copy.id))});
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
    confirmSent(sentText(patch.subject ?? draft.subject, GROUP_SIZES[to] ?? 0));
    setDraftId(undefined);
  };
  // Delete asks first, then offers Undo too (as Projects).
  const remove = () => {
    if (!deleting) return;
    const gone = deleting;
    const at = emails.findIndex(e => e.id === gone.id);
    setEmails(list => list.filter(e => e.id !== gone.id));
    toast('Draft deleted', gone.subject, {action: 'Undo', onAction: () => insertAt(gone, at)});
    setDeleting(null);
  };
  return (
    <>
      <div className="bo-messaging-stack bo-messaging-lists">
        {sent && <Banner tone="success" onDismiss={() => confirmSent(undefined)}>{sent}</Banner>}
        <CustomEmailTable emails={emails} onAction={onAction} onCreate={() => navigate('/messaging/emails/custom/new')} />
        {draft
          ? <DraftComposer key={draft.id} email={draft} onSave={save} onSend={send} onCancel={() => setDraftId(undefined)} />
          : emails.some(e => e.status !== 'Sent') && (
            <EmptyState layout="panel" isFramed headingLevel="none" icon={<Pencil aria-hidden size={24} />}
              title="No draft open" description="Choose Edit on a draft to open it here." />
          )}
      </div>
      <AlertDialog tone="danger" title="Delete this draft?" confirmLabel="Delete draft" isOpen={deleting !== null}
        onOpenChange={o => { if (!o) setDeleting(null); }} onConfirm={remove}>
        <p>{deleting?.subject} will be deleted.</p>
      </AlertDialog>
    </>
  );
}

// ── Automated emails ───────────────────────────────────────────────────────

const ALL_AUTOMATED = AUTOMATED.flatMap(g => g.types.flatMap(t => t.emails));

/**
 * One Panel per recipient group, its emails as the Build tab's Notification rows under a Section label per kind
 * (Notification row's "In a card" story): a switch, the name with who gets it and what sends it, a way to its page.
 */
function AutomatedList({on, setOn, onEdit}: {on: Record<string, boolean>; setOn: (e: AutomatedEmail, v: boolean) => void; onEdit: (id: string) => void}) {
  return (
    <div className="bo-messaging-stack">
      {AUTOMATED.map(g => {
        const all = g.types.flatMap(t => t.emails);
        const count = all.filter(e => on[e.id]).length;
        return (
          <Panel key={g.role} title={g.role} headingLevel={3} description={`${count} of ${all.length} emails on`}>
            <div className="bo-messaging-groups">
              {g.types.map(t => (
                <div key={t.type} className="bo-messaging-group">
                  <SectionLabel headingLevel={4}>{t.type}</SectionLabel>
                  <NotificationRowList aria-label={`${g.role}: ${t.type}`}>
                    {t.emails.map(e => (
                      <NotificationRow key={e.id} who={e.who} when={e.trigger} isSelected={on[e.id]}
                        onChange={v => setOn(e, v)} onOpen={() => onEdit(e.id)}>
                        {e.name}
                      </NotificationRow>
                    ))}
                  </NotificationRowList>
                </div>
              ))}
            </div>
          </Panel>
        );
      })}
    </div>
  );
}

/** The email as it lands: a stand-in until the system draws an email preview. */
function EmailPreview({email}: {email: AutomatedEmail}) {
  return (
    <Gap name="Email preview">
      <dl className="bo-messaging-mailhead">
        <Text elementType="dt" kind="small" color="meta">To</Text><dd>{email.who}</dd>
        <Text elementType="dt" kind="small" color="meta">From</Text><dd>{SENDER.from}</dd>
        <Text elementType="dt" kind="small" color="meta">Reply-To</Text><dd>{SENDER.replyTo}</dd>
        <Text elementType="dt" kind="small" color="meta">Subject</Text><dd>{email.subject}</dd>
      </dl>
      <Divider />
      <div className="bo-messaging-mailbody">
        <strong>{email.title || email.subject}</strong>
        {email.intro && <p>{email.intro}</p>}
        {email.button && <span><Button variant="primary" size={32}>{email.button}</Button></span>}
      </div>
    </Gap>
  );
}

/**
 * The Build tab's notification layout: the list, or an open email's page in its place (Notification row's "Email
 * open" story: ←, "Send this email", its fields); the email itself on the stage beside it, with the test send.
 */
function AutomatedEmails() {
  const [on, setOnMap] = useState<Record<string, boolean>>(() => Object.fromEntries(ALL_AUTOMATED.map(e => [e.id, e.on])));
  const [editing, setEditing] = useState<string | null>(null);
  const write = (id: string, v: boolean) => setOnMap(m => ({...m, [id]: v}));
  const setOn = (e: AutomatedEmail, v: boolean) => {
    write(e.id, v);
    toast(v ? 'Email on' : 'Email off', `${e.name} ${v ? 'goes out again' : 'is no longer sent'}.`, {action: 'Undo', onAction: () => write(e.id, !v)});
  };
  const current = ALL_AUTOMATED.find(e => e.id === editing);
  return (
    <>
      <div className="bo-messaging-intro">
        <Text elementType="p" kind="small" color="meta">Emails sent automatically when something happens on the platform. Turn one off, or open it to edit its content.</Text>
      </div>
      <GapLegend names={['Email preview']} />
      <div className="bo-messaging-split">
        {current
          ? (
            <NotificationEmail key={current.id} name={current.name} who={current.who} when={current.trigger}
                labels={{back: 'Back to automated emails'}} onBack={() => setEditing(null)}
                isSelected={on[current.id]} onChange={v => setOn(current, v)}
                replyTo={SENDER.replyTo} subject={current.subject} title={current.title} introduction={current.intro}
                buttonText={current.button} />
          )
          : <AutomatedList on={on} setOn={setOn} onEdit={setEditing} />}
        <Panel title="Preview" headingLevel={3}
          description={current ? `Sent to: ${current.who}` : undefined}
          actions={current && (
            <Button variant="secondary" size={32} onPress={() => toast('Test email sent', `“${current.subject}” to ${SENDER.replyTo}`)}>
              <Send aria-hidden size={16} />Send me a test email</Button>
          )}>
          {current
            ? <EmailPreview email={current} />
            : <EmptyState layout="panel" headingLevel="none" icon={<Mail aria-hidden size={24} />} title="No email open"
              description="Open an email that is on to edit it and see it here." />}
        </Panel>
      </div>
    </>
  );
}

// ── SMS ────────────────────────────────────────────────────────────────────

/** The credits as Stat tiles, then the campaigns in the list shape every admin table shares. */
function Sms() {
  const navigate = useNavigate();
  const used = SMS_BALANCE.usedCampaigns + SMS_BALANCE.usedTests;
  const {current, pageCount, setPage, shown} = usePages(SMS, PAGE_SIZE);
  return (
    <div className="bo-messaging-stack bo-messaging-lists">
      <div className="bo-messaging-kpis">
        <StatTile label="SMS credits remaining" value={n(SMS_BALANCE.purchased - used)} note={`of ${n(SMS_BALANCE.purchased)} credits purchased`} />
        <StatTile label="SMS campaigns" value={n(SMS_BALANCE.usedCampaigns)} layout="tall" />
        <StatTile label="Test messages" value={n(SMS_BALANCE.usedTests)} layout="tall" />
        <StatTile label="Total used" value={n(used)} layout="tall" />
      </div>
      <Banner>A message too long for one SMS is sent in several parts, and each part costs a credit for every recipient.</Banner>
      <Panel title="SMS campaigns" headingLevel={3} description="Send text messages to your participants." isFlush
        actions={<Button variant="primary" size={32} onPress={() => navigate('/messaging/texting/new')}><Plus aria-hidden size={16} />Create SMS</Button>}
        toolbar={<TableToolbar aria-label="SMS tools" headingLevel={4} heading={smsWord(SMS.length)} />}
        footer={<Pagination page={current} pageCount={pageCount} onPageChange={setPage} aria-label="SMS pages" />}>
        <div className="bo-messaging-scroll">
          <DataTable aria-label="SMS campaigns">
            <DataTableHeader>
              <DataTableColumn isRowHeader>Message</DataTableColumn>
              <DataTableColumn>Status</DataTableColumn><DataTableColumn>Date</DataTableColumn>
              <DataTableColumn align="number">Delivered</DataTableColumn><DataTableColumn align="number">Failed</DataTableColumn>
            </DataTableHeader>
            <DataTableBody>{shown.map(s => (
              <DataTableRow key={s.id} id={s.id} textValue={s.label}>
                <DataTableCell><DataTableStack isStrong sub={s.body}>{s.label}</DataTableStack></DataTableCell>
                <DataTableCell><StatusBadge status={s.status === 'Sent' ? 'live' : 'draft'}>{s.status}</StatusBadge></DataTableCell>
                <DataTableCell><span className="bo-messaging-nowrap">{s.date}</span></DataTableCell>
                <DataTableCell align="number">{s.delivered == null ? '—' : n(s.delivered)}</DataTableCell>
                <DataTableCell align="number">{s.failed == null ? '—' : n(s.failed)}</DataTableCell>
              </DataTableRow>))}
            </DataTableBody>
          </DataTable>
        </div>
      </Panel>
    </div>
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
          {/* Tab lays out its own leading icon (Tabs' "With icons" story). */}
          {CHANNELS.map(({id, label, icon: Icon}) => <Tab key={id} id={id}><Icon aria-hidden size={16} />{label}</Tab>)}
        </TabList>
        <TabPanels>
          {CHANNELS.map(c => <TabPanel key={c.id} id={c.id}><SectionHeading>{c.label}</SectionHeading>{c.body}</TabPanel>)}
        </TabPanels>
      </Tabs>
    </Page>
  );
}
