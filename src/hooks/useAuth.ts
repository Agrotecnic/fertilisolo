import { useState, useEffect } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase, UserType } from '@/lib/supabase';

interface UseAuthReturn {
  user: User | null;
  session: Session | null;
  userType: UserType | null;
  loading: boolean;
  signOut: () => Promise<void>;
  refreshSession: () => Promise<void>;
  authError: Error | null;
}

export function useAuth(): UseAuthReturn {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [userType, setUserType] = useState<UserType | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [authError, setAuthError] = useState<Error | null>(null);

  // Função para atualizar a sessão manualmente se necessário
  const refreshSession = async () => {
    try {
      setLoading(true);
      setAuthError(null);
      
      console.log("useAuth - Atualizando sessão manualmente");
      const { data: { session: currentSession }, error } = await supabase.auth.getSession();
      
      if (error) {
        throw error;
      }
      
      console.log("useAuth - Sessão atualizada:", currentSession ? "Existe" : "Não existe");
      
      setSession(currentSession);
      setUser(currentSession?.user ?? null);
      
      if (currentSession?.user) {
        // Obter o tipo de usuário dos metadados
        const type = currentSession.user.user_metadata.userType as UserType;
        console.log("useAuth - Tipo de usuário:", type || "Não definido");
        setUserType(type || null);
      }
    } catch (error) {
      console.error('Erro ao atualizar sessão:', error);
      setAuthError(error instanceof Error ? error : new Error('Erro desconhecido ao atualizar sessão'));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    console.log("useAuth - Hook inicializado");
    
    async function getInitialSession() {
      try {
        console.log("useAuth - Carregando sessão inicial");
        setLoading(true);
        setAuthError(null);
        
        // Verificar se há dados de sessão armazenados localmente
        const storedSession = localStorage.getItem('fertilisolo_session');
        if (storedSession) {
          try {
            const parsedSession = JSON.parse(storedSession);
            const expiresAt = parsedSession.expires_at * 1000; // Converter para milissegundos
            
            // Verificar se a sessão armazenada ainda é válida (não expirou)
            if (expiresAt > Date.now()) {
              console.log("useAuth - Usando sessão armazenada localmente");
              // Usar a sessão armazenada temporariamente enquanto verifica com o servidor
              setSession(parsedSession);
              setUser(parsedSession.user);
              
              if (parsedSession.user) {
                const type = parsedSession.user.user_metadata.userType as UserType;
                setUserType(type || null);
              }
            }
          } catch (e) {
            console.error("Erro ao processar sessão armazenada:", e);
            localStorage.removeItem('fertilisolo_session');
          }
        }
        
        // Obter a sessão atual do servidor
        const { data: { session: currentSession }, error } = await supabase.auth.getSession();
        
        if (error) {
          throw error;
        }
        
        console.log("useAuth - Sessão atual:", currentSession ? "Existe" : "Não existe");
        
        setSession(currentSession);
        setUser(currentSession?.user ?? null);
        
        if (currentSession?.user) {
          // Obter o tipo de usuário dos metadados
          const type = currentSession.user.user_metadata.userType as UserType;
          console.log("useAuth - Tipo de usuário:", type || "Não definido");
          setUserType(type || null);
          
          // Armazenar a sessão localmente
          localStorage.setItem('fertilisolo_session', JSON.stringify(currentSession));
        } else {
          // Limpar sessão armazenada se não houver sessão atual
          localStorage.removeItem('fertilisolo_session');
        }
      } catch (error) {
        console.error('Erro ao carregar sessão:', error);
        setAuthError(error instanceof Error ? error : new Error('Erro desconhecido ao carregar sessão'));
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
        
        // Atualizar a sessão armazenada localmente
        localStorage.setItem('fertilisolo_session', JSON.stringify(session));
      } else {
        setUserType(null);
        // Limpar sessão armazenada
        localStorage.removeItem('fertilisolo_session');
      }
      
      setLoading(false);
      setAuthError(null);
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
      setAuthError(null);
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
      
      // Limpar sessão armazenada
      localStorage.removeItem('fertilisolo_session');
      
      console.log('Logout completo');
    } catch (error) {
      console.error('Erro ao fazer logout:', error);
      setAuthError(error instanceof Error ? error : new Error('Erro desconhecido ao fazer logout'));
      throw error;
    }
  };

  return { user, session, userType, loading, signOut, refreshSession, authError };
} 