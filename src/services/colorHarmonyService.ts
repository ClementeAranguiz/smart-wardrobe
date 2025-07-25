import { ColorInfo } from '@/types/detections';

interface HSL {
  h: number; // Hue (0-360)
  s: number; // Saturation (0-100)
  l: number; // Lightness (0-100)
}

interface HarmonyResult {
  type: string;
  score: number;
  description: string;
}

export class ColorHarmonyService {
  /**
   * Convierte HEX a HSL
   */
  static hexToHsl(hex: string): HSL {
    // Remover el # si existe
    hex = hex.replace('#', '');
    
    // Convertir a RGB
    const r = parseInt(hex.substr(0, 2), 16) / 255;
    const g = parseInt(hex.substr(2, 2), 16) / 255;
    const b = parseInt(hex.substr(4, 2), 16) / 255;

    const max = Math.max(r, g, b);
    const min = Math.min(r, g, b);
    let h = 0;
    let s = 0;
    const l = (max + min) / 2;

    if (max !== min) {
      const d = max - min;
      s = l > 0.5 ? d / (2 - max - min) : d / (max + min);

      switch (max) {
        case r: h = (g - b) / d + (g < b ? 6 : 0); break;
        case g: h = (b - r) / d + 2; break;
        case b: h = (r - g) / d + 4; break;
      }
      h /= 6;
    }

    return {
      h: h * 360,
      s: s * 100,
      l: l * 100
    };
  }

  /**
   * Calcula la distancia angular entre dos hues
   */
  static angularDistance(h1: number, h2: number): number {
    const diff = Math.abs(h1 - h2);
    return Math.min(diff, 360 - diff);
  }

  /**
   * Evalúa la armonía entre dos colores
   */
  static evaluateHarmony(hue1: number, hue2: number): HarmonyResult {
    const distance = this.angularDistance(hue1, hue2);

    if (distance < 30) {
      return {
        type: 'analogos',
        score: 1.0,
        description: 'Colores análogos'
      };
    } else if (Math.abs(distance - 180) < 20) {
      return {
        type: 'complementarios',
        score: 1.0,
        description: 'Colores complementarios'
      };
    } else if (Math.abs(distance - 120) < 20) {
      return {
        type: 'triadicos',
        score: 0.9,
        description: 'Colores triádicos'
      };
    } else if (Math.abs(distance - 90) < 15) {
      return {
        type: 'cuadraticos',
        score: 0.8,
        description: 'Colores cuadráticos'
      };
    } else if (distance < 60) {
      return {
        type: 'semi_analogos',
        score: 0.7,
        description: 'Semi análogos'
      };
    } else {
      return {
        type: 'disonantes',
        score: 0.2,
        description: 'Colores disonantes'
      };
    }
  }

  /**
   * Evalúa la compatibilidad entre dos prendas basada en sus colores
   */
  static evaluateClothingCompatibility(colors1: ColorInfo[], colors2: ColorInfo[]): {
    score: number;
    bestHarmony: HarmonyResult | null;
    allCombinations: Array<{
      color1: ColorInfo;
      color2: ColorInfo;
      harmony: HarmonyResult;
      weightedScore: number;
    }>;
  } {
    if (!colors1.length || !colors2.length) {
      return {
        score: 0.5, // Neutral si no hay colores
        bestHarmony: null,
        allCombinations: []
      };
    }

    const combinations: Array<{
      color1: ColorInfo;
      color2: ColorInfo;
      harmony: HarmonyResult;
      weightedScore: number;
    }> = [];

    let totalWeightedScore = 0;
    let totalWeight = 0;

    // Evaluar todas las combinaciones posibles
    for (const color1 of colors1) {
      const hsl1 = this.hexToHsl(color1.hex);
      
      for (const color2 of colors2) {
        const hsl2 = this.hexToHsl(color2.hex);
        
        // Evaluar armonía
        const harmony = this.evaluateHarmony(hsl1.h, hsl2.h);
        
        // Calcular peso basado en frecuencia de ambos colores
        const weight = color1.frecuencia * color2.frecuencia;
        
        // Score ponderado por frecuencia
        const weightedScore = harmony.score * weight;
        
        combinations.push({
          color1,
          color2,
          harmony,
          weightedScore
        });

        totalWeightedScore += weightedScore;
        totalWeight += weight;
      }
    }

    // Calcular score promedio ponderado
    const averageScore = totalWeight > 0 ? totalWeightedScore / totalWeight : 0;

    // Encontrar la mejor armonía
    const bestCombination = combinations.reduce((best, current) => 
      current.weightedScore > best.weightedScore ? current : best
    );

    return {
      score: averageScore,
      bestHarmony: bestCombination?.harmony || null,
      allCombinations: combinations
    };
  }

  /**
   * Evalúa la compatibilidad de múltiples prendas
   */
  static evaluateOutfitCompatibility(clothingItems: Array<{ colors?: ColorInfo[] }>): {
    overallScore: number;
    pairScores: Array<{
      item1Index: number;
      item2Index: number;
      score: number;
      harmony: HarmonyResult | null;
    }>;
    colorPalette: ColorInfo[];
  } {
    const pairScores: Array<{
      item1Index: number;
      item2Index: number;
      score: number;
      harmony: HarmonyResult | null;
    }> = [];

    let totalScore = 0;
    let pairCount = 0;

    // Recopilar todos los colores del outfit
    const allColors: ColorInfo[] = [];
    clothingItems.forEach(item => {
      if (item.colors) {
        allColors.push(...item.colors);
      }
    });

    // Evaluar todas las combinaciones de pares
    for (let i = 0; i < clothingItems.length; i++) {
      for (let j = i + 1; j < clothingItems.length; j++) {
        const item1 = clothingItems[i];
        const item2 = clothingItems[j];

        if (item1.colors && item2.colors) {
          const compatibility = this.evaluateClothingCompatibility(item1.colors, item2.colors);
          
          pairScores.push({
            item1Index: i,
            item2Index: j,
            score: compatibility.score,
            harmony: compatibility.bestHarmony
          });

          totalScore += compatibility.score;
          pairCount++;
        }
      }
    }

    const overallScore = pairCount > 0 ? totalScore / pairCount : 0;

    // Crear paleta de colores únicos ordenados por frecuencia
    const colorMap = new Map<string, ColorInfo>();
    allColors.forEach(color => {
      const existing = colorMap.get(color.hex);
      if (existing) {
        existing.frecuencia += color.frecuencia;
      } else {
        colorMap.set(color.hex, { ...color });
      }
    });

    const colorPalette = Array.from(colorMap.values())
      .sort((a, b) => b.frecuencia - a.frecuencia)
      .slice(0, 6); // Máximo 6 colores en la paleta

    return {
      overallScore,
      pairScores,
      colorPalette
    };
  }

  /**
   * Determina si un color es neutro (bajo en saturación)
   */
  static isNeutralColor(color: ColorInfo): boolean {
    const hsl = this.hexToHsl(color.hex);
    return hsl.s < 20; // Saturación menor al 20%
  }

  /**
   * Obtiene el color dominante de una prenda
   */
  static getDominantColor(colors: ColorInfo[]): ColorInfo | null {
    if (!colors.length) return null;
    return colors.reduce((dominant, current) => 
      current.frecuencia > dominant.frecuencia ? current : dominant
    );
  }
}
