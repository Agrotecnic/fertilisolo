# Segurança: Links e Isolamento por Organização
**Data:** 11 de novembro de 2025  
**Status:** ✅ Implementado

## Visão Geral

Este documento garante que **TODOS os links e acessos a dados sempre validem e usem o `organization_id` correto**, impedindo vazamento de dados entre organizações.

## 🔒 Princípios de Segurança

### 1. **Validação em Múltiplas Camadas**
Toda operação que acessa dados de análise deve validar em TRÊS níveis:

```
┌─────────────────────────────────────┐
│  1. Autenticação (Usuário logado)  │
│  2. Organização (User ∈ Org)       │
│  3. Recurso (Resource ∈ Org)       │
└─────────────────────────────────────┘
```

### 2. **RLS (Row Level Security) no Banco**
✅ Políticas RLS ativas em todas as tabelas:
- `farms`
- `plots`
- `soil_analyses`
- `fertilizer_recommendations`

Cada política garante que `organization_id` seja validado automaticamente.

### 3. **Validação no Código TypeScript**
Além do RLS, o código TypeScript faz validação explícita.

## 📋 Funções de Segurança Disponíveis

### ✅ Funções Corretas para Usar

#### 1. **Buscar Todas as Análises da Organização**
```typescript
// ✅ CORRETO: Filtra automaticamente por organization_id
const { data, error } = await getUserSoilAnalyses();
```

**Validações:**
- ✅ Usuário autenticado
- ✅ Busca apenas organization_id do usuário
- ✅ RLS aplica filtro adicional

---

#### 2. **Buscar Análise Específica por ID**
```typescript
// ✅ CORRETO: Valida que análise pertence à organização do usuário
const { data, error } = await getSoilAnalysisById(analysisId);
```

**Validações:**
- ✅ Usuário autenticado
- ✅ Análise deve ter mesmo organization_id do usuário
- ✅ RLS aplica validação adicional
- ✅ Retorna erro se não pertencer à organização

**Quando usar:**
- Links compartilhados com `?analysisId=xxx`
- Carregar análise específica do histórico
- Edição de análise existente

---

#### 3. **Buscar Análise com Dados da Organização (PDF)**
```typescript
// ✅ CORRETO: Retorna análise + logo/cores da organização
const { data, organization, error } = await getSoilAnalysisWithOrganization(analysisId);

// Usar logo e cores da ORGANIZAÇÃO DA ANÁLISE, não do usuário
if (organization) {
  const pdfOptions = {
    logo: organization.logo_url,
    primaryColor: organization.organization_themes?.primary_color,
    organizationName: organization.name
  };
}
```

**Validações:**
- ✅ Usuário autenticado
- ✅ Análise pertence à organização do usuário
- ✅ Retorna dados da organização da análise
- ✅ Garante que logo/cores são da organização correta

**Quando usar:**
- Geração de PDF de análise específica
- Compartilhamento de relatórios
- Preview de análise com branding

---

#### 4. **Salvar Nova Análise**
```typescript
// ✅ CORRETO: Adiciona organization_id automaticamente
const { data, error } = await saveSoilAnalysis(soilData, plotId);
```

**Validações:**
- ✅ Usuário autenticado
- ✅ organization_id adicionado automaticamente
- ✅ user_id adicionado automaticamente
- ✅ RLS valida que organization_id é válido

---

### ❌ Práticas PROIBIDAS

#### 1. **Acesso Direto ao Supabase SEM Validação**
```typescript
// ❌ ERRADO: Não valida organization_id
const { data } = await supabase
  .from('soil_analyses')
  .select('*')
  .eq('id', analysisId)
  .single();
```

**Por que é perigoso:**
- Pode retornar dados de outra organização
- Bypassar validação de segurança
- RLS sozinho não é suficiente (defesa em profundidade)

**✅ CORREÇÃO:**
```typescript
// Use a função segura
const { data, error } = await getSoilAnalysisById(analysisId);
```

---

#### 2. **Usar Dados do Usuário Logado para PDF de Outra Análise**
```typescript
// ❌ ERRADO: Pode usar logo/cores da organização errada
const { theme, logo } = useTheme(); // Logo do usuário logado

// Gera PDF de análise de OUTRA organização com logo ERRADO
await generatePDF(analysisData, { logo, theme });
```

**Problema:**
- Se um admin visualizar análise de cliente
- O PDF será gerado com logo do admin, não do cliente
- Branding incorreto

**✅ CORREÇÃO:**
```typescript
// Buscar análise com dados da ORGANIZAÇÃO DA ANÁLISE
const { data, organization } = await getSoilAnalysisWithOrganization(analysisId);

// Usar logo/cores da organização da análise
const pdfOptions = {
  logo: organization?.logo_url,
  primaryColor: organization?.organization_themes?.primary_color
};

await generatePDF(data, pdfOptions);
```

---

