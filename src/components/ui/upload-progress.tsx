import React from 'react';
import { motion } from 'framer-motion';
import { Loader2, Upload, Image, Brain, Save, CheckCircle } from 'lucide-react';
import { Progress } from './progress';

interface UploadProgressProps {
  step: 'compressing' | 'processing' | 'uploading' | 'saving' | 'complete';
  message?: string;
  progress?: number;
}

const stepConfig = {
  compressing: {
    icon: Image,
    title: 'Comprimiendo imagen',
    defaultMessage: 'Optimizando la imagen para mejor rendimiento...',
    color: 'text-blue-500'
  },
  processing: {
    icon: Brain,
    title: 'Analizando con IA',
    defaultMessage: 'Detectando prendas en la imagen...',
    color: 'text-purple-500'
  },
  uploading: {
    icon: Upload,
    title: 'Subiendo imagen',
    defaultMessage: 'Guardando imagen en la nube...',
    color: 'text-green-500'
  },
  saving: {
    icon: Save,
    title: 'Guardando prendas',
    defaultMessage: 'Almacenando información en tu armario...',
    color: 'text-orange-500'
  },
  complete: {
    icon: CheckCircle,
    title: '¡Completado!',
    defaultMessage: 'Prendas guardadas exitosamente',
    color: 'text-green-600'
  }
};

export const UploadProgress: React.FC<UploadProgressProps> = ({
  step,
  message,
  progress
}) => {
  const config = stepConfig[step];
  const Icon = config.icon;

  return (
    <div className="space-y-6 text-center">
      <div className="flex flex-col items-center space-y-4">
        {/* Icono animado */}
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: "spring", stiffness: 200 }}
          className={`w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center ${config.color}`}
        >
          {step === 'complete' ? (
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
            >
              <Icon className="w-8 h-8" />
            </motion.div>
          ) : (
            <motion.div
              animate={{ rotate: step === 'processing' ? 360 : 0 }}
              transition={{ 
                duration: step === 'processing' ? 2 : 0, 
                repeat: step === 'processing' ? Infinity : 0, 
                ease: "linear" 
              }}
            >
              <Icon className="w-8 h-8" />
            </motion.div>
          )}
        </motion.div>

        {/* Título y mensaje */}
        <div className="space-y-2">
          <motion.h3
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-lg font-semibold"
          >
            {config.title}
          </motion.h3>
          
          <motion.p
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="text-muted-foreground text-sm"
          >
            {message || config.defaultMessage}
          </motion.p>
        </div>

        {/* Barra de progreso */}
        {progress !== undefined && (
          <motion.div
            initial={{ opacity: 0, scaleX: 0 }}
            animate={{ opacity: 1, scaleX: 1 }}
            transition={{ delay: 0.3 }}
            className="w-full max-w-xs"
          >
            <Progress value={progress} showPercentage />
          </motion.div>
        )}

        {/* Indicador de carga para pasos sin progreso específico */}
        {progress === undefined && step !== 'complete' && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
            className="flex space-x-1"
          >
            {[0, 1, 2].map((i) => (
              <motion.div
                key={i}
                className="w-2 h-2 bg-primary rounded-full"
                animate={{
                  scale: [1, 1.2, 1],
                  opacity: [0.5, 1, 0.5]
                }}
                transition={{
                  duration: 1.5,
                  repeat: Infinity,
                  delay: i * 0.2
                }}
              />
            ))}
          </motion.div>
        )}
      </div>
    </div>
  );
};
