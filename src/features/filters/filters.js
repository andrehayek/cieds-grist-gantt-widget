import { overlapsYear } from '../../utils/date.js';
import { setSelectOptions, uniqueSorted } from '../../utils/dom.js';

export function filterProjects(projects, filters) {
  const search = filters.search.trim().toLocaleLowerCase('fr');
  return projects.filter((project) => {
    if (search && !project.searchText.includes(search)) return false;
    if (filters.wave !== 'all' && project.Wave !== filters.wave) return false;
    if (filters.axis !== 'all' && project.ScientificAxis !== filters.axis) return false;
    if (filters.extended === 'yes' && !project.Extended) return false;
    if (filters.extended === 'no' && project.Extended) return false;
    if (filters.year !== 'all' && !overlapsYear(project.StartDate, project.EffectiveEnd, Number(filters.year))) return false;
    return true;
  });
}

export function populateFilterOptions(projects) {
  const years = new Set();
  projects.forEach((project) => {
    const start = project.StartDate?.getFullYear();
    const end = project.EffectiveEnd?.getFullYear();
    if (!start || !end) return;
    for (let year = start; year <= end; year += 1) years.add(year);
  });
  setSelectOptions(document.getElementById('filter-year'), [...years].sort((a, b) => a - b), 'Toutes');
  setSelectOptions(document.getElementById('filter-wave'), uniqueSorted(projects.map((project) => project.Wave)), 'Toutes');
  setSelectOptions(document.getElementById('filter-axis'), uniqueSorted(projects.map((project) => project.ScientificAxis)), 'Tous');
}
