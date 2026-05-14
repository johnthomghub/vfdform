import * as Print from 'expo-print';
import * as Sharing from 'expo-sharing';
import { getDepartment } from '../constants';

function fmt(val) { return val || ''; }
function fmtDate(iso) {
  if (!iso) return '';
  try {
    return new Date(iso).toLocaleDateString('en-US', { month: '2-digit', day: '2-digit', year: 'numeric' });
  } catch { return iso; }
}
function fmtTime(iso) {
  if (!iso) return '';
  try {
    return new Date(iso).toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit', hour12: false });
  } catch { return iso; }
}

function checkRow(label, checked) {
  return `<tr>
    <td style="padding:4px 8px; border:1px solid #ccc;">${label}</td>
    <td style="padding:4px 8px; border:1px solid #ccc; text-align:center;">${checked ? '✓' : ''}</td>
  </tr>`;
}

export function generateHTML(report) {
  const dept = getDepartment(report.department);
  const personnel = (report.selectedPersonnel || []).join(', ');
  const equipment = (report.selectedEquipment || []).join(', ');
  const incidentTypes = (report.incidentTypes || []).join(', ');

  return `<!DOCTYPE html>
<html>
<head>
<meta charset="UTF-8">
<style>
  body { font-family: Arial, sans-serif; font-size: 12px; margin: 0; padding: 20px; color: #111; }
  h1 { text-align: center; font-size: 18px; margin: 0 0 4px; }
  h2 { text-align: center; font-size: 14px; margin: 0 0 16px; color: #444; }
  .header { text-align: center; margin-bottom: 16px; border-bottom: 2px solid #D42E31; padding-bottom: 12px; }
  .section { margin-bottom: 14px; }
  .section-title { background: #D42E31; color: white; padding: 4px 8px; font-weight: bold; font-size: 11px; text-transform: uppercase; margin-bottom: 0; }
  table { width: 100%; border-collapse: collapse; }
  td, th { padding: 5px 8px; border: 1px solid #ccc; vertical-align: top; }
  th { background: #f0f0f0; font-weight: bold; text-align: left; }
  .label { font-weight: bold; width: 35%; }
  .value { width: 65%; }
  .narrative { min-height: 80px; white-space: pre-wrap; }
  .sig-box { height: 80px; border: 1px solid #ccc; }
  .completed-badge { display: inline-block; background: #4CAF50; color: white; padding: 2px 10px; border-radius: 10px; font-size: 11px; }
  .draft-badge { display: inline-block; background: #D42E31; color: white; padding: 2px 10px; border-radius: 10px; font-size: 11px; }
  .footer { text-align: center; font-size: 10px; color: #888; margin-top: 20px; border-top: 1px solid #eee; padding-top: 8px; }
</style>
</head>
<body>

<div class="header">
  <h1>Marshall County Fire Services</h1>
  <h2>${fmt(report.department)} Incident Report</h2>
  <div>Incident #: <strong>${fmt(report.incidentNumber) || 'N/A'}</strong> &nbsp;&nbsp;
  Status: <span class="${report.isCompleted ? 'completed-badge' : 'draft-badge'}">${report.isCompleted ? 'Completed' : 'Draft'}</span></div>
</div>

<div class="section">
  <div class="section-title">Date &amp; Times</div>
  <table>
    <tr><td class="label">Incident Date</td><td class="value">${fmtDate(report.incidentDate)}</td>
        <td class="label">Call Time</td><td class="value">${fmtTime(report.callTime)}</td></tr>
    <tr><td class="label">On Scene</td><td class="value">${fmtTime(report.onSceneTime)}</td>
        <td class="label">Back In Service</td><td class="value">${fmtTime(report.backInServiceTime)}</td></tr>
  </table>
</div>

<div class="section">
  <div class="section-title">Incident Location</div>
  <table>
    <tr><td class="label">Address</td><td colspan="3" class="value">${fmt(report.address)}</td></tr>
    <tr><td class="label">ZIP Code</td><td class="value">${fmt(report.zipCode)}</td>
        <td class="label">Intersection</td><td class="value">${fmt(report.intersection)}</td></tr>
  </table>
</div>

<div class="section">
  <div class="section-title">Incident Type(s)</div>
  <table><tr><td>${incidentTypes || 'None selected'}</td></tr></table>
</div>

<div class="section">
  <div class="section-title">Patient / Owner / Occupant</div>
  <table>
    <tr><td class="label">Name</td><td class="value">${fmt(report.occupantName)}</td>
        <td class="label">Phone</td><td class="value">${fmt(report.occupantPhone)}</td></tr>
    <tr><td class="label">Address</td><td class="value">${fmt(report.occupantAddress)}</td>
        <td class="label">State</td><td class="value">${fmt(report.occupantState)}</td></tr>
    <tr><td class="label">ZIP</td><td colspan="3" class="value">${fmt(report.occupantZip)}</td></tr>
  </table>
</div>

<div class="section">
  <div class="section-title">Insurance</div>
  <table>
    <tr><td class="label">Company</td><td class="value">${fmt(report.insuranceName)}</td>
        <td class="label">Phone</td><td class="value">${fmt(report.insurancePhone)}</td></tr>
    <tr><td class="label">Policy #</td><td colspan="3" class="value">${fmt(report.insurancePolicyNumber)}</td></tr>
  </table>
</div>

<div class="section">
  <div class="section-title">Vehicle / Heavy Equipment</div>
  <table>
    <tr><td class="label">Make</td><td class="value">${fmt(report.vehicleMake)}</td>
        <td class="label">Model</td><td class="value">${fmt(report.vehicleModel)}</td></tr>
    <tr><td class="label">Year</td><td class="value">${fmt(report.vehicleYear)}</td>
        <td class="label">Tag</td><td class="value">${fmt(report.vehicleTag)}</td></tr>
    <tr><td class="label">VIN</td><td colspan="3" class="value">${fmt(report.vehicleVIN)}</td></tr>
  </table>
</div>

<div class="section">
  <div class="section-title">Grass Fire</div>
  <table><tr><td class="label">Acres Burned</td><td class="value">${fmt(report.acresBurned)}</td></tr></table>
</div>

<div class="section">
  <div class="section-title">Responding Equipment</div>
  <table><tr><td>${equipment || 'None selected'}</td></tr></table>
</div>

<div class="section">
  <div class="section-title">Personnel</div>
  <table><tr><td>${personnel || 'None selected'}</td></tr></table>
</div>

<div class="section">
  <div class="section-title">Narrative</div>
  <table><tr><td class="narrative">${fmt(report.narrative)}</td></tr></table>
</div>

<div class="section">
  <div class="section-title">Officer Signature</div>
  <table>
    <tr><td style="height:80px; vertical-align:top;">
      ${report.signatureData
        ? `<img src="${report.signatureData}" style="max-height:70px;" />`
        : '<div style="height:70px; border-bottom:1px solid #999; margin-bottom:4px;"></div>'
      }
    </td></tr>
    <tr><td style="font-size:10px; color:#666;">Authorized Officer</td></tr>
  </table>
</div>

<div class="footer">
  Marshall County Fire Services &bull; Generated ${new Date().toLocaleString()} &bull; Report ID: ${report.id}
</div>

</body>
</html>`;
}

export async function sharePDF(report) {
  try {
    const html = generateHTML(report);
    const { uri } = await Print.printToFileAsync({ html, base64: false });
    await Sharing.shareAsync(uri, {
      mimeType: 'application/pdf',
      dialogTitle: `Incident Report - ${report.incidentNumber || report.id}`,
      UTI: 'com.adobe.pdf',
    });
    return { success: true };
  } catch (e) {
    console.error('PDF export failed:', e);
    return { success: false, error: e.message };
  }
}

export async function printPDF(report) {
  try {
    const html = generateHTML(report);
    await Print.printAsync({ html });
    return { success: true };
  } catch (e) {
    return { success: false, error: e.message };
  }
}
