import {createHashRouter, Navigate} from 'react-router';
import {Layout} from './Layout';
import {NAV} from './nav';
import {Placeholder} from './pages/Placeholder';
import {Projects} from './pages/Projects';
import {ProjectPhase} from './pages/ProjectPhase';
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

export const router = createHashRouter([{
  path: '/', element: <Layout />, children: [
    {index: true, element: <Navigate to="/projects" replace />},
    {path: 'dashboard', element: <Dashboard />},
    {path: 'projects', element: <Projects />},
    {path: 'inputs', element: <Inputs />},
    {path: 'users', element: <Users />},
    {path: 'messaging', element: <Messaging />},
    {path: 'settings', element: <Settings />},
    {path: 'tools', element: <Tools />},
    {path: 'inspiration-hub', element: <InspirationHub />},
    {path: 'projects/:projectId', element: <ProjectPhase />},
    {path: 'projects/:projectId/phases/:phaseId/:tab', element: <ProjectPhase />},
    {path: 'reporting', element: <Reporting />},
    {path: 'community-monitor', element: <CommunityMonitor />},
    {path: 'pages-menu', element: <PagesMenu />},
    ...NAV.filter(n => !['community-monitor', 'dashboard', 'inputs', 'inspiration-hub', 'messaging', 'pages-menu', 'projects', 'reporting', 'settings', 'tools', 'users'].includes(n.id))
      .map(n => ({path: n.id, element: <Placeholder item={n} />}))
  ]
}]);
