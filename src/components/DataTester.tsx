import { useState, useEffect } from 'react';
import { getCrops, getFertilizerSources } from '../lib/supabase';

export default function DataTester() {
  const [crops, setCrops] = useState<any[]>([]);
  const [fertilizers, setFertilizers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadData() {
      try {
        setLoading(true);
        setError(null);
        
        // Buscar culturas
        const cropsResult = await getCrops();
        if (cropsResult.error) {
          throw new Error(`Erro ao buscar culturas: ${cropsResult.error.message}`);
        }
        setCrops(cropsResult.data || []);
        
        // Buscar fertilizantes
        const fertilizersResult = await getFertilizerSources();
        if (fertilizersResult.error) {
          throw new Error(`Erro ao buscar fertilizantes: ${fertilizersResult.error.message}`);
        }
        setFertilizers(fertilizersResult.data || []);
      } catch (err: any) {
        console.error('Erro ao carregar dados:', err);
        setError(err.message || 'Erro desconhecido ao carregar dados');
      } finally {
        setLoading(false);
      }
    }
    
    loadData();
  }, []);

  return (
    <div className="p-4 max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold mb-4">Teste de Dados do Supabase</h1>
      
      {loading && <p className="text-gray-600">Carregando dados...</p>}
      
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          <p><strong>Erro:</strong> {error}</p>
        </div>
      )}
      
      {!loading && !error && (
        <>
          <div className="mb-8">
            <h2 className="text-xl font-semibold mb-2">Culturas ({crops.length})</h2>
            {crops.length === 0 ? (
              <p className="text-gray-600">Nenhuma cultura encontrada.</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="min-w-full bg-white border border-gray-300">
                  <thead>
                    <tr className="bg-gray-100">
                      <th className="py-2 px-4 border-b">Nome</th>
                      <th className="py-2 px-4 border-b">Nome Científico</th>
                      <th className="py-2 px-4 border-b">Tipo</th>
                      <th className="py-2 px-4 border-b">pH Ideal</th>
                      <th className="py-2 px-4 border-b">Ciclo (dias)</th>
                    </tr>
                  </thead>
                  <tbody>
                    {crops.map((crop) => (
                      <tr key={crop.id} className="hover:bg-gray-50">
                        <td className="py-2 px-4 border-b">{crop.name}</td>
                        <td className="py-2 px-4 border-b italic">{crop.scientific_name}</td>
                        <td className="py-2 px-4 border-b">{crop.crop_type}</td>
                        <td className="py-2 px-4 border-b">{crop.ideal_ph_min} - {crop.ideal_ph_max}</td>
                        <td className="py-2 px-4 border-b">{crop.cycle_days}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
          
          <div>
            <h2 className="text-xl font-semibold mb-2">Fertilizantes ({fertilizers.length})</h2>
            {fertilizers.length === 0 ? (
              <p className="text-gray-600">Nenhum fertilizante encontrado.</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="min-w-full bg-white border border-gray-300">
                  <thead>
                    <tr className="bg-gray-100">
                      <th className="py-2 px-4 border-b">Nome</th>
                      <th className="py-2 px-4 border-b">Concentração</th>
                      <th className="py-2 px-4 border-b">Unidade</th>
                      <th className="py-2 px-4 border-b">Benefícios</th>
                    </tr>
                  </thead>
                  <tbody>
                    {fertilizers.map((fertilizer) => (
                      <tr key={fertilizer.id} className="hover:bg-gray-50">
                        <td className="py-2 px-4 border-b">{fertilizer.name}</td>
                        <td className="py-2 px-4 border-b">{fertilizer.concentration}</td>
                        <td className="py-2 px-4 border-b">{fertilizer.unit}</td>
                        <td className="py-2 px-4 border-b">{fertilizer.benefits}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
} 