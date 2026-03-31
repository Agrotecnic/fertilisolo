// Configurações de ambiente
export const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL || 'https://example.supabase.co';
export const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY || 'sua_chave_anonima_aqui';

// Debug das variáveis de ambiente - APENAS em desenvolvimento
if (import.meta.env.DEV) {
  console.log('Variáveis de ambiente carregadas:');
  console.log('VITE_SUPABASE_URL:', import.meta.env.VITE_SUPABASE_URL ? 'Configurada' : 'Não configurada');
  console.log('VITE_SUPABASE_ANON_KEY:', import.meta.env.VITE_SUPABASE_ANON_KEY ? 'Configurada' : 'Não configurada');
} 