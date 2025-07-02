export interface WeatherData {
  temperature: number;
  condition: string;
  humidity: number;
  windSpeed: number;
  location: string;
  climate: string; // 'calor' | 'frio' | 'lluvia' | 'entretiempo' | 'nieve'
}

export interface Coordinates {
  latitude: number;
  longitude: number;
}

export interface GeolocationError {
  code: number;
  message: string;
}
