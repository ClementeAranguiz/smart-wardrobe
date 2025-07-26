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
  colorWeight?: number; // 0-1, donde 0 = solo clima, 1 = solo color, 0.5 = balance
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
    const { climate, availableItems, includeCoat = false, colorWeight = 0.5 } = requirements;

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

    console.log(`🎲 Generadas ${possibleOutfits.length} combinaciones posibles`);

    if (possibleOutfits.length === 0) {
      return null;
    }

    // 5. Evaluar cada combinación
    const evaluatedOutfits = possibleOutfits.map(outfit =>
      this.evaluateOutfit(outfit, climate, colorWeight)
    );

    // 6. Filtrar outfits con score decente (>= 0.6)
    const goodOutfits = evaluatedOutfits.filter(outfit => outfit.score.overall >= 0.6);

    // 7. Si hay buenos outfits, seleccionar uno aleatoriamente de los mejores
    // Si no, tomar el mejor disponible
    let selectedOutfit: GeneratedOutfit;

    if (goodOutfits.length > 0) {
      // Ordenar por score y tomar los top 3 (o menos si hay menos)
      const topOutfits = goodOutfits
        .sort((a, b) => b.score.overall - a.score.overall)
        .slice(0, Math.min(3, goodOutfits.length));

      // Seleccionar uno aleatoriamente de los mejores
      const randomIndex = Math.floor(Math.random() * topOutfits.length);
      selectedOutfit = topOutfits[randomIndex];
      console.log(`🎯 Seleccionado outfit ${randomIndex + 1} de ${topOutfits.length} mejores (score: ${selectedOutfit.score.overall.toFixed(2)})`);
    } else {
      // Fallback: tomar el mejor outfit disponible
      selectedOutfit = evaluatedOutfits.reduce((best, current) =>
        current.score.overall > best.score.overall ? current : best
      );
      console.log(`⚠️ Seleccionado mejor outfit disponible (score: ${selectedOutfit.score.overall.toFixed(2)})`);
    }

    console.log(`👕 Outfit final: ${selectedOutfit.items.map(item => `${item.categoria}:${item.nombre}`).join(', ')}`);
    return selectedOutfit;
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
   * Mezcla un array aleatoriamente (Fisher-Yates shuffle)
   */
  private static shuffleArray<T>(array: T[]): T[] {
    const shuffled = [...array];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
  }

  /**
   * Selecciona elementos aleatorios de un array
   */
  private static getRandomItems<T>(array: T[], count: number): T[] {
    const shuffled = this.shuffleArray(array);
    return shuffled.slice(0, Math.min(count, array.length));
  }

  /**
   * Genera combinaciones de outfit con variabilidad
   */
  private static generateCombinations(
    itemsByCategory: Record<string, ClothingItem[]>,
    includeCoat: boolean
  ): ClothingItem[][] {
    const combinations: ClothingItem[][] = [];

    // Obtener prendas de cada categoría y mezclarlas para variabilidad
    const superiorItems = this.shuffleArray(itemsByCategory['superior'] || []);
    const inferiorItems = this.shuffleArray(itemsByCategory['inferior'] || []);
    const calzadoItems = this.shuffleArray(itemsByCategory['calzado'] || []);
    const abrigoItems = this.shuffleArray(itemsByCategory['abrigo'] || []);
    const accesorioItems = this.shuffleArray(itemsByCategory['accesorio'] || []);

    // Limitar el número de combinaciones para evitar explosión combinatoria
    const maxItemsPerCategory = 3;
    const limitedSuperior = superiorItems.slice(0, maxItemsPerCategory);
    const limitedInferior = inferiorItems.slice(0, maxItemsPerCategory);
    const limitedCalzado = calzadoItems.slice(0, maxItemsPerCategory);

    // Generar combinaciones básicas (superior + inferior + calzado)
    for (const superior of limitedSuperior) {
      for (const inferior of limitedInferior) {
        for (const calzado of limitedCalzado) {
          const baseOutfit = [superior, inferior, calzado];

          // Agregar abrigo si es necesario y está disponible
          if (includeCoat && abrigoItems.length > 0) {
            // Seleccionar un abrigo aleatorio
            const randomAbrigo = abrigoItems[Math.floor(Math.random() * abrigoItems.length)];
            const outfitWithCoat = [...baseOutfit, randomAbrigo];

            // Opcionalmente agregar accesorio (50% de probabilidad)
            if (accesorioItems.length > 0 && Math.random() > 0.5) {
              const randomAccesorio = accesorioItems[Math.floor(Math.random() * accesorioItems.length)];
              combinations.push([...outfitWithCoat, randomAccesorio]);
            }
            combinations.push(outfitWithCoat);
          } else {
            // Opcionalmente agregar accesorio sin abrigo (30% de probabilidad)
            if (accesorioItems.length > 0 && Math.random() > 0.7) {
              const randomAccesorio = accesorioItems[Math.floor(Math.random() * accesorioItems.length)];
              combinations.push([...baseOutfit, randomAccesorio]);
            }
            combinations.push(baseOutfit);
          }
        }
      }
    }

    // Mezclar las combinaciones para mayor variabilidad
    return this.shuffleArray(combinations);
  }

  /**
   * Evalúa un outfit completo
   */
  private static evaluateOutfit(items: ClothingItem[], climate: ClimateType, colorWeight: number = 0.5): GeneratedOutfit {
    // Evaluar compatibilidad climática
    const climateScore = this.evaluateClimateCompatibility(items, climate);

    // Evaluar compatibilidad de colores
    const colorEvaluation = ColorHarmonyService.evaluateOutfitCompatibility(
      items.map(item => ({ colors: item.colores }))
    );

    // Calcular pesos dinámicos
    const climateWeight = 1 - colorWeight;

    // Calcular score general con pesos personalizados
    const overallScore = (climateScore * climateWeight) + (colorEvaluation.overallScore * colorWeight);

    console.log(`⚖️ Pesos: Clima ${(climateWeight * 100).toFixed(0)}% | Color ${(colorWeight * 100).toFixed(0)}% | Scores: C=${climateScore.toFixed(2)} Co=${colorEvaluation.overallScore.toFixed(2)} → ${overallScore.toFixed(2)}`);

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
