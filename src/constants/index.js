// Marshall County VFD — App Theme
// Matches AppTheme.swift from the original iOS app exactly

export const COLORS = {
  background:   '#0D1117',   // AppTheme.background
  panel:        '#161C26',   // AppTheme.panel
  panelAlt:     '#1E2430',   // AppTheme.panelAlt
  navy:         '#1A2849',   // AppTheme.navy
  red:          '#D42E31',   // AppTheme.red
  gold:         '#D6BD8A',   // AppTheme.gold
  textPrimary:  '#FFFFFF',
  textSecondary:'rgba(255,255,255,0.70)',
  divider:      'rgba(255,255,255,0.10)',
  inputFill:    'rgba(255,255,255,0.06)',
  green:        '#4CAF50',
};

// Departments — matches Department.swift
export const DEPARTMENTS = [
  { id: '100- Potts Camp',  label: '100- Potts Camp',  personnelBase: 100, equipment: ['E-1','P-1','T-1','R-1','P.O.V.'] },
  { id: '200- Barton',      label: '200- Barton',      personnelBase: 200, equipment: ['E-2','P-2','Res-2','BT-2','SQD-2','P.O.V.'] },
  { id: '300- Watson',      label: '300- Watson',      personnelBase: 300, equipment: ['E-3','P-3','BT-3','P.O.V.'] },
  { id: '400- Red Banks',   label: '400- Red Banks',   personnelBase: 400, equipment: ['E-4','BT-4','R-4','P.O.V.'] },
  { id: '500- Whytt',       label: '500- Whytt',       personnelBase: 500, equipment: ['P-5','E-51','E-52','T-5','BT-5','R-5','P.O.V.'] },
  { id: '600- Mt. Pleasant',label: '600- Mt. Pleasant',personnelBase: 600, equipment: ['E-61','E-62','T-61','SQ-61','R-61','P.O.V.'] },
  { id: '700- Victoria',    label: '700- Victoria',    personnelBase: 700, equipment: ['E-7','P-7','BT-7','R-7','P.O.V.'] },
  { id: '800- Cayce',       label: '800- Cayce',       personnelBase: 800, equipment: ['E-8','P-8','T-8','BT-8','R-8','P.O.V.'] },
  { id: '900- Byhalia',     label: '900- Byhalia',     personnelBase: 900, equipment: ['P-9','E-9','BT-9','R-9','P.O.V.'] },
  { id: '1200- Waterford',  label: '1200- Waterford',  personnelBase: 1200,equipment: ['P-12','E-12','BT-12','P.O.V.'] },
];

export const INCIDENT_TYPES = [
  { id: 'Structure Fire',  icon: 'home' },
  { id: 'Vehicle Fire',    icon: 'car' },
  { id: 'Grass Fire',      icon: 'leaf' },
  { id: 'MVA',             icon: 'warning' },
  { id: 'Fire Alarm',      icon: 'notifications' },
  { id: 'Mutual Aide',     icon: 'people' },
  { id: 'Medical Assist',  icon: 'add-circle' },
  { id: 'Other',           icon: 'ellipsis-horizontal-circle' },
];

export function getPersonnelIDs(dept) {
  const base = dept?.personnelBase || 600;
  return Array.from({ length: 30 }, (_, i) => String(base + i + 1));
}

export function getDepartment(id) {
  return DEPARTMENTS.find(d => d.id === id) || DEPARTMENTS[5];
}
