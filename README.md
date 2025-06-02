# Welcome to your Lovable project

## Project info

**URL**: https://lovable.dev/projects/3aa49f36-4be6-4463-b3ae-3f005f7eca73

## Como configurar o ambiente

Para que o projeto funcione corretamente, você precisa configurar as seguintes variáveis de ambiente:

### Variáveis de ambiente necessárias

Crie um arquivo `.env.local` na raiz do projeto com as seguintes variáveis:

```
# Supabase - API credentials
VITE_SUPABASE_URL=https://your-project-id.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key
```

Você pode obter essas credenciais no painel do Supabase:
1. Acesse https://app.supabase.com
2. Selecione seu projeto
3. Vá para Project Settings > API
4. Copie a URL e a Anon Key para seu arquivo .env.local

### Segurança

Nunca compartilhe suas chaves de API ou credenciais. Certifique-se de que:
- O arquivo `.env.local` está no `.gitignore` para não ser versionado
- Não há credenciais reais codificadas diretamente no código-fonte
- Ao fazer deploy no Cloudflare Pages, configure as variáveis de ambiente no painel de controle do Cloudflare

## How can I edit this code?

There are several ways of editing your application.

**Use Lovable**

Simply visit the [Lovable Project](https://lovable.dev/projects/3aa49f36-4be6-4463-b3ae-3f005f7eca73) and start prompting.

Changes made via Lovable will be committed automatically to this repo.

**Use your preferred IDE**

If you want to work locally using your own IDE, you can clone this repo and push changes. Pushed changes will also be reflected in Lovable.

The only requirement is having Node.js & npm installed - [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating)

Follow these steps:

```sh
# Step 1: Clone the repository using the project's Git URL.
git clone <YOUR_GIT_URL>

# Step 2: Navigate to the project directory.
cd <YOUR_PROJECT_NAME>

# Step 3: Install the necessary dependencies.
npm i

# Step 4: Configure your .env.local file with the Supabase credentials

# Step 5: Start the development server with auto-reloading and an instant preview.
npm run dev
```

**Edit a file directly in GitHub**

- Navigate to the desired file(s).
- Click the "Edit" button (pencil icon) at the top right of the file view.
- Make your changes and commit the changes.

**Use GitHub Codespaces**

- Navigate to the main page of your repository.
- Click on the "Code" button (green button) near the top right.
- Select the "Codespaces" tab.
- Click on "New codespace" to launch a new Codespace environment.
- Edit files directly within the Codespace and commit and push your changes once you're done.

## What technologies are used for this project?

This project is built with:

- Vite
- TypeScript
- React
- shadcn-ui
- Tailwind CSS
- Supabase (autenticação e backend)

## How can I deploy this project?

Simply open [Lovable](https://lovable.dev/projects/3aa49f36-4be6-4463-b3ae-3f005f7eca73) and click on Share -> Publish.

Para o deploy no Cloudflare Pages, siga as instruções em [README-CF-DEPLOY.md](README-CF-DEPLOY.md) e certifique-se de configurar as variáveis de ambiente corretamente no painel do Cloudflare.

## Can I connect a custom domain to my Lovable project?

Yes, you can!

To connect a domain, navigate to Project > Settings > Domains and click Connect Domain.

Read more here: [Setting up a custom domain](https://docs.lovable.dev/tips-tricks/custom-domain#step-by-step-guide)
