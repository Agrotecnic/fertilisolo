-- Migration: Create Organizations Multi-Tenant System
-- Description: Tabelas para suportar múltiplas organizações com temas personalizados

-- ============================================
-- 1. Tabela de Organizações
-- ============================================
CREATE TABLE IF NOT EXISTS organizations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  logo_url TEXT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Comentários
COMMENT ON TABLE organizations IS 'Tabela de organizações/empresas para sistema multi-tenant';
COMMENT ON COLUMN organizations.slug IS 'Identificador único usado em URLs (ex: empresa-abc)';
COMMENT ON COLUMN organizations.logo_url IS 'URL do logo armazenado no Supabase Storage';

-- ============================================
-- 2. Tabela de Temas Personalizados
-- ============================================
CREATE TABLE IF NOT EXISTS organization_themes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  
  -- Cores primárias
  primary_color TEXT DEFAULT '#1B5E20',
  primary_foreground TEXT DEFAULT '#FFFFFF',
  
  -- Cores secundárias
  secondary_color TEXT DEFAULT '#1565C0',
  secondary_foreground TEXT DEFAULT '#FFFFFF',
  
  -- Cores de destaque (accent)
  accent_color TEXT DEFAULT '#FF8F00',
  accent_foreground TEXT DEFAULT '#FFFFFF',
  
  -- Cores de background
  background_color TEXT DEFAULT '#FAFAFA',
  foreground_color TEXT DEFAULT '#37474F',
  
  -- Cores de card
  card_color TEXT DEFAULT '#F5F5F5',
  card_foreground TEXT DEFAULT '#37474F',
  
  -- Cores de borda
  border_color TEXT DEFAULT '#78909C',
  
  -- Cores de input
  input_color TEXT DEFAULT '#78909C',
  
  -- Cores muted
  muted_color TEXT DEFAULT '#546E7A',
  muted_foreground TEXT DEFAULT '#FFFFFF',
  
  -- Configurações de estilo
  border_radius TEXT DEFAULT '0.5rem',
  font_family TEXT DEFAULT 'Roboto',
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  -- Garantir que cada organização tenha apenas um tema
  UNIQUE(organization_id)
);

-- Comentários
COMMENT ON TABLE organization_themes IS 'Temas personalizados por organização (cores e estilos)';
COMMENT ON COLUMN organization_themes.border_radius IS 'Raio de borda padrão (ex: 0.5rem)';

-- ============================================
-- 3. Tabela de Relacionamento Usuário-Organização
-- ============================================
CREATE TABLE IF NOT EXISTS user_organizations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  role TEXT DEFAULT 'member' CHECK (role IN ('owner', 'admin', 'member')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  -- Garantir que um usuário não esteja duplicado na mesma organização
  UNIQUE(user_id, organization_id)
);

-- Comentários
COMMENT ON TABLE user_organizations IS 'Relacionamento entre usuários e organizações (multi-tenant)';
COMMENT ON COLUMN user_organizations.role IS 'Função do usuário: owner (dono), admin (administrador), member (membro)';

-- ============================================
-- 4. Índices para Performance
-- ============================================
CREATE INDEX IF NOT EXISTS idx_user_organizations_user_id ON user_organizations(user_id);
CREATE INDEX IF NOT EXISTS idx_user_organizations_org_id ON user_organizations(organization_id);
CREATE INDEX IF NOT EXISTS idx_organizations_slug ON organizations(slug);
CREATE INDEX IF NOT EXISTS idx_organizations_active ON organizations(is_active);

-- ============================================
-- 5. Função para atualizar updated_at automaticamente
-- ============================================
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Triggers para atualizar updated_at
CREATE TRIGGER update_organizations_updated_at BEFORE UPDATE ON organizations
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_organization_themes_updated_at BEFORE UPDATE ON organization_themes
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ============================================
-- 6. Row Level Security (RLS)
-- ============================================

