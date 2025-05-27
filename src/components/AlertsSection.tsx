
import React from 'react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AlertTriangle } from 'lucide-react';
import { CalculatedResults } from '@/pages/Index';

interface AlertsSectionProps {
  results: CalculatedResults;
}

export const AlertsSection: React.FC<AlertsSectionProps> = ({ results }) => {
  if (results.isAdequate.CaMgRatio) {
    return null;
  }

  return (
    <Alert className="border-yellow-300 bg-yellow-50">
      <AlertTriangle className="h-4 w-4 text-yellow-600" />
      <AlertDescription>
        <strong>Atenção:</strong> A relação Ca/Mg está fora do ideal (3:1 a 5:1). 
        Isso pode afetar a absorção de nutrientes pelas plantas. 
        Verifique as recomendações de correção.
      </AlertDescription>
    </Alert>
  );
};
