import { ClothingItem, ClimateType, ColorInfo } from '@/types/detections';
import { ColorHarmonyService } from './colorHarmonyService';

interface GeneratedOutfit {
  items: ClothingItem[];
  score: {
    climate: number;
    color: number;
    overall: number;
  };
  colorPalette: ColorInfo[];
  explanation: string;
}

interface OutfitRequirements {
  climate: ClimateType;
  availableItems: ClothingItem[];
  includeCoat?: boolean;
}

export class OutfitGeneratorService {
  private static readonly CATEGORY_PRIORITY = [
    'superior',
    'inferior', 
    'calzado',
    'abrigo',
    'accesorio'
  ];

  private static readonly REQUIRED_CATEGORIES = [
    'superior',
    'inferior',
    'calzado'
  ];

  /**
   * Genera un outfit sugerido basado en clima y colores
   */
  static generateOutfit(requirements: OutfitRequirements): GeneratedOutfit | null {
    const { climate, availableItems, includeCoat = false } = requirements;

    // 1. Filtrar prendas por clima (prioridad 2)
    const climateCompatibleItems = this.filterByClimate(availableItems, climate);
    
    if (climateCompatibleItems.length === 0) {
      return null;
    }

    // 2. Agrupar por categoría
    const itemsByCategory = this.groupByCategory(climateCompatibleItems);

    // 3. Verificar que tenemos las categorías esenciales
    if (!this.hasRequiredCategories(itemsByCategory)) {
      return null;
    }

    // 4. Generar combinaciones posibles
    const possibleOutfits = this.generateCombinations(itemsByCategory, includeCoat);

    if (possibleOutfits.length === 0) {
      return null;
    }

    // 5. Evaluar cada combinación
    const evaluatedOutfits = possibleOutfits.map(outfit => 
      this.evaluateOutfit(outfit, climate)
    );

    // 6. Seleccionar el mejor outfit
    const bestOutfit = evaluatedOutfits.reduce((best, current) => 
      current.score.overall > best.score.overall ? current : best
    );

    return bestOutfit;
  }

  /**
   * Filtra prendas compatibles con el clima
   */
  private static filterByClimate(items: ClothingItem[], climate: ClimateType): ClothingItem[] {
    return items.filter(item => 
      item.climas.includes(climate) || 
      item.climas.includes('entretiempo') // Entretiempo es compatible con todo
    );
  }

  /**
   * Agrupa prendas por categoría
   */
  private static groupByCategory(items: ClothingItem[]): Record<string, ClothingItem[]> {
    const groups: Record<string, ClothingItem[]> = {};
    
    items.forEach(item => {
      if (!groups[item.categoria]) {
        groups[item.categoria] = [];
      }
      groups[item.categoria].push(item);
    });

    return groups;
  }

  /**
   * Verifica que tenemos las categorías requeridas
   */
  private static hasRequiredCategories(itemsByCategory: Record<string, ClothingItem[]>): boolean {
    return this.REQUIRED_CATEGORIES.every(category => 
      itemsByCategory[category] && itemsByCategory[category].length > 0
    );
  }

  /**
   * Genera todas las combinaciones posibles de outfit
   */
  private static generateCombinations(
    itemsByCategory: Record<string, ClothingItem[]>, 
    includeCoat: boolean
  ): ClothingItem[][] {
    const combinations: ClothingItem[][] = [];

    // Obtener una prenda de cada categoría requerida
    const superiorItems = itemsByCategory['superior'] || [];
    const inferiorItems = itemsByCategory['inferior'] || [];
    const calzadoItems = itemsByCategory['calzado'] || [];
    const abrigoItems = itemsByCategory['abrigo'] || [];
    const accesorioItems = itemsByCategory['accesorio'] || [];

    // Generar combinaciones básicas (superior + inferior + calzado)
    for (const superior of superiorItems) {
      for (const inferior of inferiorItems) {
        for (const calzado of calzadoItems) {
          const baseOutfit = [superior, inferior, calzado];

          // Agregar abrigo si es necesario y está disponible
          if (includeCoat && abrigoItems.length > 0) {
            for (const abrigo of abrigoItems) {
              const outfitWithCoat = [...baseOutfit, abrigo];
              
              // Opcionalmente agregar accesorio
              if (accesorioItems.length > 0) {
                combinations.push([...outfitWithCoat, accesorioItems[0]]);
              }
              combinations.push(outfitWithCoat);
            }
          } else {
            // Opcionalmente agregar accesorio sin abrigo
            if (accesorioItems.length > 0) {
              combinations.push([...baseOutfit, accesorioItems[0]]);
            }
            combinations.push(baseOutfit);
          }
        }
      }
    }

    return combinations;
  }

