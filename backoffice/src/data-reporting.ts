// Invented reports for the Reporting page. No real tenant, person or place.

export type ReportOwner = 'you' | 'team';
export type ReportKind = 'report' | 'progress';

export interface Report {
  id: string;
  title: string;
  created: string;
  modifiedDays: number;
  owner: ReportOwner;
  kind: ReportKind;
  isNew?: boolean;
}

export const REPORTS: Report[] = [
  {id: 'r1', title: 'Larkvale park renewal: project report', created: '27/10/2026', modifiedDays: 1, owner: 'you', kind: 'report', isNew: true},
  {id: 'r2', title: 'Bike lanes survey results', created: '14/10/2026', modifiedDays: 9, owner: 'you', kind: 'report'},
  {id: 'r3', title: 'Third quarter progress', created: '02/10/2026', modifiedDays: 26, owner: 'team', kind: 'progress'},
  {id: 'r4', title: 'Library opening hours survey', created: '18/09/2026', modifiedDays: 41, owner: 'team', kind: 'report'},
  {id: 'r5', title: 'Participatory budget 2026: results', created: '05/09/2026', modifiedDays: 54, owner: 'you', kind: 'report'},
  {id: 'r6', title: 'Second quarter progress', created: '03/07/2026', modifiedDays: 118, owner: 'team', kind: 'progress'},
  {id: 'r7', title: 'Neighbourhood safety ideas', created: '21/06/2026', modifiedDays: 130, owner: 'team', kind: 'report'},
  {id: 'r8', title: 'Youth council survey report', created: '10/05/2026', modifiedDays: 172, owner: 'you', kind: 'report'},
  {id: 'r9', title: 'First quarter progress', created: '02/04/2026', modifiedDays: 210, owner: 'team', kind: 'progress'}
];

export type SlideKind = 'cover' | 'summary' | 'kpis' | 'timeline' | 'phases' | 'demographics' | 'recommendations' |
  'blank';
export interface Slide {id: string; n: string; title: string; kind: SlideKind}

export const SLIDES: Slide[] = [
  {id: 's1', n: '01', title: 'Cover', kind: 'cover'},
  {id: 's2', n: '02', title: 'Executive summary', kind: 'summary'},
  {id: 's3', n: '03', title: 'Participation at a glance', kind: 'kpis'},
  {id: 's4', n: '04', title: 'Momentum over time', kind: 'timeline'},
  {id: 's5', n: '05', title: 'What each phase produced', kind: 'phases'},
  {id: 's6', n: '06', title: 'Who took part', kind: 'demographics'},
  {id: 's7', n: '07', title: 'Recommendations', kind: 'recommendations'}
];

/** The blank builder's "Report contents" checklist (the prototype). */
export const CONTENTS = [
  {id: 'cover', label: 'Cover and summary', meta: 'Title, period, project manager', on: true},
  {id: 'totals', label: 'Participation totals', meta: '1,846 participants · 4 metrics', on: true},
  {id: 'timeline', label: 'Participants timeline', meta: 'Weekly · 4 May to 10 Jul', on: true},
  {id: 'phases', label: 'What each phase produced', meta: '3 phases', on: true},
  {id: 'demographics', label: 'Demographics', meta: 'Age and area breakdown', on: false},
  {id: 'top', label: 'Top ideas by votes', meta: 'From the ideation phase', on: false},
  {id: 'survey', label: 'Survey results', meta: 'Survey · 45 responses', on: false},
  {id: 'recs', label: 'Recommendations', meta: 'AI-written next steps', on: true}
];

export const DECK = {
  brand: 'Larkvale park renewal · Project report',
  kpis: [
    {label: 'Participants', value: '1,846', note: '+12% on the last project'},
    {label: 'Ideas', value: '312', note: 'Across 3 phases'},
    {label: 'Votes', value: '1,204', note: '4.1 per voter'},
    {label: 'Comments', value: '455', note: '62% replied to'}
  ],
  weeks: ['W1', 'W2', 'W3', 'W4', 'W5', 'W6', 'W7', 'W8', 'W9', 'W10'],
  participants: [40, 120, 210, 260, 230, 310, 280, 190, 130, 76],
  visitors: [180, 420, 610, 700, 640, 820, 760, 540, 380, 260],
  phases: [
    {phase: 'Collect ideas', value: 312, unit: 'ideas'},
    {phase: 'Vote on the shortlist', value: 1204, unit: 'votes'},
    {phase: 'Survey on the final design', value: 238, unit: 'responses'}
  ],
  age: [
    {label: 'Under 25', percent: 14},
    {label: '25 to 44', percent: 38},
    {label: '45 to 64', percent: 31},
    {label: '65 and over', percent: 17}
  ],
  summary: 'Residents asked for more shade, safer paths along the river and a play area for older children. Support for the shortlisted design was strongest among families living within walking distance.',
  recommendations: [
    'Publish the final design with a note on how the votes shaped it.',
    'Run a short follow-up survey with residents over 65, who took part less.',
    'Share this report with the people who took part.'
  ]
};
