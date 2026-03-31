/**
 * Editor de Tema - Permite alterar cores da aplicação
 */

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import { Loader2, Palette, Save, RotateCcw } from 'lucide-react';
import { updateOrganizationTheme, OrganizationTheme } from '@/lib/organizationServices';
import { useTheme } from '@/providers/ThemeProvider';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

interface ColorInputProps {
  label: string;
  value: string;
  onChange: (value: string) => void;
  description?: string;
}

const ColorInput: React.FC<ColorInputProps> = ({ label, value, onChange, description }) => {
  return (
    <div className="space-y-2">
      <Label htmlFor={label} className="text-sm font-medium text-gray-900">
        {label}
      </Label>
      <div className="flex gap-2 items-center">
        <Input
          type="color"
          id={label}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="w-16 h-10 cursor-pointer"
        />
        <Input
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder="#000000"
          className="flex-1 font-mono text-sm text-gray-900"
        />
      </div>
      {description && (
        <p className="text-xs text-gray-700 font-medium">{description}</p>
      )}
    </div>
  );
};

export function ThemeEditor() {
  const { theme: currentTheme, organizationId, refetch } = useTheme();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  // Estado local do tema
  const [themeState, setThemeState] = useState<Partial<OrganizationTheme>>({
    primary_color: '#1B5E20',
    primary_foreground: '#FFFFFF',
    secondary_color: '#1565C0',
    secondary_foreground: '#FFFFFF',
    accent_color: '#FF8F00',
    accent_foreground: '#FFFFFF',
    background_color: '#FAFAFA',
    foreground_color: '#37474F',
    card_color: '#F5F5F5',
    card_foreground: '#37474F',
    border_color: '#78909C',
    input_color: '#78909C',
    muted_color: '#546E7A',
    muted_foreground: '#FFFFFF',
    border_radius: '0.5rem',
    font_family: 'Roboto',
  });

  // Carregar tema atual quando disponível
  useEffect(() => {
    if (currentTheme) {
      setThemeState({
        primary_color: currentTheme.primary_color,
        primary_foreground: currentTheme.primary_foreground,
        secondary_color: currentTheme.secondary_color,
        secondary_foreground: currentTheme.secondary_foreground,
        accent_color: currentTheme.accent_color,
        accent_foreground: currentTheme.accent_foreground,
        background_color: currentTheme.background_color,
        foreground_color: currentTheme.foreground_color,
        card_color: currentTheme.card_color,
        card_foreground: currentTheme.card_foreground,
        border_color: currentTheme.border_color,
        input_color: currentTheme.input_color,
        muted_color: currentTheme.muted_color,
        muted_foreground: currentTheme.muted_foreground,
        border_radius: currentTheme.border_radius,
        font_family: currentTheme.font_family,
      });
    }
  }, [currentTheme]);

  const handleSave = async () => {
    if (!organizationId) {
      toast({
        variant: 'destructive',
        title: 'Erro',
        description: 'Organização não encontrada',
      });
      return;
    }

    setSaving(true);
    try {
      const { error } = await updateOrganizationTheme(organizationId, themeState);

      if (error) throw error;

      toast({
        title: 'Tema salvo com sucesso!',
        description: 'As alterações foram aplicadas. Recarregando...',
      });

      // Recarregar tema
      await refetch();
      
      // Forçar reload da página para aplicar o tema em tudo
      setTimeout(() => {
        window.location.reload();
      }, 500);
    } catch (error: any) {
      console.error('Erro ao salvar tema:', error);
      toast({
        variant: 'destructive',
        title: 'Erro ao salvar tema',
        description: error.message || 'Ocorreu um erro ao salvar as alterações',
      });
    } finally {
      setSaving(false);
    }
  };

  const handleReset = () => {
    if (currentTheme) {
      setThemeState({
        primary_color: currentTheme.primary_color,
        primary_foreground: currentTheme.primary_foreground,
        secondary_color: currentTheme.secondary_color,
        secondary_foreground: currentTheme.secondary_foreground,
        accent_color: currentTheme.accent_color,
        accent_foreground: currentTheme.accent_foreground,
        background_color: currentTheme.background_color,
        foreground_color: currentTheme.foreground_color,
        card_color: currentTheme.card_color,
        card_foreground: currentTheme.card_foreground,
        border_color: currentTheme.border_color,
        input_color: currentTheme.input_color,
        muted_color: currentTheme.muted_color,
        muted_foreground: currentTheme.muted_foreground,
        border_radius: currentTheme.border_radius,
        font_family: currentTheme.font_family,
      });
    }
  };

  return (
    <Card className="bg-white border-gray-200">
      <CardHeader className="pb-3 bg-gray-50">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
          <div className="flex items-center gap-2">
            <Palette className="h-5 w-5 text-blue-600" />
            <CardTitle className="text-gray-900 text-base md:text-lg font-bold">Editor de Tema</CardTitle>
          </div>
          <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
            <Button
              variant="outline"
              size="sm"
              onClick={handleReset}
              disabled={saving}
              className="w-full sm:w-auto border-gray-300 text-gray-700 hover:bg-gray-100"
            >
              <RotateCcw className="h-4 w-4 mr-2" />
              Resetar
            </Button>
            <Button
              size="sm"
              onClick={handleSave}
              disabled={saving}
              className="w-full sm:w-auto bg-blue-600 hover:bg-blue-700 text-white"
            >
              {saving ? (
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              ) : (
                <Save className="h-4 w-4 mr-2" />
              )}
              Salvar Alterações
            </Button>
          </div>
        </div>
        <CardDescription className="text-gray-700 font-medium text-sm mt-2">
          Personalize as cores e estilos da aplicação
        </CardDescription>
      </CardHeader>
      <CardContent className="bg-gray-50">
        <Tabs defaultValue="primary" className="w-full">
          <TabsList className="flex w-full overflow-x-auto bg-gray-100 border border-gray-300 shadow-sm text-xs gap-1 p-1 scrollbar-hide">
            <TabsTrigger 
              value="primary" 
              className="flex-shrink-0 min-w-[80px] px-2 py-2 text-[10px] md:text-xs data-[state=active]:bg-white data-[state=active]:text-gray-900 data-[state=active]:shadow-sm text-gray-600 hover:text-gray-900"
            >
              Primária
            </TabsTrigger>
            <TabsTrigger 
              value="secondary" 
              className="flex-shrink-0 min-w-[80px] px-2 py-2 text-[10px] md:text-xs data-[state=active]:bg-white data-[state=active]:text-gray-900 data-[state=active]:shadow-sm text-gray-600 hover:text-gray-900"
            >
              Secundária
            </TabsTrigger>
            <TabsTrigger 
              value="accent" 
              className="flex-shrink-0 min-w-[80px] px-2 py-2 text-[10px] md:text-xs data-[state=active]:bg-white data-[state=active]:text-gray-900 data-[state=active]:shadow-sm text-gray-600 hover:text-gray-900"
            >
              Destaque
            </TabsTrigger>
            <TabsTrigger 
              value="other" 
              className="flex-shrink-0 min-w-[80px] px-2 py-2 text-[10px] md:text-xs data-[state=active]:bg-white data-[state=active]:text-gray-900 data-[state=active]:shadow-sm text-gray-600 hover:text-gray-900"
            >
              Outras
            </TabsTrigger>
          </TabsList>

          <TabsContent value="primary" className="space-y-4 mt-4 bg-white p-4 rounded-md border border-gray-200">
            <ColorInput
              label="Cor Primária"
              value={themeState.primary_color || '#1B5E20'}
              onChange={(value) => setThemeState({ ...themeState, primary_color: value })}
              description="Cor principal da aplicação (botões, links, etc)"
            />
            <ColorInput
              label="Texto sobre Primária"
              value={themeState.primary_foreground || '#FFFFFF'}
              onChange={(value) => setThemeState({ ...themeState, primary_foreground: value })}
              description="Cor do texto quando está sobre a cor primária"
            />
          </TabsContent>

          <TabsContent value="secondary" className="space-y-4 mt-4 bg-white p-4 rounded-md border border-gray-200">
            <ColorInput
              label="Cor Secundária"
              value={themeState.secondary_color || '#1565C0'}
              onChange={(value) => setThemeState({ ...themeState, secondary_color: value })}
              description="Cor secundária da aplicação"
            />
            <ColorInput
              label="Texto sobre Secundária"
              value={themeState.secondary_foreground || '#FFFFFF'}
              onChange={(value) => setThemeState({ ...themeState, secondary_foreground: value })}
              description="Cor do texto quando está sobre a cor secundária"
            />
          </TabsContent>

          <TabsContent value="accent" className="space-y-4 mt-4 bg-white p-4 rounded-md border border-gray-200">
            <ColorInput
              label="Cor de Destaque"
              value={themeState.accent_color || '#FF8F00'}
              onChange={(value) => setThemeState({ ...themeState, accent_color: value })}
              description="Cor usada para destacar elementos importantes"
            />
            <ColorInput
              label="Texto sobre Destaque"
              value={themeState.accent_foreground || '#FFFFFF'}
              onChange={(value) => setThemeState({ ...themeState, accent_foreground: value })}
              description="Cor do texto quando está sobre a cor de destaque"
            />
          </TabsContent>

          <TabsContent value="other" className="space-y-4 mt-4 bg-white p-4 rounded-md border border-gray-200">
            <ColorInput
              label="Cor de Fundo"
              value={themeState.background_color || '#FAFAFA'}
              onChange={(value) => setThemeState({ ...themeState, background_color: value })}
              description="Cor de fundo da aplicação"
            />
            <ColorInput
              label="Cor do Texto"
              value={themeState.foreground_color || '#37474F'}
              onChange={(value) => setThemeState({ ...themeState, foreground_color: value })}
              description="Cor padrão do texto"
            />
            <ColorInput
              label="Cor dos Cards"
              value={themeState.card_color || '#F5F5F5'}
              onChange={(value) => setThemeState({ ...themeState, card_color: value })}
              description="Cor de fundo dos cards"
            />
            <ColorInput
              label="Cor das Bordas"
              value={themeState.border_color || '#78909C'}
              onChange={(value) => setThemeState({ ...themeState, border_color: value })}
              description="Cor das bordas e divisórias"
            />
          </TabsContent>
        </Tabs>

        <div className="mt-6 p-4 bg-gray-100 rounded-lg">
          <p className="text-sm text-gray-800 mb-2">
            <strong className="text-gray-900">Dica:</strong> Use o seletor de cores para escolher visualmente ou digite o código hexadecimal diretamente.
          </p>
          <p className="text-sm text-gray-800">
            As alterações serão aplicadas imediatamente após salvar e todos os usuários da organização verão o novo tema.
          </p>
        </div>
      </CardContent>
    </Card>
  );
}

