import { useState, useCallback } from 'react';
import {
  View, Text, FlatList, TouchableOpacity, StyleSheet,
  TextInput, Alert, ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useFocusEffect, router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { COLORS } from '../../src/constants';
import { loadReports, makeNewReport, upsertReport, deleteReport, searchReports } from '../../src/services/reportStore';

function ReportRow({ report, onPress, onDelete }) {
  const dept = report.department || 'Unknown';
  const incNum = report.incidentNumber ? `Incident # ${report.incidentNumber}` : 'No incident number yet';
  const addr = [report.address, report.zipCode].filter(Boolean).join(' • ') || 'No location entered';
  const updated = new Date(report.updatedAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric', hour: 'numeric', minute: '2-digit' });

  return (
    <TouchableOpacity style={styles.row} onPress={onPress} onLongPress={onDelete} activeOpacity={0.8}>
      <View style={styles.rowTop}>
        <View style={{ flex: 1 }}>
          <Text style={styles.rowTitle}>{dept} Incident Report</Text>
          <Text style={styles.rowIncident}>{incNum}</Text>
        </View>
        <View style={[styles.badge, { backgroundColor: (report.isCompleted ? COLORS.green : COLORS.red) + '2E' }]}>
          <Text style={[styles.badgeText, { color: report.isCompleted ? COLORS.green : COLORS.red }]}>
            {report.isCompleted ? 'Completed' : 'Draft'}
          </Text>
        </View>
      </View>
      <Text style={styles.rowAddr}>{addr}</Text>
      <Text style={styles.rowUpdated}>Updated {updated}</Text>
    </TouchableOpacity>
  );
}

export default function ReportsScreen() {
  const [reports, setReports]   = useState([]);
  const [search, setSearch]     = useState('');
  const [loading, setLoading]   = useState(true);

  useFocusEffect(useCallback(() => {
    loadReports().then(r => { setReports(r); setLoading(false); });
  }, []));

  const handleNew = async () => {
    const report = makeNewReport();
    const updated = await upsertReport(reports, report);
    setReports(updated);
    router.push(`/report/${report.id}`);
  };

  const handleDelete = (report) => {
    Alert.alert(
      'Delete Report',
      `Delete the ${report.department} report? This cannot be undone.`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete', style: 'destructive',
          onPress: async () => {
            const updated = await deleteReport(reports, report.id);
            setReports(updated);
          },
        },
      ]
    );
  };

  const visible = searchReports(reports, search);

  return (
    <SafeAreaView style={styles.safe}>
      {/* Hero header */}
      <View style={styles.hero}>
        <View style={styles.heroContent}>
          <View style={styles.logoBox}>
            <Ionicons name="shield-half-outline" size={32} color={COLORS.gold} />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={styles.heroTitle}>Marshall County</Text>
            <Text style={styles.heroSub}>Fire Services Incident Reports</Text>
          </View>
        </View>

        <TouchableOpacity style={styles.newBtn} onPress={handleNew}>
          <Ionicons name="add-circle" size={18} color="#fff" style={{ marginRight: 6 }} />
          <Text style={styles.newBtnText}>New Report</Text>
        </TouchableOpacity>
      </View>

      {/* Search */}
      <View style={styles.searchWrap}>
        <Ionicons name="search-outline" size={18} color={COLORS.textSecondary} style={{ marginRight: 8 }} />
        <TextInput
          style={styles.searchInput}
          value={search}
          onChangeText={setSearch}
          placeholder="Search reports..."
          placeholderTextColor={COLORS.textSecondary}
        />
        {!!search && (
          <TouchableOpacity onPress={() => setSearch('')}>
            <Ionicons name="close-circle" size={18} color={COLORS.textSecondary} />
          </TouchableOpacity>
        )}
      </View>

      {loading
        ? <View style={styles.center}><ActivityIndicator color={COLORS.gold} size="large" /></View>
        : visible.length === 0
          ? <View style={styles.center}>
              <Ionicons name="document-text-outline" size={56} color={COLORS.textSecondary} />
              <Text style={styles.emptyTitle}>{search ? 'No matching reports' : 'No reports yet'}</Text>
              <Text style={styles.emptySub}>{search ? 'Try a different search' : 'Tap New Report to get started'}</Text>
            </View>
          : <FlatList
              data={visible}
              keyExtractor={r => r.id}
              contentContainerStyle={{ padding: 14 }}
              renderItem={({ item }) => (
                <ReportRow
                  report={item}
                  onPress={() => router.push(`/report/${item.id}`)}
                  onDelete={() => handleDelete(item)}
                />
              )}
              ItemSeparatorComponent={() => <View style={{ height: 10 }} />}
            />
      }
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe:         { flex: 1, backgroundColor: COLORS.background },
  hero:         { backgroundColor: COLORS.navy, padding: 16, paddingTop: 12, borderBottomLeftRadius: 0, borderBottomRightRadius: 0 },
  heroContent:  { flexDirection: 'row', alignItems: 'center', gap: 12, marginBottom: 12 },
  logoBox:      { width: 56, height: 56, borderRadius: 16, backgroundColor: 'rgba(255,255,255,0.95)', alignItems: 'center', justifyContent: 'center' },
  heroTitle:    { fontSize: 18, fontWeight: '700', color: '#fff' },
  heroSub:      { fontSize: 13, color: 'rgba(255,255,255,0.7)', marginTop: 2 },
  newBtn:       { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', backgroundColor: COLORS.red, borderRadius: 12, paddingVertical: 12 },
  newBtnText:   { color: '#fff', fontSize: 16, fontWeight: '700' },
  searchWrap:   { flexDirection: 'row', alignItems: 'center', backgroundColor: COLORS.panel, margin: 14, borderRadius: 12, paddingHorizontal: 12, paddingVertical: 10, borderWidth: 1, borderColor: COLORS.divider },
  searchInput:  { flex: 1, color: COLORS.textPrimary, fontSize: 15 },
  center:       { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 32 },
  emptyTitle:   { fontSize: 18, fontWeight: '600', color: COLORS.textPrimary, marginTop: 12 },
  emptySub:     { fontSize: 14, color: COLORS.textSecondary, marginTop: 6 },

  row:          { backgroundColor: COLORS.panel, borderRadius: 18, padding: 14, borderWidth: 1, borderColor: COLORS.divider },
  rowTop:       { flexDirection: 'row', alignItems: 'flex-start', marginBottom: 6 },
  rowTitle:     { fontSize: 15, fontWeight: '700', color: COLORS.textPrimary },
  rowIncident:  { fontSize: 13, fontWeight: '600', color: COLORS.gold, marginTop: 2 },
  badge:        { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 20, marginLeft: 8 },
  badgeText:    { fontSize: 11, fontWeight: '700' },
  rowAddr:      { fontSize: 12, color: COLORS.textSecondary, marginBottom: 4 },
  rowUpdated:   { fontSize: 11, color: `${COLORS.textSecondary}CC` },
});
