import React from 'react';
import { motion } from 'framer-motion';
import { LogOut, User, Settings, Shirt, BarChart3, Moon, Sun, Monitor } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useAuthContext } from '@/contexts/AuthContext';
import { useWardrobeContext } from '@/contexts/WardrobeContext';
import { useTheme } from '@/hooks/useTheme';
import { cn } from '@/lib/utils';

export const ProfileScreen: React.FC = () => {
  const { user, logout } = useAuthContext();
  const { items } = useWardrobeContext();
  const { theme, setTheme, resolvedTheme } = useTheme();

  const handleLogout = async () => {
    try {
      await logout();
    } catch (error) {
      console.error('Error al cerrar sesión:', error);
    }
  };

  const themeOptions = [
    { value: 'light', label: 'Claro', icon: Sun },
    { value: 'dark', label: 'Oscuro', icon: Moon },
    { value: 'system', label: 'Sistema', icon: Monitor }
  ] as const;

  // Estadísticas del armario
  const stats = {
    totalItems: items.length,
    categories: [...new Set(items.map(item => item.categoria))].length,
    recentItems: items.filter(item => {
      const daysDiff = (Date.now() - new Date(item.fechaCreacion).getTime()) / (1000 * 60 * 60 * 24);
      return daysDiff <= 7;
    }).length
  };

  return (
    <div className="flex flex-col h-full bg-background">
      {/* Header */}
      <div className="sticky top-0 z-10 bg-background/95 backdrop-blur-sm border-b">
        <div className="p-4">
          <h1 className="text-2xl font-bold">Perfil</h1>
          <p className="text-sm text-muted-foreground">
            Gestiona tu cuenta y configuración
          </p>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-auto p-4 space-y-6">
        {/* User Info */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center space-x-4">
                <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center">
                  <User className="w-8 h-8 text-primary" />
                </div>
                <div className="flex-1">
                  <h3 className="text-lg font-semibold">
                    {user?.displayName || 'Usuario'}
                  </h3>
                  <p className="text-muted-foreground">{user?.email}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Stats */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
        >
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BarChart3 className="w-5 h-5" />
                Estadísticas del Armario
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-3 gap-4">
                <div className="text-center">
                  <div className="text-2xl font-bold text-primary">{stats.totalItems}</div>
                  <div className="text-sm text-muted-foreground">Prendas</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-primary">{stats.categories}</div>
                  <div className="text-sm text-muted-foreground">Categorías</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-primary">{stats.recentItems}</div>
                  <div className="text-sm text-muted-foreground">Esta semana</div>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Theme Settings */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Settings className="w-5 h-5" />
                Configuración
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="text-sm font-medium mb-3 block">Tema de la aplicación</label>
                <div className="grid grid-cols-3 gap-2">
                  {themeOptions.map((option) => {
                    const Icon = option.icon;
                    const isSelected = theme === option.value;
                    
                    return (
                      <Button
                        key={option.value}
                        variant={isSelected ? "default" : "outline"}
                        size="sm"
                        onClick={() => setTheme(option.value)}
                        className={cn(
                          "flex flex-col items-center gap-2 h-auto py-3",
                          isSelected && "ring-2 ring-primary ring-offset-2"
                        )}
                      >
                        <Icon className="w-4 h-4" />
                        <span className="text-xs">{option.label}</span>
                      </Button>
                    );
                  })}
                </div>
                <p className="text-xs text-muted-foreground mt-2">
                  Tema actual: {resolvedTheme === 'dark' ? 'Oscuro' : 'Claro'}
                </p>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* App Info */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
        >
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shirt className="w-5 h-5" />
                Acerca de Smart Wardrobe
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="text-sm text-muted-foreground">
                <p>Versión 1.0.0</p>
                <p className="mt-2">
                  Smart Wardrobe te ayuda a organizar tu armario de manera inteligente 
                  usando IA para detectar prendas y sugerir outfits según el clima.
                </p>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Logout */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.4 }}
          className="pb-20" // Extra padding for bottom navigation
        >
          <Button
            variant="destructive"
            onClick={handleLogout}
            className="w-full"
          >
            <LogOut className="w-4 h-4 mr-2" />
            Cerrar Sesión
          </Button>
        </motion.div>
      </div>
    </div>
  );
};
