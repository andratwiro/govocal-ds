import {createRoot} from 'react-dom/client';
import {RouterProvider} from 'react-router';
import {router} from './routes';
import '../../src/tokens.css';
import '../../src/components/theme.css';
import './layout.css';
createRoot(document.getElementById('root')!).render(<RouterProvider router={router} />);