-- Habilitar RLS nas tabelas
ALTER TABLE organizations ENABLE ROW LEVEL SECURITY;
ALTER TABLE organization_themes ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_organizations ENABLE ROW LEVEL SECURITY;

-- Políticas para organizations
-- Usuários podem ver organizações das quais fazem parte
CREATE POLICY "Users can view their organizations"
  ON organizations FOR SELECT
  USING (
    id IN (
      SELECT organization_id FROM user_organizations
      WHERE user_id = auth.uid()
    )
  );

-- Apenas owners e admins podem atualizar organizações
CREATE POLICY "Owners and admins can update organizations"
  ON organizations FOR UPDATE
  USING (
    id IN (
      SELECT organization_id FROM user_organizations
      WHERE user_id = auth.uid() AND role IN ('owner', 'admin')
    )
  );

-- Apenas owners podem deletar organizações
CREATE POLICY "Owners can delete organizations"
  ON organizations FOR DELETE
  USING (
    id IN (
      SELECT organization_id FROM user_organizations
      WHERE user_id = auth.uid() AND role = 'owner'
    )
  );

-- Políticas para organization_themes
-- Usuários podem ver temas de suas organizações
CREATE POLICY "Users can view their organization themes"
  ON organization_themes FOR SELECT
  USING (
    organization_id IN (
      SELECT organization_id FROM user_organizations
      WHERE user_id = auth.uid()
    )
  );

-- Apenas admins e owners podem atualizar temas
CREATE POLICY "Admins and owners can update themes"
  ON organization_themes FOR UPDATE
  USING (
    organization_id IN (
      SELECT organization_id FROM user_organizations
      WHERE user_id = auth.uid() AND role IN ('owner', 'admin')
    )
  );

-- Apenas owners podem inserir novos temas
CREATE POLICY "Owners can insert themes"
  ON organization_themes FOR INSERT
  WITH CHECK (
    organization_id IN (
      SELECT organization_id FROM user_organizations
      WHERE user_id = auth.uid() AND role = 'owner'
    )
  );

-- Políticas para user_organizations
-- Usuários podem ver suas próprias relações
CREATE POLICY "Users can view their own organization memberships"
  ON user_organizations FOR SELECT
  USING (user_id = auth.uid());

-- Admins e owners podem ver todos os membros de suas organizações
CREATE POLICY "Admins can view all members"
  ON user_organizations FOR SELECT
  USING (
    organization_id IN (
      SELECT organization_id FROM user_organizations
      WHERE user_id = auth.uid() AND role IN ('owner', 'admin')
    )
  );

-- Apenas admins e owners podem adicionar membros
CREATE POLICY "Admins can insert members"
  ON user_organizations FOR INSERT
  WITH CHECK (
    organization_id IN (
      SELECT organization_id FROM user_organizations
      WHERE user_id = auth.uid() AND role IN ('owner', 'admin')
    )
  );

-- Apenas admins e owners podem remover membros
CREATE POLICY "Admins can delete members"
  ON user_organizations FOR DELETE
  USING (
    organization_id IN (
      SELECT organization_id FROM user_organizations
      WHERE user_id = auth.uid() AND role IN ('owner', 'admin')
    )
  );

-- ============================================
-- 7. Dados iniciais de exemplo (opcional)
-- ============================================
-- Descomentar se quiser criar uma organização padrão para testes

-- INSERT INTO organizations (name, slug, is_active) 
-- VALUES ('Organização Padrão', 'organizacao-padrao', true)
-- ON CONFLICT (slug) DO NOTHING;

-- INSERT INTO organization_themes (
--   organization_id,
--   primary_color,
--   secondary_color,
--   accent_color
-- ) 
-- SELECT 
--   id,
--   '#1B5E20',
--   '#1565C0',
--   '#FF8F00'
-- FROM organizations 
-- WHERE slug = 'organizacao-padrao'
-- ON CONFLICT (organization_id) DO NOTHING;

