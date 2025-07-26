import React from 'react';
import { motion } from 'framer-motion';
import { Thermometer, Palette } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { cn } from '@/lib/utils';

interface PrioritySliderProps {
  value: number; // 0-100, donde 0 = solo clima, 100 = solo color
  onChange: (value: number) => void;
  className?: string;
}

export const PrioritySlider: React.FC<PrioritySliderProps> = ({
  value,
  onChange,
  className
}) => {
  const getLabel = (val: number) => {
    if (val <= 20) return 'Priorizar Clima';
    if (val >= 80) return 'Priorizar Color';
    return 'Balance';
  };

  const getDescription = (val: number) => {
    if (val <= 20) return 'Se priorizan prendas adecuadas para el clima';
    if (val >= 80) return 'Se priorizan combinaciones de colores armoniosas';
    return 'Se equilibra clima y armonía de colores';
  };

  const getWeights = (val: number) => {
    const colorWeight = val / 100;
    const climateWeight = 1 - colorWeight;
    return {
      climate: Math.round(climateWeight * 100),
      color: Math.round(colorWeight * 100)
    };
  };

  const weights = getWeights(value);

  return (
    <Card className={cn("border-dashed", className)}>
      <CardContent className="p-4 space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="font-medium text-sm">Prioridad del Outfit</h3>
          <span className="text-xs text-muted-foreground">
            {getLabel(value)}
          </span>
        </div>

        {/* Slider */}
        <div className="space-y-3">
          <div className="relative">
            <input
              type="range"
              min={0}
              max={100}
              step={5}
              value={value}
              onChange={(e) => onChange(parseInt(e.target.value))}
              className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer slider"
            />

            {/* Marcadores visuales */}
            <div className="flex justify-between mt-2 text-xs text-muted-foreground">
              <div className="flex items-center gap-1">
                <Thermometer className="w-3 h-3" />
                <span>Clima</span>
              </div>
              <div className="flex items-center gap-1">
                <span>Balance</span>
              </div>
              <div className="flex items-center gap-1">
                <Palette className="w-3 h-3" />
                <span>Color</span>
              </div>
            </div>
          </div>

          {/* Indicadores de peso */}
          <div className="flex gap-2">
            <motion.div
              layout
              className="flex-1 bg-blue-100 rounded-lg p-2 text-center"
              style={{
                backgroundColor: `rgba(59, 130, 246, ${weights.climate / 100 * 0.3 + 0.1})`
              }}
            >
              <div className="flex items-center justify-center gap-1 mb-1">
                <Thermometer className="w-3 h-3 text-blue-600" />
                <span className="text-xs font-medium text-blue-700">Clima</span>
              </div>
              <div className="text-sm font-bold text-blue-800">
                {weights.climate}%
              </div>
            </motion.div>

            <motion.div
              layout
              className="flex-1 bg-purple-100 rounded-lg p-2 text-center"
              style={{
                backgroundColor: `rgba(147, 51, 234, ${weights.color / 100 * 0.3 + 0.1})`
              }}
            >
              <div className="flex items-center justify-center gap-1 mb-1">
                <Palette className="w-3 h-3 text-purple-600" />
                <span className="text-xs font-medium text-purple-700">Color</span>
              </div>
              <div className="text-sm font-bold text-purple-800">
                {weights.color}%
              </div>
            </motion.div>
          </div>

          {/* Descripción */}
          <p className="text-xs text-muted-foreground text-center">
            {getDescription(value)}
          </p>
        </div>
      </CardContent>

      {/* Estilos CSS para el slider */}
      <style jsx>{`
        .slider::-webkit-slider-thumb {
          appearance: none;
          height: 20px;
          width: 20px;
          border-radius: 50%;
          background: #8b5cf6;
          cursor: pointer;
          border: 2px solid #ffffff;
          box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
        }

        .slider::-moz-range-thumb {
          height: 20px;
          width: 20px;
          border-radius: 50%;
          background: #8b5cf6;
          cursor: pointer;
          border: 2px solid #ffffff;
          box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
        }

        .slider::-webkit-slider-track {
          height: 8px;
          border-radius: 4px;
          background: linear-gradient(to right, #3b82f6 0%, #8b5cf6 50%, #a855f7 100%);
        }

        .slider::-moz-range-track {
          height: 8px;
          border-radius: 4px;
          background: linear-gradient(to right, #3b82f6 0%, #8b5cf6 50%, #a855f7 100%);
        }
      `}</style>
    </Card>
  );
};
