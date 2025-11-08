-- Função para buscar membros da organização com detalhes do usuário
-- Esta função retorna os membros de uma organização incluindo nome e email do usuário

CREATE OR REPLACE FUNCTION get_organization_members_with_details(org_id UUID)
RETURNS TABLE (
  id UUID,
  user_id UUID,
  role TEXT,
  created_at TIMESTAMPTZ,
  email TEXT,
  name TEXT
) 
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    uo.id,
    uo.user_id,
    uo.role::TEXT,
    uo.created_at,
    au.email,
    COALESCE(
      au.raw_user_meta_data->>'full_name',
      au.raw_user_meta_data->>'name',
      SPLIT_PART(au.email, '@', 1),
      'Usuário'
    ) as name
  FROM user_organizations uo
  INNER JOIN auth.users au ON au.id = uo.user_id
  WHERE uo.organization_id = org_id
  ORDER BY uo.created_at DESC;
END;
$$;

-- Comentário explicativo
COMMENT ON FUNCTION get_organization_members_with_details IS 
'Retorna todos os membros de uma organização com seus detalhes de email e nome.
Usa SECURITY DEFINER para permitir acesso aos dados de auth.users de forma segura.';

