import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { toast } from '@/hooks/use-toast';
import { Link, Copy, Check, Trash2, UserPlus, Clock, Users } from 'lucide-react';
import {
  createInviteLink,
  getOrganizationInvites,
  deactivateInvite,
} from '@/lib/organizationServices';

interface InviteLinkGeneratorProps {
  organizationId: string;
}

export const InviteLinkGenerator: React.FC<InviteLinkGeneratorProps> = ({ organizationId }) => {
  const [role, setRole] = useState<'admin' | 'member'>('member');
  const [expiresInDays, setExpiresInDays] = useState(7);
  const [maxUses, setMaxUses] = useState<number | undefined>(undefined);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [invites, setInvites] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadInvites();
  }, [organizationId]);

  const loadInvites = async () => {
    try {
      const { data, error } = await getOrganizationInvites(organizationId);
      if (error) throw error;
      setInvites(data || []);
    } catch (error: any) {
      console.error('Erro ao carregar convites:', error);
    }
  };

  const handleGenerateLink = async () => {
    setLoading(true);
    try {
      const { error } = await createInviteLink(
        organizationId,
        role,
        expiresInDays,
        maxUses
      );

      if (error) throw error;

      toast({
        title: 'Link de convite gerado! 🎉',
        description: 'O link aparecerá na lista abaixo. Clique em "Copiar Link" para compartilhar.',
      });

      // Recarregar lista de convites
      await loadInvites();
      
      // Resetar formulário
      setRole('member');
      setExpiresInDays(7);
      setMaxUses(undefined);
    } catch (error: any) {
      console.error('Erro ao gerar link:', error);
      toast({
        variant: 'destructive',
        title: 'Erro ao gerar link',
        description: error.message,
      });
    } finally {
      setLoading(false);
    }
  };

  const handleCopyLink = async (token: string, inviteId: string) => {
    const inviteUrl = `${window.location.origin}/signup?invite=${token}`;
    await navigator.clipboard.writeText(inviteUrl);
    setCopiedId(inviteId);
    setTimeout(() => setCopiedId(null), 2000);
    toast({
      title: 'Link copiado! 📋',
      description: 'Cole e envie para o novo usuário.',
    });
  };

  const handleDeactivate = async (inviteId: string) => {
    try {
      const { error } = await deactivateInvite(inviteId);
      if (error) throw error;
      
      toast({
        title: 'Convite desativado',
        description: 'Este link não pode mais ser usado.',
      });
      await loadInvites();
    } catch (error: any) {
      toast({
        variant: 'destructive',
        title: 'Erro',
        description: error.message,
      });
    }
  };

  const formatExpirationDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInDays = Math.ceil((date.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
    
    if (diffInDays < 0) return 'Expirado';
    if (diffInDays === 0) return 'Expira hoje';
    if (diffInDays === 1) return 'Expira amanhã';
    return `Expira em ${diffInDays} dias`;
  };

  return (
    <Card className="border-border">
      <CardHeader>
        <CardTitle className="text-gray-900 flex items-center gap-2">
          <UserPlus className="h-5 w-5" />
          Links de Convite
        </CardTitle>
        <CardDescription className="text-gray-700 font-medium">
          Gere links únicos para convidar usuários diretamente para sua organização
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Formulário de Geração */}
        <div className="space-y-4 p-4 bg-primary/5 rounded-lg border border-primary/20">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <Label className="text-gray-900 font-semibold">Função</Label>
              <Select value={role} onValueChange={(v) => setRole(v as any)}>
                <SelectTrigger className="bg-white">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="member">Membro</SelectItem>
                  <SelectItem value="admin">Administrador</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label className="text-gray-900 font-semibold">Expira em (dias)</Label>
              <Input
                type="number"
                value={expiresInDays}
                onChange={(e) => setExpiresInDays(parseInt(e.target.value))}
                min={1}
                max={90}
                className="bg-white"
              />
            </div>

            <div>
              <Label className="text-gray-900 font-semibold">Usos máximos</Label>
              <Input
                type="number"
                placeholder="Ilimitado"
                value={maxUses || ''}
                onChange={(e) => setMaxUses(e.target.value ? parseInt(e.target.value) : undefined)}
                min={1}
                className="bg-white"
              />
              <p className="text-xs text-gray-500 mt-1">Deixe vazio para ilimitado</p>
            </div>
          </div>

          <Button
            onClick={handleGenerateLink}
            disabled={loading}
            className="w-full bg-primary hover:bg-primary/90 text-primary-foreground"
          >
            <Link className="h-4 w-4 mr-2" />
            {loading ? 'Gerando...' : 'Gerar Link de Convite'}
          </Button>
        </div>

        {/* Lista de Convites Ativos */}
        <div>
          <h3 className="text-gray-900 font-semibold mb-3 flex items-center gap-2">
            <Users className="h-4 w-4" />
            Convites Ativos ({invites.length})
          </h3>
          {invites.length === 0 ? (
            <div className="text-center py-8 px-4 bg-gray-50 rounded-lg border-2 border-dashed border-gray-200">
              <Link className="h-12 w-12 mx-auto text-gray-400 mb-3" />
              <p className="text-gray-500 text-sm font-medium">Nenhum convite ativo</p>
              <p className="text-gray-400 text-xs mt-1">Gere seu primeiro convite acima</p>
            </div>
          ) : (
            <div className="space-y-3">
              {invites.map((invite) => {
                const inviteUrl = `${window.location.origin}/signup?invite=${invite.token}`;
                const isCopied = copiedId === invite.id;
                
                return (
                  <div
                    key={invite.id}
                    className="p-4 bg-gray-50 rounded-lg border border-gray-200 hover:border-primary/50 transition-colors"
                  >
                    {/* Header com role e ações */}
                    <div className="flex items-center justify-between mb-3">
                      <span className={`inline-flex items-center px-2.5 py-1 rounded text-xs font-medium ${
                        invite.role === 'admin' 
                          ? 'bg-purple-100 text-purple-800' 
                          : 'bg-blue-100 text-blue-800'
                      }`}>
                        {invite.role === 'admin' ? '👑 Administrador' : '👤 Membro'}
                      </span>
                      <div className="flex items-center gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleCopyLink(invite.token, invite.id)}
                          className={isCopied ? 'bg-green-50 border-green-200' : ''}
                        >
                          {isCopied ? (
                            <>
                              <Check className="h-4 w-4 mr-1.5 text-green-600" />
                              <span className="text-green-700">Copiado!</span>
                            </>
                          ) : (
                            <>
                              <Copy className="h-4 w-4 mr-1.5" />
                              Copiar Link
                            </>
                          )}
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDeactivate(invite.id)}
                          className="hover:bg-red-50"
                        >
                          <Trash2 className="h-4 w-4 text-red-600" />
                        </Button>
                      </div>
                    </div>

                    {/* Link visível */}
                    <div className="mb-3 p-2 bg-white rounded border border-gray-200">
                      <code className="text-xs text-gray-600 break-all">
                        {inviteUrl}
                      </code>
                    </div>

                    {/* Informações */}
                    <div className="flex items-center gap-4 text-xs text-gray-600">
                      <span className="flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        {formatExpirationDate(invite.expires_at)}
                      </span>
                      {invite.uses_remaining !== null && (
                        <span className="flex items-center gap-1">
                          <Users className="h-3 w-3" />
                          {invite.uses_remaining} {invite.uses_remaining === 1 ? 'uso' : 'usos'} restante{invite.uses_remaining !== 1 ? 's' : ''}
                        </span>
                      )}
                      {invite.uses_remaining === null && (
                        <span className="flex items-center gap-1 text-green-600 font-medium">
                          ♾️ Usos ilimitados
                        </span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Dicas */}
        <div className="space-y-2">
          <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
            <p className="text-sm text-blue-900">
              <strong>💡 Dica:</strong> Os links ficam visíveis na lista enquanto os convites estiverem ativos. Clique em "Copiar Link" para compartilhar.
            </p>
          </div>
          <div className="p-3 bg-amber-50 border border-amber-200 rounded-lg">
            <p className="text-sm text-amber-900">
              <strong>⚠️ Importante:</strong> Os convites expiram automaticamente. Você pode desativar um convite a qualquer momento clicando no ícone da lixeira.
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

