/**
 * Componente para Gerenciamento de Usuários da Organização
 */

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { Loader2, Trash2, Users, Shield } from 'lucide-react';
import {
  getOrganizationMembers,
  removeOrganizationMember,
  updateMemberRole,
  UserRole,
} from '@/lib/organizationServices';
import { useTheme } from '@/providers/ThemeProvider';
import { Alert, AlertDescription } from '@/components/ui/alert';

interface Member {
  id: string;
  user_id: string;
  role: UserRole;
  created_at: string;
  email?: string;
  name?: string;
}

const roleLabels: Record<UserRole, string> = {
  owner: 'Proprietário',
  admin: 'Administrador',
  member: 'Membro',
};

const roleBadgeVariants: Record<UserRole, 'default' | 'secondary' | 'destructive'> = {
  owner: 'destructive',
  admin: 'default',
  member: 'secondary',
};

export function UserManagement() {
  const { organizationId } = useTheme();
  const { toast } = useToast();
  const [members, setMembers] = useState<Member[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (organizationId) {
      loadMembers();
    }
  }, [organizationId]);

  const loadMembers = async () => {
    if (!organizationId) return;

    setLoading(true);
    try {
      const { data, error } = await getOrganizationMembers(organizationId);
      
      if (error) throw error;
      
      setMembers(data || []);
    } catch (error: any) {
      console.error('Erro ao carregar membros:', error);
      toast({
        variant: 'destructive',
        title: 'Erro ao carregar membros',
        description: error.message,
      });
    } finally {
      setLoading(false);
    }
  };

  const handleRemoveMember = async (memberId: string) => {
    try {
      const { error } = await removeOrganizationMember(memberId);
      
      if (error) throw error;
      
      toast({
        title: 'Membro removido',
        description: 'O membro foi removido da organização',
      });

      loadMembers();
    } catch (error: any) {
      console.error('Erro ao remover membro:', error);
      toast({
        variant: 'destructive',
        title: 'Erro ao remover membro',
        description: error.message,
      });
    }
  };

  const handleChangeRole = async (memberId: string, newRole: UserRole) => {
    try {
      const { error } = await updateMemberRole(memberId, newRole);
      
      if (error) throw error;
      
      toast({
        title: 'Função atualizada',
        description: 'A função do membro foi atualizada',
      });

      loadMembers();
    } catch (error: any) {
      console.error('Erro ao atualizar função:', error);
      toast({
        variant: 'destructive',
        title: 'Erro ao atualizar função',
        description: error.message,
      });
    }
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-2">
          <Users className="h-5 w-5 text-primary" />
          <CardTitle className="text-gray-900">Gerenciamento de Usuários</CardTitle>
        </div>
        <CardDescription className="text-gray-700 font-medium">
          Gerencie os usuários que têm acesso à sua organização. Para adicionar novos usuários, utilize a aba "Convites".
        </CardDescription>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
          </div>
        ) : members.length === 0 ? (
          <Alert>
            <Shield className="h-4 w-4" />
            <AlertDescription>
              Nenhum membro encontrado. Adicione usuários para começar.
            </AlertDescription>
          </Alert>
        ) : (
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="text-gray-900 font-semibold">Nome</TableHead>
                  <TableHead className="text-gray-900 font-semibold">Email</TableHead>
                  <TableHead className="text-gray-900 font-semibold">Função</TableHead>
                  <TableHead className="text-gray-900 font-semibold">Data de Adição</TableHead>
                  <TableHead className="text-right text-gray-900 font-semibold">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {members.map((member) => (
                  <TableRow key={member.id}>
                    <TableCell className="text-gray-900 font-medium">
                      {member.name || 'Nome não disponível'}
                    </TableCell>
                    <TableCell className="text-gray-700 text-sm">
                      {member.email || 'Email não disponível'}
                    </TableCell>
                    <TableCell>
                      <Badge variant={roleBadgeVariants[member.role]}>
                        {roleLabels[member.role]}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-gray-900">
                      {new Date(member.created_at).toLocaleDateString('pt-BR')}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Select
                          value={member.role}
                          onValueChange={(value) => handleChangeRole(member.id, value as UserRole)}
                        >
                          <SelectTrigger className="w-32">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="member">Membro</SelectItem>
                            <SelectItem value="admin">Admin</SelectItem>
                            <SelectItem value="owner">Owner</SelectItem>
                          </SelectContent>
                        </Select>
                        <Button
                          variant="destructive"
                          size="sm"
                          onClick={() => handleRemoveMember(member.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}

        <Alert className="mt-4">
          <AlertDescription className="text-sm">
            <strong>Nota:</strong> Para adicionar novos usuários à organização, utilize a aba <strong>"Convites"</strong> para gerar links de convite que podem ser compartilhados com os novos membros.
          </AlertDescription>
        </Alert>
      </CardContent>
    </Card>
  );
}

