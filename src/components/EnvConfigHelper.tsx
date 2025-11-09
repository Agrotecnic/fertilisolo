import { useState } from 'react';

export default function EnvConfigHelper() {
  // ✅ SEGURANÇA: Usar variáveis de ambiente ao invés de valores hardcoded
  // As credenciais devem ser configuradas no arquivo .env.local
  const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || '';
  const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || '';
  
  const [showEnvFile, setShowEnvFile] = useState(false);
  const [copied, setCopied] = useState(false);

  // Só mostrar conteúdo se as variáveis estiverem configuradas
  const envFileContent = supabaseUrl && supabaseAnonKey 
    ? `VITE_SUPABASE_URL=${supabaseUrl}
VITE_SUPABASE_ANON_KEY=${supabaseAnonKey}`
    : `# Configure suas credenciais do Supabase abaixo:
# Obtenha-as em: https://app.supabase.com > Project Settings > API
VITE_SUPABASE_URL=https://seu-projeto.supabase.co
VITE_SUPABASE_ANON_KEY=sua_chave_anonima_aqui`;

  const copyToClipboard = () => {
    navigator.clipboard.writeText(envFileContent);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const downloadEnvFile = () => {
    const element = document.createElement('a');
    const file = new Blob([envFileContent], {type: 'text/plain'});
    element.href = URL.createObjectURL(file);
    element.download = '.env.local';
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
  };

  return (
    <div className="p-6 max-w-4xl mx-auto bg-white rounded-lg shadow-md">
      <h1 className="text-2xl font-bold mb-4">Configuração do Supabase</h1>
      
      <div className="mb-6">
        <p className="mb-4">
          Para que o aplicativo funcione corretamente, você precisa configurar as variáveis de ambiente do Supabase. 
          Siga as instruções abaixo:
        </p>
        
        <ol className="list-decimal pl-5 space-y-2">
          <li>Crie um arquivo chamado <code className="bg-gray-100 px-1 py-0.5 rounded">.env.local</code> na raiz do projeto</li>
          <li>Copie o conteúdo abaixo para o arquivo</li>
          <li>Reinicie o servidor de desenvolvimento</li>
        </ol>
      </div>
      
      <div className="flex mb-4">
        <button 
          onClick={() => setShowEnvFile(!showEnvFile)}
          className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 mr-2"
        >
          {showEnvFile ? 'Ocultar conteúdo' : 'Mostrar conteúdo do arquivo'}
        </button>
        
        <button 
          onClick={copyToClipboard}
          className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600 mr-2"
        >
          {copied ? '✓ Copiado!' : 'Copiar para área de transferência'}
        </button>
        
        <button 
          onClick={downloadEnvFile}
          className="px-4 py-2 bg-purple-500 text-white rounded hover:bg-purple-600"
        >
          Baixar arquivo .env.local
        </button>
      </div>
      
      {showEnvFile && (
        <div className="bg-gray-50 p-4 rounded border overflow-x-auto">
          <pre className="text-sm">{envFileContent}</pre>
        </div>
      )}
      
      {!supabaseUrl || !supabaseAnonKey ? (
        <div className="mt-8 p-4 bg-red-50 border border-red-200 rounded">
          <h3 className="font-semibold text-red-800 mb-2">⚠️ Variáveis de ambiente não configuradas</h3>
          <p className="text-red-800 mb-2">
            Para obter suas credenciais do Supabase:
          </p>
          <ol className="list-decimal pl-5 space-y-1 text-red-800">
            <li>Acesse <a href="https://app.supabase.com" target="_blank" rel="noopener noreferrer" className="text-blue-600 underline">https://app.supabase.com</a></li>
            <li>Selecione seu projeto</li>
            <li>Vá para <strong>Project Settings</strong> → <strong>API</strong></li>
            <li>Copie a <strong>URL</strong> e a <strong>anon/public key</strong></li>
            <li>Cole-as no arquivo .env.local seguindo o formato acima</li>
          </ol>
        </div>
      ) : (
        <div className="mt-8 p-4 bg-green-50 border border-green-200 rounded">
          <h3 className="font-semibold text-green-800 mb-2">✅ Variáveis de ambiente configuradas</h3>
          <p className="text-green-800">
            Suas credenciais estão sendo lidas das variáveis de ambiente. 
            Acesse <a href="/diagnostico" className="text-blue-600 underline">/diagnostico</a> para verificar se a conexão está funcionando.
          </p>
        </div>
      )}
      
      <div className="mt-4 p-4 bg-yellow-50 border border-yellow-200 rounded">
        <h3 className="font-semibold text-yellow-800 mb-2">🔒 Observações de segurança:</h3>
        <ul className="list-disc pl-5 space-y-1 text-yellow-800">
          <li><strong>NUNCA</strong> compartilhe suas chaves de API em repositórios públicos</li>
          <li>O arquivo <code className="bg-gray-100 px-1 py-0.5 rounded">.env.local</code> está no <code className="bg-gray-100 px-1 py-0.5 rounded">.gitignore</code> e não será commitado</li>
          <li>Em produção, configure as variáveis no seu provedor de hospedagem (Cloudflare Pages)</li>
          <li>Nunca hardcode credenciais diretamente no código-fonte</li>
        </ul>
      </div>
    </div>
  );
} 