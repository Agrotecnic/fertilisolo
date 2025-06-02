import { useState } from 'react';

export default function EnvConfigHelper() {
  const supabaseUrl = 'https://crtdfzqejhkccglatcmc.supabase.co';
  const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNydGRmenFlamhrY2NnbGF0Y21jIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDgzOTMzNjAsImV4cCI6MjA2Mzk2OTM2MH0.XCCbyz6BQYQl2mBFizzmidI6SSiuFdiiSF3zFUYQC0w';
  
  const [showEnvFile, setShowEnvFile] = useState(false);
  const [copied, setCopied] = useState(false);

  const envFileContent = `VITE_SUPABASE_URL=${supabaseUrl}
VITE_SUPABASE_ANON_KEY=${supabaseAnonKey}`;

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
      
      <div className="mt-8 p-4 bg-yellow-50 border border-yellow-200 rounded">
        <h3 className="font-semibold text-yellow-800 mb-2">Observações importantes:</h3>
        <ul className="list-disc pl-5 space-y-1 text-yellow-800">
          <li>Nunca compartilhe suas chaves de API em repositórios públicos</li>
          <li>Em produção, essas variáveis devem ser configuradas no seu provedor de hospedagem</li>
          <li>Após configurar as variáveis, acesse <a href="/diagnostico" className="text-blue-600 underline">/diagnostico</a> para verificar se a conexão está funcionando</li>
        </ul>
      </div>
    </div>
  );
} 