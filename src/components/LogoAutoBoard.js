import { StyleSheet, Text, View } from 'react-native';
import { COLORS } from '../constants/colors';

/**
 * LogoAutoBoard
 * ─────────────────────────────────────────────────────
 * Logo industrial tanpa library SVG tambahan.
 * Teknik:  2 ring konsentris + bentuk berlian (square 45°)
 *          dengan konten counter-rotate -45° agar tegak.
 * ─────────────────────────────────────────────────────
 */
export default function LogoAutoBoard() {
  return (
    <View style={styles.wrapper}>

      {/* ── Ring luar — transparan, sentuhan ringan ── */}
      <View style={styles.ringOuter}>

        {/* ── Ring tengah — sedikit lebih tebal ── */}
        <View style={styles.ringMiddle}>

          {/* ── Diamond shape: square diputar 45° → berlian ── */}
          <View style={styles.diamond}>

            {/* Konten diputar -45° agar tampil tegak */}
            <View style={styles.diamondContent}>
              <Text style={styles.gearIcon}>⚙</Text>
              <Text style={styles.logoTag}>AB</Text>
            </View>

          </View>
        </View>
      </View>

    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    width: 130,
    height: 130,
    alignItems: 'center',
    justifyContent: 'center',
  },

  /* Ring 1 — paling luar, sangat transparan */
  ringOuter: {
    width: 124,
    height: 124,
    borderRadius: 62,
    borderWidth: 1,
    borderColor: COLORS.accent + '35',       // 21% opacity
    alignItems: 'center',
    justifyContent: 'center',
  },

  /* Ring 2 — tengah, sedikit lebih solid */
  ringMiddle: {
    width: 100,
    height: 100,
    borderRadius: 50,
    borderWidth: 1.5,
    borderColor: COLORS.accent + '70',       // 44% opacity
    alignItems: 'center',
    justifyContent: 'center',
  },

  /* Diamond — square 45° menghasilkan bentuk berlian/hexagonal */
  diamond: {
    width: 66,
    height: 66,
    borderRadius: 10,
    backgroundColor: COLORS.secondary,
    borderWidth: 2.5,
    borderColor: COLORS.accent,
    transform: [{ rotate: '45deg' }],
    alignItems: 'center',
    justifyContent: 'center',
    // Glow effect (berfungsi di iOS; elevation di Android)
    shadowColor: COLORS.accent,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.6,
    shadowRadius: 12,
    elevation: 10,
  },

  /* Counter-rotate agar konten di dalamnya tegak */
  diamondContent: {
    transform: [{ rotate: '-45deg' }],
    alignItems: 'center',
    justifyContent: 'center',
  },

  gearIcon: {
    fontSize: 28,
    color: COLORS.white,
    lineHeight: 32,
  },
  logoTag: {
    fontSize: 9,
    color: COLORS.accent,
    fontWeight: 'bold',
    letterSpacing: 2,
    lineHeight: 12,
  },
});