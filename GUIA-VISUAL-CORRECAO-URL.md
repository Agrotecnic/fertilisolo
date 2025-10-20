# 🎯 GUIA VISUAL: Correção de URL de Recuperação de Senha

**Data**: 19/10/2025  
**Tempo Estimado**: 5 minutos  
**Prioridade**: ⚠️ **CRÍTICA**

---

## 📋 INSTRUÇÕES PASSO A PASSO

### 🔗 PASSO 1: Acesse o Dashboard do Supabase

Clique no link abaixo (vai abrir diretamente na página correta):

```
https://supabase.com/dashboard/project/crtdfzqejhkccglatcmc/auth/url-configuration
```

**Ou navegue manualmente:**
1. Vá para: https://app.supabase.com
2. Faça login na sua conta
3. Selecione o projeto: **Fertilisolo** (ID: `crtdfzqejhkccglatcmc`)
4. No menu lateral esquerdo, clique em: **Authentication**
5. Clique em: **URL Configuration**

---

### 🎨 PASSO 2: Configure o Site URL

Na página de URL Configuration, você verá:

```
┌─────────────────────────────────────────────┐
│ Site URL                                     │
├─────────────────────────────────────────────┤
│ [___________________________________]        │
│                                              │
│ The default URL of your application.        │
│ Used in confirmation and password reset     │
│ emails.                                      │
└─────────────────────────────────────────────┘
```

**AÇÃO:** Cole exatamente esta URL no campo "Site URL":

```
https://f8e9736e.fertilisolo.pages.dev
```

⚠️ **IMPORTANTE**: 
- NÃO adicione barra `/` no final
- Certifique-se de que NÃO está o domínio do FertiliFolha

---

### 🔄 PASSO 3: Configure as Redirect URLs

Logo abaixo do Site URL, você verá:

```
┌─────────────────────────────────────────────┐
│ Redirect URLs                                │
├─────────────────────────────────────────────┤
│ [+] Add URL                                  │
│                                              │
│ • existing-url-1.com                    [x]  │
│ • existing-url-2.com                    [x]  │
└─────────────────────────────────────────────┘
```

**AÇÃO:** Clique em **[+] Add URL** e adicione as seguintes URLs (uma por vez):

#### URL 1:
```
https://f8e9736e.fertilisolo.pages.dev/**
```

#### URL 2:
```
https://f8e9736e.fertilisolo.pages.dev/auth/callback
```

#### URL 3:
```
https://f8e9736e.fertilisolo.pages.dev/reset-password
```

#### URL 4 (para desenvolvimento local):
```
http://localhost:5173/**
```

⚠️ **IMPORTANTE**: 
- O `**` no final permite qualquer caminho dentro daquele domínio
- Mantenha as URLs existentes se forem relevantes
- Remova URLs do FertiliFolha se encontrar

---

### 💾 PASSO 4: Salve as Alterações

1. Role a página até o final
2. Clique no botão verde **"Save"**
3. Aguarde a mensagem de confirmação: ✅ **"Configuration updated successfully"**

---

### 📧 PASSO 5: Verifique os Templates de Email (OPCIONAL MAS RECOMENDADO)

1. No menu lateral, clique em: **Authentication** > **Email Templates**
2. Ou acesse diretamente:
   ```
   https://supabase.com/dashboard/project/crtdfzqejhkccglatcmc/auth/templates
   ```

3. Verifique o template **"Reset Password"**:

Deve conter algo como:
```html
<h2>Redefinir Senha</h2>
<p>Siga este link para redefinir sua senha:</p>
<p><a href="{{ .ConfirmationURL }}">Redefinir Senha</a></p>
```

4. Verifique que está usando `{{ .ConfirmationURL }}` ou `{{ .SiteURL }}`

---

## ✅ CHECKLIST DE VERIFICAÇÃO

Marque conforme completa:

- [ ] ✅ Acessei o Dashboard do Supabase
- [ ] ✅ Selecionei o projeto **Fertilisolo** (não FertiliFolha)
- [ ] ✅ Abri a página **URL Configuration**
- [ ] ✅ Configurei **Site URL**: `https://f8e9736e.fertilisolo.pages.dev`
- [ ] ✅ Adicionei **Redirect URLs** (4 URLs)
- [ ] ✅ Cliquei em **Save**
- [ ] ✅ Recebi confirmação de sucesso
- [ ] ✅ (Opcional) Verifiquei templates de email

---

