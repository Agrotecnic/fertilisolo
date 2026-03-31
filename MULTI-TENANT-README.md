# 🎨 Sistema Multi-Tenant - FertiliSolo

Sistema de personalização white-label que permite que empresas tenham suas próprias cores e logotipo na aplicação FertiliSolo.

## 📋 Índice

- [Visão Geral](#visão-geral)
- [Instalação e Configuração](#instalação-e-configuração)
- [Estrutura do Banco de Dados](#estrutura-do-banco-de-dados)
- [Guia do Administrador](#guia-do-administrador)
- [Guia do Desenvolvedor](#guia-do-desenvolvedor)
- [API e Serviços](#api-e-serviços)
- [Solução de Problemas](#solução-de-problemas)

---

## 🎯 Visão Geral

O sistema multi-tenant permite que múltiplas organizações usem o FertiliSolo com suas próprias personalizações:

- **Cores personalizadas**: Paleta completa de cores (primária, secundária, destaque, etc)
- **Logo personalizado**: Upload e exibição de logo próprio
- **Gerenciamento de usuários**: Controle de quem pertence a cada organização
- **Segurança**: Row Level Security (RLS) no Supabase
- **Tempo real**: Alterações aplicadas imediatamente

### Hierarquia de Permissões

| Função | Permissões |
|--------|-----------|
| **Owner** (Proprietário) | Controle total: gerenciar tema, logo, adicionar/remover admins e membros |
| **Admin** (Administrador) | Gerenciar tema, logo e adicionar membros |
| **Member** (Membro) | Apenas usar a aplicação com o tema personalizado |

---

## 🚀 Instalação e Configuração

### 1. Aplicar Migrations do Banco de Dados

Execute a migration SQL no seu projeto Supabase:

```bash
# Via Supabase CLI
supabase migration up

# Ou execute manualmente o arquivo:
# supabase/migrations/001_create_organizations.sql
```

### 2. Criar Bucket de Storage

No Supabase Dashboard:

1. Vá em **Storage** → **Create Bucket**
2. Nome: `organization-assets`
3. **Public bucket**: ✅ (marcado)
4. Salvar

### 3. Configurar Políticas do Storage

Execute no SQL Editor do Supabase:

```sql
-- Permitir upload de logos para admins/owners
CREATE POLICY "Admins can upload logos"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'organization-assets' 
  AND auth.uid() IN (
    SELECT user_id FROM user_organizations 
    WHERE role IN ('admin', 'owner')
  )
);

-- Permitir leitura pública dos logos
CREATE POLICY "Public can view logos"
ON storage.objects FOR SELECT
USING (bucket_id = 'organization-assets');

-- Permitir delete para admins/owners
CREATE POLICY "Admins can delete logos"
ON storage.objects FOR DELETE
USING (
  bucket_id = 'organization-assets' 
  AND auth.uid() IN (
    SELECT user_id FROM user_organizations 
    WHERE role IN ('admin', 'owner')
  )
);
```

### 4. Criar Primeira Organização (Manualmente)

Execute no SQL Editor para criar uma organização de teste:

```sql
-- 1. Criar organização
INSERT INTO organizations (name, slug, is_active) 
VALUES ('Minha Empresa', 'minha-empresa', true)
RETURNING id;

-- 2. Associar usuário como owner (substitua USER_ID e ORG_ID)
INSERT INTO user_organizations (user_id, organization_id, role)
VALUES (
  'USER_ID_AQUI',  -- Pegue do auth.users
  'ORG_ID_RETORNADO_ACIMA',
  'owner'
);

-- 3. Criar tema padrão
INSERT INTO organization_themes (organization_id)
VALUES ('ORG_ID_RETORNADO_ACIMA');
```

Para encontrar seu `USER_ID`:

```sql
SELECT id, email FROM auth.users;
```

---

## 🗄️ Estrutura do Banco de Dados

### Tabela: `organizations`

Armazena as organizações/empresas.

| Campo | Tipo | Descrição |
|-------|------|-----------|
| `id` | UUID | ID único da organização |
| `name` | TEXT | Nome da organização |
| `slug` | TEXT | Identificador único (URL-friendly) |
| `logo_url` | TEXT | URL do logo no Storage |
| `is_active` | BOOLEAN | Se está ativa |
| `created_at` | TIMESTAMP | Data de criação |
| `updated_at` | TIMESTAMP | Data de atualização |

### Tabela: `organization_themes`

Armazena os temas personalizados.

| Campo | Tipo | Descrição |
|-------|------|-----------|
| `id` | UUID | ID único do tema |
| `organization_id` | UUID | Referência à organização |
| `primary_color` | TEXT | Cor primária (hex) |
| `primary_foreground` | TEXT | Cor do texto sobre primária |
| `secondary_color` | TEXT | Cor secundária (hex) |
| `secondary_foreground` | TEXT | Cor do texto sobre secundária |
| `accent_color` | TEXT | Cor de destaque (hex) |
| `accent_foreground` | TEXT | Cor do texto sobre destaque |
| `background_color` | TEXT | Cor de fundo (hex) |
| `foreground_color` | TEXT | Cor do texto principal |
| `card_color` | TEXT | Cor dos cards |
| `card_foreground` | TEXT | Cor do texto nos cards |
| `border_color` | TEXT | Cor das bordas |
| `input_color` | TEXT | Cor dos inputs |
| `muted_color` | TEXT | Cor muted |
| `muted_foreground` | TEXT | Cor do texto muted |
| `border_radius` | TEXT | Raio de borda (ex: 0.5rem) |
| `font_family` | TEXT | Fonte personalizada |

### Tabela: `user_organizations`

Relaciona usuários com organizações.

| Campo | Tipo | Descrição |
|-------|------|-----------|
| `id` | UUID | ID único da relação |
| `user_id` | UUID | Referência ao usuário (auth.users) |
| `organization_id` | UUID | Referência à organização |
| `role` | TEXT | Função: owner, admin ou member |
| `created_at` | TIMESTAMP | Data de adição |

---

## 👨‍💼 Guia do Administrador

### Acessando o Painel Admin

1. Faça login na aplicação
2. Navegue para `/admin` ou clique no link "Administração" (se disponível)
3. Você precisa ser **Admin** ou **Owner** para acessar

### Personalizando o Tema

#### 1. Aba "Tema"

1. Acesse o painel admin → aba **Tema**
2. Escolha as cores em 4 categorias:
   - **Primárias**: Cor principal da aplicação
   - **Secundárias**: Cor secundária
   - **Destaque**: Para elementos importantes
   - **Outras**: Fundos, bordas, etc

3. Use o color picker visual ou digite o código hexadecimal
4. Clique em **Salvar Alterações**

**Dicas:**
- Use cores que contrastem bem entre si
- Teste a legibilidade do texto
- Mantenha uma paleta harmoniosa

#### 2. Aba "Logo"

1. Acesse o painel admin → aba **Logo**
2. Clique em **Enviar Logo**
3. Selecione sua imagem (PNG, JPG ou SVG)
4. O upload é automático

**Requisitos:**
- Formato: PNG, JPG ou SVG
- Tamanho máximo: 2MB
- Fundo transparente (PNG/SVG) recomendado

#### 3. Aba "Usuários"

1. Acesse o painel admin → aba **Usuários**
2. Clique em **Adicionar Usuário**
3. Digite o email e escolha a função
4. Clique em **Adicionar**

**Nota:** Sistema de convites por email ainda não implementado. Por enquanto, adicione usuários manualmente no banco.

### Gerenciando Membros

**Alterar Função:**
- Na lista de usuários, use o dropdown para mudar a função

**Remover Membro:**
- Clique no ícone de lixeira ao lado do usuário

---

## 👨‍💻 Guia do Desenvolvedor

### Arquitetura

```
src/
├── components/
│   ├── admin/                    # Componentes do painel admin
│   │   ├── ThemeEditor.tsx       # Editor de cores
│   │   ├── LogoUploader.tsx      # Upload de logo
│   │   └── UserManagement.tsx    # Gerenciar usuários
│   └── DynamicLogo.tsx           # Logo que muda por organização
├── hooks/
│   └── useOrganizationTheme.ts   # Hook para carregar tema
├── lib/
│   └── organizationServices.ts   # Serviços de API
├── pages/
│   └── AdminPanel.tsx            # Página do painel
├── providers/
│   └── ThemeProvider.tsx         # Provider de tema global
└── utils/
    └── colorConversions.ts       # Conversão hex ↔ HSL
```

### Usando o Hook useOrganizationTheme

```tsx
import { useOrganizationTheme } from '@/hooks/useOrganizationTheme';

function MyComponent() {
  const { theme, logo, organizationName, loading } = useOrganizationTheme();

  if (loading) return <div>Carregando tema...</div>;

  return (
    <div>
      <h1>{organizationName}</h1>
      {logo && <img src={logo} alt="Logo" />}
    </div>
  );
}
```

### Usando o Context de Tema

```tsx
import { useTheme } from '@/providers/ThemeProvider';

function MyComponent() {
  const { theme, logo, organizationId } = useTheme();

  return <div>Organização: {organizationId}</div>;
}
```

### Usando o Componente DynamicLogo

```tsx
import { DynamicLogo } from '@/components/DynamicLogo';

function Header() {
  return (
    <div>
      {/* Logo simples */}
      <DynamicLogo size="md" />

      {/* Logo com texto */}
      <DynamicLogoWithText 
        size="lg" 
        showText={true}
      />
    </div>
  );
}
```

### Serviços Disponíveis

```typescript
import {
  getUserOrganization,
  getUserOrganizationTheme,
  updateOrganizationTheme,
  uploadOrganizationLogo,
  getOrganizationMembers,
  addOrganizationMember,
  // ... etc
} from '@/lib/organizationServices';
```

---

## 🔧 API e Serviços

### Organizações

```typescript
// Buscar organização do usuário
const { data, error } = await getUserOrganization();

// Criar nova organização
const { data, error } = await createOrganization('Nome', 'slug');

// Atualizar organização
const { data, error } = await updateOrganization(orgId, { name: 'Novo Nome' });
```

### Temas

```typescript
// Buscar tema
const { data, error } = await getUserOrganizationTheme();

// Atualizar tema
const { data, error } = await updateOrganizationTheme(orgId, {
  primary_color: '#FF0000',
  secondary_color: '#00FF00'
});
```

### Upload de Logo

```typescript
// Upload
const file = event.target.files[0];
const { data, error } = await uploadOrganizationLogo(orgId, file);

// Remover
const { data, error } = await removeOrganizationLogo(orgId, logoUrl);
```

### Membros

```typescript
// Listar membros
const { data, error } = await getOrganizationMembers(orgId);

// Adicionar membro
const { data, error } = await addOrganizationMember(orgId, userId, 'member');

// Remover membro
const { data, error } = await removeOrganizationMember(userOrgId);

// Atualizar função
const { data, error } = await updateMemberRole(userOrgId, 'admin');
```

---

## 🔍 Solução de Problemas

### Tema não está aplicando

1. **Verifique se o usuário está associado a uma organização:**
   ```sql
   SELECT * FROM user_organizations WHERE user_id = 'SEU_USER_ID';
   ```

2. **Verifique se a organização tem um tema:**
   ```sql
   SELECT * FROM organization_themes WHERE organization_id = 'SEU_ORG_ID';
   ```

3. **Verifique o console do navegador** para erros de conversão de cores

### Logo não aparece

1. **Verifique se o bucket existe:**
   - Supabase Dashboard → Storage → `organization-assets`

2. **Verifique se o bucket é público:**
   - Settings do bucket → Public bucket ✅

3. **Verifique as políticas de storage:**
   ```sql
   SELECT * FROM storage.policies WHERE bucket_id = 'organization-assets';
   ```

### Usuário não tem permissão

1. **Verifique a função do usuário:**
   ```sql
   SELECT role FROM user_organizations 
   WHERE user_id = 'SEU_USER_ID' 
   AND organization_id = 'SEU_ORG_ID';
   ```

2. **Verifique as políticas RLS:**
   ```sql
   SELECT * FROM pg_policies WHERE tablename = 'organizations';
   ```

### Erro ao fazer upload

1. **Tamanho do arquivo**: Máximo 2MB
2. **Formato**: PNG, JPG ou SVG apenas
3. **Permissões**: Usuário precisa ser admin ou owner

---

## 📝 Checklist de Implantação

- [ ] Migrations aplicadas
- [ ] Bucket `organization-assets` criado
- [ ] Políticas de storage configuradas
- [ ] Primeira organização criada
- [ ] Pelo menos um owner configurado
- [ ] Tema padrão criado
- [ ] Testes de upload de logo
- [ ] Testes de alteração de cores
- [ ] Verificação de RLS funcionando

---

## 🎯 Próximos Passos

### Melhorias Futuras

1. **Sistema de Convites**
   - Enviar emails de convite
   - Usuário aceita/rejeita convite
   - Link de convite com token

2. **Múltiplas Organizações por Usuário**
   - Switcher de organização
   - Dashboard consolidado

3. **Temas Pré-definidos**
   - Templates de cores
   - Importar/exportar temas

4. **Personalização Avançada**
   - Favicon personalizado
   - Meta tags customizadas
   - CSS customizado

5. **Analytics por Organização**
   - Relatórios de uso
   - Estatísticas de membros

---

## 📞 Suporte

Para dúvidas ou problemas:

1. Verifique esta documentação
2. Consulte os logs do navegador (F12)
3. Verifique os logs do Supabase
4. Entre em contato com a equipe de desenvolvimento

---

## 📄 Licença

Este sistema faz parte do projeto FertiliSolo.

**Desenvolvido com ❤️ para facilitar a personalização white-label**

