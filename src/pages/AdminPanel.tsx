/**
 * Painel de Administração da Organização
 * Permite personalização de tema, logo e gerenciamento de usuários
 */

import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { useTheme } from '@/providers/ThemeProvider';
import { checkUserPermission } from '@/lib/organizationServices';
import { ThemeEditor } from '@/components/admin/ThemeEditor';
import { LogoUploader } from '@/components/admin/LogoUploader';
import { UserManagement } from '@/components/admin/UserManagement';
import { InviteLinkGenerator } from '@/components/admin/InviteLinkGenerator';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { ArrowLeft, Settings, Palette, Image, Users, Shield, Link, Crown } from 'lucide-react';
import { Loader2 } from 'lucide-react';
import { DynamicLogo } from '@/components/DynamicLogo';

export default function AdminPanel() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { organizationId, organizationName, loading: themeLoading } = useTheme();
  const [hasPermission, setHasPermission] = useState<boolean | null>(null);
  const [checkingPermission, setCheckingPermission] = useState(true);
  
  // Verificar se é super admin
  const isSuperAdmin = user?.email === 'deyvidrb@icloud.com';

  useEffect(() => {
    console.log('🎨 AdminPanel montado!');
    console.log('👤 User:', user?.email);
    console.log('🏢 Organization ID:', organizationId);
    console.log('📛 Organization Name:', organizationName);
  }, []);

  useEffect(() => {
    async function checkPermission() {
      console.log('🔐 Verificando permissões...');
      console.log('User:', user?.email);
      console.log('Organization ID:', organizationId);
      
      if (!user || !organizationId) {
        console.log('❌ Sem usuário ou organização');
        setHasPermission(false);
        setCheckingPermission(false);
        return;
      }

      const permission = await checkUserPermission(organizationId);
      console.log('✅ Permissão obtida:', permission);
      setHasPermission(permission);
      setCheckingPermission(false);
    }

    checkPermission();
  }, [user, organizationId]);

  // Loading state
  if (checkingPermission || themeLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <p className="text-sm text-muted-foreground">Verificando permissões...</p>
        </div>
      </div>
    );
  }

  // No permission
  if (!hasPermission) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <div className="max-w-md w-full space-y-4">
          <Alert variant="destructive">
            <Shield className="h-4 w-4" />
            <AlertTitle>Acesso Negado</AlertTitle>
            <AlertDescription>
              Você não tem permissão para acessar o painel de administração.
              Apenas administradores e proprietários podem acessar esta área.
            </AlertDescription>
          </Alert>
          <Button onClick={() => navigate('/dashboard')} className="w-full">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Voltar ao Dashboard
          </Button>
        </div>
      </div>
    );
  }

  // No organization
  if (!organizationId) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <div className="max-w-md w-full space-y-4">
          <Alert>
            <Shield className="h-4 w-4" />
            <AlertTitle>Organização Não Encontrada</AlertTitle>
            <AlertDescription>
              Você não está associado a nenhuma organização. 
              Entre em contato com o suporte para resolver este problema.
            </AlertDescription>
          </Alert>
          <Button onClick={() => navigate('/dashboard')} className="w-full">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Voltar ao Dashboard
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50">
      {/* Header com destaque */}
      <div className="border-b bg-gradient-to-r from-green-600 to-blue-600 text-white shadow-lg">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button
                variant="outline"
                size="sm"
                onClick={() => navigate('/dashboard')}
                className="bg-white text-green-700 hover:bg-gray-100"
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                Voltar ao Dashboard
              </Button>
              
              {/* Botão Super Admin - visível apenas para deyvidrb@icloud.com */}
              {isSuperAdmin && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => navigate('/super-admin')}
                  className="bg-gradient-to-r from-purple-500 to-pink-500 text-white hover:from-purple-600 hover:to-pink-600 border-0"
                >
                  <Crown className="h-4 w-4 mr-2" />
                  Super Admin
                </Button>
              )}
              
              <div className="flex items-center gap-3">
                <div className="bg-white/20 p-3 rounded-full">
                  <Settings className="h-8 w-8" />
                </div>
                <div>
                  <h1 className="text-3xl font-bold flex items-center gap-2">
                    🎨 Painel de Administração
                  </h1>
                  <p className="text-white/90 text-lg">
                    {organizationName || 'Sua Organização'} - Personalização White-Label
                  </p>
                </div>
              </div>
            </div>
            <DynamicLogo size="md" className="bg-white p-2 rounded-lg" />
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="container mx-auto px-4 py-8">
        {/* Alerta de Boas-vindas bem visível */}
        <Alert className="mb-6 border-2 border-green-500 bg-green-50">
          <Shield className="h-5 w-5 text-green-600" />
          <AlertTitle className="text-xl font-bold text-green-800">
            🎉 Bem-vindo ao Painel de Administração!
          </AlertTitle>
          <AlertDescription className="text-green-700 text-base">
            Você está no painel administrativo do sistema. Aqui você pode personalizar cores, logo e gerenciar usuários da sua organização.
            <strong className="block mt-2">🔐 Acesso exclusivo para Administradores e Proprietários</strong>
          </AlertDescription>
        </Alert>

        <Tabs defaultValue="theme" className="w-full">
          <TabsList className="flex w-full overflow-x-auto bg-gray-100 border border-gray-300 shadow-sm text-xs gap-1 p-1 mb-6 md:mb-8 scrollbar-hide max-w-2xl">
            <TabsTrigger 
              value="theme" 
              className="flex items-center gap-1 md:gap-2 flex-shrink-0 min-w-[70px] px-2 md:px-3 py-2 text-[10px] md:text-sm data-[state=active]:bg-white data-[state=active]:text-gray-900 data-[state=active]:shadow-sm text-gray-600 hover:text-gray-900 font-medium"
            >
              <Palette className="h-3 w-3 md:h-4 md:w-4" />
              <span>Tema</span>
            </TabsTrigger>
            <TabsTrigger 
              value="logo" 
              className="flex items-center gap-1 md:gap-2 flex-shrink-0 min-w-[70px] px-2 md:px-3 py-2 text-[10px] md:text-sm data-[state=active]:bg-white data-[state=active]:text-gray-900 data-[state=active]:shadow-sm text-gray-600 hover:text-gray-900 font-medium"
            >
              <Image className="h-3 w-3 md:h-4 md:w-4" />
              <span>Logo</span>
            </TabsTrigger>
            <TabsTrigger 
              value="users" 
              className="flex items-center gap-1 md:gap-2 flex-shrink-0 min-w-[70px] px-2 md:px-3 py-2 text-[10px] md:text-sm data-[state=active]:bg-white data-[state=active]:text-gray-900 data-[state=active]:shadow-sm text-gray-600 hover:text-gray-900 font-medium"
            >
              <Users className="h-3 w-3 md:h-4 md:w-4" />
              <span>Usuários</span>
            </TabsTrigger>
            <TabsTrigger 
              value="invites" 
              className="flex items-center gap-1 md:gap-2 flex-shrink-0 min-w-[70px] px-2 md:px-3 py-2 text-[10px] md:text-sm data-[state=active]:bg-white data-[state=active]:text-gray-900 data-[state=active]:shadow-sm text-gray-600 hover:text-gray-900 font-medium"
            >
              <Link className="h-3 w-3 md:h-4 md:w-4" />
              <span>Convites</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="theme" className="space-y-6">
            <div className="max-w-4xl">
              <ThemeEditor />
            </div>
          </TabsContent>

          <TabsContent value="logo" className="space-y-6">
            <div className="max-w-2xl">
              <LogoUploader />
            </div>
          </TabsContent>

          <TabsContent value="users" className="space-y-6">
            <div className="max-w-4xl">
              <UserManagement />
            </div>
          </TabsContent>

          <TabsContent value="invites" className="space-y-6">
            <div className="max-w-4xl">
              {organizationId && <InviteLinkGenerator organizationId={organizationId} />}
            </div>
          </TabsContent>
        </Tabs>

        {/* Info Section */}
        <div className="mt-12 max-w-4xl">
          <Alert>
            <Shield className="h-4 w-4" />
            <AlertTitle>Sobre Personalizações</AlertTitle>
            <AlertDescription>
              As personalizações feitas aqui afetam apenas os usuários da sua organização.
              Outros usuários do FertiliSolo continuarão vendo o tema padrão da aplicação.
              Todas as alterações são aplicadas em tempo real.
            </AlertDescription>
          </Alert>
        </div>
      </div>
    </div>
  );
}

