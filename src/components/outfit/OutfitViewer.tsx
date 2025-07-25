import React from 'react';
import { motion } from 'framer-motion';
import { ArrowLeft, Calendar, Shirt } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ImageWithLoading } from '@/components/ui/image-with-loading';
import { Outfit, ClothingCategory } from '@/types/detections';

interface OutfitViewerProps {
  outfit: Outfit;
  onBack: () => void;
}

const categoryLabels: Record<ClothingCategory, string> = {
  superior: 'Superiores',
  inferior: 'Inferiores',
  calzado: 'Calzado',
  accesorio: 'Accesorios',
  abrigo: 'Abrigos'
};

const categoryOrder: ClothingCategory[] = ['abrigo', 'superior', 'inferior', 'calzado', 'accesorio'];

export const OutfitViewer: React.FC<OutfitViewerProps> = ({ outfit, onBack }) => {
  const formatDate = (date: Date) => {
    return date.toLocaleDateString('es-ES', {
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    });
  };

  // Agrupar prendas por categoría
  const prendasPorCategoria = outfit.prendas.reduce((acc, prenda) => {
    if (!acc[prenda.categoria]) {
      acc[prenda.categoria] = [];
    }
    acc[prenda.categoria].push(prenda);
    return acc;
  }, {} as Record<ClothingCategory, typeof outfit.prendas>);

  return (
    <div className="flex flex-col h-full bg-background">
      {/* Header */}
      <div className="p-6 pb-4">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <div className="flex items-center gap-4 mb-4">
            <Button
              variant="ghost"
              size="icon"
              onClick={onBack}
            >
              <ArrowLeft className="w-5 h-5" />
            </Button>
            <div className="flex-1">
              <h1 className="text-2xl font-bold">{outfit.nombre}</h1>
              <p className="text-muted-foreground">
                Creado el {formatDate(outfit.fechaCreacion)}
              </p>
            </div>
          </div>

          {/* Información del outfit */}
          <div className="flex flex-wrap gap-2">
            <Badge variant="secondary">
              <Shirt className="w-3 h-3 mr-1" />
              {outfit.prendas.length} prenda{outfit.prendas.length !== 1 ? 's' : ''}
            </Badge>
            
            {outfit.fechasUso && outfit.fechasUso.length > 0 && (
              <Badge variant="outline">
                <Calendar className="w-3 h-3 mr-1" />
                {outfit.fechasUso.length} uso{outfit.fechasUso.length !== 1 ? 's' : ''}
              </Badge>
            )}
          </div>
        </motion.div>
      </div>

      {/* Content */}
      <div className="flex-1 px-6 pb-6 overflow-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="space-y-6"
        >
          {/* Visualización del outfit por categorías */}
          <div className="space-y-4">
            {categoryOrder.map(categoria => {
              const prendas = prendasPorCategoria[categoria];
              if (!prendas || prendas.length === 0) return null;

              return (
                <motion.div
                  key={categoria}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.3, delay: categoryOrder.indexOf(categoria) * 0.1 }}
                >
                  <Card>
                    <CardContent className="p-4">
                      <div className="flex items-center gap-3 mb-3">
                        <Badge variant="outline" className="text-sm">
                          {categoryLabels[categoria]}
                        </Badge>
                        <span className="text-sm text-muted-foreground">
                          {prendas.length} prenda{prendas.length !== 1 ? 's' : ''}
                        </span>
                      </div>

                      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                        {prendas.map((prenda, index) => (
                          <motion.div
                            key={prenda.id}
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ duration: 0.2, delay: index * 0.05 }}
                            className="space-y-2"
                          >
                            <div className="aspect-square relative bg-muted rounded-lg overflow-hidden">
                              <ImageWithLoading
                                src={prenda.imagen}
                                alt={prenda.nombre}
                                className="object-cover w-full h-full"
                                aspectRatio="square"
                              />
                            </div>
                            <p className="text-sm font-medium text-center capitalize truncate">
                              {prenda.nombre}
                            </p>
                          </motion.div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              );
            })}
          </div>

          {/* Fechas de uso */}
          {outfit.fechasUso && outfit.fechasUso.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: 0.5 }}
            >
              <Card>
                <CardContent className="p-4">
                  <h3 className="font-semibold mb-3 flex items-center gap-2">
                    <Calendar className="w-4 h-4" />
                    Historial de uso
                  </h3>
                  
                  <div className="space-y-2">
                    {outfit.fechasUso
                      .sort((a, b) => b.getTime() - a.getTime())
                      .map((fecha, index) => (
                        <div
                          key={index}
                          className="flex items-center justify-between p-2 bg-muted/50 rounded-lg"
                        >
                          <span className="text-sm">
                            {fecha.toLocaleDateString('es-ES', {
                              weekday: 'long',
                              year: 'numeric',
                              month: 'long',
                              day: 'numeric'
                            })}
                          </span>
                          <Badge variant="outline" className="text-xs">
                            {fecha < new Date() ? 'Usado' : 'Planificado'}
                          </Badge>
                        </div>
                      ))}
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          )}
        </motion.div>
      </div>
    </div>
  );
};
