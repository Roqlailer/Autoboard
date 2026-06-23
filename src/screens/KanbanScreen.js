// ============================================================
//  KanbanScreen — Tahap 8: Firestore Realtime Integration
//  - onSnapshot()  : baca task realtime per modul        (Read)
//  - addDoc()      : tambah task baru via modal          (Create)
//  - updateDoc()   : tap task → pindah ke kolom berikutnya (Update)
//  - deleteDoc()   : tap ikon 🗑️ → konfirmasi hapus      (Delete)
// ============================================================

import { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Platform,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';

import AddTaskModal from '../components/AddTaskModal';
import HolidayChecker from '../components/HolidayChecker';
import { COLORS } from '../constants/colors';
import {
  addTask,
  deleteTask,
  subscribeTasks,
  updateTaskStatus,
} from '../services/taskService';

// ── Definisi kolom Kanban (Sesuai dengan rancangan awal) ───────────────
const KANBAN_COLUMNS = [
  { id: 'todo',   label: 'TO DO',    color: COLORS.gray, icon: '📋' },
  { id: 'wiring', label: 'WIRING',   color: '#3498db',   icon: '🔌' },
  { id: 'testing',label: 'TESTING',  color: '#9b59b6',   icon: '🔬' },
  { id: 'selesai',label: 'SELESAI',  color: '#27ae60',   icon: '✅' },
];
const STATUS_ORDER = KANBAN_COLUMNS.map((c) => c.id);

// Hitung status kolom berikutnya
const getNextStatus = (current) => {
  const idx = STATUS_ORDER.indexOf(current);
  return STATUS_ORDER[(idx + 1) % STATUS_ORDER.length];
};

// ════════════════════════════════════════════════════════════
export default function KanbanScreen({ route, navigation }) {
  // ── Data modul dari route.params ────────────────
  const modul       = route?.params?.modul;
  const modulId      = modul?.id         || 'default';
  const modulTitle   = modul?.kanbanTitle || 'Kanban Board';
  const modulSub     = modul?.subtitle    || 'Monitoring Progres Praktikum';
  const accentColor  = '#d97706'; // Disamakan dengan aksen oranye header JobSheet

  // ── State Firestore ─────────────────────────────────────
  const [tasks, setTasks]       = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError]       = useState(null);
  const [retryKey, setRetryKey]   = useState(0);

  // ── State Modal Tambah Task ─────────────────────────────
  const [showModal, setShowModal]       = useState(false);
  const [activeColumn, setActiveColumn] = useState(KANBAN_COLUMNS[0]);
  const [newTitle, setNewTitle]       = useState('');
  const [newDeadline, setNewDeadline]   = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formError, setFormError]       = useState('');

  // ════════════════════════════════════════════════════════════
  //  REALTIME LISTENER
  // ════════════════════════════════════════════════════════════
  useEffect(() => {
    setIsLoading(true);
    setError(null);

    const unsubscribe = subscribeTasks(
      modulId,
      (data) => {
        setTasks(data);
        setIsLoading(false);
      },
      (err) => {
        setError(
          err.code === 'permission-denied'
            ? '🔒 Akses ditolak. Periksa Firestore Security Rules.'
            : '📶 Gagal memuat data. Periksa koneksi internet.'
        );
        setIsLoading(false);
      }
    );

    return () => {
      console.log('[Firestore] Unsubscribe listener');
      unsubscribe();
    };
  }, [modulId, retryKey]);

  // ── Kelompokkan task ke masing-masing kolom ─────────────
  const tasksByColumn = KANBAN_COLUMNS.reduce((acc, col) => {
    acc[col.id] = tasks
      .filter((t) => t.status === col.id)
      .sort((a, b) => (a.createdAt?.seconds || 0) - (b.createdAt?.seconds || 0));
    return acc;
  }, {});

  const totalTasks = tasks.length;
  const doneTasks  = tasksByColumn.selesai?.length || 0;
  const progress   = totalTasks > 0 ? Math.round((doneTasks / totalTasks) * 100) : 0;

  // ════════════════════════════════════════════════════════════
  //  UPDATE — Tap task → pindah ke kolom selanjutnya
  // ════════════════════════════════════════════════════════════
  const handleTaskPress = async (task) => {
    try {
      await updateTaskStatus(task.id, getNextStatus(task.status));
    } catch (err) {
      Alert.alert('Gagal Update', err.message);
    }
  };

  // ── DELETE — Tap Ikon Tong Sampah → hapus ─────────────────────
  const handleDeletePress = (task) => {
    // 🌐 Jika berjalan di WEB (Browser)
    if (Platform.OS === 'web') {
      const isConfirmed = window.confirm(`Hapus Task?\n"${task.title}" akan dihapus permanen dari Firestore.`);
      if (isConfirmed) {
        deleteTask(task.id).catch((err) => window.alert('Gagal Hapus: ' + err.message));
      }
    } 
    // 📱 Jika berjalan di HP (Android/iOS)
    else {
      Alert.alert(
        'Hapus Task?',
        `"${task.title}" akan dihapus permanen dari Firestore.`,
        [
          { text: 'Batal', style: 'cancel' },
          {
            text: 'Hapus',
            style: 'destructive',
            onPress: async () => {
              try {
                await deleteTask(task.id);
              } catch (err) {
                Alert.alert('Gagal Hapus', err.message);
              }
            },
          },
        ]
      );
    }
  };

  // ── Buka modal tambah task untuk kolom tertentu ─────────
  const openAddModal = (column) => {
    setActiveColumn(column);
    setNewTitle('');
    setNewDeadline('');
    setFormError('');
    setShowModal(true);
  };

  // ════════════════════════════════════════════════════════════
  //  CREATE — Submit task baru
  // ════════════════════════════════════════════════════════════
  const handleSubmitTask = async () => {
    if (!newTitle.trim()) {
      setFormError('Judul task tidak boleh kosong');
      return;
    }
    setIsSubmitting(true);
    setFormError('');
    try {
      await addTask({
        title: newTitle.trim(),
        status: activeColumn.id,
        deadline: newDeadline.trim() || 'Belum ditentukan',
        modulId,
      });
      setShowModal(false);
    } catch (err) {
      setFormError(err.message || 'Gagal menyimpan task');
    } finally {
      setIsSubmitting(false);
    }
  };

  // ════════════════════════════════════════════════════════════
  //  RENDER
  // ════════════════════════════════════════════════════════════
  return (
    <SafeAreaView style={styles.container}>

      {/* ═══ HEADER (Fixed) ══════════════════════════════ */}
      <View style={[styles.header, { borderBottomColor: accentColor }]}>
        <View style={styles.headerTop}>
          <View style={[styles.headerIconBox, { backgroundColor: accentColor + '25' }]}>
            <Text style={styles.headerIconText}>⚙️</Text>
          </View>
          <View style={styles.headerTextBlock}>
            <Text style={styles.headerLabel}>MODUL AKTIF</Text>
            <Text style={styles.headerTitle} numberOfLines={2}>{modulTitle}</Text>
            <Text style={styles.headerSub}>{modulSub}</Text>
          </View>
          {/* Indikator realtime LIVE */}
          <View style={styles.liveBadge}>
            <View style={styles.liveDot} />
            <Text style={styles.liveText}>LIVE</Text>
          </View>
        </View>

        <View style={styles.progressSection}>
          <View style={styles.progressRow}>
            <Text style={styles.progressText}>
              {doneTasks}/{totalTasks} task selesai
            </Text>
            <Text style={[styles.progressPct, { color: accentColor }]}>{progress}%</Text>
          </View>
          <View style={styles.progressTrack}>
            <View style={[
              styles.progressFill,
              { width: `${progress}%`, backgroundColor: accentColor },
            ]} />
          </View>
        </View>
      </View>

      <ScrollView
        style={styles.flex}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* ── Info Banner Firestore ─────────────────────── */}
        <View style={styles.infoBanner}>
          <Text style={styles.infoBannerIcon}>🔥</Text>
          <Text style={styles.infoBannerText}>
            Data realtime dari <Text style={{ fontWeight: 'bold' }}>Cloud Firestore</Text> —
            ketuk area teks untuk pindah kolom, klik 🗑️ untuk hapus
          </Text>
        </View>

        {/* ── Holiday Checker ─────────── */}
        <View style={styles.section}>
          <HolidayChecker />
        </View>

        {/* ── Kanban Board ───────────────────────────────── */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <View style={[styles.sectionDot, { backgroundColor: accentColor }]} />
            <Text style={styles.sectionTitle}>Kanban Board</Text>
            <Text style={styles.sectionHint}>geser →</Text>
          </View>

          {isLoading ? (
            <View style={styles.centerState}>
              <ActivityIndicator size="large" color={accentColor} />
              <Text style={styles.loadingText}>Menghubungkan ke Firestore...</Text>
            </View>
          ) : error ? (
            <View style={styles.centerState}>
              <Text style={styles.stateEmoji}>🔥</Text>
              <Text style={styles.stateTitle}>Gagal Memuat Task</Text>
              <Text style={styles.stateDesc}>{error}</Text>
              <TouchableOpacity
                style={[styles.retryBtn, { backgroundColor: accentColor }]}
                onPress={() => setRetryKey((k) => k + 1)}
              >
                <Text style={styles.retryBtnText}>🔄 Coba Lagi</Text>
              </TouchableOpacity>
            </View>
          ) : (
            <View style={styles.kanbanWrapper}>
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.boardContainer}
              >
                {KANBAN_COLUMNS.map((col) => {
                  const colTasks = tasksByColumn[col.id] || [];

                  return (
                    <View key={col.id} style={styles.column}>
                      <View style={[styles.columnHeader, { borderTopColor: col.color }]}>
                        <View style={styles.columnHeaderLeft}>
                          <Text style={styles.columnIcon}>{col.icon}</Text>
                          <Text style={styles.columnTitle}>{col.label}</Text>
                        </View>
                        <View style={[styles.badge, { backgroundColor: col.color }]}>
                          <Text style={styles.badgeText}>{colTasks.length}</Text>
                        </View>
                      </View>

                      {colTasks.length > 0 ? (
                        colTasks.map((task) => (
                          <View key={task.id} style={styles.taskCard}>
                            
                            {/* Area Kiri: Untuk klik pindah kolom */}
                            <TouchableOpacity
                              style={styles.taskContent}
                              onPress={() => handleTaskPress(task)}
                              activeOpacity={0.7}
                            >
                              <View style={[styles.taskDot, { backgroundColor: col.color }]} />
                              <View style={{ flex: 1 }}>
                                <Text style={styles.taskText}>{task.title}</Text>
                                {task.deadline ? (
                                  <Text style={styles.taskDeadline}>📅 {task.deadline}</Text>
                                ) : null}
                              </View>
                            </TouchableOpacity>

                            {/* Area Kanan: Tombol Delete Eksplisit */}
                            <TouchableOpacity
                              style={styles.deleteIconBtn}
                              onPress={() => handleDeletePress(task)}
                              hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                            >
                              <Text style={styles.deleteIconText}>🗑️</Text>
                            </TouchableOpacity>

                          </View>
                        ))
                      ) : (
                        <View style={styles.emptyCard}>
                          <Text style={styles.emptyIcon}>📋</Text>
                          <Text style={styles.emptyText}>Kosong</Text>
                        </View>
                      )}

                      <TouchableOpacity
                        style={styles.addBtn}
                        onPress={() => openAddModal(col)}
                      >
                        <Text style={styles.addBtnText}>+ Tambah</Text>
                      </TouchableOpacity>
                    </View>
                  );
                })}
              </ScrollView>
            </View>
          )}
        </View>

        <View style={{ height: 8 }} />
      </ScrollView>

      {/* ═══ BOTTOM NAV (Fixed) ═════════════════════════ */}
      <View style={styles.bottomNav}>
        <TouchableOpacity style={styles.navItem} onPress={() => navigation.goBack()}>
          <Text style={styles.navIcon}>📋</Text>
          <Text style={styles.navText}>Job Sheets</Text>
        </TouchableOpacity>
        <View style={[styles.navItem, styles.navItemActive]}>
          <Text style={styles.navIcon}>📊</Text>
          <Text style={[styles.navText, styles.navTextActive]}>Tugas</Text>
          <View style={styles.navIndicator} />
        </View>
      </View>

      {/* ═══ MODAL TAMBAH TASK ═══════════════════════════ */}
      <AddTaskModal
        visible={showModal}
        onClose={() => setShowModal(false)}
        onSubmit={handleSubmitTask}
        title={newTitle}
        setTitle={setNewTitle}
        deadline={newDeadline}
        setDeadline={setNewDeadline}
        isSubmitting={isSubmitting}
        error={formError}
        columnLabel={activeColumn.label}
        accentColor={accentColor}
      />

    </SafeAreaView>
  );
}

