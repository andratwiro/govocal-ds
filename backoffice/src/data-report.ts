// The report view's invented report: one city's platform report, its blocks in reading order, the sources behind
// its figures, its version history and the widget library. Larkvale, its districts, streets and people are invented.

export type Lang = 'en' | 'fr';
export const LANGUAGES: {id: Lang; label: string}[] = [
  {id: 'en', label: 'English'},
  {id: 'fr', label: 'French'}
];

/** The words of a figure that a person writes and translates: the finding over it and the note under it. */
export interface FigureWords {
  /** The sentence the figure proves. The rows it names are the highlighted ones. */
  finding: string;
  /** What is counted, under the finding. */
  measure: string;
  /** Who is counted and how, in the figure's foot. */
  note: string;
}

export interface Figure extends FigureWords {
  /** "Source: …" in the foot. */
  source: string;
  /** The French words, where someone has written them. */
  fr?: Partial<FigureWords>;
  /** The Data tab: what the figure counts, how, and from where. */
  included: string;
  calculated: string;
  sources: string[];
}

export interface BarDatum {
  label: string;
  value?: number;
  /** Named in the finding: drawn in the accent. Every other bar stays grey. */
  named?: boolean;
  /** Why there is no bar: "Suppressed" (under 10 people) or "No data". */
  missing?: string;
}

export interface ComparisonGroup {
  finding: string;
  rows: {label: string; percent: number; count: string; named?: boolean}[];
}

export interface Quote {
  words: string;
  author: string;
  initials: string;
  meta: string;
  tag: string;
}

export interface ReportEvent {
  when: string;
  ends: string;
  title: string;
  project: string;
}

export interface Insight {
  id: string;
  kind: string;
  question: string;
  lead: string;
  points: string[];
  covers: string;
}

/** A text block's formatting, set from its toolbar. */
export interface Format {bold?: boolean; italic?: boolean; list?: boolean}

export type Block =
  | {id: string; kind: 'title'; name: string; kicker: string; title: string; subtitle: string; facts: {label: string; value: string}[]}
  | {id: string; kind: 'contents'; name: string; showSub: boolean}
  | {id: string; kind: 'section'; name: string; num: string; heading: string; body: string; bullets?: string[]; fr?: {heading?: string; body?: string}; format?: Format}
  | {id: string; kind: 'text'; name: string; heading?: string; body: string; fr?: {heading?: string; body?: string}; format?: Format}
  | {id: string; kind: 'space'; name: string; size: 'small' | 'medium' | 'large'}
  | {id: string; kind: 'divider'; name: string}
  | {id: string; kind: 'break'; name: string}
  | {id: string; kind: 'numbers'; name: string; layout: 'row' | 'lead' | 'grid'; items: {id: string; label: string; value: string; note: string}[]; figure?: undefined; included: string; calculated: string; sources: string[]}
  | {id: string; kind: 'bars'; name: string; figure: Figure; rows: BarDatum[]; unit?: string; show: 'top3' | 'top5' | 'all'; showValues: boolean}
  | {id: string; kind: 'compare'; name: string; figure: Figure; groups: ComparisonGroup[]; showCounts: boolean}
  | {id: string; kind: 'line'; name: string; figure: Figure; labels: string[]; observed: number[]; estimate: number[]; showEstimate: boolean}
  | {id: string; kind: 'insight'; name: string; figure: Figure; insight: string; showQuestion: boolean; showOrigin: boolean}
  | {id: string; kind: 'quotes'; name: string; figure: Figure; quotes: Quote[]; layout: 'card' | 'plain'; showFaces: boolean}
  | {id: string; kind: 'map'; name: string; figure: Figure; shade: 'rate' | 'heat' | 'none'; layers: {ideas: boolean; votes: boolean; events: boolean}; tag: string; streets: boolean}
  | {id: string; kind: 'events'; name: string; figure: Figure; events: ReportEvent[]; showEnd: boolean};

export type BlockKind = Block['kind'];

export const REPORT = {
  /** The report the editor opens for an id the list doesn't hold. */
  fallbackTitle: 'Larkvale participation report 2026',
  savedAt: '10:19',
  folder: 'Green Streets 2026'
};

