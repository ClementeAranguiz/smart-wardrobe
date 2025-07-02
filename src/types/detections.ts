export interface ColorInfo {
  nombre: string;
  rgb: [number, number, number];
  hex: string;
  frecuencia: number;
}

export interface Deteccion {
  nombre: string;
  climas: string[];
  categoria: string;
  imagen?: string;
  id?: string;
  fechaCreacion?: Date;
  confianza?: number;
  colores?: ColorInfo[];
  _apiResponse?: any; // Para almacenar la respuesta completa de la API
}

export type Detecciones = Record<string, Deteccion>;

export interface ClothingItem {
  id: string;
  nombre: string;
  categoria: string;
  climas: string[];
  imagen: string;
  fechaCreacion: Date;
  userId: string;
  colores?: ColorInfo[];
}

export type ClothingCategory = 'superior' | 'inferior' | 'calzado' | 'accesorio' | 'abrigo';
export type ClimateType = 'calor' | 'frio' | 'lluvia' | 'entretiempo' | 'nieve' | 'viento';

// Datos simulados para el modelo
export const deteccionesSimuladas: Detecciones = {
  anorak: { 
    nombre: "anorak", 
    climas: ["frio", "lluvia"], 
    categoria: "abrigo" 
  },
  blazer: { 
    nombre: "blazer", 
    climas: ["entretiempo"], 
    categoria: "superior" 
  },
  jeans: { 
    nombre: "jeans", 
    climas: ["entretiempo", "frio"], 
    categoria: "inferior" 
  },
  camiseta: { 
    nombre: "camiseta", 
    climas: ["calor", "entretiempo"], 
    categoria: "superior" 
  },
  sudadera: { 
    nombre: "sudadera", 
    climas: ["frio", "entretiempo"], 
    categoria: "superior" 
  },
  pantalon_corto: { 
    nombre: "pantalón corto", 
    climas: ["calor"], 
    categoria: "inferior" 
  },
  botas: { 
    nombre: "botas", 
    climas: ["frio", "lluvia"], 
    categoria: "calzado" 
  },
  zapatillas: { 
    nombre: "zapatillas", 
    climas: ["calor", "entretiempo"], 
    categoria: "calzado" 
  },
  abrigo: { 
    nombre: "abrigo", 
    climas: ["frio", "nieve"], 
    categoria: "abrigo" 
  },
  vestido: { 
    nombre: "vestido", 
    climas: ["calor", "entretiempo"], 
    categoria: "superior" 
  }
};
