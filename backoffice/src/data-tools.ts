import {AppWindow, Bot, ChartColumn, KeyRound, Map, Video, Webhook, type LucideIcon} from 'lucide-react';

export type Tool = {
  id: string;
  title: string;
  description: string;
  /** What the help icon's popover says. */
  help: string;
  icon: LucideIcon;
  category: string;
  action: string;
  /** The tool's own page under Tools. */
  route?: string;
  /** A green or grey status, where the tool has one. */
  status?: {state: 'live' | 'draft'; label: string};
  /** What "Learn more" says, where the tool has it. */
  learnMore?: string;
  /** Not in the platform's plan: the action is off. */
  locked?: boolean;
};

export const TOOLS: Tool[] = [
  {id: 'workshops', title: 'Online deliberation workshops', icon: Video, category: 'Live meetings',
    description: 'Hold live video meetings and run group discussions and debates side by side. Gather input, vote and reach consensus, as you would in a room.',
    help: 'Online workshops are an add-on, not part of the current plan. Contact your success manager to know more.',
    learnMore: 'A workshop is a live video meeting with breakout rooms. Residents join from the platform, talk in small groups, then vote on what each group brought back. You plan the agenda and the rooms; the platform keeps the results.',
    action: 'Manage workshops', locked: true},
  {id: 'esri', title: 'Esri integration', icon: Map, category: 'Maps', route: 'esri-integration',
    description: 'Connect an Esri account and import layers from ArcGIS Online straight into mapping projects.',
    help: 'Add an Esri API key once; then every map in a project can import layers from ArcGIS Online.',
    action: 'Enable Esri', status: {state: 'draft', label: 'Not connected'}},
  {id: 'widget', title: 'Widget', icon: AppWindow, category: 'Embed', route: 'widgets',
    description: 'Build a widget, style it and add it to another website to bring people to this platform.',
    help: 'The widget shows a few of the platform’s projects on another website, with a button that leads back here.',
    action: 'Manage widget'},
  {id: 'api', title: 'Public API Access', icon: KeyRound, category: 'Integration', route: 'public-api-tokens',
    description: 'Manage the credentials for custom integrations on the public API.',
    help: 'Each token lets one custom integration read the platform’s data. Revoke a token to cut that integration off.',
    action: 'Manage API Keys', status: {state: 'live', label: '2 keys'}},
  {id: 'webhooks', title: 'Webhooks', icon: Webhook, category: 'Integration', route: 'webhooks',
    description: 'Send real-time notifications to another service when something happens on the platform.',
    help: 'A webhook calls a URL of yours each time an event you chose happens, such as a new input or a new user.',
    action: 'Manage webhooks', status: {state: 'live', label: '1 active'}},
  {id: 'power-bi', title: 'Power BI', icon: ChartColumn, category: 'Data', route: 'power-bi',
    description: 'Use ready-made Power BI templates to bring platform data into a Power BI workspace.',
    help: 'Two templates: a ready report, and a dataflow to build your own. Both read the data through the public API.',
    action: 'Download templates'},
  {id: 'mcp', title: 'Manage MCP Authorizations', icon: Bot, category: 'AI agents', route: 'mcp',
    description: 'See and manage the Model Context Protocol authorizations: which AI agents may act on the platform for you.',
    help: 'An AI agent that connects through the Model Context Protocol asks for access first. Each access it was given is listed here.',
    action: 'Manage authorizations', status: {state: 'live', label: '2 authorized'}}
];

export type ApiToken = {id: string; name: string; created: string; lastUsed: string};
export const API_TOKENS: ApiToken[] = [
  {id: 't1', name: 'Data warehouse sync', created: '12 Jan 2026', lastUsed: '29 Oct 2026'},
  {id: 't2', name: 'Monthly report script', created: '19 Jun 2026', lastUsed: 'Never'}
];

/** The events a webhook can listen to, as the platform names them. */
export const WEBHOOK_EVENTS = ['idea.created', 'idea.published', 'idea.changed', 'idea.changed_status', 'idea.deleted',
  'user.created', 'user.changed', 'user.deleted'];

export type WebhookItem = {id: string; name: string; url: string; events: string[]; project: string; enabled: boolean};
export const WEBHOOKS: WebhookItem[] = [
  {id: 'w1', name: 'Service desk', url: 'https://desk.example.org/hooks/platform', events: ['idea.created', 'idea.changed_status'],
    project: 'All projects', enabled: true}
];
export const WEBHOOK_PROJECTS = ['All projects', 'Green Corridors', 'Riverside playground', 'Library opening hours'];

export type McpClient = {id: string; name: string; clientId: string};
export const MCP_CLIENTS: McpClient[] = [
  {id: 'm1', name: 'Assistant A', clientId: 'mcp-3f9a-21c0'},
  {id: 'm2', name: 'Research agent B', clientId: 'mcp-7d42-88be'}
];

export const POWER_BI_TEMPLATES = [
  {id: 'report', title: 'Report template', button: 'Download report template', file: 'report-template.pbit',
    text: 'This template creates a Power BI report from the platform’s data: participation, inputs and users over time.'},
  {id: 'dataflow', title: 'Dataflow template', button: 'Download data flow template', file: 'dataflow-template.json',
    text: 'To use the platform’s data in a Power BI dataflow, start from this template: it sets up the tables for you.'}
];
