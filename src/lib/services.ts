import { supabase } from './supabase';
import { SoilData } from '../types/soilAnalysis';

// Interface para fazendas
export interface Farm {
  id?: string;
  name: string;
  location?: string;
  area_size?: number;
  area_unit?: string;
  user_id?: string;
}

// Interface para talhões/parcelas
export interface Plot {
  id?: string;
  name: string;
  farm_id: string;
  area_size?: number;
  area_unit?: string;
  soil_type?: string;
}

// Interface para análise de solo com formato compatível com o banco de dados
export interface SoilAnalysisDB {
  id?: string;
  user_id?: string;
  farm_name?: string;
  location?: string;
  collection_date?: string;
  ph?: number;
  organic_matter?: number;
  phosphorus?: number; // P
  potassium?: number;  // K
  calcium?: number;    // Ca
  magnesium?: number;  // Mg
  sulfur?: number;     // S
  boron?: number;      // B
  copper?: number;     // Cu
  iron?: number;       // Fe
  manganese?: number;  // Mn
  zinc?: number;       // Zn
  clay_content?: number; // Percentual de argila
  plot_id?: string;
}

// Interface para recomendação de fertilizantes
export interface FertilizerRecommendation {
  id?: string;
  soil_analysis_id: string;
  fertilizer_source_id: string;
  recommendation_amount: number;
  notes?: string;
}

/**
 * Converte o formato SoilData da aplicação para o formato do banco
 */
export const convertSoilDataToDBFormat = (data: SoilData, userId?: string, plotId?: string): SoilAnalysisDB => {
  return {
    user_id: userId,
    farm_name: data.location,
    location: data.location,
    collection_date: data.date,
    ph: 5.7, // Valor padrão, ajustar conforme necessário
    organic_matter: data.organicMatter,
    phosphorus: data.P,
    potassium: data.K,
    calcium: data.Ca,
    magnesium: data.Mg,
    sulfur: data.S,
    boron: data.B,
    copper: data.Cu,
    iron: data.Fe,
    manganese: data.Mn,
    zinc: data.Zn,
    clay_content: data.argila,
    plot_id: plotId && plotId.trim() !== '' ? plotId : null // Apenas use plotId se não for vazio
  };
};

/**
 * Converte o formato do banco para o formato SoilData da aplicação
 */
export const convertDBToSoilDataFormat = (data: SoilAnalysisDB): SoilData => {
  return {
    id: data.id,
    location: data.location || '',
    date: data.collection_date || new Date().toISOString().split('T')[0],
    organicMatter: data.organic_matter || 0,
    T: 10, // Valor padrão de CTC, deve ser calculado baseado nos dados
    P: data.phosphorus || 0,
    argila: data.clay_content || 35, // Valor padrão de 35% se não tiver o dado
    K: data.potassium || 0,
    Ca: data.calcium || 0,
    Mg: data.magnesium || 0,
    S: data.sulfur || 0,
    B: data.boron || 0,
    Cu: data.copper || 0,
    Fe: data.iron || 0,
    Mn: data.manganese || 0,
    Zn: data.zinc || 0,
    Mo: 0 // Valor padrão para Molibdênio que não está no banco
  };
};

/**
 * Salva uma nova fazenda no Supabase
 */
export const saveFarm = async (farm: Farm) => {
  try {
    // Verificar se o usuário está autenticado
    const { data: { session } } = await supabase.auth.getSession();
    if (!session?.user) {
      throw new Error('Usuário não autenticado');
    }

    // Adicionar o ID do usuário à fazenda
    const farmWithUserId = {
      ...farm,
      user_id: session.user.id
    };

    // Inserir a fazenda no banco de dados
    const { data, error } = await supabase
      .from('farms')
      .insert(farmWithUserId)
      .select();

    if (error) throw error;
    
    return { data, error: null };
  } catch (error: any) {
    console.error('Erro ao salvar fazenda:', error);
    return { data: null, error };
  }
};

/**
 * Busca todas as fazendas do usuário logado
 */
export const getUserFarms = async () => {
  try {
    // Verificar se o usuário está autenticado
    const { data: { session } } = await supabase.auth.getSession();
    if (!session?.user) {
      throw new Error('Usuário não autenticado');
    }

    // Buscar fazendas do usuário
    const { data, error } = await supabase
      .from('farms')
      .select('*')
      .eq('user_id', session.user.id);

    if (error) throw error;
    
    return { data, error: null };
  } catch (error: any) {
    console.error('Erro ao buscar fazendas:', error);
    return { data: [], error };
  }
};

/**
 * Salva um novo talhão/parcela no Supabase
 */
export const savePlot = async (plot: Plot) => {
  try {
    // Verificar se o usuário está autenticado
    const { data: { session } } = await supabase.auth.getSession();
    if (!session?.user) {
      throw new Error('Usuário não autenticado');
    }

    // Inserir o talhão no banco de dados
    const { data, error } = await supabase
      .from('plots')
      .insert(plot)
      .select();

    if (error) throw error;
    
    return { data, error: null };
  } catch (error: any) {
    console.error('Erro ao salvar talhão:', error);
    return { data: null, error };
  }
};

