import {createRoot} from 'react-dom/client';
import {RouterProvider} from 'react-router';
import {LucideProvider} from 'lucide-react';
import {router} from './routes';
import 'govocal-ds/tokens.css';
import './layout.css';
// Figma and the prototype draw icons at 1.75 (Lucide's default is 2); an explicit strokeWidth still wins.
createRoot(document.getElementById('root')!).render(<LucideProvider strokeWidth={1.75}><RouterProvider router={router} /></LucideProvider>);
