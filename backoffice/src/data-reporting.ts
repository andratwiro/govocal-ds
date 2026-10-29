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
  {id: 'r9', title: 'First quarter progress', created: '02/04/2026', modifiedDays: 210, owner: 'team', kind: 'progress'},
  {id: 'r10', title: 'Riverside walk ideas', created: '14/03/2026', modifiedDays: 229, owner: 'you', kind: 'report'},
  {id: 'r11', title: 'Fourth quarter progress 2025', created: '05/01/2026', modifiedDays: 297, owner: 'team', kind: 'progress'},
  {id: 'r12', title: 'School streets survey report', created: '12/12/2025', modifiedDays: 321, owner: 'team', kind: 'report'},
  {id: 'r13', title: 'Market square redesign: final report', created: '20/11/2025', modifiedDays: 343, owner: 'you', kind: 'report'}
];

/** The blank builder's "Report contents" checklist (the prototype). */
// The Create report checklist, grouped under the Choice card's group headings.
export const CONTENT_GROUPS = ['Project context', 'Participation', 'Results'] as const;
export const CONTENTS: {id: string; label: string; meta: string; on: boolean; group: typeof CONTENT_GROUPS[number]}[] = [
  {id: 'cover', label: 'Cover and summary', meta: 'Title, period, project manager', on: true, group: 'Project context'},
  {id: 'phases', label: 'What each phase produced', meta: '3 phases', on: true, group: 'Project context'},
  {id: 'totals', label: 'Participation totals', meta: '1,846 participants · 4 metrics', on: true, group: 'Participation'},
  {id: 'timeline', label: 'Participants timeline', meta: 'Weekly · 4 May to 10 Jul', on: true, group: 'Participation'},
  {id: 'demographics', label: 'Demographics', meta: 'Age and area breakdown', on: false, group: 'Participation'},
  {id: 'top', label: 'Top ideas by votes', meta: 'From the ideation phase', on: false, group: 'Results'},
  {id: 'survey', label: 'Survey results', meta: 'Survey · 45 responses', on: false, group: 'Results'},
  {id: 'recs', label: 'Recommendations', meta: 'AI-written next steps', on: true, group: 'Results'}
];