const SOURCE = 'Go Vocal, 1 January to 30 September 2026.';
const PLATFORM_DATA = {
  included: 'Recorded participation in 6 projects across 3 spaces and 3 folders, from 1 January to 30 September 2026. Includes submitted surveys, ideas and votes linked to participant accounts. Anonymous submissions and page visits are left out.',
  calculated: 'Each account is counted once within each project. The same account can appear in several project bars. The platform headline counts each account once across all 6 projects.',
  sources: ['tree-planting', 'cycle-lanes', 'parks-budget', 'town-centre', 'library-hours', 'riverside-play']
};

export const INSIGHTS: Insight[] = [
  {id: 'why-trees', kind: 'Summary · 2 October 2026', question: 'Where do people want new trees, and why?',
    lead: 'Most people ask for shade on the routes they walk every day: to school, to the tram stop and to the shops.',
    points: [
      'Heat is the main reason. 1 in 3 inputs mentions heat or summer, most of them from Old Harbour and Eastgate, where tree cover is lowest.',
      'Schools come first. 64 inputs name a school entrance or the walk to one.',
      'Not instead of parking. People support planting where it does not remove parking, and suggest corners and verges instead.'
    ],
    covers: '412 of 500 inputs'},
  {id: 'languages', kind: 'Question · 28 September 2026', question: 'Which languages did people write in?',
    lead: 'Most inputs are in English. A small share is in French, Polish and Portuguese.', points: [], covers: '500 of 500 inputs'},
  {id: 'watering', kind: 'Question · 30 September 2026', question: 'What do people say about watering the new trees?',
    lead: '42 people offered to water a tree near their home, most of them in streets with a school.', points: [],
    covers: '380 of 412 inputs'}
];

