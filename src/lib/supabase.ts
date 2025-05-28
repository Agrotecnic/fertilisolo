import { createClient } from '@supabase/supabase-js';
import { SUPABASE_URL, SUPABASE_ANON_KEY } from './env';

// Cria o cliente apenas se as credenciais forem URLs válidas
const isValidUrl = (url: string) => {
  try {
    new URL(url);
    return true;
  } catch (e) {
    return false;
  }
};

// Verifica se as credenciais existem e são válidas
const hasValidCredentials = isValidUrl(SUPABASE_URL) && SUPABASE_ANON_KEY.length > 0;

// Configurações adicionais para o cliente Supabase
const supabaseOptions = {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true
  }
};

// Cria o cliente se as credenciais forem válidas, ou cria um mock que lança erros quando usado
export const supabase = hasValidCredentials 
  ? createClient(SUPABASE_URL, SUPABASE_ANON_KEY, supabaseOptions)
  : createClientMock();

// Cliente mock para evitar erros quando as credenciais não estão disponíveis
function createClientMock() {
  const errorMsg = 'Credenciais do Supabase inválidas. Configure VITE_SUPABASE_URL e VITE_SUPABASE_ANON_KEY.';
  
  return {
    auth: {
      getSession: () => Promise.resolve({ data: { session: null }, error: new Error(errorMsg) }),
      signInWithPassword: () => Promise.resolve({ data: null, error: new Error(errorMsg) }),
      signUp: () => Promise.resolve({ data: null, error: new Error(errorMsg) }),
      signOut: () => {
        console.log('Mock signOut chamado');
        return Promise.resolve({ error: null });
      },
      onAuthStateChange: () => ({ data: { subscription: { unsubscribe: () => {} } } })
    }
  } as any;
}

export type UserType = 'admin' | 'agronomist' | 'technician' | 'farmer';

export interface UserMetadata {
  userType: UserType;
} 