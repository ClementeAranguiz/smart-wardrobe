import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, Calendar, Eye } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ImageWithLoading } from '@/components/ui/image-with-loading';
import { OutfitViewer } from '@/components/outfit/OutfitViewer';
import { Outfit } from '@/types/detections';

interface DayOutfitsViewProps {
  date: Date;
  outfits: Outfit[];
  onBack: () => void;
}

export const DayOutfitsView: React.FC<DayOutfitsViewProps> = ({
  date,
  outfits,
  onBack
}) => {
  const [viewingOutfit, setViewingOutfit] = useState<Outfit | null>(null);

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('es-ES', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  // Si estamos viendo un outfit, mostrar el visualizador
  if (viewingOutfit) {
    return (
      <OutfitViewer
        outfit={viewingOutfit}
        onBack={() => setViewingOutfit(null)}
      />
    );
  }

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
              <h1 className="text-2xl font-bold capitalize">
                {formatDate(date)}
              </h1>
              <p className="text-muted-foreground">
                {outfits.length === 0 
                  ? 'No hay outfits registrados para este día'
                  : `${outfits.length} outfit${outfits.length !== 1 ? 's' : ''} registrado${outfits.length !== 1 ? 's' : ''}`
                }
              </p>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Content */}
      <div className="flex-1 px-6 overflow-auto content-with-bottom-nav">
        {outfits.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="h-full flex items-center justify-center"
          >
            <Card className="max-w-md">
              <CardContent className="text-center p-8">
                <div className="w-16 h-16 bg-muted/50 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Calendar className="w-8 h-8 text-muted-foreground" />
                </div>
                
                <h3 className="text-lg font-semibold mb-2">
                  Sin outfits registrados
                </h3>
                
                <p className="text-muted-foreground text-sm">
                  No tienes ningún outfit registrado para este día.
                  Puedes registrar el uso de un outfit desde la sección "Registrar Uso".
                </p>
              </CardContent>
            </Card>
          </motion.div>
        ) : (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5 }}
            className="space-y-4"
          >
            <AnimatePresence>
              {outfits.map((outfit, index) => (
                <motion.div
                  key={outfit.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ duration: 0.3, delay: index * 0.1 }}
                >
                  <Card className="overflow-hidden">
                    <CardContent className="p-4">
                      <div className="flex items-start gap-4">
                        {/* Vista previa de prendas */}
                        <div className="flex -space-x-2">
                          {outfit.prendas.slice(0, 4).map((prenda, prendaIndex) => (
                            <div 
                              key={prenda.id} 
                              className="w-12 h-12 rounded-full border-2 border-background overflow-hidden bg-muted"
                            >
                              <ImageWithLoading
                                src={prenda.imagen}
                                alt={prenda.nombre}
                                className="object-cover w-full h-full"
                                aspectRatio="square"
                              />
                            </div>
                          ))}
                          {outfit.prendas.length > 4 && (
                            <div className="w-12 h-12 rounded-full border-2 border-background bg-muted flex items-center justify-center">
                              <span className="text-xs font-medium">
                                +{outfit.prendas.length - 4}
                              </span>
                            </div>
                          )}
                        </div>

                        {/* Información del outfit */}
                        <div className="flex-1">
                          <h3 className="font-semibold text-lg mb-2">{outfit.nombre}</h3>

                          <div className="flex items-center justify-between">
                            <div>
                              {outfit.fechasUso && outfit.fechasUso.length > 1 && (
                                <Badge variant="outline">
                                  {outfit.fechasUso.length} uso{outfit.fechasUso.length !== 1 ? 's' : ''} total
                                </Badge>
                              )}
                            </div>

                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => setViewingOutfit(outfit)}
                            >
                              <Eye className="w-4 h-4 mr-2" />
                              Ver
                            </Button>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </AnimatePresence>
          </motion.div>
        )}
      </div>
    </div>
  );
};
