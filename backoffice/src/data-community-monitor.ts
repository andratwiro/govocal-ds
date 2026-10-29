// Community monitor: a recurring survey of how residents feel, read per quarter. Invented data only.
import type {ChartColor} from '../../src/components/gv/Chart';

export const QUARTERS = ['Q1 2025', 'Q2 2025', 'Q3 2025', 'Q4 2025', 'Q1 2026', 'Q2 2026', 'Q3 2026', 'Q4 2026'];
/** The last quarter is the current one: still collecting answers. */
export const CURRENT = QUARTERS.length - 1;

export type Category = {id: string; label: string; scores: number[]};
/** Average sentiment (1 to 5) per category, one value per quarter. */
export const CATEGORIES: Category[] = [
  {id: 'quality', label: 'Quality of life', scores: [3.4, 3.5, 3.5, 3.6, 3.6, 3.7, 3.8, 3.9]},
  {id: 'service', label: 'Service delivery', scores: [3.1, 3.0, 3.2, 3.2, 3.3, 3.3, 3.2, 3.4]},
  {id: 'trust', label: 'Governance and trust', scores: [2.7, 2.8, 2.8, 2.9, 2.9, 3.0, 3.1, 3.2]}
];

export type Question = {category: string; title: string; score: number};
/** The survey's sentiment questions, numbered across categories, with the current quarter's average. */
export const QUESTIONS: Question[] = [
  {category: 'quality', title: 'The city as a place to live', score: 4.1},
  {category: 'quality', title: 'Overall sense of safety', score: 3.9},
  {category: 'quality', title: 'Access to parks, green spaces and recreation', score: 4.2},
  {category: 'quality', title: 'Availability of affordable housing', score: 2.9},
  {category: 'quality', title: 'Employment and economic opportunities', score: 4.2},
  {category: 'service', title: 'Overall quality of the city\'s services', score: 3.6},
  {category: 'service', title: 'Value received for city taxes and fees', score: 3.0},
  {category: 'service', title: 'Cleanliness and upkeep of streets and public spaces', score: 3.6},
  {category: 'trust', title: 'Trust in local government', score: 3.4},
  {category: 'trust', title: 'Responsiveness of elected officials to community concerns', score: 3.0},
  {category: 'trust', title: 'Transparency about how tax money is spent', score: 3.2}
];

/** People who answered, per quarter (the current quarter is part-way through). */
export const RESPONDENTS = [312, 298, 341, 356, 388, 402, 431, 276];
/** Times the survey popup was shown, per quarter. */
export const POPUP_SHOWN = [2480, 2391, 2610, 2702, 2855, 2930, 3046, 1988];

export const SENTIMENT: {label: string; color: ChartColor}[] = [
  {label: 'Very dissatisfied', color: 'disagree'},
  {label: 'Dissatisfied', color: 'terracotta'},
  {label: 'Neutral', color: 'pass'},
  {label: 'Satisfied', color: 'green'},
  {label: 'Very satisfied', color: 'agree'}
];

export type Breakdown = {label: string; items: {label: string; percent: number; color: ChartColor}[]};
/** Who answered this quarter, from registration fields. */
export const WHO: Breakdown[] = [
  {label: 'Age group', items: [
    {label: '18–24', percent: 12, color: 'blue-1'}, {label: '25–34', percent: 24, color: 'blue-2'},
    {label: '35–44', percent: 22, color: 'blue-3'}, {label: '45–54', percent: 19, color: 'blue-4'},
    {label: '55+', percent: 23, color: 'blue-5'}]},
  {label: 'Gender', items: [
    {label: 'Woman', percent: 51, color: 'blue-2'}, {label: 'Man', percent: 45, color: 'blue-4'},
    {label: 'Another gender or not said', percent: 4, color: 'pass'}]},
  {label: 'Area', items: [
    {label: 'North district', percent: 31, color: 'green'}, {label: 'Central district', percent: 27, color: 'blue-3'},
    {label: 'South district', percent: 24, color: 'olive'}, {label: 'East district', percent: 18, color: 'terracotta'}]}
];

export type Report = {title: string; quarter: string; updated: string; published: boolean};
export const REPORTS: Report[] = [
  {title: 'Q3 2026 results', quarter: 'Q3 2026', updated: '14 Oct 2026', published: true},
  {title: 'Q2 2026 results', quarter: 'Q2 2026', updated: '9 Jul 2026', published: true},
  {title: 'Year in review 2025', quarter: 'Q4 2025', updated: '22 Jan 2026', published: true},
  {title: 'Housing deep dive', quarter: 'Q3 2026', updated: '27 Oct 2026', published: false}
];

export const MANAGERS = ['Manager A', 'Manager B', 'Manager C'];

export const POPUP_CONDITIONS = [
  {id: 'home', label: 'On the homepage or a custom page'},
  {id: 'after-action', label: 'After a resident takes part in a project'},
  {id: 'returning', label: 'Only for returning visitors'}
];
