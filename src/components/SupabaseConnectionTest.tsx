import { useState } from 'react';
import { supabase, getCrops, getFertilizerSources } from '@/lib/supabase';
import { SUPABASE_URL, SUPABASE_ANON_KEY } from '@/lib/env';

export default function SupabaseConnectionTest() {
  const [testResults, setTestResults] = useState<{[key: string]: {success: boolean, message: string}}>({});
  const [loading, setLoading] = useState(false);

  const runAllTests = async () => {
    setLoading(true);
    setTestResults({});

    // Teste 1: Verificar se as variáveis de ambiente estão configuradas
    const envTest = {
      success: SUPABASE_URL !== 'https://example.supabase.co' && SUPABASE_ANON_KEY !== 'sua_chave_anonima_aqui',
      message: SUPABASE_URL !== 'https://example.supabase.co' && SUPABASE_ANON_KEY !== 'sua_chave_anonima_aqui' 
        ? 'Variáveis de ambiente configuradas corretamente'
        : 'Variáveis de ambiente não configuradas'
    };
    setTestResults(prev => ({ ...prev, 'env': envTest }));

    // Teste 2: Verificar conexão básica com o Supabase
    try {
      const { data, error } = await supabase.auth.getSession();
      const connectionTest = {
        success: !error,
        message: error ? `Erro de conexão: ${error.message}` : 'Conexão estabelecida com sucesso'
      };
      setTestResults(prev => ({ ...prev, 'connection': connectionTest }));
    } catch (error: any) {
      setTestResults(prev => ({ 
        ...prev, 
        'connection': {
          success: false,
          message: `Erro ao testar conexão: ${error.message}`
        }
      }));
    }

    // Teste 3: Verificar acesso às culturas
    try {
      const { data, error } = await getCrops();
      const cropsTest = {
        success: !error && Array.isArray(data) && data.length > 0,
        message: error 
          ? `Erro ao buscar culturas: ${error.message}` 
          : Array.isArray(data) && data.length > 0
            ? `Sucesso: ${data.length} culturas encontradas` 
            : 'Nenhuma cultura encontrada'
      };
      setTestResults(prev => ({ ...prev, 'crops': cropsTest }));
    } catch (error: any) {
      setTestResults(prev => ({ 
        ...prev, 
        'crops': {
          success: false,
          message: `Erro ao buscar culturas: ${error.message}`
        }
      }));
    }

    // Teste 4: Verificar acesso aos fertilizantes
    try {
      const { data, error } = await getFertilizerSources();
      const fertilizersTest = {
        success: !error && Array.isArray(data) && data.length > 0,
        message: error 
          ? `Erro ao buscar fertilizantes: ${error.message}` 
          : Array.isArray(data) && data.length > 0
            ? `Sucesso: ${data.length} fertilizantes encontrados` 
            : 'Nenhum fertilizante encontrado'
      };
      setTestResults(prev => ({ ...prev, 'fertilizers': fertilizersTest }));
    } catch (error: any) {
      setTestResults(prev => ({ 
        ...prev, 
        'fertilizers': {
          success: false,
          message: `Erro ao buscar fertilizantes: ${error.message}`
        }
      }));
    }

    // Teste 5: Verificar acesso direto à tabela de culturas
    try {
      const { data, error } = await supabase.from('crops').select('*').limit(1);
      const directAccessTest = {
        success: !error,
        message: error 
          ? `Erro ao acessar tabela diretamente: ${error.message}` 
          : 'Acesso direto às tabelas está funcionando'
      };
      setTestResults(prev => ({ ...prev, 'directAccess': directAccessTest }));
    } catch (error: any) {
      setTestResults(prev => ({ 
        ...prev, 
        'directAccess': {
          success: false,
          message: `Erro ao acessar tabela diretamente: ${error.message}`
        }
      }));
    }

    // Teste 6: Verificar configuração RPC
    try {
      const { data, error } = await supabase.rpc('get_crops');
      const rpcTest = {
        success: !error,
        message: error 
          ? `Erro ao chamar função RPC: ${error.message}` 
          : 'Função RPC está funcionando'
      };
      setTestResults(prev => ({ ...prev, 'rpc': rpcTest }));
    } catch (error: any) {
      setTestResults(prev => ({ 
        ...prev, 
        'rpc': {
          success: false,
          message: `Erro ao chamar função RPC: ${error.message}`
        }
      }));
    }

    setLoading(false);
  };

  return (
    <div className="p-4 max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold mb-4">Diagnóstico de Conexão com o Supabase</h1>
      
      <div className="mb-6">
        <h2 className="text-lg font-semibold mb-2">Configuração Atual</h2>
        <div className="bg-gray-50 p-4 rounded border">
          <p><strong>URL:</strong> {SUPABASE_URL}</p>
          <p><strong>Chave Anônima:</strong> {SUPABASE_ANON_KEY.substring(0, 10)}...{SUPABASE_ANON_KEY.substring(SUPABASE_ANON_KEY.length - 5)}</p>
        </div>
      </div>
      
      <button 
        onClick={runAllTests}
        disabled={loading}
        className="mb-6 px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 disabled:bg-gray-400"
      >
        {loading ? 'Executando testes...' : 'Executar testes de diagnóstico'}
      </button>
      
      {Object.entries(testResults).length > 0 && (
        <div className="space-y-4">
          <h2 className="text-lg font-semibold">Resultados dos testes</h2>
          
          {Object.entries(testResults).map(([testName, result]) => (
            <div 
              key={testName}
              className={`p-3 rounded border ${result.success ? 'bg-green-50 border-green-200' : 'bg-red-50 border-red-200'}`}
            >
              <h3 className="font-medium">
                {testName === 'env' && 'Variáveis de ambiente'}
                {testName === 'connection' && 'Conexão com Supabase'}
                {testName === 'crops' && 'Acesso às culturas'}
                {testName === 'fertilizers' && 'Acesso aos fertilizantes'}
                {testName === 'directAccess' && 'Acesso direto às tabelas'}
                {testName === 'rpc' && 'Funções RPC'}
              </h3>
              <p className={result.success ? 'text-green-700' : 'text-red-700'}>
                {result.message}
              </p>
            </div>
          ))}
          
          {Object.values(testResults).some(result => !result.success) && (
            <div className="mt-6 p-4 bg-yellow-50 border border-yellow-200 rounded">
              <h3 className="font-semibold text-yellow-800">Recomendações para solucionar problemas:</h3>
              <ul className="list-disc pl-5 mt-2 space-y-1 text-yellow-800">
                <li>Verifique se as variáveis de ambiente VITE_SUPABASE_URL e VITE_SUPABASE_ANON_KEY estão configuradas corretamente</li>
                <li>Certifique-se de que o servidor Supabase está ativo e acessível</li>
                <li>Verifique se as políticas de acesso (RLS) estão configuradas para permitir acesso anônimo às tabelas de referência</li>
                <li>Tente reiniciar a aplicação após atualizar as variáveis de ambiente</li>
                <li>Verifique se as funções RPC get_crops e get_fertilizer_sources foram criadas no banco de dados</li>
              </ul>
            </div>
          )}
        </div>
      )}
    </div>
  );
} 