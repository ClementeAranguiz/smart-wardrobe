import { useState, useEffect, useCallback } from 'react';

interface UseImageLoaderReturn {
  isLoading: boolean;
  hasError: boolean;
  loadImage: (src: string) => Promise<void>;
  reset: () => void;
}

export const useImageLoader = (src?: string): UseImageLoaderReturn => {
  const [isLoading, setIsLoading] = useState(!!src);
  const [hasError, setHasError] = useState(false);

  const loadImage = useCallback((imageSrc: string): Promise<void> => {
    return new Promise((resolve, reject) => {
      setIsLoading(true);
      setHasError(false);

      const img = new Image();
      
      img.onload = () => {
        setIsLoading(false);
        setHasError(false);
        resolve();
      };
      
      img.onerror = () => {
        setIsLoading(false);
        setHasError(true);
        reject(new Error('Failed to load image'));
      };
      
      img.src = imageSrc;
    });
  }, []);

  const reset = useCallback(() => {
    setIsLoading(false);
    setHasError(false);
  }, []);

  useEffect(() => {
    if (src) {
      loadImage(src).catch(() => {
        // Error ya manejado en loadImage
      });
    }
  }, [src, loadImage]);

  return {
    isLoading,
    hasError,
    loadImage,
    reset
  };
};

// Hook para precargar múltiples imágenes
export const useImagePreloader = () => {
  const [loadingImages, setLoadingImages] = useState<Set<string>>(new Set());
  const [loadedImages, setLoadedImages] = useState<Set<string>>(new Set());
  const [errorImages, setErrorImages] = useState<Set<string>>(new Set());

  const preloadImage = useCallback((src: string): Promise<void> => {
    return new Promise((resolve, reject) => {
      // Si ya está cargada, resolver inmediatamente
      if (loadedImages.has(src)) {
        resolve();
        return;
      }

      // Si ya está en error, rechazar inmediatamente
      if (errorImages.has(src)) {
        reject(new Error('Image previously failed to load'));
        return;
      }

      // Si ya se está cargando, esperar
      if (loadingImages.has(src)) {
        // Crear un listener temporal para cuando termine de cargar
        const checkLoaded = () => {
          if (loadedImages.has(src)) {
            resolve();
          } else if (errorImages.has(src)) {
            reject(new Error('Image failed to load'));
          } else {
            setTimeout(checkLoaded, 100);
          }
        };
        checkLoaded();
        return;
      }

      setLoadingImages(prev => new Set(prev).add(src));

      const img = new Image();
      
      img.onload = () => {
        setLoadingImages(prev => {
          const newSet = new Set(prev);
          newSet.delete(src);
          return newSet;
        });
        setLoadedImages(prev => new Set(prev).add(src));
        resolve();
      };
      
      img.onerror = () => {
        setLoadingImages(prev => {
          const newSet = new Set(prev);
          newSet.delete(src);
          return newSet;
        });
        setErrorImages(prev => new Set(prev).add(src));
        reject(new Error('Failed to load image'));
      };
      
      img.src = src;
    });
  }, [loadedImages, errorImages, loadingImages]);

  const preloadImages = useCallback((sources: string[]): Promise<void[]> => {
    return Promise.allSettled(sources.map(preloadImage)) as Promise<void[]>;
  }, [preloadImage]);

  const isImageLoading = useCallback((src: string): boolean => {
    return loadingImages.has(src);
  }, [loadingImages]);

  const isImageLoaded = useCallback((src: string): boolean => {
    return loadedImages.has(src);
  }, [loadedImages]);

  const hasImageError = useCallback((src: string): boolean => {
    return errorImages.has(src);
  }, [errorImages]);

  return {
    preloadImage,
    preloadImages,
    isImageLoading,
    isImageLoaded,
    hasImageError,
    loadingCount: loadingImages.size,
    loadedCount: loadedImages.size,
    errorCount: errorImages.size
  };
};
