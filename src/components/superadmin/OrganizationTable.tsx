/**
 * Tabela de organizações
 */

import React, { useCallback } from 'react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Organization } from '@/types/common';

interface OrganizationTableProps {
  organizations: Organization[];
  onToggleActive: (orgId: string, currentStatus: boolean) => Promise<void>;
}

export const OrganizationTable: React.FC<OrganizationTableProps> = React.memo(
  ({ organizations, onToggleActive }) => {
    const handleToggle = useCallback(
      (orgId: string, currentStatus: boolean) => {
        onToggleActive(orgId, currentStatus);
      },
      [onToggleActive]
    );

    return (
      <Card>
        <CardHeader>
          <CardTitle>Organizações Cadastradas</CardTitle>
          <CardDescription>
            Gerencie todas as organizações do sistema
          </CardDescription>
        </CardHeader>
        <CardContent>
          {organizations.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              Nenhuma organização cadastrada ainda.
            </div>
          ) : (
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
                    <TableCell className="font-mono text-sm">
                      {org.slug}
                    </TableCell>
                    <TableCell>
                      <Badge variant="secondary">
                        {org.user_count}{' '}
                        {org.user_count === 1 ? 'usuário' : 'usuários'}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant={org.is_active ? 'default' : 'destructive'}
                      >
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
                        onClick={() => handleToggle(org.id, org.is_active)}
                      >
                        {org.is_active ? 'Desativar' : 'Ativar'}
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    );
  }
);

OrganizationTable.displayName = 'OrganizationTable';

