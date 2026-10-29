import {createHashRouter, Navigate} from 'react-router';
import {Layout} from './Layout';
import {NAV} from './nav';
import {Placeholder} from './pages/Placeholder';
import {Projects} from './pages/Projects';
import {ProjectPhase} from './pages/ProjectPhase';
import {Dashboard} from './pages/Dashboard';
import {Inputs} from './pages/Inputs';
import {Settings} from './pages/Settings';

export const router = createHashRouter([{
  path: '/', element: <Layout />, children: [
    {index: true, element: <Navigate to="/projects" replace />},
    {path: 'dashboard', element: <Dashboard />},
    {path: 'projects', element: <Projects />},
    {path: 'inputs', element: <Inputs />},
    {path: 'settings', element: <Settings />},
    {path: 'projects/:projectId', element: <ProjectPhase />},
    {path: 'projects/:projectId/phases/:phaseId/:tab', element: <ProjectPhase />},
    ...NAV.filter(n => !['dashboard', 'projects', 'inputs', 'settings'].includes(n.id)).map(n => ({path: n.id, element: <Placeholder item={n} />}))
  ]
}]);
