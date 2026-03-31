import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { PlusCircle } from 'lucide-react';
import { FarmManagement } from './FarmManagement';

interface FarmManagementButtonProps {
  onDataUpdated: () => void;
}

export const FarmManagementButton: React.FC<FarmManagementButtonProps> = ({ onDataUpdated }) => {
  const [open, setOpen] = useState(false);

  const handleDataUpdated = () => {
    onDataUpdated();
    // Não fechamos o modal automaticamente para permitir múltiplas adições
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button 
          variant="outline" 
          size="sm" 
          className="mt-1 border-green-600 text-green-700 hover:bg-green-50"
        >
          <PlusCircle className="h-4 w-4 mr-1" />
          Gerenciar Fazendas/Talhões
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[700px] max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Gerenciamento de Fazendas e Talhões</DialogTitle>
        </DialogHeader>
        <FarmManagement onDataUpdated={handleDataUpdated} />
      </DialogContent>
    </Dialog>
  );
}; 