import {createHashRouter, Navigate} from 'react-router';
import {Layout} from './Layout';
import {NAV} from './nav';
import {Placeholder} from './pages/Placeholder';
import {Projects} from './pages/Projects';
import {ProjectPhase} from './pages/ProjectPhase';
import {Dashboard} from './pages/Dashboard';

export const router = createHashRouter([{
  path: '/', element: <Layout />, children: [
    {index: true, element: <Navigate to="/projects" replace />},
    {path: 'dashboard', element: <Dashboard />},
    {path: 'projects', element: <Projects />},
    {path: 'projects/:projectId', element: <ProjectPhase />},
    {path: 'projects/:projectId/phases/:phaseId/:tab', element: <ProjectPhase />},
    ...NAV.filter(n => !['dashboard', 'projects'].includes(n.id)).map(n => ({path: n.id, element: <Placeholder item={n} />}))
  ]
}]);
