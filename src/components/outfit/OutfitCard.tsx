import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Calendar, Trash2, Edit, Eye, MoreVertical } from 'lucide-react';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { ImageWithLoading } from '@/components/ui/image-with-loading';
import { Outfit } from '@/types/detections';
import { cn } from '@/lib/utils';

interface OutfitCardProps {
  outfit: Outfit;
  onDelete?: (outfitId: string) => void;
  onEdit?: (outfit: Outfit) => void;
  onView?: (outfit: Outfit) => void;
  onAddUsage?: (outfit: Outfit) => void;
  className?: string;
}

export const OutfitCard: React.FC<OutfitCardProps> = ({
  outfit,
  onDelete,
  onEdit,
  onView,
  onAddUsage,
  className
}) => {
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  const handleDelete = () => {
    if (showDeleteConfirm) {
      onDelete?.(outfit.id);
      setShowDeleteConfirm(false);
    } else {
      setShowDeleteConfirm(true);
      // Auto-cancelar después de 3 segundos
      setTimeout(() => setShowDeleteConfirm(false), 3000);
    }
  };

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('es-ES', {
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    });
  };

  const usageCount = outfit.fechasUso?.length || 0;

  return (
    <motion.div
      layout
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.9 }}
      className={cn("outfit-card", className)}
    >
      <Card className="overflow-hidden hover:shadow-md transition-shadow">
        <CardHeader className="pb-3">
          <div className="flex items-start justify-between">
            <div className="flex-1 min-w-0">
              <h3 className="font-semibold text-lg truncate">{outfit.nombre}</h3>
              <p className="text-sm text-muted-foreground">
                Creado el {formatDate(outfit.fechaCreacion)}
              </p>
            </div>
            
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="h-8 w-8">
                  <MoreVertical className="w-4 h-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => onView?.(outfit)}>
                  <Eye className="w-4 h-4 mr-2" />
                  Ver detalles
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => onAddUsage?.(outfit)}>
                  <Calendar className="w-4 h-4 mr-2" />
                  Registrar uso
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => onEdit?.(outfit)}>
                  <Edit className="w-4 h-4 mr-2" />
                  Editar
                </DropdownMenuItem>
                <DropdownMenuItem 
                  onClick={handleDelete}
                  className={cn(
                    showDeleteConfirm && "bg-destructive text-destructive-foreground"
                  )}
                >
                  <Trash2 className="w-4 h-4 mr-2" />
                  {showDeleteConfirm ? 'Confirmar eliminación' : 'Eliminar'}
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </CardHeader>

        <CardContent className="space-y-4">
          {/* Vista previa de prendas */}
          <div className="grid grid-cols-4 gap-2">
            {outfit.prendas.slice(0, 4).map((prenda, index) => (
              <div key={prenda.id} className="aspect-square relative">
                <ImageWithLoading
                  src={prenda.imagen}
                  alt={prenda.nombre}
                  className="object-cover w-full h-full rounded-md"
                  aspectRatio="square"
                />
                {index === 3 && outfit.prendas.length > 4 && (
                  <div className="absolute inset-0 bg-black/50 rounded-md flex items-center justify-center">
                    <span className="text-white text-xs font-medium">
                      +{outfit.prendas.length - 4}
                    </span>
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* Información del outfit */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Badge variant="secondary">
                {outfit.prendas.length} prenda{outfit.prendas.length !== 1 ? 's' : ''}
              </Badge>
              {usageCount > 0 && (
                <Badge variant="outline">
                  <Calendar className="w-3 h-3 mr-1" />
                  {usageCount} uso{usageCount !== 1 ? 's' : ''}
                </Badge>
              )}
            </div>
          </div>

          {/* Últimas fechas de uso */}
          {outfit.fechasUso && outfit.fechasUso.length > 0 && (
            <div className="space-y-1">
              <p className="text-xs text-muted-foreground">Últimos usos:</p>
              <div className="flex flex-wrap gap-1">
                {outfit.fechasUso
                  .sort((a, b) => b.getTime() - a.getTime())
                  .slice(0, 3)
                  .map((fecha, index) => (
                    <Badge key={index} variant="outline" className="text-xs">
                      {formatDate(fecha)}
                    </Badge>
                  ))}
              </div>
            </div>
          )}

          {/* Botones de acción rápida */}
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => onView?.(outfit)}
              className="flex-1"
            >
              <Eye className="w-4 h-4 mr-2" />
              Ver
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => onAddUsage?.(outfit)}
              className="flex-1"
            >
              <Calendar className="w-4 h-4 mr-2" />
              Usar
            </Button>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
};
