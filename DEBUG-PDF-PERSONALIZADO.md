# 🔍 DEBUG - PDF Personalizado

## ✅ **O QUE FOI CORRIGIDO:**

1. ✅ **Logo agora é convertido para Base64** antes de ir para o PDF
2. ✅ **Logs detalhados** em cada etapa do processo
3. ✅ **Detecção automática** do tipo de imagem (PNG/JPEG)
4. ✅ **Tratamento de erros** mais robusto

---

## 🧪 **TESTE COM LOGS DO CONSOLE:**

### **PASSO 1: Abrir Console**

Pressione **F12** (ou `Cmd+Option+I` no Mac) e vá para a aba **Console**.

---

### **PASSO 2: Gerar PDF**

1. Vá para Dashboard
2. Aba "Nova Análise"
3. Preencha dados do solo
4. Clique "Calcular Saturações"
5. Aba "Resultados"
6. Clique **"Gerar Relatório Profissional"**

---

### **PASSO 3: Verificar Logs no Console**

Você deve ver uma sequência de logs assim:

#### **✅ LOGS ESPERADOS (Sucesso):**

```
🎨 Gerando PDF com tema: {
  theme: { primary_color: "#DC2626", secondary_color: "#991B1B", ... },
  logo: "https://...supabase.co/storage/...",
  organizationName: "MinhaEmpresa"
}

🖼️ Convertendo logo para base64...
✅ Logo convertido com sucesso

📄 Opções de tema para PDF: {
  primaryColor: "#DC2626",
  secondaryColor: "#991B1B",
  hasLogo: true,
  organizationName: "MinhaEmpresa"
}

📄 Página 1 - Opções recebidas: {
  hasPrimaryColor: true,
  primaryColor: "#DC2626",
  hasLogo: true,
  organizationName: "MinhaEmpresa"
}

🎨 Cores RGB calculadas: {
  primary: [220, 38, 38],
  secondary: [153, 27, 27]
}

🖼️ Adicionando logo ao PDF...
✅ Logo adicionado ao PDF com sucesso
📝 Nome da organização: MinhaEmpresa

✅ PDF gerado e salvo com sucesso: MinhaEmpresa_Local_2025-10-12.pdf
```

---

#### **❌ PROBLEMA 1: Tema não está carregado**

Se você ver:

```
🎨 Gerando PDF com tema: {
  theme: null,
  logo: null,
  organizationName: null
}
```

**SOLUÇÃO:**
1. Verifique se você está logado
2. Recarregue a página (Cmd+R ou Ctrl+R)
3. Aguarde o tema carregar (veja o console no carregamento)
4. Tente gerar o PDF novamente

---

#### **❌ PROBLEMA 2: Logo não foi encontrado**

Se você ver:

```
🎨 Gerando PDF com tema: {
  theme: { ... },
  logo: null,  ← Logo está null
  organizationName: "MinhaEmpresa"
}
```

**SOLUÇÃO:**
1. Vá ao Admin → Aba "Logo"
2. Verifique se o logo está aparecendo
3. Se não estiver, faça upload novamente
4. Aguarde o reload automático
5. Tente gerar o PDF novamente

---

#### **❌ PROBLEMA 3: Erro ao converter logo**

Se você ver:

```
🖼️ Convertendo logo para base64...
⚠️ Erro ao converter logo, PDF será gerado sem logo: Error: ...
```

**POSSÍVEIS CAUSAS:**
- Logo muito grande (> 2MB)
- Formato de imagem não suportado
- Problema de CORS (acesso bloqueado)

**SOLUÇÃO:**
1. Use imagem menor (< 1MB)
2. Use PNG ou JPEG
3. Faça upload novamente

---

#### **❌ PROBLEMA 4: Cores não foram aplicadas**

Se você ver:

```
📄 Opções de tema para PDF: {
  primaryColor: undefined,  ← Cor está undefined
  secondaryColor: undefined,
  hasLogo: false,
  organizationName: "Fertilisolo"
}
```

**SOLUÇÃO:**
1. Vá ao Admin → Aba "Tema"
2. Configure as cores
3. Clique "Salvar Alterações"
4. Aguarde reload automático
5. Tente gerar o PDF novamente

---

## 🎯 **VERIFICAÇÃO PASSO A PASSO:**

### **1. Verificar Tema Carregado:**

No Console, após fazer login, você deve ver:

```
🎨 Tema carregado: {
  primary_color: "#DC2626",
  secondary_color: "#991B1B",
  accent_color: "#FFA500",
  ...
}
```

Se **NÃO** ver isso:
- O tema não está configurado
- Vá ao Admin e configure

---

### **2. Verificar Logo Carregado:**

No Console, você deve ver:

```
🖼️ Logo: https://...supabase.co/storage/.../logo.png
```

Se o logo for `null`:
- Faça upload no Admin → Aba "Logo"

---

### **3. Verificar Cores no Tema:**

No Console do navegador, digite:

```javascript
getComputedStyle(document.documentElement).getPropertyValue('--primary')
```

Deve retornar algo como: `"0 100% 50%"` (valores HSL)

Se retornar vazio:
- O tema não foi aplicado
- Recarregue a página

---

## 🛠️ **SOLUÇÃO RÁPIDA:**

### **Se o PDF continua sem logo/cores:**

1. **Abra o Console (F12)**
2. **Cole este código:**

```javascript
// Verificar tema atual
const theme = JSON.parse(localStorage.getItem('organizationTheme') || '{}');
console.log('🎨 Tema armazenado:', theme);

// Verificar variáveis CSS
const root = getComputedStyle(document.documentElement);
console.log('📊 Cor primária CSS:', root.getPropertyValue('--primary'));

// Verificar se tem logo
console.log('🖼️ Logo:', theme.logo_url);
```

3. **Envie os logs para mim** e eu ajudo a debugar!

---

## 📊 **TABELA DE DIAGNÓSTICO:**

| Sintoma | Causa Provável | Solução |
|---------|----------------|---------|
| Sem logo no PDF | Logo não carregou ou não foi convertido | Verifique logs de conversão |
| Cores padrão (verde) | Tema não configurado ou não está sendo passado | Verifique `primaryColor` nos logs |
| Nome "Fertilisolo" | Organização sem nome | Configure nome no Admin |
| Erro ao gerar PDF | Dados incompletos | Verifique console para erro específico |
| Logo não converte | Formato/tamanho inválido | Use PNG/JPEG < 1MB |

---

## 🎨 **TESTE VISUAL RÁPIDO:**

Antes de gerar o PDF, verifique se:

1. ✅ **Dashboard** tem as cores personalizadas?
   - Se NÃO → Tema não carregou
   
2. ✅ **Logo aparece** no topo da aplicação?
   - Se NÃO → Logo não foi carregado
   
3. ✅ **Nome da empresa** aparece em algum lugar?
   - Se NÃO → Organização não tem nome

Se **TUDO acima está OK**, o PDF **DEVE** sair personalizado!

---

## 📝 **PRÓXIMOS PASSOS:**

1. **Gere o PDF** com o console aberto (F12)
2. **Copie TODOS os logs** do console
3. **Envie para mim** se ainda não funcionar
4. Eu vou identificar **exatamente** o problema!

---

**Teste agora e me envie os logs do console! 🔍**

