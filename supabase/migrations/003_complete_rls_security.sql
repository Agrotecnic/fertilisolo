-- ============================================
-- MIGRAÇÃO COMPLETA DE SEGURANÇA MULTI-TENANT
-- ============================================
-- Esta migração garante isolamento total de dados entre organizações
-- Implementa Row Level Security (RLS) em todas as tabelas

-- ============================================
-- PARTE 1: Adicionar organization_id nas tabelas principais
-- ============================================

-- Adicionar organization_id em farms (se não existir)
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'farms' AND column_name = 'organization_id'
  ) THEN
    ALTER TABLE farms ADD COLUMN organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE;
    
    -- Criar índice para performance
    CREATE INDEX idx_farms_organization_id ON farms(organization_id);
    
    COMMENT ON COLUMN farms.organization_id IS 'Organização dona da fazenda - OBRIGATÓRIO para multi-tenant';
  END IF;
END $$;

-- Adicionar organization_id em plots (se não existir)
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'plots' AND column_name = 'organization_id'
  ) THEN
    ALTER TABLE plots ADD COLUMN organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE;
    
    -- Criar índice para performance
    CREATE INDEX idx_plots_organization_id ON plots(organization_id);
    
    COMMENT ON COLUMN plots.organization_id IS 'Organização dona do talhão - OBRIGATÓRIO para multi-tenant';
  END IF;
END $$;

-- Adicionar organization_id em soil_analyses (se não existir)
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'soil_analyses' AND column_name = 'organization_id'
  ) THEN
    ALTER TABLE soil_analyses ADD COLUMN organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE;
    
    -- Criar índice para performance
    CREATE INDEX idx_soil_analyses_organization_id ON soil_analyses(organization_id);
    
    COMMENT ON COLUMN soil_analyses.organization_id IS 'Organização dona da análise - OBRIGATÓRIO para multi-tenant';
  END IF;
END $$;

-- Adicionar organization_id em fertilizer_recommendations (se não existir)
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'fertilizer_recommendations' AND column_name = 'organization_id'
  ) THEN
    ALTER TABLE fertilizer_recommendations ADD COLUMN organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE;
    
    -- Criar índice para performance
    CREATE INDEX idx_fertilizer_recommendations_organization_id ON fertilizer_recommendations(organization_id);
    
    COMMENT ON COLUMN fertilizer_recommendations.organization_id IS 'Organização dona da recomendação - OBRIGATÓRIO para multi-tenant';
  END IF;
END $$;

-- ============================================
-- PARTE 2: Funções auxiliares de segurança
-- ============================================

-- Função para obter o organization_id do usuário atual
CREATE OR REPLACE FUNCTION get_user_organization_id()
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
STABLE
AS $$
DECLARE
  org_id UUID;
BEGIN
  SELECT organization_id INTO org_id
  FROM user_organizations
  WHERE user_id = auth.uid()
  LIMIT 1;
  
  RETURN org_id;
END;
$$;

COMMENT ON FUNCTION get_user_organization_id IS 
'Retorna o organization_id do usuário autenticado. Usado em políticas RLS.';

-- Função para verificar se usuário pertence a uma organização
CREATE OR REPLACE FUNCTION user_belongs_to_organization(org_id UUID)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
STABLE
AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1
    FROM user_organizations
    WHERE user_id = auth.uid()
    AND organization_id = org_id
  );
END;
$$;

COMMENT ON FUNCTION user_belongs_to_organization IS 
'Verifica se o usuário autenticado pertence à organização especificada.';

-- Função para verificar se usuário é admin ou owner de uma organização
CREATE OR REPLACE FUNCTION user_is_admin_of_organization(org_id UUID)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
STABLE
AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1
    FROM user_organizations
    WHERE user_id = auth.uid()
    AND organization_id = org_id
    AND role IN ('admin', 'owner')
  );
END;
$$;

COMMENT ON FUNCTION user_is_admin_of_organization IS 
'Verifica se o usuário é admin ou owner da organização.';

-- ============================================
-- PARTE 3: Habilitar RLS em todas as tabelas
-- ============================================

ALTER TABLE organizations ENABLE ROW LEVEL SECURITY;
ALTER TABLE organization_themes ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_organizations ENABLE ROW LEVEL SECURITY;
ALTER TABLE organization_invites ENABLE ROW LEVEL SECURITY;
ALTER TABLE farms ENABLE ROW LEVEL SECURITY;
ALTER TABLE plots ENABLE ROW LEVEL SECURITY;
ALTER TABLE soil_analyses ENABLE ROW LEVEL SECURITY;
ALTER TABLE fertilizer_recommendations ENABLE ROW LEVEL SECURITY;

