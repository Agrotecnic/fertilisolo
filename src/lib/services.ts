import { supabase } from './supabase';
import { SoilData } from '../types/soilAnalysis';
import { getSecurityContext, addOrganizationIdToData, validateResourceOwnership } from './securityHelpers';

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
 * Usa securityHelpers para garantir isolamento por organização
 */
export const saveFarm = async (farm: Farm) => {
  try {
    // Obter contexto de segurança
    const validation = await getSecurityContext();
    if (!validation.isValid || !validation.context) {
      return { 
        data: null, 
        error: validation.error || 'Erro de autenticação' 
      };
    }

    // Adicionar organization_id automaticamente usando helper
    const { data: secureData, error: secureError } = await addOrganizationIdToData({
      ...farm,
      user_id: validation.context.userId
    });

    if (secureError || !secureData) {
      return { data: null, error: secureError || 'Erro ao preparar dados' };
    }

    // Inserir a fazenda no banco de dados
    const { data, error } = await supabase
      .from('farms')
      .insert(secureData)
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
 * Usa securityHelpers para garantir isolamento por organização
 */
export const getUserFarms = async () => {
  try {
    // Obter contexto de segurança
    const validation = await getSecurityContext();
    if (!validation.isValid || !validation.context) {
      return { 
        data: [], 
        error: validation.error || 'Erro de autenticação' 
      };
    }

    // Buscar fazendas da organização do usuário
    const { data, error } = await supabase
      .from('farms')
      .select('*')
      .eq('organization_id', validation.context.organizationId);

    if (error) throw error;
    
    return { data, error: null };
  } catch (error: any) {
    console.error('Erro ao buscar fazendas:', error);
    return { data: [], error };
  }
};

/**
 * Salva um novo talhão/parcela no Supabase
 * Usa securityHelpers para garantir isolamento por organização
 */
export const savePlot = async (plot: Plot) => {
  try {
    // Obter contexto de segurança
    const validation = await getSecurityContext();
    if (!validation.isValid || !validation.context) {
      return { 
        data: null, 
        error: validation.error || 'Erro de autenticação' 
      };
    }

    // Adicionar organization_id automaticamente usando helper
    const { data: secureData, error: secureError } = await addOrganizationIdToData(plot);

    if (secureError || !secureData) {
      return { data: null, error: secureError || 'Erro ao preparar dados' };
    }

    // Inserir o talhão no banco de dados
    const { data, error } = await supabase
      .from('plots')
      .insert(secureData)
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
 * Usa securityHelpers para garantir isolamento por organização
 */
export const getFarmPlots = async (farmId: string) => {
  try {
    // Obter contexto de segurança
    const validation = await getSecurityContext();
    if (!validation.isValid || !validation.context) {
      return { 
        data: [], 
        error: validation.error || 'Erro de autenticação' 
      };
    }

    // Buscar talhões da fazenda, garantindo que pertencem à organização do usuário
    const { data, error } = await supabase
      .from('plots')
      .select('*')
      .eq('farm_id', farmId)
      .eq('organization_id', validation.context.organizationId);

    if (error) throw error;
    
    return { data, error: null };
  } catch (error: any) {
    console.error('Erro ao buscar talhões:', error);
    return { data: [], error };
  }
};

/**
 * Salva uma análise de solo no Supabase
 * Usa securityHelpers para garantir isolamento por organização
 */
export const saveSoilAnalysis = async (analysis: SoilData, plotId?: string) => {
  try {
    console.log('🔍 [SAVE] Iniciando salvamento de análise...');
    
    // Obter contexto de segurança
    const validation = await getSecurityContext();
    if (!validation.isValid || !validation.context) {
      return { 
        data: null, 
        error: validation.error || 'Erro de autenticação' 
      };
    }

    console.log('🔍 [SAVE] Contexto de segurança obtido:', {
      userId: validation.context.userId,
      organizationId: validation.context.organizationId
    });

    // Verificar se plotId é válido (não vazio)
    const validPlotId = plotId && plotId.trim() !== '' ? plotId : null;
    console.log('🔍 [SAVE] Plot ID:', validPlotId);

    // Converter para o formato do banco
    const analysisDB = convertSoilDataToDBFormat(analysis, validation.context.userId, validPlotId);
    
    // Adicionar organization_id automaticamente usando helper
    const { data: secureData, error: secureError } = await addOrganizationIdToData(analysisDB);
    
    if (secureError || !secureData) {
      return { data: null, error: secureError || 'Erro ao preparar dados' };
    }

    console.log('🔍 [SAVE] Dados convertidos para DB:', {
      user_id: secureData.user_id,
      organization_id: secureData.organization_id,
      location: secureData.location,
      collection_date: secureData.collection_date,
      hasValues: {
        Ca: !!secureData.calcium,
        Mg: !!secureData.magnesium,
        K: !!secureData.potassium
      }
    });

    // Inserir análise no banco de dados
    console.log('🔍 [SAVE] Tentando inserir no Supabase...');
    const { data, error } = await supabase
      .from('soil_analyses')
      .insert(secureData)
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
 * Usa securityHelpers para garantir isolamento por organização
 */
export const getUserSoilAnalyses = async () => {
  try {
    // Obter contexto de segurança
    const validation = await getSecurityContext();
    if (!validation.isValid || !validation.context) {
      return { 
        data: [], 
        error: validation.error || 'Erro de autenticação' 
      };
    }

    // Buscar análises da organização do usuário
    const { data, error } = await supabase
      .from('soil_analyses')
      .select('*')
      .eq('organization_id', validation.context.organizationId);

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
 * Usa securityHelpers para garantir isolamento por organização
 */
export const saveFertilizerRecommendation = async (recommendation: FertilizerRecommendation) => {
  try {
    // Obter contexto de segurança
    const validation = await getSecurityContext();
    if (!validation.isValid || !validation.context) {
      return { 
        data: null, 
        error: validation.error || 'Erro de autenticação' 
      };
    }

    // Verificar se a análise de solo pertence à organização do usuário
    const { data: analysis, error: fetchError } = await supabase
      .from('soil_analyses')
      .select('organization_id')
      .eq('id', recommendation.soil_analysis_id)
      .single();

    if (fetchError || !analysis) {
      return { 
        data: null, 
        error: fetchError?.message || 'Análise de solo não encontrada' 
      };
    }

    // Validar que a análise pertence à organização do usuário
    const isValid = await validateResourceOwnership(analysis.organization_id);
    if (!isValid) {
      return { 
        data: null, 
        error: 'Análise de solo não pertence à sua organização' 
      };
    }

    // Adicionar organization_id à recomendação usando helper
    const { data: secureData, error: secureError } = await addOrganizationIdToData(recommendation);

    if (secureError || !secureData) {
      return { data: null, error: secureError || 'Erro ao preparar dados' };
    }

    // Garantir que o organization_id seja o mesmo da análise
    secureData.organization_id = analysis.organization_id;

    // Inserir recomendação no banco de dados
    const { data, error } = await supabase
      .from('fertilizer_recommendations')
      .insert(secureData)
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
 * Usa securityHelpers para garantir isolamento por organização
 */
export const deleteSoilAnalysis = async (analysisId: string) => {
  try {
    // Obter contexto de segurança
    const validation = await getSecurityContext();
    if (!validation.isValid || !validation.context) {
      return { 
        success: false, 
        error: validation.error || 'Erro de autenticação' 
      };
    }

    // Primeiro, buscar a análise para verificar se pertence à organização do usuário
    const { data: analysis, error: fetchError } = await supabase
      .from('soil_analyses')
      .select('organization_id')
      .eq('id', analysisId)
      .single();

    if (fetchError || !analysis) {
      return { 
        success: false, 
        error: fetchError?.message || 'Análise não encontrada' 
      };
    }

    // Validar que a análise pertence à organização do usuário
    const isValid = await validateResourceOwnership(analysis.organization_id);
    if (!isValid) {
      return { 
        success: false, 
        error: 'Análise não pertence à sua organização' 
      };
    }

    // Deletar a análise
    const { error } = await supabase
      .from('soil_analyses')
      .delete()
      .eq('id', analysisId)
      .eq('organization_id', validation.context.organizationId);

    if (error) throw error;
    
    return { success: true, error: null };
  } catch (error: any) {
    console.error('Erro ao deletar análise de solo:', error);
    return { success: false, error };
  }
}; 