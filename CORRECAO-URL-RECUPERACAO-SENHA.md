# 🔧 CORREÇÃO: URL de Recuperação de Senha

**Data**: 19/10/2025  
**Status**: 🔴 **PROBLEMA IDENTIFICADO - AÇÃO NECESSÁRIA**  
**Prioridade**: ⚠️ **ALTA** - Afeta recuperação de senha dos usuários

---

## 🚨 PROBLEMA IDENTIFICADO

### **Sintoma:**
Quando o usuário `ederguirau@gmail.com` tenta recuperar a senha:
1. ✅ Recebe o email de recuperação
2. ✅ Clica no link do email
3. ❌ É redirecionado para **FertiliFolha** (projeto errado)
4. ❌ Não consegue redefinir a senha no **FertiliSolo**

### **Causa Raiz:**
As configurações de **Site URL** e **Redirect URLs** no Supabase Auth do projeto **Fertilisolo** estão apontando para as URLs do projeto **FertiliFolha**.

### **Projetos Supabase:**
```
✅ Fertilisolo  : crtdfzqejhkccglatcmc (projeto correto)
❌ FertiliFolha : zgrzfrvumlsnxqsgnqay (projeto errado que está sendo usado)
```

---

## 🎯 SOLUÇÃO

### **PASSO 1: Acessar Painel do Supabase**

1. Acesse: https://app.supabase.com
2. Selecione o projeto **Fertilisolo** (ID: `crtdfzqejhkccglatcmc`)

### **PASSO 2: Ir para Configurações de Autenticação**

1. No menu lateral, clique em **Authentication**
2. Clique em **URL Configuration**
3. Ou acesse diretamente: https://supabase.com/dashboard/project/crtdfzqejhkccglatcmc/auth/url-configuration

### **PASSO 3: Configurar URLs Corretas**

Configure as seguintes URLs:

#### **Site URL (URL Principal):**
```
https://f8e9736e.fertilisolo.pages.dev
```

#### **Redirect URLs (URLs Permitidas):**
Adicione as seguintes URLs permitidas:
```
https://f8e9736e.fertilisolo.pages.dev/**
https://f8e9736e.fertilisolo.pages.dev/auth/callback
https://f8e9736e.fertilisolo.pages.dev/reset-password
http://localhost:5173/**
```

**Observação**: A URL com `**` no final permite qualquer caminho dentro daquele domínio.

### **PASSO 4: Salvar as Alterações**

1. Clique no botão **"Save"** no final da página
2. Aguarde a confirmação de que as configurações foram salvas

### **PASSO 5: Verificar Templates de Email**

1. Vá para **Authentication** > **Email Templates**
2. Ou acesse: https://supabase.com/dashboard/project/crtdfzqejhkccglatcmc/auth/templates

3. Verifique os seguintes templates:

#### **Template: Reset Password**
Certifique-se de que contém:
```html
<h2>Redefinir Senha</h2>
<p>Siga este link para redefinir sua senha:</p>
<p><a href="{{ .ConfirmationURL }}">Redefinir Senha</a></p>
```

ou para PKCE flow:
```html
<h2>Redefinir Senha</h2>
<p>Siga este link para redefinir sua senha:</p>
<p><a href="{{ .SiteURL }}/auth/confirm?token_hash={{ .TokenHash }}&type=recovery&next=/reset-password">Redefinir Senha</a></p>
```

#### **Template: Confirm Signup**
Certifique-se de que contém:
```html
<h2>Confirme seu cadastro</h2>
<p>Siga este link para confirmar seu email:</p>
<p><a href="{{ .ConfirmationURL }}">Confirmar Email</a></p>
```

---

## 🧪 TESTE PÓS-CORREÇÃO

### **Passo 1: Limpar Cache do Navegador**
```bash
# Limpe o cache do navegador ou use uma janela anônima
```

### **Passo 2: Testar Recuperação de Senha**

1. Acesse: https://f8e9736e.fertilisolo.pages.dev
2. Clique em "Esqueci minha senha"
3. Digite o email: `ederguirau@gmail.com`
4. Envie o email de recuperação
5. Verifique o email recebido
6. Clique no link do email
7. **Verificar**: Deve abrir `f8e9736e.fertilisolo.pages.dev` e não FertiliFolha

### **Passo 3: Completar Recuperação**

1. Digite a nova senha
2. Confirme a nova senha
3. Clique em "Atualizar senha"
4. Faça login com a nova senha

---

## 🔍 DETALHES TÉCNICOS

### **Como Funciona o Fluxo de Recuperação:**

1. Usuário solicita recuperação de senha
2. Supabase gera um token único
3. Supabase envia email usando o template "Reset Password"
4. Template usa `{{ .ConfirmationURL }}` ou `{{ .SiteURL }}`
5. `SiteURL` é lido da configuração "Site URL" no painel
6. Quando usuário clica, é redirecionado para a URL configurada

### **Por que estava indo para FertiliFolha:**