-- ============================================
-- PARTE 4: Políticas RLS para ORGANIZATIONS
-- ============================================

-- Limpar políticas antigas se existirem
DROP POLICY IF EXISTS "Users can view their organization" ON organizations;
DROP POLICY IF EXISTS "Owners can update their organization" ON organizations;
DROP POLICY IF EXISTS "Owners can delete their organization" ON organizations;

-- Usuários podem ver apenas sua própria organização
CREATE POLICY "Users can view their organization"
ON organizations FOR SELECT
USING (
  id IN (
    SELECT organization_id 
    FROM user_organizations 
    WHERE user_id = auth.uid()
  )
);

-- Apenas owners podem atualizar a organização
CREATE POLICY "Owners can update their organization"
ON organizations FOR UPDATE
USING (
  id IN (
    SELECT organization_id 
    FROM user_organizations 
    WHERE user_id = auth.uid() AND role = 'owner'
  )
)
WITH CHECK (
  id IN (
    SELECT organization_id 
    FROM user_organizations 
    WHERE user_id = auth.uid() AND role = 'owner'
  )
);

-- Apenas owners podem deletar a organização
CREATE POLICY "Owners can delete their organization"
ON organizations FOR DELETE
USING (
  id IN (
    SELECT organization_id 
    FROM user_organizations 
    WHERE user_id = auth.uid() AND role = 'owner'
  )
);

-- ============================================
-- PARTE 5: Políticas RLS para ORGANIZATION_THEMES
-- ============================================

DROP POLICY IF EXISTS "Users can view their organization theme" ON organization_themes;
DROP POLICY IF EXISTS "Admins can update theme" ON organization_themes;

-- Usuários podem ver o tema da sua organização
CREATE POLICY "Users can view their organization theme"
ON organization_themes FOR SELECT
USING (
  organization_id IN (
    SELECT organization_id 
    FROM user_organizations 
    WHERE user_id = auth.uid()
  )
);

-- Admins e owners podem atualizar o tema
CREATE POLICY "Admins can update theme"
ON organization_themes FOR UPDATE
USING (
  organization_id IN (
    SELECT organization_id 
    FROM user_organizations 
    WHERE user_id = auth.uid() AND role IN ('admin', 'owner')
  )
)
WITH CHECK (
  organization_id IN (
    SELECT organization_id 
    FROM user_organizations 
    WHERE user_id = auth.uid() AND role IN ('admin', 'owner')
  )
);

-- ============================================
-- PARTE 6: Políticas RLS para USER_ORGANIZATIONS
-- ============================================

DROP POLICY IF EXISTS "Users can view members of their organization" ON user_organizations;
DROP POLICY IF EXISTS "Admins can manage members" ON user_organizations;
DROP POLICY IF EXISTS "Admins can delete members" ON user_organizations;

-- Usuários podem ver membros da sua organização
CREATE POLICY "Users can view members of their organization"
ON user_organizations FOR SELECT
USING (
  organization_id IN (
    SELECT organization_id 
    FROM user_organizations 
    WHERE user_id = auth.uid()
  )
);

-- Admins podem adicionar e atualizar membros
CREATE POLICY "Admins can manage members"
ON user_organizations FOR ALL
USING (
  organization_id IN (
    SELECT organization_id 
    FROM user_organizations 
    WHERE user_id = auth.uid() AND role IN ('admin', 'owner')
  )
)
WITH CHECK (
  organization_id IN (
    SELECT organization_id 
    FROM user_organizations 
    WHERE user_id = auth.uid() AND role IN ('admin', 'owner')
  )
);

-- ============================================
-- PARTE 7: Políticas RLS para ORGANIZATION_INVITES
-- ============================================

DROP POLICY IF EXISTS "Admins can view invites" ON organization_invites;
DROP POLICY IF EXISTS "Admins can manage invites" ON organization_invites;
DROP POLICY IF EXISTS "Anyone can validate invite token" ON organization_invites;

-- Admins podem ver convites da sua organização
CREATE POLICY "Admins can view invites"
ON organization_invites FOR SELECT
USING (
  organization_id IN (
    SELECT organization_id 
    FROM user_organizations 
    WHERE user_id = auth.uid() AND role IN ('admin', 'owner')
  )
);

-- Admins podem criar e gerenciar convites
CREATE POLICY "Admins can manage invites"
ON organization_invites FOR ALL
USING (
  organization_id IN (
    SELECT organization_id 
    FROM user_organizations 
    WHERE user_id = auth.uid() AND role IN ('admin', 'owner')
  )
)
WITH CHECK (
  organization_id IN (
    SELECT organization_id 
    FROM user_organizations 
    WHERE user_id = auth.uid() AND role IN ('admin', 'owner')
  )
);