export const TEMPLATE: Block[] = [
  {id: 'b-title', kind: 'title', name: 'Title page', kicker: 'Platform participation report', title: 'Larkvale participation report 2026',
    subtitle: 'Participation, priorities and upcoming events across Larkvale’s platform',
    facts: [
      {label: 'Period', value: '1 January to 30 September 2026'},
      {label: 'Scope', value: '3 spaces, 3 folders, 6 projects'},
      {label: 'Prepared by', value: 'Larkvale city council'}
    ]},
  {id: 'b-break-1', kind: 'break', name: 'Page break'},
  {id: 'b-contents', kind: 'contents', name: 'Contents', showSub: true},
  {id: 'b-break-2', kind: 'break', name: 'Page break'},

  {id: 'b-s1', kind: 'section', name: 'Executive summary', num: '01', heading: 'Executive summary', body: '',
    bullets: [
      '3,600 identifiable participants took part across 6 projects. The project totals include repeat participants.',
      'Accessibility and greenery recur most often in Town centre renewal’s 5 surveys.',
      'The sample participation rate is 20% above the sample European-city benchmark.',
      '4 upcoming events are scheduled across the 2 Green Streets 2026 projects.'
    ], fr: {heading: 'Synthèse'}},
  {id: 'b-space-1', kind: 'space', name: 'White space', size: 'medium'},
  {id: 'b-numbers-1', kind: 'numbers', name: 'By the numbers', layout: 'lead', ...PLATFORM_DATA, items: [
    {id: 'participants', label: 'Participants', value: '3,600', note: 'Unique identifiable participants, 6 projects'},
    {id: 'first', label: 'Took part for the first time', value: '61%', note: '2,196 of 3,600 participants'},
    {id: 'projects', label: 'Projects', value: '6', note: '3 spaces, 3 folders'},
    {id: 'anonymous', label: 'Anonymous submissions', value: '540', note: 'Separate from identifiable participants'}
  ]},
  {id: 'b-break-3', kind: 'break', name: 'Page break'},

  {id: 'b-s2', kind: 'section', name: 'Taking part', num: '02', heading: 'Taking part',
    body: 'People took part in 6 projects across 3 spaces. Tree planting drew the most; the final proposal survey is still open.'},
  {id: 'b-space-2', kind: 'space', name: 'White space', size: 'small'},
  {id: 'b-projects', kind: 'bars', name: 'Platform participation', show: 'top3', showValues: true, figure: {
    finding: 'Tree planting has the highest project participant count', measure: 'Identifiable participants by project',
    note: 'Each participant is counted once per project. The 6 project totals add to 4,500; the platform has 3,600 unique identifiable participants.',
    source: SOURCE, ...PLATFORM_DATA}, rows: [
    {label: 'Tree planting by street', value: 1286, named: true},
    {label: 'Cycle lane priorities', value: 942},
    {label: 'Parks budget', value: 731},
    {label: 'Town centre renewal', value: 688},
    {label: 'Library opening hours', value: 512},
    {label: 'Riverside play areas', value: 341}
  ]},
  {id: 'b-text-1', kind: 'text', name: 'Tree planting and the cycle lane vote',
    body: 'Tree planting and the cycle lane vote each drew more than 900 people. The smaller projects still shaped the priorities below.'},
  {id: 'b-space-3', kind: 'space', name: 'White space', size: 'small'},
  {id: 'b-projection', kind: 'line', name: 'Response projection', showEstimate: true, figure: {
    finding: 'At the recent pace, the survey would reach about 800 responses', measure: 'Observed and projected submitted survey responses',
    note: '220 observed responses at 2 October. The estimate assumes 20 responses a day until 31 October.',
    source: 'Go Vocal, Final proposal feedback, 25 September to 1 October 2026.',
    included: 'Submitted responses to the final proposal survey in Tree planting by street. Drafts are left out.',
    calculated: 'The estimate continues the last 7 days’ average, 20 responses a day, to the survey’s close on 31 October. It is not a forecast.',
    sources: ['tree-planting']},
    labels: ['25 Sep', '26 Sep', '27 Sep', '28 Sep', '29 Sep', '30 Sep', '1 Oct', '31 Oct'],
    observed: [100, 118, 138, 152, 172, 198, 220, 220],
    estimate: [100, 118, 138, 152, 172, 198, 220, 800]},
  {id: 'b-break-4', kind: 'break', name: 'Page break'},

  {id: 'b-s3', kind: 'section', name: 'Project priorities', num: '03', heading: 'Project priorities',
    body: 'Across Town centre renewal’s 5 surveys, accessibility and greenery recur most often. In the cycle lane vote, 2 routes are clearly ahead.'},
  {id: 'b-space-4', kind: 'space', name: 'White space', size: 'small'},
  {id: 'b-themes', kind: 'bars', name: 'Survey themes', show: 'all', showValues: true, figure: {
    finding: 'Accessibility and greenery recur most often across the 5 surveys', measure: 'Response records mentioning each theme across 5 surveys',
    note: '1,070 submitted response records. A response can mention several themes; repeat participants across surveys are not deduplicated.',
    source: 'Go Vocal, Town centre renewal, 5 surveys.',
    included: 'Submitted responses to the 5 Town centre renewal surveys, tagged by theme in the analysis.',
    calculated: 'A response counts once for each theme it mentions, so the bars add to more than the responses.',
    sources: ['town-centre']}, rows: [
    {label: 'Accessibility', value: 420, named: true},
    {label: 'Greenery', value: 360, named: true},
    {label: 'Places to meet', value: 290},
    {label: 'Parking and deliveries', value: 240},
    {label: 'Safety', value: 180}
  ]},
  {id: 'b-text-2', kind: 'text', name: 'The Town centre renewal surveys',
    body: 'The Town centre renewal surveys asked different questions; the cycle lane vote was a single straight choice.'},
  {id: 'b-space-5', kind: 'space', name: 'White space', size: 'small'},
  {id: 'b-routes', kind: 'bars', name: 'Cycle lane votes', show: 'all', showValues: true, figure: {
    finding: '2 routes are clearly ahead of the rest', measure: 'Votes per cycle lane route',
    note: 'Each voter could support up to 3 routes. 2,002 recorded online votes.', source: SOURCE,
    included: 'Online votes in Cycle lane priorities. Paper votes are counted in the project, not here.',
    calculated: 'A vote counts once for each route it supports; each voter could support up to 3.',
    sources: ['cycle-lanes']}, rows: [
    {label: 'Elm Street', value: 612, named: true},
    {label: 'Canal Road', value: 548, named: true},
    {label: 'Market Lane', value: 391},
    {label: 'Station Road', value: 287},
    {label: 'Mill Road', value: 164}
  ]},
  {id: 'b-break-5', kind: 'break', name: 'Page break'},
  {id: 'b-text-3', kind: 'text', name: 'Tree planting', heading: 'Tree planting',
    body: 'Most of what people wrote about trees was about shade on the walks they make every day.'},
  {id: 'b-insight', kind: 'insight', name: 'Insight from analysis', insight: 'why-trees', showQuestion: true, showOrigin: true, figure: {
    finding: 'Where do people want new trees, and why?', measure: 'From the analysis of Tree planting by street, Share your ideas',
    note: '', source: 'Go Vocal analysis, Tree planting by street · Share your ideas · 412 of 500 inputs · 2 October 2026.',
    included: 'The ideas submitted in Share your ideas, read by the analysis on 2 October 2026.',
    calculated: 'The summary covers the inputs the analysis could read; the share it covers is in the foot.',
    sources: ['tree-planting']}},
  {id: 'b-space-6', kind: 'space', name: 'White space', size: 'small'},
  {id: 'b-groups', kind: 'compare', name: 'Who raised what', showCounts: true, figure: {
    finding: 'Different groups raise different concerns about the new trees',
    measure: 'Share of Tree planting ideas raising a topic: one group against everyone else who answered',
    note: '3 of the 14 patterns the analysis found, each unlikely to be chance. Shares count ideas, not people; ideas whose authors left a question blank are left out.',
    source: 'Go Vocal, Tree planting by street · Share your ideas.',
    included: 'Ideas in Share your ideas whose authors answered the district and age questions.',
    calculated: 'Each pair compares one group with everyone else who answered. Groups under 10 ideas are not shown.',
    sources: ['tree-planting']}, groups: [
    {finding: 'Old Harbour residents raise heat and shade almost twice as often as people in other districts.', rows: [
      {label: 'Old Harbour', percent: 58, count: '51 of 88', named: true}, {label: 'Other districts', percent: 32, count: '112 of 350'}]},
    {finding: 'People aged 30 to 44 raise routes to school nearly 3 times as often as other ages.', rows: [
      {label: 'Aged 30 to 44', percent: 25, count: '33 of 130', named: true}, {label: 'Other ages', percent: 9, count: '24 of 272'}]},
    {finding: 'Ideas for a tree on a shopping street raise parking and deliveries more than twice as often as ideas for other places.', rows: [
      {label: 'On a shopping street', percent: 32, count: '31 of 96', named: true}, {label: 'Other places', percent: 13, count: '54 of 404'}]}
  ]},
  {id: 'b-break-6', kind: 'break', name: 'Page break'},

  {id: 'b-s4', kind: 'section', name: 'Comparison', num: '04', heading: 'Comparison',
    body: 'The sample participation rate is 20% above the sample European-city benchmark. The population base is illustrative.'},
  {id: 'b-space-7', kind: 'space', name: 'White space', size: 'small'},
  {id: 'b-benchmark', kind: 'bars', name: 'European-city benchmark', show: 'all', showValues: true, unit: '', figure: {
    finding: 'Larkvale’s sample participation rate is 20% above the benchmark', measure: 'Illustrative participants per 1,000 residents',
    note: 'All values and the population base are illustrative.', source: SOURCE,
    included: 'Identifiable participants on the platform against a sample population base.',
    calculated: 'Participants per 1,000 residents. The benchmark is a sample of European cities on Go Vocal.',
    sources: PLATFORM_DATA.sources}, rows: [
    {label: 'Larkvale sample', value: 12, named: true},
    {label: 'European-city benchmark sample', value: 10}
  ]},
  {id: 'b-break-7', kind: 'break', name: 'Page break'},

  {id: 'b-s5', kind: 'section', name: 'Who took part', num: '05', heading: 'Who took part',
    body: 'Recorded participation rates vary across the sample districts. Two districts are below the reporting threshold or have no usable data.'},
  {id: 'b-space-8', kind: 'space', name: 'White space', size: 'small'},
  {id: 'b-districts', kind: 'bars', name: 'Participation by district', show: 'all', showValues: true, figure: {
    finding: 'North Quarter has the highest recorded participation rate', measure: 'Illustrative identifiable participants per 1,000 residents, by district',
    note: 'South Fields is suppressed (below 10 participants). Westbrook has no usable data. Population figures are sample reference data for 2025.',
    source: 'Go Vocal, 8 selected districts, 2025 reference.',
    included: 'Identifiable participants who gave a district, in 8 selected districts.',
    calculated: 'Participants per 1,000 residents of the district. Districts under 10 participants are suppressed.',
    sources: PLATFORM_DATA.sources}, rows: [
    {label: 'North Quarter', value: 12, named: true},
    {label: 'Old Harbour', value: 10},
    {label: 'Millbrook', value: 9},
    {label: 'Eastgate', value: 9},
    {label: 'Riverside', value: 8},
    {label: 'Hillcrest', value: 8},
    {label: 'South Fields', missing: 'Suppressed'},
    {label: 'Westbrook', missing: 'No data'}
  ]},
  {id: 'b-break-8', kind: 'break', name: 'Page break'},

  {id: 'b-s6', kind: 'section', name: 'Where people want trees', num: '06', heading: 'Where people want trees',
    body: '386 Tree planting ideas say where the tree should go. Ideas about heat and shade gather in Old Harbour and Eastgate, two of the hottest districts on the city’s heat layer.'},
  {id: 'b-space-9', kind: 'space', name: 'White space', size: 'small'},
  {id: 'b-map', kind: 'map', name: 'Map', shade: 'heat', layers: {ideas: true, votes: false, events: false}, tag: 'heat', streets: true, figure: {
    finding: 'Ideas about heat and shade gather in Old Harbour and Eastgate, two of the hottest districts',
    measure: 'Tree planting ideas over summer heat by district',
    note: 'Pins show where each idea asks for a tree, not where its author lives; the 114 ideas without a location are not shown. Summer heat is an illustrative layer, not a measurement.',
    source: 'Go Vocal, Tree planting ideas, 6 projects, 2025 district reference.',
    included: 'Ideas in Tree planting by street that carry a location: 386 of 500.',
    calculated: 'One pin per idea. Districts are shaded in 5 equal steps of the chosen layer.',
    sources: ['tree-planting', 'cycle-lanes']}},
  {id: 'b-space-10', kind: 'space', name: 'White space', size: 'small'},
  {id: 'b-quotes', kind: 'quotes', name: 'Quotes', layout: 'card', showFaces: true, figure: {
    finding: 'People ask for shade on the walks they make every day', measure: 'In their own words: 3 Tree planting ideas',
    note: '', source: 'Go Vocal, Tree planting by street · Share your ideas.',
    included: 'Ideas from Share your ideas whose authors agreed to be quoted.',
    calculated: 'Picked by the assistant for the finding, then checked by Manager A. Names are shortened.',
    sources: ['tree-planting']}, quotes: [
    {words: 'From June there is no shade at all between the tram and my door. Two trees on Elm Street would change my summer.',
      author: 'Resident A', initials: 'RA', meta: 'Old Harbour · 31 reactions · Translated from French', tag: 'Heat and shade'},
    {words: 'Our children walk to school along Canal Road in full sun. A row of trees by the school gate is the first thing I would ask for.',
      author: 'Resident B', initials: 'RB', meta: 'Eastgate · 24 reactions', tag: 'Routes to school'},
    {words: 'Plant on the corners, not in the loading bay, and the trees and my deliveries both fit.',
      author: 'Resident C', initials: 'RC', meta: 'Old Harbour · 18 reactions', tag: 'Parking and deliveries'}
  ]},
  {id: 'b-divider', kind: 'divider', name: 'Divider'},

  {id: 'b-s7', kind: 'section', name: 'Reach', num: '07', heading: 'Reach',
    body: 'Most recorded visits came through the city’s newsletter. About 1 recorded visitor in 5 went on to take part.'},
  {id: 'b-numbers-2', kind: 'numbers', name: 'By the numbers', layout: 'row', ...PLATFORM_DATA, items: [
    {id: 'visitors', label: 'Visitors', value: '18,000', note: 'Unique recorded visitors to the project pages'},
    {id: 'visitors-part', label: 'Visitors who took part', value: '20%', note: '3,600 of 18,000 · recorded ratio'}
  ]},
  {id: 'b-space-11', kind: 'space', name: 'White space', size: 'small'},
  {id: 'b-traffic', kind: 'bars', name: 'Traffic sources', show: 'all', showValues: true, figure: {
    finding: 'The newsletter accounts for the largest recorded visit total', measure: 'Recorded visits by source',
    note: '18,240 recorded visits in the period. Repeat visits are counted.', source: SOURCE,
    included: 'Visits to the 6 projects’ pages, by where the visitor came from.',
    calculated: 'Every visit counts, including repeat visits by the same person.',
    sources: PLATFORM_DATA.sources}, rows: [
    {label: 'Newsletter', value: 6120, named: true},
    {label: 'Direct', value: 4880},
    {label: 'Social media', value: 3940},
    {label: 'Search engines', value: 2310},
    {label: 'Other websites', value: 990}
  ]},
  {id: 'b-break-9', kind: 'break', name: 'Page break'},

  {id: 'b-s8', kind: 'section', name: 'Upcoming events', num: '08', heading: 'Upcoming events',
    body: '4 upcoming events are scheduled across the 2 Green Streets 2026 projects.'},
  {id: 'b-space-12', kind: 'space', name: 'White space', size: 'small'},
  {id: 'b-events', kind: 'events', name: 'Upcoming events', showEnd: true, figure: {
    finding: '4 events are scheduled across the Green Streets projects', measure: 'Upcoming events in Green Streets 2026',
    note: 'Times are local to Larkvale.', source: 'Go Vocal, Green Streets 2026, 2 October to 31 December 2026.',
    included: 'Published events in the 2 Green Streets 2026 projects, from 2 October to 31 December 2026.',
    calculated: 'Listed by start time. Cancelled events are left out.',
    sources: ['tree-planting', 'parks-budget']}, events: [
    {when: '15 October 2026, 17:00', ends: '18:30', title: 'Tree planting walk', project: 'Tree planting by street'},
    {when: '22 October 2026, 18:00', ends: '20:00', title: 'Parks budget workshop', project: 'Parks budget'},
    {when: '5 November 2026, 17:30', ends: '19:00', title: 'Tree locations review', project: 'Tree planting by street'},
    {when: '19 November 2026, 18:00', ends: '19:00', title: 'Parks budget results', project: 'Parks budget'}
  ]}
];

