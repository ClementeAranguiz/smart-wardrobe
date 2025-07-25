import { initializeApp } from "firebase/app";
import {
  getAuth,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  User as FirebaseUser,
  connectAuthEmulator
} from "firebase/auth";
import {
  getFirestore,
  collection,
  addDoc,
  getDocs,
  getDoc,
  query,
  where,
  deleteDoc,
  doc,
  updateDoc,
  orderBy,
  connectFirestoreEmulator,
  enableNetwork,
  disableNetwork
} from "firebase/firestore";
import {
  getStorage,
  ref,
  uploadBytes,
  getDownloadURL,
  deleteObject,
  connectStorageEmulator
} from "firebase/storage";
import { ClothingItem, Outfit } from "@/types/detections";

const firebaseConfig = {
  apiKey: "AIzaSyAAp1I3STC2pCuoCGj_5usRyp4gMq-s1Ek",
  authDomain: "smart-wardrobe-7194f.firebaseapp.com",
  projectId: "smart-wardrobe-7194f",
  storageBucket: "smart-wardrobe-7194f.firebasestorage.app",
  messagingSenderId: "110670341095",
  appId: "1:110670341095:web:c378b50a85d6235a6a9342"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);

// Configuración adicional para desarrollo
if (import.meta.env.DEV) {
  console.log('🔥 Firebase initialized in development mode');
}

// Auth functions
export const loginUser = async (email: string, password: string): Promise<FirebaseUser> => {
  const userCredential = await signInWithEmailAndPassword(auth, email, password);
  return userCredential.user;
};

export const signupUser = async (email: string, password: string): Promise<FirebaseUser> => {
  const userCredential = await createUserWithEmailAndPassword(auth, email, password);
  return userCredential.user;
};

export const logoutUser = async (): Promise<void> => {
  await signOut(auth);
};

// Wardrobe functions
export const saveClothingItem = async (item: Omit<ClothingItem, 'id'>): Promise<string> => {
  try {
    const docRef = await addDoc(collection(db, 'wardrobe'), {
      ...item,
      fechaCreacion: new Date()
    });
    console.log('✅ Clothing item saved successfully:', docRef.id);
    return docRef.id;
  } catch (error) {
    console.error('❌ Error saving clothing item:', error);
    throw new Error('Error al guardar la prenda. Verifica tu conexión e inténtalo de nuevo.');
  }
};

export const getUserClothingItems = async (userId: string): Promise<ClothingItem[]> => {
  try {
    // Primero intentamos con la consulta optimizada (requiere índice)
    try {
      const q = query(
        collection(db, 'wardrobe'),
        where('userId', '==', userId),
        orderBy('fechaCreacion', 'desc')
      );

      const querySnapshot = await getDocs(q);
      const items = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        fechaCreacion: doc.data().fechaCreacion?.toDate() || new Date()
      } as ClothingItem));

      console.log(`✅ Retrieved ${items.length} clothing items for user ${userId} (with index)`);
      return items;
    } catch (indexError) {
      console.warn('⚠️ Index not available, using simple query:', indexError);

      // Fallback: consulta simple sin orderBy
      const q = query(
        collection(db, 'wardrobe'),
        where('userId', '==', userId)
      );

      const querySnapshot = await getDocs(q);
      const items = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        fechaCreacion: doc.data().fechaCreacion?.toDate() || new Date()
      } as ClothingItem));

      // Ordenar en el cliente
      items.sort((a, b) => b.fechaCreacion.getTime() - a.fechaCreacion.getTime());

      console.log(`✅ Retrieved ${items.length} clothing items for user ${userId} (client-side sorted)`);
      return items;
    }
  } catch (error) {
    console.error('❌ Error getting clothing items:', error);
    throw new Error('Error al cargar las prendas. Verifica tu conexión e inténtalo de nuevo.');
  }
};

