import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronLeft, ChevronRight, Check } from 'lucide-react';
import { ClothingItem, ClothingCategory } from '@/types/detections';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ImageWithLoading } from '@/components/ui/image-with-loading';
import { cn } from '@/lib/utils';

interface ClothingCarouselProps {
  category: ClothingCategory;
  items: ClothingItem[];
  selectedItems: ClothingItem[];
  onSelectionChange: (items: ClothingItem[]) => void;
  className?: string;
}

const categoryLabels: Record<ClothingCategory, string> = {
  superior: 'Prendas Superiores',
  inferior: 'Prendas Inferiores',
  calzado: 'Calzado',
  accesorio: 'Accesorios',
  abrigo: 'Abrigos'
};

export const ClothingCarousel: React.FC<ClothingCarouselProps> = ({
  category,
  items,
  selectedItems,
  onSelectionChange,
  className
}) => {
  const [currentIndex, setCurrentIndex] = useState(0);

  const handlePrevious = () => {
    setCurrentIndex(prev => prev > 0 ? prev - 1 : items.length - 1);
  };

  const handleNext = () => {
    setCurrentIndex(prev => prev < items.length - 1 ? prev + 1 : 0);
  };

  const handleItemToggle = (item: ClothingItem) => {
    const isSelected = selectedItems.some(selected => selected.id === item.id);
    
    if (isSelected) {
      // Remover item
      onSelectionChange(selectedItems.filter(selected => selected.id !== item.id));
    } else {
      // Agregar item
      onSelectionChange([...selectedItems, item]);
    }
  };

  const isItemSelected = (item: ClothingItem) => {
    return selectedItems.some(selected => selected.id === item.id);
  };

  if (items.length === 0) {
    return (
      <div className={cn("space-y-3", className)}>
        <h3 className="text-lg font-semibold">{categoryLabels[category]}</h3>
        <Card className="p-6">
          <div className="text-center text-muted-foreground">
            <p>No tienes prendas en esta categoría</p>
          </div>
        </Card>
      </div>
    );
  }

  const currentItem = items[currentIndex];

  return (
    <div className={cn("space-y-3", className)}>
      <div className="flex items-center justify-between">
        <Badge variant="secondary">
          {selectedItems.length} seleccionada{selectedItems.length !== 1 ? 's' : ''}
        </Badge>
        <span className="text-sm text-muted-foreground">
          {items.length} disponible{items.length !== 1 ? 's' : ''}
        </span>
      </div>

      <Card className="relative overflow-hidden">
        <CardContent className="p-0">
          {/* Navegación */}
          {items.length > 1 && (
            <>
              <Button
                variant="ghost"
                size="icon"
                className="absolute left-2 top-1/2 -translate-y-1/2 z-10 bg-background/80 hover:bg-background shadow-sm"
                onClick={handlePrevious}
              >
                <ChevronLeft className="w-4 h-4" />
              </Button>

              <Button
                variant="ghost"
                size="icon"
                className="absolute right-2 top-1/2 -translate-y-1/2 z-10 bg-background/80 hover:bg-background shadow-sm"
                onClick={handleNext}
              >
                <ChevronRight className="w-4 h-4" />
              </Button>
            </>
          )}

          {/* Item actual */}
          <AnimatePresence mode="wait">
            <motion.div
              key={currentItem.id}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.2 }}
              className="relative"
            >
              {/* Imagen */}
              <div className="aspect-[4/3] relative bg-muted">
                <ImageWithLoading
                  src={currentItem.imagen}
                  alt={currentItem.nombre}
                  className="object-cover w-full h-full"
                  aspectRatio="square"
                />

                {/* Indicador de selección */}
                {isItemSelected(currentItem) && (
                  <div className="absolute inset-0 bg-primary/20 flex items-center justify-center">
                    <div className="bg-primary text-primary-foreground rounded-full p-2">
                      <Check className="w-6 h-6" />
                    </div>
                  </div>
                )}
              </div>

              {/* Información del item */}
              <div className="p-3">
                <h4 className="font-medium text-sm mb-2 capitalize truncate">
                  {currentItem.nombre}
                </h4>

                {/* Botón de selección */}
                <Button
                  variant={isItemSelected(currentItem) ? "default" : "outline"}
                  size="sm"
                  onClick={() => handleItemToggle(currentItem)}
                  className="w-full"
                >
                  {isItemSelected(currentItem) ? (
                    <>
                      <Check className="w-4 h-4 mr-2" />
                      Seleccionada
                    </>
                  ) : (
                    'Seleccionar'
                  )}
                </Button>
              </div>
            </motion.div>
          </AnimatePresence>

          {/* Indicadores de posición */}
          {items.length > 1 && (
            <div className="absolute bottom-16 left-1/2 -translate-x-1/2 flex gap-1 bg-black/50 rounded-full px-2 py-1">
              {items.map((_, index) => (
                <button
                  key={index}
                  onClick={() => setCurrentIndex(index)}
                  className={cn(
                    "w-2 h-2 rounded-full transition-colors",
                    index === currentIndex
                      ? "bg-white"
                      : "bg-white/50"
                  )}
                />
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Lista de items seleccionados */}
      {selectedItems.length > 0 && (
        <div className="space-y-2">
          <p className="text-xs text-muted-foreground">Seleccionadas:</p>
          <div className="flex flex-wrap gap-1">
            {selectedItems.map(item => (
              <Badge
                key={item.id}
                variant="secondary"
                className="cursor-pointer hover:bg-destructive hover:text-destructive-foreground text-xs"
                onClick={() => handleItemToggle(item)}
              >
                {item.nombre}
                <span className="ml-1">×</span>
              </Badge>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
