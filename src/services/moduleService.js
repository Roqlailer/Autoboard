import {
    addDoc,
    collection,
    deleteDoc,
    doc,
    onSnapshot,
    orderBy,
    query,
    serverTimestamp,
} from 'firebase/firestore';
import { db } from './firebaseConfig';

const MODULES_COLLECTION = 'modules';

// ════════════════════════════════════════════════════════════
//  SUBSCRIBE MODULES — Realtime Listener untuk Daftar Modul
// ════════════════════════════════════════════════════════════
export const subscribeModules = (onUpdate, onError) => {
  console.log('[Firestore ▶] Subscribe Modules');

  // Mengurutkan modul berdasarkan waktu pembuatan agar tidak acak-acakan
  const modulesQuery = query(
    collection(db, MODULES_COLLECTION),
    orderBy('createdAt', 'asc')
  );

  const unsubscribe = onSnapshot(
    modulesQuery,
    (snapshot) => {
      const modules = snapshot.docs.map((docSnap) => ({
        id: docSnap.id,       // ID Unik dari Firebase untuk parameter modulId
        ...docSnap.data(),    // Berisi title, subtitle, dll
      }));
      console.log(`[Firestore ◀] Realtime Modules — ${modules.length} modul ditemukan`);
      onUpdate(modules);
    },
    (error) => {
      console.error('[Firestore ◀] Error Modules:', error.code, error.message);
      onError?.(error);
    }
  );

  return unsubscribe;
};

// ════════════════════════════════════════════════════════════
//  CREATE — Tambah Modul Baru
// ════════════════════════════════════════════════════════════
export const addModule = (moduleData) => {
  console.log('[Firestore ▶] addDoc Module:', moduleData.title);
  return addDoc(collection(db, MODULES_COLLECTION), {
    title: moduleData.title,
    kanbanTitle: moduleData.title, // Cadangan agar klop dengan kodingan KanbanScreen
    subtitle: moduleData.subtitle || 'Monitoring Progres Praktikum',
    createdAt: serverTimestamp(),  // Diisi otomatis oleh server
  });
};

// ════════════════════════════════════════════════════════════
//  DELETE — Hapus Modul Permanen
// ════════════════════════════════════════════════════════════
export const deleteModule = (moduleId) => {
  console.log(`[Firestore ▶] deleteDoc Module: ${moduleId}`);
  const moduleRef = doc(db, MODULES_COLLECTION, moduleId);
  return deleteDoc(moduleRef);
};