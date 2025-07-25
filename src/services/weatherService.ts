import { WeatherData, Coordinates } from "@/types/weather";

// Configuración de la API
const OPENWEATHER_API_KEY = import.meta.env.VITE_OPENWEATHER_API_KEY;
const OPENWEATHER_BASE_URL = 'https://api.openweathermap.org/data/2.5';
const OPENWEATHER_GEO_URL = 'https://api.openweathermap.org/geo/1.0';

interface OpenWeatherResponse {
  main: {
    temp: number;
    humidity: number;
    feels_like: number;
  };
  weather: Array<{
    main: string;
    description: string;
    icon: string;
  }>;
  wind: {
    speed: number;
  };
  name: string;
  sys: {
    country: string;
  };
}

interface WeatherCache {
  data: WeatherData;
  timestamp: number;
  coordinates: Coordinates;
}

/**
 * Servicio para obtener información meteorológica real
 * Usa OpenWeatherMap API con fallback a datos simulados
 */
export class WeatherService {
  private static instance: WeatherService;
  private cache: Map<string, WeatherCache> = new Map();
  private readonly CACHE_DURATION = 10 * 60 * 1000; // 10 minutos
  private readonly LOCATION_THRESHOLD = 0.01; // ~1km de diferencia

  static getInstance(): WeatherService {
    if (!WeatherService.instance) {
      WeatherService.instance = new WeatherService();
    }
    return WeatherService.instance;
  }

  /**
   * Obtiene el pronóstico del tiempo para hoy
   * @param latitude - Latitud de la ubicación
   * @param longitude - Longitud de la ubicación
   * @returns Promise con los datos meteorológicos
   */
  async getTodayForecast(latitude: number, longitude: number): Promise<WeatherData> {
    try {
      // Verificar caché primero
      const cachedData = this.getCachedWeather(latitude, longitude);
      if (cachedData) {
        console.log('🌤️ Using cached weather data');
        return cachedData;
      }

      // Intentar obtener datos reales
      if (OPENWEATHER_API_KEY) {
        console.log('🌍 Fetching real weather data from OpenWeatherMap');
        const realData = await this.fetchRealWeatherData(latitude, longitude);
        this.cacheWeatherData(latitude, longitude, realData);
        return realData;
      } else {
        console.warn('⚠️ No API key found, using simulated weather data');
        return this.simulateWeatherData(latitude, longitude);
      }
    } catch (error) {
      console.error('❌ Error fetching weather data:', error);
      console.log('🔄 Falling back to simulated data');
      return this.simulateWeatherData(latitude, longitude);
    }
  }

  /**
   * Obtiene datos reales del clima desde OpenWeatherMap
   */
  private async fetchRealWeatherData(latitude: number, longitude: number): Promise<WeatherData> {
    const url = `${OPENWEATHER_BASE_URL}/weather?lat=${latitude}&lon=${longitude}&appid=${OPENWEATHER_API_KEY}&units=metric&lang=es`;

    console.log('🌐 Calling OpenWeatherMap API:', url.replace(OPENWEATHER_API_KEY!, '[API_KEY]'));

    const response = await fetch(url);

    if (!response.ok) {
      if (response.status === 401) {
        console.error('🔑 API Key error: Invalid or not activated. Check https://openweathermap.org/api');
        throw new Error(`API Key inválida o no activada. Verifica en OpenWeatherMap que esté activa.`);
      }
      throw new Error(`Weather API error: ${response.status} ${response.statusText}`);
    }

    const data: OpenWeatherResponse = await response.json();
    console.log('✅ Weather data received:', data.name, data.main.temp + '°C');

    return this.mapOpenWeatherToWeatherData(data);
  }

