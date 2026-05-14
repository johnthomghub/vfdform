import AsyncStorage from '@react-native-async-storage/async-storage';

const STORAGE_KEY = 'MarshallCOVFD.Reports';

export function makeNewReport() {
  return {
    id: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    department: '600- Mt. Pleasant',
    incidentNumber: '',
    incidentDate: new Date().toISOString(),
    callTime: new Date().toISOString(),
    onSceneTime: new Date().toISOString(),
    backInServiceTime: new Date().toISOString(),
    address: '',
    zipCode: '',
    intersection: '',
    incidentTypes: [],
    occupantName: '',
    occupantAddress: '',
    occupantPhone: '',
    occupantState: 'MS',
    occupantZip: '',
    insuranceName: '',
    insurancePhone: '',
    insurancePolicyNumber: '',
    vehicleMake: '',
    vehicleModel: '',
    vehicleYear: '',
    vehicleVIN: '',
    vehicleTag: '',
    acresBurned: '',
    selectedEquipment: [],
    selectedPersonnel: [],
    narrative: '',
    signatureData: null,
    isCompleted: false,
  };
}

export async function loadReports() {
  try {
    const raw = await AsyncStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const reports = JSON.parse(raw);
    return reports.sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt));
  } catch (e) {
    console.error('Failed to load reports:', e);
    return [];
  }
}

export async function saveReports(reports) {
  try {
    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(reports));
  } catch (e) {
    console.error('Failed to save reports:', e);
  }
}

export async function upsertReport(reports, report) {
  const updated = { ...report, updatedAt: new Date().toISOString() };
  const idx = reports.findIndex(r => r.id === updated.id);
  let newList;
  if (idx >= 0) {
    newList = [...reports];
    newList[idx] = updated;
  } else {
    newList = [updated, ...reports];
  }
  newList.sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt));
  await saveReports(newList);
  return newList;
}

export async function deleteReport(reports, reportId) {
  const newList = reports.filter(r => r.id !== reportId);
  await saveReports(newList);
  return newList;
}

export function searchReports(reports, query) {
  const q = query.trim().toLowerCase();
  if (!q) return reports;
  return reports.filter(r => {
    const text = [
      r.department, r.incidentNumber, r.address, r.zipCode,
      r.intersection, r.occupantName, r.occupantPhone,
      r.narrative, ...(r.incidentTypes || []),
    ].join(' ').toLowerCase();
    return text.includes(q);
  });
}