export const updateClothingItem = async (itemId: string, updates: Partial<ClothingItem>): Promise<void> => {
  try {
    console.log('🔄 Starting update for item:', itemId);
    console.log('🔄 Original updates:', updates);

    // Verificar autenticación
    const currentUser = auth.currentUser;
    if (!currentUser) {
      throw new Error('Usuario no autenticado');
    }
    console.log('👤 Current user ID:', currentUser.uid);

    const itemRef = doc(db, 'wardrobe', itemId);
    console.log('📍 Document reference path:', itemRef.path);

    // Primero, vamos a leer el documento actual para verificar
    console.log('🔍 Attempting to read document...');
    const currentDoc = await getDoc(itemRef);
    console.log('✅ Document read successful');

    if (!currentDoc.exists()) {
      console.error('❌ Document does not exist in Firestore:', itemId);
      throw new Error(`La prenda ya no existe en la base de datos. Puede haber sido eliminada. Actualiza la página para sincronizar.`);
    }

    const currentData = currentDoc.data();
    console.log('📄 Current document data:', currentData);
    console.log('🔍 Document userId:', currentData?.userId);
    console.log('🔍 Current user ID:', currentUser.uid);
    console.log('🔍 UserIds match:', currentData?.userId === currentUser.uid);

    // Crear el objeto de actualización manteniendo el userId original
    const updateData: any = {
      ...updates,
      userId: currentData.userId, // Mantener el userId original
      fechaModificacion: new Date()
    };

    // Asegurar que no se modifiquen campos críticos
    delete updateData.id;
    delete updateData.fechaCreacion;

    console.log('🔄 Final update data:', updateData);
    console.log('🔄 Document reference path:', itemRef.path);

    await updateDoc(itemRef, updateData);
    console.log('✅ Clothing item updated successfully:', itemId);
  } catch (error) {
    console.error('❌ Error updating clothing item:', error);
    console.error('❌ Error details:', error);
    console.error('❌ Error code:', (error as any)?.code);
    console.error('❌ Error message:', (error as any)?.message);

    // Si el error es que el documento no existe, dar un mensaje más claro
    if ((error as any)?.message?.includes('does not exist')) {
      throw error; // Re-lanzar el error personalizado
    }

    throw new Error('Error al actualizar la prenda. Verifica tu conexión e inténtalo de nuevo.');
  }
};

export const deleteClothingItem = async (itemId: string): Promise<void> => {
  try {
    await deleteDoc(doc(db, 'wardrobe', itemId));
    console.log('✅ Clothing item deleted successfully:', itemId);
  } catch (error) {
    console.error('❌ Error deleting clothing item:', error);
    throw new Error('Error al eliminar la prenda. Verifica tu conexión e inténtalo de nuevo.');
  }
};



// Storage functions
export const uploadClothingImage = async (
  file: File,
  userId: string,
  itemId: string
): Promise<string> => {
  try {
    // Crear referencia al archivo en Storage
    const imageRef = ref(storage, `wardrobe-images/${userId}/${itemId}/original.jpg`);

    // Subir el archivo
    console.log('📤 Uploading image to Firebase Storage...');
    const snapshot = await uploadBytes(imageRef, file);

    // Obtener la URL de descarga
    const downloadURL = await getDownloadURL(snapshot.ref);

    console.log('✅ Image uploaded successfully:', downloadURL);
    return downloadURL;
  } catch (error) {
    console.error('❌ Error uploading image:', error);
    throw new Error('Error al subir la imagen. Verifica tu conexión e inténtalo de nuevo.');
  }
};

export const deleteClothingImage = async (userId: string, itemId: string): Promise<void> => {
  try {
    const imageRef = ref(storage, `wardrobe-images/${userId}/${itemId}/original.jpg`);
    await deleteObject(imageRef);
    console.log('✅ Image deleted successfully from Storage');
  } catch (error: any) {
    // Si la imagen no existe, no es un error real
    if (error?.code === 'storage/object-not-found') {
      console.log('ℹ️ Image not found in Storage (may not have been uploaded), skipping deletion');
    } else {
      console.error('❌ Error deleting image:', error);
    }
    // No lanzamos error aquí porque la prenda ya se eliminó de Firestore
  }
};

