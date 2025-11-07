import { supabase } from './supabase';

/**
 * Rota para verificar conectividade com o servidor
 * Utilizado pelo componente NetworkStatusChecker
 */
export async function pingServer() {
  try {
    // Verifica a conexão com o Supabase usando a função auth
    // Esta é uma chamada leve que não requer tabelas ou permissões especiais
    const { data, error } = await supabase.auth.getSession();
    
    if (error) {
      console.error('Erro ao fazer ping no servidor:', error);
      return { 
        status: 'error', 
        message: 'Falha na conexão com o servidor',
        timestamp: new Date().toISOString()
      };
    }
    
    return { 
      status: 'ok', 
      message: 'Conexão com o servidor estabelecida',
      timestamp: new Date().toISOString(),
      connected: true
    };
  } catch (error) {
    console.error('Erro inesperado ao fazer ping no servidor:', error);
    return { 
      status: 'error', 
      message: 'Erro inesperado na conexão',
      timestamp: new Date().toISOString()
    };
  }
}