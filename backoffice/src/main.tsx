import {createRoot} from 'react-dom/client';
import {RouterProvider} from 'react-router';
import {AppProvider} from 'govocal-ds';
import {router} from './routes';
import 'govocal-ds/tokens.css';
import './layout.css';
// The App provider renders the one Toast region (pages call toast()), draws Lucide icons at the system's 1.75 and sets
// the locale every date and number follows: the demo platform's language, British English (index.html's lang).
createRoot(document.getElementById('root')!).render(<AppProvider locale="en-GB"><RouterProvider router={router} /></AppProvider>);