  /**
   * Mapea la respuesta de OpenWeatherMap a nuestro formato
   */
  private mapOpenWeatherToWeatherData(data: OpenWeatherResponse): WeatherData {
    const temperature = Math.round(data.main.temp);
    const condition = this.translateWeatherCondition(data.weather[0].main, data.weather[0].description);
    const climate = this.getClimateFromWeather(data.weather[0].main, temperature);

    return {
      temperature,
      condition,
      humidity: data.main.humidity,
      windSpeed: Math.round(data.wind.speed * 3.6), // Convertir m/s a km/h
      location: `${data.name}, ${data.sys.country}`,
      climate
    };
  }

  /**
   * Traduce las condiciones del clima de OpenWeatherMap
   */
  private translateWeatherCondition(main: string, description: string): string {
    const translations: Record<string, string> = {
      'Clear': 'Despejado',
      'Clouds': 'Nublado',
      'Rain': 'Lluvioso',
      'Drizzle': 'Llovizna',
      'Thunderstorm': 'Tormenta',
      'Snow': 'Nevando',
      'Mist': 'Neblina',
      'Fog': 'Niebla',
      'Haze': 'Bruma'
    };

    return translations[main] || description || 'Desconocido';
  }

  /**
   * Determina el tipo de clima basado en condiciones meteorológicas
   */
  private getClimateFromWeather(weatherMain: string, temperature: number): string {
    // Primero verificar condiciones especiales
    if (weatherMain === 'Snow') return 'nieve';
    if (weatherMain === 'Rain' || weatherMain === 'Drizzle' || weatherMain === 'Thunderstorm') return 'lluvia';

    // Luego basarse en temperatura
    if (temperature < 5) return 'nieve';
    if (temperature < 15) return 'frio';
    if (temperature < 25) return 'entretiempo';
    return 'calor';
  }

  /**
   * Simula datos meteorológicos basados en la ubicación
   */
  private simulateWeatherData(latitude: number, longitude: number): WeatherData {
    // Generar datos aleatorios pero realistas
    const conditions = [
      { condition: 'Soleado', climate: 'calor', tempRange: [20, 35] },
      { condition: 'Nublado', climate: 'entretiempo', tempRange: [15, 25] },
      { condition: 'Lluvioso', climate: 'lluvia', tempRange: [10, 20] },
      { condition: 'Frío', climate: 'frio', tempRange: [0, 15] },
      { condition: 'Nevando', climate: 'nieve', tempRange: [-5, 5] }
    ];

    const randomCondition = conditions[Math.floor(Math.random() * conditions.length)];
    const temperature = Math.floor(
      Math.random() * (randomCondition.tempRange[1] - randomCondition.tempRange[0]) + 
      randomCondition.tempRange[0]
    );

    return {
      temperature,
      condition: randomCondition.condition,
      humidity: Math.floor(Math.random() * 40) + 30, // 30-70%
      windSpeed: Math.floor(Math.random() * 20) + 5, // 5-25 km/h
      location: this.getLocationName(latitude, longitude),
      climate: randomCondition.climate
    };
  }

  /**
   * Obtiene un nombre de ubicación simulado basado en coordenadas
   */
  private getLocationName(latitude: number, longitude: number): string {
    // Simulación simple de nombres de ciudades
    const cities = [
      'Madrid', 'Barcelona', 'Valencia', 'Sevilla', 'Bilbao',
      'Málaga', 'Zaragoza', 'Murcia', 'Palma', 'Las Palmas'
    ];
    
    // Usar las coordenadas para seleccionar una ciudad de forma "determinista"
    const index = Math.floor(Math.abs(latitude + longitude) * 10) % cities.length;
    return cities[index];
  }

  /**
   * Verifica si hay datos en caché válidos para la ubicación
   */
  private getCachedWeather(latitude: number, longitude: number): WeatherData | null {
    const cacheKey = this.getCacheKey(latitude, longitude);
    const cached = this.cache.get(cacheKey);

    if (!cached) return null;

    // Verificar si el caché ha expirado
    const now = Date.now();
    if (now - cached.timestamp > this.CACHE_DURATION) {
      this.cache.delete(cacheKey);
      return null;
    }

    // Verificar si la ubicación es suficientemente cercana
    const distance = this.calculateDistance(
      latitude, longitude,
      cached.coordinates.latitude, cached.coordinates.longitude
    );

    if (distance > this.LOCATION_THRESHOLD) {
      return null;
    }

    return cached.data;
  }

