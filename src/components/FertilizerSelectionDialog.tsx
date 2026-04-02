import React, { useState, useCallback } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { FileText, CheckSquare, Square, ChevronDown, ChevronUp } from 'lucide-react';
import { FERTILIZER_SECTIONS, ALL_FERTILIZER_IDS, FertilizerSection } from '@/constants/fertilizerData';

interface FertilizerSelectionDialogProps {
  open: boolean;
  onClose: () => void;
  onGenerate: (selectedIds: string[]) => void;
  isGenerating?: boolean;
}

export const FertilizerSelectionDialog: React.FC<FertilizerSelectionDialogProps> = ({
  open,
  onClose,
  onGenerate,
  isGenerating = false,
}) => {
  const [selected, setSelected] = useState<Set<string>>(new Set(ALL_FERTILIZER_IDS));
  const [expandedSections, setExpandedSections] = useState<Set<string>>(
    new Set(FERTILIZER_SECTIONS.map((s) => s.id)),
  );

  const toggleItem = useCallback((id: string) => {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  }, []);

  const toggleSection = useCallback((section: FertilizerSection) => {
    const sectionIds = section.items.map((i) => i.id);
    const allSelected = sectionIds.every((id) => selected.has(id));

    setSelected((prev) => {
      const next = new Set(prev);
      if (allSelected) {
        sectionIds.forEach((id) => next.delete(id));
      } else {
        sectionIds.forEach((id) => next.add(id));
      }
      return next;
    });
  }, [selected]);

  const toggleExpandSection = useCallback((sectionId: string) => {
    setExpandedSections((prev) => {
      const next = new Set(prev);
      if (next.has(sectionId)) {
        next.delete(sectionId);
      } else {
        next.add(sectionId);
      }
      return next;
    });
  }, []);

  const selectAll = useCallback(() => {
    setSelected(new Set(ALL_FERTILIZER_IDS));
  }, []);

  const deselectAll = useCallback(() => {
    setSelected(new Set());
  }, []);

  const handleGenerate = useCallback(() => {
    onGenerate(Array.from(selected));
  }, [selected, onGenerate]);

  const totalCount = ALL_FERTILIZER_IDS.length;
  const selectedCount = selected.size;

  return (
    <Dialog open={open} onOpenChange={(isOpen) => !isOpen && onClose()}>
      <DialogContent className="max-w-lg max-h-[85vh] flex flex-col p-0 gap-0">
        <DialogHeader className="px-6 pt-6 pb-4 border-b border-gray-100 flex-shrink-0">
          <DialogTitle className="text-lg font-bold text-gray-900 flex items-center gap-2">
            <FileText className="h-5 w-5 text-green-600" />
            Configurar Relatório
          </DialogTitle>
          <DialogDescription className="text-sm text-gray-500 mt-1">
            Escolha quais fertilizantes devem aparecer no PDF gerado.
          </DialogDescription>
        </DialogHeader>

        {/* Barra de controle global */}
        <div className="px-6 py-3 bg-gray-50 border-b border-gray-100 flex items-center justify-between flex-shrink-0">
          <span className="text-sm text-gray-600">
            <span className="font-semibold text-green-700">{selectedCount}</span>
            <span className="text-gray-400"> / {totalCount}</span>
            {' '}fertilizantes selecionados
          </span>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={selectAll}
              className="text-xs text-green-700 hover:text-green-900 font-medium flex items-center gap-1 transition-colors"
            >
              <CheckSquare className="h-3.5 w-3.5" />
              Todos
            </button>
            <span className="text-gray-300">|</span>
            <button
              type="button"
              onClick={deselectAll}
              className="text-xs text-gray-500 hover:text-gray-700 font-medium flex items-center gap-1 transition-colors"
            >
              <Square className="h-3.5 w-3.5" />
              Nenhum
            </button>
          </div>
        </div>

        {/* Lista de seções com scroll */}
        <div className="overflow-y-auto flex-1 px-6 py-4 space-y-3">
          {FERTILIZER_SECTIONS.map((section) => {
            const sectionIds = section.items.map((i) => i.id);
            const selectedInSection = sectionIds.filter((id) => selected.has(id)).length;
            const allInSection = selectedInSection === sectionIds.length;
            const someInSection = selectedInSection > 0 && !allInSection;
            const isExpanded = expandedSections.has(section.id);

            return (
              <div
                key={section.id}
                className="border border-gray-200 rounded-lg overflow-hidden bg-white"
              >
                {/* Cabeçalho da seção */}
                <div className="flex items-center gap-3 px-4 py-3 bg-gray-50 hover:bg-gray-100 transition-colors">
                  <Checkbox
                    id={`section-${section.id}`}
                    checked={allInSection}
                    data-state={someInSection ? 'indeterminate' : allInSection ? 'checked' : 'unchecked'}
                    onCheckedChange={() => toggleSection(section)}
                    className="data-[state=indeterminate]:bg-green-600 data-[state=indeterminate]:border-green-600"
                  />
                  <button
                    type="button"
                    className="flex-1 flex items-center justify-between text-left"
                    onClick={() => toggleExpandSection(section.id)}
                  >
                    <div className="flex-1">
                      <span className="text-sm font-semibold text-gray-800">{section.title}</span>
                      <Badge
                        variant="outline"
                        className="ml-2 text-xs py-0 h-5 text-green-700 border-green-300 bg-green-50"
                      >
                        {selectedInSection}/{sectionIds.length}
                      </Badge>
                    </div>
                    {isExpanded ? (
                      <ChevronUp className="h-4 w-4 text-gray-400 flex-shrink-0" />
                    ) : (
                      <ChevronDown className="h-4 w-4 text-gray-400 flex-shrink-0" />
                    )}
                  </button>
                </div>

                {/* Itens da seção */}
                {isExpanded && (
                  <div className="divide-y divide-gray-100">
                    {section.items.map((item) => {
                      const isChecked = selected.has(item.id);
                      return (
                        <label
                          key={item.id}
                          htmlFor={`item-${item.id}`}
                          className={`flex items-center gap-3 px-4 py-2.5 cursor-pointer transition-colors ${
                            isChecked ? 'bg-white' : 'bg-gray-50 opacity-60'
                          } hover:bg-green-50`}
                        >
                          <Checkbox
                            id={`item-${item.id}`}
                            checked={isChecked}
                            onCheckedChange={() => toggleItem(item.id)}
                          />
                          <div className="flex-1 flex items-center justify-between gap-2">
                            <span className="text-sm text-gray-700">{item.name}</span>
                            <span className="text-xs text-gray-400 whitespace-nowrap flex-shrink-0">
                              {item.amount} {item.unit}
                            </span>
                          </div>
                        </label>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          })}
        </div>

        <DialogFooter className="px-6 py-4 border-t border-gray-100 flex-shrink-0 gap-2">
          <Button variant="outline" onClick={onClose} disabled={isGenerating}>
            Cancelar
          </Button>
          <Button
            onClick={handleGenerate}
            disabled={isGenerating || selectedCount === 0}
            className="bg-green-600 hover:bg-green-700 gap-2"
          >
            <FileText className="h-4 w-4" />
            {isGenerating ? 'Gerando...' : 'Gerar Relatório PDF'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
