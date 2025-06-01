import { createRoot } from 'react-dom/client'
import App from './App.tsx'
import './index.css'
import { MantineProvider } from './providers/MantineProvider'
import { registerServiceWorker } from './pwa'

// Registra o service worker para funcionalidade offline
registerServiceWorker();

createRoot(document.getElementById("root")!).render(
  <MantineProvider>
    <App />
  </MantineProvider>
);