  /**
   * Guarda datos del clima en caché
   */
  private cacheWeatherData(latitude: number, longitude: number, data: WeatherData): void {
    const cacheKey = this.getCacheKey(latitude, longitude);
    this.cache.set(cacheKey, {
      data,
      timestamp: Date.now(),
      coordinates: { latitude, longitude }
    });
  }

  /**
   * Genera una clave de caché basada en coordenadas redondeadas
   */
  private getCacheKey(latitude: number, longitude: number): string {
    const roundedLat = Math.round(latitude * 100) / 100;
    const roundedLon = Math.round(longitude * 100) / 100;
    return `${roundedLat},${roundedLon}`;
  }

  /**
   * Calcula la distancia entre dos puntos geográficos
   */
  private calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
    const R = 6371; // Radio de la Tierra en km
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
              Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
              Math.sin(dLon/2) * Math.sin(dLon/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    return R * c;
  }

  /**
   * Mapea temperatura a tipo de clima (método público para compatibilidad)
   */
  getClimateFromTemperature(temperature: number): string {
    if (temperature < 5) return 'nieve';
    if (temperature < 15) return 'frio';
    if (temperature < 25) return 'entretiempo';
    return 'calor';
  }

  /**
   * Limpia el caché de datos meteorológicos
   */
  clearCache(): void {
    this.cache.clear();
    console.log('🗑️ Weather cache cleared');
  }

  /**
   * Busca ubicaciones por nombre usando la API de geocoding
   */
  async searchLocations(query: string): Promise<LocationSearchResult[]> {
    if (!query.trim()) return [];

    try {
      if (OPENWEATHER_API_KEY) {
        const url = `${OPENWEATHER_GEO_URL}/direct?q=${encodeURIComponent(query)}&limit=5&appid=${OPENWEATHER_API_KEY}`;
        const response = await fetch(url);

        if (!response.ok) {
          throw new Error(`Geocoding API error: ${response.status}`);
        }

        const data: GeocodingResponse[] = await response.json();
        return data.map(item => ({
          name: item.name,
          country: item.country,
          state: item.state,
          latitude: item.lat,
          longitude: item.lon,
          displayName: `${item.name}${item.state ? `, ${item.state}` : ''}, ${item.country}`
        }));
      } else {
        // Fallback a ubicaciones simuladas
        return this.simulateLocationSearch(query);
      }
    } catch (error) {
      console.error('Error searching locations:', error);
      return this.simulateLocationSearch(query);
    }
  }

  /**
   * Simula búsqueda de ubicaciones cuando no hay API key
   */
  private simulateLocationSearch(query: string): LocationSearchResult[] {
    const cities = [
      { name: 'Madrid', country: 'ES', state: undefined, lat: 40.4168, lon: -3.7038 },
      { name: 'Barcelona', country: 'ES', state: undefined, lat: 41.3851, lon: 2.1734 },
      { name: 'Valencia', country: 'ES', state: undefined, lat: 39.4699, lon: -0.3763 },
      { name: 'Sevilla', country: 'ES', state: undefined, lat: 37.3891, lon: -5.9845 },
      { name: 'Bilbao', country: 'ES', state: undefined, lat: 43.2627, lon: -2.9253 },
      { name: 'London', country: 'GB', state: undefined, lat: 51.5074, lon: -0.1278 },
      { name: 'Paris', country: 'FR', state: undefined, lat: 48.8566, lon: 2.3522 },
      { name: 'New York', country: 'US', state: 'NY', lat: 40.7128, lon: -74.0060 },
      { name: 'Tokyo', country: 'JP', state: undefined, lat: 35.6762, lon: 139.6503 },
      { name: 'Mexico City', country: 'MX', state: undefined, lat: 19.4326, lon: -99.1332 }
    ];

    const filtered = cities.filter(city =>
      city.name.toLowerCase().includes(query.toLowerCase())
    );

    return filtered.map(city => ({
      name: city.name,
      country: city.country,
      state: city.state,
      latitude: city.lat,
      longitude: city.lon,
      displayName: `${city.name}${city.state ? `, ${city.state}` : ''}, ${city.country}`
    }));
  }