-- Permitir que qualquer um valide um token de convite (para signup)
CREATE POLICY "Anyone can validate invite token"
ON organization_invites FOR SELECT
USING (is_active = true AND expires_at > NOW());

-- ============================================
-- PARTE 8: Políticas RLS para FARMS
-- ============================================

DROP POLICY IF EXISTS "Users can view farms of their organization" ON farms;
DROP POLICY IF EXISTS "Users can insert farms in their organization" ON farms;
DROP POLICY IF EXISTS "Users can update farms in their organization" ON farms;
DROP POLICY IF EXISTS "Users can delete farms in their organization" ON farms;

-- Ver fazendas da sua organização
CREATE POLICY "Users can view farms of their organization"
ON farms FOR SELECT
USING (organization_id = get_user_organization_id());

-- Criar fazendas na sua organização
CREATE POLICY "Users can insert farms in their organization"
ON farms FOR INSERT
WITH CHECK (organization_id = get_user_organization_id());

-- Atualizar fazendas da sua organização
CREATE POLICY "Users can update farms in their organization"
ON farms FOR UPDATE
USING (organization_id = get_user_organization_id())
WITH CHECK (organization_id = get_user_organization_id());

-- Deletar fazendas da sua organização
CREATE POLICY "Users can delete farms in their organization"
ON farms FOR DELETE
USING (organization_id = get_user_organization_id());

-- ============================================
-- PARTE 9: Políticas RLS para PLOTS
-- ============================================

DROP POLICY IF EXISTS "Users can view plots of their organization" ON plots;
DROP POLICY IF EXISTS "Users can insert plots in their organization" ON plots;
DROP POLICY IF EXISTS "Users can update plots in their organization" ON plots;
DROP POLICY IF EXISTS "Users can delete plots in their organization" ON plots;

-- Ver talhões da sua organização
CREATE POLICY "Users can view plots of their organization"
ON plots FOR SELECT
USING (organization_id = get_user_organization_id());

-- Criar talhões na sua organização
CREATE POLICY "Users can insert plots in their organization"
ON plots FOR INSERT
WITH CHECK (organization_id = get_user_organization_id());

-- Atualizar talhões da sua organização
CREATE POLICY "Users can update plots in their organization"
ON plots FOR UPDATE
USING (organization_id = get_user_organization_id())
WITH CHECK (organization_id = get_user_organization_id());

-- Deletar talhões da sua organização
CREATE POLICY "Users can delete plots in their organization"
ON plots FOR DELETE
USING (organization_id = get_user_organization_id());

-- ============================================
-- PARTE 10: Políticas RLS para SOIL_ANALYSES
-- ============================================

DROP POLICY IF EXISTS "Users can view analyses of their organization" ON soil_analyses;
DROP POLICY IF EXISTS "Users can insert analyses in their organization" ON soil_analyses;
DROP POLICY IF EXISTS "Users can update analyses in their organization" ON soil_analyses;
DROP POLICY IF EXISTS "Users can delete analyses in their organization" ON soil_analyses;

-- Ver análises da sua organização
CREATE POLICY "Users can view analyses of their organization"
ON soil_analyses FOR SELECT
USING (organization_id = get_user_organization_id());

-- Criar análises na sua organização
CREATE POLICY "Users can insert analyses in their organization"
ON soil_analyses FOR INSERT
WITH CHECK (organization_id = get_user_organization_id());

-- Atualizar análises da sua organização
CREATE POLICY "Users can update analyses in their organization"
ON soil_analyses FOR UPDATE
USING (organization_id = get_user_organization_id())
WITH CHECK (organization_id = get_user_organization_id());

-- Deletar análises da sua organização
CREATE POLICY "Users can delete analyses in their organization"
ON soil_analyses FOR DELETE
USING (organization_id = get_user_organization_id());

-- ============================================
-- PARTE 11: Políticas RLS para FERTILIZER_RECOMMENDATIONS
-- ============================================

DROP POLICY IF EXISTS "Users can view recommendations of their organization" ON fertilizer_recommendations;
DROP POLICY IF EXISTS "Users can insert recommendations in their organization" ON fertilizer_recommendations;
DROP POLICY IF EXISTS "Users can update recommendations in their organization" ON fertilizer_recommendations;
DROP POLICY IF EXISTS "Users can delete recommendations in their organization" ON fertilizer_recommendations;

-- Ver recomendações da sua organização
CREATE POLICY "Users can view recommendations of their organization"
ON fertilizer_recommendations FOR SELECT
USING (organization_id = get_user_organization_id());

-- Criar recomendações na sua organização
CREATE POLICY "Users can insert recommendations in their organization"
ON fertilizer_recommendations FOR INSERT
WITH CHECK (organization_id = get_user_organization_id());

