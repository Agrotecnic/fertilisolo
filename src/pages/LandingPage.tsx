import React from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { ArrowRight, Check, Leaf, BarChart, BarChart2, Beaker, Database, Shield, BookOpen } from 'lucide-react';
import { DynamicLogo } from '@/components/DynamicLogo';

const LandingPage: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div data-landing-page className="min-h-screen flex flex-col overflow-x-hidden">
      {/* Navbar */}
      <nav className="bg-white border-b border-gray-200 fixed w-full z-50 overflow-hidden">
        <div className="max-w-7xl mx-auto flex justify-between items-center py-3 px-4 md:py-4 md:px-6 lg:px-8">
          <div className="flex items-center space-x-2 flex-shrink-0">
            <DynamicLogo size="sm" className="h-8 md:h-10 flex-shrink-0" />
            <span className="text-primary font-bold text-lg md:text-xl lg:text-2xl">FertiliSolo</span>
          </div>
          <div className="flex items-center gap-2 md:gap-4 flex-shrink-0">
            <Link to="/metodologia">
              <Button variant="ghost" size="sm" className="text-sm md:text-base hidden md:flex items-center gap-2">
                <BookOpen className="h-4 w-4" />
                Metodologia
              </Button>
            </Link>
            <Link to="/login">
              <Button variant="ghost" size="sm" className="text-sm md:text-base">Login</Button>
            </Link>
            <Link to="/login">
              <Button size="sm" className="bg-primary hover:bg-primary/90 text-primary-foreground text-sm md:text-base">
                Registrar
              </Button>
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="pt-28 md:pt-32 pb-16 md:pb-24 bg-gradient-hero overflow-hidden relative">
        <div className="absolute inset-0 bg-gradient-radial from-transparent via-green-100/30 to-transparent pointer-events-none"></div>
        <div className="max-w-7xl mx-auto px-4 md:px-6 lg:px-8 relative z-10">
          <div className="flex flex-col lg:flex-row items-center gap-12">
            <div className="lg:w-1/2 flex flex-col items-center text-center lg:items-start lg:text-left z-10">
              <div className="animate-in fade-in slide-in-from-bottom-4 duration-700 mb-6">
                <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary font-medium text-sm border border-primary/20 backdrop-blur-sm shadow-sm ring-1 ring-primary/10">
                  <span className="relative flex h-2 w-2">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-primary"></span>
                  </span>
                  ✨ Transforme sua análise de solo
                </span>
              </div>
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-extrabold text-foreground tracking-tight mb-6 animate-in fade-in slide-in-from-bottom-4 duration-700" style={{ animationDelay: '100ms' }}>
                Potencialize a produtividade da sua <span className="text-gradient">lavoura</span>
              </h1>
              <p className="text-lg md:text-xl text-muted-foreground mb-8 max-w-2xl animate-in fade-in slide-in-from-bottom-4 duration-700" style={{ animationDelay: '200ms' }}>
                Sistema corporativo completo para análise de solo e recomendações hiperprecisas de adubação baseadas em saturação de bases.
              </p>
              <div className="flex flex-col sm:flex-row gap-3 md:gap-4">
                <Link to="/login" className="w-full sm:w-auto">
                  <Button
                    variant="modern"
                    size="lg"
                    className="w-full sm:w-auto"
                  >
                    Começar agora
                    <ArrowRight className="ml-2 h-5 w-5" />
                  </Button>
                </Link>
                <Link to="/relatorio" className="w-full sm:w-auto">
                  <Button
                    variant="outline"
                    size="lg"
                    className="w-full"
                  >
                    Ver demonstração
                  </Button>
                </Link>
              </div>
            </div>
            <div className="md:w-1/2 flex justify-center animate-fade-in-up">
              <img
                src="https://images.unsplash.com/photo-1605000797499-95a51c5269ae?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1471&q=80"
                alt="Análise de solo"
                className="rounded-2xl shadow-colored-lg hover:shadow-glow-lg transition-all duration-500 hover:scale-[1.02] max-w-full h-auto"
                onError={(e) => {
                  e.currentTarget.src = "https://via.placeholder.com/600x400?text=FertiliSolo";
                }}
              />
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 md:py-24 bg-white overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 md:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-primary mb-4">
              Tudo o que você precisa para otimizar sua adubação
            </h2>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
              Ferramentas completas para análise de solo e recomendação precisa de fertilizantes
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
            {/* Feature 1 */}
            <div className="group bg-card p-8 rounded-2xl shadow-sm hover:shadow-xl transition-all duration-500 hover:-translate-y-2 border border-border/50 hover:border-primary/30 animate-in fade-in slide-in-from-bottom-8 duration-700 fill-mode-both" style={{ animationDelay: '100ms' }}>
              <div className="w-14 h-14 bg-primary/10 rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 group-hover:bg-primary transition-all duration-300">
                <Beaker className="h-7 w-7 text-primary group-hover:text-white transition-colors" />
              </div>
              <h3 className="text-xl font-bold text-foreground mb-3 group-hover:text-primary transition-colors">
                Análise de Solo Intuitiva
              </h3>
              <p className="text-muted-foreground leading-relaxed">
                Insira os resultados da sua análise de solo e obtenha interpretações claras sobre o estado de fertilidade.
              </p>
            </div>

            {/* Feature 2 */}
            <div className="group bg-card p-8 rounded-2xl shadow-sm hover:shadow-xl transition-all duration-500 hover:-translate-y-2 border border-border/50 hover:border-secondary/30 animate-in fade-in slide-in-from-bottom-8 duration-700 fill-mode-both" style={{ animationDelay: '200ms' }}>
              <div className="w-14 h-14 bg-secondary/10 rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 group-hover:bg-secondary transition-all duration-300">
                <BarChart className="h-7 w-7 text-secondary group-hover:text-white transition-colors" />
              </div>
              <h3 className="text-xl font-bold text-foreground mb-3 group-hover:text-secondary transition-colors">
                Cálculo de Saturações
              </h3>
              <p className="text-muted-foreground leading-relaxed">
                Calcule automaticamente as saturações de bases e a relação Ca/Mg para entender melhor o equilíbrio do seu solo.
              </p>
            </div>

            {/* Feature 3 */}
            <div className="group bg-card p-8 rounded-2xl shadow-sm hover:shadow-xl transition-all duration-500 hover:-translate-y-2 border border-border/50 hover:border-primary/30 animate-in fade-in slide-in-from-bottom-8 duration-700 fill-mode-both" style={{ animationDelay: '300ms' }}>
              <div className="w-14 h-14 bg-primary/10 rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 group-hover:bg-primary transition-all duration-300">
                <Leaf className="h-7 w-7 text-primary group-hover:text-white transition-colors" />
              </div>
              <h3 className="text-xl font-bold text-foreground mb-3 group-hover:text-primary transition-colors">
                Recomendações Precisas
              </h3>
              <p className="text-muted-foreground leading-relaxed">
                Receba recomendações personalizadas de adubação baseadas nas necessidades reais da sua lavoura.
              </p>
            </div>

            {/* Feature 4 */}
            <div className="group bg-card p-8 rounded-2xl shadow-sm hover:shadow-xl transition-all duration-500 hover:-translate-y-2 border border-border/50 hover:border-primary/30 animate-in fade-in slide-in-from-bottom-8 duration-700 fill-mode-both" style={{ animationDelay: '400ms' }}>
              <div className="w-14 h-14 bg-primary/10 rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 group-hover:bg-primary transition-all duration-300">
                <Database className="h-7 w-7 text-primary group-hover:text-white transition-colors" />
              </div>
              <h3 className="text-xl font-bold text-foreground mb-3 group-hover:text-primary transition-colors">
                Histórico de Análises
              </h3>
              <p className="text-muted-foreground leading-relaxed">
                Mantenha um registro organizado de todas as suas análises e acompanhe a evolução da fertilidade do solo.
              </p>
            </div>

            {/* Feature 5 */}
            <div className="group bg-card p-8 rounded-2xl shadow-sm hover:shadow-xl transition-all duration-500 hover:-translate-y-2 border border-border/50 hover:border-secondary/30 animate-in fade-in slide-in-from-bottom-8 duration-700 fill-mode-both" style={{ animationDelay: '500ms' }}>
              <div className="w-14 h-14 bg-secondary/10 rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 group-hover:bg-secondary transition-all duration-300">
                <BarChart2 className="h-7 w-7 text-secondary group-hover:text-white transition-colors" />
              </div>
              <h3 className="text-xl font-bold text-foreground mb-3 group-hover:text-secondary transition-colors">
                Insights Visuais
              </h3>
              <p className="text-muted-foreground leading-relaxed">
                Visualize dados através de gráficos intuitivos que facilitam a compreensão do estado do seu solo.
              </p>
            </div>

            {/* Feature 6 */}
            <div className="group bg-card p-8 rounded-2xl shadow-sm hover:shadow-xl transition-all duration-500 hover:-translate-y-2 border border-border/50 hover:border-accent/30 animate-in fade-in slide-in-from-bottom-8 duration-700 fill-mode-both" style={{ animationDelay: '600ms' }}>
              <div className="w-14 h-14 bg-accent/10 rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 group-hover:bg-accent transition-all duration-300">
                <Shield className="h-7 w-7 text-accent group-hover:text-white transition-colors" />
              </div>
              <h3 className="text-xl font-bold text-foreground mb-3 group-hover:text-accent transition-colors">
                Disponível Offline
              </h3>
              <p className="text-muted-foreground leading-relaxed">
                Use a plataforma mesmo sem conexão com a internet. Seus dados são sincronizados quando você volta a ficar online.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* How it Works Section */}
      <section className="py-16 md:py-24 bg-gray-50 overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 md:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-primary mb-4">
              Como funciona
            </h2>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
              Um processo simples para maximizar a produtividade da sua lavoura
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 relative">
            {/* Linha conectora visível apenas em telas maiores */}
            <div className="hidden md:block absolute top-[2.5rem] left-[16.66%] right-[16.66%] h-1 bg-gradient-to-r from-primary/20 via-secondary/20 to-accent/20 rounded-full z-0">
              {/* Partículas animadas correndo pela linha */}
              <div className="absolute top-0 left-0 h-full w-1/3 bg-gradient-to-r from-transparent via-primary/50 to-transparent animate-shimmer"></div>
            </div>

            {/* Step 1 */}
            <div className="text-center group animate-in fade-in slide-in-from-bottom-8 duration-700 fill-mode-both relative z-10" style={{ animationDelay: '100ms' }}>
              <div className="relative w-20 h-20 bg-card rounded-2xl flex items-center justify-center mb-6 mx-auto shadow-sm border border-border/50 group-hover:shadow-xl transition-all duration-500 group-hover:-translate-y-2 group-hover:border-primary/30">
                <span className="text-3xl font-extrabold text-primary/80 group-hover:text-primary transition-colors">1</span>
                <div className="absolute -top-2 -right-2 w-6 h-6 bg-primary rounded-full animate-pulse-soft shadow-sm ring-4 ring-background"></div>
              </div>
              <h3 className="text-xl font-bold text-foreground mb-3 group-hover:text-primary transition-colors">
                Insira os Dados
              </h3>
              <p className="text-muted-foreground leading-relaxed">
                Adicione os resultados da análise de solo no sistema, incluindo macro e micronutrientes.
              </p>
            </div>

            {/* Step 2 */}
            <div className="text-center group animate-in fade-in slide-in-from-bottom-8 duration-700 fill-mode-both relative z-10" style={{ animationDelay: '300ms' }}>
              <div className="relative w-20 h-20 bg-card rounded-2xl flex items-center justify-center mb-6 mx-auto shadow-sm border border-border/50 group-hover:shadow-xl transition-all duration-500 group-hover:-translate-y-2 group-hover:border-secondary/30">
                <span className="text-3xl font-extrabold text-secondary/80 group-hover:text-secondary transition-colors">2</span>
                <div className="absolute -top-2 -right-2 w-6 h-6 bg-secondary rounded-full animate-pulse-soft shadow-sm ring-4 ring-background" style={{ animationDelay: '0.5s' }}></div>
              </div>
              <h3 className="text-xl font-bold text-foreground mb-3 group-hover:text-secondary transition-colors">
                Obtenha a Análise
              </h3>
              <p className="text-muted-foreground leading-relaxed">
                O sistema calcula automaticamente as saturações de bases e identifica desequilíbrios nutricionais.
              </p>
            </div>

            {/* Step 3 */}
            <div className="text-center group animate-in fade-in slide-in-from-bottom-8 duration-700 fill-mode-both relative z-10" style={{ animationDelay: '500ms' }}>
              <div className="relative w-20 h-20 bg-card rounded-2xl flex items-center justify-center mb-6 mx-auto shadow-sm border border-border/50 group-hover:shadow-xl transition-all duration-500 group-hover:-translate-y-2 group-hover:border-accent/30">
                <span className="text-3xl font-extrabold text-accent/80 group-hover:text-accent transition-colors">3</span>
                <div className="absolute -top-2 -right-2 w-6 h-6 bg-accent rounded-full animate-pulse-soft shadow-sm ring-4 ring-background" style={{ animationDelay: '1s' }}></div>
              </div>
              <h3 className="text-xl font-bold text-foreground mb-3 group-hover:text-accent transition-colors">
                Aplique as Recomendações
              </h3>
              <p className="text-muted-foreground leading-relaxed">
                Siga as recomendações de adubação geradas para equilibrar o solo e aumentar a produtividade.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="py-16 md:py-24 bg-white overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 md:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-primary mb-4">
              Benefícios do FertiliSolo
            </h2>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
              Otimize recursos e maximize resultados com nossa plataforma
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 lg:gap-12">
            {/* Benefit 1 */}
            <div className="group flex items-start gap-4 p-6 rounded-2xl border border-transparent hover:border-border/50 hover:bg-muted/5 transition-all duration-300 animate-in fade-in slide-in-from-left-8 duration-700 fill-mode-both" style={{ animationDelay: '100ms' }}>
              <div className="mt-1 bg-primary/10 p-3 rounded-xl group-hover:bg-primary group-hover:text-white group-hover:shadow-lg group-hover:-translate-y-1 transition-all duration-300">
                <Check className="h-6 w-6 text-primary group-hover:text-white" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-foreground mb-2">
                  Economia de Fertilizantes
                </h3>
                <p className="text-muted-foreground leading-relaxed">
                  Reduza custos aplicando apenas o necessário com base em recomendações precisas.
                </p>
              </div>
            </div>

            {/* Benefit 2 */}
            <div className="group flex items-start gap-4 p-6 rounded-2xl border border-transparent hover:border-border/50 hover:bg-muted/5 transition-all duration-300 animate-in fade-in slide-in-from-right-8 duration-700 fill-mode-both" style={{ animationDelay: '200ms' }}>
              <div className="mt-1 bg-secondary/10 p-3 rounded-xl group-hover:bg-secondary group-hover:text-white group-hover:shadow-lg group-hover:-translate-y-1 transition-all duration-300">
                <Check className="h-6 w-6 text-secondary group-hover:text-white" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-foreground mb-2">
                  Aumento de Produtividade
                </h3>
                <p className="text-muted-foreground leading-relaxed">
                  Solos equilibrados resultam em plantas mais saudáveis e maior produtividade.
                </p>
              </div>
            </div>

            {/* Benefit 3 */}
            <div className="group flex items-start gap-4 p-6 rounded-2xl border border-transparent hover:border-border/50 hover:bg-muted/5 transition-all duration-300 animate-in fade-in slide-in-from-left-8 duration-700 fill-mode-both" style={{ animationDelay: '300ms' }}>
              <div className="mt-1 bg-primary/10 p-3 rounded-xl group-hover:bg-primary group-hover:text-white group-hover:shadow-lg group-hover:-translate-y-1 transition-all duration-300">
                <Check className="h-6 w-6 text-primary group-hover:text-white" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-foreground mb-2">
                  Sustentabilidade Ambiental
                </h3>
                <p className="text-muted-foreground leading-relaxed">
                  Minimize o impacto ambiental evitando o uso excessivo de fertilizantes.
                </p>
              </div>
            </div>

            {/* Benefit 4 */}
            <div className="group flex items-start gap-4 p-6 rounded-2xl border border-transparent hover:border-border/50 hover:bg-muted/5 transition-all duration-300 animate-in fade-in slide-in-from-right-8 duration-700 fill-mode-both" style={{ animationDelay: '400ms' }}>
              <div className="mt-1 bg-secondary/10 p-3 rounded-xl group-hover:bg-secondary group-hover:text-white group-hover:shadow-lg group-hover:-translate-y-1 transition-all duration-300">
                <Check className="h-6 w-6 text-secondary group-hover:text-white" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-foreground mb-2">
                  Tomada de Decisão Baseada em Dados
                </h3>
                <p className="text-muted-foreground leading-relaxed">
                  Use informações precisas para tomar decisões estratégicas sobre manejo do solo.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="relative py-16 md:py-24 lg:py-32 bg-gradient-to-br from-[#1B5E20] via-[#1B5E20] to-[#1565C0] overflow-hidden">
        {/* Decorative background elements */}
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-white/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/3 pointer-events-none"></div>
        <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-black/10 rounded-full blur-3xl translate-y-1/2 -translate-x-1/3 pointer-events-none"></div>

        <div className="max-w-4xl mx-auto px-4 md:px-6 lg:px-8 text-center text-white relative z-10">
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-extrabold mb-6 animate-in fade-in slide-in-from-bottom-4 duration-700">
            Pronto para <span className="text-transparent bg-clip-text bg-gradient-to-r from-accent to-yellow-300">transformar</span> sua análise de solo?
          </h2>
          <p className="text-xl md:text-2xl text-white/90 mb-10 max-w-2xl mx-auto animate-in fade-in slide-in-from-bottom-4 duration-700" style={{ animationDelay: '200ms' }}>
            Junte-se a produtores e agrônomos que já estão otimizando suas colheitas com o FertiliSolo.
          </p>
          <div className="flex flex-col sm:flex-row justify-center gap-4 animate-in fade-in zoom-in-95 duration-700" style={{ animationDelay: '400ms' }}>
            <Button
              onClick={() => navigate('/login')}
              size="xl"
              className="w-full sm:w-auto h-14 px-10 text-lg bg-white text-[#1B5E20] hover:bg-gray-100 shadow-xl hover:shadow-2xl transition-all hover:scale-105 button-ripple"
            >
              Criar conta gratuita
              <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
            <Link to="/relatorio" className="w-full sm:w-auto">
              <Button
                variant="outline"
                size="xl"
                className="w-full h-14 px-10 text-lg border-white/30 text-white hover:bg-white/10 hover:border-white transition-all backdrop-blur-sm"
              >
                Falar com consultor
              </Button>
            </Link>
          </div>
        </div>

        {/* Elementos flutuantes extras */}
        <div className="absolute top-10 left-10 w-20 h-20 bg-white/10 rounded-full blur-xl animate-float"></div>
        <div className="absolute bottom-10 right-10 w-32 h-32 bg-accent/20 rounded-full blur-2xl animate-float" style={{ animationDelay: '1s' }}></div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12 overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 md:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="mb-8 md:mb-0">
              <div className="flex items-center space-x-2">
                <DynamicLogo size="sm" className="h-8 invert" />
                <span className="font-bold text-xl">FertiliSolo</span>
              </div>
              <p className="mt-2 text-gray-300">
                Sistema de análise de solo e recomendação de adubação
              </p>
            </div>
            <div className="text-center md:text-right">
              <p className="text-gray-300">
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