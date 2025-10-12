-- Migration: Create organization invites system
-- Description: Sistema de links de convite para onboarding automático de usuários

-- Criar tabela de convites
CREATE TABLE IF NOT EXISTS organization_invites (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  token TEXT UNIQUE NOT NULL,
  role TEXT NOT NULL CHECK (role IN ('admin', 'member')),
  created_by UUID NOT NULL REFERENCES auth.users(id),
  expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
  uses_remaining INTEGER,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Comentários para documentação
COMMENT ON TABLE organization_invites IS 'Armazena links de convite para onboarding de usuários';
COMMENT ON COLUMN organization_invites.token IS 'Token único do convite (UUID)';
COMMENT ON COLUMN organization_invites.role IS 'Função que o usuário terá ao aceitar (admin ou member)';
COMMENT ON COLUMN organization_invites.uses_remaining IS 'Número de usos restantes (NULL = ilimitado)';
COMMENT ON COLUMN organization_invites.is_active IS 'Se o convite está ativo (pode ser desativado manualmente)';

-- Índices para performance
CREATE INDEX idx_invites_token ON organization_invites(token);
CREATE INDEX idx_invites_org ON organization_invites(organization_id);
CREATE INDEX idx_invites_expires ON organization_invites(expires_at);
CREATE INDEX idx_invites_active ON organization_invites(is_active) WHERE is_active = true;

-- Trigger para updated_at
CREATE TRIGGER update_organization_invites_updated_at
  BEFORE UPDATE ON organization_invites
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Habilitar RLS
ALTER TABLE organization_invites ENABLE ROW LEVEL SECURITY;

-- RLS Policy: Admins/Owners podem criar convites
CREATE POLICY "Admins can create invites"
ON organization_invites FOR INSERT
WITH CHECK (
  EXISTS (
    SELECT 1 FROM user_organizations
    WHERE user_id = auth.uid()
    AND organization_id = organization_invites.organization_id
    AND role IN ('admin', 'owner')
  )
);

-- RLS Policy: Admins/Owners podem ver convites da sua org
CREATE POLICY "Admins can view invites"
ON organization_invites FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM user_organizations
    WHERE user_id = auth.uid()
    AND organization_id = organization_invites.organization_id
    AND role IN ('admin', 'owner')
  )
);

-- RLS Policy: Qualquer um pode ler convite válido pelo token (para validação)
CREATE POLICY "Anyone can read valid invite by token"
ON organization_invites FOR SELECT
USING (
  is_active = true 
  AND expires_at > NOW()
  AND (uses_remaining IS NULL OR uses_remaining > 0)
);

-- RLS Policy: Admins/Owners podem atualizar convites (decrementar usos, desativar)
CREATE POLICY "Admins can update invites"
ON organization_invites FOR UPDATE
USING (
  EXISTS (
    SELECT 1 FROM user_organizations
    WHERE user_id = auth.uid()
    AND organization_id = organization_invites.organization_id
    AND role IN ('admin', 'owner')
  )
);

-- RLS Policy: Admins/Owners podem deletar convites
CREATE POLICY "Admins can delete invites"
ON organization_invites FOR DELETE
USING (
  EXISTS (
    SELECT 1 FROM user_organizations
    WHERE user_id = auth.uid()
    AND organization_id = organization_invites.organization_id
    AND role IN ('admin', 'owner')
  )
);

-- Função helper para validar convite
CREATE OR REPLACE FUNCTION validate_invite_token(invite_token TEXT)
RETURNS TABLE (
  invite_id UUID,
  organization_id UUID,
  organization_name TEXT,
  role TEXT
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    i.id,
    i.organization_id,
    o.name,
    i.role
  FROM organization_invites i
  JOIN organizations o ON o.id = i.organization_id
  WHERE i.token = invite_token
    AND i.is_active = true
    AND i.expires_at > NOW()
    AND (i.uses_remaining IS NULL OR i.uses_remaining > 0);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Função para decrementar usos do convite
CREATE OR REPLACE FUNCTION use_invite(invite_token TEXT, user_id UUID)
RETURNS BOOLEAN AS $$
DECLARE
  invite_record RECORD;
BEGIN
  -- Buscar convite válido
  SELECT * INTO invite_record
  FROM organization_invites
  WHERE token = invite_token
    AND is_active = true
    AND expires_at > NOW()
    AND (uses_remaining IS NULL OR uses_remaining > 0)
  FOR UPDATE;

  IF NOT FOUND THEN
    RETURN FALSE;
  END IF;

  -- Inserir associação usuário-organização
  INSERT INTO user_organizations (user_id, organization_id, role)
  VALUES (user_id, invite_record.organization_id, invite_record.role)
  ON CONFLICT (user_id, organization_id) DO NOTHING;

  -- Decrementar usos se não for ilimitado
  IF invite_record.uses_remaining IS NOT NULL THEN
    UPDATE organization_invites
    SET uses_remaining = uses_remaining - 1
    WHERE id = invite_record.id;
  END IF;

  RETURN TRUE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant permissions
GRANT EXECUTE ON FUNCTION validate_invite_token(TEXT) TO authenticated, anon;
GRANT EXECUTE ON FUNCTION use_invite(TEXT, UUID) TO authenticated;