## 🧪 TESTE A CORREÇÃO

### Teste 1: Recuperação de Senha

1. Abra uma janela anônima no navegador
2. Acesse: `https://f8e9736e.fertilisolo.pages.dev`
3. Clique em **"Esqueci minha senha"**
4. Digite: `ederguirau@gmail.com`
5. Envie a solicitação
6. **Verifique seu email**
7. **Clique no link de recuperação**
8. **VERIFICAR**: Deve abrir `f8e9736e.fertilisolo.pages.dev` (NÃO FertiliFolha)

### Teste 2: Redefinição de Senha

Se o link abriu corretamente:

1. Digite uma nova senha
2. Confirme a nova senha
3. Clique em **"Atualizar Senha"**
4. Faça login com a nova senha
5. ✅ **SUCESSO!**

---

## 🎯 COMPARAÇÃO: ANTES vs DEPOIS

### ❌ ANTES (ERRADO):

```
Site URL: https://[fertilifolha-domain]
Redirect URLs: 
  • https://[fertilifolha-domain]/**
```

**Resultado:** Link de recuperação abre **FertiliFolha** ❌

---

### ✅ DEPOIS (CORRETO):

```
Site URL: https://f8e9736e.fertilisolo.pages.dev
Redirect URLs:
  • https://f8e9736e.fertilisolo.pages.dev/**
  • https://f8e9736e.fertilisolo.pages.dev/auth/callback
  • https://f8e9736e.fertilisolo.pages.dev/reset-password
  • http://localhost:5173/**
```

**Resultado:** Link de recuperação abre **Fertilisolo** ✅

---

## 🆘 PROBLEMAS COMUNS

### Problema 1: "Token expirado ou inválido"
**Causa:** Link já foi usado ou expirou (1 hora)  
**Solução:** Solicitar novo link de recuperação

### Problema 2: "Não recebi o email"
**Causa:** Email em spam ou rate limit  
**Solução:** 
- Verificar pasta de spam
- Aguardar 1 hora e tentar novamente

### Problema 3: "Ainda redireciona para FertiliFolha"
**Causa:** Cache do navegador  
**Solução:** 
- Limpar cache do navegador
- Usar janela anônima
- Testar em outro navegador

### Problema 4: "Não consigo acessar o Dashboard"
**Causa:** Sem permissão ou sessão expirada  
**Solução:** 
- Fazer logout e login novamente
- Verificar se tem acesso ao projeto Fertilisolo
- Verificar se está usando a conta correta

---

## 📊 CONFIGURAÇÕES CORRETAS (REFERÊNCIA)

### URLs do Fertilisolo:
```
Projeto ID:     crtdfzqejhkccglatcmc
Supabase URL:   https://crtdfzqejhkccglatcmc.supabase.co
Produção:       https://f8e9736e.fertilisolo.pages.dev
Admin:          https://f8e9736e.fertilisolo.pages.dev/admin
Local:          http://localhost:5173
```

### URLs do FertiliFolha (NÃO USAR):
```
Projeto ID:     zgrzfrvumlsnxqsgnqay
Supabase URL:   https://zgrzfrvumlsnxqsgnqay.supabase.co
```

---

## 💡 DICAS IMPORTANTES

1. **Sempre use janela anônima** para testar após alterações
2. **Aguarde 1-2 minutos** após salvar as configurações
3. **Não modifique** os templates de email sem necessidade
4. **Mantenha cópia** das URLs antigas antes de remover
5. **Teste sempre** após fazer alterações

---

## 📞 SUPORTE

Se após seguir todos os passos o problema persistir:

1. **Verificar Console**: Pressione F12 no navegador
2. **Ver Logs do Supabase**: Auth > Logs
3. **Verificar Network**: Aba Network no DevTools
4. **Testar outro usuário**: Crie uma conta de teste

---

## ✅ CONFIRMAÇÃO FINAL

Após completar todos os passos:

1. [ ] ✅ Configurações salvas com sucesso
2. [ ] ✅ Teste de recuperação de senha funcionou
3. [ ] ✅ Link abre Fertilisolo (não FertiliFolha)
4. [ ] ✅ Consegui redefinir a senha
5. [ ] ✅ Fiz login com nova senha

---

**Status Final Esperado**: 🟢 **PROBLEMA RESOLVIDO**

**Tempo Total**: ~5-10 minutos

---

**Criado**: 19/10/2025  
**Atualizado**: 19/10/2025  
**Responsável**: Deyvid Bueno

