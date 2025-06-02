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
  },
  db: {
    schema: 'public'
  },
  global: {
    headers: { 'x-application-name': 'fertilisolo' }
  }
};

// Cria o cliente se as credenciais forem válidas, ou cria um mock que lança erros quando usado
export const supabase = hasValidCredentials 
  ? createClient(SUPABASE_URL, SUPABASE_ANON_KEY, supabaseOptions)
  : createClientMock();

// Funções para acessar dados de referência sem autenticação
export async function getCrops() {
  if (!hasValidCredentials) {
    console.error('Credenciais do Supabase inválidas.');
    return { data: [], error: new Error('Credenciais inválidas') };
  }
  
  try {
    // Primeiro tenta usar a função RPC que criamos
    const { data: rpcData, error: rpcError } = await supabase.rpc('get_crops');
    
    if (!rpcError && rpcData) {
      return { data: rpcData, error: null };
    }
    
    // Se falhar, tenta acessar diretamente a tabela (política pública)
    console.log('Função RPC falhou, tentando acesso direto à tabela');
    return await supabase.from('crops').select('*');
  } catch (error) {
    console.error('Erro ao buscar culturas:', error);
    return { data: [], error };
  }
}

export async function getFertilizerSources() {
  if (!hasValidCredentials) {
    console.error('Credenciais do Supabase inválidas.');
    return { data: [], error: new Error('Credenciais inválidas') };
  }
  
  try {
    // Primeiro tenta usar a função RPC que criamos
    const { data: rpcData, error: rpcError } = await supabase.rpc('get_fertilizer_sources');
    
    if (!rpcError && rpcData) {
      return { data: rpcData, error: null };
    }
    
    // Se falhar, tenta acessar diretamente a tabela (política pública)
    console.log('Função RPC falhou, tentando acesso direto à tabela');
    return await supabase.from('fertilizer_sources').select('*');
  } catch (error) {
    console.error('Erro ao buscar fertilizantes:', error);
    return { data: [], error };
  }
}

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
    },
    from: () => ({
      select: () => Promise.resolve({ data: null, error: new Error(errorMsg) }),
      insert: () => Promise.resolve({ data: null, error: new Error(errorMsg) }),
      update: () => Promise.resolve({ data: null, error: new Error(errorMsg) }),
      delete: () => Promise.resolve({ data: null, error: new Error(errorMsg) }),
    }),
    rpc: () => Promise.resolve({ data: null, error: new Error(errorMsg) })
  } as any;
}

export type UserType = 'admin' | 'agronomist' | 'technician' | 'farmer';

export interface UserMetadata {
  userType: UserType;
} 