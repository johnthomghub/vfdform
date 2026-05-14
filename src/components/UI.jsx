import React from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Switch } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS } from '../constants';

// ── Section Card — matches ThemedSectionCard.swift ────────────────────────────
export function SectionCard({ title, subtitle, icon, children }) {
  return (
    <View style={styles.card}>
      <View style={styles.cardHeader}>
        <View style={styles.iconBox}>
          <Ionicons name={icon} size={18} color={COLORS.gold} />
        </View>
        <View style={{ flex: 1 }}>
          <Text style={styles.cardTitle}>{title}</Text>
          {!!subtitle && <Text style={styles.cardSubtitle}>{subtitle}</Text>}
        </View>
      </View>
      {children}
    </View>
  );
}

// ── Themed Text Input ─────────────────────────────────────────────────────────
export function ThemedInput({ label, value, onChangeText, placeholder, keyboardType, multiline, numberOfLines }) {
  return (
    <View style={styles.fieldWrap}>
      {!!label && <Text style={styles.fieldLabel}>{label}</Text>}
      <TextInput
        style={[styles.input, multiline && { height: numberOfLines ? numberOfLines * 24 + 20 : 100, textAlignVertical: 'top' }]}
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder || label}
        placeholderTextColor={COLORS.textSecondary}
        keyboardType={keyboardType || 'default'}
        multiline={multiline}
        numberOfLines={numberOfLines}
      />
    </View>
  );
}

// ── Toggle Row — for equipment and incident types ─────────────────────────────
export function ToggleRow({ label, icon, value, onToggle, last }) {
  return (
    <TouchableOpacity
      style={[styles.toggleRow, !last && styles.toggleRowBorder]}
      onPress={() => onToggle(!value)}
      activeOpacity={0.7}
    >
      {!!icon && (
        <Ionicons name={icon} size={16} color={value ? COLORS.gold : COLORS.textSecondary} style={{ marginRight: 10 }} />
      )}
      <Text style={[styles.toggleLabel, value && { color: COLORS.textPrimary }]}>{label}</Text>
      <Switch
        value={value}
        onValueChange={onToggle}
        trackColor={{ false: COLORS.divider, true: COLORS.red }}
        thumbColor={value ? COLORS.gold : '#f4f3f4'}
        style={{ transform: [{ scale: 0.85 }] }}
      />
    </TouchableOpacity>
  );
}

// ── Personnel Chip ─────────────────────────────────────────────────────────────
export function PersonnelChip({ id, selected, onToggle }) {
  return (
    <TouchableOpacity
      style={[styles.chip, selected && styles.chipSelected]}
      onPress={() => onToggle(id)}
    >
      <Text style={[styles.chipText, selected && styles.chipTextSelected]}>{id}</Text>
    </TouchableOpacity>
  );
}

// ── Labeled Value Row ─────────────────────────────────────────────────────────
export function LabeledValue({ label, value }) {
  return (
    <View style={styles.labeledRow}>
      <Text style={styles.fieldLabel}>{label}</Text>
      <Text style={styles.labeledValue}>{value || '—'}</Text>
    </View>
  );
}

// ── Section Divider ───────────────────────────────────────────────────────────
export function Divider() {
  return <View style={styles.divider} />;
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: COLORS.panelAlt,
    borderRadius: 22,
    padding: 18,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: `${COLORS.gold}1A`,
    shadowColor: '#000',
    shadowOpacity: 0.22,
    shadowRadius: 18,
    shadowOffset: { width: 0, height: 12 },
    elevation: 8,
  },
  cardHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 14, gap: 12 },
  iconBox: {
    width: 42, height: 42, borderRadius: 14,
    backgroundColor: `${COLORS.red}24`,
    borderWidth: 1, borderColor: `${COLORS.gold}40`,
    alignItems: 'center', justifyContent: 'center',
  },
  cardTitle: { fontSize: 15, fontWeight: '700', color: COLORS.textPrimary },
  cardSubtitle: { fontSize: 11, color: COLORS.textSecondary, marginTop: 2 },

  fieldWrap: { marginBottom: 10 },
  fieldLabel: { fontSize: 12, fontWeight: '600', color: COLORS.textSecondary, marginBottom: 4 },
  input: {
    backgroundColor: COLORS.inputFill,
    borderWidth: 1, borderColor: COLORS.divider,
    borderRadius: 14, paddingHorizontal: 14, paddingVertical: 11,
    color: COLORS.textPrimary, fontSize: 15,
  },

  toggleRow: {
    flexDirection: 'row', alignItems: 'center',
    paddingVertical: 12, paddingHorizontal: 14,
  },
  toggleRowBorder: { borderBottomWidth: 1, borderBottomColor: COLORS.divider },
  toggleLabel: { flex: 1, fontSize: 15, color: COLORS.textSecondary },

  chip: {
    paddingHorizontal: 12, paddingVertical: 8,
    borderRadius: 10, margin: 3,
    backgroundColor: COLORS.inputFill,
    borderWidth: 1, borderColor: COLORS.divider,
  },
  chipSelected: { backgroundColor: `${COLORS.red}33`, borderColor: COLORS.red },
  chipText: { fontSize: 13, color: COLORS.textSecondary, fontWeight: '500' },
  chipTextSelected: { color: COLORS.textPrimary, fontWeight: '700' },

  labeledRow: { marginBottom: 8 },
  labeledValue: { fontSize: 15, color: COLORS.textPrimary },

  divider: { height: 1, backgroundColor: COLORS.divider, marginVertical: 8 },
});