/** The Data tab's sources: spaces, their folders and projects (a project opens its source preview). */
export interface SourceNode {id: string; name: string; kind: 'space' | 'folder' | 'project'; children?: SourceNode[]; scope?: string; coverage?: string}
export const SOURCES: SourceNode[] = [
  {id: 'space-public', name: 'Public realm', kind: 'space', children: [
    {id: 'folder-green', name: 'Green Streets 2026', kind: 'folder', children: [
      {id: 'tree-planting', name: 'Tree planting by street', kind: 'project', scope: 'Phase and survey records in this project',
        coverage: '1,286 identifiable participants (counted once within the project)'},
      {id: 'parks-budget', name: 'Parks budget', kind: 'project', scope: 'Phase and survey records in this project',
        coverage: '731 identifiable participants (counted once within the project)'}
    ]}
  ]},
  {id: 'space-mobility', name: 'Mobility', kind: 'space', children: [
    {id: 'folder-moving', name: 'Moving Larkvale', kind: 'folder', children: [
      {id: 'cycle-lanes', name: 'Cycle lane priorities', kind: 'project', scope: 'Votes in this project',
        coverage: '942 identifiable participants (counted once within the project)'},
      {id: 'town-centre', name: 'Town centre renewal', kind: 'project', scope: 'Survey records in this project',
        coverage: '688 identifiable participants (counted once within the project)'}
    ]}
  ]},
  {id: 'space-neighbourhoods', name: 'Neighbourhoods', kind: 'space', children: [
    {id: 'folder-local', name: 'Local services', kind: 'folder', children: [
      {id: 'library-hours', name: 'Library opening hours', kind: 'project', scope: 'Survey records in this project',
        coverage: '512 identifiable participants (counted once within the project)'},
      {id: 'riverside-play', name: 'Riverside play areas', kind: 'project', scope: 'Phase records in this project',
        coverage: '341 identifiable participants (counted once within the project)'}
    ]}
  ]}
];
export const SNAPSHOT = '2 October 2026 at 10:42';

