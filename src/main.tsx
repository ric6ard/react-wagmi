import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import App from './App'
import { AppKitProvider } from './components/AppkitProvider'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <AppKitProvider>
      <App />
    </AppKitProvider>
  </StrictMode>
)
