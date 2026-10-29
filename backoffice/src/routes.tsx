import {createHashRouter, Navigate} from 'react-router';
import {Layout} from './Layout';
import {NAV} from './nav';
import {Placeholder} from './pages/Placeholder';
import {Projects} from './pages/Projects';
import {ProjectPhase} from './pages/ProjectPhase';

export const router = createHashRouter([{
  path: '/', element: <Layout />, children: [
    {index: true, element: <Navigate to="/projects" replace />},
    {path: 'projects', element: <Projects />},
    {path: 'projects/:projectId', element: <ProjectPhase />},
    {path: 'projects/:projectId/phases/:phaseId/:tab', element: <ProjectPhase />},
    ...NAV.filter(n => n.id !== 'projects').map(n => ({path: n.id, element: <Placeholder item={n} />}))
  ]
}]);
