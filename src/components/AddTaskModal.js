// ============================================================
//  AddTaskModal — Form modal untuk menambah task ke Firestore
//  Reusable: tidak tahu apapun tentang Firestore, hanya UI form
// ============================================================

import {
    ActivityIndicator,
    KeyboardAvoidingView,
    Modal,
    Platform,
    Pressable,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from 'react-native';
import { COLORS } from '../constants/colors';

export default function AddTaskModal({
  visible,
  onClose,
  onSubmit,
  title,
  setTitle,
  deadline,
  setDeadline,
  isSubmitting,
  error,
  columnLabel,
  accentColor,
}) {
  return (
    <Modal
      visible={visible}
      animationType="fade"
      transparent
      onRequestClose={onClose}
    >
      {/* Tap area gelap di luar card → tutup modal */}
      <Pressable style={styles.overlay} onPress={onClose}>
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
          style={styles.kav}
        >
          {/* Mencegah tap di dalam card menutup modal */}
          <Pressable style={styles.card} onPress={() => {}}>

            <View style={styles.header}>
              <Text style={styles.headerTitle}>+ Tambah Task</Text>
              <View style={[styles.columnBadge, { backgroundColor: accentColor + '20' }]}>
                <Text style={[styles.columnBadgeText, { color: accentColor }]}>
                  {columnLabel}
                </Text>
              </View>
            </View>

            {error ? (
              <View style={styles.errorBox}>
                <Text style={styles.errorText}>⚠ {error}</Text>
              </View>
            ) : null}

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Judul Task</Text>
              <TextInput
                style={styles.input}
                placeholder="cth: Sambungan Kontaktor & Relay"
                placeholderTextColor={COLORS.gray}
                value={title}
                onChangeText={setTitle}
                autoFocus
                editable={!isSubmitting}
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Deadline (opsional)</Text>
              <TextInput
                style={styles.input}
                placeholder="cth: 20 Jun"
                placeholderTextColor={COLORS.gray}
                value={deadline}
                onChangeText={setDeadline}
                editable={!isSubmitting}
              />
            </View>

            <View style={styles.btnRow}>
              <TouchableOpacity
                style={styles.cancelBtn}
                onPress={onClose}
                disabled={isSubmitting}
              >
                <Text style={styles.cancelBtnText}>Batal</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.submitBtn, { backgroundColor: accentColor }]}
                onPress={onSubmit}
                disabled={isSubmitting}
              >
                {isSubmitting ? (
                  <ActivityIndicator color={COLORS.white} size="small" />
                ) : (
                  <Text style={styles.submitBtnText}>Simpan</Text>
                )}
              </TouchableOpacity>
            </View>

          </Pressable>
        </KeyboardAvoidingView>
      </Pressable>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.55)',
    justifyContent: 'center',
    paddingHorizontal: 24,
  },
  kav:  { width: '100%' },
  card: {
    backgroundColor: COLORS.white,
    borderRadius: 18,
    padding: 20,
    gap: 14,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  headerTitle:     { fontSize: 16, fontWeight: 'bold', color: COLORS.text },
  columnBadge:     { borderRadius: 8, paddingHorizontal: 10, paddingVertical: 4 },
  columnBadgeText: { fontSize: 11, fontWeight: 'bold' },

  errorBox: {
    backgroundColor: COLORS.error + '15',
    borderRadius: 8, padding: 10,
    borderWidth: 1, borderColor: COLORS.error + '40',
  },
  errorText: { color: COLORS.error, fontSize: 12, fontWeight: '600' },

  inputGroup: { gap: 6 },
  label: {
    fontSize: 11, fontWeight: '700',
    color: COLORS.textLight, textTransform: 'uppercase',
  },
  input: {
    backgroundColor: COLORS.background,
    borderRadius: 10, paddingHorizontal: 14, height: 48,
    fontSize: 14, color: COLORS.text,
    borderWidth: 1.5, borderColor: COLORS.border,
  },

  btnRow: { flexDirection: 'row', gap: 10, marginTop: 4 },
  cancelBtn: {
    flex: 1, height: 48, borderRadius: 10,
    justifyContent: 'center', alignItems: 'center',
    backgroundColor: COLORS.background,
    borderWidth: 1, borderColor: COLORS.border,
  },
  cancelBtnText: { color: COLORS.textLight, fontWeight: '600', fontSize: 14 },
  submitBtn: {
    flex: 1, height: 48, borderRadius: 10,
    justifyContent: 'center', alignItems: 'center',
  },
  submitBtnText: { color: COLORS.white, fontWeight: 'bold', fontSize: 14 },
});