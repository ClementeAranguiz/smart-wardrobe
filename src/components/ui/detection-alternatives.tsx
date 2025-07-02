import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown, ChevronUp, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ColorDots } from '@/components/ui/color-display';
import { ColorInfo } from '@/types/detections';

interface DetectionOption {
  clase: string;
  confianza: number;
  nombre: string;
  categoria: string;
  climas: string[];
  colores?: ColorInfo[];
}

interface DetectionAlternativesProps {
  mainDetection: DetectionOption;
  alternatives: DetectionOption[];
  onSelectionChange: (selected: DetectionOption) => void;
}

export const DetectionAlternatives: React.FC<DetectionAlternativesProps> = ({
  mainDetection,
  alternatives,
  onSelectionChange
}) => {
  const [showAlternatives, setShowAlternatives] = useState(false);
  const [selectedOption, setSelectedOption] = useState(mainDetection);

  const handleOptionSelect = (option: DetectionOption) => {
    setSelectedOption(option);
    onSelectionChange(option);
  };

  const formatConfidence = (confidence: number) => {
    return `${(confidence * 100).toFixed(1)}%`;
  };

  return (
    <div className="space-y-3">
      {/* Predicción principal */}
      <Card className="border-2 border-primary/20 bg-primary/5">
        <CardContent className="p-4">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <Check className="w-5 h-5 text-primary" />
              <h4 className="font-semibold capitalize">{selectedOption.nombre}</h4>
              <Badge variant="secondary" className="text-xs">
                {formatConfidence(selectedOption.confianza)}
              </Badge>
            </div>
          </div>
          
          <div className="text-sm text-muted-foreground mb-2">
            <span className="font-medium">Categoría:</span> {selectedOption.categoria}
          </div>
          
          <div className="flex flex-wrap gap-1">
            {selectedOption.climas.map((clima) => (
              <Badge key={clima} variant="outline" className="text-xs">
                {clima}
              </Badge>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Botón para mostrar alternativas */}
      {alternatives.length > 0 && (
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setShowAlternatives(!showAlternatives)}
          className="w-full flex items-center justify-center gap-2 text-muted-foreground hover:text-foreground"
        >
          {showAlternatives ? (
            <>
              <ChevronUp className="w-4 h-4" />
              Ocultar otras opciones
            </>
          ) : (
            <>
              <ChevronDown className="w-4 h-4" />
              Ver otras opciones ({alternatives.length})
            </>
          )}
        </Button>
      )}

      {/* Alternativas */}
      <AnimatePresence>
        {showAlternatives && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.2 }}
            className="space-y-2"
          >
            <div className="text-sm text-muted-foreground mb-2">
              ¿No es correcto? Selecciona la opción correcta:
            </div>
            
            {alternatives.map((option, index) => (
              <motion.div
                key={option.clase}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                <Card 
                  className={`cursor-pointer transition-all hover:border-primary/50 ${
                    selectedOption.clase === option.clase 
                      ? 'border-primary bg-primary/5' 
                      : 'border-border hover:bg-accent/50'
                  }`}
                  onClick={() => handleOptionSelect(option)}
                >
                  <CardContent className="p-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="font-medium capitalize text-sm">
                          {option.nombre}
                        </span>
                        <Badge variant="outline" className="text-xs">
                          {formatConfidence(option.confianza)}
                        </Badge>
                      </div>
                      
                      {selectedOption.clase === option.clase && (
                        <Check className="w-4 h-4 text-primary" />
                      )}
                    </div>
                    
                    <div className="text-xs text-muted-foreground mt-1">
                      {option.categoria} • {option.climas.join(', ')}
                    </div>

                    {option.colores && option.colores.length > 0 && (
                      <div className="flex items-center gap-2 mt-2">
                        <span className="text-xs text-muted-foreground">Colores:</span>
                        <ColorDots
                          colors={option.colores}
                          size="sm"
                          maxColors={3}
                        />
                      </div>
                    )}
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
