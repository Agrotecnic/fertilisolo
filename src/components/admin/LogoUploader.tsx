/**
 * Componente para Upload de Logo da Organização
 */

import React, { useState, useRef } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { Loader2, Upload, Trash2, Image as ImageIcon } from 'lucide-react';
import { uploadOrganizationLogo, removeOrganizationLogo } from '@/lib/organizationServices';
import { useTheme } from '@/providers/ThemeProvider';
import { Alert, AlertDescription } from '@/components/ui/alert';

export function LogoUploader() {
  const { logo, organizationId, refetch } = useTheme();
  const { toast } = useToast();
  const [uploading, setUploading] = useState(false);
  const [removing, setRemoving] = useState(false);
  const [preview, setPreview] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    
    if (!file) return;

    // Validar tipo de arquivo
    if (!file.type.startsWith('image/')) {
      toast({
        variant: 'destructive',
        title: 'Arquivo inválido',
        description: 'Por favor, selecione uma imagem (PNG, JPG, SVG, etc)',
      });
      return;
    }

    // Validar tamanho (máximo 2MB)
    if (file.size > 2 * 1024 * 1024) {
      toast({
        variant: 'destructive',
        title: 'Arquivo muito grande',
        description: 'O tamanho máximo é 2MB',
      });
      return;
    }

    // Criar preview
    const reader = new FileReader();
    reader.onloadend = () => {
      setPreview(reader.result as string);
    };
    reader.readAsDataURL(file);

    // Upload automático
    handleUpload(file);
  };

  const handleUpload = async (file: File) => {
    if (!organizationId) {
      toast({
        variant: 'destructive',
        title: 'Erro',
        description: 'Organização não encontrada',
      });
      return;
    }

    setUploading(true);
    try {
      const { data, error } = await uploadOrganizationLogo(organizationId, file);

      if (error) throw error;

      toast({
        title: 'Logo enviado com sucesso!',
        description: 'O novo logo já está visível. Recarregando...',
      });

      // Recarregar tema
      await refetch();
      setPreview(null);
      
      // Forçar reload para aplicar o logo em tudo
      setTimeout(() => {
        window.location.reload();
      }, 500);
    } catch (error: any) {
      console.error('Erro ao fazer upload:', error);
      toast({
        variant: 'destructive',
        title: 'Erro ao enviar logo',
        description: error.message || 'Ocorreu um erro ao enviar o arquivo',
      });
      setPreview(null);
    } finally {
      setUploading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const handleRemove = async () => {
    if (!organizationId || !logo) return;

    setRemoving(true);
    try {
      const { error } = await removeOrganizationLogo(organizationId, logo);

      if (error) throw error;

      toast({
        title: 'Logo removido',
        description: 'O logo padrão será usado',
      });

      // Recarregar tema
      await refetch();
    } catch (error: any) {
      console.error('Erro ao remover logo:', error);
      toast({
        variant: 'destructive',
        title: 'Erro ao remover logo',
        description: error.message || 'Ocorreu um erro ao remover o logo',
      });
    } finally {
      setRemoving(false);
    }
  };

  const triggerFileInput = () => {
    fileInputRef.current?.click();
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-2">
          <ImageIcon className="h-5 w-5 text-primary" />
          <CardTitle className="text-gray-900">Logo da Organização</CardTitle>
        </div>
        <CardDescription className="text-gray-700 font-medium">
          Faça upload do logo personalizado da sua organização
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Preview do Logo Atual */}
        <div className="flex flex-col items-center justify-center p-6 border-2 border-dashed border-border rounded-lg bg-muted/50">
          {(preview || logo) ? (
            <div className="space-y-4 w-full">
              <div className="flex justify-center">
                <img
                  src={preview || logo || ''}
                  alt="Logo Preview"
                  className="max-h-32 max-w-full object-contain"
                />
              </div>
              {!preview && (
                <p className="text-sm text-center text-gray-700 font-medium">
                  Logo atual da organização
                </p>
              )}
            </div>
          ) : (
            <div className="text-center space-y-2">
              <ImageIcon className="h-12 w-12 mx-auto text-gray-400" />
              <p className="text-sm text-gray-700 font-medium">
                Nenhum logo personalizado
              </p>
            </div>
          )}
        </div>

        {/* Input oculto */}
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          onChange={handleFileSelect}
          className="hidden"
        />

        {/* Botões de Ação */}
        <div className="flex gap-2">
          <Button
            onClick={triggerFileInput}
            disabled={uploading || removing}
            className="flex-1"
          >
            {uploading ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Enviando...
              </>
            ) : (
              <>
                <Upload className="h-4 w-4 mr-2" />
                {logo ? 'Alterar Logo' : 'Enviar Logo'}
              </>
            )}
          </Button>

          {logo && (
            <Button
              variant="destructive"
              onClick={handleRemove}
              disabled={uploading || removing}
            >
              {removing ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Trash2 className="h-4 w-4" />
              )}
            </Button>
          )}
        </div>

        {/* Informações */}
        <Alert className="bg-gray-50">
          <AlertDescription className="text-sm text-gray-800">
            <strong className="text-gray-900">Recomendações:</strong>
            <ul className="list-disc list-inside mt-2 space-y-1 text-gray-800">
              <li>Formato: PNG, JPG ou SVG</li>
              <li>Tamanho máximo: 2MB</li>
              <li>Proporção recomendada: horizontal ou quadrada</li>
              <li>Fundo transparente (PNG/SVG) funciona melhor</li>
            </ul>
          </AlertDescription>
        </Alert>
      </CardContent>
    </Card>
  );
}

