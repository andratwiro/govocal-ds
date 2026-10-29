import {AppWindow, Bot, ChartColumn, KeyRound, Map, Video, Webhook, type LucideIcon} from 'lucide-react';

export type Tool = {
  id: string;
  title: string;
  description: string;
  icon: LucideIcon;
  category: string;
  action: string;
  /** A green or grey status, where the tool has one. */
  status?: {state: 'live' | 'draft'; label: string};
  learnMore?: boolean;
  /** Not in the platform's plan: the action is off. */
  locked?: boolean;
};

export const TOOLS: Tool[] = [
  {id: 'workshops', title: 'Online deliberation workshops', icon: Video, category: 'Live meetings',
    description: 'Hold live video meetings and run group discussions and debates side by side. Gather input, vote and reach consensus, as you would in a room.',
    action: 'Manage workshops', status: {state: 'live', label: '2 upcoming'}, learnMore: true},
  {id: 'esri', title: 'Esri integration', icon: Map, category: 'Maps',
    description: 'Connect an Esri account and import layers from ArcGIS Online straight into mapping projects.',
    action: 'Enable Esri', status: {state: 'draft', label: 'Not connected'}},
  {id: 'widget', title: 'Widget', icon: AppWindow, category: 'Embed',
    description: 'Build a widget, style it and add it to another website to bring people to this platform.',
    action: 'Manage widget'},
  {id: 'api', title: 'Public API access', icon: KeyRound, category: 'Integration',
    description: 'Manage the credentials for custom integrations on the public API.',
    action: 'Manage API keys', status: {state: 'live', label: '2 keys'}},
  {id: 'webhooks', title: 'Webhooks', icon: Webhook, category: 'Integration',
    description: 'Send real-time notifications to another service when something happens on the platform.',
    action: 'Manage webhooks', status: {state: 'live', label: '1 active'}},
  {id: 'power-bi', title: 'Power BI', icon: ChartColumn, category: 'Data',
    description: 'Use ready-made Power BI templates to bring platform data into a Power BI workspace.',
    action: 'Download templates', locked: true},
  {id: 'mcp', title: 'MCP authorizations', icon: Bot, category: 'AI agents',
    description: 'See and manage the Model Context Protocol authorizations: which AI agents may act on the platform for you.',
    action: 'Manage authorizations', status: {state: 'draft', label: 'None yet'}}
];
