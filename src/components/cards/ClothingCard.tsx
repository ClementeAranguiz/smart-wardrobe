import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Trash2, Cloud, Sun, CloudRain, Snowflake, Thermometer, Edit2 } from 'lucide-react';
import { ClothingItem, ClimateType } from '@/types/detections';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ImageWithLoading } from '@/components/ui/image-with-loading';
import { ColorDots } from '@/components/ui/color-display';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { EditClothingDialog } from '@/components/ui/edit-clothing-dialog';
import { ClothingViewDialog } from '@/components/ui/clothing-view-dialog';
import { useWardrobeContext } from '@/contexts/WardrobeContext';
import { cn } from '@/lib/utils';

interface ClothingCardProps {
  item: ClothingItem;
  onDelete?: (itemId: string) => void;
  showDeleteButton?: boolean;
  className?: string;
}

const climateIcons: Record<ClimateType, React.ComponentType<{ className?: string }>> = {
  calor: Sun,
  frio: Snowflake,
  'frio extremo': Snowflake,
  lluvia: CloudRain,
  entretiempo: Cloud,
  viento: Cloud,
  nieve: Snowflake,
  interior: Thermometer,
  soleado: Sun
};

const climateColors: Record<ClimateType, string> = {
  calor: 'text-orange-500',
  frio: 'text-blue-500',
  'frio extremo': 'text-blue-700',
  lluvia: 'text-blue-600',
  entretiempo: 'text-gray-500',
  viento: 'text-green-500',
  nieve: 'text-blue-300',
  interior: 'text-purple-500',
  soleado: 'text-yellow-500'
};

const categoryLabels: Record<string, string> = {
  superior: 'Superior',
  inferior: 'Inferior',
  calzado: 'Calzado',
  accesorio: 'Accesorio',
  abrigo: 'Abrigo'
};

export const ClothingCard: React.FC<ClothingCardProps> = ({
  item,
  onDelete,
  showDeleteButton = true,
  className
}) => {
  const [isDeleting, setIsDeleting] = useState(false);
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [showViewDialog, setShowViewDialog] = useState(false);
  const { updateItem, removeItem } = useWardrobeContext();

  const handleDelete = async () => {
    if (onDelete) {
      setIsDeleting(true);
      try {
        await onDelete(item.id);
      } catch (error) {
        console.error('Error deleting item:', error);
      } finally {
        setIsDeleting(false);
      }
    }
  };

  const handleEdit = () => {
    setShowEditDialog(true);
  };

  const handleSave = async (itemId: string, updates: Partial<ClothingItem>) => {
    await updateItem(itemId, updates);
  };

  const handleRemove = async (itemId: string) => {
    await removeItem(itemId);
  };

  const handleCardClick = () => {
    setShowViewDialog(true);
  };

  return (
    <>
    <motion.div
      layout
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.9 }}
      whileHover={{ y: -4 }}
      transition={{
        type: "spring",
        stiffness: 300,
        damping: 30
      }}
      className={cn("clothing-card", className)}
    >
      <Card className="overflow-hidden cursor-pointer" onClick={handleCardClick}>
        {/* Imagen */}
        <div className="relative aspect-square overflow-hidden bg-muted group">
          {item.imagen ? (
            <ImageWithLoading
              src={item.imagen}
              alt={item.nombre}
              className="object-cover w-full h-full"
              fallbackIcon={Thermometer}
              aspectRatio="square"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-muted to-muted/50">
              <Thermometer className="w-12 h-12 text-muted-foreground" />
            </div>
          )}
          



        </div>

        <CardContent className="p-4">
          {/* Nombre completo */}
          <h3 className="font-semibold text-sm mb-2 capitalize leading-tight">
            {item.nombre}
          </h3>

          {/* Categoría y botones */}
          <div className="flex items-center justify-between mb-3">
            <Badge variant="secondary" className="text-xs">
              {categoryLabels[item.categoria] || item.categoria}
            </Badge>

            {/* Botones de acción */}
            <div className="flex gap-1">
              {/* Botón de editar */}
              <Button
                variant="ghost"
                size="icon"
                className="w-7 h-7 hover:bg-secondary"
                onClick={(e) => {
                  e.stopPropagation();
                  handleEdit();
                }}
              >
                <Edit2 className="w-3.5 h-3.5" />
              </Button>

              {/* Botón de eliminar */}
              {showDeleteButton && onDelete && (
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="w-7 h-7 hover:bg-destructive/10 hover:text-destructive"
                      disabled={isDeleting}
                      onClick={(e) => e.stopPropagation()}
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>¿Eliminar prenda?</AlertDialogTitle>
                      <AlertDialogDescription>
                        Esta acción no se puede deshacer. La prenda "{item.nombre}" será eliminada permanentemente de tu armario.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Cancelar</AlertDialogCancel>
                      <AlertDialogAction
                        onClick={handleDelete}
                        className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                        disabled={isDeleting}
                      >
                        {isDeleting ? 'Eliminando...' : 'Eliminar'}
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              )}
            </div>
          </div>

          {/* Climas */}
          <div className="flex items-center gap-1 flex-wrap mb-2">
            {item.climas.map((clima) => {
              const Icon = climateIcons[clima as ClimateType] || Cloud;
              const colorClass = climateColors[clima as ClimateType] || 'text-gray-500';

              return (
                <motion.div
                  key={clima}
                  whileHover={{ scale: 1.1 }}
                  className={cn(
                    "flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium border",
                    "bg-background/50 backdrop-blur-sm",
                    colorClass
                  )}
                >
                  <Icon className="w-3 h-3" />
                  <span className="capitalize">{clima}</span>
                </motion.div>
              );
            })}
          </div>

          {/* Colores */}
          {item.colores && item.colores.length > 0 && (
            <div className="flex items-center gap-2 mb-2">
              <span className="text-xs text-muted-foreground">Colores:</span>
              <ColorDots
                colors={item.colores}
                size="sm"
                maxColors={3}
              />
            </div>
          )}

          {/* Fecha de creación */}
          <div className="text-xs text-muted-foreground">
            {new Date(item.fechaCreacion).toLocaleDateString('es-ES', {
              day: 'numeric',
              month: 'short'
            })}
          </div>
        </CardContent>
      </Card>
    </motion.div>

    {/* Diálogo de edición */}
    <EditClothingDialog
      item={item}
      isOpen={showEditDialog}
      onClose={() => setShowEditDialog(false)}
      onSave={handleSave}
      onDelete={handleRemove}
    />

    {/* Diálogo de visualización */}
    <ClothingViewDialog
      item={item}
      isOpen={showViewDialog}
      onClose={() => setShowViewDialog(false)}
    />
    </>
  );
};
