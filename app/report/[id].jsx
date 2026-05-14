import { useState, useCallback, useRef } from 'react';
import {
  View, Text, ScrollView, TouchableOpacity, StyleSheet,
  Alert, ActivityIndicator, Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLocalSearchParams, router, useFocusEffect } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import SignatureCanvas from 'react-native-signature-canvas';
import {
  COLORS, DEPARTMENTS, INCIDENT_TYPES,
  getPersonnelIDs, getDepartment,
} from '../../src/constants';
import {
  SectionCard, ThemedInput, ToggleRow, PersonnelChip, LabeledValue,
} from '../../src/components/UI';
import {
  loadReports, upsertReport,
} from '../../src/services/reportStore';
import { sharePDF } from '../../src/services/pdfService';

// ── Date / Time Helpers ───────────────────────────────────────────────────────
function fmtDate(iso) {
  if (!iso) return '';
  return new Date(iso).toLocaleDateString('en-US', { month: '2-digit', day: '2-digit', year: 'numeric' });
}
function fmtTime(iso) {
  if (!iso) return '';
  return new Date(iso).toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit', hour12: false });
}

// Simple date/time picker using Alert on Android (expo-datetime-picker alternative)
function DateTimeButton({ label, value, mode, onChange }) {
  const display = mode === 'time' ? fmtTime(value) : fmtDate(value);
  const handlePress = () => {
    // On Android, we use a simple approach — instruct user
    // For production: integrate @react-native-community/datetimepicker
    Alert.prompt
      ? Alert.prompt(`Enter ${label}`, mode === 'time' ? 'HH:MM (24hr)' : 'MM/DD/YYYY',
          (text) => {
            // Parse and call onChange
            const d = new Date(value);
            if (mode === 'time' && /^\d{1,2}:\d{2}$/.test(text)) {
              const [h, m] = text.split(':');
              d.setHours(parseInt(h), parseInt(m));
              onChange(d.toISOString());
            } else if (mode === 'date') {
              const parsed = new Date(text);
              if (!isNaN(parsed)) onChange(parsed.toISOString());
            }
          }, 'plain-text', display)
      : Alert.alert(`${label}: ${display}`, 'Use the date/time field below to edit.', [{ text: 'OK' }]);
  };

  return (
    <TouchableOpacity style={styles.dtBtn} onPress={handlePress}>
      <Text style={styles.dtLabel}>{label}</Text>
      <Text style={styles.dtValue}>{display || '—'}</Text>
      <Ionicons name={mode === 'time' ? 'time-outline' : 'calendar-outline'} size={16} color={COLORS.textSecondary} />
    </TouchableOpacity>
  );
}

