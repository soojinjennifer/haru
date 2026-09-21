import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';

import { AppErrorBoundary } from './app/error/AppErrorBoundary';
import { AppProviders } from './app/providers/AppProviders';
import { AppRouter } from './app/router';
import './styles/index.css';

const container = document.getElementById('root');

if (container === null) {
  throw new Error('Root container #root was not found in index.html');
}

createRoot(container).render(
  <StrictMode>
    <AppErrorBoundary>
      <AppProviders>
        <AppRouter />
      </AppProviders>
    </AppErrorBoundary>
  </StrictMode>,
);
