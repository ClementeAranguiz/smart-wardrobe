import { Detecciones, deteccionesSimuladas } from "@/types/detections";

/**
 * Servicio para detectar prendas en imágenes usando IA
 * Por ahora simula la detección, pero está preparado para integrar un modelo real
 */
export class ModelService {
  private static instance: ModelService;
  
  static getInstance(): ModelService {
    if (!ModelService.instance) {
      ModelService.instance = new ModelService();
    }
    return ModelService.instance;
  }

  /**
   * Detecta prendas en una imagen
   * @param file - Archivo de imagen a analizar
   * @returns Promise con las detecciones encontradas
   */
  async detectImage(file: File): Promise<Detecciones> {
    // Validar que sea una imagen
    if (!file.type.startsWith('image/')) {
      throw new Error('El archivo debe ser una imagen');
    }

    try {
      // Llamar a la API real de Python
      return await this.processWithRealModel(file);
    } catch (error) {
      console.error('Error al procesar con modelo real:', error);
      // Fallback a simulación si la API no está disponible
      console.log('Usando simulación como fallback...');
      await this.simulateProcessingTime();
      return this.simulateDetection(file);
    }
  }

  /**
   * Simula el tiempo de procesamiento del modelo
   */
  private async simulateProcessingTime(): Promise<void> {
    const delay = Math.random() * 2000 + 1000; // 1-3 segundos
    return new Promise(resolve => setTimeout(resolve, delay));
  }

  /**
   * Simula la detección de prendas
   * En una implementación real, aquí se procesaría la imagen
   */
  private simulateDetection(file: File): Detecciones {
    // Seleccionar aleatoriamente 1-3 prendas detectadas
    const items = Object.keys(deteccionesSimuladas);
    const numDetections = Math.floor(Math.random() * 3) + 1;
    const selectedItems = this.getRandomItems(items, numDetections);
    
    const result: Detecciones = {};
    selectedItems.forEach(item => {
      result[item] = { ...deteccionesSimuladas[item] };
    });

    return result;
  }

  /**
   * Obtiene elementos aleatorios de un array
   */
  private getRandomItems<T>(array: T[], count: number): T[] {
    const shuffled = [...array].sort(() => 0.5 - Math.random());
    return shuffled.slice(0, count);
  }

  /**
   * Prepara el servicio para usar un modelo real
   * Esta función se puede usar cuando se integre un modelo real
   */
  async initializeRealModel(): Promise<void> {
    // Aquí se inicializaría el modelo real
    // Por ejemplo: cargar pesos, configurar endpoints, etc.
    console.log('Modelo real no implementado aún');
  }

  /**
   * Procesa imagen con modelo real
   */
  private async processWithRealModel(file: File): Promise<Detecciones> {
    const formData = new FormData();
    formData.append('file', file);

    const response = await fetch('http://127.0.0.1:8000/predict', {
      method: 'POST',
      body: formData,
    });

    if (!response.ok) {
      throw new Error(`Error de API: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();

    // Mapear respuesta de la API a nuestro formato
    return this.mapApiResponseToDetections(data);
  }

  /**
   * Mapea la respuesta de la API al formato de Detecciones
   */
  private mapApiResponseToDetections(apiResponse: any): Detecciones {
    const detections: Detecciones = {};

    // Solo usar la mejor predicción (la de mayor confianza)
    let bestPrediction = null;

    if (apiResponse.mejor_prediccion) {
      bestPrediction = apiResponse.mejor_prediccion;
    } else if (apiResponse.predicciones && Array.isArray(apiResponse.predicciones) && apiResponse.predicciones.length > 0) {
      // Si no hay mejor_prediccion, tomar la primera (que debería ser la de mayor confianza)
      bestPrediction = apiResponse.predicciones[0];
    }

    if (bestPrediction) {
      detections['detection_0'] = {
        nombre: bestPrediction.nombre || bestPrediction.clase || 'Prenda desconocida',
        categoria: this.mapCategoria(bestPrediction.categoria || 'desconocido'),
        climas: this.mapClimas(bestPrediction.climas || []),
        confianza: Math.round((bestPrediction.confianza || 0) * 100),
        colores: bestPrediction.colores || apiResponse.colores || [],
        // Agregar datos adicionales para las alternativas
        _apiResponse: apiResponse
      };
    }

    return detections;
  }

  /**
   * Mapea categorías de la API a nuestro formato
   */
  private mapCategoria(categoria: string): 'superior' | 'inferior' | 'calzado' | 'accesorio' {
    const categoriaLower = categoria.toLowerCase();

    if (categoriaLower.includes('superior') || categoriaLower.includes('camisa') ||
        categoriaLower.includes('blusa') || categoriaLower.includes('camiseta')) {
      return 'superior';
    }

    if (categoriaLower.includes('inferior') || categoriaLower.includes('pantalon') ||
        categoriaLower.includes('falda') || categoriaLower.includes('short')) {
      return 'inferior';
    }

    if (categoriaLower.includes('calzado') || categoriaLower.includes('zapato') ||
        categoriaLower.includes('bota') || categoriaLower.includes('sandalia')) {
      return 'calzado';
    }

    return 'accesorio';
  }

  /**
   * Mapea climas de la API a nuestro formato
   */
  private mapClimas(climas: string[]): ('calor' | 'frio' | 'lluvia' | 'viento' | 'nieve' | 'entretiempo')[] {
    const climasValidos: ('calor' | 'frio' | 'lluvia' | 'viento' | 'nieve' | 'entretiempo')[] = [];

    climas.forEach(clima => {
      const climaLower = clima.toLowerCase().trim();

      // Mapeo directo para climas normalizados de la API
      if (climaLower === 'calor' || climaLower.includes('soleado') || climaLower.includes('verano')) {
        climasValidos.push('calor');
      } else if (climaLower === 'frio' || climaLower.includes('frío') || climaLower.includes('frã­o') || climaLower.includes('invierno')) {
        climasValidos.push('frio');
      } else if (climaLower === 'lluvia' || climaLower.includes('lluvioso')) {
        climasValidos.push('lluvia');
      } else if (climaLower === 'viento' || climaLower.includes('ventoso')) {
        climasValidos.push('viento');
      } else if (climaLower === 'nieve' || climaLower.includes('nevado')) {
        climasValidos.push('nieve');
      } else if (climaLower === 'entretiempo' || climaLower.includes('interior') || climaLower.includes('medio')) {
        climasValidos.push('entretiempo');
      } else {
        // Si no reconocemos el clima, usar entretiempo como default
        climasValidos.push('entretiempo');
      }
    });

    // Eliminar duplicados
    return [...new Set(climasValidos)];
  }
}

// Export singleton instance
export const modelService = ModelService.getInstance();

// Export function for easier usage
export const detectImage = (file: File): Promise<Detecciones> => {
  return modelService.detectImage(file);
};
