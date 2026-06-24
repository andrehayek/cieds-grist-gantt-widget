import { buildTimelineSegments, clampDate, formatDate, getRange, positionPercent } from '../../utils/date.js';
import { lightenColor } from '../../utils/color.js';
import { escapeHtml } from '../../utils/dom.js';
import { getMilestones } from '../../domain/project.js';

function segmentHtml(segment, rangeStart, rangeEnd, className) {
  const left = positionPercent(segment.start, rangeStart, rangeEnd);
  const right = positionPercent(segment.end, rangeStart, rangeEnd);
  const width = Math.max(0, right - left);
  return `<div class="${className}" style="left:${left}%;width:${width}%">${escapeHtml(segment.label)}</div>`;
}

function gridLinesHtml(periods, rangeStart, rangeEnd) {
  return periods.map((period) => {
    const left = positionPercent(period.start, rangeStart, rangeEnd);
    return `<span class="gantt-grid-line${period.major ? ' is-major' : ''}" style="left:${left}%"></span>`;
  }).join('');
}

function barHtml(project, rangeStart, rangeEnd) {
  if (!project.hasValidRange || !project.StartDate || !project.EndDate) return '';
  if (project.EndDate < rangeStart || project.StartDate >= rangeEnd) return '';

  const visibleStart = clampDate(project.StartDate, rangeStart, rangeEnd);
  const initialVisibleEnd = clampDate(project.EndDate, rangeStart, rangeEnd);
  const initialLeft = positionPercent(visibleStart, rangeStart, rangeEnd);
  const initialRight = positionPercent(initialVisibleEnd, rangeStart, rangeEnd);
  const initialWidth = Math.max(0.15, initialRight - initialLeft);
  const title = `${project.Name} : ${formatDate(project.StartDate)} → ${formatDate(project.EndDate)}`;
  let html = `<span class="gantt-bar" title="${escapeHtml(title)}" style="left:${initialLeft}%;width:${initialWidth}%;background:${project.Color}"></span>`;

  if (project.Extended && project.ExtensionDate && project.ExtensionDate > project.EndDate && project.ExtensionDate >= rangeStart && project.EndDate < rangeEnd) {
    const extensionStart = clampDate(project.EndDate, rangeStart, rangeEnd);
    const extensionEnd = clampDate(project.ExtensionDate, rangeStart, rangeEnd);
    const extensionLeft = positionPercent(extensionStart, rangeStart, rangeEnd);
    const extensionRight = positionPercent(extensionEnd, rangeStart, rangeEnd);
    const extensionWidth = Math.max(0.15, extensionRight - extensionLeft);
    html += `<span class="gantt-bar gantt-extension" title="Prolongation jusqu’au ${escapeHtml(formatDate(project.ExtensionDate))}" style="left:${extensionLeft}%;width:${extensionWidth}%;background-color:${lightenColor(project.Color)}"></span>`;
  }

  for (const milestone of getMilestones(project)) {
    if (milestone.date < rangeStart || milestone.date >= rangeEnd) continue;
    const left = positionPercent(milestone.date, rangeStart, rangeEnd);
    html += `<span class="gantt-milestone" title="${escapeHtml(milestone.label)} — ${escapeHtml(formatDate(milestone.date))}" style="left:${left}%;background:${project.Color}"></span>`;
  }
  return html;
}

export function renderGantt(projects, timeline, onProjectClick) {
  const container = document.getElementById('gantt-scroll');
  const empty = document.getElementById('gantt-empty');
  const { start: rangeStart, end: rangeEnd } = getRange(timeline.anchorYear, timeline.spanYears);
  const { years, periods } = buildTimelineSegments(rangeStart, rangeEnd, timeline.spanYears);
  const today = new Date();
  const todayPercent = today >= rangeStart && today < rangeEnd ? positionPercent(today, rangeStart, rangeEnd) : null;
  const timelineWidth = timeline.spanYears <= 2 ? 1200 : timeline.spanYears <= 6 ? 1040 : 940;
  container.style.setProperty('--timeline-width', `${timelineWidth}px`);

  document.getElementById('result-count').textContent = `${projects.length} projet${projects.length > 1 ? 's' : ''} · ${timeline.anchorYear}–${timeline.anchorYear + timeline.spanYears - 1}`;
  empty.hidden = projects.length > 0;
  container.hidden = projects.length === 0;
  if (projects.length === 0) {
    container.innerHTML = '';
    return;
  }

  const header = `
    <div class="gantt-header">
      <div class="gantt-header-label">Projet</div>
      <div class="gantt-header-timeline">
        ${years.map((segment) => segmentHtml(segment, rangeStart, rangeEnd, 'gantt-year-segment')).join('')}
        ${periods.map((segment) => segmentHtml(segment, rangeStart, rangeEnd, 'gantt-period-label')).join('')}
        ${todayPercent == null ? '' : `<span class="today-line" style="left:${todayPercent}%"></span><span class="today-badge" style="left:${todayPercent}%">Aujourd’hui</span>`}
      </div>
    </div>`;

  const sorted = [...projects].sort((a, b) => (a.StartDate?.getTime() || Infinity) - (b.StartDate?.getTime() || Infinity) || a.Name.localeCompare(b.Name, 'fr'));
  const rows = sorted.map((project) => {
    const invalid = !project.hasValidRange || project.hasInvalidExtension;
    const meta = project.Wave || project.ScientificAxis || '';
    return `
      <div class="gantt-row" data-project-id="${project.id}" tabindex="0" role="button" aria-label="Ouvrir ${escapeHtml(project.Name)}">
        <div class="gantt-project-label" title="${escapeHtml(project.FullName || project.Name)}">
          <span class="project-color-dot" style="background:${project.Color}"></span>
          <span class="project-label-text">${escapeHtml(project.Name)}</span>
          ${invalid ? '<span class="range-warning" title="Dates incohérentes ou incomplètes">Dates</span>' : ''}
          <span class="project-label-meta">${escapeHtml(meta)}</span>
        </div>
        <div class="gantt-timeline-cell">
          ${gridLinesHtml(periods, rangeStart, rangeEnd)}
          ${todayPercent == null ? '' : `<span class="today-line" style="left:${todayPercent}%"></span>`}
          ${barHtml(project, rangeStart, rangeEnd)}
        </div>
      </div>`;
  }).join('');

  container.innerHTML = `<div class="gantt-grid">${header}${rows}</div>`;
  container.querySelectorAll('[data-project-id]').forEach((row) => {
    const open = () => onProjectClick(Number(row.dataset.projectId));
    row.addEventListener('dblclick', open);
    row.addEventListener('keydown', (event) => {
      if (event.key === 'Enter' || event.key === ' ') { event.preventDefault(); open(); }
    });
  });
}
