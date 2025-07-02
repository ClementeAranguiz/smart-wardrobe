import React from 'react';
import { motion } from 'framer-motion';
import { Cloud, Wifi, WifiOff, AlertTriangle } from 'lucide-react';
import { cn } from '@/lib/utils';

interface WeatherStatusProps {
  isReal: boolean;
  isLoading: boolean;
  hasError: boolean;
  className?: string;
}

export const WeatherStatus: React.FC<WeatherStatusProps> = ({
  isReal,
  isLoading,
  hasError,
  className
}) => {
  if (isLoading) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        className={cn(
          "inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs",
          "bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300",
          className
        )}
      >
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
        >
          <Cloud className="w-3 h-3" />
        </motion.div>
        <span>Obteniendo clima...</span>
      </motion.div>
    );
  }

  if (hasError) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        className={cn(
          "inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs",
          "bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300",
          className
        )}
      >
        <AlertTriangle className="w-3 h-3" />
        <span>Error en clima</span>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      className={cn(
        "inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs",
        isReal 
          ? "bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300"
          : "bg-yellow-100 text-yellow-700 dark:bg-yellow-900 dark:text-yellow-300",
        className
      )}
    >
      {isReal ? (
        <Wifi className="w-3 h-3" />
      ) : (
        <WifiOff className="w-3 h-3" />
      )}
      <span>{isReal ? 'Clima real' : 'Clima simulado'}</span>
    </motion.div>
  );
};
