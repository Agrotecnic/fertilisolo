import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from '@/components/ui/use-toast';
import { AlertCircle, Loader2 } from 'lucide-react';
import { saveFarm, Farm } from '@/lib/services';

const formSchema = z.object({
  name: z.string().min(1, 'Nome da fazenda é obrigatório'),
  location: z.string().optional(),
  area_size: z.number().min(0, 'Área não pode ser negativa').optional(),
  area_unit: z.string().optional()
});

type FormData = z.infer<typeof formSchema>;

interface FarmFormProps {
  onFarmSaved: (farm: Farm) => void;
}

export const FarmForm: React.FC<FarmFormProps> = ({ onFarmSaved }) => {
  const [isLoading, setIsLoading] = useState(false);
  
  const { register, handleSubmit, formState: { errors }, reset } = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: '',
      location: '',
      area_size: undefined,
      area_unit: 'hectares'
    }
  });

  const onSubmit = async (data: FormData) => {
    setIsLoading(true);
    try {
      // Converter área para número se estiver definida e garantir que name exista
      const farmData: Farm = {
        name: data.name, // Garantimos que name é fornecido
        location: data.location,
        area_size: data.area_size,
        area_unit: data.area_unit
      };

      const { data: savedFarm, error } = await saveFarm(farmData);
      
      if (error) throw error;
      
      toast({
        title: "Fazenda cadastrada com sucesso!",
        description: `A fazenda ${data.name} foi salva no banco de dados.`,
      });
      
      reset();
      
      if (savedFarm && savedFarm[0]) {
        onFarmSaved(savedFarm[0]);
      }
    } catch (error: any) {
      console.error('Erro ao salvar fazenda:', error);
      toast({
        variant: 'destructive',
        title: "Erro ao cadastrar fazenda",
        description: error.message || "Ocorreu um erro ao salvar os dados."
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className="max-w-md mx-auto">
      <CardHeader>
        <CardTitle>Cadastrar Nova Fazenda</CardTitle>
        <CardDescription>
          Informe os dados da sua propriedade
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Nome da Fazenda*</Label>
            <Input
              id="name"
              {...register('name')}
              placeholder="Ex: Fazenda São João"
            />
            {errors.name && (
              <p className="text-sm text-red-500 flex items-center gap-1">
                <AlertCircle className="h-3 w-3" />
                {errors.name.message}
              </p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="location">Localização</Label>
            <Input
              id="location"
              {...register('location')}
              placeholder="Ex: Município de Barretos - SP"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="area_size">Área</Label>
              <Input
                id="area_size"
                type="number"
                step="0.01"
                min="0"
                {...register('area_size', { valueAsNumber: true })}
                placeholder="Ex: 120.5"
              />
              {errors.area_size && (
                <p className="text-sm text-red-500 flex items-center gap-1">
                  <AlertCircle className="h-3 w-3" />
                  {errors.area_size.message}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="area_unit">Unidade</Label>
              <Input
                id="area_unit"
                {...register('area_unit')}
                defaultValue="hectares"
                placeholder="Ex: hectares"
              />
            </div>
          </div>

          <Button 
            type="submit" 
            className="w-full bg-green-600 hover:bg-green-700" 
            disabled={isLoading}
          >
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Salvando...
              </>
            ) : (
              'Cadastrar Fazenda'
            )}
          </Button>
        </form>
      </CardContent>
      <CardFooter className="text-center text-sm text-muted-foreground">
        * Campos obrigatórios
      </CardFooter>
    </Card>
  );
}; 