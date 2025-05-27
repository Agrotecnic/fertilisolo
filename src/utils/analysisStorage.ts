
import { SoilData } from '@/pages/Index';

const STORAGE_KEY = 'soil_analysis_history';

export const saveAnalysisToHistory = (analysis: SoilData): void => {
  try {
    const existingHistory = getAnalysisHistory();
    const newHistory = [analysis, ...existingHistory];
    
    // Manter apenas os últimos 50 registros
    const limitedHistory = newHistory.slice(0, 50);
    
    localStorage.setItem(STORAGE_KEY, JSON.stringify(limitedHistory));
  } catch (error) {
    console.error('Erro ao salvar análise no histórico:', error);
  }
};

export const getAnalysisHistory = (): SoilData[] => {
  try {
    const historyJson = localStorage.getItem(STORAGE_KEY);
    return historyJson ? JSON.parse(historyJson) : [];
  } catch (error) {
    console.error('Erro ao carregar histórico de análises:', error);
    return [];
  }
};

export const deleteAnalysisFromHistory = (id: string): void => {
  try {
    const history = getAnalysisHistory();
    const filteredHistory = history.filter(analysis => analysis.id !== id);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(filteredHistory));
  } catch (error) {
    console.error('Erro ao deletar análise do histórico:', error);
  }
};

export const clearAnalysisHistory = (): void => {
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch (error) {
    console.error('Erro ao limpar histórico de análises:', error);
  }
};
