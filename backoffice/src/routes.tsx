import {createHashRouter, Navigate} from 'react-router';
import {Layout} from './Layout';
import {NAV} from './nav';
import {Placeholder} from './pages/Placeholder';
import {Projects} from './pages/Projects';
import {ProjectPhase} from './pages/ProjectPhase';
import {ProjectOverview} from './pages/ProjectOverview';
import {Dashboard} from './pages/Dashboard';
import {Inputs} from './pages/Inputs';
import {Settings} from './pages/Settings';
import {Messaging} from './pages/Messaging';
import {Users} from './pages/Users';
import {Tools} from './pages/Tools';
import {Reporting} from './pages/Reporting';
import {CommunityMonitor} from './pages/CommunityMonitor';
import {InspirationHub} from './pages/InspirationHub';
import {PagesMenu} from './pages/PagesMenu';
import {Platform} from './pages/Platform';
import {EsriIntegration, McpAuthorizations, PowerBi, PublicApiTokens, Webhooks, Widget} from './pages/ToolsPages';
import {CustomPageEditor, CustomPageView, HomepageBuilder, NavbarItemEdit} from './pages/PagesMenuPages';

export const router = createHashRouter([{
  path: '/', element: <Layout />, children: [
    {index: true, element: <Navigate to="/projects" replace />},
    {path: 'dashboard/:tab?', element: <Dashboard />},
    {path: 'projects', element: <Projects />},
    {path: 'inputs', element: <Inputs />},
    {path: 'users', element: <Users />},
    {path: 'messaging', element: <Messaging />},
    {path: 'settings', element: <Settings />},
    {path: 'tools', element: <Tools />},
    {path: 'inspiration-hub', element: <InspirationHub />},
    {path: 'projects/:projectId', element: <ProjectOverview />},
    {path: 'projects/:projectId/phases/:phaseId/:tab', element: <ProjectPhase />},
    {path: 'reporting', element: <Reporting />},
    {path: 'community-monitor', element: <CommunityMonitor />},
    {path: 'pages-menu', element: <PagesMenu />},
    // The tools' and Pages & menu's first screens, at the real admin's paths.
    {path: 'tools/public-api-tokens', element: <PublicApiTokens />},
    {path: 'tools/webhooks', element: <Webhooks />},
    {path: 'tools/power-bi', element: <PowerBi />},
    {path: 'tools/esri-integration', element: <EsriIntegration />},
    {path: 'tools/mcp', element: <McpAuthorizations />},
    {path: 'tools/widgets', element: <Widget />},
    {path: 'pages-menu/homepage-builder', element: <HomepageBuilder />},
    {path: 'pages-menu/navbar-items/edit/:itemId', element: <NavbarItemEdit />},
    {path: 'pages-menu/pages/new', element: <CustomPageEditor key="new" />},
    {path: 'pages-menu/pages/:pageId', element: <CustomPageEditor />},
    {path: 'pages-menu/pages/:pageId/view', element: <CustomPageView />},
    ...NAV.filter(n => !['community-monitor', 'dashboard', 'inputs', 'inspiration-hub', 'messaging', 'pages-menu', 'projects', 'reporting', 'settings', 'tools', 'users'].includes(n.id))
      .map(n => ({path: n.id, element: <Placeholder item={n} />}))
  ]
}, {path: '/platform', element: <Platform />}]);
