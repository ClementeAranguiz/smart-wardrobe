import React from 'react';
import { ColorInfo } from '@/types/detections';
import { cn } from '@/lib/utils';

interface ColorDisplayProps {
  colors?: ColorInfo[];
  size?: 'sm' | 'md' | 'lg';
  showNames?: boolean;
  showPercentages?: boolean;
  maxColors?: number;
  className?: string;
}

export const ColorDisplay: React.FC<ColorDisplayProps> = ({
  colors = [],
  size = 'md',
  showNames = true,
  showPercentages = false,
  maxColors = 3,
  className
}) => {
  if (!colors || colors.length === 0) {
    return null;
  }

  const displayColors = colors.slice(0, maxColors);

  const sizeClasses = {
    sm: 'w-4 h-4 text-xs',
    md: 'w-6 h-6 text-sm',
    lg: 'w-8 h-8 text-base'
  };

  const getTextColor = (color: ColorInfo) => {
    // Calcular luminancia para determinar si usar texto blanco o negro
    const [r, g, b] = color.rgb;
    const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
    return luminance > 0.5 ? '#000000' : '#ffffff';
  };

  return (
    <div className={cn("flex items-center gap-2 flex-wrap", className)}>
      {displayColors.map((color, index) => (
        <div key={index} className="flex items-center gap-1">
          {/* Círculo de color */}
          <div
            className={cn(
              "rounded-full border border-gray-300 flex-shrink-0",
              sizeClasses[size]
            )}
            style={{ backgroundColor: color.hex }}
            title={`${color.nombre}${showPercentages ? ` (${(color.frecuencia * 100).toFixed(0)}%)` : ''}`}
          />
          
          {/* Nombre del color */}
          {showNames && (
            <span className={cn(
              "capitalize font-medium",
              size === 'sm' ? 'text-xs' : size === 'md' ? 'text-sm' : 'text-base'
            )}>
              {color.nombre}
              {showPercentages && (
                <span className="text-muted-foreground ml-1">
                  ({(color.frecuencia * 100).toFixed(0)}%)
                </span>
              )}
            </span>
          )}
        </div>
      ))}
      
      {colors.length > maxColors && (
        <span className={cn(
          "text-muted-foreground",
          size === 'sm' ? 'text-xs' : size === 'md' ? 'text-sm' : 'text-base'
        )}>
          +{colors.length - maxColors} más
        </span>
      )}
    </div>
  );
};

// Componente para mostrar colores como tags/chips
export const ColorTags: React.FC<ColorDisplayProps> = ({
  colors = [],
  maxColors = 3,
  showPercentages = false,
  className
}) => {
  if (!colors || colors.length === 0) {
    return null;
  }

  const displayColors = colors.slice(0, maxColors);

  const getTextColor = (color: ColorInfo) => {
    const [r, g, b] = color.rgb;
    const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
    return luminance > 0.5 ? '#000000' : '#ffffff';
  };

  return (
    <div className={cn("flex items-center gap-1 flex-wrap", className)}>
      {displayColors.map((color, index) => (
        <span
          key={index}
          className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium border"
          style={{
            backgroundColor: color.hex,
            color: getTextColor(color),
            borderColor: color.hex
          }}
        >
          {color.nombre}
          {showPercentages && (
            <span className="ml-1 opacity-75">
              {(color.frecuencia * 100).toFixed(0)}%
            </span>
          )}
        </span>
      ))}
      
      {colors.length > maxColors && (
        <span className="text-xs text-muted-foreground px-2 py-1">
          +{colors.length - maxColors}
        </span>
      )}
    </div>
  );
};

// Componente simple para mostrar solo los círculos de colores
export const ColorDots: React.FC<ColorDisplayProps> = ({
  colors = [],
  size = 'md',
  maxColors = 3,
  className
}) => {
  if (!colors || colors.length === 0) {
    return null;
  }

  const displayColors = colors.slice(0, maxColors);

  const sizeClasses = {
    sm: 'w-3 h-3',
    md: 'w-4 h-4',
    lg: 'w-6 h-6'
  };

  return (
    <div className={cn("flex items-center gap-1", className)}>
      {displayColors.map((color, index) => (
        <div
          key={index}
          className={cn(
            "rounded-full border border-gray-300 flex-shrink-0",
            sizeClasses[size]
          )}
          style={{ backgroundColor: color.hex }}
          title={color.nombre}
        />
      ))}
      
      {colors.length > maxColors && (
        <span className="text-xs text-muted-foreground ml-1">
          +{colors.length - maxColors}
        </span>
      )}
    </div>
  );
};