// ── Main Screen ───────────────────────────────────────────────────────────────
export default function ReportScreen() {
  const { id } = useLocalSearchParams();
  const [report, setReport]     = useState(null);
  const [reports, setReports]   = useState([]);
  const [saving, setSaving]     = useState(false);
  const [sharing, setSharing]   = useState(false);
  const [tab, setTab]           = useState('form'); // 'form' | 'review'
  const sigRef = useRef(null);

  useFocusEffect(useCallback(() => {
    loadReports().then(all => {
      setReports(all);
      const found = all.find(r => r.id === id);
      if (found) setReport(found);
    });
  }, [id]));

  if (!report) {
    return <View style={styles.center}><ActivityIndicator color={COLORS.gold} size="large" /></View>;
  }

  const update = (changes) => setReport(prev => ({ ...prev, ...changes }));

  const dept = getDepartment(report.department);
  const personnelIDs = getPersonnelIDs(dept);

  const handleSave = async (closeAfter = false) => {
    setSaving(true);
    const updated = await upsertReport(reports, report);
    setReports(updated);
    setSaving(false);
    if (closeAfter) router.back();
  };

  const handleComplete = async () => {
    const nextVal = !report.isCompleted;
    update({ isCompleted: nextVal });
    const updatedReport = { ...report, isCompleted: nextVal };
    const updatedList = await upsertReport(reports, updatedReport);
    setReports(updatedList);
    if (nextVal) router.back();
  };

  const handleShare = async () => {
    setSharing(true);
    await handleSave(false);
    const result = await sharePDF(report);
    setSharing(false);
    if (!result.success) Alert.alert('Export Failed', result.error || 'Could not generate PDF.');
  };

  const toggleIncidentType = (type) => {
    const types = report.incidentTypes || [];
    const next = types.includes(type) ? types.filter(t => t !== type) : [...types, type];
    update({ incidentTypes: next });
  };

  const toggleEquipment = (eq) => {
    const sel = report.selectedEquipment || [];
    const next = sel.includes(eq) ? sel.filter(e => e !== eq) : [...sel, eq];
    update({ selectedEquipment: next });
  };

  const togglePersonnel = (id) => {
    const sel = report.selectedPersonnel || [];
    const next = sel.includes(id) ? sel.filter(p => p !== id) : [...sel, id];
    update({ selectedPersonnel: next });
  };

  const handleSignature = (sig) => {
    update({ signatureData: sig });
  };

  const handleClearSignature = () => {
    sigRef.current?.clearSignature();
    update({ signatureData: null });
  };

  return (
    <SafeAreaView style={styles.safe} edges={['bottom']}>
      {/* Header bar */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.headerBtn} onPress={() => router.back()}>
          <Ionicons name="chevron-back" size={16} color={COLORS.textSecondary} />
          <Text style={styles.headerBtnText}>Close</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.headerBtn} onPress={() => handleSave(false)} disabled={saving}>
          {saving
            ? <ActivityIndicator size="small" color={COLORS.gold} />
            : <>
                <Ionicons name="save-outline" size={16} color={COLORS.textSecondary} />
                <Text style={styles.headerBtnText}>Save</Text>
              </>
          }
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.headerBtn, styles.headerBtnProminent, { borderColor: (report.isCompleted ? COLORS.green : COLORS.gold) + '70' }]}
          onPress={handleComplete}
        >
          <Ionicons name="checkmark-circle" size={16} color={report.isCompleted ? COLORS.green : COLORS.gold} />
          <Text style={[styles.headerBtnText, { color: report.isCompleted ? COLORS.green : COLORS.gold }]}>
            {report.isCompleted ? 'Completed' : 'Complete'}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.headerBtn, styles.headerBtnProminent, { borderColor: COLORS.red + '70' }]}
          onPress={handleShare}
          disabled={sharing}
        >
          {sharing
            ? <ActivityIndicator size="small" color={COLORS.red} />
            : <>
                <Ionicons name="share-outline" size={16} color={COLORS.red} />
                <Text style={[styles.headerBtnText, { color: COLORS.red }]}>Share</Text>
              </>
          }
        </TouchableOpacity>
      </View>

      {/* Department + status row */}
      <View style={styles.subHeader}>
        <Text style={styles.subHeaderTitle} numberOfLines={1}>{report.department} Incident Report</Text>
        <View style={[styles.badge, { backgroundColor: (report.isCompleted ? COLORS.green : COLORS.red) + '2E' }]}>
          <Text style={[styles.badgeText, { color: report.isCompleted ? COLORS.green : COLORS.red }]}>
            {report.isCompleted ? 'Completed' : 'Draft'}
          </Text>
        </View>
      </View>

      {/* Form / Review tabs */}
      <View style={styles.tabRow}>
        <TouchableOpacity style={[styles.tab, tab === 'form' && styles.tabActive]} onPress={() => setTab('form')}>
          <Text style={[styles.tabText, tab === 'form' && styles.tabTextActive]}>Form</Text>
        </TouchableOpacity>
        <TouchableOpacity style={[styles.tab, tab === 'review' && styles.tabActive]} onPress={() => setTab('review')}>
          <Text style={[styles.tabText, tab === 'review' && styles.tabTextActive]}>Review</Text>
        </TouchableOpacity>
      </View>

      {tab === 'form' ? (
        <ScrollView contentContainerStyle={styles.formScroll} keyboardShouldPersistTaps="handled">

          {/* Department / Header */}
          <SectionCard title="Department / Header" icon="business-outline">
            <View style={styles.pickerWrap}>
              <Text style={styles.pickerLabel}>Department</Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginBottom: 10 }}>
                {DEPARTMENTS.map(d => (
                  <TouchableOpacity
                    key={d.id}
                    style={[styles.deptChip, report.department === d.id && styles.deptChipActive]}
                    onPress={() => {
                      update({ department: d.id, selectedEquipment: [], selectedPersonnel: [] });
                    }}
                  >
                    <Text style={[styles.deptChipText, report.department === d.id && styles.deptChipTextActive]}>
                      {d.label}
                    </Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </View>
            <ThemedInput label="Incident Number" value={report.incidentNumber} onChangeText={v => update({ incidentNumber: v })} />
          </SectionCard>

          {/* Date & Times */}
          <SectionCard title="Date & Times" icon="time-outline">
            <DateTimeButton label="Incident Date" value={report.incidentDate} mode="date" onChange={v => update({ incidentDate: v })} />
            <DateTimeButton label="Call Time" value={report.callTime} mode="time" onChange={v => update({ callTime: v })} />
            <DateTimeButton label="On Scene" value={report.onSceneTime} mode="time" onChange={v => update({ onSceneTime: v })} />
            <DateTimeButton label="Back In Service" value={report.backInServiceTime} mode="time" onChange={v => update({ backInServiceTime: v })} />
          </SectionCard>

          {/* Location */}
          <SectionCard title="Incident Address / Location" icon="map-outline">
            <ThemedInput label="Address" value={report.address} onChangeText={v => update({ address: v })} />
            <ThemedInput label="ZIP Code" value={report.zipCode} onChangeText={v => update({ zipCode: v })} keyboardType="numeric" />
            <ThemedInput label="Intersection" value={report.intersection} onChangeText={v => update({ intersection: v })} />
          </SectionCard>

          {/* Incident Type */}
          <SectionCard title="Incident Type" icon="flame-outline">
            <View style={styles.toggleContainer}>
              {INCIDENT_TYPES.map((t, i) => (
                <ToggleRow
                  key={t.id}
                  label={t.id}
                  icon={`${t.icon}-outline`}
                  value={(report.incidentTypes || []).includes(t.id)}
                  onToggle={() => toggleIncidentType(t.id)}
                  last={i === INCIDENT_TYPES.length - 1}
                />
              ))}
            </View>
          </SectionCard>

          {/* Occupant */}
          <SectionCard title="Patient / Owner / Occupant" icon="person-outline">
            <ThemedInput label="Name" value={report.occupantName} onChangeText={v => update({ occupantName: v })} />
            <ThemedInput label="Address" value={report.occupantAddress} onChangeText={v => update({ occupantAddress: v })} />
            <ThemedInput label="Phone #" value={report.occupantPhone} onChangeText={v => update({ occupantPhone: v })} keyboardType="phone-pad" />
            <ThemedInput label="State" value={report.occupantState} onChangeText={v => update({ occupantState: v })} />
            <ThemedInput label="ZIP" value={report.occupantZip} onChangeText={v => update({ occupantZip: v })} keyboardType="numeric" />
          </SectionCard>

          {/* Insurance */}
          <SectionCard title="Insurance" icon="document-text-outline">
            <ThemedInput label="Company Name" value={report.insuranceName} onChangeText={v => update({ insuranceName: v })} />
            <ThemedInput label="Phone #" value={report.insurancePhone} onChangeText={v => update({ insurancePhone: v })} keyboardType="phone-pad" />
            <ThemedInput label="Policy #" value={report.insurancePolicyNumber} onChangeText={v => update({ insurancePolicyNumber: v })} />
          </SectionCard>

          {/* Vehicle */}
          <SectionCard title="Vehicle / Heavy Equipment" icon="car-outline">
            <ThemedInput label="Make" value={report.vehicleMake} onChangeText={v => update({ vehicleMake: v })} />
            <ThemedInput label="Model" value={report.vehicleModel} onChangeText={v => update({ vehicleModel: v })} />
            <ThemedInput label="Year" value={report.vehicleYear} onChangeText={v => update({ vehicleYear: v })} keyboardType="numeric" />
            <ThemedInput label="VIN #" value={report.vehicleVIN} onChangeText={v => update({ vehicleVIN: v })} />
            <ThemedInput label="Tag" value={report.vehicleTag} onChangeText={v => update({ vehicleTag: v })} />
          </SectionCard>

          {/* Grass Fire */}
          <SectionCard title="Grass Fire" icon="leaf-outline">
            <ThemedInput label="Acres Burned" value={report.acresBurned} onChangeText={v => update({ acresBurned: v })} keyboardType="decimal-pad" />
          </SectionCard>

          {/* Equipment */}
          <SectionCard title="Responding Equipment" icon="car-sport-outline">
            <View style={styles.toggleContainer}>
              {(dept?.equipment || []).map((eq, i) => (
                <ToggleRow
                  key={eq}
                  label={eq}
                  value={(report.selectedEquipment || []).includes(eq)}
                  onToggle={() => toggleEquipment(eq)}
                  last={i === (dept?.equipment || []).length - 1}
                />
              ))}
            </View>
          </SectionCard>

          {/* Personnel */}
          <SectionCard
            title="Personnel"
            subtitle={`${personnelIDs[0]}–${personnelIDs[personnelIDs.length - 1]}`}
            icon="people-outline"
          >
            <View style={styles.personnelGrid}>
              {personnelIDs.map(pid => (
                <PersonnelChip
                  key={pid}
                  id={pid}
                  selected={(report.selectedPersonnel || []).includes(pid)}
                  onToggle={togglePersonnel}
                />
              ))}
            </View>
          </SectionCard>

          {/* Narrative */}
          <SectionCard title="Complete Narrative" icon="text-outline">
            <ThemedInput
              label="Narrative"
              value={report.narrative}
              onChangeText={v => update({ narrative: v })}
              multiline
              numberOfLines={8}
            />
          </SectionCard>

          {/* Signature */}
          <SectionCard title="Officer Signature" icon="create-outline">
            <Text style={styles.sigHint}>Use your finger to sign below.</Text>
            <View style={styles.sigContainer}>
              <SignatureCanvas
                ref={sigRef}
                onOK={handleSignature}
                onEmpty={() => update({ signatureData: null })}
                backgroundColor={COLORS.inputFill}
                penColor={COLORS.gold}
                webStyle={`.m-signature-pad { background: ${COLORS.inputFill}; border: none; } .m-signature-pad--footer { display: none; }`}
                style={{ flex: 1 }}
              />
            </View>
            <TouchableOpacity style={styles.clearSigBtn} onPress={handleClearSignature}>
              <Ionicons name="trash-outline" size={14} color={COLORS.red} style={{ marginRight: 4 }} />
              <Text style={{ color: COLORS.red, fontSize: 13 }}>Clear Signature</Text>
            </TouchableOpacity>
            {!!report.signatureData && (
              <Text style={styles.sigConfirm}>✓ Signature captured</Text>
            )}
          </SectionCard>

          <View style={{ height: 40 }} />
        </ScrollView>
      ) : (
        // Review tab
        <ScrollView contentContainerStyle={styles.formScroll}>
          <SectionCard title="Report Summary" icon="eye-outline">
            <LabeledValue label="Department" value={report.department} />
            <LabeledValue label="Incident #" value={report.incidentNumber} />
            <LabeledValue label="Status" value={report.isCompleted ? 'Completed' : 'Draft'} />
            <LabeledValue label="Incident Date" value={fmtDate(report.incidentDate)} />
            <LabeledValue label="Call Time" value={fmtTime(report.callTime)} />
            <LabeledValue label="On Scene" value={fmtTime(report.onSceneTime)} />
            <LabeledValue label="Back In Service" value={fmtTime(report.backInServiceTime)} />
          </SectionCard>

          <SectionCard title="Location" icon="map-outline">
            <LabeledValue label="Address" value={report.address} />
            <LabeledValue label="ZIP Code" value={report.zipCode} />
            <LabeledValue label="Intersection" value={report.intersection} />
          </SectionCard>

          <SectionCard title="Incident Types" icon="flame-outline">
            <LabeledValue label="Types" value={(report.incidentTypes || []).join(', ') || 'None selected'} />
          </SectionCard>

          <SectionCard title="Occupant" icon="person-outline">
            <LabeledValue label="Name" value={report.occupantName} />
            <LabeledValue label="Phone" value={report.occupantPhone} />
            <LabeledValue label="Address" value={report.occupantAddress} />
            <LabeledValue label="State" value={report.occupantState} />
            <LabeledValue label="ZIP" value={report.occupantZip} />
          </SectionCard>

          <SectionCard title="Insurance" icon="document-text-outline">
            <LabeledValue label="Company" value={report.insuranceName} />
            <LabeledValue label="Phone" value={report.insurancePhone} />
            <LabeledValue label="Policy #" value={report.insurancePolicyNumber} />
          </SectionCard>

          <SectionCard title="Vehicle" icon="car-outline">
            <LabeledValue label="Make" value={report.vehicleMake} />
            <LabeledValue label="Model" value={report.vehicleModel} />
            <LabeledValue label="Year" value={report.vehicleYear} />
            <LabeledValue label="VIN" value={report.vehicleVIN} />
            <LabeledValue label="Tag" value={report.vehicleTag} />
          </SectionCard>

          <SectionCard title="Grass Fire" icon="leaf-outline">
            <LabeledValue label="Acres Burned" value={report.acresBurned} />
          </SectionCard>

          <SectionCard title="Equipment" icon="car-sport-outline">
            <LabeledValue label="Responding" value={(report.selectedEquipment || []).join(', ') || 'None'} />
          </SectionCard>

          <SectionCard title="Personnel" icon="people-outline">
            <LabeledValue label="On Scene" value={(report.selectedPersonnel || []).join(', ') || 'None'} />
          </SectionCard>

          <SectionCard title="Narrative" icon="text-outline">
            <Text style={styles.narrativeText}>{report.narrative || 'No narrative entered.'}</Text>
          </SectionCard>

          <SectionCard title="Signature" icon="create-outline">
            <LabeledValue label="Officer Signature" value={report.signatureData ? 'Captured ✓' : 'Not signed'} />
          </SectionCard>

          <TouchableOpacity style={styles.shareBtn} onPress={handleShare} disabled={sharing}>
            {sharing
              ? <ActivityIndicator color="#fff" />
              : <>
                  <Ionicons name="share-outline" size={18} color="#fff" style={{ marginRight: 8 }} />
                  <Text style={styles.shareBtnText}>Export & Share PDF</Text>
                </>
            }
          </TouchableOpacity>

          <View style={{ height: 40 }} />
        </ScrollView>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe:         { flex: 1, backgroundColor: COLORS.background },
  center:       { flex: 1, alignItems: 'center', justifyContent: 'center' },
  header:       { flexDirection: 'row', alignItems: 'center', gap: 6, padding: 10, backgroundColor: COLORS.panel, borderBottomWidth: 1, borderBottomColor: `${COLORS.gold}2E` },
  headerBtn:    { flexDirection: 'row', alignItems: 'center', gap: 4, paddingHorizontal: 10, paddingVertical: 7, backgroundColor: COLORS.inputFill, borderRadius: 10, borderWidth: 1, borderColor: COLORS.divider },
  headerBtnProminent: { borderColor: `${COLORS.gold}40` },
  headerBtnText: { fontSize: 13, color: COLORS.textSecondary, fontWeight: '500' },
  subHeader:    { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 14, paddingVertical: 8, backgroundColor: COLORS.panel },
  subHeaderTitle: { flex: 1, fontSize: 14, fontWeight: '600', color: COLORS.textPrimary },
  badge:        { paddingHorizontal: 10, paddingVertical: 3, borderRadius: 20 },
  badgeText:    { fontSize: 11, fontWeight: '700' },
  tabRow:       { flexDirection: 'row', backgroundColor: COLORS.background, paddingHorizontal: 14, paddingVertical: 8, gap: 8 },
  tab:          { flex: 1, paddingVertical: 8, borderRadius: 10, alignItems: 'center', backgroundColor: COLORS.inputFill },
  tabActive:    { backgroundColor: COLORS.red },
  tabText:      { fontSize: 14, fontWeight: '600', color: COLORS.textSecondary },
  tabTextActive: { color: '#fff' },
  formScroll:   { padding: 14 },
  pickerWrap:   { marginBottom: 12 },
  pickerLabel:  { fontSize: 12, fontWeight: '600', color: COLORS.textSecondary, marginBottom: 6 },
  deptChip:     { paddingHorizontal: 12, paddingVertical: 8, borderRadius: 10, backgroundColor: COLORS.inputFill, borderWidth: 1, borderColor: COLORS.divider, marginRight: 8 },
  deptChipActive: { backgroundColor: `${COLORS.red}33`, borderColor: COLORS.red },
  deptChipText: { fontSize: 13, color: COLORS.textSecondary, fontWeight: '500' },
  deptChipTextActive: { color: COLORS.textPrimary, fontWeight: '700' },
  toggleContainer: { backgroundColor: COLORS.inputFill, borderRadius: 14, borderWidth: 1, borderColor: COLORS.divider, overflow: 'hidden' },
  personnelGrid: { flexDirection: 'row', flexWrap: 'wrap' },
  dtBtn:        { flexDirection: 'row', alignItems: 'center', backgroundColor: COLORS.inputFill, borderRadius: 12, paddingHorizontal: 14, paddingVertical: 11, marginBottom: 10, borderWidth: 1, borderColor: COLORS.divider },
  dtLabel:      { fontSize: 13, color: COLORS.textSecondary, width: 110 },
  dtValue:      { flex: 1, fontSize: 15, color: COLORS.textPrimary, fontWeight: '500' },
  sigHint:      { fontSize: 13, color: COLORS.textSecondary, marginBottom: 10 },
  sigContainer: { height: 200, borderRadius: 14, overflow: 'hidden', borderWidth: 1, borderColor: COLORS.divider, marginBottom: 10 },
  clearSigBtn:  { flexDirection: 'row', alignItems: 'center', alignSelf: 'flex-start', padding: 6 },
  sigConfirm:   { fontSize: 13, color: COLORS.green, marginTop: 4 },
  narrativeText: { fontSize: 14, color: COLORS.textPrimary, lineHeight: 22 },
  shareBtn:     { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', backgroundColor: COLORS.red, borderRadius: 14, paddingVertical: 16, marginTop: 8 },
  shareBtnText: { color: '#fff', fontSize: 16, fontWeight: '700' },
});
