const DAY_MS = 86_400_000;

export function toDate(value) {
  if (!value) return null;
  if (value instanceof Date) return Number.isNaN(value.getTime()) ? null : value;
  if (typeof value === 'number') {
    // Les dates Grist reçues peuvent être des secondes Unix.
    const date = new Date(value < 10_000_000_000 ? value * 1000 : value);
    return Number.isNaN(date.getTime()) ? null : date;
  }
  if (typeof value === 'object' && typeof value.toDate === 'function') {
    const date = value.toDate();
    return Number.isNaN(date.getTime()) ? null : date;
  }
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? null : date;
}

export function startOfDay(value) {
  const date = toDate(value);
  if (!date) return null;
  return new Date(date.getFullYear(), date.getMonth(), date.getDate());
}

export function endOfYear(year) {
  return new Date(year, 11, 31, 23, 59, 59, 999);
}

export function formatDate(value) {
  const date = toDate(value);
  if (!date) return '—';
  return new Intl.DateTimeFormat('fr-FR', { day: '2-digit', month: '2-digit', year: 'numeric' }).format(date);
}

export function toInputDate(value) {
  const date = toDate(value);
  if (!date) return '';
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

export function toGristDate(value) {
  if (!value) return null;
  // Un champ HTML date renvoie YYYY-MM-DD. Date.UTC évite qu'un fuseau
  // horaire local décale la date lors de l'écriture dans Grist.
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(String(value));
  if (!match) return null;
  const [, year, month, day] = match.map(Number);
  const timestamp = Date.UTC(year, month - 1, day);
  return Number.isNaN(timestamp) ? null : Math.floor(timestamp / 1000);
}

export function midpoint(start, end) {
  const startDate = startOfDay(start);
  const endDate = startOfDay(end);
  if (!startDate || !endDate) return null;
  return new Date(startDate.getTime() + ((endDate.getTime() - startDate.getTime()) / 2));
}

export function clampDate(date, min, max) {
  return new Date(Math.min(max.getTime(), Math.max(min.getTime(), date.getTime())));
}

export function positionPercent(value, rangeStart, rangeEnd) {
  const date = startOfDay(value);
  if (!date) return null;
  const total = rangeEnd.getTime() - rangeStart.getTime();
  if (total <= 0) return 0;
  return ((date.getTime() - rangeStart.getTime()) / total) * 100;
}

export function overlapsYear(start, end, year) {
  const startDate = startOfDay(start);
  const endDate = startOfDay(end);
  if (!startDate || !endDate) return false;
  return startDate <= endOfYear(year) && endDate >= new Date(year, 0, 1);
}

export function addYears(date, amount) {
  return new Date(date.getFullYear() + amount, date.getMonth(), date.getDate());
}

export function daysBetween(start, end) {
  const a = startOfDay(start);
  const b = startOfDay(end);
  if (!a || !b) return null;
  return Math.round((b.getTime() - a.getTime()) / DAY_MS);
}

export function getRange(anchorYear, spanYears) {
  return {
    start: new Date(anchorYear, 0, 1),
    end: new Date(anchorYear + spanYears, 0, 1)
  };
}

const MONTHS = ['Jan', 'Fév', 'Mar', 'Avr', 'Mai', 'Juin', 'Juil', 'Aoû', 'Sep', 'Oct', 'Nov', 'Déc'];

export function buildTimelineSegments(rangeStart, rangeEnd, spanYears) {
  const years = [];
  const periods = [];
  for (let year = rangeStart.getFullYear(); year < rangeEnd.getFullYear(); year += 1) {
    const start = new Date(year, 0, 1);
    const end = new Date(year + 1, 0, 1);
    years.push({ label: String(year), start, end });
  }

  if (spanYears <= 2) {
    for (let cursor = new Date(rangeStart); cursor < rangeEnd; cursor = new Date(cursor.getFullYear(), cursor.getMonth() + 1, 1)) {
      periods.push({ label: MONTHS[cursor.getMonth()], start: new Date(cursor), end: new Date(cursor.getFullYear(), cursor.getMonth() + 1, 1), major: cursor.getMonth() === 0 });
    }
  } else if (spanYears <= 6) {
    for (let cursor = new Date(rangeStart); cursor < rangeEnd; cursor = new Date(cursor.getFullYear(), cursor.getMonth() + 3, 1)) {
      periods.push({ label: `T${Math.floor(cursor.getMonth() / 3) + 1}`, start: new Date(cursor), end: new Date(cursor.getFullYear(), cursor.getMonth() + 3, 1), major: cursor.getMonth() === 0 });
    }
  } else {
    years.forEach((year) => periods.push({ ...year, major: true }));
  }
  return { years, periods };
}