export interface HistoryEntry {
  id: string;
  day: 'Today' | 'Yesterday';
  who: string;
  initials: string;
  what: string;
  when: string;
  /** The blocks the change touched. */
  blocks?: string[];
  /** The request the assistant was given. */
  prompt?: string;
  detail?: string;
  current?: boolean;
}

export const HISTORY: HistoryEntry[] = [
  {id: 'h1', day: 'Today', who: 'You', initials: 'Y', what: 'edited 2 widgets', when: 'Today, 10:12 to 10:19', blocks: ['Executive summary', 'Cycle lane votes'], current: true},
  {id: 'h2', day: 'Today', who: 'Assistant', initials: 'AI', what: 'changed the report', when: 'Today, 09:41 · asked by Manager A',
    prompt: 'Rewrite the whole report in a more formal tone and use the council’s four priority names everywhere.', detail: '14 changed, 3 added, 1 removed'},
  {id: 'h3', day: 'Today', who: 'Manager A', initials: 'MA', what: 'removed 1 widget', when: 'Today, 09:30', blocks: ['How people heard about the survey'],
    detail: 'One of these widgets is no longer in the report.'},
  {id: 'h4', day: 'Yesterday', who: 'Manager A', initials: 'MA', what: 'added 1 widget', when: 'Yesterday, 16:20', blocks: ['Upcoming events']},
  {id: 'h5', day: 'Yesterday', who: 'You', initials: 'Y', what: 'renamed the report', when: 'Yesterday, 15:47', detail: 'From “Larkvale report draft”'},
  {id: 'h6', day: 'Yesterday', who: 'Assistant', initials: 'AI', what: 'wrote the first version', when: 'Yesterday, 14:02 · asked by you',
    prompt: 'Generate a report from the Green Streets 2026 folder.', detail: '31 widgets added'}
];

