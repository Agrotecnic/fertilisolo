/**
 * Formulário para criar novas organizações
 */

import React, { useState, useCallback } from 'react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Loader2 } from 'lucide-react';
import { sanitizeSlug } from '@/utils/validators';
import { ThemeColors } from '@/types/common';

interface OrganizationFormData {
  name: string;
  slug: string;
  adminEmail: string;
  colors: ThemeColors;
}

interface OrganizationFormProps {
  onSubmit: (data: OrganizationFormData) => Promise<void>;
  onCancel: () => void;
}

export const OrganizationForm: React.FC<OrganizationFormProps> = React.memo(
  ({ onSubmit, onCancel }) => {
    const [formData, setFormData] = useState<OrganizationFormData>({
      name: '',
      slug: '',
      adminEmail: '',
      colors: {
        primary: '#3B82F6',
        secondary: '#10B981',
        accent: '#F59E0B',
      },
    });

    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleNameChange = useCallback((name: string) => {
      const slug = sanitizeSlug(name);
      setFormData((prev) => ({ ...prev, name, slug }));
    }, []);

    const handleSubmit = useCallback(
      async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);
        try {
          await onSubmit(formData);
          // Reset form
          setFormData({
            name: '',
            slug: '',
            adminEmail: '',
            colors: {
              primary: '#3B82F6',
              secondary: '#10B981',
              accent: '#F59E0B',
            },
          });
        } finally {
          setIsSubmitting(false);
        }
      },
      [formData, onSubmit]
    );

    return (
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Criar Nova Organização</CardTitle>
          <CardDescription>
            Preencha os dados para adicionar um novo cliente
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="name">Nome da Empresa *</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => handleNameChange(e.target.value)}
                  placeholder="Ex: Fazendas ABC"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="slug">Slug (Identificador) *</Label>
                <Input
                  id="slug"
                  value={formData.slug}
                  onChange={(e) =>
                    setFormData((prev) => ({ ...prev, slug: e.target.value }))
                  }
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
                value={formData.adminEmail}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    adminEmail: e.target.value,
                  }))
                }
                placeholder="admin@fazendas-abc.com"
              />
              <p className="text-xs text-muted-foreground">
                Se o usuário já estiver cadastrado, será associado
                automaticamente
              </p>
            </div>

            <div className="space-y-2">
              <Label>Cores Personalizadas</Label>
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <Label className="text-xs">Primária</Label>
                  <Input
                    type="color"
                    value={formData.colors.primary}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        colors: { ...prev.colors, primary: e.target.value },
                      }))
                    }
                  />
                </div>
                <div>
                  <Label className="text-xs">Secundária</Label>
                  <Input
                    type="color"
                    value={formData.colors.secondary}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        colors: { ...prev.colors, secondary: e.target.value },
                      }))
                    }
                  />
                </div>
                <div>
                  <Label className="text-xs">Destaque</Label>
                  <Input
                    type="color"
                    value={formData.colors.accent}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        colors: { ...prev.colors, accent: e.target.value },
                      }))
                    }
                  />
                </div>
              </div>
            </div>

            <div className="flex gap-2">
              <Button type="submit" disabled={isSubmitting} className="flex-1">
                {isSubmitting && (
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                )}
                Criar Organização
              </Button>
              <Button type="button" variant="outline" onClick={onCancel}>
                Cancelar
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    );
  }
);

OrganizationForm.displayName = 'OrganizationForm';

