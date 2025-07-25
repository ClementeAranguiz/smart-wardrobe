import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Shirt, Plus, ArrowLeft } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useOutfitContext } from '@/contexts/OutfitContext';
import { OutfitCard } from '@/components/outfit/OutfitCard';
import { CreateOutfitDialog } from '@/components/outfit/CreateOutfitDialog';
import { OutfitViewer } from '@/components/outfit/OutfitViewer';
import { Outfit } from '@/types/detections';

interface OutfitListScreenProps {
  onBack: () => void;
}

export const OutfitListScreen: React.FC<OutfitListScreenProps> = ({ onBack }) => {
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [viewingOutfit, setViewingOutfit] = useState<Outfit | null>(null);
  const { outfits, loading, removeOutfit } = useOutfitContext();

  const handleDeleteOutfit = async (outfitId: string) => {
    try {
      await removeOutfit(outfitId);
    } catch (error) {
      console.error('Error deleting outfit:', error);
      alert('Error al eliminar el outfit');
    }
  };

  const handleViewOutfit = (outfit: Outfit) => {
    setViewingOutfit(outfit);
  };

  const handleEditOutfit = (outfit: any) => {
    // TODO: Implementar edición del outfit
    console.log('Edit outfit:', outfit);
  };

  const handleAddUsage = (outfit: Outfit) => {
    // TODO: Implementar registro de uso
    console.log('Add usage for outfit:', outfit);
  };

  // Si estamos viendo un outfit, mostrar el visualizador
  if (viewingOutfit) {
    return (
      <OutfitViewer
        outfit={viewingOutfit}
        onBack={() => setViewingOutfit(null)}
      />
    );
  }

  return (
    <div className="flex flex-col h-full bg-background">
      {/* Header */}
      <div className="p-6 pb-4">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <div className="flex items-center gap-4 mb-4">
            <Button
              variant="ghost"
              size="icon"
              onClick={onBack}
            >
              <ArrowLeft className="w-5 h-5" />
            </Button>
            <div className="flex-1">
              <h1 className="text-2xl font-bold">Mis Outfits</h1>
              <p className="text-muted-foreground">
                Gestiona tus combinaciones de ropa
              </p>
            </div>
            <Button onClick={() => setShowCreateDialog(true)}>
              <Plus className="w-4 h-4 mr-2" />
              Crear
            </Button>
          </div>
        </motion.div>
      </div>

      {/* Content */}
      <div className="flex-1 px-6 pb-6 overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center h-full">
            <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
          </div>
        ) : outfits.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="h-full flex items-center justify-center"
          >
            <Card className="max-w-md">
              <CardContent className="text-center p-8">
                <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Shirt className="w-8 h-8 text-primary" />
                </div>
                
                <h3 className="text-lg font-semibold mb-2">
                  No tienes outfits creados
                </h3>
                
                <p className="text-muted-foreground mb-4 text-sm">
                  Crea tu primer outfit combinando las prendas de tu armario.
                </p>

                <Button onClick={() => setShowCreateDialog(true)}>
                  <Plus className="w-4 h-4 mr-2" />
                  Crear mi primer outfit
                </Button>
              </CardContent>
            </Card>
          </motion.div>
        ) : (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5 }}
            className="h-full overflow-auto"
          >
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <AnimatePresence>
                {outfits.map((outfit) => (
                  <OutfitCard
                    key={outfit.id}
                    outfit={outfit}
                    onDelete={handleDeleteOutfit}
                    onView={handleViewOutfit}
                    onEdit={handleEditOutfit}
                    onAddUsage={handleAddUsage}
                  />
                ))}
              </AnimatePresence>
            </div>
          </motion.div>
        )}
      </div>

      {/* Create Outfit Dialog - Solo este modal está permitido */}
      <CreateOutfitDialog
        isOpen={showCreateDialog}
        onClose={() => setShowCreateDialog(false)}
      />
    </div>
  );
};