export const SUGGESTIONS = ['Make the summary shorter', 'Explain who took part', 'Remove the Reach section'];

/** The widget library: what can be added, by group. */
export const LIBRARY: {group: string; items: {kind: BlockKind; label: string; description: string}[]}[] = [
  {group: 'Structure', items: [
    {kind: 'title', label: 'Title page', description: 'Title, subtitle and the report’s facts'},
    {kind: 'contents', label: 'Contents', description: 'The sections and their pages'},
    {kind: 'section', label: 'Section', description: 'A numbered heading and its text'},
    {kind: 'text', label: 'Text', description: 'A paragraph, with an optional heading'},
    {kind: 'numbers', label: 'By the numbers', description: 'Up to 4 numbers side by side'},
    {kind: 'divider', label: 'Divider', description: 'A line between parts of a page'},
    {kind: 'break', label: 'Page break', description: 'Starts a new page'},
    {kind: 'space', label: 'White space', description: 'Room between blocks'}
  ]},
  {group: 'Data', items: [
    {kind: 'bars', label: 'Bar chart', description: 'Compare a few values, one bar each'},
    {kind: 'compare', label: 'Comparison', description: 'One group against everyone else'},
    {kind: 'line', label: 'Line chart', description: 'A value over time'},
    {kind: 'insight', label: 'Insight from analysis', description: 'A saved summary or question'},
    {kind: 'quotes', label: 'Quotes', description: 'People’s own words'},
    {kind: 'map', label: 'Map', description: 'Ideas and layers by place'},
    {kind: 'events', label: 'Events', description: 'Upcoming events in a folder'}
  ]}
];
