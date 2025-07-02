import React, { useState } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { BottomNavigation } from '@/components/navigation/BottomNavigation';
import { UploadScreen } from '@/screens/UploadScreen';
import { ConnectionStatus } from '@/components/ui/connection-status';
import { Toaster, useToast } from '@/components/ui/toast';
import { useWardrobeContext } from '@/contexts/WardrobeContext';

export const AppLayout: React.FC = () => {
  const [showUploadModal, setShowUploadModal] = useState(false);
  const location = useLocation();
  const { error } = useWardrobeContext();
  const { toasts, removeToast } = useToast();

  // Interceptar navegación al upload para mostrar modal
  React.useEffect(() => {
    if (location.pathname === '/upload') {
      setShowUploadModal(true);
      // Solo cambiar la URL si no viene con un archivo en el state
      if (!location.state?.file) {
        setTimeout(() => {
          window.history.replaceState(null, '', '/home');
        }, 100);
      }
    }
  }, [location.pathname, location.state]);

  const pageVariants = {
    initial: { opacity: 0, y: 20 },
    in: { opacity: 1, y: 0 },
    out: { opacity: 0, y: -20 }
  };

  const pageTransition = {
    type: "tween",
    ease: "anticipate",
    duration: 0.3
  };

  return (
    <div className="flex flex-col h-screen bg-background">
      {/* Connection Status */}
      <ConnectionStatus
        isConnected={!error}
        hasError={!!error}
        errorMessage={error || undefined}
      />

      {/* Main content area */}
      <div className="flex-1 overflow-hidden">
        <AnimatePresence mode="wait">
          <motion.div
            key={location.pathname}
            initial="initial"
            animate="in"
            exit="out"
            variants={pageVariants}
            transition={pageTransition}
            className="h-full"
          >
            <Outlet />
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Bottom Navigation */}
      <BottomNavigation />

      {/* Upload Modal */}
      <UploadScreen
        isOpen={showUploadModal}
        onClose={() => setShowUploadModal(false)}
      />

      {/* Toast Notifications */}
      <Toaster toasts={toasts} onClose={removeToast} />
    </div>
  );
};
