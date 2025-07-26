import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Sparkles, RefreshCw, X, Palette, Thermometer, Save } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { ClothingCard } from '@/components/cards/ClothingCard';
import { ColorDots } from '@/components/ui/color-display';
import { PrioritySlider } from '@/components/ui/priority-slider';
import { ClothingItem, ColorInfo } from '@/types/detections';

interface GeneratedOutfitModalProps {
  isOpen: boolean;
  onClose: () => void;
  outfit: {
    items: ClothingItem[];
    score: {
      climate: number;
      color: number;
      overall: number;
    };
    colorPalette: ColorInfo[];
    explanation: string;
  } | null;
  onRegenerate: () => void;
  onSaveOutfit?: (outfitName: string) => Promise<void>;
  onPriorityChange?: (priority: number) => void;
  currentPriority?: number;
  loading?: boolean;
}

export const GeneratedOutfitModal: React.FC<GeneratedOutfitModalProps> = ({
  isOpen,
  onClose,
  outfit,
  onRegenerate,
  onSaveOutfit,
  onPriorityChange,
  currentPriority = 50,
  loading = false
}) => {
  const [showSaveDialog, setShowSaveDialog] = useState(false);
  const [outfitName, setOutfitName] = useState('');
  const [saving, setSaving] = useState(false);
  const getScoreColor = (score: number) => {
    if (score >= 0.8) return 'text-green-600';
    if (score >= 0.6) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getScoreLabel = (score: number) => {
    if (score >= 0.8) return 'Excelente';
    if (score >= 0.6) return 'Bueno';
    return 'Mejorable';
  };

  const formatScore = (score: number) => Math.round(score * 100);

  const handleSaveOutfit = async () => {
    if (!onSaveOutfit || !outfitName.trim()) return;

    setSaving(true);
    try {
      await onSaveOutfit(outfitName.trim());
      setShowSaveDialog(false);
      setOutfitName('');
    } catch (error) {
      console.error('Error saving outfit:', error);
      alert('Error al guardar el outfit. Inténtalo de nuevo.');
    } finally {
      setSaving(false);
    }
  };

  const handleShowSaveDialog = () => {
    if (!outfit) return;

    // Generar nombre sugerido basado en las prendas
    const categories = outfit.items.map(item => item.categoria);
    const hasCoat = categories.includes('abrigo');
    const hasAccessory = categories.includes('accesorio');

    let suggestedName = 'Outfit generado';
    if (hasCoat && hasAccessory) {
      suggestedName = 'Outfit completo';
    } else if (hasCoat) {
      suggestedName = 'Outfit con abrigo';
    } else if (hasAccessory) {
      suggestedName = 'Outfit con accesorio';
    }

    setOutfitName(suggestedName);
    setShowSaveDialog(true);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="w-[95vw] sm:max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-purple-500" />
            Outfit Generado
          </DialogTitle>
        </DialogHeader>

        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="text-center">
              <RefreshCw className="w-8 h-8 animate-spin mx-auto mb-4 text-purple-500" />
              <p className="text-muted-foreground">Generando outfit perfecto...</p>
            </div>
          </div>
        ) : outfit ? (
          <div className="space-y-6">
            {/* Slider de prioridad y paleta de colores */}
            <div className="grid grid-cols-1 gap-4">
              {/* Slider de prioridad */}
              {onPriorityChange && (
                <PrioritySlider
                  value={currentPriority}
                  onChange={onPriorityChange}
                />
              )}

              {/* Paleta de colores */}
              <Card>
                <CardContent className="p-4">
                  <h3 className="font-semibold mb-3 flex items-center gap-2">
                    <Palette className="w-4 h-4" />
                    Paleta de Colores
                  </h3>
                  {outfit.colorPalette.length > 0 ? (
                    <div className="space-y-3">
                      <ColorDots
                        colors={outfit.colorPalette}
                        size="lg"
                        maxColors={6}
                      />
                      <div className="text-xs text-muted-foreground">
                        {outfit.colorPalette.length} color{outfit.colorPalette.length !== 1 ? 'es' : ''} principal{outfit.colorPalette.length !== 1 ? 'es' : ''}
                      </div>
                    </div>
                  ) : (
                    <p className="text-sm text-muted-foreground">
                      No hay información de colores disponible
                    </p>
                  )}
                </CardContent>
              </Card>

              {/* Scores compactos */}
              <Card className="border-dashed">
                <CardContent className="p-3">
                  <div className="flex justify-between items-center text-sm">
                    <div className="flex items-center gap-2">
                      <Thermometer className="w-3 h-3 text-blue-600" />
                      <span>Clima: <span className={`font-medium ${getScoreColor(outfit.score.climate)}`}>{formatScore(outfit.score.climate)}%</span></span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Palette className="w-3 h-3 text-purple-600" />
                      <span>Color: <span className={`font-medium ${getScoreColor(outfit.score.color)}`}>{formatScore(outfit.score.color)}%</span></span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span>Total: <span className={`font-bold ${getScoreColor(outfit.score.overall)}`}>{formatScore(outfit.score.overall)}%</span></span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Explicación */}
            {outfit.explanation && (
              <Card>
                <CardContent className="p-4">
                  <p className="text-sm text-muted-foreground">
                    {outfit.explanation}
                  </p>
                </CardContent>
              </Card>
            )}

            {/* Prendas del outfit */}
            <div>
              <h3 className="font-semibold mb-4">
                Prendas Seleccionadas ({outfit.items.length})
              </h3>
              <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                {outfit.items.map((item, index) => (
                  <motion.div
                    key={item.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                  >
                    <ClothingCard 
                      item={item} 
                      showDeleteButton={false}
                      className="h-full"
                    />
                  </motion.div>
                ))}
              </div>
            </div>

            {/* Botones de acción */}
            <div className="space-y-3 pt-4 border-t">
              {/* Primera fila: Botones principales */}
              <div className="flex gap-3">
                <Button
                  variant="outline"
                  onClick={() => {
                    console.log('🔄 Botón "Generar Otro" presionado');
                    onRegenerate();
                  }}
                  disabled={loading}
                  className="flex-1"
                >
                  <RefreshCw className={`w-4 h-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
                  <span className="hidden sm:inline">
                    {loading ? 'Generando...' : 'Generar Otro'}
                  </span>
                  <span className="sm:hidden">
                    {loading ? '...' : 'Otro'}
                  </span>
                </Button>
                {onSaveOutfit && (
                  <Button
                    onClick={handleShowSaveDialog}
                    disabled={loading}
                    className="flex-1 bg-green-600 hover:bg-green-700"
                  >
                    <Save className="w-4 h-4 mr-2" />
                    <span className="hidden sm:inline">Agregar a Outfits</span>
                    <span className="sm:hidden">Guardar</span>
                  </Button>
                )}
              </div>

              {/* Segunda fila: Botón cerrar */}
              <Button
                variant="outline"
                onClick={onClose}
                className="w-full"
              >
                Cerrar
              </Button>
            </div>
          </div>
        ) : (
          <div className="text-center py-12">
            <X className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
            <h3 className="font-semibold mb-2">No se pudo generar un outfit</h3>
            <p className="text-muted-foreground mb-4">
              No hay suficientes prendas compatibles con el clima actual
            </p>
            <Button onClick={onClose} variant="outline">
              Cerrar
            </Button>
          </div>
        )}
      </DialogContent>

      {/* Diálogo para guardar outfit */}
      <Dialog open={showSaveDialog} onOpenChange={setShowSaveDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Save className="w-5 h-5 text-green-600" />
              Guardar Outfit
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="outfit-name">¿Cómo quieres llamar a este outfit?</Label>
              <Input
                id="outfit-name"
                value={outfitName}
                onChange={(e) => setOutfitName(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && !saving && outfitName.trim() && handleSaveOutfit()}
                placeholder="Ej: Outfit casual de verano"
                disabled={saving}
                autoFocus
              />
            </div>

            <div className="flex gap-3">
              <Button
                variant="outline"
                onClick={() => setShowSaveDialog(false)}
                disabled={saving}
                className="flex-1"
              >
                Cancelar
              </Button>
              <Button
                onClick={handleSaveOutfit}
                disabled={saving || !outfitName.trim()}
                className="flex-1 bg-green-600 hover:bg-green-700"
              >
                {saving ? (
                  <>
                    <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin mr-2" />
                    Guardando...
                  </>
                ) : (
                  <>
                    <Save className="w-4 h-4 mr-2" />
                    Guardar Outfit
                  </>
                )}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </Dialog>
  );
};
