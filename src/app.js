import { state, patchFilters, patchTimeline, subscribe, notify } from './state/store.js';
import { initializeGrist, isGristContext, isMapped, refreshSelectedTable, selectProject, updateProject } from './grist/grist-client.js';
import { filterProjects, populateFilterOptions } from './features/filters/filters.js';
import { renderGantt } from './features/gantt/gantt-view.js';
import { openProjectDialog, renderProjectsTable } from './features/projects/projects-view.js';
import { exportGanttToPrint } from './features/export/print-export.js';
import { showToast } from './utils/dom.js';

function currentProjects() {
  return filterProjects(state.projects, state.filters);
}

function render() {
  const projects = currentProjects();
  renderGantt(projects, state.timeline, openProject);
  renderProjectsTable(projects, openProject);
}

function updateConnectionStatus() {
  const status = document.getElementById('connection-status');
  if (state.mode === 'grist') {
    status.textContent = `Connecté à Grist · ${state.projects.length} ligne${state.projects.length > 1 ? 's' : ''} reçue${state.projects.length > 1 ? 's' : ''}`;
  } else {
    status.textContent = 'Mode démonstration · ouvre cette URL comme widget personnalisé dans Grist pour utiliser tes données';
  }
}

function openProject(projectId) {
  const project = state.projects.find((item) => item.id === projectId);
  if (!project) return;
  state.activeProjectId = projectId;
  openProjectDialog(project, state.mode === 'grist' ? isMapped : () => true, {
    onSelect: async (id) => {
      try { await selectProject(id); showToast('Projet sélectionné dans Grist.'); }
      catch (error) { showToast(error.message, 'error'); }
    },
    onSave: async (id, values) => {
      try {
        await updateProject(id, values);
        document.getElementById('project-dialog').close();
        showToast('Projet mis à jour dans Grist.');
      } catch (error) {
        showToast(error.message, 'error');
      }
    }
  });
}

function bindTabs() {
  document.querySelectorAll('.tab-button').forEach((button) => {
    button.addEventListener('click', () => {
      document.querySelectorAll('.tab-button').forEach((item) => item.classList.toggle('is-active', item === button));
      document.querySelectorAll('.view-panel').forEach((panel) => panel.classList.toggle('is-active', panel.id === `view-${button.dataset.tab}`));
    });
  });
}

function bindFilters() {
  const bindings = [
    ['filter-search', 'search', 'input'],
    ['filter-year', 'year', 'change'],
    ['filter-wave', 'wave', 'change'],
    ['filter-axis', 'axis', 'change'],
    ['filter-extended', 'extended', 'change']
  ];
  bindings.forEach(([id, key, event]) => document.getElementById(id).addEventListener(event, (e) => patchFilters({ [key]: e.target.value })));
  document.getElementById('clear-filters').addEventListener('click', () => {
    document.getElementById('filter-search').value = '';
    document.getElementById('filter-year').value = 'all';
    document.getElementById('filter-wave').value = 'all';
    document.getElementById('filter-axis').value = 'all';
    document.getElementById('filter-extended').value = 'all';
    patchFilters({ search: '', year: 'all', wave: 'all', axis: 'all', extended: 'all' });
  });
}

function bindTimeline() {
  document.getElementById('timeline-span').addEventListener('change', (event) => patchTimeline({ spanYears: Number(event.target.value) }));
  document.getElementById('timeline-previous').addEventListener('click', () => patchTimeline({ anchorYear: state.timeline.anchorYear - Math.max(1, Math.floor(state.timeline.spanYears / 2)) }));
  document.getElementById('timeline-next').addEventListener('click', () => patchTimeline({ anchorYear: state.timeline.anchorYear + Math.max(1, Math.floor(state.timeline.spanYears / 2)) }));
  document.getElementById('timeline-today').addEventListener('click', () => patchTimeline({ anchorYear: new Date().getFullYear() - Math.floor(state.timeline.spanYears / 2) }));
}

function bindExport() {
  const dialog = document.getElementById('export-dialog');
  document.getElementById('export-button').addEventListener('click', () => dialog.showModal());
  document.getElementById('confirm-export').addEventListener('click', () => {
    try {
      const mode = new FormData(dialog.querySelector('form')).get('export-mode');
      const projects = currentProjects();
      const label = `${state.timeline.anchorYear}–${state.timeline.anchorYear + state.timeline.spanYears - 1}`;
      exportGanttToPrint(mode, projects.length, label);
      dialog.close();
    } catch (error) {
      showToast(error.message, 'error');
    }
  });
}

async function start() {
  bindTabs();
  bindFilters();
  bindTimeline();
  bindExport();
  subscribe(render);

  document.getElementById('refresh-button').addEventListener('click', async () => {
    try { await refreshSelectedTable(); showToast(isGristContext() ? 'Données actualisées.' : 'Le mode démonstration utilise des données locales.'); }
    catch (error) { showToast(error.message, 'error'); }
  });

  try {
    await initializeGrist(({ projects, mappings, tableId, mode }) => {
      state.projects = projects;
      state.mappings = mappings;
      state.tableId = tableId;
      state.mode = mode;
      populateFilterOptions(projects);
      updateConnectionStatus();
      notify();
    });
  } catch (error) {
    document.getElementById('connection-status').textContent = 'Erreur de connexion à Grist';
    showToast(`Initialisation impossible : ${error.message}`, 'error');
    console.error(error);
  }
}

start();
