import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Filter, Search, Grid, List, RefreshCw } from 'lucide-react';
import { ClothingCard } from '@/components/cards/ClothingCard';
import { ClothingCardSkeleton } from '@/components/cards/ClothingCardSkeleton';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useWardrobeContext } from '@/contexts/WardrobeContext';
import { useAuthContext } from '@/contexts/AuthContext';
import { ClothingCategory, ClimateType } from '@/types/detections';
import { cn } from '@/lib/utils';

const categories: { value: ClothingCategory | 'all'; label: string }[] = [
  { value: 'all', label: 'Todas' },
  { value: 'superior', label: 'Superior' },
  { value: 'inferior', label: 'Inferior' },
  { value: 'calzado', label: 'Calzado' },
  { value: 'abrigo', label: 'Abrigo' },
  { value: 'accesorio', label: 'Accesorio' }
];

const climates: { value: ClimateType | 'all'; label: string }[] = [
  { value: 'all', label: 'Todos' },
  { value: 'calor', label: 'Calor' },
  { value: 'frio', label: 'Frío' },
  { value: 'lluvia', label: 'Lluvia' },
  { value: 'entretiempo', label: 'Entretiempo' },
  { value: 'nieve', label: 'Nieve' }
];

export const HomeScreen: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<ClothingCategory | 'all'>('all');
  const [selectedClimate, setSelectedClimate] = useState<ClimateType | 'all'>('all');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [showFilters, setShowFilters] = useState(false);

  const { user } = useAuthContext();
  const { 
    items, 
    loading, 
    error, 
    removeItem, 
    refreshItems, 
    getFilteredItems 
  } = useWardrobeContext();

  useEffect(() => {
    if (user && items.length === 0) {
      refreshItems();
    }
  }, [user]);

  const filteredItems = getFilteredItems(
    selectedCategory === 'all' ? undefined : selectedCategory,
    selectedClimate === 'all' ? undefined : selectedClimate
  ).filter(item => 
    item.nombre.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleDeleteItem = async (itemId: string) => {
    try {
      await removeItem(itemId);
    } catch (error) {
      console.error('Error al eliminar prenda:', error);
    }
  };

  const handleRefresh = () => {
    refreshItems();
  };

  return (
    <div className="flex flex-col h-full bg-background">
      {/* Header */}
      <div className="sticky top-0 z-10 bg-background/95 backdrop-blur-sm border-b">
        <div className="p-4 space-y-4">
          {/* Title and actions */}
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold">Mi Armario</h1>
              <p className="text-sm text-muted-foreground">
                {filteredItems.length} {filteredItems.length === 1 ? 'prenda' : 'prendas'}
              </p>
            </div>

            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="icon"
                onClick={handleRefresh}
                disabled={loading}
              >
                <RefreshCw className={cn("w-4 h-4", loading && "animate-spin")} />
              </Button>

              <Button
                variant="outline"
                size="icon"
                onClick={() => setViewMode(viewMode === 'grid' ? 'list' : 'grid')}
              >
                {viewMode === 'grid' ? (
                  <List className="w-4 h-4" />
                ) : (
                  <Grid className="w-4 h-4" />
                )}
              </Button>

              <Button
                variant="outline"
                size="icon"
                onClick={() => setShowFilters(!showFilters)}
              >
                <Filter className="w-4 h-4" />
              </Button>
            </div>
          </div>

          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Buscar prendas..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>

          {/* Filters */}
          <AnimatePresence>
            {showFilters && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.2 }}
                className="overflow-hidden space-y-3"
              >
                {/* Category filter */}
                <div>
                  <label className="text-sm font-medium mb-2 block">Categoría</label>
                  <div className="flex gap-2 overflow-x-auto pb-2">
                    {categories.map((category) => (
                      <Button
                        key={category.value}
                        variant={selectedCategory === category.value ? "default" : "outline"}
                        size="sm"
                        onClick={() => setSelectedCategory(category.value)}
                        className="whitespace-nowrap"
                      >
                        {category.label}
                      </Button>
                    ))}
                  </div>
                </div>

                {/* Climate filter */}
                <div>
                  <label className="text-sm font-medium mb-2 block">Clima</label>
                  <div className="flex gap-2 overflow-x-auto pb-2">
                    {climates.map((climate) => (
                      <Button
                        key={climate.value}
                        variant={selectedClimate === climate.value ? "default" : "outline"}
                        size="sm"
                        onClick={() => setSelectedClimate(climate.value)}
                        className="whitespace-nowrap"
                      >
                        {climate.label}
                      </Button>
                    ))}
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-auto content-with-bottom-nav">
        {error && (
          <div className="p-4">
            <div className="p-4 text-sm text-destructive bg-destructive/10 border border-destructive/20 rounded-md">
              {error}
            </div>
          </div>
        )}

        {loading && items.length === 0 ? (
          <div className="p-4">
            <motion.div
              layout
              className={cn(
                "gap-4",
                viewMode === 'grid'
                  ? "grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4"
                  : "flex flex-col"
              )}
            >
              {/* Mostrar 6 skeletons mientras carga */}
              {Array.from({ length: 6 }).map((_, index) => (
                <ClothingCardSkeleton
                  key={index}
                  className={viewMode === 'list' ? 'flex-row' : ''}
                />
              ))}
            </motion.div>
          </div>
        ) : filteredItems.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-64 text-center p-4">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-4"
            >
              <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mx-auto">
                <Grid className="w-8 h-8 text-muted-foreground" />
              </div>
              <div>
                <h3 className="text-lg font-semibold">No hay prendas</h3>
                <p className="text-muted-foreground">
                  {searchTerm || selectedCategory !== 'all' || selectedClimate !== 'all'
                    ? 'No se encontraron prendas con los filtros aplicados'
                    : 'Agrega tu primera prenda usando el botón +'
                  }
                </p>
              </div>
            </motion.div>
          </div>
        ) : (
          <div className="p-4">
            <motion.div
              layout
              className={cn(
                "gap-4",
                viewMode === 'grid'
                  ? "grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4"
                  : "flex flex-col"
              )}
            >
              <AnimatePresence>
                {filteredItems.map((item) => (
                  <ClothingCard
                    key={item.id}
                    item={item}
                    onDelete={handleDeleteItem}
                    className={viewMode === 'list' ? 'flex-row' : ''}
                  />
                ))}
              </AnimatePresence>
            </motion.div>
          </div>
        )}
      </div>
    </div>
  );
};
