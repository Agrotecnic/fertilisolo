// Endpoint simples para verificar se o servidor está respondendo
// Usado pelo NetworkStatusChecker para verificar a conectividade

export function onRequest(context) {
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
        'Access-Control-Allow-Origin': '*',
      },
    }
  );
} 