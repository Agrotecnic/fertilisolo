# 🏢 Como Adicionar uma Nova Empresa Cliente

Guia passo a passo para adicionar uma empresa que solicitou personalização.

## 📋 Informações Necessárias da Empresa

Antes de começar, colete estas informações:

- ✅ **Nome da Empresa**: Ex: "Agrícola São Paulo"
- ✅ **Slug** (identificador único): Ex: "agricola-sao-paulo"
- ✅ **Cores**:
  - Cor primária (hex): Ex: #2E7D32
  - Cor secundária (hex): Ex: #1565C0
  - Cor de destaque (hex): Ex: #FF8F00
- ✅ **Logo**: Arquivo PNG/SVG com fundo transparente
- ✅ **Email do Administrador**: Email do usuário que será owner

---

## 🚀 Processo de Onboarding

### Passo 1: Criar a Organização

Execute no **SQL Editor** do Supabase:

```sql
-- Criar a organização
INSERT INTO organizations (name, slug, is_active) 
VALUES ('NOME_DA_EMPRESA', 'slug-da-empresa', true)
RETURNING id, name, slug;
```

Copie o `id` retornado (será usado nos próximos passos).

### Passo 2: Criar o Tema com as Cores da Empresa

```sql
-- Inserir tema personalizado
INSERT INTO organization_themes (
  organization_id,
  primary_color,
  primary_foreground,
  secondary_color,
  secondary_foreground,
  accent_color,
  accent_foreground
)
VALUES (
  'ID_DA_ORGANIZACAO_COPIADO_ACIMA',
  '#2E7D32',  -- Cor primária da empresa
  '#FFFFFF',  -- Branco para texto
  '#1565C0',  -- Cor secundária
  '#FFFFFF',  -- Branco para texto
  '#FF8F00',  -- Cor de destaque
  '#FFFFFF'   -- Branco para texto
);
```

### Passo 3: Associar o Administrador

**Opção A: Usuário já existe no sistema**

```sql
-- Buscar o usuário pelo email
SELECT id, email FROM auth.users WHERE email = 'admin@empresa.com';

-- Associar como owner
INSERT INTO user_organizations (user_id, organization_id, role)
VALUES (
  'USER_ID_ENCONTRADO',
  'ID_DA_ORGANIZACAO',
  'owner'
);
```

**Opção B: Usuário ainda não existe**

1. Peça para o administrador se cadastrar normalmente na aplicação
2. Depois execute a query acima para associá-lo

### Passo 4: Enviar Credenciais de Acesso

Envie um email para o administrador da empresa com:

```
Olá [Nome],

Sua organização [Nome da Empresa] foi configurada no FertiliSolo!

🔐 Acesso:
- URL: https://fertilisolo.com (ou sua URL)
- Email: [email cadastrado]
- Senha: [a senha que o próprio usuário criou]

🎨 Painel de Administração:
Acesse: https://fertilisolo.com/admin

No painel você pode:
- Fazer upload do logo da empresa
- Ajustar as cores do tema
- Adicionar novos usuários da sua equipe

📚 Documentação:
[Link para documentação se disponível]

Qualquer dúvida, estamos à disposição!

Equipe FertiliSolo
```

### Passo 5: Upload do Logo (Pode ser feito pelo admin ou por você)

**Opção A: Admin faz upload via painel**
1. Admin acessa `/admin`
2. Aba "Logo"
3. Faz upload

**Opção B: Você faz upload diretamente**
1. Acesse Supabase Dashboard → Storage → `organization-assets`
2. Upload do arquivo
3. Copie a URL pública
4. Execute:

```sql
UPDATE organizations 
SET logo_url = 'https://[sua-url-supabase].supabase.co/storage/v1/object/public/organization-assets/logo-empresa.png'
WHERE id = 'ID_DA_ORGANIZACAO';
```

---

## ✅ Checklist de Validação

Após configurar, teste:

- [ ] Login com usuário da empresa
- [ ] Cores personalizadas aparecem
- [ ] Logo aparece no header
- [ ] Admin consegue acessar `/admin`
- [ ] Admin consegue alterar cores
- [ ] Admin consegue fazer upload de logo

---

## 🎯 Exemplo Completo

Vamos adicionar a empresa "Agrícola São Paulo":

