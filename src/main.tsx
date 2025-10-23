import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'
import { ThemeProvider } from './contexts/ThemeContext'
import { registerServiceWorker } from './lib/notifications'

// Register service worker for notifications
if (import.meta.env.PROD) {
  registerServiceWorker().catch((error) => {
    console.error('Failed to register service worker:', error);
  });
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ThemeProvider>
      <App />
    </ThemeProvider>
  </StrictMode>,
)
