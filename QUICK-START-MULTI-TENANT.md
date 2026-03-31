# 🚀 Guia Rápido - Sistema Multi-Tenant

Um guia passo a passo para configurar e usar o sistema de personalização white-label.

## ⚡ Setup Inicial (5 minutos)

### 1. Aplicar Migration

```bash
# Via Supabase Dashboard > SQL Editor
# Cole o conteúdo de: supabase/migrations/001_create_organizations.sql
# E clique em "Run"
```

### 2. Criar Bucket de Storage

1. Acesse: **Supabase Dashboard** → **Storage** → **New bucket**
2. Nome: `organization-assets`
3. Marque: ✅ **Public bucket**
4. Clique em **Create bucket**

### 3. Criar Sua Primeira Organização

Execute no **SQL Editor** do Supabase:

```sql
-- Primeiro, pegue seu USER_ID
SELECT id, email FROM auth.users;

-- Copie o ID do seu usuário, depois execute:
WITH new_org AS (
  INSERT INTO organizations (name, slug, is_active) 
  VALUES ('Minha Empresa', 'minha-empresa', true)
  RETURNING id
)
INSERT INTO user_organizations (user_id, organization_id, role)
SELECT 
  'COLE_SEU_USER_ID_AQUI',  -- Substitua pelo ID copiado acima
  id,
  'owner'
FROM new_org;

-- Criar tema padrão
WITH new_org AS (
  SELECT id FROM organizations WHERE slug = 'minha-empresa'
)
INSERT INTO organization_themes (organization_id)
SELECT id FROM new_org;
```

### 4. Acessar o Painel Admin

1. Faça login na aplicação
2. Vá para: `http://localhost:5173/admin` (ou sua URL)
3. Pronto! 🎉

---

## 🎨 Personalizando o Tema (2 minutos)

### Opção 1: Via Interface

1. Acesse `/admin`
2. Aba **Tema**
3. Clique nos color pickers
4. Escolha suas cores
5. **Salvar Alterações**

### Opção 2: Via SQL (Mais Rápido)

```sql
-- Atualizar cores diretamente no banco
UPDATE organization_themes 
SET 
  primary_color = '#FF0000',      -- Sua cor primária
  secondary_color = '#0000FF',    -- Sua cor secundária
  accent_color = '#FFA500'        -- Sua cor de destaque
WHERE organization_id = (
  SELECT id FROM organizations WHERE slug = 'minha-empresa'
);
```

Recarregue a página e as cores já estarão aplicadas!

---

## 🖼️ Adicionando Logo (1 minuto)

1. Acesse `/admin`
2. Aba **Logo**
3. Clique em **Enviar Logo**
4. Selecione sua imagem (PNG, JPG ou SVG < 2MB)
5. Pronto! Logo atualizado automaticamente

---

## 👥 Adicionando Usuários

### Via SQL (Recomendado por enquanto)

```sql
-- Adicionar um usuário existente à sua organização
INSERT INTO user_organizations (user_id, organization_id, role)
VALUES (
  'USER_ID_DO_USUARIO',  -- ID do usuário a adicionar
  (SELECT id FROM organizations WHERE slug = 'minha-empresa'),
  'member'  -- Pode ser: member, admin ou owner
);
```

---

## 🔍 Testando

### Verificar se Funciona

1. **Teste de Tema:**
   - Login como usuário da organização
   - As cores devem estar aplicadas
   - Inspecione elementos (F12) e veja as variáveis CSS

2. **Teste de Logo:**
   - O logo deve aparecer no header
   - Deve ser o logo da sua organização, não o padrão

3. **Teste de Permissões:**
   - Login como `member`: não deve ver `/admin`
   - Login como `admin` ou `owner`: deve acessar `/admin`

---

## 🆘 Problemas Comuns

### "Acesso Negado" no /admin
**Causa:** Usuário não é admin/owner  
**Solução:**
```sql
UPDATE user_organizations 
SET role = 'admin' 
WHERE user_id = 'SEU_USER_ID';
```

### Tema não aplica
**Causa:** Usuário não está na organização  
**Solução:**
```sql
SELECT * FROM user_organizations WHERE user_id = 'SEU_USER_ID';
-- Se vazio, adicione o usuário (ver "Adicionando Usuários")
```

### Logo não aparece
**Causa:** Bucket não é público ou não existe  
**Solução:**
1. Storage → `organization-assets` → Settings
2. Marque: ✅ **Public bucket**

---

## 📋 Checklist Rápido

- [ ] Migration executada
- [ ] Bucket criado e público
- [ ] Organização criada
- [ ] Usuário owner configurado
- [ ] Consegue acessar `/admin`
- [ ] Alterou cores com sucesso
- [ ] Upload de logo funciona

---

## 🎯 Exemplo de Uso Completo

```typescript
// 1. Em qualquer componente, use o hook
import { useTheme } from '@/providers/ThemeProvider';

function MeuComponente() {
  const { logo, organizationName, theme } = useTheme();

  return (
    <div>
      {/* Logo dinâmico */}
      {logo && <img src={logo} alt={organizationName} />}
      
      {/* Nome da organização */}
      <h1>{organizationName}</h1>
      
      {/* Cores personalizadas aplicadas automaticamente via CSS */}
      <button className="bg-primary text-primary-foreground">
        Botão com cor personalizada
      </button>
    </div>
  );
}
```

---

## 📚 Documentação Completa

Para informações detalhadas, consulte: [MULTI-TENANT-README.md](./MULTI-TENANT-README.md)

---

**Tempo total de setup: ~8 minutos**  
**Pronto para produção! 🚀**

