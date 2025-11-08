/**
 * Header do painel de super admin
 */

import React from 'react';
import { Button } from '@/components/ui/button';
import { Shield, ArrowLeft } from 'lucide-react';

interface SuperAdminHeaderProps {
  onBack: () => void;
}

export const SuperAdminHeader: React.FC<SuperAdminHeaderProps> = React.memo(
  ({ onBack }) => {
    return (
      <div className="bg-gradient-to-r from-purple-600 to-pink-600 text-white p-6">
        <div className="container mx-auto">
          <Button
            variant="ghost"
            className="text-white hover:bg-white/20 mb-4"
            onClick={onBack}
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Voltar
          </Button>

          <div className="flex items-center gap-3">
            <Shield className="h-8 w-8" />
            <div>
              <h1 className="text-3xl font-bold">Super Admin Panel</h1>
              <p className="text-white/90">
                Gerenciamento de Organizações White-Label
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }
);

SuperAdminHeader.displayName = 'SuperAdminHeader';

