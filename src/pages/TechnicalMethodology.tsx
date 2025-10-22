import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { BookOpen, Calculator, FlaskConical, Table as TableIcon, Info, CheckCircle, ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';

export const TechnicalMethodology: React.FC = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("conversoes");

  return (
    <div className="container mx-auto p-6 max-w-7xl">
      {/* Botão Voltar */}
      <div className="mb-4">
        <Button 
          onClick={() => navigate(-1)} 
          variant="ghost" 
          className="flex items-center gap-2 text-gray-600 hover:text-gray-900"
        >
          <ArrowLeft className="h-4 w-4" />
          Voltar
        </Button>
      </div>
      
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-4xl font-bold text-gray-900 mb-3">
          Metodologia Técnica e Cálculos
        </h1>
        <p className="text-lg text-gray-600">
          Entenda todos os cálculos utilizados no sistema, com base científica comprovada
        </p>
      </div>

      {/* Alert informativo */}
      <Alert className="mb-6 bg-blue-50 border-blue-200">
        <Info className="h-5 w-5 text-blue-600" />
        <AlertDescription className="text-blue-900">
          <strong>Transparência Total:</strong> Todos os cálculos são baseados em metodologias 
          consagradas do IAC (Instituto Agronômico de Campinas), Embrapa e SBCS (Sociedade 
          Brasileira de Ciência do Solo).
        </AlertDescription>
      </Alert>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-5 mb-6">
          <TabsTrigger value="conversoes" className="flex items-center gap-2">
            <Calculator className="h-4 w-4" />
            Conversões
          </TabsTrigger>
          <TabsTrigger value="saturacao" className="flex items-center gap-2">
            <FlaskConical className="h-4 w-4" />
            Saturação
          </TabsTrigger>
          <TabsTrigger value="necessidades" className="flex items-center gap-2">
            <TableIcon className="h-4 w-4" />
            Necessidades
          </TabsTrigger>
          <TabsTrigger value="fosforo" className="flex items-center gap-2">
            <CheckCircle className="h-4 w-4" />
            Fósforo
          </TabsTrigger>
          <TabsTrigger value="referencias" className="flex items-center gap-2">
            <BookOpen className="h-4 w-4" />
            Referências
          </TabsTrigger>
        </TabsList>

        {/* TAB 1: CONVERSÕES DE UNIDADES */}
        <TabsContent value="conversoes">
          <Card>
            <CardHeader>
              <CardTitle>Conversões de Unidades</CardTitle>
              <CardDescription>
                Fatores de conversão entre unidades comumente utilizadas em análise de solo
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              
              {/* Cálcio */}
              <div className="border-l-4 border-blue-500 pl-4">
                <h3 className="text-xl font-semibold text-gray-900 mb-3">Cálcio (Ca)</h3>
                
                <div className="bg-gray-50 p-4 rounded-lg mb-3">
                  <p className="font-mono text-lg mb-2">
                    1 cmolc/dm³ = 200 mg/dm³
                  </p>
                  <p className="text-sm text-gray-600">
                    Fator de conversão: <span className="font-semibold">0.005</span> (de mg/dm³ para cmolc/dm³)
                  </p>
                </div>

                <div className="space-y-2">
                  <p className="text-sm"><strong>Base científica:</strong></p>
                  <ul className="list-disc list-inside text-sm text-gray-700 space-y-1">
                    <li>Peso atômico do Ca: 40 g/mol</li>
                    <li>Cálcio é cátion divalente: Ca²⁺ (valência = 2)</li>
                    <li>Peso equivalente: 40/2 = 20 meq/g</li>
                    <li>1 cmolc/dm³ = 1 meq/100cm³ = 10 meq/L</li>
                    <li>10 meq/L × 20 mg/meq = 200 mg/L = 200 mg/dm³</li>
                  </ul>
                </div>

                <div className="mt-3 bg-green-50 border border-green-200 p-3 rounded">
                  <p className="text-sm font-semibold text-green-800">Exemplo prático:</p>
                  <p className="text-sm text-gray-700">
                    Solo com 400 mg/dm³ de Ca → 400 × 0.005 = <strong>2 cmolc/dm³</strong>
                  </p>
                </div>

                <div className="mt-3 bg-blue-50 border border-blue-200 p-3 rounded">
                  <p className="text-sm font-semibold text-blue-800">Para recomendação de corretivos:</p>
                  <p className="text-sm text-gray-700">
                    1 cmolc/dm³ de Ca = <strong>560 kg/ha de CaO</strong> (camada 0-20cm, densidade 1.2 g/cm³)
                  </p>
                </div>
              </div>

              {/* Magnésio */}
              <div className="border-l-4 border-green-500 pl-4">
                <h3 className="text-xl font-semibold text-gray-900 mb-3">Magnésio (Mg)</h3>
                
                <div className="bg-gray-50 p-4 rounded-lg mb-3">
                  <p className="font-mono text-lg mb-2">
                    1 cmolc/dm³ = 120 mg/dm³
                  </p>
                  <p className="text-sm text-gray-600">
                    Fator de conversão: <span className="font-semibold">0.00833</span> (de mg/dm³ para cmolc/dm³)
                  </p>
                </div>

                <div className="space-y-2">
                  <p className="text-sm"><strong>Base científica:</strong></p>
                  <ul className="list-disc list-inside text-sm text-gray-700 space-y-1">
                    <li>Peso atômico do Mg: 24 g/mol</li>
                    <li>Magnésio é cátion divalente: Mg²⁺ (valência = 2)</li>
                    <li>Peso equivalente: 24/2 = 12 meq/g</li>
                    <li>1 cmolc/dm³ = 10 meq/L</li>
                    <li>10 meq/L × 12 mg/meq = 120 mg/L = 120 mg/dm³</li>
                  </ul>
                </div>

                <div className="mt-3 bg-green-50 border border-green-200 p-3 rounded">
                  <p className="text-sm font-semibold text-green-800">Exemplo prático:</p>
                  <p className="text-sm text-gray-700">
                    Solo com 120 mg/dm³ de Mg → 120 × 0.00833 = <strong>1 cmolc/dm³</strong>
                  </p>
                </div>

                <div className="mt-3 bg-blue-50 border border-blue-200 p-3 rounded">
                  <p className="text-sm font-semibold text-blue-800">Para recomendação de corretivos:</p>
                  <p className="text-sm text-gray-700">
                    1 cmolc/dm³ de Mg = <strong>400 kg/ha de MgO</strong> (camada 0-20cm, densidade 1.2 g/cm³)
                  </p>
                </div>
              </div>

              {/* Potássio */}
              <div className="border-l-4 border-yellow-500 pl-4">
                <h3 className="text-xl font-semibold text-gray-900 mb-3">Potássio (K)</h3>
                
                <div className="bg-gray-50 p-4 rounded-lg mb-3">
                  <p className="font-mono text-lg mb-2">
                    1 cmolc/dm³ = 390 mg/dm³
                  </p>
                  <p className="text-sm text-gray-600">
                    Fator de conversão: <span className="font-semibold">1/390 = 0.00256</span> (de mg/dm³ para cmolc/dm³)
                  </p>
                </div>

                <div className="space-y-2">
                  <p className="text-sm"><strong>Base científica:</strong></p>
                  <ul className="list-disc list-inside text-sm text-gray-700 space-y-1">
                    <li>Peso atômico do K: 39 g/mol</li>
                    <li>Potássio é cátion monovalente: K⁺ (valência = 1)</li>
                    <li>Peso equivalente: 39/1 = 39 meq/g</li>
                    <li>1 cmolc/dm³ = 10 meq/L</li>
                    <li>10 meq/L × 39 mg/meq = 390 mg/L = 390 mg/dm³</li>
                  </ul>
                </div>

                <div className="mt-3 bg-green-50 border border-green-200 p-3 rounded">
                  <p className="text-sm font-semibold text-green-800">Exemplo prático:</p>
                  <p className="text-sm text-gray-700">
                    Solo com 195 mg/dm³ de K → 195 ÷ 390 = <strong>0.5 cmolc/dm³</strong>
                  </p>
                </div>

                <div className="mt-3 bg-blue-50 border border-blue-200 p-3 rounded">
                  <p className="text-sm font-semibold text-blue-800">Para recomendação de fertilizantes:</p>
                  <p className="text-sm text-gray-700">
                    1 cmolc/dm³ de K = <strong>950 kg/ha de K₂O</strong> (camada 0-20cm, densidade 1.2 g/cm³)
                  </p>
                </div>
              </div>

              {/* Fósforo */}
              <div className="border-l-4 border-purple-500 pl-4">
                <h3 className="text-xl font-semibold text-gray-900 mb-3">Fósforo (P)</h3>
                
                <div className="bg-gray-50 p-4 rounded-lg mb-3">
                  <p className="font-mono text-lg mb-2">
                    P × 2.29 = P₂O₅
                  </p>
                  <p className="text-sm text-gray-600">
                    Fator de conversão: <span className="font-semibold">2.29</span> (de P elementar para P₂O₅)
                  </p>
                </div>

                <div className="space-y-2">
                  <p className="text-sm"><strong>Base científica:</strong></p>
                  <ul className="list-disc list-inside text-sm text-gray-700 space-y-1">
                    <li>Peso molecular P₂O₅: 142 g/mol</li>
                    <li>Peso molecular 2P: 2 × 31 = 62 g/mol</li>
                    <li>Fator: 142 ÷ 62 = 2.29</li>
                  </ul>
                </div>

                <div className="mt-3 bg-green-50 border border-green-200 p-3 rounded">
                  <p className="text-sm font-semibold text-green-800">Exemplo prático:</p>
                  <p className="text-sm text-gray-700">
                    Solo com 10 mg/dm³ de P → 10 × 2.29 = <strong>22.9 mg/dm³ de P₂O₅</strong>
                  </p>
                </div>
              </div>

            </CardContent>
          </Card>
        </TabsContent>

        {/* TAB 2: SATURAÇÃO */}
        <TabsContent value="saturacao">
          <Card>
            <CardHeader>
              <CardTitle>Cálculo de Saturação por Bases</CardTitle>
              <CardDescription>
                Como calculamos a porcentagem de saturação de cada nutriente na CTC
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              
              <div className="bg-blue-50 border-l-4 border-blue-500 p-4">
                <h3 className="text-lg font-semibold mb-2">Fórmula Geral</h3>
                <div className="bg-white p-4 rounded font-mono text-center text-lg">
                  Saturação (%) = (Nutriente em cmolc/dm³ ÷ CTC) × 100
                </div>
              </div>

              <div className="space-y-4">
                <h3 className="text-xl font-semibold">Exemplo Prático Completo</h3>
                
                <div className="bg-gray-50 p-4 rounded-lg">
                  <p className="font-semibold mb-2">Dados da Análise:</p>
                  <ul className="list-disc list-inside space-y-1 text-sm">
                    <li>CTC (T): 10 cmolc/dm³</li>
                    <li>Ca: 5 cmolc/dm³</li>
                    <li>Mg: 2 cmolc/dm³</li>
                    <li>K: 195 mg/dm³ = 0.5 cmolc/dm³</li>
                  </ul>
                </div>

                <div className="grid md:grid-cols-3 gap-4">
                  <div className="border-2 border-blue-300 rounded-lg p-4">
                    <h4 className="font-semibold text-blue-700 mb-2">Saturação de Ca</h4>
                    <p className="text-sm mb-2">Fórmula: (5 ÷ 10) × 100</p>
                    <p className="text-2xl font-bold text-blue-600">50%</p>
                    <p className="text-xs mt-2 text-gray-600">Ideal: 50-60%</p>
                  </div>

                  <div className="border-2 border-green-300 rounded-lg p-4">
                    <h4 className="font-semibold text-green-700 mb-2">Saturação de Mg</h4>
                    <p className="text-sm mb-2">Fórmula: (2 ÷ 10) × 100</p>
                    <p className="text-2xl font-bold text-green-600">20%</p>
                    <p className="text-xs mt-2 text-gray-600">Ideal: 15-20%</p>
                  </div>

                  <div className="border-2 border-yellow-300 rounded-lg p-4">
                    <h4 className="font-semibold text-yellow-700 mb-2">Saturação de K</h4>
                    <p className="text-sm mb-2">Fórmula: (0.5 ÷ 10) × 100</p>
                    <p className="text-2xl font-bold text-yellow-600">5%</p>
                    <p className="text-xs mt-2 text-gray-600">Ideal: 3-5%</p>
                  </div>
                </div>
              </div>

              <Alert className="bg-green-50 border-green-300">
                <CheckCircle className="h-4 w-4 text-green-600" />
                <AlertDescription>
                  <strong>Interpretação:</strong> Este solo está com saturações ideais para todos os 
                  nutrientes! Ca em 50% (dentro de 50-60%), Mg em 20% (dentro de 15-20%) e K em 5% 
                  (dentro de 3-5%).
                </AlertDescription>
              </Alert>

              <div className="bg-gray-100 p-4 rounded-lg">
                <h4 className="font-semibold mb-3">Faixas Ideais de Saturação</h4>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead className="bg-gray-200">
                      <tr>
                        <th className="p-2 text-left">Nutriente</th>
                        <th className="p-2 text-left">Faixa Ideal (%)</th>
                        <th className="p-2 text-left">Observação</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y">
                      <tr>
                        <td className="p-2 font-medium">Ca</td>
                        <td className="p-2">50 - 60%</td>
                        <td className="p-2">Nutriente mais abundante</td>
                      </tr>
                      <tr>
                        <td className="p-2 font-medium">Mg</td>
                        <td className="p-2">15 - 20%</td>
                        <td className="p-2">Relação Ca/Mg ideal: 3-5</td>
                      </tr>
                      <tr>
                        <td className="p-2 font-medium">K</td>
                        <td className="p-2">3 - 5%</td>
                        <td className="p-2">Essencial mas em menor quantidade</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>

              <div className="text-sm text-gray-600 italic">
                <strong>Fonte:</strong> Raij et al. (1997) - Boletim Técnico 100, IAC
              </div>

            </CardContent>
          </Card>
        </TabsContent>

        {/* TAB 3: NECESSIDADES */}
        <TabsContent value="necessidades">
          <Card>
            <CardHeader>
              <CardTitle>Cálculo de Necessidades de Nutrientes</CardTitle>
              <CardDescription>
                Como determinamos quanto de cada nutriente precisa ser aplicado
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              
              <div className="bg-yellow-50 border-l-4 border-yellow-500 p-4">
                <h3 className="text-lg font-semibold mb-2">Princípio Básico</h3>
                <p className="text-sm">
                  A necessidade de um nutriente é calculada como a diferença entre o nível ideal 
                  para a cultura e o nível atual no solo.
                </p>
                <div className="bg-white p-3 rounded font-mono text-center mt-3">
                  Necessidade = Ideal - Atual (em cmolc/dm³)
                </div>
              </div>

              {/* Tabela de níveis ideais */}
              <div>
                <h3 className="text-xl font-semibold mb-3">Níveis Ideais no Solo</h3>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm border">
                    <thead className="bg-gray-100">
                      <tr>
                        <th className="p-3 text-left border">Nutriente</th>
                        <th className="p-3 text-left border">Nível Ideal</th>
                        <th className="p-3 text-left border">Unidade</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y">
                      <tr>
                        <td className="p-3 border font-medium">Cálcio (Ca)</td>
                        <td className="p-3 border">≥ 3.0</td>
                        <td className="p-3 border">cmolc/dm³</td>
                      </tr>
                      <tr>
                        <td className="p-3 border font-medium">Magnésio (Mg)</td>
                        <td className="p-3 border">≥ 1.0</td>
                        <td className="p-3 border">cmolc/dm³</td>
                      </tr>
                      <tr>
                        <td className="p-3 border font-medium">Potássio (K)</td>
                        <td className="p-3 border">≥ 0.15</td>
                        <td className="p-3 border">cmolc/dm³</td>
                      </tr>
                      <tr>
                        <td className="p-3 border font-medium">Enxofre (S)</td>
                        <td className="p-3 border">≥ 10</td>
                        <td className="p-3 border">mg/dm³</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Exemplo de cálculo */}
              <div className="space-y-4">
                <h3 className="text-xl font-semibold">Exemplo de Cálculo</h3>
                
                <div className="bg-gray-50 p-4 rounded-lg">
                  <p className="font-semibold mb-2">Situação:</p>
                  <p className="text-sm">Solo com Ca = 1.5 cmolc/dm³ (abaixo do ideal de 3.0)</p>
                </div>

                <div className="space-y-3">
                  <div className="border-l-4 border-blue-500 pl-4">
                    <p className="font-semibold text-blue-700">Passo 1: Calcular necessidade em cmolc/dm³</p>
                    <p className="font-mono text-sm mt-2">Necessidade = 3.0 - 1.5 = 1.5 cmolc/dm³</p>
                  </div>

                  <div className="border-l-4 border-green-500 pl-4">
                    <p className="font-semibold text-green-700">Passo 2: Converter para kg/ha de CaO</p>
                    <p className="font-mono text-sm mt-2">1.5 cmolc/dm³ × 560 = 840 kg/ha de CaO</p>
                    <p className="text-xs text-gray-600 mt-1">
                      * Fator 560 considera camada de 0-20cm e densidade de 1.2 g/cm³
                    </p>
                  </div>

                  <div className="border-l-4 border-purple-500 pl-4">
                    <p className="font-semibold text-purple-700">Passo 3: Calcular quantidade de fertilizante</p>
                    <p className="text-sm mt-2">
                      Usando calcário com 35% de CaO:
                    </p>
                    <p className="font-mono text-sm mt-1">840 ÷ 0.35 = 2400 kg/ha = 2.4 t/ha</p>
                  </div>
                </div>
              </div>

              <Alert className="bg-blue-50 border-blue-300">
                <Info className="h-4 w-4 text-blue-600" />
                <AlertDescription>
                  <strong>Importante:</strong> As recomendações consideram a profundidade de incorporação 
                  (0-20cm) e a densidade aparente média do solo (1.2 g/cm³). Para situações específicas, 
                  pode ser necessário ajuste por um profissional.
                </AlertDescription>
              </Alert>

            </CardContent>
          </Card>
        </TabsContent>

        {/* TAB 4: FÓSFORO */}
        <TabsContent value="fosforo">
          <Card>
            <CardHeader>
              <CardTitle>Interpretação de Fósforo por Textura do Solo</CardTitle>
              <CardDescription>
                A interpretação de P varia conforme o teor de argila do solo
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              
              <div className="bg-purple-50 border-l-4 border-purple-500 p-4">
                <h3 className="text-lg font-semibold mb-2">Por que considerar a argila?</h3>
                <p className="text-sm">
                  Solos argilosos têm maior capacidade de "fixar" o fósforo (adsorção), tornando-o 
                  menos disponível para as plantas. Por isso, os níveis críticos de P são maiores 
                  em solos com mais argila.
                </p>
              </div>

              <div>
                <h3 className="text-xl font-semibold mb-3">Classes Texturais</h3>
                <div className="grid md:grid-cols-2 gap-4">
                  <div className="border-2 border-yellow-300 rounded-lg p-4">
                    <h4 className="font-semibold text-yellow-700 mb-2">Classe 1: Arenoso</h4>
                    <p className="text-sm mb-2">0 - 15% de argila</p>
                    <p className="text-xs text-gray-600">Baixa capacidade de fixação de P</p>
                  </div>
                  <div className="border-2 border-orange-300 rounded-lg p-4">
                    <h4 className="font-semibold text-orange-700 mb-2">Classe 2: Textura Média</h4>
                    <p className="text-sm mb-2">16 - 35% de argila</p>
                    <p className="text-xs text-gray-600">Média capacidade de fixação de P</p>
                  </div>
                  <div className="border-2 border-red-300 rounded-lg p-4">
                    <h4 className="font-semibold text-red-700 mb-2">Classe 3: Argiloso</h4>
                    <p className="text-sm mb-2">36 - 60% de argila</p>
                    <p className="text-xs text-gray-600">Alta capacidade de fixação de P</p>
                  </div>
                  <div className="border-2 border-red-500 rounded-lg p-4">
                    <h4 className="font-semibold text-red-800 mb-2">Classe 4: Muito Argiloso</h4>
                    <p className="text-sm mb-2">&gt; 60% de argila</p>
                    <p className="text-xs text-gray-600">Muito alta capacidade de fixação de P</p>
                  </div>
                </div>
              </div>

              <div>
                <h3 className="text-xl font-semibold mb-3">Tabela de Interpretação de P (resina)</h3>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm border">
                    <thead className="bg-gray-100">
                      <tr>
                        <th className="p-2 text-left border">Interpretação</th>
                        <th className="p-2 text-center border">Classe 1<br/>(0-15%)</th>
                        <th className="p-2 text-center border">Classe 2<br/>(16-35%)</th>
                        <th className="p-2 text-center border">Classe 3<br/>(36-60%)</th>
                        <th className="p-2 text-center border">Classe 4<br/>(&gt;60%)</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y">
                      <tr className="bg-red-50">
                        <td className="p-2 border font-medium">Muito Baixo</td>
                        <td className="p-2 text-center border">≤ 6</td>
                        <td className="p-2 text-center border">≤ 8</td>
                        <td className="p-2 text-center border">≤ 10</td>
                        <td className="p-2 text-center border">≤ 12</td>
                      </tr>
                      <tr className="bg-orange-50">
                        <td className="p-2 border font-medium">Baixo</td>
                        <td className="p-2 text-center border">7 - 12</td>
                        <td className="p-2 text-center border">9 - 16</td>
                        <td className="p-2 text-center border">11 - 20</td>
                        <td className="p-2 text-center border">13 - 24</td>
                      </tr>
                      <tr className="bg-yellow-50">
                        <td className="p-2 border font-medium">Médio</td>
                        <td className="p-2 text-center border">13 - 20</td>
                        <td className="p-2 text-center border">17 - 25</td>
                        <td className="p-2 text-center border">21 - 30</td>
                        <td className="p-2 text-center border">25 - 35</td>
                      </tr>
                      <tr className="bg-green-50">
                        <td className="p-2 border font-medium">Alto</td>
                        <td className="p-2 text-center border">21 - 30</td>
                        <td className="p-2 text-center border">26 - 40</td>
                        <td className="p-2 text-center border">31 - 50</td>
                        <td className="p-2 text-center border">36 - 60</td>
                      </tr>
                      <tr className="bg-blue-50">
                        <td className="p-2 border font-medium">Muito Alto</td>
                        <td className="p-2 text-center border">&gt; 30</td>
                        <td className="p-2 text-center border">&gt; 40</td>
                        <td className="p-2 text-center border">&gt; 50</td>
                        <td className="p-2 text-center border">&gt; 60</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
                <p className="text-xs text-gray-600 mt-2">
                  Unidade: mg/dm³ de P (método da resina)
                </p>
              </div>

              <div>
                <h3 className="text-xl font-semibold mb-3">Doses Recomendadas de P₂O₅ (kg/ha)</h3>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm border">
                    <thead className="bg-gray-100">
                      <tr>
                        <th className="p-2 text-left border">Nível de P</th>
                        <th className="p-2 text-center border">Classe 1</th>
                        <th className="p-2 text-center border">Classe 2</th>
                        <th className="p-2 text-center border">Classe 3</th>
                        <th className="p-2 text-center border">Classe 4</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y">
                      <tr>
                        <td className="p-2 border font-medium">Muito Baixo</td>
                        <td className="p-2 text-center border bg-red-50">120</td>
                        <td className="p-2 text-center border bg-red-50">100</td>
                        <td className="p-2 text-center border bg-red-50">80</td>
                        <td className="p-2 text-center border bg-red-50">70</td>
                      </tr>
                      <tr>
                        <td className="p-2 border font-medium">Baixo</td>
                        <td className="p-2 text-center border bg-orange-50">80</td>
                        <td className="p-2 text-center border bg-orange-50">70</td>
                        <td className="p-2 text-center border bg-orange-50">60</td>
                        <td className="p-2 text-center border bg-orange-50">50</td>
                      </tr>
                      <tr>
                        <td className="p-2 border font-medium">Médio</td>
                        <td className="p-2 text-center border bg-yellow-50">40</td>
                        <td className="p-2 text-center border bg-yellow-50">35</td>
                        <td className="p-2 text-center border bg-yellow-50">30</td>
                        <td className="p-2 text-center border bg-yellow-50">25</td>
                      </tr>
                      <tr>
                        <td className="p-2 border font-medium">Alto</td>
                        <td className="p-2 text-center border bg-green-50">20</td>
                        <td className="p-2 text-center border bg-green-50">15</td>
                        <td className="p-2 text-center border bg-green-50">10</td>
                        <td className="p-2 text-center border bg-green-50">10</td>
                      </tr>
                      <tr>
                        <td className="p-2 border font-medium">Muito Alto</td>
                        <td className="p-2 text-center border bg-blue-50">0</td>
                        <td className="p-2 text-center border bg-blue-50">0</td>
                        <td className="p-2 text-center border bg-blue-50">0</td>
                        <td className="p-2 text-center border bg-blue-50">0</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>

              <div className="text-sm text-gray-600 italic">
                <strong>Fonte:</strong> Boletim 100 - Raij et al. (1997), Instituto Agronômico de Campinas (IAC)
              </div>

            </CardContent>
          </Card>
        </TabsContent>

        {/* TAB 5: REFERÊNCIAS */}
        <TabsContent value="referencias">
          <Card>
            <CardHeader>
              <CardTitle>Referências Bibliográficas</CardTitle>
              <CardDescription>
                Base científica utilizada nos cálculos do sistema
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              
              <Alert className="bg-green-50 border-green-300">
                <BookOpen className="h-5 w-5 text-green-600" />
                <AlertDescription>
                  Todos os cálculos e tabelas utilizados neste sistema são baseados em publicações 
                  científicas reconhecidas nacionalmente pela comunidade agronômica brasileira.
                </AlertDescription>
              </Alert>

              <div className="space-y-6">
                
                {/* Referência 1 - IAC */}
                <div className="border-l-4 border-blue-500 pl-4 py-2">
                  <h3 className="font-bold text-lg text-blue-900 mb-2">
                    1. Boletim Técnico 100 - IAC
                  </h3>
                  <p className="text-sm mb-2">
                    <strong>RAIJ, B. van; CANTARELLA, H.; QUAGGIO, J. A.; FURLANI, A. M. C.</strong> (eds.)
                  </p>
                  <p className="text-sm mb-2">
                    <em>Recomendações de adubação e calagem para o Estado de São Paulo.</em> 
                    2ª edição. Campinas: Instituto Agronômico & Fundação IAC, 1997. 285p. 
                    (Boletim Técnico, 100).
                  </p>
                  <div className="bg-blue-50 p-3 rounded mt-2">
                    <p className="text-xs font-semibold mb-1">Utilizado para:</p>
                    <ul className="text-xs space-y-1">
                      <li>• Interpretação de análises de solo</li>
                      <li>• Tabelas de fósforo por textura do solo</li>
                      <li>• Faixas ideais de saturação por bases</li>
                      <li>• Recomendações de calagem</li>
                    </ul>
                  </div>
                </div>

                {/* Referência 2 - EMBRAPA */}
                <div className="border-l-4 border-green-500 pl-4 py-2">
                  <h3 className="font-bold text-lg text-green-900 mb-2">
                    2. Manual de Análises Químicas - Embrapa
                  </h3>
                  <p className="text-sm mb-2">
                    <strong>EMBRAPA - Empresa Brasileira de Pesquisa Agropecuária.</strong>
                  </p>
                  <p className="text-sm mb-2">
                    <em>Manual de análises químicas de solos, plantas e fertilizantes.</em> 
                    2ª edição revista e ampliada. Brasília: Embrapa Informação Tecnológica, 2009. 627p.
                  </p>
                  <div className="bg-green-50 p-3 rounded mt-2">
                    <p className="text-xs font-semibold mb-1">Utilizado para:</p>
                    <ul className="text-xs space-y-1">
                      <li>• Métodos analíticos de solo</li>
                      <li>• Conversões de unidades</li>
                      <li>• Cálculos de CTC e saturação</li>
                      <li>• Interpretação de micronutrientes</li>
                    </ul>
                  </div>
                </div>

                {/* Referência 3 - SBCS */}
                <div className="border-l-4 border-purple-500 pl-4 py-2">
                  <h3 className="font-bold text-lg text-purple-900 mb-2">
                    3. Manual de Adubação e Calagem - SBCS
                  </h3>
                  <p className="text-sm mb-2">
                    <strong>SBCS - Sociedade Brasileira de Ciência do Solo / Núcleo Regional Sul.</strong>
                  </p>
                  <p className="text-sm mb-2">
                    <em>Manual de adubação e de calagem para os Estados do Rio Grande do Sul e de Santa Catarina.</em> 
                    10ª edição. Porto Alegre: SBCS/Núcleo Regional Sul, 2004. 400p.
                  </p>
                  <div className="bg-purple-50 p-3 rounded mt-2">
                    <p className="text-xs font-semibold mb-1">Utilizado para:</p>
                    <ul className="text-xs space-y-1">
                      <li>• Recomendações de adubação NPK</li>
                      <li>• Doses de micronutrientes</li>
                      <li>• Critérios de interpretação</li>
                    </ul>
                  </div>
                </div>

                {/* Referência 4 - CFSEMG */}
                <div className="border-l-4 border-orange-500 pl-4 py-2">
                  <h3 className="font-bold text-lg text-orange-900 mb-2">
                    4. Recomendações - CFSEMG (5ª Aproximação)
                  </h3>
                  <p className="text-sm mb-2">
                    <strong>CFSEMG - Comissão de Fertilidade do Solo do Estado de Minas Gerais.</strong>
                  </p>
                  <p className="text-sm mb-2">
                    <em>Recomendações para o uso de corretivos e fertilizantes em Minas Gerais - 5ª Aproximação.</em> 
                    Viçosa: CFSEMG, 1999. 359p.
                  </p>
                  <div className="bg-orange-50 p-3 rounded mt-2">
                    <p className="text-xs font-semibold mb-1">Utilizado para:</p>
                    <ul className="text-xs space-y-1">
                      <li>• Critérios de interpretação regional</li>
                      <li>• Recomendações para culturas específicas</li>
                    </ul>
                  </div>
                </div>

                {/* Referência 5 - Artigo Científico */}
                <div className="border-l-4 border-red-500 pl-4 py-2">
                  <h3 className="font-bold text-lg text-red-900 mb-2">
                    5. Artigo Científico Internacional
                  </h3>
                  <p className="text-sm mb-2">
                    <strong>CANTARELLA, H.; van RAIJ, B.; QUAGGIO, J. A.</strong>
                  </p>
                  <p className="text-sm mb-2">
                    Soil and Plant Analyses for Lime and Fertilizer Recommendations in Brazil. 
                    <em>Communications in Soil Science and Plant Analysis</em>, v. 29, n. 11-14, 
                    p. 1691-1706, 1998.
                  </p>
                  <div className="bg-red-50 p-3 rounded mt-2">
                    <p className="text-xs font-semibold mb-1">Utilizado para:</p>
                    <ul className="text-xs space-y-1">
                      <li>• Validação internacional das metodologias brasileiras</li>
                      <li>• Fundamentação científica dos cálculos</li>
                    </ul>
                  </div>
                </div>

              </div>

              <div className="bg-gray-100 p-4 rounded-lg mt-6">
                <h3 className="font-semibold mb-2">Nota sobre Atualização</h3>
                <p className="text-sm text-gray-700">
                  O sistema é atualizado regularmente para incorporar as mais recentes recomendações 
                  técnicas publicadas por estas instituições. A última revisão dos cálculos foi 
                  realizada em <strong>22 de outubro de 2025</strong>.
                </p>
              </div>

              <Alert className="bg-yellow-50 border-yellow-300">
                <Info className="h-5 w-5 text-yellow-600" />
                <AlertDescription>
                  <strong>Recomendação Profissional:</strong> Este sistema é uma ferramenta de apoio 
                  à decisão. Para situações específicas ou culturas especializadas, sempre consulte 
                  um Engenheiro Agrônomo com CREA ativo.
                </AlertDescription>
              </Alert>

            </CardContent>
          </Card>
        </TabsContent>

      </Tabs>
    </div>
  );
};