  /**
   * Obtiene pronóstico para fechas futuras (hasta 5 días)
   */
  async getForecast(latitude: number, longitude: number, days: number = 5): Promise<ForecastData[]> {
    try {
      if (OPENWEATHER_API_KEY) {
        const url = `${OPENWEATHER_BASE_URL}/forecast?lat=${latitude}&lon=${longitude}&appid=${OPENWEATHER_API_KEY}&units=metric&lang=es`;
        const response = await fetch(url);

        if (!response.ok) {
          throw new Error(`Forecast API error: ${response.status}`);
        }

        const data: OpenWeatherForecastResponse = await response.json();
        return this.mapForecastData(data, days);
      } else {
        return this.simulateForecastData(latitude, longitude, days);
      }
    } catch (error) {
      console.error('Error fetching forecast:', error);
      return this.simulateForecastData(latitude, longitude, days);
    }
  }

  /**
   * Mapea datos de pronóstico de OpenWeather
   */
  private mapForecastData(data: OpenWeatherForecastResponse, days: number): ForecastData[] {
    const dailyForecasts: ForecastData[] = [];
    const processedDates = new Set<string>();

    for (const item of data.list) {
      const date = new Date(item.dt * 1000);
      const dateKey = date.toDateString();

      if (processedDates.has(dateKey) || dailyForecasts.length >= days) {
        continue;
      }

      processedDates.add(dateKey);
      const temperature = Math.round(item.main.temp);
      const condition = this.translateWeatherCondition(item.weather[0].main, item.weather[0].description);
      const climate = this.getClimateFromWeather(item.weather[0].main, temperature);

      dailyForecasts.push({
        date,
        temperature,
        condition,
        humidity: item.main.humidity,
        windSpeed: Math.round(item.wind.speed * 3.6),
        location: data.city.name,
        climate
      });
    }

    return dailyForecasts;
  }

  /**
   * Simula datos de pronóstico
   */
  private simulateForecastData(latitude: number, longitude: number, days: number): ForecastData[] {
    const forecasts: ForecastData[] = [];
    const today = new Date();

    for (let i = 0; i < days; i++) {
      const date = new Date(today);
      date.setDate(today.getDate() + i);

      const baseTemp = this.getSeasonalTemperature(date, latitude);
      const variation = (Math.random() - 0.5) * 10; // ±5°C variation
      const temperature = Math.round(baseTemp + variation);

      const conditions = this.getSeasonalConditions(date, latitude);
      const randomCondition = conditions[Math.floor(Math.random() * conditions.length)];

      forecasts.push({
        date,
        temperature,
        condition: randomCondition.condition,
        humidity: Math.floor(Math.random() * 40) + 30,
        windSpeed: Math.floor(Math.random() * 20) + 5,
        location: this.getLocationName(latitude, longitude),
        climate: randomCondition.climate
      });
    }

    return forecasts;
  }

  /**
   * Prepara el servicio para usar una API real
   * Esta función se puede usar cuando se integre una API real
   */
  async initializeRealAPI(apiKey: string): Promise<void> {
    // Aquí se inicializaría la API real
    // Por ejemplo: validar API key, configurar endpoints, etc.
    console.log('API real no configurada aún');
  }


}

// Export singleton instance
export const weatherService = WeatherService.getInstance();

// Export functions for easier usage
export const getTodayForecast = (latitude: number, longitude: number): Promise<WeatherData> => {
  return weatherService.getTodayForecast(latitude, longitude);
};

export const searchLocations = (query: string) => {
  return weatherService.searchLocations(query);
};

export const getForecast = (latitude: number, longitude: number, days: number = 5) => {
  return weatherService.getForecast(latitude, longitude, days);
};
