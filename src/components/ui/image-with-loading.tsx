import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ImageOff, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Skeleton } from './skeleton';

interface ImageWithLoadingProps extends React.ImgHTMLAttributes<HTMLImageElement> {
  src: string;
  alt: string;
  fallbackIcon?: React.ComponentType<{ className?: string }>;
  aspectRatio?: 'square' | 'video' | 'auto';
  showLoadingSpinner?: boolean;
}

export const ImageWithLoading: React.FC<ImageWithLoadingProps> = ({
  src,
  alt,
  className,
  fallbackIcon: FallbackIcon = ImageOff,
  aspectRatio = 'square',
  showLoadingSpinner = true,
  ...props
}) => {
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);
  const [imageSrc, setImageSrc] = useState<string | null>(null);

  // Reset states when src changes
  React.useEffect(() => {
    setIsLoading(true);
    setHasError(false);
    setImageSrc(null);
  }, [src]);

  const handleLoad = () => {
    setIsLoading(false);
    setHasError(false);
  };

  const handleError = () => {
    setIsLoading(false);
    setHasError(true);
  };

  const aspectRatioClasses = {
    square: 'aspect-square',
    video: 'aspect-video',
    auto: ''
  };

  return (
    <div className={cn(
      'relative overflow-hidden bg-muted',
      aspectRatioClasses[aspectRatio],
      className
    )}>
      <AnimatePresence>
        {isLoading && (
          <motion.div
            initial={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="absolute inset-0 flex items-center justify-center"
          >
            {showLoadingSpinner ? (
              <div className="flex flex-col items-center gap-2">
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                >
                  <Loader2 className="w-6 h-6 text-muted-foreground" />
                </motion.div>
                <span className="text-xs text-muted-foreground">Cargando...</span>
              </div>
            ) : (
              <Skeleton className="w-full h-full" />
            )}
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {hasError && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.2 }}
            className="absolute inset-0 flex flex-col items-center justify-center bg-muted"
          >
            <FallbackIcon className="w-8 h-8 text-muted-foreground mb-2" />
            <span className="text-xs text-muted-foreground text-center px-2">
              Error al cargar imagen
            </span>
          </motion.div>
        )}
      </AnimatePresence>

      <motion.img
        src={src}
        alt={alt}
        className={cn(
          "w-full h-full object-cover transition-opacity duration-200",
          isLoading || hasError ? "opacity-0" : "opacity-100"
        )}
        onLoad={handleLoad}
        onError={handleError}
        initial={{ opacity: 0 }}
        animate={{ opacity: isLoading || hasError ? 0 : 1 }}
        transition={{ duration: 0.3 }}
        {...props}
      />
    </div>
  );
};
