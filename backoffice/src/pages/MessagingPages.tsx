import {useState} from 'react';
import {useNavigate, useParams} from 'react-router';
import {Mail, Send, Smartphone} from 'lucide-react';
import {DataTable, DataTableHeader, DataTableColumn, DataTableBody, DataTableRow, DataTableCell,
  DataTablePerson} from '../../../src/components/gv/DataTable';
import {Button} from '../../../src/components/Button';
import {TextField, TextArea} from '../../../src/components/TextField';
import {Select, SelectItem} from '../../../src/components/Select';
import {Label} from '../../../src/components/Form';
import {ToastRegion, queue} from '../../../src/components/Toast';
import {Card} from '../../../src/components/gv/Card';
import {RichTextEditor} from '../../../src/components/gv/RichTextEditor';
import {Divider} from '../../../src/components/gv/Divider';
import {StatTile} from '../../../src/components/gv/StatTile';
import {Badge} from '../../../src/components/gv/Badge';
import {Banner} from '../../../src/components/gv/Banner';
import {PhonePreview} from '../../../src/patterns/PhonePreview';
import {CUSTOM_EMAILS, GROUP_SIZES, GROUPS, RECIPIENTS, SENDER, type CustomEmail} from '../data-messaging';
import {Gap} from '../Gap';
import {Page} from './Page';
import {SectionHeading} from '../SectionHeading';

// Messaging's first clicks, each on its own route as in the real admin: a new email, a sent email's
// statistics, a new SMS.
const MESSAGING_CRUMB = [{key: 'messaging', label: 'Messaging', href: '#/messaging'}];
const n = (v: number) => v.toLocaleString('en');
const toast = (title: string, description?: string) => queue.add({title, description}, {timeout: 5000});

/** The custom emails, with the ones sent here on top: they outlive a change of route, until a reload. */
export const emailStore: {emails: CustomEmail[]} = {emails: [...CUSTOM_EMAILS]};

// ── New email (the prototype's compose card: header, fields, footer of actions) ──

export function EmailComposer() {
  const navigate = useNavigate();
  const [to, setTo] = useState(GROUPS[0]);
  const [subject, setSubject] = useState('');
  const [body, setBody] = useState('');
  const [bold, setBold] = useState(false);
  const [italic, setItalic] = useState(false);
  const [list, setList] = useState(false);
  const save = (status: CustomEmail['status']) => {
    const email: CustomEmail = {id: `new-${emailStore.emails.length + 1}`, subject: subject.trim() || 'Untitled email', status, to, body,
      date: status === 'Sent' ? '29 Oct 2026, just now' : 'Edited 29 Oct 2026', ...(status === 'Sent' ? {opened: 0, clicked: 0} : {})};
    emailStore.emails = [email, ...emailStore.emails];
    toast(status === 'Sent' ? 'Email sent' : 'Draft saved',
      status === 'Sent' ? `“${email.subject}” is on its way to ${n(GROUP_SIZES[to])} recipients.` : email.subject);
    navigate('/messaging');
  };
  return (
    <Page title="New email" crumbs={MESSAGING_CRUMB}>
      <SectionHeading>Message and recipients</SectionHeading>
      <Card tone="manage" layout="stacked" title="Write a message and choose who gets it">
        <div className="bo-messaging-form">
          <div className="bo-messaging-pair">
            <TextField label="From" defaultValue={SENDER.from} />
            <TextField label="Replies should go to" defaultValue={SENDER.replyTo} />
          </div>
          <Select label="To" selectedKey={to} onSelectionChange={k => setTo(String(k))}>
            {GROUPS.map(g => <SelectItem key={g} id={g}>{g}</SelectItem>)}
          </Select>
          <span className="bo-note">{n(GROUP_SIZES[to])} recipients</span>
          <Divider />
          <TextField label="Subject" placeholder="Add a subject line" value={subject} onChange={setSubject} />
          <div className="bo-messaging-field">
            <Label aria-hidden>Email message</Label>
            <RichTextEditor aria-label="Email message" placeholder="Write your message" value={body} onChange={setBody}
              bold={bold} onBoldChange={setBold} italic={italic} onItalicChange={setItalic} list={list} onListChange={setList} />
          </div>
          <Divider />
          <div className="bo-messaging-buttons">
            <Button variant="quiet" size={32} onPress={() => navigate('/messaging')}>Cancel</Button>
            <Button variant="quiet" size={32} onPress={() => save('Draft')}>Save as draft</Button>
            <span className="bo-push" />
            <Button variant="secondary" size={32} onPress={() => toast('Preview sent', `To ${SENDER.replyTo}`)}>
              <Mail aria-hidden size={16} />Send a preview</Button>
            <Button variant="primary" size={32} onPress={() => save('Sent')}><Send aria-hidden size={16} />Send now</Button>
          </div>
        </div>
      </Card>
      <ToastRegion />
    </Page>
  );
}

