// Endpoint simples para verificar se o servidor está respondendo
// Usado pelo NetworkStatusChecker para verificar a conectividade

export function onRequest(context) {
  // Lista de origens permitidas
  const allowedOrigins = [
    'https://fertilisolo.pages.dev',
    'https://*.fertilisolo.pages.dev', // Preview deployments
    'http://localhost:8080', // Desenvolvimento local
    'http://localhost:5173', // Vite dev server alternativo
  ];
  
  // Obter origem da requisição
  const requestOrigin = context.request.headers.get('Origin');
  
  // Verificar se a origem está na lista permitida
  let allowedOrigin = null;
  if (requestOrigin) {
    // Verificar correspondência exata
    if (allowedOrigins.includes(requestOrigin)) {
      allowedOrigin = requestOrigin;
    } else {
      // Verificar padrões com wildcard
      for (const pattern of allowedOrigins) {
        if (pattern.includes('*')) {
          const regex = new RegExp('^' + pattern.replace(/\*/g, '.*') + '$');
          if (regex.test(requestOrigin)) {
            allowedOrigin = requestOrigin;
            break;
          }
        }
      }
    }
  }
  
  // Se não houver origem na requisição ou não estiver permitida, usar domínio padrão
  const finalOrigin = allowedOrigin || 'https://fertilisolo.pages.dev';
  
  return new Response(
    JSON.stringify({
      status: 'ok',
      message: 'API endpoint is responding',
      timestamp: new Date().toISOString()
    }),
    {
      headers: {
        'Content-Type': 'application/json',
        'Cache-Control': 'no-cache, no-store, must-revalidate',
        'Access-Control-Allow-Origin': finalOrigin,
        'Access-Control-Allow-Methods': 'GET, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type',
        'Access-Control-Max-Age': '86400', // 24 horas
      },
    }
  );
} 