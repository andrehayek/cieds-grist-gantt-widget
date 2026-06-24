import { midpoint, startOfDay } from '../utils/date.js';
import { normalizeColor } from '../utils/color.js';

function text(value) {
  if (Array.isArray(value)) return value.filter(Boolean).join(', ');
  return value == null ? '' : String(value);
}

function number(value) {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : null;
}

export function normalizeProject(record) {
  const startDate = startOfDay(record.StartDate);
  const endDate = startOfDay(record.EndDate);
  // Conserver le booléen déclaré, même lorsque la date est absente : cela
  // permet d'identifier une donnée incohérente au lieu de la classer comme non prolongée.
  const extended = Boolean(record.Extended);
  const extensionDate = extended ? startOfDay(record.ExtensionDate) : null;
  const validExtension = Boolean(extensionDate && endDate && extensionDate > endDate);
  const effectiveEnd = validExtension ? extensionDate : endDate;

  const project = {
    id: Number(record.id),
    Name: text(record.Name) || `Projet ${record.id}`,
    FullName: text(record.FullName),
    Wave: text(record.Wave),
    StartDate: startDate,
    EndDate: endDate,
    Extended: extended,
    ExtensionDate: extensionDate,
    EffectiveEnd: effectiveEnd,
    Color: normalizeColor(text(record.Color), record.Name || record.id),
    Object: text(record.Object),
    ScientificAxis: text(record.ScientificAxis),
    Lead1: text(record.Lead1),
    Lab1: text(record.Lab1),
    Lead2: text(record.Lead2),
    Lab2: text(record.Lab2),
    Lead3: text(record.Lead3),
    Lab3: text(record.Lab3),
    TotalBudget: number(record.TotalBudget),
    DirectCosts: number(record.DirectCosts),
    Preciput: number(record.Preciput),
    Duration: record.Duration,
    HalfTime: record.HalfTime,
    Deliverable1: text(record.Deliverable1) || 'Lancement',
    Deliverable2: text(record.Deliverable2) || 'Mi-temps',
    Deliverable3: text(record.Deliverable3) || 'Clôture',
    Milestone1Date: startOfDay(record.Milestone1Date) || startDate,
    Milestone2Date: startOfDay(record.Milestone2Date) || startOfDay(record.HalfTime) || midpoint(startDate, endDate),
    Milestone3Date: startOfDay(record.Milestone3Date) || effectiveEnd,
    Attachment: record.Attachment,
    raw: record
  };

  project.searchText = [project.Name, project.FullName, project.Object, project.ScientificAxis,
    project.Lead1, project.Lead2, project.Lead3, project.Lab1, project.Lab2, project.Lab3, project.Wave]
    .join(' ').toLocaleLowerCase('fr');

  project.hasValidRange = Boolean(startDate && endDate && endDate >= startDate);
  project.hasInvalidExtension = Boolean(extended && (!extensionDate || !endDate || extensionDate <= endDate));
  return project;
}

export function getMilestones(project) {
  return [
    { date: project.Milestone1Date, label: project.Deliverable1 },
    { date: project.Milestone2Date, label: project.Deliverable2 },
    { date: project.Milestone3Date, label: project.Deliverable3 }
  ].filter((milestone) => milestone.date);
}
