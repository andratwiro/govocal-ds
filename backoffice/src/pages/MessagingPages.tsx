import {useState} from 'react';
import {useNavigate, useParams} from 'react-router';
import {CircleCheck, Mail, Send, Smartphone, Users} from 'lucide-react';
import {AlertDialog, Badge, Banner, Button, ChatMessage, DataTable, DataTableBody, DataTableCell, DataTableColumn, DataTableEmpty,
  DataTableHeader, DataTablePerson, DataTableRow, Divider, FilterChips, type FilterFacet, FilterMenu, type FilterValue,
  type Multiloc, MultilingualRichTextEditor, Pagination, Panel, PhonePreview, Radio, RadioGroup, SearchField, Select,
  SelectItem, Stack, StatTile, TableToolbar, Text, TextArea, TextField, TileGrid, toast, useNumberFormatter} from 'govocal-ds';
import {NOW, TODAY, useDayTime} from '../dates';
import {LOCALES} from '../data-settings';
import {CUSTOM_EMAILS, GROUP_SIZES, GROUPS, RECIPIENTS, SENDER, type CustomEmail} from '../data-messaging';
import {Page} from './Page';
import {SectionHeading} from '../SectionHeading';

// Messaging's first clicks, each on its own route as in the real admin: a new email, a sent email's
// statistics, a new SMS.
const MESSAGING_CRUMB = [{key: 'messaging', label: 'Messaging', href: '#/messaging'}];

/**
 * The custom emails, with the ones sent here on top, and the last "sent" confirmation: they outlive a change of
 * route, until a reload.
 */
export const emailStore: {emails: CustomEmail[]; sent?: string} = {emails: [...CUSTOM_EMAILS]};

/** A list's page of rows; every admin table pages (docs/DECISIONS.md). */
export function usePages<T>(rows: T[], size: number) {
  const [page, setPage] = useState(1);
  const pageCount = Math.max(1, Math.ceil(rows.length / size));
  const current = Math.min(page, pageCount);
  return {current, pageCount, setPage, shown: rows.slice((current - 1) * size, current * size)};
}

/** The "sent" confirmation's text (the Banner's Success story). */
export const sentText = (subject: string, recipients: number, n: (v: number) => string) =>
  `Your email “${subject}” was sent to ${n(recipients)} recipients.`;

// ── The one email composer (the prototype's compose card: header, fields, footer of actions; Panel's "In a composer"
// story), at the real admin's two routes: a new email (emails/custom/new) and a draft (emails/custom/:id/edit) ──

// The platform's languages (Settings' Platform configuration): the message is written in each of them.
const LANGUAGES = LOCALES.map(l => l.id);
const ALL = GROUPS[0];
const firstText = (body: Multiloc) => (body[LANGUAGES[0]] ?? '').replace(/<[^>]*>/g, '').trim();

