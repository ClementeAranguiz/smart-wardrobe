import React from 'react';
import { X, Calendar, Tag } from 'lucide-react';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ClothingItem, ClimateType } from '@/types/detections';
import { 
  Sun, 
  Snowflake, 
  CloudRain, 
  Cloud, 
  Thermometer 
} from 'lucide-react';

interface ClothingViewDialogProps {
  item: ClothingItem;
  isOpen: boolean;
  onClose: () => void;
}

const climateIcons = {
  calor: Sun,
  frio: Snowflake,
  lluvia: CloudRain,
  entretiempo: Cloud,
  nieve: Snowflake,
  viento: Cloud
};

const categoryLabels = {
  superior: 'Superior',
  inferior: 'Inferior',
  calzado: 'Calzado',
  accesorio: 'Accesorio',
  abrigo: 'Abrigo'
};

export const ClothingViewDialog: React.FC<ClothingViewDialogProps> = ({
  item,
  isOpen,
  onClose
}) => {
  const formatDate = (date: Date | undefined) => {
    if (!date) return 'Fecha no disponible';
    return new Intl.DateTimeFormat('es-ES', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    }).format(new Date(date));
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto p-0">
        {/* Header con botón de cerrar */}
        <div className="sticky top-0 bg-background/95 backdrop-blur-sm border-b p-4 flex items-center justify-between">
          <h2 className="text-lg font-semibold capitalize">{item.nombre}</h2>
          <Button
            variant="ghost"
            size="icon"
            onClick={onClose}
            className="rounded-full"
          >
            <X className="w-5 h-5" />
          </Button>
        </div>

        <div className="p-6">
          {/* Imagen grande */}
          <div className="relative aspect-square mb-6 rounded-lg overflow-hidden bg-muted">
            {item.imagen ? (
              <img
                src={item.imagen}
                alt={item.nombre}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-muted to-muted/50">
                <Thermometer className="w-16 h-16 text-muted-foreground" />
              </div>
            )}
          </div>

          {/* Información de la prenda */}
          <div className="space-y-4">
            {/* Categoría */}
            <div className="flex items-center gap-2">
              <Tag className="w-4 h-4 text-muted-foreground" />
              <span className="text-sm text-muted-foreground">Categoría:</span>
              <Badge variant="secondary">
                {categoryLabels[item.categoria as keyof typeof categoryLabels] || item.categoria}
              </Badge>
            </div>

            {/* Climas apropiados */}
            <div>
              <div className="flex items-center gap-2 mb-2">
                <Cloud className="w-4 h-4 text-muted-foreground" />
                <span className="text-sm text-muted-foreground">Climas apropiados:</span>
              </div>
              <div className="flex flex-wrap gap-2">
                {item.climas.map((clima) => {
                  const Icon = climateIcons[clima as ClimateType] || Cloud;
                  return (
                    <div
                      key={clima}
                      className="flex items-center gap-1 px-3 py-1 rounded-full bg-secondary text-secondary-foreground text-sm"
                    >
                      <Icon className="w-3.5 h-3.5" />
                      <span className="capitalize">{clima}</span>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Fecha de creación */}
            {item.fechaCreacion && (
              <div className="flex items-center gap-2">
                <Calendar className="w-4 h-4 text-muted-foreground" />
                <span className="text-sm text-muted-foreground">Agregada el:</span>
                <span className="text-sm">{formatDate(item.fechaCreacion)}</span>
              </div>
            )}

            {/* Información adicional si existe */}
            {item.id && (
              <div className="pt-4 border-t">
                <p className="text-xs text-muted-foreground">
                  ID: {item.id}
                </p>
              </div>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
