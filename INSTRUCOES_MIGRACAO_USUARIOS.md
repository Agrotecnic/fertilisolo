# Instruções para Aplicar a Migração - Exibição de Nomes de Usuários

## O que foi alterado?

A seção de **Gerenciamento de Usuários** agora exibe o **nome** e **email** dos usuários ao invés de apenas mostrar o ID.

## Arquivos Modificados

1. **src/lib/organizationServices.ts** - Função `getOrganizationMembers()` atualizada para buscar dados dos usuários
2. **src/components/admin/UserManagement.tsx** - Interface e tabela atualizadas para exibir nome e email
3. **supabase/migrations/add_get_organization_members_function.sql** - Nova função SQL no banco de dados

## Como Aplicar a Migração

### Opção 1: Via Supabase Dashboard (Recomendado)

1. Acesse o [Supabase Dashboard](https://app.supabase.com)
2. Selecione seu projeto
3. No menu lateral, clique em **SQL Editor**
4. Clique em **New Query**
5. Copie todo o conteúdo do arquivo `supabase/migrations/add_get_organization_members_function.sql`
6. Cole no editor SQL
7. Clique em **Run** para executar a migração

### Opção 2: Via Supabase CLI

Se você tem o Supabase CLI instalado:

```bash
# Navegue até o diretório do projeto
cd /Users/deyvidbueno/Documents/AppDev/fertilisolo

# Execute a migração
supabase db push

# Ou aplique o arquivo específico
psql -h <seu-host> -U postgres -d postgres -f supabase/migrations/add_get_organization_members_function.sql
```

## O que a migração faz?

A migração cria uma função SQL chamada `get_organization_members_with_details` que:

- Busca todos os membros de uma organização
- Faz JOIN com a tabela `auth.users` para obter email e nome
- Retorna os dados completos incluindo:
  - ID do membro
  - ID do usuário
  - Função (role)
  - Data de criação
  - Email
  - Nome (usa full_name, name dos metadados, ou parte do email como fallback)

## Testando a Alteração

Após aplicar a migração:

1. Faça login no sistema
2. Acesse a página de **Configurações** ou **Administração**
3. Vá para a seção **Gerenciamento de Usuários**
4. Verifique se a tabela agora mostra:
   - Coluna "Nome" com o nome do usuário
   - Coluna "Email" com o email do usuário
   - As outras colunas (Função, Data de Adição, Ações) permanecem as mesmas

## Fallback

Se a migração não for aplicada ou houver algum erro, o sistema ainda funcionará, mas:
- Para o usuário atual logado: mostrará seu próprio nome e email corretamente
- Para outros usuários: mostrará um identificador baseado no ID (ex: "Usuário 12345678")

## Suporte

Se encontrar algum problema:
1. Verifique se a migração foi executada com sucesso
2. Verifique os logs do Supabase
3. Certifique-se de que as políticas RLS (Row Level Security) permitem acesso à tabela auth.users

