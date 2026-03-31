# 🚀 QUICK START - Sistema de Convites

## ⚡ Configuração Rápida (5 minutos)

### **1️⃣ Aplicar Migration (Supabase)**

Acesse o **SQL Editor** do Supabase e execute todo o conteúdo do arquivo:

📁 `supabase/migrations/002_create_organization_invites.sql`

✅ **Isso irá criar:**
- Tabela `organization_invites`
- RLS Policies
- Funções helper

---

### **2️⃣ Tornar `ederguirau@gmail.com` Owner**

No **SQL Editor** do Supabase:

```sql
-- Buscar ID do usuário
SELECT id, email FROM auth.users WHERE email = 'ederguirau@gmail.com';
-- 👆 Copie o ID!

-- Buscar ID da organização
SELECT id, name FROM organizations;
-- 👆 Copie o ID da sua organização!

-- Associar como owner
INSERT INTO user_organizations (user_id, organization_id, role)
VALUES (
  'COLE_USER_ID_AQUI',
  'COLE_ORG_ID_AQUI',
  'owner'
)
ON CONFLICT (user_id, organization_id) 
DO UPDATE SET role = 'owner';
```

---

### **3️⃣ Reiniciar Aplicação**

```bash
# Se estiver rodando, pare (Ctrl+C) e rode novamente:
cd /Users/deyvidbueno/Documents/AppDev/fertilisolo
npm run dev
```

---

## ✅ Testar o Sistema

### **Como Owner:**

1. Acesse `http://localhost:8081`
2. Faça login com `ederguirau@gmail.com`
3. Vá para `http://localhost:8081/admin`
4. Clique na aba **"Convites"** (🔗)
5. Configure:
   - Função: **Membro**
   - Expira em: **7** dias
   - Usos máximos: **1** (ou deixe vazio)
6. Clique **"Gerar Link de Convite"**
7. Clique **"Copiar"**
8. Abra uma aba anônima e cole o link!

### **Como Convidado:**

1. Cole o link copiado
2. Verá: **"Convite para [Sua Empresa]"**
3. Preencha cadastro
4. Pronto! Adicionado automaticamente! 🎉

---

## 🎯 URLs Importantes

| URL | Descrição |
|-----|-----------|
| `http://localhost:8081/` | Página inicial |
| `http://localhost:8081/admin` | Painel Admin |
| `http://localhost:8081/signup?invite=TOKEN` | Link de convite |

---

## 🎨 Nova Aba no Admin

Você verá 4 abas:
- 🎨 **Tema** (cores)
- 🖼️ **Logo** (upload)
- 👥 **Usuários** (gerenciar)
- 🔗 **Convites** ← **NOVO!**

---

## 💡 Dicas

1. **Links expiram automaticamente** após X dias
2. **Limite de usos** evita compartilhamento excessivo
3. **Pode desativar** convites a qualquer momento
4. **Convite ilimitado**: Deixe "Usos máximos" vazio
5. **Função Admin**: Dá acesso ao painel admin para o convidado

---

## ❓ Problemas?

### **"Erro ao criar convite"**
→ Verifique se aplicou a migration no Supabase

### **"Convite inválido"**
→ Convite pode ter expirado ou esgotado usos

### **"Não vejo aba Convites"**
→ Certifique-se que está logado como Owner ou Admin

---

## 📱 Compartilhar Convites

Copie o link e envie por:
- ✅ WhatsApp
- ✅ Email  
- ✅ Telegram
- ✅ Slack
- ✅ Qualquer mensageiro!

---

**Tempo total**: ⏱️ 5 minutos  
**Dificuldade**: ⭐ Fácil  
**Status**: ✅ Pronto para usar!

---

🎉 **Pronto! Agora você pode convidar usuários com um simples link!**

