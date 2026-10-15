import {StrictMode} from 'react';
import {createRoot} from 'react-dom/client';
import App from './App.tsx';
import './index.css';
import { sanitizeBrowserLocation, installSafeFetchInterceptor } from './utils/urlUtils';

// Sanitize URL bar and protect network requests from embedded credentials
sanitizeBrowserLocation();
installSafeFetchInterceptor();

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