```sql
-- 1. Criar organização
INSERT INTO organizations (name, slug, is_active) 
VALUES ('Agrícola São Paulo', 'agricola-sao-paulo', true)
RETURNING id;
-- Retornou: b7d8c4e5-1234-5678-90ab-cdef12345678

-- 2. Criar tema com cores da empresa
INSERT INTO organization_themes (
  organization_id,
  primary_color,
  secondary_color,
  accent_color
)
VALUES (
  'b7d8c4e5-1234-5678-90ab-cdef12345678',
  '#2E7D32',  -- Verde deles
  '#1565C0',  -- Azul deles
  '#FF8F00'   -- Laranja deles
);

-- 3. Buscar usuário admin
SELECT id FROM auth.users WHERE email = 'joao@agricolasaopaulo.com';
-- Retornou: a1b2c3d4-5678-90ab-cdef-1234567890ab

-- 4. Associar como owner
INSERT INTO user_organizations (user_id, organization_id, role)
VALUES (
  'a1b2c3d4-5678-90ab-cdef-1234567890ab',
  'b7d8c4e5-1234-5678-90ab-cdef12345678',
  'owner'
);

-- 5. Upload do logo (via painel admin ou storage)
-- Depois atualizar:
UPDATE organizations 
SET logo_url = 'https://[url].supabase.co/storage/v1/object/public/organization-assets/agricola-sp-logo.png'
WHERE id = 'b7d8c4e5-1234-5678-90ab-cdef12345678';
```

Pronto! Empresa configurada em menos de 5 minutos! 🎉

---

## 🔄 Adicionar Mais Usuários da Empresa

Depois que a empresa estiver configurada, o owner pode adicionar mais usuários:

### Via SQL (Mais Rápido)

```sql
-- Buscar organização
SELECT id FROM organizations WHERE slug = 'agricola-sao-paulo';

-- Buscar novo usuário
SELECT id FROM auth.users WHERE email = 'maria@agricolasaopaulo.com';

-- Adicionar à organização
INSERT INTO user_organizations (user_id, organization_id, role)
VALUES (
  'USER_ID_MARIA',
  'ORG_ID_AGRICOLA',
  'member'  -- ou 'admin' se for administrador
);
```

### Via Painel Admin (Futuro)

O owner pode fazer isso diretamente pelo painel `/admin` → aba Usuários.

---

## 📊 Monitoramento

### Ver todas as organizações

```sql
SELECT 
  o.name,
  o.slug,
  o.is_active,
  COUNT(uo.id) as total_users,
  o.created_at
FROM organizations o
LEFT JOIN user_organizations uo ON uo.organization_id = o.id
GROUP BY o.id
ORDER BY o.created_at DESC;
```

### Ver usuários de uma organização

```sql
SELECT 
  u.email,
  uo.role,
  uo.created_at
FROM user_organizations uo
JOIN auth.users u ON u.id = uo.user_id
WHERE uo.organization_id = (
  SELECT id FROM organizations WHERE slug = 'agricola-sao-paulo'
)
ORDER BY uo.created_at;
```

---

## 💰 Modelo de Cobrança (Sugestão)

Você pode cobrar por:

1. **Setup Inicial**: Valor único por configuração
2. **Mensalidade por Organização**: Valor mensal/anual
3. **Por Usuário**: Valor adicional por usuário extra
4. **Pacotes**:
   - Básico: Até 5 usuários
   - Profissional: Até 20 usuários
   - Enterprise: Ilimitado

---

## 🎨 Template de Proposta Comercial

```
PROPOSTA - PERSONALIZAÇÃO WHITE-LABEL

Empresa: [Nome da Empresa]
Data: [Data]

BENEFÍCIOS:
✓ Logo da empresa na aplicação
✓ Cores personalizadas com identidade visual
✓ Painel de administração exclusivo
✓ Gerenciamento de usuários da equipe
✓ Suporte técnico dedicado

INVESTIMENTO:
- Setup Inicial: R$ X.XXX,XX (único)
- Mensalidade: R$ XXX,XX/mês
- Inclui: até X usuários

PRAZO:
- Configuração: 1 dia útil
- Treinamento: 1 sessão online

PRÓXIMOS PASSOS:
1. Envio de logo e cores
2. Criação de conta do administrador
3. Configuração e testes
4. Treinamento da equipe
```

---

**Processo total: ~10 minutos por empresa**  
**Escalável e automatizável! 🚀**

