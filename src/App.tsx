import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate, useLocation } from "react-router-dom";
import { useState, useEffect } from "react";
import Index from "./pages/Index";
import Auth from "./pages/Auth";
import NotFound from "./pages/NotFound";
import { useAuth } from "./hooks/useAuth";
import { AuthBox } from "./components/AuthBox";
import { Loader2 } from "lucide-react";

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
    console.log("Redirecionando para /login porque o usuário não está autenticado");
    // Salva a localização atual para redirecionar de volta após o login
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return <>{children}</>;
};

// Componente para redirecionar usuários já logados para a página principal
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
    console.log("Redirecionando para / porque o usuário já está autenticado");
    return <Navigate to="/" replace />;
  }

  return <>{children}</>;
};

// Componente interno que usa o hook useAuth após o BrowserRouter estar disponível
const AppContent = () => {
  const { user, userType, loading } = useAuth();

  return (
    <>
      {user && userType && (
        <div className="fixed top-4 right-4 z-50">
          <AuthBox user={user} userType={userType} />
        </div>
      )}
      <Routes>
        <Route 
          path="/" 
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
        {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
        <Route path="*" element={<NotFound />} />
      </Routes>
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
