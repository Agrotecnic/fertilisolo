import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate, useLocation } from "react-router-dom";
import { useState, useEffect } from "react";
import Index from "./pages/Index";
import Auth from "./pages/Auth";
import NotFound from "./pages/NotFound";
import LandingPage from "./pages/LandingPage";
import { useAuth } from "./hooks/useAuth";
import { AuthBox } from "./components/AuthBox";
import { Loader2 } from "lucide-react";
import { PwaInstallPrompt } from "./components/PwaInstallPrompt";
import DataTester from "./components/DataTester";
import SupabaseConnectionTest from "./components/SupabaseConnectionTest";
import EnvConfigHelper from "./components/EnvConfigHelper";
import ReportGenerator from "./components/ReportGenerator";

const queryClient = new QueryClient();

// Componente que protege as rotas
const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const { user, loading } = useAuth();
  const location = useLocation();

  console.log("ProtectedRoute - User:", user ? "Logado" : "Não logado", "Loading:", loading);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-green-600" />
      </div>
    );
  }

  if (!user) {
    console.log("Redirecionando para / porque o usuário não está autenticado");
    // Salva a localização atual para redirecionar de volta após o login
    return <Navigate to="/" state={{ from: location }} replace />;
  }

  return <>{children}</>;
};

// Componente para redirecionar usuários já logados para a página do dashboard
const PublicRoute = ({ children }: { children: React.ReactNode }) => {
  const { user, loading } = useAuth();
  
  console.log("PublicRoute - User:", user ? "Logado" : "Não logado", "Loading:", loading);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-green-600" />
      </div>
    );
  }

  if (user) {
    console.log("Redirecionando para /dashboard porque o usuário já está autenticado");
    return <Navigate to="/dashboard" replace />;
  }

  return <>{children}</>;
};

// Componente interno que usa o hook useAuth após o BrowserRouter estar disponível
const AppContent = () => {
  const { user, userType, loading, signOut } = useAuth();

  const handleLogout = async () => {
    try {
      await signOut();
      // Não precisa de navegação aqui, o hook de autenticação já vai redirecionar
    } catch (error) {
      console.error("Erro ao fazer logout:", error);
    }
  };

  return (
    <>
      <Routes>
        {/* Rota principal: landing page para usuários não logados */}
        <Route 
          path="/" 
          element={
            <PublicRoute>
              <LandingPage />
            </PublicRoute>
          } 
        />
        {/* Rota de dashboard: para usuários logados */}
        <Route 
          path="/dashboard" 
          element={
            <ProtectedRoute>
              <Index />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/login" 
          element={
            <PublicRoute>
              <Auth />
            </PublicRoute>
          } 
        />
        {/* Rotas de teste */}
        <Route path="/teste-dados" element={<DataTester />} />
        <Route path="/diagnostico" element={<SupabaseConnectionTest />} />
        <Route path="/config" element={<EnvConfigHelper />} />
        <Route path="/relatorio" element={<ReportGenerator />} />
        {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
        <Route path="*" element={<NotFound />} />
      </Routes>
      
      {/* Componente para instalação do PWA */}
      <PwaInstallPrompt />
    </>
  );
};

const App = () => {
  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <AppContent />
        </TooltipProvider>
      </BrowserRouter>
    </QueryClientProvider>
  );
};

export default App;
