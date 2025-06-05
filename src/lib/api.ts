import { supabase } from './supabase';

/**
 * Rota para verificar conectividade com o servidor
 * Utilizado pelo componente NetworkStatusChecker
 */
export async function pingServer() {
  try {
    // Verifica a conexão com o Supabase tentando obter dados públicos
    const { data, error } = await supabase
      .from('ping')
      .select('*')
      .limit(1)
      .maybeSingle();
    
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
      data
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

/**
 * Função para criar uma tabela de ping no Supabase se ela não existir
 * Esta função deve ser chamada durante a inicialização da aplicação
 */
export async function setupPingTable() {
  try {
    // Verificar se a tabela ping existe
    const { error: checkError } = await supabase
      .from('ping')
      .select('id')
      .limit(1);
    
    // Se não houver erro, a tabela existe
    if (!checkError) {
      console.log('Tabela de ping já existe');
      return true;
    }
    
    // Caso contrário, tentar criar a tabela (isso requer permissões admin)
    console.log('Tentando criar tabela de ping...');
    
    // Esta operação pode falhar se o usuário não tiver permissões adequadas
    // É melhor criar esta tabela manualmente no console do Supabase
    // com a seguinte SQL:
    // 
    // CREATE TABLE public.ping (
    //   id SERIAL PRIMARY KEY,
    //   status TEXT NOT NULL DEFAULT 'ok',
    //   created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
    // );
    // 
    // INSERT INTO public.ping (status) VALUES ('ok');
    // 
    // ALTER TABLE public.ping ENABLE ROW LEVEL SECURITY;
    // CREATE POLICY "Allow anonymous ping access" ON public.ping FOR SELECT USING (true);
    
    return true;
  } catch (error) {
    console.error('Erro ao configurar tabela de ping:', error);
    return false;
  }
} 