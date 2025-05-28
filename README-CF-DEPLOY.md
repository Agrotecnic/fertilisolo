# Deploy para Cloudflare Pages

Este documento contém instruções para fazer o deploy do aplicativo Fertilisolo no Cloudflare Pages.

## Requisitos

- Conta no Cloudflare
- Node.js e npm instalados

## Passos para Deploy Manual

1. **Preparar o Build**

   ```bash
   # Instale as dependências
   npm install
   
   # Faça o build do projeto
   npm run build
   
   # Copie o arquivo de rotas para a pasta dist
   cp _routes.json dist/
   ```

2. **Login no Cloudflare**

   ```bash
   npx wrangler login
   ```

   Isso abrirá uma janela do navegador para autenticar sua conta Cloudflare.

3. **Deploy para o Cloudflare Pages**

   ```bash
   npx wrangler pages deploy dist --project-name fertilisolo
   ```

   Se for a primeira vez, você precisará criar um novo projeto quando solicitado.

## Deploy Automatizado

Para simplificar o processo, você pode usar o script definido no package.json:

```bash
npm run pages:deploy
```

Este comando executa o build e faz o deploy em uma única etapa.

## Configuração de Variáveis de Ambiente

O Supabase requer as seguintes variáveis de ambiente no Cloudflare:

- `VITE_SUPABASE_URL`: URL do seu projeto Supabase
- `VITE_SUPABASE_ANON_KEY`: Chave anônima do Supabase

Você pode configurá-las no painel do Cloudflare Pages:

1. Acesse seu projeto no dashboard do Cloudflare Pages
2. Vá para Settings > Environment variables
3. Adicione as variáveis necessárias

## Solução de Problemas

Se você encontrar problemas com o roteamento do SPA (Single Page Application), verifique se:

1. O arquivo `_routes.json` foi copiado para a pasta dist
2. O arquivo `_redirects` existe na pasta dist com o conteúdo: `/* /index.html 200`

## Links Úteis

- [Documentação do Cloudflare Pages](https://developers.cloudflare.com/pages/)
- [Documentação do Wrangler](https://developers.cloudflare.com/workers/wrangler/)