/**
 * Componente para exibir estatísticas das organizações
 */

import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Building2, CheckCircle2, Users } from 'lucide-react';
import { Organization } from '@/types/common';

interface OrganizationStatsProps {
  organizations: Organization[];
}

export const OrganizationStats: React.FC<OrganizationStatsProps> = React.memo(
  ({ organizations }) => {
    const activeCount = organizations.filter((o) => o.is_active).length;
    const totalUsers = organizations.reduce(
      (sum, org) => sum + (org.user_count || 0),
      0
    );

    return (
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">
                  Total de Organizações
                </p>
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
                <p className="text-sm text-muted-foreground">
                  Organizações Ativas
                </p>
                <p className="text-3xl font-bold">{activeCount}</p>
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
                <p className="text-3xl font-bold">{totalUsers}</p>
              </div>
              <Users className="h-10 w-10 text-purple-500" />
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }
);

OrganizationStats.displayName = 'OrganizationStats';

