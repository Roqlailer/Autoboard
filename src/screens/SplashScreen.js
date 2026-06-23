import { ActivityIndicator, StyleSheet, Text, View } from 'react-native';
import { COLORS } from '../constants/colors';

export default function SplashScreen() {
  return (
    <View style={styles.container}>
      <View style={styles.logoBox}>
        <Text style={styles.logoEmoji}>⚙️</Text>
      </View>
      <Text style={styles.appName}>AutoBoard</Text>

      <ActivityIndicator
        size="small"
        color={COLORS.accent}
        style={styles.spinner}
      />
      <Text style={styles.statusText}>Memeriksa sesi login...</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.primary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  logoBox: {
    width: 84, height: 84,
    borderRadius: 18,
    backgroundColor: COLORS.secondary,
    justifyContent: 'center', alignItems: 'center',
    marginBottom: 14,
    borderWidth: 2, borderColor: COLORS.accent,
  },
  logoEmoji: { fontSize: 40 },
  appName: {
    fontSize: 26, fontWeight: 'bold',
    color: COLORS.white, letterSpacing: 3,
  },
  spinner:    { marginTop: 22 },
  statusText: { fontSize: 12, color: COLORS.gray, marginTop: 10 },
});