export function EmailComposer() {
  const {format: n} = useNumberFormatter();
  const navigate = useNavigate();
  const {emailId} = useParams();
  // Editing a draft or a scheduled email loads it; a sent one can't be edited, so it opens its statistics.
  const editing = emailId ? emailStore.emails.find(e => e.id === emailId) : undefined;
  const [to, setTo] = useState(editing?.to ?? ALL);
  const [subject, setSubject] = useState(editing?.subject ?? '');
  const [body, setBody] = useState<Multiloc>(editing?.body ?? {});
  const [bold, setBold] = useState(false);
  const [italic, setItalic] = useState(false);
  const [list, setList] = useState(false);
  // Errors show once Send now was pressed, and clear as each field is filled.
  const [tried, setTried] = useState(false);
  const [confirming, setConfirming] = useState(false);
  if (emailId && (!editing || editing.status === 'Sent')) {
    return (
      <Page title="Email not found" crumbs={MESSAGING_CRUMB}>
        <Text elementType="p" kind="small" color="meta">This email does not exist, or it was sent and can no longer be edited.</Text>
      </Page>
    );
  }
  const recipients = GROUP_SIZES[to] ?? 0;
  const errors = {
    subject: subject.trim() ? undefined : 'Add a subject line.',
    // The platform's first language is enough to send; the switcher marks the languages still empty.
    body: firstText(body) ? undefined : 'Write the message.',
    to: recipients > 0 ? undefined : 'Choose who gets the email.'
  };
  const isValid = !errors.subject && !errors.body && !errors.to;
  const save = (status: CustomEmail['status']) => {
    const email: CustomEmail = {id: editing?.id ?? `new-${emailStore.emails.length + 1}`, subject: subject.trim() || 'Untitled email',
      status, to, body, project: editing?.project,
      date: status === 'Sent' ? NOW : TODAY, ...(status === 'Sent' ? {opened: 0, clicked: 0} : {})};
    emailStore.emails = editing ? emailStore.emails.map(e => (e.id === editing.id ? email : e)) : [email, ...emailStore.emails];
    // Sent: the list shows a success Banner; a saved draft gets the toast.
    if (status === 'Sent') emailStore.sent = sentText(email.subject, recipients, n);
    else toast('Draft saved', email.subject);
    navigate('/messaging');
  };
  // Send now checks the email first, then asks, with the number of people it goes to.
  const send = () => { setTried(true); if (isValid) setConfirming(true); };
  const show = (error?: string) => (tried && error ? {isInvalid: true, errorMessage: error} : {});
  return (
    <Page title={editing ? 'Edit email' : 'New email'} crumbs={MESSAGING_CRUMB}>
      <SectionHeading>Message and recipients</SectionHeading>
      <Panel title="Write a message and choose who gets it" headingLevel={3}
        footer={<>
          <Button variant="secondary" size={32} onPress={() => navigate('/messaging')}>Cancel</Button>
          <Button variant="quiet" size={32} onPress={() => save('Draft')}>Save as draft</Button>
          <Button variant="secondary" size={32} onPress={() => toast('Preview sent', `To ${SENDER.replyTo}`)}>
            <Mail aria-hidden size={16} />Send a preview</Button>
          <Button variant="primary" size={32} onPress={send}><Send aria-hidden size={16} />Send now</Button>
        </>}>
        <Stack gap="16">
          <TileGrid minTileWidth={220}>
            <TextField label="From" defaultValue={SENDER.from} />
            <TextField label="Replies should go to" defaultValue={SENDER.replyTo} />
          </TileGrid>
          {/* Recipients, as the prototype: everyone by default, or one group; the chip says who and how many. */}
          <RadioGroup label="Recipients" value={to === ALL ? 'all' : 'group'} orientation="horizontal"
            onChange={v => setTo(v === 'all' ? ALL : GROUPS[1])}>
            <Radio value="all">Send to all participants</Radio>
            <Radio value="group">Send to a group</Radio>
          </RadioGroup>
          {to !== ALL && (
            <Select label="Group" value={to} onChange={k => setTo(String(k))} {...show(errors.to)}>
              {GROUPS.slice(1).map(g => <SelectItem key={g} id={g}>{g}</SelectItem>)}
            </Select>
          )}
          <span aria-live="polite">
            <Badge variant="value" icon={<Users aria-hidden size={14} />}>
              {to === ALL ? 'All participants' : to} · {n(recipients)} recipients
            </Badge>
          </span>
          <Divider />
          <TextField label="Subject" isRequired placeholder="Add a subject line" value={subject} onChange={setSubject}
            {...show(errors.subject)} />
          <MultilingualRichTextEditor label="Email message" locales={LANGUAGES} placeholder="Write your message"
            value={body} onChange={setBody} {...show(errors.body)}
            isBold={bold} onBoldChange={setBold} isItalic={italic} onItalicChange={setItalic} isList={list} onListChange={setList} />
        </Stack>
      </Panel>
      <AlertDialog title={`Send this email to ${n(recipients)} people?`} confirmLabel="Send email" isOpen={confirming}
        onOpenChange={setConfirming} onConfirm={() => save('Sent')}>
        <p>“{subject.trim()}” goes to {to === ALL ? 'all participants' : `everyone in ${to}`} now. A sent email can't be taken back.</p>
      </AlertDialog>
    </Page>
  );
}

