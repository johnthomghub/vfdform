import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, DEPARTMENTS } from '../../src/constants';

export default function AboutScreen() {
  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView contentContainerStyle={{ padding: 20 }}>
        <View style={styles.hero}>
          <View style={styles.logoBox}>
            <Ionicons name="shield-half-outline" size={48} color={COLORS.gold} />
          </View>
          <Text style={styles.title}>Marshall County</Text>
          <Text style={styles.subtitle}>Fire Services</Text>
          <Text style={styles.version}>Incident Report System · v1.0</Text>
        </View>

        <View style={styles.card}>
          <Text style={styles.cardTitle}>Departments</Text>
          {DEPARTMENTS.map(dept => (
            <View key={dept.id} style={styles.deptRow}>
              <Ionicons name="flame-outline" size={14} color={COLORS.red} style={{ marginRight: 8 }} />
              <Text style={styles.deptText}>{dept.label}</Text>
            </View>
          ))}
        </View>

        <View style={styles.card}>
          <Text style={styles.cardTitle}>Instructions</Text>
          {[
            'Tap "New Report" to start a new incident report',
            'Select your department first to load correct personnel and equipment',
            'Long-press a report in the list to delete it',
            'Tap "Share PDF" inside a report to export and share',
            'Mark a report Complete when all fields are filled',
          ].map((tip, i) => (
            <View key={i} style={styles.tipRow}>
              <View style={styles.tipNum}><Text style={styles.tipNumText}>{i + 1}</Text></View>
              <Text style={styles.tipText}>{tip}</Text>
            </View>
          ))}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe:       { flex: 1, backgroundColor: COLORS.background },
  hero:       { alignItems: 'center', marginBottom: 24, paddingVertical: 24 },
  logoBox:    { width: 90, height: 90, borderRadius: 24, backgroundColor: 'rgba(255,255,255,0.95)', alignItems: 'center', justifyContent: 'center', marginBottom: 16 },
  title:      { fontSize: 26, fontWeight: '700', color: COLORS.textPrimary },
  subtitle:   { fontSize: 16, color: COLORS.gold, marginTop: 4 },
  version:    { fontSize: 12, color: COLORS.textSecondary, marginTop: 8 },
  card:       { backgroundColor: COLORS.panel, borderRadius: 18, padding: 16, marginBottom: 16, borderWidth: 1, borderColor: COLORS.divider },
  cardTitle:  { fontSize: 15, fontWeight: '700', color: COLORS.gold, marginBottom: 12 },
  deptRow:    { flexDirection: 'row', alignItems: 'center', paddingVertical: 6, borderBottomWidth: 1, borderBottomColor: COLORS.divider },
  deptText:   { fontSize: 14, color: COLORS.textPrimary },
  tipRow:     { flexDirection: 'row', alignItems: 'flex-start', marginBottom: 10, gap: 10 },
  tipNum:     { width: 22, height: 22, borderRadius: 11, backgroundColor: COLORS.red, alignItems: 'center', justifyContent: 'center', flexShrink: 0, marginTop: 1 },
  tipNumText: { fontSize: 12, fontWeight: '700', color: '#fff' },
  tipText:    { flex: 1, fontSize: 14, color: COLORS.textPrimary, lineHeight: 20 },
});
