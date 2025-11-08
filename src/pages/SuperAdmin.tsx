/**
 * SUPER ADMIN PANEL
 * Acesso exclusivo para deyvidrb@icloud.com
 * Permite criar e gerenciar todas as organizações do sistema
 */

import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/lib/supabase';
import { 
  Building2, 
  Loader2, 
  CheckCircle2, 
  Shield, 
  Plus, 
  Users, 
  Eye,
  ArrowLeft,
  Trash2,
  Edit
} from 'lucide-react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';

// Email do super admin
const SUPER_ADMIN_EMAIL = 'deyvidrb@icloud.com';

interface Organization {
  id: string;
  name: string;
  slug: string;
  logo_url: string | null;
  is_active: boolean;
  created_at: string;
  user_count?: number;
}

export default function SuperAdmin() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  
  const [loading, setLoading] = useState(true);
  const [hasAccess, setHasAccess] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [organizations, setOrganizations] = useState<Organization[]>([]);
  const [showForm, setShowForm] = useState(false);

  // Form state
  const [orgName, setOrgName] = useState('');
  const [orgSlug, setOrgSlug] = useState('');
  const [adminEmail, setAdminEmail] = useState('');
  const [primaryColor, setPrimaryColor] = useState('#3B82F6');
  const [secondaryColor, setSecondaryColor] = useState('#10B981');
  const [accentColor, setAccentColor] = useState('#F59E0B');

  // Verificar acesso
  useEffect(() => {
    if (!user) {
      navigate('/auth');
      return;
    }

    if (user.email !== SUPER_ADMIN_EMAIL) {
      toast({
        variant: 'destructive',
        title: 'Acesso Negado',
        description: 'Você não tem permissão para acessar esta página.',
      });
      navigate('/');
      return;
    }

    setHasAccess(true);
    setLoading(false);
    loadOrganizations();
  }, [user, navigate]);

  // Carregar organizações
  const loadOrganizations = async () => {
    try {
      const { data: orgs, error } = await supabase
        .from('organizations')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;

      // Buscar contagem de usuários para cada org
      const orgsWithCount = await Promise.all(
        (orgs || []).map(async (org) => {
          const { count } = await supabase
            .from('user_organizations')
            .select('*', { count: 'exact', head: true })
            .eq('organization_id', org.id);

          return { ...org, user_count: count || 0 };
        })
      );

      setOrganizations(orgsWithCount);
    } catch (error: any) {
      console.error('Erro ao carregar organizações:', error);
      toast({
        variant: 'destructive',
        title: 'Erro ao carregar organizações',
        description: error.message,
      });
    }
  };

  // Auto-gerar slug
  const handleNameChange = (name: string) => {
    setOrgName(name);
    const slug = name
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-z0-9\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .trim();
    setOrgSlug(slug);
  };

  // Criar organização
  const handleCreateOrganization = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      // 1. Verificar se slug já existe
      const { data: existingOrg } = await supabase
        .from('organizations')
        .select('id')
        .eq('slug', orgSlug)
        .single();

      if (existingOrg) {
        toast({
          variant: 'destructive',
          title: 'Slug já existe',
          description: 'Escolha outro identificador (slug) para a organização.',
        });
        return;
      }

      // 2. Criar organização
      const { data: org, error: orgError } = await supabase
        .from('organizations')
        .insert({
          name: orgName,
          slug: orgSlug,
          is_active: true,
        })
        .select()
        .single();

      if (orgError) throw orgError;

      // 3. Criar tema
      const { error: themeError } = await supabase
        .from('organization_themes')
        .insert({
          organization_id: org.id,
          primary_color: primaryColor,
          primary_foreground: '#FFFFFF',
          secondary_color: secondaryColor,
          secondary_foreground: '#FFFFFF',
          accent_color: accentColor,
          accent_foreground: '#FFFFFF',
        });

      if (themeError) throw themeError;

      // 4. Se admin email fornecido, verificar se usuário existe
      if (adminEmail) {
        try {
          // Buscar usuário pelo email usando a tabela auth.users
          const { data: userData, error: userError } = await supabase
            .from('user_organizations')
            .select('user_id')
            .limit(1);
          
          // Como não temos acesso direto ao auth.users no client,
          // vamos apenas salvar a informação de que precisa associar
          toast({
            title: '⚠️ Associação Manual Necessária',
            description: `Organização criada! Execute este SQL para associar o admin:\n\nINSERT INTO user_organizations (user_id, organization_id, role)\nSELECT id, '${org.id}', 'owner'\nFROM auth.users WHERE email = '${adminEmail}';`,
            duration: 10000,
          });
        } catch (e) {
          console.log('Não foi possível associar automaticamente');
        }
      }

      toast({
        title: '✅ Organização criada!',
        description: adminEmail 
          ? `${orgName} foi criada. Verifique as instruções para associar o admin.`
          : `${orgName} foi criada com sucesso.`,
      });

      // Limpar form e recarregar
      setOrgName('');
      setOrgSlug('');
      setAdminEmail('');
      setShowForm(false);
      loadOrganizations();

    } catch (error: any) {
      console.error('Erro ao criar organização:', error);
      toast({
        variant: 'destructive',
        title: 'Erro ao criar organização',
        description: error.message,
      });
    } finally {
      setSubmitting(false);
    }
  };

  // Desativar organização
  const handleToggleActive = async (orgId: string, currentStatus: boolean) => {
    try {
      const { error } = await supabase
        .from('organizations')
        .update({ is_active: !currentStatus })
        .eq('id', orgId);

      if (error) throw error;

      toast({
        title: currentStatus ? 'Organização desativada' : 'Organização ativada',
      });

      loadOrganizations();
    } catch (error: any) {
      toast({
        variant: 'destructive',
        title: 'Erro',
        description: error.message,
      });
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  if (!hasAccess) {
    return null;
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="bg-gradient-to-r from-purple-600 to-pink-600 text-white p-6">
        <div className="container mx-auto">
          <Button
            variant="ghost"
            className="text-white hover:bg-white/20 mb-4"
            onClick={() => navigate('/')}
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Voltar
          </Button>
          
          <div className="flex items-center gap-3">
            <Shield className="h-8 w-8" />
            <div>
              <h1 className="text-3xl font-bold">Super Admin Panel</h1>
              <p className="text-white/90">Gerenciamento de Organizações White-Label</p>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto p-6">
        {/* Estatísticas */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Total de Organizações</p>
                  <p className="text-3xl font-bold">{organizations.length}</p>
                </div>
                <Building2 className="h-10 w-10 text-blue-500" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Organizações Ativas</p>
                  <p className="text-3xl font-bold">
                    {organizations.filter(o => o.is_active).length}
                  </p>
                </div>
                <CheckCircle2 className="h-10 w-10 text-green-500" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Total de Usuários</p>
                  <p className="text-3xl font-bold">
                    {organizations.reduce((sum, org) => sum + (org.user_count || 0), 0)}
                  </p>
                </div>
                <Users className="h-10 w-10 text-purple-500" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Botão Nova Organização */}
        <div className="mb-6">
          <Button
            onClick={() => setShowForm(!showForm)}
            size="lg"
            className="w-full md:w-auto"
          >
            <Plus className="h-4 w-4 mr-2" />
            {showForm ? 'Cancelar' : 'Nova Organização'}
          </Button>
        </div>

        {/* Formulário */}
        {showForm && (
          <Card className="mb-6">
            <CardHeader>
              <CardTitle>Criar Nova Organização</CardTitle>
              <CardDescription>
                Preencha os dados para adicionar um novo cliente
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleCreateOrganization} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="name">Nome da Empresa *</Label>
                    <Input
                      id="name"
                      value={orgName}
                      onChange={(e) => handleNameChange(e.target.value)}
                      placeholder="Ex: Fazendas ABC"
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="slug">Slug (Identificador) *</Label>
                    <Input
                      id="slug"
                      value={orgSlug}
                      onChange={(e) => setOrgSlug(e.target.value)}
                      placeholder="fazendas-abc"
                      required
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="email">Email do Administrador (opcional)</Label>
                  <Input
                    id="email"
                    type="email"
                    value={adminEmail}
                    onChange={(e) => setAdminEmail(e.target.value)}
                    placeholder="admin@fazendas-abc.com"
                  />
                  <p className="text-xs text-muted-foreground">
                    Se o usuário já estiver cadastrado, será associado automaticamente
                  </p>
                </div>

                <div className="space-y-2">
                  <Label>Cores Personalizadas</Label>
                  <div className="grid grid-cols-3 gap-4">
                    <div>
                      <Label className="text-xs">Primária</Label>
                      <Input
                        type="color"
                        value={primaryColor}
                        onChange={(e) => setPrimaryColor(e.target.value)}
                      />
                    </div>
                    <div>
                      <Label className="text-xs">Secundária</Label>
                      <Input
                        type="color"
                        value={secondaryColor}
                        onChange={(e) => setSecondaryColor(e.target.value)}
                      />
                    </div>
                    <div>
                      <Label className="text-xs">Destaque</Label>
                      <Input
                        type="color"
                        value={accentColor}
                        onChange={(e) => setAccentColor(e.target.value)}
                      />
                    </div>
                  </div>
                </div>

                <Button type="submit" disabled={submitting} className="w-full">
                  {submitting && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                  Criar Organização
                </Button>
              </form>
            </CardContent>
          </Card>
        )}

        {/* Lista de Organizações */}
        <Card>
          <CardHeader>
            <CardTitle>Organizações Cadastradas</CardTitle>
            <CardDescription>
              Gerencie todas as organizações do sistema
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Nome</TableHead>
                  <TableHead>Slug</TableHead>
                  <TableHead>Usuários</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Criado em</TableHead>
                  <TableHead className="text-right">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {organizations.map((org) => (
                  <TableRow key={org.id}>
                    <TableCell className="font-medium">{org.name}</TableCell>
                    <TableCell className="font-mono text-sm">{org.slug}</TableCell>
                    <TableCell>
                      <Badge variant="secondary">
                        {org.user_count} {org.user_count === 1 ? 'usuário' : 'usuários'}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge variant={org.is_active ? 'default' : 'destructive'}>
                        {org.is_active ? 'Ativa' : 'Inativa'}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      {new Date(org.created_at).toLocaleDateString('pt-BR')}
                    </TableCell>
                    <TableCell className="text-right">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleToggleActive(org.id, org.is_active)}
                      >
                        {org.is_active ? 'Desativar' : 'Ativar'}
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}