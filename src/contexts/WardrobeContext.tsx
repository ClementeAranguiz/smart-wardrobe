import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { ClothingItem, ClothingCategory, ClimateType } from '@/types/detections';
import { getUserClothingItems, saveClothingItem, updateClothingItem, deleteClothingItem, deleteClothingImage } from '@/services/firebaseService';
import { useAuthContext } from './AuthContext';

interface WardrobeContextType {
  items: ClothingItem[];
  loading: boolean;
  error: string | null;
  addItem: (item: Omit<ClothingItem, 'id' | 'userId' | 'fechaCreacion'>) => Promise<void>;
  updateItem: (itemId: string, updates: Partial<ClothingItem>) => Promise<void>;
  removeItem: (itemId: string) => Promise<void>;
  refreshItems: () => Promise<void>;
  syncWithFirestore: () => Promise<void>;
  getItemsByCategory: (category: ClothingCategory) => ClothingItem[];
  getItemsByClimate: (climate: ClimateType) => ClothingItem[];
  getFilteredItems: (category?: ClothingCategory, climate?: ClimateType) => ClothingItem[];
}

const WardrobeContext = createContext<WardrobeContextType | undefined>(undefined);

interface WardrobeProviderProps {
  children: ReactNode;
}

export const WardrobeProvider: React.FC<WardrobeProviderProps> = ({ children }) => {
  const [items, setItems] = useState<ClothingItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { user } = useAuthContext();

  // Cargar items cuando el usuario cambie
  useEffect(() => {
    if (user) {
      refreshItems();
    } else {
      setItems([]);
    }
  }, [user]);

  const refreshItems = async (): Promise<void> => {
    if (!user) return;

    try {
      setLoading(true);
      setError(null);
      const userItems = await getUserClothingItems(user.uid);
      setItems(userItems);
    } catch (err) {
      console.error('Error loading wardrobe:', err);
      // Por ahora, usar datos locales si hay error de conexión
      const localItems = localStorage.getItem(`wardrobe_${user.uid}`);
      if (localItems) {
        try {
          setItems(JSON.parse(localItems));
          setError('Mostrando datos guardados localmente. Verifica tu conexión.');
        } catch {
          setError('Error al cargar el armario. Verifica tu conexión.');
        }
      } else {
        setError('Error al cargar el armario. Verifica tu conexión.');
      }
    } finally {
      setLoading(false);
    }
  };

  const syncWithFirestore = async (): Promise<void> => {
    if (!user) return;

    try {
      console.log('🔄 Sincronizando con Firestore...');

      // Limpiar localStorage primero para evitar conflictos
      localStorage.removeItem(`wardrobe_${user.uid}`);

      // Obtener datos frescos de Firestore
      const firestoreItems = await getUserClothingItems(user.uid);

      console.log('📊 Items from Firestore:', firestoreItems.map(item => ({ id: item.id, nombre: item.nombre })));
      console.log('📊 Current local items:', items.map(item => ({ id: item.id, nombre: item.nombre })));

      // Actualizar estado local
      setItems(firestoreItems);

      // Actualizar localStorage con datos limpios
      localStorage.setItem(`wardrobe_${user.uid}`, JSON.stringify(firestoreItems));

      console.log('✅ Sincronización completada');
      console.log('📊 Updated local items:', firestoreItems.map(item => ({ id: item.id, nombre: item.nombre })));

    } catch (err) {
      console.error('❌ Error en sincronización:', err);
      setError(err instanceof Error ? err.message : 'Error al sincronizar datos');
    }
  };

  const addItem = async (item: Omit<ClothingItem, 'id' | 'userId' | 'fechaCreacion'>): Promise<void> => {
    if (!user) throw new Error('Usuario no autenticado');

    try {
      setError(null);

      // Crear item SIN ID temporal - Firebase generará el ID
      const itemToSave = {
        ...item,
        userId: user.uid,
        fechaCreacion: new Date()
      };

      // Guardar DIRECTAMENTE en Firebase primero
      const firebaseId = await saveClothingItem(itemToSave);

      // Crear el item completo con el ID real de Firebase
      const newItem: ClothingItem = {
        ...itemToSave,
        id: firebaseId
      };

      // Agregar al estado local con ID real
      setItems(prev => [newItem, ...prev]);

      // Guardar en localStorage con ID real
      const updatedItems = [newItem, ...items];
      localStorage.setItem(`wardrobe_${user.uid}`, JSON.stringify(updatedItems));

      console.log('✅ Item saved with Firebase ID:', firebaseId);

    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al guardar la prenda');
      throw err;
    }
  };

  const updateItem = async (itemId: string, updates: Partial<ClothingItem>): Promise<void> => {
    if (!user) throw new Error('Usuario no autenticado');

    try {
      setError(null);

      console.log('🔄 WardrobeContext: Updating item', itemId, 'with updates:', updates);
      console.log('🔄 Current user:', user.uid);

      // Verificar si el item existe localmente
      const localItem = items.find(item => item.id === itemId);
      if (!localItem) {
        throw new Error('Item no encontrado localmente');
      }

      // Actualizar en Firebase primero
      await updateClothingItem(itemId, updates);

      // Actualizar en el estado local
      setItems(prev => prev.map(item =>
        item.id === itemId ? { ...item, ...updates } : item
      ));

      // Actualizar localStorage
      const updatedItems = items.map(item =>
        item.id === itemId ? { ...item, ...updates } : item
      );
      localStorage.setItem(`wardrobe_${user.uid}`, JSON.stringify(updatedItems));

      console.log('✅ Item updated successfully:', itemId);

    } catch (err) {
      // Si el error es que el documento no existe, remover del estado local
      if (err instanceof Error && err.message.includes('ya no existe en la base de datos')) {
        console.log('🧹 Removing non-existent item from local state:', itemId);
        setItems(prev => prev.filter(item => item.id !== itemId));

        // Actualizar localStorage
        const filteredItems = items.filter(item => item.id !== itemId);
        localStorage.setItem(`wardrobe_${user.uid}`, JSON.stringify(filteredItems));

        setError('La prenda ya no existe. Se ha removido de tu vista local.');
      } else {
        setError(err instanceof Error ? err.message : 'Error al actualizar la prenda');
      }
      throw err;
    }
  };

  const removeItem = async (itemId: string): Promise<void> => {
    if (!user) throw new Error('Usuario no autenticado');

    try {
      setError(null);

      // Encontrar el item para obtener información antes de eliminarlo
      const itemToDelete = items.find(item => item.id === itemId);

      // Eliminar de Firestore
      await deleteClothingItem(itemId);

      // Eliminar imagen de Storage si existe
      if (itemToDelete) {
        try {
          await deleteClothingImage(user.uid, itemId);
        } catch (storageError) {
          console.warn('Error deleting image from storage:', storageError);
          // No lanzamos error aquí porque la prenda ya se eliminó
        }
      }

      // Remover el item del estado local
      setItems(prev => prev.filter(item => item.id !== itemId));

    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al eliminar la prenda');
      throw err;
    }
  };

  const getItemsByCategory = (category: ClothingCategory): ClothingItem[] => {
    return items.filter(item => item.categoria === category);
  };

  const getItemsByClimate = (climate: ClimateType): ClothingItem[] => {
    return items.filter(item => item.climas.includes(climate));
  };

  const getFilteredItems = (category?: ClothingCategory, climate?: ClimateType): ClothingItem[] => {
    let filtered = items;

    if (category) {
      filtered = filtered.filter(item => item.categoria === category);
    }

    if (climate) {
      filtered = filtered.filter(item => item.climas.includes(climate));
    }

    return filtered;
  };

  const value: WardrobeContextType = {
    items,
    loading,
    error,
    addItem,
    updateItem,
    removeItem,
    refreshItems,
    syncWithFirestore,
    getItemsByCategory,
    getItemsByClimate,
    getFilteredItems
  };

  return (
    <WardrobeContext.Provider value={value}>
      {children}
    </WardrobeContext.Provider>
  );
};

export const useWardrobeContext = (): WardrobeContextType => {
  const context = useContext(WardrobeContext);
  if (context === undefined) {
    throw new Error('useWardrobeContext must be used within a WardrobeProvider');
  }
  return context;
};
