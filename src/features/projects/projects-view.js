import { EDITABLE_FIELDS } from '../../config/columns.js';
import { formatDate, toInputDate } from '../../utils/date.js';
import { escapeHtml } from '../../utils/dom.js';

const currency = new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'EUR', maximumFractionDigits: 0 });

function budget(value) {
  return Number.isFinite(value) ? currency.format(value) : '—';
}

export function renderProjectsTable(projects, onOpen) {
  const body = document.getElementById('projects-table-body');
  if (projects.length === 0) {
    body.innerHTML = '<tr><td colspan="9" class="muted">Aucun projet ne correspond aux filtres.</td></tr>';
    return;
  }
  body.innerHTML = projects.map((project) => `
    <tr data-project-id="${project.id}">
      <td class="project-title-cell"><span class="project-color-dot" style="display:inline-block;margin-right:7px;background:${project.Color}"></span>${escapeHtml(project.Name)}<span class="project-subtitle">${escapeHtml(project.FullName || project.Object)}</span></td>
      <td>${escapeHtml(project.Wave || '—')}</td>
      <td>${escapeHtml(project.ScientificAxis || '—')}</td>
      <td>${formatDate(project.StartDate)}</td>
      <td>${formatDate(project.EndDate)}</td>
      <td>${project.Extended
        ? (project.hasInvalidExtension
          ? '<span class="badge badge-warning">À corriger</span>'
          : `<span class="badge badge-extension">jusqu’au ${formatDate(project.ExtensionDate)}</span>`)
        : '<span class="badge">Non</span>'}</td>
      <td>${budget(project.TotalBudget)}</td>
      <td>${escapeHtml(project.Lead1 || '—')}<span class="project-subtitle">${escapeHtml(project.Lab1)}</span></td>
      <td><button class="button button-secondary edit-project" type="button">Ouvrir</button></td>
    </tr>`).join('');
  body.querySelectorAll('.edit-project').forEach((button) => button.addEventListener('click', () => {
    const row = button.closest('[data-project-id]');
    onOpen(Number(row.dataset.projectId));
  }));
}

function fieldValue(project, field) {
  const value = project[field.key];
  if (field.type === 'date') return toInputDate(value);
  if (field.type === 'checkbox') return Boolean(value);
  return value ?? '';
}

export function openProjectDialog(project, isMapped, handlers) {
  const dialog = document.getElementById('project-dialog');
  const grid = document.getElementById('project-form-grid');
  document.getElementById('project-dialog-title').textContent = project.Name;

  grid.innerHTML = EDITABLE_FIELDS.map((field) => {
    const mapped = isMapped(field.key);
    const classes = ['form-field', field.className || '', mapped ? '' : 'is-disabled'].filter(Boolean).join(' ');
    const disabled = mapped ? '' : 'disabled';
    const value = fieldValue(project, field);
    let control;
    if (field.type === 'textarea') {
      control = `<textarea class="form-control" name="${field.key}" ${disabled}>${escapeHtml(value)}</textarea>`;
    } else if (field.type === 'checkbox') {
      control = `<input name="${field.key}" type="checkbox" ${value ? 'checked' : ''} ${disabled}>`;
    } else {
      control = `<input class="form-control" name="${field.key}" type="${field.type}" value="${escapeHtml(value)}" ${field.step ? `step="${field.step}"` : ''} ${field.required ? 'required' : ''} ${disabled}>`;
    }
    return `<label class="${classes}"><span>${escapeHtml(field.label)}${mapped ? '' : ' · non mappé'}</span>${control}</label>`;
  }).join('');

  document.getElementById('save-project').onclick = async () => {
    const form = document.getElementById('project-form');
    if (!form.reportValidity()) return;
    const values = {};
    EDITABLE_FIELDS.forEach((field) => {
      const input = form.elements[field.key];
      if (!input || input.disabled) return;
      values[field.key] = field.type === 'checkbox' ? input.checked : input.value;
    });
    await handlers.onSave(project.id, values);
  };
  document.getElementById('select-in-grist').onclick = () => handlers.onSelect(project.id);
  dialog.showModal();
}
