/**
 * Componente para Gerenciamento de Usuários da Organização
 */

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
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
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { Loader2, UserPlus, Trash2, Users, Shield } from 'lucide-react';
import {
  getOrganizationMembers,
  addOrganizationMember,
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
  const [dialogOpen, setDialogOpen] = useState(false);
  const [addingMember, setAddingMember] = useState(false);

  // Form state
  const [newUserEmail, setNewUserEmail] = useState('');
  const [newUserRole, setNewUserRole] = useState<UserRole>('member');

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

  const handleAddMember = async () => {
    if (!organizationId || !newUserEmail) return;

    setAddingMember(true);
    try {
      // Nota: Esta é uma versão simplificada. Em produção, você precisaria:
      // 1. Validar se o email existe no sistema
      // 2. Enviar um convite por email
      // 3. Aguardar aceitação do convite

      // Por enquanto, vamos apenas mostrar um aviso
      toast({
        title: 'Funcionalidade em desenvolvimento',
        description: 'O sistema de convites ainda não está implementado. Por enquanto, os usuários precisam ser adicionados manualmente no banco de dados.',
      });

      setDialogOpen(false);
      setNewUserEmail('');
      setNewUserRole('member');
    } catch (error: any) {
      console.error('Erro ao adicionar membro:', error);
      toast({
        variant: 'destructive',
        title: 'Erro ao adicionar membro',
        description: error.message,
      });
    } finally {
      setAddingMember(false);
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
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Users className="h-5 w-5 text-primary" />
            <CardTitle className="text-gray-900">Gerenciamento de Usuários</CardTitle>
          </div>
          <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <DialogTrigger asChild>
              <Button size="sm">
                <UserPlus className="h-4 w-4 mr-2" />
                Adicionar Usuário
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Adicionar Novo Usuário</DialogTitle>
                <DialogDescription>
                  Convide um usuário para fazer parte da sua organização
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <Label htmlFor="email">Email do Usuário</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="usuario@exemplo.com"
                    value={newUserEmail}
                    onChange={(e) => setNewUserEmail(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="role">Função</Label>
                  <Select
                    value={newUserRole}
                    onValueChange={(value) => setNewUserRole(value as UserRole)}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="member">Membro</SelectItem>
                      <SelectItem value="admin">Administrador</SelectItem>
                      <SelectItem value="owner">Proprietário</SelectItem>
                    </SelectContent>
                  </Select>
                  <p className="text-xs text-muted-foreground">
                    <strong>Membro:</strong> Acesso básico à aplicação<br />
                    <strong>Admin:</strong> Pode gerenciar usuários e tema<br />
                    <strong>Owner:</strong> Controle total da organização
                  </p>
                </div>
              </div>
              <DialogFooter>
                <Button
                  variant="outline"
                  onClick={() => setDialogOpen(false)}
                  disabled={addingMember}
                >
                  Cancelar
                </Button>
                <Button onClick={handleAddMember} disabled={addingMember || !newUserEmail}>
                  {addingMember && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                  Adicionar
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
        <CardDescription className="text-gray-700 font-medium">
          Gerencie os usuários que têm acesso à sua organização
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
                  <TableHead className="text-gray-900 font-semibold">ID do Usuário</TableHead>
                  <TableHead className="text-gray-900 font-semibold">Função</TableHead>
                  <TableHead className="text-gray-900 font-semibold">Data de Adição</TableHead>
                  <TableHead className="text-right text-gray-900 font-semibold">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {members.map((member) => (
                  <TableRow key={member.id}>
                    <TableCell className="font-mono text-sm text-gray-900">
                      {member.user_id.substring(0, 8)}...
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
            <strong>Nota:</strong> O sistema de convites por email ainda está em desenvolvimento.
            Por enquanto, os usuários precisam ser adicionados manualmente através do banco de dados
            ou podem se cadastrar normalmente e serem associados à organização posteriormente.
          </AlertDescription>
        </Alert>
      </CardContent>
    </Card>
  );
}

