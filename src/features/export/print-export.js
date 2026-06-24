import { escapeHtml } from '../../utils/dom.js';

export function exportGanttToPrint(mode, projectsCount, rangeLabel) {
  const gantt = document.querySelector('#gantt-scroll .gantt-grid');
  if (!gantt) throw new Error('Le Gantt doit être affiché avant l’export.');

  const stylesUrl = new URL('../../../assets/css/styles.css', import.meta.url).href;
  const scaleByHeight = Math.min(0.78, 680 / Math.max(260, 90 + (projectsCount * 30)));
  const scale = mode === 'single' ? Math.max(0.24, scaleByHeight) : 0.74;
  const timelineWidth = getComputedStyle(document.getElementById('gantt-scroll'))
    .getPropertyValue('--timeline-width')
    .trim() || '1020px';
  const printWindow = window.open('', '_blank');
  if (!printWindow) throw new Error('La fenêtre d’impression a été bloquée par le navigateur.');
  // Conserve la référence nécessaire à l’impression, puis coupe l’accès au parent.
  printWindow.opener = null;

  printWindow.document.write(`<!doctype html>
    <html lang="fr"><head><meta charset="utf-8"><title>Gantt CIEDS — ${escapeHtml(rangeLabel)}</title>
    <link rel="stylesheet" href="${stylesUrl}">
    <style>
      @page { size: A3 landscape; margin: 7mm; }
      html,body{margin:0;background:#fff;color:#17202a;font-family:Inter,system-ui,sans-serif}
      body{padding:8px}.print-title{margin:0 0 8px;font-size:18px}.print-meta{margin:0 0 10px;color:#637083;font-size:11px}
      .gantt-scroll{overflow:visible!important;max-height:none!important;border:0!important;box-shadow:none!important;--timeline-width:${timelineWidth}}
      .gantt-header{position:static!important}.gantt-header-label,.gantt-project-label{position:static!important}
      .gantt-row{break-inside:avoid}.print-content{transform-origin:top left;zoom:${scale};}
      ${mode === 'single' ? '.print-content{width:max-content}.gantt-row{break-inside:auto}' : ''}
    </style></head><body>
      <h1 class="print-title">Portefeuille de projets CIEDS</h1>
      <p class="print-meta">${escapeHtml(rangeLabel)} · ${projectsCount} projet${projectsCount > 1 ? 's' : ''} · généré le ${new Intl.DateTimeFormat('fr-FR').format(new Date())}</p>
      <div class="print-content"><div class="gantt-scroll">${gantt.outerHTML}</div></div>
      <script>window.addEventListener('load',()=>setTimeout(()=>window.print(),350));<\/script>
    </body></html>`);
  printWindow.document.close();
}
