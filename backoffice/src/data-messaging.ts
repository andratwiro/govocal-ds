// Messaging: invented emails and text messages. No real tenants, people or places.
import type {Multiloc} from 'govocal-ds';
import {REGISTERED_USERS} from './data-users';

export type CustomEmail = {
  id: string; subject: string; status: 'Sent' | 'Scheduled' | 'Draft';
  /** ISO: when it was sent or is scheduled ("2026-10-21T14:30"); a draft's, when it was last edited ("2026-10-19"). */
  date: string; project?: string;
  to: string; opened?: number; clicked?: number;
  /** The message in each platform language (the composer's Multilingual rich text editor). */
  body: Multiloc
};

export const SENDER = {from: 'Larkvale participation team', replyTo: 'participation@example.org'};
export const GROUPS = ['All users', 'Residents of the north district', 'Youth panel', 'Followers of Harbour Plan 2030'];

export const CUSTOM_EMAILS: CustomEmail[] = [
  {id: 'e1', subject: 'Harbour Plan: the ideas phase opens on Monday', status: 'Scheduled', date: '2026-11-03T09:00',
    project: 'Harbour Plan 2030', to: 'Followers of Harbour Plan 2030',
    body: {en: 'From Monday you can share your ideas for the harbour front. Tell us what you would like to see there.'}},
  {id: 'e2', subject: 'Thank you for voting on safer school streets', status: 'Sent', date: '2026-10-21T14:30',
    project: 'Safer School Streets', to: 'All users', opened: 48, clicked: 12, body: {}},
  {id: 'e3', subject: 'Bike parking survey: tell us where', status: 'Draft', date: '2026-10-19',
    to: 'Residents of the north district',
    body: {en: 'We are planning new bike racks for next spring. Take five minutes to mark the streets where you need them most.'}},
  {id: 'e4', subject: 'Library opening hours: the results', status: 'Sent', date: '2026-10-07T10:00',
    project: 'Library opening hours', to: 'All users', opened: 61, clicked: 23, body: {}},
  {id: 'e5', subject: 'Youth budget 2027: what happens next', status: 'Sent', date: '2026-09-18T16:45',
    project: 'Youth budget 2027', to: 'Youth panel', opened: 39, clicked: 9, body: {}},
  {id: 'e6', subject: 'Market Square: join the walk on Saturday', status: 'Draft', date: '2026-09-02',
    project: 'Market Square redesign', to: 'All users',
    body: {en: 'Walk the square with the design team this Saturday at 10:00 and tell us what works and what does not.'}}
];

export type AutomatedEmail = {
  id: string; name: string; who: string; trigger: string; on: boolean;
  subject: string; title?: string; intro: string; button?: string
};
export type AutomatedGroup = {role: string; types: {type: string; emails: AutomatedEmail[]}[]};

// Grouped as in the real admin: who receives it, then what it is about.
export const AUTOMATED: AutomatedGroup[] = [
  {role: 'Residents', types: [
    {type: 'Your inputs', emails: [
      {id: 'pub', name: 'Your input is published', who: 'User who published the input', trigger: 'Input is published', on: true,
        subject: 'Your input is on the platform', title: 'Your input is published', intro: 'Thank you for sharing your idea. Others can now read it, comment and react.', button: 'View your input'},
      {id: 'cmt', name: 'Comment on your input', who: 'Author of the input', trigger: 'Someone comments on it', on: true,
        subject: 'New comment on your input', title: 'Resident B commented on your input', intro: 'Read the comment and reply if you like.', button: 'Read the comment'},
      {id: 'status', name: 'Status change of your input', who: 'Users who follow the input', trigger: 'Input status changes', on: true,
        subject: 'The status of an input you follow changed', title: 'An input you follow has a new status', intro: 'The project team has updated the status of this input.', button: 'See the update'}
    ]},
    {type: 'Projects', emails: [
      {id: 'phase', name: 'Phase started', who: 'Users who follow the project', trigger: 'A new phase starts', on: true,
        subject: 'A new phase has started', title: 'You can take part again', intro: 'A new phase of a project you follow has started.', button: 'Take part'},
      {id: 'digest', name: 'Weekly digest', who: 'All users', trigger: 'Every Monday', on: true,
        subject: 'This week on the platform', title: 'What happened this week', intro: 'The most discussed inputs and the projects that need you.', button: 'Go to the platform'},
      {id: 'mention', name: 'Mention in an update', who: 'Mentioned user', trigger: 'Someone mentions you', on: false,
        subject: 'You were mentioned', title: 'Someone mentioned you', intro: '', button: 'View the update'}
    ]}
  ]},
  {role: 'Admins and managers', types: [
    {type: 'Moderation', emails: [
      {id: 'newinput', name: 'New input in your project', who: 'Project managers', trigger: 'Input is published', on: true,
        subject: 'A new input to review', title: 'A new input needs your attention', intro: 'Read it, give feedback or change its status.', button: 'Review the input'},
      {id: 'assigned', name: 'Input assigned to you', who: 'Assigned manager', trigger: 'Input is assigned', on: true,
        subject: 'An input was assigned to you', title: 'You have a new input to handle', intro: '', button: 'Open the input'},
      {id: 'report', name: 'Weekly report', who: 'Admins', trigger: 'Every Monday', on: false,
        subject: 'Your weekly platform report', title: 'Last week in numbers', intro: 'Visitors, participants and new inputs from last week.', button: 'Open the dashboard'}
    ]}
  ]}
];

export type SmsCampaign = {id: string; label: string; body: string; status: 'Sent' | 'Draft';
  /** ISO date: sent, or a draft's last edit. */
  date: string; delivered?: number; failed?: number};
export const SMS_BALANCE = {purchased: 2000, usedCampaigns: 342, usedTests: 18};
export const SMS: SmsCampaign[] = [
  {id: 's1', label: 'Reminder: vote on school streets', body: 'Voting on safer school streets closes Friday. Have your say.', status: 'Sent', date: '2026-10-06', delivered: 214, failed: 3},
  {id: 's2', label: 'Library survey is open', body: 'Help us set new library opening hours: five questions.', status: 'Sent', date: '2026-09-02', delivered: 121, failed: 4},
  {id: 's3', label: 'Market Square walk', body: 'Walk the square with us on Saturday at 10:00.', status: 'Draft', date: '2026-10-28'},
  {id: 's4', label: 'Harbour Plan ideas phase', body: 'Share your ideas for the harbour front from Monday.', status: 'Draft', date: '2026-10-27'}
];

/** How many people each recipient group holds (invented). */
export const GROUP_SIZES: Record<string, number> = {
  'All users': REGISTERED_USERS, 'Residents of the north district': 612, 'Youth panel': 148, 'Followers of Harbour Plan 2030': 341
};

/** A sample of who received a sent email, for its statistics page. */
export const RECIPIENTS: {id: string; name: string; email: string; status: 'Clicked' | 'Opened' | 'Delivered' | 'Bounced'}[] = [
  {id: 'r1', name: 'Resident A', email: 'resident1@example.org', status: 'Clicked'},
  {id: 'r2', name: 'Resident B', email: 'resident2@example.org', status: 'Opened'},
  {id: 'r3', name: 'Resident C', email: 'resident3@example.org', status: 'Opened'},
  {id: 'r4', name: 'Resident D', email: 'resident4@example.org', status: 'Delivered'},
  {id: 'r5', name: 'Resident E', email: 'resident5@example.org', status: 'Delivered'},
  {id: 'r6', name: 'Resident F', email: 'resident6@example.org', status: 'Bounced'}
];