  /**
   * Evalúa un outfit completo
   */
  private static evaluateOutfit(items: ClothingItem[], climate: ClimateType): GeneratedOutfit {
    // Evaluar compatibilidad climática (prioridad 2: 50%)
    const climateScore = this.evaluateClimateCompatibility(items, climate);

    // Evaluar compatibilidad de colores (prioridad 3: 50%)
    const colorEvaluation = ColorHarmonyService.evaluateOutfitCompatibility(
      items.map(item => ({ colors: item.colores }))
    );

    // Calcular score general (50% clima, 50% colores)
    const overallScore = (climateScore * 0.5) + (colorEvaluation.overallScore * 0.5);

    // Generar explicación
    const explanation = this.generateExplanation(items, climateScore, colorEvaluation);

    return {
      items,
      score: {
        climate: climateScore,
        color: colorEvaluation.overallScore,
        overall: overallScore
      },
      colorPalette: colorEvaluation.colorPalette,
      explanation
    };
  }

  /**
   * Evalúa la compatibilidad climática del outfit
   */
  private static evaluateClimateCompatibility(items: ClothingItem[], climate: ClimateType): number {
    let totalScore = 0;
    let itemCount = 0;

    items.forEach(item => {
      if (item.climas.includes(climate)) {
        totalScore += 1.0; // Perfecta compatibilidad
      } else if (item.climas.includes('entretiempo')) {
        totalScore += 0.8; // Buena compatibilidad
      } else {
        totalScore += 0.3; // Baja compatibilidad
      }
      itemCount++;
    });

    return itemCount > 0 ? totalScore / itemCount : 0;
  }

  /**
   * Genera una explicación del outfit
   */
  private static generateExplanation(
    items: ClothingItem[], 
    climateScore: number, 
    colorEvaluation: any
  ): string {
    const categories = items.map(item => item.categoria);
    const hasCoat = categories.includes('abrigo');
    const hasAccessory = categories.includes('accesorio');

    let explanation = `Outfit de ${items.length} prendas`;
    
    if (hasCoat) {
      explanation += ' con abrigo';
    }
    
    if (hasAccessory) {
      explanation += ' y accesorio';
    }

    // Agregar información sobre colores si hay buena armonía
    if (colorEvaluation.overallScore > 0.7) {
      const bestHarmony = colorEvaluation.pairScores
        .find(pair => pair.harmony && pair.score > 0.7);
      
      if (bestHarmony?.harmony) {
        explanation += `. ${bestHarmony.harmony.description}`;
      }
    }

    return explanation;
  }

  /**
   * Determina si se necesita abrigo según el clima
   */
  static shouldIncludeCoat(climate: ClimateType): boolean {
    return ['frio', 'frio extremo', 'lluvia', 'nieve', 'viento'].includes(climate);
  }

  /**
   * Obtiene sugerencias de mejora para un outfit
   */
  static getOutfitSuggestions(outfit: GeneratedOutfit): string[] {
    const suggestions: string[] = [];

    if (outfit.score.climate < 0.7) {
      suggestions.push('Considera prendas más adecuadas para el clima actual');
    }

    if (outfit.score.color < 0.6) {
      suggestions.push('Los colores podrían combinar mejor');
    }

    if (outfit.items.length < 4) {
      suggestions.push('Podrías agregar un accesorio para completar el look');
    }

    return suggestions;
  }
}
