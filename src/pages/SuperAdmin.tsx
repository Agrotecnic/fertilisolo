/**
 * SUPER ADMIN PANEL
 * Acesso exclusivo para deyvidrb@icloud.com
 * Permite criar e gerenciar todas as organizações do sistema
 */

import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';
import { useSuperAdmin } from '@/hooks/useSuperAdmin';
import { SuperAdminHeader } from '@/components/superadmin/SuperAdminHeader';
import { OrganizationStats } from '@/components/superadmin/OrganizationStats';
import { OrganizationForm } from '@/components/superadmin/OrganizationForm';
import { OrganizationTable } from '@/components/superadmin/OrganizationTable';
import { LoadingSpinner } from '@/components/common/LoadingSpinner';

export default function SuperAdmin() {
  const navigate = useNavigate();
  const [showForm, setShowForm] = useState(false);
  
  const {
    loading,
    hasAccess,
    organizations,
    createOrganization,
    toggleOrganizationActive,
  } = useSuperAdmin();


  if (loading) {
    return (
      <LoadingSpinner
        fullScreen
        message="Verificando permissões..."
        size="lg"
      />
    );
  }

  if (!hasAccess) {
    return null;
  }

  return (
    <div className="min-h-screen bg-background">
      <SuperAdminHeader onBack={() => navigate('/')} />

      <div className="container mx-auto p-6">
        <OrganizationStats organizations={organizations} />

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

        {showForm && (
          <OrganizationForm
            onSubmit={createOrganization}
            onCancel={() => setShowForm(false)}
          />
        )}

        <OrganizationTable
          organizations={organizations}
          onToggleActive={toggleOrganizationActive}
        />
      </div>
    </div>
  );
}