import { GRIST_COLUMNS } from '../config/columns.js';
import { SAMPLE_RECORDS } from '../data/sample-data.js';
import { normalizeProject } from '../domain/project.js';
import { toGristDate } from '../utils/date.js';

let currentMappings = null;
let currentTableId = null;
let dataCallback = () => {};

export function isGristContext() {
  try {
    return Boolean(window.grist && window.parent !== window && new URLSearchParams(window.location.search).get('demo') !== '1');
  } catch {
    return false;
  }
}

function mappingValue(mappings, logicalName) {
  const value = mappings?.[logicalName];
  return Array.isArray(value) ? value[0] : value;
}

function mapRecords(records) {
  return records
    .map((record) => window.grist.mapColumnNames(record))
    .filter(Boolean)
    .map(normalizeProject);
}

export async function initializeGrist(onData) {
  dataCallback = onData;

  if (!isGristContext()) {
    const projects = SAMPLE_RECORDS.map(normalizeProject);
    dataCallback({ projects, mappings: null, tableId: null, mode: 'demo' });
    return;
  }

  await window.grist.ready({
    requiredAccess: 'full',
    allowSelectBy: true,
    columns: GRIST_COLUMNS
  });

  try {
    currentTableId = await window.grist.selectedTable.getTableId();
  } catch (error) {
    console.warn('Impossible de lire l’identifiant de la table sélectionnée.', error);
  }

  window.grist.onRecords((records, mappings) => {
    currentMappings = mappings;
    const projects = mapRecords(records);
    dataCallback({ projects, mappings, tableId: currentTableId, mode: 'grist' });
  }, { format: 'rows', keepEncoded: false, includeColumns: 'shown' });
}

export async function refreshSelectedTable() {
  if (!isGristContext()) return;
  const records = await window.grist.viewApi.fetchSelectedTable({ format: 'rows', keepEncoded: false, includeColumns: 'shown' });
  const projects = mapRecords(records);
  dataCallback({ projects, mappings: currentMappings, tableId: currentTableId, mode: 'grist' });
}

export async function selectProject(rowId) {
  if (!isGristContext()) return;
  await window.grist.setCursorPos({ rowId: Number(rowId) });
}

function serializeValue(logicalField, value) {
  if (['StartDate', 'EndDate', 'ExtensionDate', 'Milestone1Date', 'Milestone2Date', 'Milestone3Date'].includes(logicalField)) {
    return toGristDate(value);
  }
  if (logicalField === 'Extended') return Boolean(value);
  if (['TotalBudget', 'DirectCosts', 'Preciput'].includes(logicalField)) {
    return value === '' || value == null ? null : Number(value);
  }
  return value === '' ? null : value;
}

export async function updateProject(rowId, logicalValues) {
  if (!isGristContext()) throw new Error('La modification est désactivée en mode démonstration.');
  if (!currentTableId || !currentMappings) throw new Error('La table ou le mapping Grist n’est pas disponible.');

  const rawFields = {};
  for (const [logicalField, value] of Object.entries(logicalValues)) {
    const rawColumn = mappingValue(currentMappings, logicalField);
    if (!rawColumn) continue;
    rawFields[rawColumn] = serializeValue(logicalField, value);
  }
  if (Object.keys(rawFields).length === 0) throw new Error('Aucun champ modifiable n’est mappé.');

  await window.grist.docApi.applyUserActions([
    ['UpdateRecord', currentTableId, Number(rowId), rawFields]
  ]);
}

export function isMapped(logicalField) {
  return Boolean(mappingValue(currentMappings, logicalField));
}
