import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Sparkles, Palette, Zap, Heart } from 'lucide-react';

/**
 * Componente de demonstração das melhorias visuais implementadas
 * Este componente mostra exemplos de uso das novas classes e efeitos
 */
export const VisualShowcase: React.FC = () => {
  return (
    <div className="min-h-screen bg-gradient-hero py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Header */}
        <div className="text-center mb-16 animate-fade-in-up">
          <h1 className="text-5xl font-bold mb-4">
            <span className="text-gradient">Melhorias Visuais</span>
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Explore os novos componentes e efeitos visuais do FertiliSolo
          </p>
        </div>

        {/* Seção de Botões */}
        <section className="mb-16 animate-fade-in-up">
          <h2 className="text-3xl font-bold mb-6 text-center">Variantes de Botões</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <div className="flex flex-col items-center gap-3 p-6 bg-white rounded-xl shadow-soft">
              <h3 className="font-semibold text-gray-700">Default</h3>
              <Button>Botão Padrão</Button>
            </div>
            
            <div className="flex flex-col items-center gap-3 p-6 bg-white rounded-xl shadow-soft">
              <h3 className="font-semibold text-gray-700">Gradient</h3>
              <Button variant="gradient">Gradiente Verde</Button>
            </div>
            
            <div className="flex flex-col items-center gap-3 p-6 bg-white rounded-xl shadow-soft">
              <h3 className="font-semibold text-gray-700">Gradient Secondary</h3>
              <Button variant="gradientSecondary">Gradiente Azul</Button>
            </div>
            
            <div className="flex flex-col items-center gap-3 p-6 bg-white rounded-xl shadow-soft">
              <h3 className="font-semibold text-gray-700">Gradient Accent</h3>
              <Button variant="gradientAccent">Gradiente Laranja</Button>
            </div>
            
            <div className="flex flex-col items-center gap-3 p-6 bg-white rounded-xl shadow-soft">
              <h3 className="font-semibold text-gray-700">Modern</h3>
              <Button variant="modern">Botão Moderno</Button>
            </div>
            
            <div className="flex flex-col items-center gap-3 p-6 bg-white rounded-xl shadow-soft">
              <h3 className="font-semibold text-gray-700">Glass</h3>
              <Button variant="glass">Efeito Vidro</Button>
            </div>
          </div>
        </section>

        {/* Seção de Tamanhos */}
        <section className="mb-16 animate-fade-in-up">
          <h2 className="text-3xl font-bold mb-6 text-center">Tamanhos de Botões</h2>
          <div className="flex flex-wrap items-center justify-center gap-4 p-6 bg-white rounded-xl shadow-soft">
            <Button size="sm" variant="gradient">Pequeno</Button>
            <Button size="default" variant="gradient">Padrão</Button>
            <Button size="lg" variant="gradient">Grande</Button>
            <Button size="xl" variant="gradient">Extra Grande</Button>
          </div>
        </section>

        {/* Seção de Cards */}
        <section className="mb-16 animate-fade-in-up">
          <h2 className="text-3xl font-bold mb-6 text-center">Cards Melhorados</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            
            {/* Card 1 */}
            <div className="group bg-gradient-soft p-6 rounded-xl shadow-soft hover:shadow-colored-lg transition-all duration-300 hover:-translate-y-2 border border-primary/10 hover:border-primary/30 card-shimmer">
              <div className="w-14 h-14 bg-gradient-primary rounded-xl flex items-center justify-center mb-4 shadow-primary group-hover:scale-110 transition-transform duration-300">
                <Sparkles className="h-7 w-7 text-white" />
              </div>
              <h3 className="text-xl font-semibold text-green-800 mb-3 group-hover:text-primary transition-colors">
                Efeito Shimmer
              </h3>
              <p className="text-gray-600">
                Passe o mouse para ver o efeito de brilho deslizante
              </p>
            </div>

            {/* Card 2 */}
            <div className="group bg-gradient-soft p-6 rounded-xl shadow-soft hover:shadow-secondary transition-all duration-300 hover:-translate-y-2 border border-secondary/10 hover:border-secondary/30 card-shimmer">
              <div className="w-14 h-14 bg-gradient-secondary rounded-xl flex items-center justify-center mb-4 shadow-secondary group-hover:scale-110 transition-transform duration-300">
                <Palette className="h-7 w-7 text-white" />
              </div>
              <h3 className="text-xl font-semibold text-green-800 mb-3 group-hover:text-secondary transition-colors">
                Cores Vibrantes
              </h3>
              <p className="text-gray-600">
                Gradientes e sombras coloridas personalizadas
              </p>
            </div>

            {/* Card 3 */}
            <div className="group bg-gradient-soft p-6 rounded-xl shadow-soft hover:shadow-accent transition-all duration-300 hover:-translate-y-2 border border-accent-dark/10 hover:border-accent-dark/30 card-shimmer">
              <div className="w-14 h-14 bg-gradient-accent rounded-xl flex items-center justify-center mb-4 shadow-accent group-hover:scale-110 transition-transform duration-300">
                <Zap className="h-7 w-7 text-white" />
              </div>
              <h3 className="text-xl font-semibold text-green-800 mb-3 group-hover:text-accent-dark transition-colors">
                Animações Suaves
              </h3>
              <p className="text-gray-600">
                Transições e animações cuidadosamente calibradas
              </p>
            </div>

            {/* Card 4 */}
            <Card className="group">
              <CardHeader>
                <div className="w-14 h-14 bg-gradient-to-br from-pink-500 to-purple-600 rounded-xl flex items-center justify-center mb-4 shadow-lg group-hover:scale-110 transition-transform duration-300">
                  <Heart className="h-7 w-7 text-white" />
                </div>
                <CardTitle className="group-hover:text-primary transition-colors">
                  Card Padrão
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600">
                  Componente Card do ShadCN com hover melhorado
                </p>
              </CardContent>
            </Card>
          </div>
        </section>

        {/* Seção de Animações */}
        <section className="mb-16">
          <h2 className="text-3xl font-bold mb-6 text-center">Animações</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            
            <div className="bg-white p-6 rounded-xl shadow-soft text-center animate-fade-in-up">
              <div className="w-16 h-16 bg-gradient-primary rounded-full mx-auto mb-4 animate-bounce-subtle"></div>
              <h3 className="font-semibold mb-2">Bounce Subtle</h3>
              <p className="text-sm text-gray-600">animate-bounce-subtle</p>
            </div>

            <div className="bg-white p-6 rounded-xl shadow-soft text-center animate-fade-in-up" style={{ animationDelay: '0.1s' }}>
              <div className="w-16 h-16 bg-gradient-secondary rounded-full mx-auto mb-4 animate-pulse-soft"></div>
              <h3 className="font-semibold mb-2">Pulse Soft</h3>
              <p className="text-sm text-gray-600">animate-pulse-soft</p>
            </div>

            <div className="bg-white p-6 rounded-xl shadow-soft text-center animate-fade-in-up" style={{ animationDelay: '0.2s' }}>
              <div className="w-16 h-16 bg-gradient-accent rounded-full mx-auto mb-4 animate-float"></div>
              <h3 className="font-semibold mb-2">Float</h3>
              <p className="text-sm text-gray-600">animate-float</p>
            </div>
          </div>
        </section>

        {/* Seção de Texto com Gradiente */}
        <section className="mb-16 animate-fade-in-up">
          <h2 className="text-3xl font-bold mb-6 text-center">Texto com Gradiente</h2>
          <div className="bg-white p-8 rounded-xl shadow-soft text-center">
            <h3 className="text-5xl font-bold text-gradient mb-4">
              FertiliSolo
            </h3>
            <p className="text-2xl text-gradient-accent mb-4">
              Sistema de Análise de Solo
            </p>
            <p className="text-gray-600">
              Use as classes <code className="bg-gray-100 px-2 py-1 rounded">text-gradient</code> e{' '}
              <code className="bg-gray-100 px-2 py-1 rounded">text-gradient-accent</code>
            </p>
          </div>
        </section>

        {/* Seção de Sombras */}
        <section className="mb-16 animate-fade-in-up">
          <h2 className="text-3xl font-bold mb-6 text-center">Sombras Personalizadas</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-white p-6 rounded-xl shadow-primary hover:shadow-glow transition-shadow">
              <h3 className="font-semibold mb-2">Shadow Primary</h3>
              <p className="text-sm text-gray-600">Sombra verde - hover para brilho</p>
            </div>
            
            <div className="bg-white p-6 rounded-xl shadow-secondary hover:shadow-glow transition-shadow">
              <h3 className="font-semibold mb-2">Shadow Secondary</h3>
              <p className="text-sm text-gray-600">Sombra azul - hover para brilho</p>
            </div>
            
            <div className="bg-white p-6 rounded-xl shadow-accent hover:shadow-glow transition-shadow">
              <h3 className="font-semibold mb-2">Shadow Accent</h3>
              <p className="text-sm text-gray-600">Sombra laranja - hover para brilho</p>
            </div>
          </div>
        </section>

        {/* Seção de Glassmorphism */}
        <section className="mb-16 animate-fade-in-up relative h-64 rounded-2xl overflow-hidden">
          <img 
            src="https://images.unsplash.com/photo-1605000797499-95a51c5269ae?ixlib=rb-4.0.3&auto=format&fit=crop&w=1471&q=80"
            alt="Background"
            className="absolute inset-0 w-full h-full object-cover"
          />
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="glass p-8 rounded-2xl max-w-md text-center">
              <h3 className="text-2xl font-bold mb-2">Glassmorphism</h3>
              <p className="text-gray-700">
                Efeito de vidro com blur de fundo usando a classe <code className="bg-white/50 px-2 py-1 rounded">glass</code>
              </p>
            </div>
          </div>
        </section>

        {/* CTA Final */}
        <section className="relative py-16 bg-gradient-to-br from-primary via-primary-light to-secondary rounded-2xl overflow-hidden animate-fade-in-up">
          <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmZmZmYiIGZpbGwtb3BhY2l0eT0iMC4xIj48cGF0aCBkPSJNMzYgMzRjMC0yLjIxLTEuNzktNC00LTRzLTQgMS43OS00IDQgMS43OSA0IDQgNCA0LTEuNzkgNC00eiIvPjwvZz48L2c+PC9zdmc+')] opacity-20"></div>
          <div className="relative z-10 text-center">
            <h2 className="text-4xl font-bold text-white mb-4">
              Pronto para usar? ✨
            </h2>
            <p className="text-xl text-green-50 mb-6 max-w-2xl mx-auto">
              Todas essas melhorias já estão disponíveis em todo o sistema!
            </p>
            <Button 
              variant="modern"
              size="xl"
              className="bg-white text-primary hover:bg-green-50"
            >
              Explorar Documentação
            </Button>
          </div>
          
          {/* Elementos decorativos */}
          <div className="absolute top-10 left-10 w-20 h-20 bg-white/10 rounded-full blur-xl animate-float"></div>
          <div className="absolute bottom-10 right-10 w-32 h-32 bg-accent/20 rounded-full blur-2xl animate-float" style={{ animationDelay: '1s' }}></div>
        </section>

      </div>
    </div>
  );
};

export default VisualShowcase;

