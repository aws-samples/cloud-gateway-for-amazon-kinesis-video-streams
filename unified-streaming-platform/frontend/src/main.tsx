import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import '@cloudscape-design/global-styles/index.css'
import './index.css'
import { AuthProvider } from './contexts/AuthContext'
import AuthenticatedApp from './components/auth/AuthenticatedApp'
import { configUtils } from './config/app-config';

// Log configuration status in development
if (import.meta.env.DEV) {
  configUtils.logConfigurationStatus();
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <AuthProvider>
      <AuthenticatedApp />
    </AuthProvider>
  </StrictMode>,
)