A configuração de **Site URL** estava apontando para o domínio do FertiliFolha:
```
❌ ERRADO: https://[fertilifolha-url]
✅ CORRETO: https://f8e9736e.fertilisolo.pages.dev
```

---

## 📋 VERIFICAÇÕES ADICIONAIS

### **1. Verificar Configuração SMTP (Opcional)**

Se você configurou um servidor SMTP customizado:
1. Vá para **Settings** > **Auth**
2. Verifique a seção **SMTP Settings**
3. Certifique-se de que está configurado corretamente

### **2. Verificar Rate Limits**

1. Vá para **Authentication** > **Rate Limits**
2. Verifique se há limites que possam estar afetando
3. Padrão: 4 emails por hora (usando SMTP padrão)

### **3. Verificar Logs**

Para debug futuro:
1. Vá para **Logs** > **Auth Logs**
2. Filtre por `reset_password`
3. Verifique se há erros

---

## 🚨 PROBLEMAS CONHECIDOS E SOLUÇÕES

### **Problema 1: "Token expirado ou inválido"**
**Causa**: Link já foi usado ou expirou (1 hora)  
**Solução**: Solicitar novo link de recuperação

### **Problema 2: "Email não recebido"**
**Causa**: Rate limit ou email em spam  
**Solução**: 
- Verificar pasta de spam
- Aguardar 1 hora e tentar novamente
- Configurar SMTP customizado

### **Problema 3: "Redirecionamento incorreto"**
**Causa**: URLs não configuradas corretamente  
**Solução**: Seguir PASSO 3 deste documento

---

## 📊 IMPACTO

### **Usuários Afetados:**
- ✅ **Identificado**: `ederguirau@gmail.com`
- ⚠️ **Potencialmente**: Todos os usuários do Fertilisolo

### **Funcionalidades Afetadas:**
1. ❌ Recuperação de senha
2. ❌ Confirmação de email (signup)
3. ❌ Magic links (se habilitado)
4. ✅ Login normal (não afetado)

---

## ✅ CHECKLIST DE CORREÇÃO

Marque conforme completa:

- [ ] Acessou painel do Supabase
- [ ] Selecionou projeto Fertilisolo (crtdfzqejhkccglatcmc)
- [ ] Abriu URL Configuration
- [ ] Configurou Site URL: `https://f8e9736e.fertilisolo.pages.dev`
- [ ] Adicionou Redirect URLs corretas
- [ ] Salvou as configurações
- [ ] Verificou templates de email
- [ ] Testou recuperação de senha
- [ ] Email direcionou para URL correta
- [ ] Conseguiu redefinir senha com sucesso
- [ ] Fez login com nova senha
- [ ] Documentou a correção

---

## 📞 SUPORTE

Se após realizar todas as correções o problema persistir:

1. **Verificar Console do Navegador**: Tecle F12 e veja se há erros
2. **Verificar Auth Logs no Supabase**: Auth > Logs
3. **Testar em Navegador Anônimo**: Para descartar cache
4. **Verificar Network Tab**: Para ver requisições HTTP

---

## 📝 PREVENÇÃO FUTURA

### **Ao Criar Novo Projeto:**
1. ✅ Configure Site URL imediatamente
2. ✅ Adicione todas as Redirect URLs necessárias
3. ✅ Teste todos os fluxos de autenticação
4. ✅ Documente as URLs configuradas

### **Ao Fazer Deploy:**
1. ✅ Atualize Site URL se mudou de domínio
2. ✅ Adicione novo domínio às Redirect URLs
3. ✅ Teste recuperação de senha
4. ✅ Teste confirmação de email

---

## 🎯 URLs CORRETAS DE REFERÊNCIA

### **Fertilisolo (CORRETO):**
```
Projeto ID:  crtdfzqejhkccglatcmc
Supabase:    https://crtdfzqejhkccglatcmc.supabase.co
Produção:    https://f8e9736e.fertilisolo.pages.dev
Admin:       https://f8e9736e.fertilisolo.pages.dev/admin
Local:       http://localhost:5173
```

### **FertiliFolha (NÃO USAR):**
```
Projeto ID:  zgrzfrvumlsnxqsgnqay
Supabase:    https://zgrzfrvumlsnxqsgnqay.supabase.co
```

---

## ✅ PRÓXIMOS PASSOS

1. **IMEDIATO**: Corrigir URLs no Supabase (5 minutos)
2. **TESTE**: Verificar recuperação de senha funciona (5 minutos)
3. **COMUNICAÇÃO**: Informar usuário que problema foi resolvido
4. **MONITORAMENTO**: Verificar logs para garantir que não há mais erros

---

**Status Final Esperado**: 🟢 **RESOLVIDO**

**Tempo Estimado de Correção**: 10-15 minutos

---

**Documento Criado**: 19/10/2025  
**Última Atualização**: 19/10/2025  
**Responsável**: Deyvid Bueno

