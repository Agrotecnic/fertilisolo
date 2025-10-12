import { createClient } from '@supabase/supabase-js';

// Definição do tipo UserType
export type UserType = 'admin' | 'user' | 'analyst' | string;

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('Supabase URL ou Anon Key não encontrados. Verifique suas variáveis de ambiente.');
}

export const supabase = createClient(
  supabaseUrl || '',
  supabaseAnonKey || ''
);

// Funções para acessar dados de referência sem autenticação
export async function getCrops() {
  try {
    // Primeiro tenta usar a função RPC que criamos
    const { data: rpcData, error: rpcError } = await supabase.rpc('get_crops');
    
    if (!rpcError && rpcData) {
      return { data: rpcData, error: null };
  }
    
    // Se falhar, tenta acessar diretamente a tabela (política pública)
    console.log('Função RPC falhou, tentando acesso direto à tabela');
    return await supabase.from('crops').select('*');
  } catch (error) {
    console.error('Erro ao buscar culturas:', error);
    return { data: [], error };
  }
}

export async function getFertilizerSources() {
  try {
    // Primeiro tenta usar a função RPC que criamos
    const { data: rpcData, error: rpcError } = await supabase.rpc('get_fertilizer_sources');
    
    if (!rpcError && rpcData) {
      return { data: rpcData, error: null };
    }
    
    // Se falhar, tenta acessar diretamente a tabela (política pública)
    console.log('Função RPC falhou, tentando acesso direto à tabela');
    return await supabase.from('fertilizer_sources').select('*');
  } catch (error) {
    console.error('Erro ao buscar fertilizantes:', error);
    return { data: [], error };
  }
}

// Tipos para esquema do banco de dados
export type Database = {
  public: {
    Tables: {
      farms: {
        Row: {
          id: string;
          name: string;
          location: string | null;
          area_size: number | null;
          area_unit: string | null;
          user_id: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          location?: string | null;
          area_size?: number | null;
          area_unit?: string | null;
          user_id: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          name?: string;
          location?: string | null;
          area_size?: number | null;
          area_unit?: string | null;
          user_id?: string;
          created_at?: string;
        };
      };
      plots: {
        Row: {
          id: string;
          name: string;
          farm_id: string;
          area_size: number | null;
          area_unit: string | null;
          soil_type: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          farm_id: string;
          area_size?: number | null;
          area_unit?: string | null;
          soil_type?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          name?: string;
          farm_id?: string;
          area_size?: number | null;
          area_unit?: string | null;
          soil_type?: string | null;
          created_at?: string;
        };
      };
      soil_analyses: {
        Row: {
          id: string;
          user_id: string | null;
          farm_name: string | null;
          location: string | null;
          collection_date: string | null;
          ph: number | null;
          organic_matter: number | null;
          phosphorus: number | null;
          potassium: number | null;
          calcium: number | null;
          magnesium: number | null;
          sulfur: number | null;
          boron: number | null;
          copper: number | null;
          iron: number | null;
          manganese: number | null;
          zinc: number | null;
          plot_id: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id?: string | null;
          farm_name?: string | null;
          location?: string | null;
          collection_date?: string | null;
          ph?: number | null;
          organic_matter?: number | null;
          phosphorus?: number | null;
          potassium?: number | null;
          calcium?: number | null;
          magnesium?: number | null;
          sulfur?: number | null;
          boron?: number | null;
          copper?: number | null;
          iron?: number | null;
          manganese?: number | null;
          zinc?: number | null;
          plot_id?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string | null;
          farm_name?: string | null;
          location?: string | null;
          collection_date?: string | null;
          ph?: number | null;
          organic_matter?: number | null;
          phosphorus?: number | null;
          potassium?: number | null;
          calcium?: number | null;
          magnesium?: number | null;
          sulfur?: number | null;
          boron?: number | null;
          copper?: number | null;
          iron?: number | null;
          manganese?: number | null;
          zinc?: number | null;
          plot_id?: string | null;
          created_at?: string;
        };
      };
      fertilizer_recommendations: {
        Row: {
          id: string;
          soil_analysis_id: string;
          fertilizer_source_id: string;
          recommendation_amount: number;
          notes: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          soil_analysis_id: string;
          fertilizer_source_id: string;
          recommendation_amount: number;
          notes?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          soil_analysis_id?: string;
          fertilizer_source_id?: string;
          recommendation_amount?: number;
          notes?: string | null;
          created_at?: string;
        };
      };
      // Novas tabelas para multi-tenant
      organizations: {
        Row: {
          id: string;
          name: string;
          slug: string;
          logo_url: string | null;
          is_active: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          slug: string;
          logo_url?: string | null;
          is_active?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          name?: string;
          slug?: string;
          logo_url?: string | null;
          is_active?: boolean;
          updated_at?: string;
        };
      };
      organization_themes: {
        Row: {
          id: string;
          organization_id: string;
          primary_color: string;
          primary_foreground: string;
          secondary_color: string;
          secondary_foreground: string;
          accent_color: string;
          accent_foreground: string;
          background_color: string;
          foreground_color: string;
          card_color: string;
          card_foreground: string;
          border_color: string;
          input_color: string;
          muted_color: string;
          muted_foreground: string;
          border_radius: string;
          font_family: string;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          organization_id: string;
          primary_color?: string;
          primary_foreground?: string;
          secondary_color?: string;
          secondary_foreground?: string;
          accent_color?: string;
          accent_foreground?: string;
          background_color?: string;
          foreground_color?: string;
          card_color?: string;
          card_foreground?: string;
          border_color?: string;
          input_color?: string;
          muted_color?: string;
          muted_foreground?: string;
          border_radius?: string;
          font_family?: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          organization_id?: string;
          primary_color?: string;
          primary_foreground?: string;
          secondary_color?: string;
          secondary_foreground?: string;
          accent_color?: string;
          accent_foreground?: string;
          background_color?: string;
          foreground_color?: string;
          card_color?: string;
          card_foreground?: string;
          border_color?: string;
          input_color?: string;
          muted_color?: string;
          muted_foreground?: string;
          border_radius?: string;
          font_family?: string;
          updated_at?: string;
        };
      };
      user_organizations: {
        Row: {
          id: string;
          user_id: string;
          organization_id: string;
          role: 'owner' | 'admin' | 'member';
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          organization_id: string;
          role?: 'owner' | 'admin' | 'member';
          created_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          organization_id?: string;
          role?: 'owner' | 'admin' | 'member';
        };
      };
    };
  };
}; 