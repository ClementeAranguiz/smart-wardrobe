import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { Outfit, ClothingItem } from '@/types/detections';
import { getUserOutfits, saveOutfit, updateOutfit, deleteOutfit } from '@/services/firebaseService';
import { useAuthContext } from './AuthContext';
import { useWardrobeContext } from './WardrobeContext';

interface OutfitContextType {
  outfits: Outfit[];
  loading: boolean;
  error: string | null;
  createOutfit: (nombre: string, prendas: ClothingItem[], fechasUso?: Date[]) => Promise<void>;
  updateOutfitData: (outfitId: string, updates: Partial<Outfit>) => Promise<void>;
  removeOutfit: (outfitId: string) => Promise<void>;
  refreshOutfits: () => Promise<void>;
  addUsageDate: (outfitId: string, fecha: Date) => Promise<void>;
  removeUsageDate: (outfitId: string, fecha: Date) => Promise<void>;
  getOutfitsByDate: (fecha: Date) => Outfit[];
  checkClothingItemUsage: (itemId: string) => Outfit[];
}

const OutfitContext = createContext<OutfitContextType | undefined>(undefined);

interface OutfitProviderProps {
  children: ReactNode;
}

export const OutfitProvider: React.FC<OutfitProviderProps> = ({ children }) => {
  const [outfits, setOutfits] = useState<Outfit[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const { user } = useAuthContext();
  const { items: clothingItems } = useWardrobeContext();

  // Cargar outfits cuando el usuario cambie
  useEffect(() => {
    if (user) {
      refreshOutfits();
    } else {
      setOutfits([]);
    }
  }, [user]);

  const refreshOutfits = async (): Promise<void> => {
    if (!user) return;

    try {
      setLoading(true);
      setError(null);
      const userOutfits = await getUserOutfits(user.uid);
      
      // Enriquecer los outfits con datos completos de las prendas
      const enrichedOutfits = userOutfits.map(outfit => ({
        ...outfit,
        prendas: outfit.prendas.map(prendaRef => {
          // Buscar la prenda completa en el contexto del armario
          const fullPrenda = clothingItems.find(item => item.id === prendaRef.id);
          return fullPrenda || prendaRef; // Si no se encuentra, usar la referencia
        }) as ClothingItem[]
      }));
      
      setOutfits(enrichedOutfits);
    } catch (err) {
      console.error('Error loading outfits:', err);
      setError(err instanceof Error ? err.message : 'Error al cargar los outfits');
    } finally {
      setLoading(false);
    }
  };

  const createOutfit = async (nombre: string, prendas: ClothingItem[], fechasUso: Date[] = []): Promise<void> => {
    if (!user) throw new Error('Usuario no autenticado');
    if (prendas.length === 0) throw new Error('Debe seleccionar al menos una prenda');

    try {
      setError(null);

      const outfitToSave = {
        nombre,
        prendas,
        userId: user.uid,
        fechaCreacion: new Date(),
        fechasUso
      };

      const outfitId = await saveOutfit(outfitToSave);

      const newOutfit: Outfit = {
        ...outfitToSave,
        id: outfitId
      };

      setOutfits(prev => [newOutfit, ...prev]);
      console.log('✅ Outfit created successfully:', outfitId);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al crear el outfit');
      throw err;
    }
  };

  const updateOutfitData = async (outfitId: string, updates: Partial<Outfit>): Promise<void> => {
    if (!user) throw new Error('Usuario no autenticado');

    try {
      setError(null);
      await updateOutfit(outfitId, updates);

      setOutfits(prev => prev.map(outfit => 
        outfit.id === outfitId 
          ? { ...outfit, ...updates }
          : outfit
      ));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al actualizar el outfit');
      throw err;
    }
  };

  const removeOutfit = async (outfitId: string): Promise<void> => {
    if (!user) throw new Error('Usuario no autenticado');

    try {
      setError(null);
      await deleteOutfit(outfitId);
      setOutfits(prev => prev.filter(outfit => outfit.id !== outfitId));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al eliminar el outfit');
      throw err;
    }
  };

  const addUsageDate = async (outfitId: string, fecha: Date): Promise<void> => {
    const outfit = outfits.find(o => o.id === outfitId);
    if (!outfit) throw new Error('Outfit no encontrado');

    const fechasUso = outfit.fechasUso || [];
    const nuevasFechas = [...fechasUso, fecha];

    await updateOutfitData(outfitId, { fechasUso: nuevasFechas });
  };

  const removeUsageDate = async (outfitId: string, fecha: Date): Promise<void> => {
    const outfit = outfits.find(o => o.id === outfitId);
    if (!outfit) throw new Error('Outfit no encontrado');

    const fechasUso = outfit.fechasUso || [];
    const nuevasFechas = fechasUso.filter(f => f.getTime() !== fecha.getTime());

    await updateOutfitData(outfitId, { fechasUso: nuevasFechas });
  };

  const getOutfitsByDate = (fecha: Date): Outfit[] => {
    const fechaStr = fecha.toDateString();
    return outfits.filter(outfit => 
      outfit.fechasUso?.some(fechaUso => fechaUso.toDateString() === fechaStr)
    );
  };

  const checkClothingItemUsage = (itemId: string): Outfit[] => {
    return outfits.filter(outfit => 
      outfit.prendas.some(prenda => prenda.id === itemId)
    );
  };

  const value: OutfitContextType = {
    outfits,
    loading,
    error,
    createOutfit,
    updateOutfitData,
    removeOutfit,
    refreshOutfits,
    addUsageDate,
    removeUsageDate,
    getOutfitsByDate,
    checkClothingItemUsage
  };

  return (
    <OutfitContext.Provider value={value}>
      {children}
    </OutfitContext.Provider>
  );
};

export const useOutfitContext = (): OutfitContextType => {
  const context = useContext(OutfitContext);
  if (context === undefined) {
    throw new Error('useOutfitContext must be used within an OutfitProvider');
  }
  return context;
};
