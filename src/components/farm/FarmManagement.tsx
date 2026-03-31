import React, { useState, useEffect } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Label } from '@/components/ui/label';
import { saveFarm, getUserFarms, savePlot, getFarmPlots, Farm, Plot } from '@/lib/services';
import { toast } from '@/components/ui/use-toast';
import { PlusCircle, Trash2, Tractor, MapPin } from 'lucide-react';

interface FarmManagementProps {
  onDataUpdated?: () => void;
}

export const FarmManagement: React.FC<FarmManagementProps> = ({ onDataUpdated }) => {
  const [farms, setFarms] = useState<Farm[]>([]);
  const [plots, setPlots] = useState<Plot[]>([]);
  const [selectedFarm, setSelectedFarm] = useState<Farm | null>(null);
  const [newFarmName, setNewFarmName] = useState('');
  const [newFarmLocation, setNewFarmLocation] = useState('');
  const [newPlotName, setNewPlotName] = useState('');
  const [newPlotSoilType, setNewPlotSoilType] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    fetchFarms();
  }, []);

  useEffect(() => {
    if (selectedFarm) {
      fetchPlots(selectedFarm.id || '');
    }
  }, [selectedFarm]);

  const fetchFarms = async () => {
    try {
      setIsLoading(true);
      const { data, error } = await getUserFarms();
      if (error) throw error;
      
      setFarms(data);
      if (data.length > 0 && !selectedFarm) {
        setSelectedFarm(data[0]);
      }
    } catch (error: any) {
      console.error('Erro ao buscar fazendas:', error);
      toast({
        variant: 'destructive',
        title: 'Erro',
        description: 'Não foi possível buscar as fazendas.'
      });
    } finally {
      setIsLoading(false);
    }
  };

  const fetchPlots = async (farmId: string) => {
    try {
      setIsLoading(true);
      const { data, error } = await getFarmPlots(farmId);
      if (error) throw error;
      
      setPlots(data);
    } catch (error: any) {
      console.error('Erro ao buscar talhões:', error);
      toast({
        variant: 'destructive',
        title: 'Erro',
        description: 'Não foi possível buscar os talhões.'
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddFarm = async () => {
    if (!newFarmName.trim()) {
      toast({
        variant: 'destructive',
        title: 'Erro',
        description: 'O nome da fazenda é obrigatório.'
      });
      return;
    }

    try {
      setIsLoading(true);
      const newFarm: Farm = {
        name: newFarmName,
        location: newFarmLocation || undefined
      };

      const { data, error } = await saveFarm(newFarm);
      if (error) throw error;

      toast({
        title: 'Sucesso',
        description: 'Fazenda adicionada com sucesso!'
      });

      setNewFarmName('');
      setNewFarmLocation('');
      
      // Atualizar lista de fazendas
      await fetchFarms();
      if (onDataUpdated) onDataUpdated();
    } catch (error: any) {
      console.error('Erro ao adicionar fazenda:', error);
      toast({
        variant: 'destructive',
        title: 'Erro',
        description: error.message || 'Não foi possível adicionar a fazenda.'
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddPlot = async () => {
    if (!selectedFarm) {
      toast({
        variant: 'destructive',
        title: 'Erro',
        description: 'Selecione uma fazenda primeiro.'
      });
      return;
    }

    if (!newPlotName.trim()) {
      toast({
        variant: 'destructive',
        title: 'Erro',
        description: 'O nome do talhão é obrigatório.'
      });
      return;
    }

    try {
      setIsLoading(true);
      const newPlot: Plot = {
        name: newPlotName,
        farm_id: selectedFarm.id || '',
        soil_type: newPlotSoilType || undefined
      };

      const { data, error } = await savePlot(newPlot);
      if (error) throw error;

      toast({
        title: 'Sucesso',
        description: 'Talhão adicionado com sucesso!'
      });

      setNewPlotName('');
      setNewPlotSoilType('');
      
      // Atualizar lista de talhões
      if (selectedFarm && selectedFarm.id) {
        await fetchPlots(selectedFarm.id);
      }
      if (onDataUpdated) onDataUpdated();
    } catch (error: any) {
      console.error('Erro ao adicionar talhão:', error);
      toast({
        variant: 'destructive',
        title: 'Erro',
        description: error.message || 'Não foi possível adicionar o talhão.'
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-4">
      <Tabs defaultValue="farms">
        <TabsList className="mb-4">
          <TabsTrigger value="farms" className="flex items-center gap-1">
            <Tractor className="h-4 w-4" />
            Fazendas
          </TabsTrigger>
          <TabsTrigger value="plots" className="flex items-center gap-1">
            <MapPin className="h-4 w-4" />
            Talhões
          </TabsTrigger>
        </TabsList>

        <TabsContent value="farms">
          <Card className="mb-4">
            <CardHeader>
              <CardTitle className="text-lg">Nova Fazenda</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div>
                  <Label htmlFor="farmName">Nome da Fazenda *</Label>
                  <Input 
                    id="farmName" 
                    placeholder="Ex: Fazenda São João" 
                    value={newFarmName}
                    onChange={(e) => setNewFarmName(e.target.value)}
                  />
                </div>
                <div>
                  <Label htmlFor="farmLocation">Localização</Label>
                  <Input 
                    id="farmLocation" 
                    placeholder="Ex: Município - Estado" 
                    value={newFarmLocation}
                    onChange={(e) => setNewFarmLocation(e.target.value)}
                  />
                </div>
                <Button 
                  onClick={handleAddFarm} 
                  disabled={isLoading || !newFarmName.trim()}
                  className="w-full"
                >
                  <PlusCircle className="h-4 w-4 mr-2" />
                  Adicionar Fazenda
                </Button>
              </div>
            </CardContent>
          </Card>

          <div className="bg-gray-50 p-4 rounded-md">
            <h3 className="font-medium mb-2 text-gray-700">Fazendas Cadastradas</h3>
            
            {farms.length === 0 ? (
              <p className="text-gray-500 text-sm italic">Nenhuma fazenda cadastrada ainda.</p>
            ) : (
              <div className="space-y-2">
                {farms.map((farm) => (
                  <div 
                    key={farm.id} 
                    className={`p-3 rounded-md cursor-pointer flex justify-between items-center ${selectedFarm?.id === farm.id ? 'bg-green-100 border border-green-300' : 'bg-white border'}`}
                    onClick={() => setSelectedFarm(farm)}
                  >
                    <div>
                      <h4 className="font-medium">{farm.name}</h4>
                      {farm.location && <p className="text-sm text-gray-500">{farm.location}</p>}
                    </div>
                    <div className="flex items-center">
                      <Button variant="ghost" size="sm" className="text-gray-500 hover:text-red-500 h-8 w-8 p-0">
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </TabsContent>

        <TabsContent value="plots">
          {!selectedFarm ? (
            <div className="text-center p-4 bg-yellow-50 rounded-md">
              <p className="text-amber-700">Selecione uma fazenda na aba "Fazendas" para adicionar talhões.</p>
            </div>
          ) : (
            <>
              <div className="mb-4 bg-green-50 p-3 rounded-md">
                <p className="text-green-800">
                  Fazenda selecionada: <strong>{selectedFarm.name}</strong>
                  {selectedFarm.location && ` (${selectedFarm.location})`}
                </p>
              </div>
              
              <Card className="mb-4">
                <CardHeader>
                  <CardTitle className="text-lg">Novo Talhão</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div>
                      <Label htmlFor="plotName">Nome do Talhão *</Label>
                      <Input 
                        id="plotName" 
                        placeholder="Ex: Talhão A1" 
                        value={newPlotName}
                        onChange={(e) => setNewPlotName(e.target.value)}
                      />
                    </div>
                    <div>
                      <Label htmlFor="soilType">Tipo de Solo</Label>
                      <Input 
                        id="soilType" 
                        placeholder="Ex: Latossolo" 
                        value={newPlotSoilType}
                        onChange={(e) => setNewPlotSoilType(e.target.value)}
                      />
                    </div>
                    <Button 
                      onClick={handleAddPlot} 
                      disabled={isLoading || !newPlotName.trim()}
                      className="w-full"
                    >
                      <PlusCircle className="h-4 w-4 mr-2" />
                      Adicionar Talhão
                    </Button>
                  </div>
                </CardContent>
              </Card>

              <div className="bg-gray-50 p-4 rounded-md">
                <h3 className="font-medium mb-2 text-gray-700">Talhões da Fazenda {selectedFarm.name}</h3>
                
                {plots.length === 0 ? (
                  <p className="text-gray-500 text-sm italic">Nenhum talhão cadastrado para esta fazenda.</p>
                ) : (
                  <div className="space-y-2">
                    {plots.map((plot) => (
                      <div 
                        key={plot.id} 
                        className="p-3 rounded-md bg-white border flex justify-between items-center"
                      >
                        <div>
                          <h4 className="font-medium">{plot.name}</h4>
                          {plot.soil_type && <p className="text-sm text-gray-500">Solo: {plot.soil_type}</p>}
                        </div>
                        <div className="flex items-center">
                          <Button variant="ghost" size="sm" className="text-gray-500 hover:text-red-500 h-8 w-8 p-0">
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}; 