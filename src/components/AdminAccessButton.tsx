/**
 * Botão flutuante para acesso rápido ao painel admin
 * Visível apenas para admins e owners
 */

import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Settings } from 'lucide-react';
import { useTheme } from '@/providers/ThemeProvider';
import { checkUserPermission } from '@/lib/organizationServices';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';

export function AdminAccessButton() {
  const navigate = useNavigate();
  const { organizationId } = useTheme();
  const [hasPermission, setHasPermission] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function checkPermission() {
      if (!organizationId) {
        setHasPermission(false);
        setLoading(false);
        return;
      }

      const permission = await checkUserPermission(organizationId);
      setHasPermission(permission);
      setLoading(false);
    }

    checkPermission();
  }, [organizationId]);

  // Não mostrar se não tem permissão
  if (loading || !hasPermission) {
    return null;
  }

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            onClick={() => navigate('/admin')}
            className="fixed bottom-6 right-6 h-14 w-14 rounded-full shadow-lg hover:shadow-xl transition-all z-50"
            size="icon"
          >
            <Settings className="h-6 w-6" />
          </Button>
        </TooltipTrigger>
        <TooltipContent side="left" className="text-sm">
          <p>Painel de Administração</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}

