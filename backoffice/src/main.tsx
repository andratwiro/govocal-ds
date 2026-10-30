import {createRoot} from 'react-dom/client';
import {RouterProvider} from 'react-router';
import {AppProvider} from 'govocal-ds';
import {router} from './routes';
import 'govocal-ds/tokens.css';
import './layout.css';
// The App provider renders the one Toast region (pages call toast()) and draws Lucide icons at the system's 1.75.
createRoot(document.getElementById('root')!).render(<AppProvider><RouterProvider router={router} /></AppProvider>);
