import { useState, useCallback } from 'react';
import { Coordinates, GeolocationError } from '@/types/weather';

interface UseGeolocationReturn {
  coordinates: Coordinates | null;
  loading: boolean;
  error: GeolocationError | null;
  getCurrentPosition: () => Promise<Coordinates>;
  clearError: () => void;
}

export const useGeolocation = (): UseGeolocationReturn => {
  const [coordinates, setCoordinates] = useState<Coordinates | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<GeolocationError | null>(null);

  const getCurrentPosition = useCallback((): Promise<Coordinates> => {
    return new Promise((resolve, reject) => {
      if (!navigator.geolocation) {
        const error: GeolocationError = {
          code: 0,
          message: 'Geolocalización no soportada por este navegador'
        };
        setError(error);
        reject(error);
        return;
      }

      setLoading(true);
      setError(null);

      const options: PositionOptions = {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 300000 // 5 minutos
      };

      navigator.geolocation.getCurrentPosition(
        (position) => {
          const coords: Coordinates = {
            latitude: position.coords.latitude,
            longitude: position.coords.longitude
          };
          
          setCoordinates(coords);
          setLoading(false);
          resolve(coords);
        },
        (err) => {
          const error: GeolocationError = {
            code: err.code,
            message: getGeolocationErrorMessage(err.code)
          };
          
          setError(error);
          setLoading(false);
          reject(error);
        },
        options
      );
    });
  }, []);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  return {
    coordinates,
    loading,
    error,
    getCurrentPosition,
    clearError
  };
};

const getGeolocationErrorMessage = (code: number): string => {
  switch (code) {
    case 1:
      return 'Permiso de ubicación denegado. Por favor, permite el acceso a tu ubicación.';
    case 2:
      return 'Ubicación no disponible. Verifica tu conexión y configuración.';
    case 3:
      return 'Tiempo de espera agotado. Inténtalo de nuevo.';
    default:
      return 'Error desconocido al obtener la ubicación.';
  }
};
