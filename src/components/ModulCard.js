import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { COLORS } from '../constants/colors';

const AVATAR_COLORS = ['#3498db', '#9b59b6', '#27ae60', '#e74c3c', '#f39c12'];

const MemberAvatar = ({ index, label }) => (
  <View style={[
    styles.avatar,
    { backgroundColor: AVATAR_COLORS[index % AVATAR_COLORS.length] },
    index > 0 && { marginLeft: -8 },
  ]}>
    <Text style={styles.avatarLabel}>{label}</Text>
  </View>
);

export default function ModulCard({ modul, onPress }) {
  const { title, subtitle, icon, deadline, members, description, accentColor, progress = 0 } = modul;

  const getStatusLabel = (p) => {
    if (p === 0) return { label: 'Belum Mulai', color: COLORS.gray };
    if (p < 50) return { label: 'Sedang Berjalan', color: '#3498db' };
    if (p < 100) return { label: 'Hampir Selesai', color: '#f39c12' };
    return { label: 'Selesai', color: COLORS.success };
  };

  const status = getStatusLabel(progress);
  const memberArray = Array.from({ length: members }, (_, i) => ({
    id: i, label: String.fromCharCode(65 + i),
  }));

  return (
    <TouchableOpacity
      style={[styles.card, { borderLeftColor: accentColor }]}
      onPress={onPress}
      activeOpacity={0.82}
    >
      <View style={styles.topRow}>
        <View style={[styles.iconBox, { backgroundColor: accentColor + '20', borderColor: accentColor + '50' }]}>
          <Text style={styles.iconText}>{icon}</Text>
        </View>
        <View style={styles.titleBlock}>
          <Text style={styles.title} numberOfLines={2}>{title}</Text>
          <Text style={styles.subtitle}>{subtitle}</Text>
        </View>
        <View style={[styles.statusBadge, { backgroundColor: status.color + '20' }]}>
          <View style={[styles.statusDot, { backgroundColor: status.color }]} />
          <Text style={[styles.statusText, { color: status.color }]}>{status.label}</Text>
        </View>
      </View>

      {description ? <Text style={styles.description} numberOfLines={1}>{description}</Text> : null}

      <View style={styles.progressSection}>
        <View style={styles.progressTrack}>
          <View style={[styles.progressFill, { width: `${progress}%`, backgroundColor: accentColor }]} />
        </View>
        <Text style={[styles.progressLabel, { color: accentColor }]}>{progress}%</Text>
      </View>

      <View style={styles.bottomRow}>
        <View style={styles.membersRow}>
          {memberArray.map((m) => (
            <MemberAvatar key={m.id} index={m.id} label={m.label} />
          ))}
          <Text style={styles.memberCount}> {members} anggota</Text>
        </View>
        <View style={styles.deadlineBadge}>
          <Text style={styles.deadlineIcon}>📅</Text>
          <Text style={styles.deadlineText}>Deadline: {deadline}</Text>
        </View>
        <Text style={[styles.arrow, { color: accentColor }]}>›</Text>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: { backgroundColor: COLORS.white, borderRadius: 16, padding: 16, gap: 12, borderLeftWidth: 4, shadowColor: '#000', shadowOffset: { width: 0, height: 3 }, shadowOpacity: 0.08, shadowRadius: 12, elevation: 4, borderWidth: 1, borderColor: COLORS.border },
  topRow: { flexDirection: 'row', alignItems: 'flex-start', gap: 12 },
  iconBox: { width: 52, height: 52, borderRadius: 14, justifyContent: 'center', alignItems: 'center', borderWidth: 1, flexShrink: 0 },
  iconText: { fontSize: 26 },
  titleBlock: { flex: 1, gap: 3 },
  title: { fontSize: 14, fontWeight: 'bold', color: COLORS.text, lineHeight: 20 },
  subtitle: { fontSize: 12, color: COLORS.textLight },
  statusBadge: { flexDirection: 'row', alignItems: 'center', gap: 4, borderRadius: 8, paddingHorizontal: 8, paddingVertical: 4, alignSelf: 'flex-start', flexShrink: 0 },
  statusDot: { width: 6, height: 6, borderRadius: 3 },
  statusText: { fontSize: 10, fontWeight: '700' },
  description: { fontSize: 12, color: COLORS.textLight, lineHeight: 17 },
  progressSection: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  progressTrack: { flex: 1, height: 6, backgroundColor: COLORS.border, borderRadius: 3, overflow: 'hidden' },
  progressFill: { height: '100%', borderRadius: 3 },
  progressLabel: { fontSize: 11, fontWeight: 'bold', minWidth: 30, textAlign: 'right' },
  bottomRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  membersRow: { flexDirection: 'row', alignItems: 'center', flex: 1 },
  avatar: { width: 26, height: 26, borderRadius: 13, justifyContent: 'center', alignItems: 'center', borderWidth: 2, borderColor: COLORS.white },
  avatarLabel: { fontSize: 10, fontWeight: 'bold', color: COLORS.white },
  memberCount: { fontSize: 11, color: COLORS.textLight, marginLeft: 10 },
  deadlineBadge: { flexDirection: 'row', alignItems: 'center', gap: 4, backgroundColor: COLORS.accent + '15', borderRadius: 8, paddingHorizontal: 8, paddingVertical: 4, borderWidth: 1, borderColor: COLORS.accent + '30' },
  deadlineIcon: { fontSize: 11 },
  deadlineText: { fontSize: 11, fontWeight: '600', color: COLORS.accent },
  arrow: { fontSize: 28, fontWeight: 'bold', marginRight: -4 },
});