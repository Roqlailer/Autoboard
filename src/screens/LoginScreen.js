import { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  FlatList,
  Modal,
  Platform,
  SafeAreaView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';

import { addModule, deleteModule, subscribeModules } from '../services/moduleService';

// Import Firebase Auth untuk fitur Logout
import { signOut } from 'firebase/auth';
import { auth } from '../services/firebaseConfig';

// ── DATA JADWAL STATIS UNTUK DEMO ─────────────────────────────
const JADWAL_PRAKTIKUM = [
  { id: '1', hari: 'Senin', matkul: 'Otomasi Sistem Elektro-Pneumatik', waktu: '08:00 - 12:00', ruang: 'Lab Pneumatik', dosen: 'Tim Dosen Otomasi' },
  { id: '2', hari: 'Selasa', matkul: 'PLC Programming (Omron CP1E)', waktu: '09:00 - 14:00', ruang: 'Lab Otomasi Industri', dosen: 'Tim Dosen PLC' },
  { id: '3', hari: 'Rabu', matkul: 'Desain Arsitektur SCADA & HMI', waktu: '13:00 - 16:00', ruang: 'Lab Komputer & Jaringan', dosen: 'Tim Dosen SCADA' },
  { id: '4', hari: 'Kamis', matkul: 'Wiring & Kontrol Motor 3 Fasa', waktu: '08:00 - 12:00', ruang: 'Bengkel Listrik', dosen: 'Tim Dosen Mesin' },
  { id: '5', hari: 'Jumat', matkul: 'Riset & Proyek Akhir', waktu: '08:00 - 16:00', ruang: 'Mandiri', dosen: 'Dosen Pembimbing' },
];

export default function JobSheetScreen({ navigation }) {
  const [activeTab, setActiveTab] = useState('jobsheet'); // 'jobsheet' atau 'jadwal'
  const [searchQuery, setSearchQuery] = useState('');
  
  // State Firebase
  const [modules, setModules] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  // State Modal Tambah Modul
  const [showModal, setShowModal] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newSubtitle, setNewSubtitle] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    const unsubscribe = subscribeModules(
      (data) => {
        setModules(data);
        setIsLoading(false);
      },
      () => setIsLoading(false)
    );
    return () => unsubscribe();
  }, []);

  const handleAddModule = async () => {
    if (!newTitle.trim()) {
      alert('Nama modul tidak boleh kosong!');
      return;
    }
    setIsSubmitting(true);
    try {
      await addModule({
        title: newTitle.trim(),
        subtitle: newSubtitle.trim() || 'Monitoring Progres Praktikum',
      });
      setNewTitle('');
      setNewSubtitle('');
      setShowModal(false);
    } catch (err) {
      alert('Gagal menambah modul: ' + err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteModule = (item) => {
    const msg = `Hapus Modul?\n"${item.title}" akan dihapus permanen beserta sistem filternya.`;
    
    if (Platform.OS === 'web') {
      if (window.confirm(msg)) {
        deleteModule(item.id).catch((err) => alert(err.message));
      }
    } else {
      Alert.alert('Hapus Modul', msg, [
        { text: 'Batal', style: 'cancel' },
        { text: 'Hapus', style: 'destructive', onPress: () => deleteModule(item.id) },
      ]);
    }
  };

  const handleLogout = () => {
    const msg = 'Apakah kamu yakin ingin keluar dari aplikasi?';
    
    if (Platform.OS === 'web') {
      if (window.confirm(msg)) {
        signOut(auth)
          .then(() => navigation.replace('Login')) 
          .catch((err) => alert('Gagal Logout: ' + err.message));
      }
    } else {
      Alert.alert('Konfirmasi Logout', msg, [
        { text: 'Batal', style: 'cancel' },
        { 
          text: 'Keluar', 
          style: 'destructive', 
          onPress: async () => {
            try {
              await signOut(auth);
              navigation.replace('Login'); 
            } catch (err) {
              Alert.alert('Gagal Logout', err.message);
            }
          }
        },
      ]);
    }
  };

  const filteredModules = modules.filter((m) =>
    m.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const renderModuleCard = ({ item, index }) => (
    <View style={styles.cardContainer}>
      <TouchableOpacity
        style={styles.cardMain}
        activeOpacity={0.7}
        onPress={() => navigation.navigate('Kanban', { modul: item })}
      >
        <View style={styles.cardIndicator} />
        <View style={styles.cardIconBox}>
          <Text style={styles.cardIconText}>{index % 2 === 0 ? '💻' : '⚙️'}</Text>
        </View>
        <View style={styles.cardBody}>
          <Text style={styles.cardTitle} numberOfLines={1}>
            Modul {index + 1}: {item.title}
          </Text>
          <Text style={styles.cardSubtitle} numberOfLines={1}>
            📋 {item.subtitle}
          </Text>
        </View>
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.deleteBtn}
        onPress={() => handleDeleteModule(item)}
      >
        <Text style={styles.deleteBtnText}>🗑️</Text>
      </TouchableOpacity>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerLogo}>AutoBoard</Text>

        <View style={styles.profileSection}>
          <View style={styles.profileLeftBlock}>
            <View style={styles.avatar}>
              <Text style={styles.avatarText}>H</Text>
            </View>
            <View>
              <Text style={styles.profileLabel}>Portal Praktikum</Text>
              <Text style={styles.profileName}>Teknik Otomasi Industri</Text>
            </View>
          </View>

          <TouchableOpacity style={styles.logoutBtnSolid} onPress={handleLogout}>
            <Text style={styles.logoutBtnTextSolid}>Keluar 🚪</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.tabContainer}>
          <TouchableOpacity
            style={[styles.tab, activeTab === 'jobsheet' && styles.tabActive]}
            onPress={() => setActiveTab('jobsheet')}
          >
            <Text style={[styles.tabText, activeTab === 'jobsheet' && styles.tabTextActive]}>
              Job Sheets
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.tab, activeTab === 'jadwal' && styles.tabActive]}
            onPress={() => setActiveTab('jadwal')}
          >
            <Text style={[styles.tabText, activeTab === 'jadwal' && styles.tabTextActive]}>
              Jadwal Kuliah
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* ═══ CONTENT BROWSER ═══════════════════════════ */}
      {activeTab === 'jobsheet' ? (
        <View style={styles.content}>
          <View style={styles.actionBar}>
            <TextInput
              style={styles.searchBar}
              placeholder="Cari Modul Praktikum..."
              placeholderTextColor="#94a3b8"
              value={searchQuery}
              onChangeText={setSearchQuery}
            />
            <TouchableOpacity style={styles.addModuleBtn} onPress={() => setShowModal(true)}>
              <Text style={styles.addModuleBtnText}>+ Modul</Text>
            </TouchableOpacity>
          </View>

          {isLoading ? (
            <ActivityIndicator size="large" color="#d97706" style={{ marginTop: 40 }} />
          ) : (
            <FlatList
              data={filteredModules}
              keyExtractor={(item) => item.id}
              renderItem={renderModuleCard}
              contentContainerStyle={styles.listContent}
              ListEmptyComponent={
                <Text style={styles.emptyText}>Belum ada modul. Klik + Modul untuk menambahkan.</Text>
              }
            />
          )}
        </View>
      ) : (
        /* ═══ HALAMAN JADWAL KULIAH ═════════════════════════ */
        <View style={styles.content}>
          <Text style={styles.sectionTitle}>Jadwal Praktikum Mingguan</Text>
          <FlatList
            data={JADWAL_PRAKTIKUM}
            keyExtractor={(item) => item.id}
            showsVerticalScrollIndicator={false}
            renderItem={({ item }) => (
              <View style={styles.jadwalCard}>
                <View style={styles.jadwalHariBox}>
                  <Text style={styles.jadwalHari}>{item.hari}</Text>
                </View>
                <View style={styles.jadwalInfo}>
                  <Text style={styles.jadwalMatkul}>{item.matkul}</Text>
                  <Text style={styles.jadwalDetail}>⏰ {item.waktu}</Text>
                  <Text style={styles.jadwalDetail}>📍 {item.ruang} | 👨‍🏫 {item.dosen}</Text>
                </View>
              </View>
            )}
            contentContainerStyle={styles.listContent}
          />
        </View>
      )}

      {/* ═══ MODAL TAMBAH MODUL ═════════════════════════ */}
      <Modal visible={showModal} animationType="fade" transparent>
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            <Text style={styles.modalHeader}>Tambah Modul Praktikum</Text>
            
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Nama / Judul Modul</Text>
              <TextInput
                style={styles.input}
                placeholder="Contoh: Otomasi Sistem Elektro-Pneumatik"
                value={newTitle}
                onChangeText={setNewTitle}
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Deskripsi Singkat (Opsional)</Text>
              <TextInput
                style={styles.input}
                placeholder="Contoh: Praktik Optimasi Kendali PID"
                value={newSubtitle}
                onChangeText={setNewSubtitle}
              />
            </View>

            <View style={styles.modalActions}>
              <TouchableOpacity style={styles.cancelBtn} onPress={() => setShowModal(false)} disabled={isSubmitting}>
                <Text style={styles.cancelBtnText}>Batal</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.submitBtn} onPress={handleAddModule} disabled={isSubmitting}>
                {isSubmitting ? <ActivityIndicator color="#fff" size="small" /> : <Text style={styles.submitBtnText}>Simpan</Text>}
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f1f5f9' },
  header: { backgroundColor: '#0f172a', padding: 16, borderBottomWidth: 3, borderBottomColor: '#d97706' },
  headerLogo: { fontSize: 18, fontWeight: 'bold', color: '#fff', letterSpacing: 1 },
  
  profileSection: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginTop: 16, marginBottom: 8 },
  profileLeftBlock: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  avatar: { width: 44, height: 44, borderRadius: 22, backgroundColor: '#d97706', justifyContent: 'center', alignItems: 'center' },
  avatarText: { color: '#fff', fontWeight: 'bold', fontSize: 18 },
  profileLabel: { fontSize: 11, color: '#94a3b8' },
  profileName: { fontSize: 15, fontWeight: 'bold', color: '#fff' },
  
  logoutBtnSolid: { backgroundColor: '#dc2626', paddingHorizontal: 14, paddingVertical: 10, borderRadius: 8, shadowColor: '#dc2626', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.2, shadowRadius: 4, elevation: 3 },
  logoutBtnTextSolid: { color: '#fff', fontSize: 12, fontWeight: 'bold' },

  tabContainer: { flexDirection: 'row', backgroundColor: '#1e293b', borderRadius: 8, marginTop: 12, padding: 4 },
  tab: { flex: 1, paddingVertical: 10, alignItems: 'center', borderRadius: 6 },
  tabActive: { backgroundColor: '#0f172a' },
  tabText: { color: '#94a3b8', fontSize: 13, fontWeight: '600' },
  tabTextActive: { color: '#fff', fontWeight: 'bold' },

  content: { flex: 1, padding: 16 },
  sectionTitle: { fontSize: 16, fontWeight: 'bold', color: '#1e293b', marginBottom: 12 },
  actionBar: { flexDirection: 'row', gap: 10, marginBottom: 14 },
  searchBar: { flex: 1, backgroundColor: '#fff', borderRadius: 10, paddingHorizontal: 16, height: 48, borderWidth: 1, borderColor: '#cbd5e1', color: '#334155' },
  addModuleBtn: { backgroundColor: '#d97706', borderRadius: 10, paddingHorizontal: 16, justifyContent: 'center', alignItems: 'center' },
  addModuleBtnText: { color: '#fff', fontWeight: 'bold', fontSize: 14 },

  listContent: { gap: 12, paddingBottom: 20 },
  cardContainer: { flexDirection: 'row', backgroundColor: '#fff', borderRadius: 12, overflow: 'hidden', borderWidth: 1, borderColor: '#e2e8f0', alignItems: 'center', paddingRight: 8 },
  cardMain: { flex: 1, flexDirection: 'row', alignItems: 'center', padding: 16, gap: 12 },
  cardIndicator: { position: 'absolute', left: 0, top: 0, bottom: 0, width: 4, backgroundColor: '#d97706' },
  cardIconBox: { width: 40, height: 40, borderRadius: 8, backgroundColor: '#f1f5f9', justifyContent: 'center', alignItems: 'center' },
  cardIconText: { fontSize: 20 },
  cardBody: { flex: 1 },
  cardTitle: { fontSize: 14, fontWeight: 'bold', color: '#1e293b' },
  cardSubtitle: { fontSize: 11, color: '#64748b', marginTop: 4 },
  
  deleteBtn: { padding: 10, backgroundColor: '#fee2e2', borderRadius: 8 },
  deleteBtnText: { fontSize: 14 },
  emptyText: { textAlign: 'center', color: '#64748b', marginTop: 30, fontSize: 13 },

  /* ── Style Tambahan untuk Jadwal Kuliah ── */
  jadwalCard: { flexDirection: 'row', backgroundColor: '#fff', borderRadius: 12, padding: 12, borderWidth: 1, borderColor: '#e2e8f0', alignItems: 'center', gap: 14 },
  jadwalHariBox: { backgroundColor: '#d9770615', width: 64, height: 64, borderRadius: 10, justifyContent: 'center', alignItems: 'center' },
  jadwalHari: { color: '#d97706', fontWeight: 'bold', fontSize: 14 },
  jadwalInfo: { flex: 1, gap: 4 },
  jadwalMatkul: { fontSize: 14, fontWeight: 'bold', color: '#1e293b' },
  jadwalDetail: { fontSize: 12, color: '#64748b' },

  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', alignItems: 'center', padding: 20 },
  modalCard: { backgroundColor: '#fff', borderRadius: 16, padding: 20, width: '100%', maxWidth: 400, gap: 16 },
  modalHeader: { fontSize: 16, fontWeight: 'bold', color: '#1e293b' },
  inputGroup: { gap: 6 },
  inputLabel: { fontSize: 12, fontWeight: '600', color: '#64748b' },
  input: { backgroundColor: '#f8fafc', borderWidth: 1, borderColor: '#cbd5e1', borderRadius: 8, paddingHorizontal: 12, height: 44, color: '#334155' },
  modalActions: { flexDirection: 'row', justifyContent: 'flex-end', gap: 10, marginTop: 8 },
  cancelBtn: { paddingVertical: 10, paddingHorizontal: 16, borderRadius: 8 },
  cancelBtnText: { color: '#64748b', fontWeight: '600' },
  submitBtn: { backgroundColor: '#d97706', paddingVertical: 10, paddingHorizontal: 20, borderRadius: 8, minWidth: 80, alignItems: 'center' },
  submitBtnText: { color: '#fff', fontWeight: 'bold' },
});