import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Calendar, Save, ArrowLeft } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { ImageWithLoading } from '@/components/ui/image-with-loading';
import { DatePickerDialog } from '@/components/calendar/DatePickerDialog';
import { Outfit } from '@/types/detections';
import { useOutfitContext } from '@/contexts/OutfitContext';
import { cn } from '@/lib/utils';

interface RegisterUsageScreenProps {
  onBack: () => void;
}

export const RegisterUsageScreen: React.FC<RegisterUsageScreenProps> = ({ onBack }) => {
  const [selectedOutfit, setSelectedOutfit] = useState<Outfit | null>(null);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [saving, setSaving] = useState(false);

  const { outfits, addUsageDate } = useOutfitContext();

  const handleSave = async () => {
    if (!selectedOutfit) {
      alert('Por favor selecciona un outfit');
      return;
    }

    try {
      setSaving(true);
      await addUsageDate(selectedOutfit.id, selectedDate);

      // Limpiar formulario y volver
      setSelectedOutfit(null);
      setSelectedDate(new Date());
      onBack();
    } catch (error) {
      console.error('Error registering usage:', error);
      alert('Error al registrar el uso del outfit');
    } finally {
      setSaving(false);
    }
  };

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
              disabled={saving}
            >
              <ArrowLeft className="w-5 h-5" />
            </Button>
            <div className="flex-1">
              <h1 className="text-2xl font-bold">Registrar Uso</h1>
              <p className="text-muted-foreground">
                Marca cuándo usaste un outfit
              </p>
            </div>
            <Button
              onClick={handleSave}
              disabled={saving || !selectedOutfit}
            >
              {saving ? (
                <>
                  <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin mr-2" />
                  Guardando...
                </>
              ) : (
                <>
                  <Save className="w-4 h-4 mr-2" />
                  Guardar
                </>
              )}
            </Button>
          </div>
        </motion.div>
      </div>

      {/* Content */}
      <div className="flex-1 px-6 pb-6 overflow-auto space-y-6">
        {/* Selector de outfit */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="space-y-3"
        >
          <Label>1. Selecciona el outfit</Label>
          
          {outfits.length === 0 ? (
            <Card>
              <CardContent className="p-6">
                <div className="text-center text-muted-foreground">
                  <Calendar className="w-12 h-12 mx-auto mb-3 opacity-50" />
                  <p className="font-medium">No tienes outfits creados</p>
                  <p className="text-sm">Crea un outfit primero para poder registrar su uso</p>
                </div>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-3">
              {outfits.map((outfit) => (
                <motion.div
                  key={outfit.id}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <Card 
                    className={cn(
                      "cursor-pointer transition-colors",
                      selectedOutfit?.id === outfit.id 
                        ? "ring-2 ring-primary bg-primary/5" 
                        : "hover:bg-muted/50"
                    )}
                    onClick={() => setSelectedOutfit(outfit)}
                  >
                    <CardContent className="p-4">
                      <div className="flex items-center gap-4">
                        {/* Vista previa de prendas */}
                        <div className="flex -space-x-2">
                          {outfit.prendas.slice(0, 3).map((prenda, index) => (
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
                          {outfit.prendas.length > 3 && (
                            <div className="w-12 h-12 rounded-full border-2 border-background bg-muted flex items-center justify-center">
                              <span className="text-xs font-medium">
                                +{outfit.prendas.length - 3}
                              </span>
                            </div>
                          )}
                        </div>

                        {/* Información del outfit */}
                        <div className="flex-1">
                          <h3 className="font-medium">{outfit.nombre}</h3>
                          <div className="flex items-center gap-2 mt-1">
                            <Badge variant="secondary" className="text-xs">
                              {outfit.prendas.length} prenda{outfit.prendas.length !== 1 ? 's' : ''}
                            </Badge>
                            {outfit.fechasUso && outfit.fechasUso.length > 0 && (
                              <Badge variant="outline" className="text-xs">
                                {outfit.fechasUso.length} uso{outfit.fechasUso.length !== 1 ? 's' : ''}
                              </Badge>
                            )}
                          </div>
                        </div>

                        {/* Indicador de selección */}
                        {selectedOutfit?.id === outfit.id && (
                          <div className="w-6 h-6 bg-primary rounded-full flex items-center justify-center">
                            <div className="w-2 h-2 bg-primary-foreground rounded-full" />
                          </div>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>
          )}
        </motion.div>

        {/* Selector de fecha - Solo aparece cuando hay outfit seleccionado */}
        {selectedOutfit && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
            className="space-y-3"
          >
            <Label>2. Selecciona la fecha de uso</Label>
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground mb-1">
                      Fecha seleccionada:
                    </p>
                    <p className="font-medium">
                      {selectedDate.toLocaleDateString('es-ES', {
                        weekday: 'long',
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric'
                      })}
                    </p>
                  </div>
                  <Button
                    variant="outline"
                    onClick={() => setShowDatePicker(true)}
                    disabled={saving}
                  >
                    <Calendar className="w-4 h-4 mr-2" />
                    Cambiar
                  </Button>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}

        {/* Resumen final */}
        {selectedOutfit && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.1 }}
          >
            <Card className="border-primary/20 bg-primary/5">
              <CardContent className="p-4">
                <div className="text-center">
                  <p className="text-sm text-muted-foreground mb-2">
                    Resumen:
                  </p>
                  <p className="font-medium mb-1">{selectedOutfit.nombre}</p>
                  <p className="text-sm text-muted-foreground">
                    Se registrará para el {selectedDate.toLocaleDateString('es-ES', {
                      weekday: 'long',
                      day: 'numeric',
                      month: 'long'
                    })}
                  </p>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}
      </div>

      {/* Modal de selección de fecha */}
      <DatePickerDialog
        isOpen={showDatePicker}
        onClose={() => setShowDatePicker(false)}
        selectedDate={selectedDate}
        onDateSelect={setSelectedDate}
      />
    </div>
  );
};
