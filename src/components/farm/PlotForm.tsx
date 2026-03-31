import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from '@/components/ui/use-toast';
import { AlertCircle, Loader2 } from 'lucide-react';
import { savePlot, Plot, Farm } from '@/lib/services';

const formSchema = z.object({
  name: z.string().min(1, 'Nome do talhão é obrigatório'),
  farm_id: z.string().min(1, 'Fazenda é obrigatória'),
  area_size: z.number().min(0, 'Área não pode ser negativa').optional(),
  area_unit: z.string().optional(),
  soil_type: z.string().optional()
});

type FormData = z.infer<typeof formSchema>;

interface PlotFormProps {
  farms: Farm[];
  selectedFarmId?: string;
  onPlotSaved: (plot: Plot) => void;
}

export const PlotForm: React.FC<PlotFormProps> = ({ farms, selectedFarmId, onPlotSaved }) => {
  const [isLoading, setIsLoading] = useState(false);
  
  const { register, handleSubmit, formState: { errors }, setValue, control, reset } = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: '',
      farm_id: selectedFarmId || '',
      area_size: undefined,
      area_unit: 'hectares',
      soil_type: ''
    }
  });

  // Define o ID da fazenda quando o componente é montado ou quando selectedFarmId muda
  React.useEffect(() => {
    if (selectedFarmId) {
      setValue('farm_id', selectedFarmId);
    }
  }, [selectedFarmId, setValue]);

  const onSubmit = async (data: FormData) => {
    setIsLoading(true);
    try {
      // Garantir que o ID da fazenda exista
      if (!data.farm_id) {
        throw new Error('É necessário selecionar uma fazenda');
      }

      const plotData: Plot = {
        name: data.name,
        farm_id: data.farm_id,
        area_size: data.area_size,
        area_unit: data.area_unit,
        soil_type: data.soil_type
      };

      const { data: savedPlot, error } = await savePlot(plotData);
      
      if (error) throw error;
      
      toast({
        title: "Talhão cadastrado com sucesso!",
        description: `O talhão ${data.name} foi salvo no banco de dados.`,
      });
      
      reset({
        ...data, // Mantém a fazenda selecionada
        name: '',
        area_size: undefined,
        soil_type: ''
      });
      
      if (savedPlot && savedPlot[0]) {
        onPlotSaved(savedPlot[0]);
      }
    } catch (error: any) {
      console.error('Erro ao salvar talhão:', error);
      toast({
        variant: 'destructive',
        title: "Erro ao cadastrar talhão",
        description: error.message || "Ocorreu um erro ao salvar os dados."
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className="max-w-md mx-auto">
      <CardHeader>
        <CardTitle>Cadastrar Novo Talhão</CardTitle>
        <CardDescription>
          Cadastre um talhão ou parcela da sua fazenda
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="farm_id">Fazenda*</Label>
            <Select 
              onValueChange={(value) => setValue('farm_id', value)} 
              defaultValue={selectedFarmId || ''}
            >
              <SelectTrigger>
                <SelectValue placeholder="Selecione uma fazenda" />
              </SelectTrigger>
              <SelectContent>
                {farms.map((farm) => (
                  <SelectItem key={farm.id} value={farm.id || ''}>
                    {farm.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {errors.farm_id && (
              <p className="text-sm text-red-500 flex items-center gap-1">
                <AlertCircle className="h-3 w-3" />
                {errors.farm_id.message}
              </p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="name">Nome do Talhão*</Label>
            <Input
              id="name"
              {...register('name')}
              placeholder="Ex: Talhão 1 - Milho"
            />
            {errors.name && (
              <p className="text-sm text-red-500 flex items-center gap-1">
                <AlertCircle className="h-3 w-3" />
                {errors.name.message}
              </p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="soil_type">Tipo de Solo</Label>
            <Input
              id="soil_type"
              {...register('soil_type')}
              placeholder="Ex: Latossolo Vermelho"
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
                placeholder="Ex: 25.5"
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
              'Cadastrar Talhão'
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