// ── A sent email's statistics ────────────────────────────────────────────────

const RECIPIENT_STATUSES = ['Clicked', 'Opened', 'Delivered', 'Bounced'] as const;
const RECIPIENT_FACETS: FilterFacet[] = [{id: 'status', label: 'Status', icon: <CircleCheck aria-hidden size={16} />,
  items: RECIPIENT_STATUSES.map(st => ({id: st, label: st, count: RECIPIENTS.filter(r => r.status === st).length}))}];
const recipientsWord = (v: number, n: (v: number) => string) => `${n(v)} ${v === 1 ? 'recipient' : 'recipients'}`;

/** Who got it, in the list shape every admin table shares: count, filter and search over the table, pages below. */
function RecipientList({sent}: {sent: number}) {
  const {format: n} = useNumberFormatter();
  const [query, setQuery] = useState('');
  const [filters, setFilters] = useState<FilterValue>({});
  const q = query.trim().toLowerCase();
  const rows = RECIPIENTS.filter(r => (!q || `${r.name} ${r.email}`.toLowerCase().includes(q))
    && (!filters.status?.length || filters.status.includes(r.status)));
  const {current, pageCount, setPage, shown} = usePages(rows, 10);
  const fresh = <T,>(set: (v: T) => void) => (v: T) => { set(v); setPage(1); };
  return (
    <Panel title="Recipients" headingLevel={3} description={`A sample of the ${n(sent)} people it went to.`} isFlush
      toolbar={<>
        <TableToolbar aria-label="Recipient tools" headingLevel={4} heading={recipientsWord(rows.length, n)}>
          <FilterMenu aria-label="Filter recipients" facets={RECIPIENT_FACETS} value={filters} onChange={fresh(setFilters)} countLabel={v => recipientsWord(v, n)} />
          <SearchField aria-label="Search recipients" placeholder="Search" value={query} onChange={fresh(setQuery)} />
        </TableToolbar>
        <FilterChips aria-label="Active filters" facets={RECIPIENT_FACETS} value={filters} onChange={fresh(setFilters)} />
      </>}
      footer={<Pagination page={current} pageCount={pageCount} onPageChange={setPage} aria-label="Recipient pages" />}>
      <div className="bo-messaging-scroll">
        <DataTable aria-label="Recipients">
          <DataTableHeader>
            <DataTableColumn isRowHeader>Recipient</DataTableColumn>
            <DataTableColumn>Status</DataTableColumn>
          </DataTableHeader>
          <DataTableBody renderEmptyState={() => <DataTableEmpty>No recipients match.</DataTableEmpty>}>
            {shown.map(r => (
              <DataTableRow key={r.id} id={r.id} textValue={r.name}>
                <DataTableCell><DataTablePerson name={r.name} initials={r.name.split(' ').map(w => w[0]).join('')} sub={r.email} /></DataTableCell>
                <DataTableCell><Badge>{r.status}</Badge></DataTableCell>
              </DataTableRow>
            ))}
          </DataTableBody>
        </DataTable>
      </div>
    </Panel>
  );
}