// ════════════════════════════════════════════════════════════
//  STYLES
// ════════════════════════════════════════════════════════════
const styles = StyleSheet.create({
  flex:      { flex: 1 },
  container: { flex: 1, backgroundColor: COLORS.background },

  header: {
    backgroundColor: '#0f172a', // Disamakan persis dengan header JobSheetScreen
    paddingHorizontal: 16, paddingVertical: 14, gap: 12,
    borderBottomWidth: 3, borderBottomColor: '#d97706',
  },
  headerTop: { flexDirection: 'row', gap: 12, alignItems: 'flex-start' },
  headerIconBox: {
    width: 46, height: 46, borderRadius: 12,
    justifyContent: 'center', alignItems: 'center', flexShrink: 0,
  },
  headerIconText:  { fontSize: 24 },
  headerTextBlock: { flex: 1 },
  headerLabel: { fontSize: 9, fontWeight: 'bold', color: COLORS.gray, letterSpacing: 1.5 },
  headerTitle: { fontSize: 14, fontWeight: 'bold', color: COLORS.white, lineHeight: 20, marginTop: 2 },
  headerSub:   { fontSize: 11, color: COLORS.gray, marginTop: 2 },

  liveBadge: {
    flexDirection: 'row', alignItems: 'center', gap: 4,
    backgroundColor: '#27ae60' + '25',
    borderRadius: 8, paddingHorizontal: 8, paddingVertical: 4,
    borderWidth: 1, borderColor: '#27ae60' + '50', flexShrink: 0,
  },
  liveDot:  { width: 6, height: 6, borderRadius: 3, backgroundColor: '#27ae60' },
  liveText: { fontSize: 9, fontWeight: 'bold', color: '#27ae60', letterSpacing: 0.5 },

  progressSection: { gap: 6 },
  progressRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  progressText: { fontSize: 11, color: COLORS.gray },
  progressPct:  { fontSize: 11, fontWeight: 'bold' },
  progressTrack: { height: 6, backgroundColor: COLORS.secondary + '80', borderRadius: 3, overflow: 'hidden' },
  progressFill:  { height: '100%', borderRadius: 3 },

  scrollContent: { paddingBottom: 16 },

  infoBanner: {
    flexDirection: 'row', alignItems: 'center', gap: 8,
    backgroundColor: COLORS.accent + '12',
    paddingHorizontal: 16, paddingVertical: 9,
    borderBottomWidth: 1, borderBottomColor: COLORS.accent + '30',
  },
  infoBannerIcon: { fontSize: 14 },
  infoBannerText: { fontSize: 12, color: COLORS.accent + 'CC', flex: 1, lineHeight: 17 },

  section: { paddingHorizontal: 16, paddingTop: 14, gap: 10 },
  sectionHeader: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  sectionDot:   { width: 4, height: 18, borderRadius: 2 },
  sectionTitle: { flex: 1, fontSize: 15, fontWeight: 'bold', color: COLORS.text },
  sectionHint:  { fontSize: 11, color: COLORS.gray },

  centerState: { paddingVertical: 40, alignItems: 'center', gap: 10 },
  stateEmoji:  { fontSize: 44 },
  stateTitle:  { fontSize: 15, fontWeight: 'bold', color: COLORS.text },
  stateDesc:   { fontSize: 12, color: COLORS.textLight, textAlign: 'center', paddingHorizontal: 24, lineHeight: 18 },
  loadingText: { fontSize: 12, color: COLORS.textLight, marginTop: 4 },
  retryBtn:    { borderRadius: 10, paddingVertical: 10, paddingHorizontal: 22, marginTop: 6 },
  retryBtnText:{ color: COLORS.white, fontWeight: 'bold', fontSize: 13 },

  kanbanWrapper: { height: 340 },
  boardContainer: { paddingHorizontal: 4, paddingVertical: 4, gap: 12, alignItems: 'flex-start' },

  column: {
    width: 168,
    backgroundColor: COLORS.secondary + '10',
    borderRadius: 14, padding: 10, gap: 8,
    borderWidth: 1, borderColor: COLORS.border,
  },
  columnHeader: {
    backgroundColor: COLORS.primary, borderRadius: 10,
    paddingVertical: 10, paddingHorizontal: 12,
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    borderTopWidth: 3,
  },
  columnHeaderLeft: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  columnIcon:  { fontSize: 13 },
  columnTitle: { color: COLORS.white, fontWeight: 'bold', fontSize: 11, letterSpacing: 0.5 },
  badge: { width: 22, height: 22, borderRadius: 11, justifyContent: 'center', alignItems: 'center' },
  badgeText: { color: COLORS.white, fontSize: 11, fontWeight: 'bold' },

  taskCard: {
    backgroundColor: COLORS.white, borderRadius: 10, padding: 10,
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    borderWidth: 1, borderColor: COLORS.border,
    shadowColor: '#000', shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04, shadowRadius: 4, elevation: 1,
  },
  taskContent: {
    flex: 1, flexDirection: 'row', gap: 8, alignItems: 'flex-start',
  },
  taskDot:      { width: 8, height: 8, borderRadius: 4, marginTop: 4, flexShrink: 0 },
  taskText:     { fontSize: 11, color: COLORS.text, lineHeight: 16, fontWeight: '600' },
  taskDeadline: { fontSize: 10, color: COLORS.textLight, marginTop: 3 },
  
  deleteIconBtn: {
    padding: 6, marginLeft: 6,
    backgroundColor: '#ffebee', // Warna merah muda transparan yang aman
    borderRadius: 6,
  },
  deleteIconText: { fontSize: 13 },

  emptyCard: {
    backgroundColor: COLORS.white, borderRadius: 10, padding: 14, alignItems: 'center',
    borderWidth: 1.5, borderColor: COLORS.border, borderStyle: 'dashed', gap: 4,
  },
  emptyIcon: { fontSize: 20 },
  emptyText: { color: COLORS.textLight, fontSize: 11 },

  addBtn: {
    borderRadius: 8, paddingVertical: 8, alignItems: 'center',
    backgroundColor: COLORS.primary + '15', borderWidth: 1, borderColor: COLORS.primary + '30',
  },
  addBtnText: { fontSize: 12, color: COLORS.primary, fontWeight: '600' },

  bottomNav: {
    flexDirection: 'row', backgroundColor: COLORS.white,
    borderTopWidth: 1, borderTopColor: COLORS.border, paddingBottom: 4,
    shadowColor: '#000', shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.06, shadowRadius: 8, elevation: 8,
  },
  navItem: { flex: 1, alignItems: 'center', paddingVertical: 10, gap: 3, position: 'relative' },
  navIcon: { fontSize: 20 },
  navText: { fontSize: 10, color: COLORS.textLight, fontWeight: '600' },
  navTextActive: { color: COLORS.primary, fontWeight: 'bold' },
  navIndicator: {
    position: 'absolute', bottom: 0, left: '25%', right: '25%',
    height: 3, backgroundColor: COLORS.accent, borderRadius: 2,
  },
});