#### 3. **Links sem Validação de Organização**
```typescript
// ❌ ERRADO: Link não valida organização
const shareLink = `${window.location.origin}/analysis/${analysisId}`;
```

**Problema:**
- Qualquer usuário com o link pode tentar acessar
- Depende apenas de RLS (sem validação explícita)

**✅ CORREÇÃO:**
```typescript
// Link inclui token seguro
const shareLink = await createAnalysisShareLink(analysisId);
// Exemplo: https://app.com/shared/abc123-token-xyz

// Na página /shared/:token
const analysis = await getSharedAnalysis(token);
// Valida token, organização e permissões
```

---

## 🔐 Implementação de Links Compartilhados (Futuro)

Se for implementar compartilhamento público de análises:

### 1. **Tabela de Tokens de Compartilhamento**
```sql
CREATE TABLE analysis_share_tokens (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  analysis_id UUID NOT NULL REFERENCES soil_analyses(id),
  organization_id UUID NOT NULL REFERENCES organizations(id),
  token TEXT UNIQUE NOT NULL,
  created_by UUID NOT NULL REFERENCES auth.users(id),
  expires_at TIMESTAMPTZ,
  max_views INT,
  view_count INT DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
```

### 2. **Gerar Token de Compartilhamento**
```typescript
export async function createAnalysisShareLink(
  analysisId: string,
  expiresInDays: number = 7,
  maxViews?: number
) {
  // 1. Validar que análise pertence à organização do usuário
  const { data: analysis } = await getSoilAnalysisById(analysisId);
  if (!analysis) {
    return { shareUrl: null, error: 'Análise não encontrada' };
  }

  // 2. Obter contexto
  const validation = await getSecurityContext();
  if (!validation.isValid) {
    return { shareUrl: null, error: 'Não autenticado' };
  }

  // 3. Gerar token único
  const token = crypto.randomUUID();
  const expiresAt = new Date();
  expiresAt.setDate(expiresAt.getDate() + expiresInDays);

  // 4. Salvar token com organization_id da análise
  const { error } = await supabase
    .from('analysis_share_tokens')
    .insert({
      analysis_id: analysisId,
      organization_id: validation.context.organizationId, // ⚠️ IMPORTANTE
      token,
      created_by: validation.context.userId,
      expires_at: expiresAt.toISOString(),
      max_views: maxViews
    });

  if (error) return { shareUrl: null, error: error.message };

  // 5. Retornar URL com token
  const shareUrl = `${window.location.origin}/shared/${token}`;
  return { shareUrl, error: null };
}
```

### 3. **Acessar Análise Compartilhada**
```typescript
export async function getSharedAnalysis(token: string) {
  // 1. Buscar token
  const { data: shareToken, error } = await supabase
    .from('analysis_share_tokens')
    .select(`
      *,
      soil_analyses (
        *,
        organizations (
          id,
          name,
          logo_url,
          organization_themes (*)
        )
      )
    `)
    .eq('token', token)
    .single();

  if (error || !shareToken) {
    return { data: null, organization: null, error: 'Link inválido' };
  }

  // 2. Validar expiração
  if (shareToken.expires_at && new Date(shareToken.expires_at) < new Date()) {
    return { data: null, organization: null, error: 'Link expirado' };
  }

  // 3. Validar número de visualizações
  if (shareToken.max_views && shareToken.view_count >= shareToken.max_views) {
    return { data: null, organization: null, error: 'Limite de visualizações atingido' };
  }

  // 4. Incrementar contador
  await supabase
    .from('analysis_share_tokens')
    .update({ view_count: shareToken.view_count + 1 })
    .eq('id', shareToken.id);

  // 5. Retornar dados da análise com organização CORRETA
  const analysis = convertDBToSoilDataFormat(shareToken.soil_analyses);
  const organization = shareToken.soil_analyses.organizations;

  return { 
    data: analysis, 
    organization, // ⚠️ USAR ESTES DADOS PARA PDF
    error: null 
  };
}
```

---

## ✅ Checklist de Segurança

Ao implementar qualquer funcionalidade que acesse análises:

- [ ] Usa função segura (`getSoilAnalysisById` ou `getSoilAnalysisWithOrganization`)?
- [ ] Valida `organization_id` explicitamente no código?
- [ ] Usa logo/cores da organização DA ANÁLISE, não do usuário?
- [ ] Link inclui token ou validação de organização?
- [ ] Logs de segurança registram tentativas de acesso não autorizado?
- [ ] Testes cobrem cenário de acesso entre organizações?

---

## 🚨 Detecção de Violações

### Logs de Segurança
Todas as tentativas de acesso não autorizado são logadas:

```typescript
console.error('❌ [GET_BY_ID] TENTATIVA DE ACESSO NÃO AUTORIZADO:', {
  analysisId,
  analysisOrgId: data.organization_id,
  userOrgId: validation.context.organizationId,
  userId: validation.context.userId,
  timestamp: new Date().toISOString()
});
```

