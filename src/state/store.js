const listeners = new Set();

const currentYear = new Date().getFullYear();

export const state = {
  mode: 'demo',
  projects: [],
  mappings: null,
  tableId: null,
  activeProjectId: null,
  filters: {
    search: '',
    year: 'all',
    wave: 'all',
    axis: 'all',
    extended: 'all'
  },
  timeline: {
    anchorYear: currentYear - 1,
    spanYears: 4
  }
};

export function subscribe(listener) {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

export function notify() {
  listeners.forEach((listener) => listener(state));
}

export function patchState(patch) {
  Object.assign(state, patch);
  notify();
}

export function patchFilters(patch) {
  Object.assign(state.filters, patch);
  notify();
}

export function patchTimeline(patch) {
  Object.assign(state.timeline, patch);
  notify();
}
