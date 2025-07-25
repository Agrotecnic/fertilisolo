import React from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { ArrowRight, Check, Leaf, BarChart, BarChart2, Beaker, Database, Shield } from 'lucide-react';

const LandingPage: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen flex flex-col">
      {/* Navbar */}
      <nav className="bg-white border-b border-gray-200 fixed w-full z-50">
        <div className="container mx-auto flex justify-between items-center py-4 px-4 md:px-6">
          <div className="flex items-center space-x-2">
            <img src="/logo-fertilisolo.png" alt="FertiliSolo Logo" className="h-8 md:h-10" />
            <span className="text-green-600 font-bold text-xl md:text-2xl">FertiliSolo</span>
          </div>
          <div className="flex items-center space-x-4">
            <Link to="/login">
              <Button variant="ghost">Login</Button>
            </Link>
            <Link to="/login">
              <Button className="bg-green-600 hover:bg-green-700">Registrar</Button>
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="pt-28 md:pt-32 pb-16 md:pb-24 bg-gradient-to-r from-green-50 to-green-100">
        <div className="container mx-auto px-4 md:px-6">
          <div className="flex flex-col md:flex-row items-center">
            <div className="md:w-1/2 mb-10 md:mb-0">
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-green-900 mb-4">
                Potencialize a produtividade da sua lavoura
              </h1>
              <p className="text-xl text-gray-700 mb-8">
                Sistema completo de análise de solo e recomendação de adubação com base em saturação por bases.
              </p>
              <div className="flex flex-col sm:flex-row gap-4">
                <Link to="/login">
                <Button 
                  className="bg-green-600 hover:bg-green-700 text-white text-lg py-6 px-8 rounded-lg"
                >
                  Começar agora
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
                </Link>
                <Link to="/relatorio" className="w-full sm:w-auto">
                  <Button variant="outline" className="w-full border-green-600 text-green-700 hover:bg-green-50">
                    Ver demonstração de relatório
                  </Button>
                </Link>
              </div>
            </div>
            <div className="md:w-1/2 flex justify-center">
              <img 
                src="https://images.unsplash.com/photo-1605000797499-95a51c5269ae?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1471&q=80" 
                alt="Análise de solo" 
                className="rounded-lg shadow-xl max-w-full h-auto"
                onError={(e) => {
                  e.currentTarget.src = "https://via.placeholder.com/600x400?text=FertiliSolo";
                }}
              />
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 md:py-24 bg-white">
        <div className="container mx-auto px-4 md:px-6">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-green-800 mb-4">
              Tudo o que você precisa para otimizar sua adubação
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Ferramentas completas para análise de solo e recomendação precisa de fertilizantes
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {/* Feature 1 */}
            <div className="bg-white p-6 rounded-lg shadow-md border border-gray-100 hover:shadow-lg transition duration-300">
              <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mb-4">
                <Beaker className="h-6 w-6 text-green-600" />
              </div>
              <h3 className="text-xl font-semibold text-green-800 mb-3">
                Análise de Solo Intuitiva
              </h3>
              <p className="text-gray-600">
                Insira os resultados da sua análise de solo e obtenha interpretações claras sobre o estado de fertilidade.
              </p>
            </div>

            {/* Feature 2 */}
            <div className="bg-white p-6 rounded-lg shadow-md border border-gray-100 hover:shadow-lg transition duration-300">
              <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mb-4">
                <BarChart className="h-6 w-6 text-green-600" />
              </div>
              <h3 className="text-xl font-semibold text-green-800 mb-3">
                Cálculo de Saturações
              </h3>
              <p className="text-gray-600">
                Calcule automaticamente as saturações de bases e a relação Ca/Mg para entender melhor o equilíbrio do seu solo.
              </p>
            </div>

            {/* Feature 3 */}
            <div className="bg-white p-6 rounded-lg shadow-md border border-gray-100 hover:shadow-lg transition duration-300">
              <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mb-4">
                <Leaf className="h-6 w-6 text-green-600" />
              </div>
              <h3 className="text-xl font-semibold text-green-800 mb-3">
                Recomendações Precisas
              </h3>
              <p className="text-gray-600">
                Receba recomendações personalizadas de adubação baseadas nas necessidades reais da sua lavoura.
              </p>
            </div>

            {/* Feature 4 */}
            <div className="bg-white p-6 rounded-lg shadow-md border border-gray-100 hover:shadow-lg transition duration-300">
              <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mb-4">
                <Database className="h-6 w-6 text-green-600" />
              </div>
              <h3 className="text-xl font-semibold text-green-800 mb-3">
                Histórico de Análises
              </h3>
              <p className="text-gray-600">
                Mantenha um registro organizado de todas as suas análises e acompanhe a evolução da fertilidade do solo.
              </p>
            </div>

            {/* Feature 5 */}
            <div className="bg-white p-6 rounded-lg shadow-md border border-gray-100 hover:shadow-lg transition duration-300">
              <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mb-4">
                <BarChart2 className="h-6 w-6 text-green-600" />
              </div>
              <h3 className="text-xl font-semibold text-green-800 mb-3">
                Insights Visuais
              </h3>
              <p className="text-gray-600">
                Visualize dados através de gráficos intuitivos que facilitam a compreensão do estado do seu solo.
              </p>
            </div>

            {/* Feature 6 */}
            <div className="bg-white p-6 rounded-lg shadow-md border border-gray-100 hover:shadow-lg transition duration-300">
              <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mb-4">
                <Shield className="h-6 w-6 text-green-600" />
              </div>
              <h3 className="text-xl font-semibold text-green-800 mb-3">
                Disponível Offline
              </h3>
              <p className="text-gray-600">
                Use o aplicativo mesmo sem conexão com a internet. Seus dados são sincronizados quando você volta a ficar online.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* How it Works Section */}
      <section className="py-16 md:py-24 bg-gray-50">
        <div className="container mx-auto px-4 md:px-6">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-green-800 mb-4">
              Como funciona
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Um processo simples para maximizar a produtividade da sua lavoura
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Step 1 */}
            <div className="text-center">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-4 mx-auto">
                <span className="text-2xl font-bold text-green-600">1</span>
              </div>
              <h3 className="text-xl font-semibold text-green-800 mb-3">
                Insira os Dados
              </h3>
              <p className="text-gray-600">
                Adicione os resultados da análise de solo no sistema, incluindo macro e micronutrientes.
              </p>
            </div>

            {/* Step 2 */}
            <div className="text-center">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-4 mx-auto">
                <span className="text-2xl font-bold text-green-600">2</span>
              </div>
              <h3 className="text-xl font-semibold text-green-800 mb-3">
                Obtenha a Análise
              </h3>
              <p className="text-gray-600">
                O sistema calcula automaticamente as saturações de bases e identifica desequilíbrios nutricionais.
              </p>
            </div>

            {/* Step 3 */}
            <div className="text-center">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-4 mx-auto">
                <span className="text-2xl font-bold text-green-600">3</span>
              </div>
              <h3 className="text-xl font-semibold text-green-800 mb-3">
                Aplique as Recomendações
              </h3>
              <p className="text-gray-600">
                Siga as recomendações de adubação geradas para equilibrar o solo e aumentar a produtividade.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="py-16 md:py-24 bg-white">
        <div className="container mx-auto px-4 md:px-6">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-green-800 mb-4">
              Benefícios do FertiliSolo
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Otimize recursos e maximize resultados com nossa plataforma
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Benefit 1 */}
            <div className="flex items-start">
              <div className="mt-1 mr-4">
                <Check className="h-6 w-6 text-green-600" />
              </div>
              <div>
                <h3 className="text-xl font-semibold text-green-800 mb-2">
                  Economia de Fertilizantes
                </h3>
                <p className="text-gray-600">
                  Reduza custos aplicando apenas o necessário com base em recomendações precisas.
                </p>
              </div>
            </div>

            {/* Benefit 2 */}
            <div className="flex items-start">
              <div className="mt-1 mr-4">
                <Check className="h-6 w-6 text-green-600" />
              </div>
              <div>
                <h3 className="text-xl font-semibold text-green-800 mb-2">
                  Aumento de Produtividade
                </h3>
                <p className="text-gray-600">
                  Solos equilibrados resultam em plantas mais saudáveis e maior produtividade.
                </p>
              </div>
            </div>

            {/* Benefit 3 */}
            <div className="flex items-start">
              <div className="mt-1 mr-4">
                <Check className="h-6 w-6 text-green-600" />
              </div>
              <div>
                <h3 className="text-xl font-semibold text-green-800 mb-2">
                  Sustentabilidade Ambiental
                </h3>
                <p className="text-gray-600">
                  Minimize o impacto ambiental evitando o uso excessivo de fertilizantes.
                </p>
              </div>
            </div>

            {/* Benefit 4 */}
            <div className="flex items-start">
              <div className="mt-1 mr-4">
                <Check className="h-6 w-6 text-green-600" />
              </div>
              <div>
                <h3 className="text-xl font-semibold text-green-800 mb-2">
                  Tomada de Decisão Baseada em Dados
                </h3>
                <p className="text-gray-600">
                  Use informações precisas para tomar decisões estratégicas sobre manejo do solo.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 md:py-24 bg-green-600">
        <div className="container mx-auto px-4 md:px-6 text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
            Pronto para otimizar sua produção?
          </h2>
          <p className="text-xl text-green-50 max-w-3xl mx-auto mb-8">
            Comece a usar o FertiliSolo hoje mesmo e transforme a forma como você gerencia a fertilidade do seu solo.
          </p>
          <Button 
            onClick={() => navigate('/login')} 
            className="bg-white text-green-600 hover:bg-green-50 text-lg py-6 px-8 rounded-lg"
          >
            Começar agora
            <ArrowRight className="ml-2 h-5 w-5" />
          </Button>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12">
        <div className="container mx-auto px-4 md:px-6">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="mb-8 md:mb-0">
              <div className="flex items-center space-x-2">
                <img src="/logo-fertilisolo.png" alt="FertiliSolo Logo" className="h-8 invert" />
                <span className="font-bold text-xl">FertiliSolo</span>
              </div>
              <p className="mt-2 text-gray-400">
                Sistema de análise de solo e recomendação de adubação
              </p>
            </div>
            <div className="text-center md:text-right">
              <p className="text-gray-400">
                &copy; {new Date().getFullYear()} FertiliSolo. Todos os direitos reservados.
              </p>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage; 