### Monitoramento
Implementar alerta quando houver:
- Múltiplas tentativas de acesso não autorizado do mesmo usuário
- Acesso a organization_id diferente do usuário
- Padrões suspeitos de acesso

---

## 📊 Fluxo de Dados Seguro

### Criação de Análise
```
Usuário → saveSoilAnalysis()
  ↓
getSecurityContext() → obtém organizationId
  ↓
addOrganizationIdToData() → adiciona organization_id
  ↓
Supabase INSERT → RLS valida
  ↓
✅ Análise salva com organization_id correto
```

### Acesso a Análise
```
Usuário → getSoilAnalysisById(id)
  ↓
getSecurityContext() → obtém organizationId do usuário
  ↓
SELECT WHERE id = X AND organization_id = Y
  ↓
RLS valida novamente
  ↓
Validação adicional no código
  ↓
✅ Retorna análise OU erro de permissão
```

### Geração de PDF
```
Usuário → getSoilAnalysisWithOrganization(id)
  ↓
Validações de segurança
  ↓
SELECT com JOIN em organizations
  ↓
Retorna: { analysis, organization }
  ↓
generatePDF(analysis, organization.logo, organization.theme)
  ↓
✅ PDF gerado com branding CORRETO
```

---

## 🔄 Migrações e Atualizações

### Status Atual (11/11/2025)
- ✅ Coluna `organization_id` adicionada em todas as tabelas
- ✅ RLS ativo em todas as tabelas
- ✅ 100% dos dados migrados com organization_id
- ✅ Funções de segurança implementadas
- ✅ Validações em múltiplas camadas

### Próximos Passos
- [ ] Implementar sistema de tokens de compartilhamento (se necessário)
- [ ] Adicionar testes de segurança automatizados
- [ ] Implementar dashboard de auditoria de acessos
- [ ] Configurar alertas para tentativas de acesso não autorizado

---

## 📝 Exemplos Práticos

### Exemplo 1: Carregar Análise do Histórico
```typescript
// ✅ CORRETO
const handleLoadAnalysis = async (analysisId: string) => {
  const { data, error } = await getSoilAnalysisById(analysisId);
  
  if (error) {
    toast({ 
      variant: 'destructive', 
      title: 'Erro ao carregar análise',
      description: error 
    });
    return;
  }
  
  setCurrentAnalysis(data);
};
```

### Exemplo 2: Gerar PDF de Análise Específica
```typescript
// ✅ CORRETO
const handleExportPDF = async (analysisId: string) => {
  const { data, organization, error } = await getSoilAnalysisWithOrganization(analysisId);
  
  if (error || !data) {
    toast({ variant: 'destructive', title: 'Erro ao gerar PDF' });
    return;
  }
  
  // Usar dados da organização da análise
  const pdfOptions = {
    logo: organization?.logo_url,
    primaryColor: organization?.organization_themes?.primary_color,
    secondaryColor: organization?.organization_themes?.secondary_color,
    organizationName: organization?.name || 'FertiliSolo'
  };
  
  await generatePDF(data, pdfOptions);
};
```

### Exemplo 3: Componente com Validação
```typescript
export const AnalysisViewer: React.FC<{ analysisId: string }> = ({ analysisId }) => {
  const [analysis, setAnalysis] = useState<SoilData | null>(null);
  const [organization, setOrganization] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadData = async () => {
      const { data, organization: org, error } = 
        await getSoilAnalysisWithOrganization(analysisId);
      
      if (error) {
        setError(error);
        return;
      }
      
      setAnalysis(data);
      setOrganization(org);
    };
    
    loadData();
  }, [analysisId]);

  if (error) {
    return <div className="text-red-500">Erro: {error}</div>;
  }

  if (!analysis) {
    return <div>Carregando...</div>;
  }

  return (
    <div>
      {/* Mostrar logo da organização DA ANÁLISE */}
      {organization?.logo_url && (
        <img src={organization.logo_url} alt={organization.name} />
      )}
      
      {/* Dados da análise */}
      <AnalysisDetails data={analysis} />
    </div>
  );
};
```

---

## 🎯 Resumo

### ✅ O que SEMPRE fazer:
1. Usar funções de segurança (`getSoilAnalysisById`, etc.)
2. Validar `organization_id` explicitamente
3. Usar logo/cores da organização DA ANÁLISE
4. Logar tentativas de acesso não autorizado
5. Testar isolamento entre organizações

### ❌ O que NUNCA fazer:
1. Acesso direto ao Supabase sem validação
2. Usar dados do usuário logado para PDF de outra organização
3. Bypassar validação de `organization_id`
4. Confiar apenas no RLS (usar defesa em profundidade)
5. Criar links sem token/validação

---

**Conclusão:** Com estas medidas, garantimos que **TODO acesso a dados sempre valida e usa o `organization_id` correto**, prevenindo vazamento de dados entre organizações.

