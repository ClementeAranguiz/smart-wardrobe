import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Wifi, WifiOff, AlertCircle, CheckCircle } from 'lucide-react';
import { cn } from '@/lib/utils';

interface ConnectionStatusProps {
  isConnected: boolean;
  hasError: boolean;
  errorMessage?: string;
  className?: string;
}

export const ConnectionStatus: React.FC<ConnectionStatusProps> = ({
  isConnected,
  hasError,
  errorMessage,
  className
}) => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    if (hasError || !isConnected) {
      setIsVisible(true);
      // Auto-hide after 5 seconds if connected and no error
      const timer = setTimeout(() => {
        if (isConnected && !hasError) {
          setIsVisible(false);
        }
      }, 5000);
      return () => clearTimeout(timer);
    } else {
      // Show success briefly then hide
      setIsVisible(true);
      const timer = setTimeout(() => setIsVisible(false), 3000);
      return () => clearTimeout(timer);
    }
  }, [isConnected, hasError]);

  const getStatusConfig = () => {
    if (hasError) {
      return {
        icon: AlertCircle,
        color: 'text-destructive',
        bgColor: 'bg-destructive/10',
        borderColor: 'border-destructive/20',
        message: errorMessage || 'Error de conexión'
      };
    }
    
    if (!isConnected) {
      return {
        icon: WifiOff,
        color: 'text-orange-500',
        bgColor: 'bg-orange-500/10',
        borderColor: 'border-orange-500/20',
        message: 'Sin conexión a Firebase'
      };
    }
    
    return {
      icon: CheckCircle,
      color: 'text-green-500',
      bgColor: 'bg-green-500/10',
      borderColor: 'border-green-500/20',
      message: 'Conectado a Firebase'
    };
  };

  const config = getStatusConfig();
  const Icon = config.icon;

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 0, y: -50, scale: 0.9 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -50, scale: 0.9 }}
          transition={{
            type: "spring",
            stiffness: 300,
            damping: 30
          }}
          className={cn(
            "fixed top-4 left-1/2 transform -translate-x-1/2 z-50",
            "px-4 py-2 rounded-lg border shadow-lg backdrop-blur-sm",
            "flex items-center gap-2 text-sm font-medium",
            config.bgColor,
            config.borderColor,
            config.color,
            className
          )}
        >
          <Icon className="w-4 h-4" />
          <span>{config.message}</span>
          
          {/* Pulse animation for loading states */}
          {!isConnected && !hasError && (
            <motion.div
              animate={{ scale: [1, 1.2, 1] }}
              transition={{ duration: 1.5, repeat: Infinity }}
              className="w-2 h-2 bg-current rounded-full opacity-60"
            />
          )}
        </motion.div>
      )}
    </AnimatePresence>
  );
};
