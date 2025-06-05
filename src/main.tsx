import { createRoot } from 'react-dom/client'
import App from './App.tsx'
import './index.css'
import { MantineProvider } from './providers/MantineProvider'
import { registerServiceWorker } from './pwa'
import { setupPingTable } from './lib/api.ts'

// Registra o service worker para funcionalidade offline
registerServiceWorker();

// Tentar configurar a tabela de ping para checagem de conectividade
setupPingTable().catch(error => {
  console.warn('Não foi possível configurar a tabela de ping:', error);
  console.warn('A verificação de conectividade pode falhar. Crie manualmente a tabela no Supabase.');
});

createRoot(document.getElementById("root")!).render(
  <MantineProvider>
    <App />
  </MantineProvider>
);
