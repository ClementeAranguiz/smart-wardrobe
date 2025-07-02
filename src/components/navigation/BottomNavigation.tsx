import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Home, Plus, Sun, User, Calendar } from 'lucide-react';
import { cn } from '@/lib/utils';

interface NavItem {
  id: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  path: string;
}

const navItems: NavItem[] = [
  {
    id: 'home',
    label: 'Armario',
    icon: Home,
    path: '/home'
  },
  {
    id: 'suggestions',
    label: 'Sugerencias',
    icon: Sun,
    path: '/suggestions'
  },
  {
    id: 'calendar',
    label: 'Calendario',
    icon: Calendar,
    path: '/calendar'
  },
  {
    id: 'profile',
    label: 'Perfil',
    icon: User,
    path: '/profile'
  }
];



export const BottomNavigation: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const handleNavigation = (path: string) => {
    navigate(path);
  };

  const handleUploadClick = () => {
    // Crear input de cámara dinámicamente y activarlo
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/*';
    input.capture = 'environment';
    input.style.display = 'none';

    input.onchange = (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (file) {
        // Navegar al upload con el archivo
        navigate('/upload', { state: { file, source: 'camera' } });
      }
      document.body.removeChild(input);
    };

    document.body.appendChild(input);
    input.click();
  };

  return (
    <>
      <nav className="bottom-nav safe-area-bottom">
        <div className="flex items-center justify-center px-4 py-2 relative w-full">
          {/* Contenedor principal con distribución equitativa */}
          <div className="nav-container">

            {/* Elementos de navegación izquierda */}
            {navItems.slice(0, 2).map((item) => {
              const isActive = location.pathname === item.path;
              const Icon = item.icon;

              return (
                <motion.button
                  key={item.id}
                  onClick={() => handleNavigation(item.path)}
                  className={cn(
                    "nav-button",
                    isActive
                      ? "text-primary bg-primary/10"
                      : "text-muted-foreground hover:text-foreground hover:bg-accent"
                  )}
                  whileTap={{ scale: 0.9 }}
                  whileHover={{ scale: 1.1 }}
                >
                  <motion.div
                    animate={{
                      scale: isActive ? 1.15 : 1,
                      y: isActive ? -1 : 0
                    }}
                    transition={{
                      type: "spring",
                      stiffness: 500,
                      damping: 30
                    }}
                  >
                    <Icon className="nav-icon" />
                  </motion.div>
                </motion.button>
              );
            })}

            {/* Botón central de subir */}
            <motion.button
              onClick={handleUploadClick}
              className="relative flex-shrink-0"
              whileTap={{ scale: 0.95 }}
              whileHover={{ scale: 1.05 }}
            >
              {/* Círculo exterior */}
              <div className="upload-button bg-primary rounded-full flex items-center justify-center shadow-lg border-2 border-background">
                {/* Círculo interior */}
                <div className="upload-button-inner bg-white rounded-full flex items-center justify-center">
                  <Plus className="upload-icon text-primary" />
                </div>
              </div>

              {/* Efecto de pulso */}
              <motion.div
                className="absolute inset-0 bg-primary rounded-full opacity-30"
                animate={{
                  scale: [1, 1.3, 1],
                  opacity: [0.3, 0, 0.3]
                }}
                transition={{
                  duration: 2.5,
                  repeat: Infinity,
                  ease: "easeInOut"
                }}
              />
            </motion.button>

            {/* Elementos de navegación derecha */}
            {navItems.slice(2, 4).map((item) => {
              const isActive = location.pathname === item.path;
              const Icon = item.icon;

              return (
                <motion.button
                  key={item.id}
                  onClick={() => handleNavigation(item.path)}
                  className={cn(
                    "nav-button",
                    isActive
                      ? "text-primary bg-primary/10"
                      : "text-muted-foreground hover:text-foreground hover:bg-accent"
                  )}
                  whileTap={{ scale: 0.9 }}
                  whileHover={{ scale: 1.1 }}
                >
                  <motion.div
                    animate={{
                      scale: isActive ? 1.15 : 1,
                      y: isActive ? -1 : 0
                    }}
                    transition={{
                      type: "spring",
                      stiffness: 500,
                      damping: 30
                    }}
                  >
                    <Icon className="nav-icon" />
                  </motion.div>
                </motion.button>
              );
            })}
          </div>
        </div>
      </nav>
    </>
  );
};
