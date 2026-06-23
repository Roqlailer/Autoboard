// ============================================================
//  AutoBoard — Task Service (Cloud Firestore)
//  Collection: tasks
//  Struktur dokumen:
//    {
//      title:      string,
//      status:     'todo' | 'wiring' | 'testing' | 'selesai',
//      deadline:   string,
//      modulId:    string,    // relasi ke modul praktikum
//      createdAt: Timestamp  // diisi otomatis oleh server
//    }
// ============================================================

import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  onSnapshot,
  query,
  serverTimestamp,
  updateDoc,
  where,
} from 'firebase/firestore';
import { db } from './firebaseConfig'; // 🌟 Pastikan lokasi folder/file-nya benar

const TASKS_COLLECTION = 'tasks';

// ════════════════════════════════════════════════════════════
//  SUBSCRIBE TASKS — Realtime Listener
// ════════════════════════════════════════════════════════════
export const subscribeTasks = (modulId, onUpdate, onError) => {
  console.log(`[Firestore ▶] Subscribe — modulId: ${modulId}`);

  const tasksQuery = query(
    collection(db, TASKS_COLLECTION),
    where('modulId', '==', modulId)
  );

  const unsubscribe = onSnapshot(
    tasksQuery,
    (snapshot) => {
      const tasks = snapshot.docs.map((docSnap) => ({
        id: docSnap.id,       // ID dokumen untuk update/delete
        ...docSnap.data(),    // field: title, status, deadline, dll
      }));
      console.log(`[Firestore ◀] Realtime update — ${tasks.length} task`);
      onUpdate(tasks);
    },
    (error) => {
      console.error('[Firestore ◀] Error:', error.code, error.message);
      onError?.(error);
    }
  );

  return unsubscribe;
};

// ════════════════════════════════════════════════════════════
//  CREATE — Tambah task baru
// ════════════════════════════════════════════════════════════
export const addTask = (taskData) => {
  console.log('[Firestore ▶] addDoc:', taskData.title);
  return addDoc(collection(db, TASKS_COLLECTION), {
    ...taskData,
    createdAt: serverTimestamp(),   // waktu diisi oleh server Firestore
  });
};

// ════════════════════════════════════════════════════════════
//  UPDATE — Pindahkan task ke status/kolom lain
// ════════════════════════════════════════════════════════════
export const updateTaskStatus = (taskId, newStatus) => {
  console.log(`[Firestore ▶] updateDoc: ${taskId} → ${newStatus}`);
  const taskRef = doc(db, TASKS_COLLECTION, taskId);
  return updateDoc(taskRef, { status: newStatus });
};

// ════════════════════════════════════════════════════════════
//  DELETE — Hapus task permanen
// ════════════════════════════════════════════════════════════
export const deleteTask = (taskId) => {
  console.log(`[Firestore ▶] deleteDoc: ${taskId}`);
  const taskRef = doc(db, TASKS_COLLECTION, taskId);
  return deleteDoc(taskRef);
};