// Outfit functions
export const saveOutfit = async (outfit: Omit<Outfit, 'id'>): Promise<string> => {
  try {
    const docRef = await addDoc(collection(db, 'outfits'), {
      ...outfit,
      fechaCreacion: new Date(),
      // Convertir las prendas a referencias simples para evitar duplicación de datos
      prendas: outfit.prendas.map(prenda => ({
        id: prenda.id,
        nombre: prenda.nombre,
        categoria: prenda.categoria,
        imagen: prenda.imagen
      }))
    });
    console.log('✅ Outfit saved successfully:', docRef.id);
    return docRef.id;
  } catch (error) {
    console.error('❌ Error saving outfit:', error);
    throw new Error('Error al guardar el outfit. Verifica tu conexión e inténtalo de nuevo.');
  }
};

export const getUserOutfits = async (userId: string): Promise<Outfit[]> => {
  try {
    // Primero intentamos con la consulta optimizada (requiere índice)
    try {
      const q = query(
        collection(db, 'outfits'),
        where('userId', '==', userId),
        orderBy('fechaCreacion', 'desc')
      );

      const querySnapshot = await getDocs(q);
      const outfits = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        fechaCreacion: doc.data().fechaCreacion?.toDate() || new Date(),
        fechasUso: doc.data().fechasUso?.map((fecha: any) => fecha.toDate()) || []
      } as Outfit));

      console.log(`✅ Retrieved ${outfits.length} outfits for user ${userId} (with index)`);
      return outfits;
    } catch (indexError) {
      console.warn('⚠️ Index not available for outfits, using simple query:', indexError);

      // Fallback: consulta simple sin orderBy
      const q = query(
        collection(db, 'outfits'),
        where('userId', '==', userId)
      );

      const querySnapshot = await getDocs(q);
      const outfits = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        fechaCreacion: doc.data().fechaCreacion?.toDate() || new Date(),
        fechasUso: doc.data().fechasUso?.map((fecha: any) => fecha.toDate()) || []
      } as Outfit));

      // Ordenar en el cliente
      outfits.sort((a, b) => b.fechaCreacion.getTime() - a.fechaCreacion.getTime());

      console.log(`✅ Retrieved ${outfits.length} outfits for user ${userId} (client-side sorted)`);
      return outfits;
    }
  } catch (error) {
    console.error('❌ Error getting outfits:', error);
    throw new Error('Error al cargar los outfits. Verifica tu conexión e inténtalo de nuevo.');
  }
};

export const updateOutfit = async (outfitId: string, updates: Partial<Outfit>): Promise<void> => {
  try {
    const outfitRef = doc(db, 'outfits', outfitId);
    await updateDoc(outfitRef, {
      ...updates,
      // Si se actualizan las prendas, convertir a referencias simples
      ...(updates.prendas && {
        prendas: updates.prendas.map(prenda => ({
          id: prenda.id,
          nombre: prenda.nombre,
          categoria: prenda.categoria,
          imagen: prenda.imagen
        }))
      })
    });
    console.log('✅ Outfit updated successfully:', outfitId);
  } catch (error) {
    console.error('❌ Error updating outfit:', error);
    throw new Error('Error al actualizar el outfit. Verifica tu conexión e inténtalo de nuevo.');
  }
};

export const deleteOutfit = async (outfitId: string): Promise<void> => {
  try {
    await deleteDoc(doc(db, 'outfits', outfitId));
    console.log('✅ Outfit deleted successfully:', outfitId);
  } catch (error) {
    console.error('❌ Error deleting outfit:', error);
    throw new Error('Error al eliminar el outfit. Verifica tu conexión e inténtalo de nuevo.');
  }
};
