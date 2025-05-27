
export interface FertilizerSource {
  name: string;
  concentration: number;
  unit: string;
  benefits: string;
}

export interface FertilizerRecommendation {
  source: FertilizerSource;
  recommendation: number;
}