export function EmailStats() {
  const {format: n} = useNumberFormatter();
  const dayTime = useDayTime();
  const {emailId} = useParams();
  const email = emailStore.emails.find(e => e.id === emailId);
  if (!email) return <Page title="Email not found" crumbs={MESSAGING_CRUMB}><Text elementType="p" kind="small" color="meta">This email does not exist.</Text></Page>;
  const sent = GROUP_SIZES[email.to] ?? 0;
  const delivered = Math.round(sent * 0.98);
  const pctOf = (p?: number) => Math.round(delivered * (p ?? 0) / 100);
  return (
    <Page title={email.subject} crumbs={MESSAGING_CRUMB}
      description={<>Sent {dayTime(email.date)} to {email.to}{email.project && <> · Project: {email.project}</>}</>}>
      <Stack gap="16">
        <SectionHeading>How it did</SectionHeading>
        <TileGrid minTileWidth={160} density="compact">
          <StatTile label="Recipients" value={n(sent)} layout="tall" />
          <StatTile label="Delivered" value={n(delivered)} note={`${n(sent - delivered)} bounced`} />
          <StatTile label="Opened" value={`${email.opened ?? 0}%`} note={`${n(pctOf(email.opened))} people`} />
          <StatTile label="Clicked" value={`${email.clicked ?? 0}%`} note={`${n(pctOf(email.clicked))} people`} />
        </TileGrid>
        <SectionHeading>Who got it</SectionHeading>
        <RecipientList sent={sent} />
      </Stack>
    </Page>
  );
}

// ── New SMS: the message, its length in SMS parts, and how it lands on a phone ──

const SMS_LENGTH = 160;

export function SmsComposer() {
  const {format: n} = useNumberFormatter();
  const navigate = useNavigate();
  const [to, setTo] = useState(GROUPS[0]);
  const [body, setBody] = useState('');
  const [confirming, setConfirming] = useState(false);
  const parts = Math.max(1, Math.ceil(body.length / SMS_LENGTH));
  const withPhone = Math.round(GROUP_SIZES[to] * 0.4);
  return (
    <Page title="New SMS" crumbs={MESSAGING_CRUMB}>
      <SectionHeading>Message and preview</SectionHeading>
      <TileGrid minTileWidth={360} className="bo-messaging-split">
        {/* The same composer as a new email (Panel's "In a composer" story): the form in the body, the actions in the foot. */}
        <Panel title="Write a text message" headingLevel={3}
          footer={<>
            <Button variant="secondary" size={32} onPress={() => navigate('/messaging')}>Cancel</Button>
            <Button variant="secondary" size={32} isDisabled={!body.trim()} onPress={() => toast('Test SMS sent', 'To your own phone number')}>
              <Smartphone aria-hidden size={16} />Send test SMS</Button>
            <Button variant="primary" size={32} isDisabled={!body.trim()}
              onPress={() => setConfirming(true)}><Send aria-hidden size={16} />Send now</Button>
          </>}>
          <Stack gap="16">
            <Select label="To" selectedKey={to} onSelectionChange={k => setTo(String(k))}
              description={`Only the ${n(withPhone)} people with a phone number get it.`}>
              {GROUPS.map(g => <SelectItem key={g} id={g}>{g}</SelectItem>)}
            </Select>
            <Stack gap="4">
              <TextArea label="Message" placeholder="Write your message" value={body} onChange={setBody} />
              <Text kind="small" color="meta" aria-live="polite">
                {body.length} / {SMS_LENGTH * parts} characters · {parts} SMS per recipient
              </Text>
            </Stack>
            {parts > 1 && <Banner tone="warning">This message is sent in {parts} parts, and each part costs a credit for every recipient.</Banner>}
          </Stack>
        </Panel>
        {/* The text as it lands: the Chat message's grey bubble, which keeps line breaks, named as a text message. */}
        <PhonePreview aria-label="SMS preview">
          <Stack gap="4" padding="12">
            <Text kind="small" color="meta">Text message · now</Text>
            <ChatMessage from="you" labels={{you: 'Text message:'}}>{body || 'Your message shows here.'}</ChatMessage>
          </Stack>
        </PhonePreview>
      </TileGrid>
      {/* As an email: Send now asks first, with the number of people and the credits it costs. */}
      <AlertDialog title={`Send this SMS to ${n(withPhone)} people?`} confirmLabel="Send SMS" isOpen={confirming}
        onOpenChange={setConfirming} onConfirm={() => { toast('SMS sent', `To ${to}`); navigate('/messaging'); }}>
        <p>It uses {n(withPhone * parts)} credits. A sent text message can't be taken back.</p>
      </AlertDialog>
    </Page>
  );
}
