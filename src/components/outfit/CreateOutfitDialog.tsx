import React, { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { X, Save, Shirt, ChevronLeft, ChevronRight } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { ClothingItem, ClothingCategory } from '@/types/detections';
import { useWardrobeContext } from '@/contexts/WardrobeContext';
import { useOutfitContext } from '@/contexts/OutfitContext';
import { ClothingCarousel } from './ClothingCarousel';
import { OutfitNameDialog } from './OutfitNameDialog';
import { cn } from '@/lib/utils';

interface CreateOutfitDialogProps {
  isOpen: boolean;
  onClose: () => void;
}

const categories: ClothingCategory[] = ['superior', 'abrigo', 'inferior', 'calzado', 'accesorio'];

const categoryLabels: Record<ClothingCategory, string> = {
  superior: 'Prendas Superiores',
  inferior: 'Prendas Inferiores',
  calzado: 'Calzado',
  accesorio: 'Accesorios',
  abrigo: 'Abrigos'
};

export const CreateOutfitDialog: React.FC<CreateOutfitDialogProps> = ({
  isOpen,
  onClose
}) => {
  const [currentCategoryIndex, setCurrentCategoryIndex] = useState(0);
  const [selectedItems, setSelectedItems] = useState<Record<ClothingCategory, ClothingItem[]>>({
    superior: [],
    inferior: [],
    calzado: [],
    accesorio: [],
    abrigo: []
  });
  const [saving, setSaving] = useState(false);
  const [showNameDialog, setShowNameDialog] = useState(false);

  const { getItemsByCategory } = useWardrobeContext();
  const { createOutfit } = useOutfitContext();

  // Obtener items por categoría
  const itemsByCategory = useMemo(() => {
    return categories.reduce((acc, category) => {
      acc[category] = getItemsByCategory(category);
      return acc;
    }, {} as Record<ClothingCategory, ClothingItem[]>);
  }, [getItemsByCategory]);

  // Calcular total de items seleccionados
  const totalSelectedItems = useMemo(() => {
    return Object.values(selectedItems).flat().length;
  }, [selectedItems]);

  const currentCategory = categories[currentCategoryIndex];

  const handleSelectionChange = (category: ClothingCategory, items: ClothingItem[]) => {
    setSelectedItems(prev => ({
      ...prev,
      [category]: items
    }));
  };

  const handlePreviousCategory = () => {
    setCurrentCategoryIndex(prev => prev > 0 ? prev - 1 : categories.length - 1);
  };

  const handleNextCategory = () => {
    setCurrentCategoryIndex(prev => prev < categories.length - 1 ? prev + 1 : 0);
  };

  const handleSave = () => {
    if (totalSelectedItems === 0) {
      alert('Por favor selecciona al menos una prenda');
      return;
    }
    setShowNameDialog(true);
  };

  const handleConfirmName = async (name: string) => {
    try {
      setSaving(true);
      const allSelectedItems = Object.values(selectedItems).flat();
      await createOutfit(name, allSelectedItems);

      // Limpiar formulario
      setSelectedItems({
        superior: [],
        inferior: [],
        calzado: [],
        accesorio: [],
        abrigo: []
      });
      setCurrentCategoryIndex(0);
      setShowNameDialog(false);
      onClose();
    } catch (error) {
      console.error('Error creating outfit:', error);
      alert('Error al crear el outfit. Inténtalo de nuevo.');
    } finally {
      setSaving(false);
    }
  };

  const handleClose = () => {
    if (!saving) {
      onClose();
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] flex flex-col">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Shirt className="w-5 h-5" />
            Crear Nuevo Outfit
          </DialogTitle>
        </DialogHeader>

        <div className="flex-1 space-y-4 overflow-hidden">
          {/* Resumen de selección */}
          <div className="bg-muted/50 rounded-lg p-3">
            <div className="flex items-center justify-between">
              {/* Mostrar selecciones por categoría */}
              <div className="flex flex-wrap gap-1">
                {categories.map(category => {
                  const count = selectedItems[category].length;
                  if (count === 0) return null;
                  return (
                    <Badge key={category} variant="secondary" className="text-xs">
                      {categoryLabels[category]}: {count}
                    </Badge>
                  );
                })}
                {totalSelectedItems === 0 && (
                  <span className="text-sm text-muted-foreground">
                    Selecciona prendas para tu outfit
                  </span>
                )}
              </div>

              {totalSelectedItems > 0 && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setSelectedItems({
                    superior: [],
                    inferior: [],
                    calzado: [],
                    accesorio: [],
                    abrigo: []
                  })}
                  disabled={saving}
                >
                  Limpiar todo
                </Button>
              )}
            </div>
          </div>

          {/* Navegación de categorías */}
          <div className="flex items-center justify-between bg-muted/30 rounded-lg p-3">
            <Button
              variant="ghost"
              size="sm"
              onClick={handlePreviousCategory}
              disabled={saving}
            >
              <ChevronLeft className="w-4 h-4 mr-1" />
              Anterior
            </Button>

            <div className="text-center">
              <h3 className="font-medium">{categoryLabels[currentCategory]}</h3>
              <p className="text-xs text-muted-foreground">
                {currentCategoryIndex + 1} de {categories.length}
              </p>
            </div>

            <Button
              variant="ghost"
              size="sm"
              onClick={handleNextCategory}
              disabled={saving}
            >
              Siguiente
              <ChevronRight className="w-4 h-4 ml-1" />
            </Button>
          </div>

          {/* Carrusel de la categoría actual */}
          <div className="flex-1 overflow-hidden">
            <motion.div
              key={currentCategory}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.2 }}
              className="h-full"
            >
              <ClothingCarousel
                category={currentCategory}
                items={itemsByCategory[currentCategory]}
                selectedItems={selectedItems[currentCategory]}
                onSelectionChange={(items) => handleSelectionChange(currentCategory, items)}
              />
            </motion.div>
          </div>
        </div>

        {/* Botones de acción */}
        <div className="flex gap-3 pt-4 border-t">
          <Button
            variant="outline"
            onClick={handleClose}
            disabled={saving}
            className="flex-1"
          >
            Cancelar
          </Button>
          <Button
            onClick={handleSave}
            disabled={saving || totalSelectedItems === 0}
            className="flex-1"
          >
            {saving ? (
              <>
                <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin mr-2" />
                Guardando...
              </>
            ) : (
              <>
                <Save className="w-4 h-4 mr-2" />
                Crear Outfit
              </>
            )}
          </Button>
        </div>
      </DialogContent>

      {/* Modal para pedir el nombre */}
      <OutfitNameDialog
        isOpen={showNameDialog}
        onClose={() => setShowNameDialog(false)}
        onConfirm={handleConfirmName}
        loading={saving}
      />
    </Dialog>
  );
};
