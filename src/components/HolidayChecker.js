import { useState } from 'react';
import { ActivityIndicator, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { getHariLibur } from '../services/api';

const NAMA_HARI = ['Minggu','Senin','Selasa','Rabu','Kamis','Jumat','Sabtu'];
const BULAN_SHORT = ['Jan','Feb','Mar','Apr','Mei','Jun','Jul','Ags','Sep','Okt','Nov','Des'];

const LOCAL_HOLIDAYS = {
  '2026-06-15': { name: 'Hari Raya Idul Adha 1447 Hijriah', cuti: false },
  '2026-06-17': { name: 'Hari Raya Idul Adha 1447 Hijriah', cuti: false },
  '2026-06-18': { name: 'Cuti Bersama Hari Raya Idul Adha', cuti: true },
};

const toApiDate = (date) => {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
};

const isWeekend = (date) => date.getDay() === 0 || date.getDay() === 6;

export default function HolidayChecker() {
  const [date, setDate] = useState(new Date(2026, 5, 15)); // Default di-set ke 15 Jun 2026 sesuai gambar
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [source, setSource] = useState('');

  const changeDay = (delta) => {
    const next = new Date(date);
    next.setDate(next.getDate() + delta);
    setDate(next);
    setResult(null);
    setSource('');
  };

  const goToToday = () => {
    setDate(new Date());
    setResult(null);
    setSource('');
  };

  const handleCek = async () => {
    setIsLoading(true);
    setResult(null);
    setSource('');

    const dateStr = toApiDate(date);
    const month = date.getMonth() + 1;
    const year = date.getFullYear();

    if (isWeekend(date)) {
      setResult({ type: 'weekend', dayName: NAMA_HARI[date.getDay()] });
      setIsLoading(false);
      return;
    }

    try {
      const response = await getHariLibur(month, year);
      const holidays = Array.isArray(response.data) ? response.data : [];
      const found = holidays.find((h) => {
        const hDate = h.holiday_date || h.date || h.tanggal || '';
        return hDate.slice(0, 10) === dateStr;
      });

      setSource('Axios API (api-harilibur.vercel.app)');
      if (found) {
        setResult({ type: 'holiday', name: found.holiday_name || 'Hari Libur Nasional', isCuti: found.is_cuti });
      } else {
        setResult({ type: 'workday' });
      }
    } catch (err) {
      setSource('Data Lokal 2025-2026 (API offline)');
      const local = LOCAL_HOLIDAYS[dateStr];
      if (local) setResult({ type: 'holiday', name: local.name, isCuti: local.cuti });
      else setResult({ type: 'workday' });
    } finally {
      setIsLoading(false);
    }
  };

  const tgl = String(date.getDate()).padStart(2, '0');
  const bln = BULAN_SHORT[date.getMonth()];
  const thn = date.getFullYear();

  return (
    <View style={styles.card}>
      {/* HEADER */}
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <Text style={styles.iconCalendar}>📅</Text>
          <Text style={styles.headerTitle}>Cek Hari Libur Nasional</Text>
        </View>
        <View style={styles.badgeBlue}>
          <Text style={styles.badgeTextBlue}>Axios</Text>
        </View>
      </View>

      {/* NAVIGATOR TANGGAL */}
      <View style={styles.dateNav}>
        <TouchableOpacity style={styles.navBtnNavy} onPress={() => changeDay(-1)}>
          <Text style={styles.navBtnText}>‹</Text>
        </TouchableOpacity>
        
        <TouchableOpacity style={styles.dateDisplay} onPress={goToToday} activeOpacity={0.8}>
          <Text style={styles.dayText}>{NAMA_HARI[date.getDay()]},</Text>
          <Text style={styles.dateText}>{tgl} {bln} {thn}</Text>
          <View style={styles.todayBadge}>
            <Text style={styles.todayBadgeText}>HARI INI</Text>
          </View>
        </TouchableOpacity>

        <TouchableOpacity style={styles.navBtnNavy} onPress={() => changeDay(1)}>
          <Text style={styles.navBtnText}>›</Text>
        </TouchableOpacity>
      </View>

      <Text style={styles.hintText}>‹ › ganti tanggal • Ketuk tanggal → hari ini</Text>

      {/* TOMBOL CEK */}
      <TouchableOpacity style={styles.btnCheck} onPress={handleCek} disabled={isLoading} activeOpacity={0.8}>
        {isLoading ? (
          <ActivityIndicator color="#fff" />
        ) : (
          <Text style={styles.btnCheckText}>🔍 CEK HARI LIBUR</Text>
        )}
      </TouchableOpacity>

      {/* HASIL */}
      {result && (
        <View style={[styles.resultBox, result.type === 'holiday' ? styles.resultHoliday : result.type === 'workday' ? styles.resultWorkday : styles.resultWeekend]}>
          <Text style={styles.resultTitle}>
            {result.type === 'holiday' ? '⚠️ Hari Libur Nasional' : result.type === 'workday' ? '✅ Hari Kerja Normal' : '🏖️ Hari Libur Akhir Pekan'}
          </Text>
          
          {result.type === 'holiday' && (
            <Text style={styles.holidayName}>{result.name}</Text>
          )}
          
          <Text style={styles.resultDesc}>
            {result.type === 'holiday' ? 'Pertimbangkan untuk reschedule praktikum' : result.type === 'workday' ? 'Praktikum berjalan sesuai jadwal' : 'Tidak termasuk hari kerja efektif'}
          </Text>
          
          {source !== '' && (
            <View style={styles.sourceChip}>
              <Text style={styles.sourceText}>📡 {source}</Text>
            </View>
          )}
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  card: { backgroundColor: '#ffffff', borderRadius: 16, padding: 16, shadowColor: '#000', shadowOpacity: 0.05, shadowRadius: 10, elevation: 3, borderWidth: 1, borderColor: '#e2e8f0' },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 },
  headerLeft: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  iconCalendar: { fontSize: 20 },
  headerTitle: { fontSize: 16, fontWeight: 'bold', color: '#1a202c' },
  badgeBlue: { backgroundColor: '#e0f2fe', borderRadius: 12, paddingHorizontal: 12, paddingVertical: 4 },
  badgeTextBlue: { color: '#0284c7', fontSize: 11, fontWeight: 'bold' },
  
  dateNav: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 },
  navBtnNavy: { width: 44, height: 56, backgroundColor: '#0f172a', borderRadius: 8, justifyContent: 'center', alignItems: 'center' },
  navBtnText: { fontSize: 28, color: '#ffffff', marginTop: -4 },
  dateDisplay: { flex: 1, marginHorizontal: 10, backgroundColor: '#ffffff', borderRadius: 8, borderWidth: 1.5, borderColor: '#cbd5e1', alignItems: 'center', justifyContent: 'center', height: 56, position: 'relative' },
  dayText: { fontSize: 12, color: '#4a5568', fontWeight: '500' },
  dateText: { fontSize: 16, fontWeight: 'bold', color: '#0f172a' },
  todayBadge: { position: 'absolute', bottom: -10, backgroundColor: '#0284c7', paddingHorizontal: 10, paddingVertical: 2, borderRadius: 10 },
  todayBadgeText: { color: '#ffffff', fontSize: 9, fontWeight: 'bold' },
  
  hintText: { textAlign: 'center', fontSize: 11, color: '#718096', marginBottom: 16, marginTop: 8 },
  
  btnCheck: { backgroundColor: '#f97316', borderRadius: 8, paddingVertical: 14, alignItems: 'center', marginBottom: 4 },
  btnCheckText: { color: '#ffffff', fontWeight: 'bold', fontSize: 14 },
  
  resultBox: { marginTop: 12, borderRadius: 8, padding: 12, borderLeftWidth: 4 },
  resultHoliday: { backgroundColor: '#fff7ed', borderLeftColor: '#ea580c' },
  resultWorkday: { backgroundColor: '#f0fdf4', borderLeftColor: '#16a34a' },
  resultWeekend: { backgroundColor: '#f0f9ff', borderLeftColor: '#0284c7' },
  resultTitle: { fontWeight: 'bold', fontSize: 12, color: '#ea580c', marginBottom: 4 },
  holidayName: { fontWeight: 'bold', fontSize: 14, color: '#1a202c', marginBottom: 2 },
  resultDesc: { fontSize: 12, color: '#4a5568', marginBottom: 8 },
  
  sourceChip: { alignSelf: 'flex-start', backgroundColor: '#e0f2fe', borderRadius: 4, paddingHorizontal: 6, paddingVertical: 2 },
  sourceText: { fontSize: 10, color: '#0284c7', fontStyle: 'italic' }
});