/**
 * Busca todos os talhões de uma fazenda
 */
export const getFarmPlots = async (farmId: string) => {
  try {
    // Verificar se o usuário está autenticado
    const { data: { session } } = await supabase.auth.getSession();
    if (!session?.user) {
      throw new Error('Usuário não autenticado');
    }

    // Buscar talhões da fazenda
    const { data, error } = await supabase
      .from('plots')
      .select('*')
      .eq('farm_id', farmId);

    if (error) throw error;
    
    return { data, error: null };
  } catch (error: any) {
    console.error('Erro ao buscar talhões:', error);
    return { data: [], error };
  }
};

/**
 * Salva uma análise de solo no Supabase
 */
export const saveSoilAnalysis = async (analysis: SoilData, plotId?: string) => {
  try {
    console.log('🔍 [SAVE] Iniciando salvamento de análise...');
    
    // Verificar se o usuário está autenticado
    const { data: { session } } = await supabase.auth.getSession();
    console.log('🔍 [SAVE] Session:', session ? 'Existe' : 'NULL', 'User ID:', session?.user?.id);
    
    if (!session?.user) {
      throw new Error('Usuário não autenticado');
    }

    // Verificar se plotId é válido (não vazio)
    const validPlotId = plotId && plotId.trim() !== '' ? plotId : null;
    console.log('🔍 [SAVE] Plot ID:', validPlotId);

    // Converter para o formato do banco
    const analysisDB = convertSoilDataToDBFormat(analysis, session.user.id, validPlotId);
    console.log('🔍 [SAVE] Dados convertidos para DB:', {
      user_id: analysisDB.user_id,
      location: analysisDB.location,
      collection_date: analysisDB.collection_date,
      hasValues: {
        Ca: !!analysisDB.calcium,
        Mg: !!analysisDB.magnesium,
        K: !!analysisDB.potassium
      }
    });

    // Inserir análise no banco de dados
    console.log('🔍 [SAVE] Tentando inserir no Supabase...');
    const { data, error } = await supabase
      .from('soil_analyses')
      .insert(analysisDB)
      .select();

    if (error) {
      console.error('❌ [SAVE] Erro do Supabase:', error);
      throw error;
    }
    
    console.log('✅ [SAVE] Análise salva com sucesso!', data);
    return { data, error: null };
  } catch (error: any) {
    console.error('❌ [SAVE] Erro ao salvar análise de solo:', error);
    console.error('❌ [SAVE] Detalhes do erro:', {
      message: error.message,
      code: error.code,
      details: error.details,
      hint: error.hint
    });
    return { data: null, error };
  }
};

/**
 * Busca as análises de solo do usuário
 */
export const getUserSoilAnalyses = async () => {
  try {
    // Verificar se o usuário está autenticado
    const { data: { session } } = await supabase.auth.getSession();
    if (!session?.user) {
      throw new Error('Usuário não autenticado');
    }

    // Buscar análises do usuário
    const { data, error } = await supabase
      .from('soil_analyses')
      .select('*')
      .eq('user_id', session.user.id);

    if (error) throw error;
    
    console.log("Análises brutas do Supabase:", data);
    
    // Converter cada análise para o formato SoilData
    const convertedData = data ? data.map(analysis => {
      const converted = convertDBToSoilDataFormat(analysis);
      console.log("Análise convertida:", converted);
      return converted;
    }) : [];
    
    return { data: convertedData, error: null };
  } catch (error: any) {
    console.error('Erro ao buscar análises de solo:', error);
    return { data: [], error };
  }
};

/**
 * Salva uma recomendação de fertilizante no Supabase
 */
export const saveFertilizerRecommendation = async (recommendation: FertilizerRecommendation) => {
  try {
    // Verificar se o usuário está autenticado
    const { data: { session } } = await supabase.auth.getSession();
    if (!session?.user) {
      throw new Error('Usuário não autenticado');
    }

    // Inserir recomendação no banco de dados
    const { data, error } = await supabase
      .from('fertilizer_recommendations')
      .insert(recommendation)
      .select();

    if (error) throw error;
    
    return { data, error: null };
  } catch (error: any) {
    console.error('Erro ao salvar recomendação de fertilizante:', error);
    return { data: null, error };
  }
};

/**
 * Deleta uma análise de solo do Supabase pelo ID
 */
export const deleteSoilAnalysis = async (analysisId: string) => {
  try {
    // Verificar se o usuário está autenticado
    const { data: { session } } = await supabase.auth.getSession();
    if (!session?.user) {
      throw new Error('Usuário não autenticado');
    }

    // Deletar a análise
    const { error } = await supabase
      .from('soil_analyses')
      .delete()
      .eq('id', analysisId)
      .eq('user_id', session.user.id); // Garantir que a análise pertence ao usuário

    if (error) throw error;
    
    return { success: true, error: null };
  } catch (error: any) {
    console.error('Erro ao deletar análise de solo:', error);
    return { success: false, error };
  }
}; 