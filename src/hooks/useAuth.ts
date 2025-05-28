import { useState, useEffect } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase, UserType } from '@/lib/supabase';

interface UseAuthReturn {
  user: User | null;
  session: Session | null;
  userType: UserType | null;
  loading: boolean;
  signOut: () => Promise<void>;
}

export function useAuth(): UseAuthReturn {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [userType, setUserType] = useState<UserType | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    console.log("useAuth - Hook inicializado");
    
    async function getInitialSession() {
      try {
        console.log("useAuth - Carregando sessão inicial");
        setLoading(true);
        
        // Obter a sessão atual
        const { data: { session: currentSession } } = await supabase.auth.getSession();
        console.log("useAuth - Sessão atual:", currentSession ? "Existe" : "Não existe");
        
        setSession(currentSession);
        setUser(currentSession?.user ?? null);
        
        if (currentSession?.user) {
          // Obter o tipo de usuário dos metadados
          const type = currentSession.user.user_metadata.userType as UserType;
          console.log("useAuth - Tipo de usuário:", type || "Não definido");
          setUserType(type || null);
        }
      } catch (error) {
        console.error('Erro ao carregar sessão:', error);
      } finally {
        setLoading(false);
        console.log("useAuth - Carregamento inicial concluído");
      }
    }

    getInitialSession();

    // Configurar ouvinte para mudanças de autenticação
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      console.log('Auth state changed:', _event, session ? 'Session exists' : 'No session');
      setSession(session);
      setUser(session?.user ?? null);
      
      if (session?.user) {
        const type = session.user.user_metadata.userType as UserType;
        console.log("useAuth - Mudança de auth - Tipo de usuário:", type || "Não definido");
        setUserType(type || null);
      } else {
        setUserType(null);
      }
      
      setLoading(false);
    });

    // Limpar ouvinte
    return () => {
      console.log("useAuth - Limpando listener de autenticação");
      subscription.unsubscribe();
    };
  }, []);

  const signOut = async () => {
    try {
      console.log('Iniciando processo de logout...');
      const { error } = await supabase.auth.signOut();
      
      if (error) {
        console.error('Erro no signOut do Supabase:', error);
        throw error;
      }
      
      console.log('Logout do Supabase bem-sucedido, limpando estados...');
      // Limpar estado manualmente
      setUser(null);
      setSession(null);
      setUserType(null);
      
      console.log('Logout completo');
    } catch (error) {
      console.error('Erro ao fazer logout:', error);
      throw error;
    }
  };

  return { user, session, userType, loading, signOut };
} 