// ── A sent email's statistics ────────────────────────────────────────────────

export function EmailStats() {
  const {emailId} = useParams();
  const email = emailStore.emails.find(e => e.id === emailId);
  if (!email) return <Page title="Email not found" crumbs={MESSAGING_CRUMB}><p className="bo-note">This email does not exist.</p></Page>;
  const sent = GROUP_SIZES[email.to] ?? 0;
  const delivered = Math.round(sent * 0.98);
  const pctOf = (p?: number) => Math.round(delivered * (p ?? 0) / 100);
  return (
    <Page title={email.subject} crumbs={MESSAGING_CRUMB}
      description={<>Sent {email.date} to {email.to}{email.project && <> · Project: {email.project}</>}</>}>
      <div className="bo-messaging-stack">
        <div className="bo-messaging-kpis">
          <StatTile label="Recipients" value={n(sent)} type="tall" />
          <StatTile label="Delivered" value={n(delivered)} note={`${n(sent - delivered)} bounced`} />
          <StatTile label="Opened" value={`${email.opened ?? 0}%`} note={`${n(pctOf(email.opened))} people`} />
          <StatTile label="Clicked" value={`${email.clicked ?? 0}%`} note={`${n(pctOf(email.clicked))} people`} />
        </div>
        <SectionHeading>Who got it</SectionHeading>
        <Card tone="manage" title="Recipients" summary={`${RECIPIENTS.length} of ${n(sent)} shown`}>
          <div className="bo-messaging-scroll">
            <DataTable aria-label="Recipients">
              <DataTableHeader>
                <DataTableColumn isRowHeader>Recipient</DataTableColumn>
                <DataTableColumn>Status</DataTableColumn>
              </DataTableHeader>
              <DataTableBody>
                {RECIPIENTS.map(r => (
                  <DataTableRow key={r.id} id={r.id} textValue={r.name}>
                    <DataTableCell><DataTablePerson name={r.name} initials={r.name.split(' ').map(w => w[0]).join('')} sub={r.email} /></DataTableCell>
                    <DataTableCell><Badge>{r.status}</Badge></DataTableCell>
                  </DataTableRow>
                ))}
              </DataTableBody>
            </DataTable>
          </div>
        </Card>
      </div>
    </Page>
  );
}

// ── New SMS: the message, its length in SMS parts, and how it lands on a phone ──

const SMS_LENGTH = 160;

export function SmsComposer() {
  const navigate = useNavigate();
  const [to, setTo] = useState(GROUPS[0]);
  const [body, setBody] = useState('');
  const parts = Math.max(1, Math.ceil(body.length / SMS_LENGTH));
  return (
    <Page title="New SMS" crumbs={MESSAGING_CRUMB}>
      <SectionHeading>Message and preview</SectionHeading>
      <div className="bo-messaging-split">
        <Card tone="manage" layout="stacked" title="Write a text message">
          <div className="bo-messaging-form">
            <Select label="To" selectedKey={to} onSelectionChange={k => setTo(String(k))}>
              {GROUPS.map(g => <SelectItem key={g} id={g}>{g}</SelectItem>)}
            </Select>
            <span className="bo-note">Only the {n(Math.round(GROUP_SIZES[to] * 0.4))} people with a phone number get it.</span>
            <TextArea label="Message" placeholder="Write your message" value={body} onChange={setBody} />
            <span className="bo-note" aria-live="polite">
              {body.length} / {SMS_LENGTH * parts} characters · {parts} SMS per recipient
            </span>
            {parts > 1 && <Banner>This message is sent in {parts} parts, and each part costs a credit for every recipient.</Banner>}
            <div className="bo-messaging-buttons">
              <Button variant="quiet" size={32} onPress={() => navigate('/messaging')}>Cancel</Button>
              <span className="bo-push" />
              <Button variant="secondary" size={32} isDisabled={!body.trim()} onPress={() => toast('Test SMS sent', 'To your own phone number')}>
                <Smartphone aria-hidden size={16} />Send test SMS</Button>
              <Button variant="primary" size={32} isDisabled={!body.trim()}
                onPress={() => { toast('SMS sent', `To ${to}`); navigate('/messaging'); }}><Send aria-hidden size={16} />Send now</Button>
            </div>
          </div>
        </Card>
        <PhonePreview aria-label="SMS preview">
          <Gap name="SMS bubble">
            <div className="bo-messaging-sms">
              <span className="bo-note">Text message · now</span>
              <p>{body || 'Your message shows here.'}</p>
            </div>
          </Gap>
        </PhonePreview>
      </div>
      <ToastRegion />
    </Page>
  );
}
