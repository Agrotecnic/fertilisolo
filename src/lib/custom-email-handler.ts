import { supabase } from './supabase';

/**
 * Enviar email de recuperação de senha personalizado
 * 
 * Esta função envia um email de recuperação de senha usando a API do Supabase,
 * mas personaliza a experiência do usuário redirecionando para nossa própria página
 * de redefinição de senha, evitando assim a exibição de páginas padrão do Supabase.
 */
export async function sendPasswordResetEmail(email: string) {
  try {
    // Geramos um URL de redirecionamento para nossa página personalizada de redefinição de senha
    const redirectTo = `${window.location.origin}/reset-password`;
    
    // Chamamos a API do Supabase para enviar o email de recuperação
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo,
    });
    
    if (error) throw error;
    
    return { success: true };
  } catch (error) {
    console.error('Erro ao enviar email de recuperação:', error);
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Erro desconhecido' 
    };
  }
}

/**
 * Atualizar senha do usuário
 * 
 * Esta função é usada na página de redefinição de senha para atualizar
 * a senha do usuário após clicar no link do email.
 */
export async function updateUserPassword(newPassword: string) {
  try {
    const { error } = await supabase.auth.updateUser({
      password: newPassword
    });
    
    if (error) throw error;
    
    return { success: true };
  } catch (error) {
    console.error('Erro ao atualizar senha:', error);
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Erro desconhecido' 
    };
  }
}

/**
 * Obter a sessão atual do usuário para verificar o estado de autenticação
 * durante o processo de redefinição de senha
 */
export async function getCurrentSession() {
  try {
    const { data, error } = await supabase.auth.getSession();
    
    if (error) throw error;
    
    return data.session;
  } catch (error) {
    console.error('Erro ao obter sessão:', error);
    return null;
  }
} 