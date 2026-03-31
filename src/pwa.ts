import { registerSW } from 'virtual:pwa-register';

// Função para registrar o service worker
export function registerServiceWorker() {
  if ('serviceWorker' in navigator) {
    const updateSW = registerSW({
      onNeedRefresh() {
        // Exibe um prompt perguntando se o usuário deseja atualizar para a nova versão
        if (confirm('Uma nova versão está disponível. Deseja atualizar?')) {
          updateSW(true);
        }
      },
      onOfflineReady() {
        // Notifica o usuário que o app está pronto para uso offline
        console.log('Aplicativo pronto para uso offline!');
        
        // Cria uma notificação para informar ao usuário
        if ('Notification' in window && Notification.permission === 'granted') {
          new Notification('FertiliSolo', {
            body: 'Aplicativo pronto para uso offline!',
            icon: '/icone-fertilisolo.svg'
          });
        }
      },
    });
  }
} 