-- Atualizar recomendações da sua organização
CREATE POLICY "Users can update recommendations in their organization"
ON fertilizer_recommendations FOR UPDATE
USING (organization_id = get_user_organization_id())
WITH CHECK (organization_id = get_user_organization_id());

-- Deletar recomendações da sua organização
CREATE POLICY "Users can delete recommendations in their organization"
ON fertilizer_recommendations FOR DELETE
USING (organization_id = get_user_organization_id());

-- ============================================
-- PARTE 12: Políticas para Storage (Logos)
-- ============================================

-- Nota: As políticas de storage devem ser criadas manualmente no Supabase Dashboard
-- ou via SQL separado, pois a sintaxe é específica do Storage

-- Ver todos os logos (público)
-- CREATE POLICY "Public can view logos"
-- ON storage.objects FOR SELECT
-- USING (bucket_id = 'organization-assets');

-- Admins podem fazer upload de logos
-- CREATE POLICY "Admins can upload logos"
-- ON storage.objects FOR INSERT
-- WITH CHECK (
--   bucket_id = 'organization-assets' 
--   AND auth.uid() IN (
--     SELECT user_id FROM user_organizations 
--     WHERE role IN ('admin', 'owner')
--   )
-- );

-- Admins podem deletar logos
-- CREATE POLICY "Admins can delete logos"
-- ON storage.objects FOR DELETE
-- USING (
--   bucket_id = 'organization-assets' 
--   AND auth.uid() IN (
--     SELECT user_id FROM user_organizations 
--     WHERE role IN ('admin', 'owner')
--   )
-- );

-- ============================================
-- PARTE 13: Triggers para garantir organization_id
-- ============================================

-- Função para definir automaticamente organization_id ao inserir
CREATE OR REPLACE FUNCTION set_organization_id_from_user()
RETURNS TRIGGER AS $$
BEGIN
  -- Se organization_id não foi definido, pegar do usuário
  IF NEW.organization_id IS NULL THEN
    NEW.organization_id := get_user_organization_id();
  END IF;
  
  -- Validar que o organization_id pertence ao usuário
  IF NOT user_belongs_to_organization(NEW.organization_id) THEN
    RAISE EXCEPTION 'Usuário não pertence a esta organização';
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Aplicar trigger em farms
DROP TRIGGER IF EXISTS ensure_organization_id_farms ON farms;
CREATE TRIGGER ensure_organization_id_farms
  BEFORE INSERT OR UPDATE ON farms
  FOR EACH ROW
  EXECUTE FUNCTION set_organization_id_from_user();

-- Aplicar trigger em plots
DROP TRIGGER IF EXISTS ensure_organization_id_plots ON plots;
CREATE TRIGGER ensure_organization_id_plots
  BEFORE INSERT OR UPDATE ON plots
  FOR EACH ROW
  EXECUTE FUNCTION set_organization_id_from_user();

-- Aplicar trigger em soil_analyses
DROP TRIGGER IF EXISTS ensure_organization_id_soil_analyses ON soil_analyses;
CREATE TRIGGER ensure_organization_id_soil_analyses
  BEFORE INSERT OR UPDATE ON soil_analyses
  FOR EACH ROW
  EXECUTE FUNCTION set_organization_id_from_user();

-- Aplicar trigger em fertilizer_recommendations
DROP TRIGGER IF EXISTS ensure_organization_id_fertilizer_recommendations ON fertilizer_recommendations;
CREATE TRIGGER ensure_organization_id_fertilizer_recommendations
  BEFORE INSERT OR UPDATE ON fertilizer_recommendations
  FOR EACH ROW
  EXECUTE FUNCTION set_organization_id_from_user();

-- ============================================
-- PARTE 14: Validação final
-- ============================================

-- Comentário final
COMMENT ON SCHEMA public IS 'Schema com Row Level Security (RLS) completo para multi-tenant. Cada organização tem isolamento total de dados.';

-- Log de sucesso
DO $$
BEGIN
  RAISE NOTICE '✅ Migração de segurança multi-tenant aplicada com sucesso!';
  RAISE NOTICE '✅ Row Level Security (RLS) habilitado em todas as tabelas';
  RAISE NOTICE '✅ Políticas de isolamento por organização implementadas';
  RAISE NOTICE '✅ Funções auxiliares de segurança criadas';
  RAISE NOTICE '✅ Triggers para validação automática aplicados';
  RAISE NOTICE '';
  RAISE NOTICE '⚠️  IMPORTANTE: Execute os comandos de Storage manualmente no Dashboard';
  RAISE NOTICE '⚠️  IMPORTANTE: Atualize dados existentes com organization_id se necessário';
END $$;

