import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MapPin, RefreshCw, Sun, Cloud, CloudRain, Snowflake, Thermometer } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ClothingCard } from '@/components/cards/ClothingCard';
import { WeatherStatus } from '@/components/ui/weather-status';
import { useGeolocation } from '@/hooks/useGeolocation';
import { useWardrobeContext } from '@/contexts/WardrobeContext';
import { getTodayForecast } from '@/services/weatherService';
import { WeatherData } from '@/types/weather';
import { ClothingItem, ClimateType } from '@/types/detections';
import { cn } from '@/lib/utils';

const weatherIcons: Record<string, React.ComponentType<{ className?: string }>> = {
  'Despejado': Sun,
  'Soleado': Sun,
  'Nublado': Cloud,
  'Lluvioso': CloudRain,
  'Llovizna': CloudRain,
  'Tormenta': CloudRain,
  'Nevando': Snowflake,
  'Nieve': Snowflake,
  'Frío': Snowflake,
  'Neblina': Cloud,
  'Niebla': Cloud,
  'Bruma': Cloud
};

export const SuggestionsScreen: React.FC = () => {
  const [weather, setWeather] = useState<WeatherData | null>(null);
  const [suggestions, setSuggestions] = useState<ClothingItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isRealWeather, setIsRealWeather] = useState(false);

  const { getCurrentPosition, loading: geoLoading, error: geoError } = useGeolocation();
  const { items, getItemsByClimate } = useWardrobeContext();

  const fetchWeatherAndSuggestions = async () => {
    try {
      setLoading(true);
      setError(null);

      // Obtener ubicación
      const coordinates = await getCurrentPosition();

      // Obtener clima y detectar si es real o simulado
      const weatherData = await getTodayForecast(coordinates.latitude, coordinates.longitude);
      setWeather(weatherData);

      // Detectar si los datos son reales (basado en si hay API key)
      const hasApiKey = import.meta.env.VITE_OPENWEATHER_API_KEY;
      setIsRealWeather(!!hasApiKey);

      // Generar sugerencias basadas en el clima
      const climateItems = getItemsByClimate(weatherData.climate as ClimateType);

      // Seleccionar hasta 6 prendas recomendadas
      const recommended = selectRecommendedOutfit(climateItems);
      setSuggestions(recommended);

    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error al obtener sugerencias';
      setError(errorMessage);
      setIsRealWeather(false);

      // Log específico para errores de API
      if (errorMessage.includes('API Key')) {
        console.error('🔑 Problema con API Key de OpenWeatherMap. Usando datos simulados.');
      }
    } finally {
      setLoading(false);
    }
  };

  const selectRecommendedOutfit = (items: ClothingItem[]): ClothingItem[] => {
    // Agrupar por categoría
    const itemsByCategory = items.reduce((acc, item) => {
      if (!acc[item.categoria]) {
        acc[item.categoria] = [];
      }
      acc[item.categoria].push(item);
      return acc;
    }, {} as Record<string, ClothingItem[]>);

    const recommended: ClothingItem[] = [];

    // Seleccionar una prenda de cada categoría (máximo 6)
    const categories = ['superior', 'inferior', 'calzado', 'abrigo', 'accesorio'];
    
    categories.forEach(category => {
      const categoryItems = itemsByCategory[category];
      if (categoryItems && categoryItems.length > 0) {
        // Seleccionar aleatoriamente una prenda de la categoría
        const randomItem = categoryItems[Math.floor(Math.random() * categoryItems.length)];
        recommended.push(randomItem);
      }
    });

    return recommended.slice(0, 6); // Máximo 6 sugerencias
  };

  useEffect(() => {
    if (items.length > 0) {
      fetchWeatherAndSuggestions();
    }
  }, [items]);

  const WeatherIcon = weather ? weatherIcons[weather.condition] || Thermometer : Thermometer;

  return (
    <div className="flex flex-col h-full bg-background">
      {/* Header */}
      <div className="sticky top-0 z-10 bg-background/95 backdrop-blur-sm border-b">
        <div className="p-4">
          <div className="flex items-center justify-between mb-4">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <h1 className="text-2xl font-bold">Sugerencias del Día</h1>
                <WeatherStatus
                  isReal={isRealWeather}
                  isLoading={loading || geoLoading}
                  hasError={!!error || !!geoError}
                />
              </div>
              <p className="text-sm text-muted-foreground">
                Outfit recomendado según el clima
              </p>
            </div>

            <Button
              variant="outline"
              size="icon"
              onClick={fetchWeatherAndSuggestions}
              disabled={loading || geoLoading}
            >
              <RefreshCw className={cn("w-4 h-4", (loading || geoLoading) && "animate-spin")} />
            </Button>
          </div>

          {/* Weather Card */}
          {weather && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
            >
              <Card className="bg-gradient-to-r from-primary/10 to-secondary/10 border-primary/20">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <motion.div
                        className="w-12 h-12 bg-primary/20 rounded-full flex items-center justify-center"
                        whileHover={{ scale: 1.1 }}
                        transition={{ type: "spring", stiffness: 300 }}
                      >
                        <WeatherIcon className="w-6 h-6 text-primary" />
                      </motion.div>
                      <div>
                        <h3 className="font-semibold text-lg">{weather.condition}</h3>
                        <div className="flex items-center text-sm text-muted-foreground">
                          <MapPin className="w-3 h-3 mr-1" />
                          {weather.location}
                        </div>
                        <div className="text-xs text-muted-foreground mt-1 capitalize">
                          Clima: {weather.climate}
                        </div>
                      </div>
                    </div>

                    <div className="text-right">
                      <motion.div
                        className="text-3xl font-bold text-primary"
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        transition={{ delay: 0.3, type: "spring", stiffness: 200 }}
                      >
                        {weather.temperature}°C
                      </motion.div>
                      <div className="text-sm text-muted-foreground">
                        💧 {weather.humidity}%
                      </div>
                      <div className="text-sm text-muted-foreground">
                        💨 {weather.windSpeed} km/h
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          )}
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-auto">
        {error && (
          <div className="p-4">
            <div className="p-4 text-sm text-destructive bg-destructive/10 border border-destructive/20 rounded-md">
              {error}
            </div>
          </div>
        )}

        {geoError && (
          <div className="p-4">
            <div className="p-4 text-sm text-destructive bg-destructive/10 border border-destructive/20 rounded-md">
              {geoError.message}
              <Button
                variant="outline"
                size="sm"
                onClick={fetchWeatherAndSuggestions}
                className="mt-2 w-full"
              >
                Intentar de nuevo
              </Button>
            </div>
          </div>
        )}

        {loading || geoLoading ? (
          <div className="p-4">
            <div className="mb-4">
              <div className="h-6 bg-muted rounded w-1/3 mb-2 animate-pulse"></div>
              <div className="h-4 bg-muted rounded w-1/2 animate-pulse"></div>
            </div>

            {/* Skeleton para sugerencias */}
            <div className="overflow-x-auto pb-4">
              <div className="flex gap-4 w-max">
                {Array.from({ length: 3 }).map((_, index) => (
                  <div key={index} className="w-48 flex-shrink-0">
                    <div className="clothing-card">
                      <div className="rounded-lg border bg-card text-card-foreground shadow-sm overflow-hidden">
                        <div className="aspect-square bg-muted animate-pulse"></div>
                        <div className="p-4">
                          <div className="h-4 bg-muted rounded w-3/4 mb-2 animate-pulse"></div>
                          <div className="flex gap-1 mb-2">
                            <div className="h-6 w-16 bg-muted rounded-full animate-pulse"></div>
                            <div className="h-6 w-12 bg-muted rounded-full animate-pulse"></div>
                          </div>
                          <div className="h-3 bg-muted rounded w-1/3 animate-pulse"></div>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        ) : suggestions.length === 0 && !error && !geoError ? (
          <div className="flex flex-col items-center justify-center h-64 text-center p-4">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-4"
            >
              <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mx-auto">
                <Sun className="w-8 h-8 text-muted-foreground" />
              </div>
              <div>
                <h3 className="text-lg font-semibold">No hay sugerencias</h3>
                <p className="text-muted-foreground">
                  Agrega más prendas a tu armario para obtener sugerencias personalizadas
                </p>
              </div>
              <Button onClick={fetchWeatherAndSuggestions} variant="outline">
                <MapPin className="w-4 h-4 mr-2" />
                Obtener Sugerencias
              </Button>
            </motion.div>
          </div>
        ) : (
          <div className="p-4">
            <div className="mb-4">
              <h2 className="text-lg font-semibold mb-2">Outfit Recomendado</h2>
              <p className="text-sm text-muted-foreground">
                {suggestions.length} {suggestions.length === 1 ? 'prenda recomendada' : 'prendas recomendadas'} para el clima actual
              </p>
            </div>

            {/* Horizontal scroll for suggestions */}
            <div className="overflow-x-auto pb-4">
              <motion.div 
                className="flex gap-4 w-max"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.5, staggerChildren: 0.1 }}
              >
                <AnimatePresence>
                  {suggestions.map((item, index) => (
                    <motion.div
                      key={item.id}
                      initial={{ opacity: 0, x: 50 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.1 }}
                      className="w-48 flex-shrink-0"
                    >
                      <ClothingCard
                        item={item}
                        showDeleteButton={false}
                      />
                    </motion.div>
                  ))}
                </AnimatePresence>
              </motion.div>
            </div>

            {/* Additional weather info */}
            {weather && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="mt-6"
              >
                <Card>
                  <CardHeader>
                    <CardTitle className="text-base">Detalles del Clima</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Temperatura:</span>
                      <span>{weather.temperature}°C</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Humedad:</span>
                      <span>{weather.humidity}%</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Viento:</span>
                      <span>{weather.windSpeed} km/h</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Condición:</span>
                      <span className="capitalize">{weather.climate}</span>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
