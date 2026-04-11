import { StrictMode, Suspense } from 'react';
import { createRoot } from 'react-dom/client';
import ErrorBoundary from './components/common/ErrorBoundary';
import './lib/i18n';
import './index.css';
import App from './App';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ErrorBoundary>
      <Suspense fallback={<div className="flex items-center justify-center min-h-screen text-lg">Loading...</div>}>
        <App />
      </Suspense>
    </ErrorBoundary>
  </StrictMode>,
);
