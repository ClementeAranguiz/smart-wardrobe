import React, { createContext, useContext, ReactNode } from 'react';
import { useToast, Toast } from '@/components/ui/toast';

interface ToastContextType {
  toast: (toast: Omit<Toast, 'id'>) => void;
  success: (title: string, description?: string) => void;
  error: (title: string, description?: string) => void;
  warning: (title: string, description?: string) => void;
  info: (title: string, description?: string) => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

interface ToastProviderProps {
  children: ReactNode;
}

export const ToastProvider: React.FC<ToastProviderProps> = ({ children }) => {
  const { toast } = useToast();

  const success = (title: string, description?: string) => {
    toast({ type: 'success', title, description });
  };

  const error = (title: string, description?: string) => {
    toast({ type: 'error', title, description });
  };

  const warning = (title: string, description?: string) => {
    toast({ type: 'warning', title, description });
  };

  const info = (title: string, description?: string) => {
    toast({ type: 'info', title, description });
  };

  const value: ToastContextType = {
    toast,
    success,
    error,
    warning,
    info,
  };

  return (
    <ToastContext.Provider value={value}>
      {children}
    </ToastContext.Provider>
  );
};

export const useToastContext = (): ToastContextType => {
  const context = useContext(ToastContext);
  if (context === undefined) {
    throw new Error('useToastContext must be used within a ToastProvider');
  }
  return context;
};
