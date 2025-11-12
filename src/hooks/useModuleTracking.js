const STORAGE_KEY = 'moduleVisitStats';
const MAX_DAILY_ENTRIES = 120;

const createHourlyTemplate = () =>
  Array.from({ length: 24 }, (_, hour) => ({ hour, visits: 0, active: 0, timeSpent: 0 }));

const getStats = () => {
  if (typeof window === 'undefined') {
    return {};
  }
  try {
    const value = window.localStorage.getItem(STORAGE_KEY);
    return value ? JSON.parse(value) : {};
  } catch (error) {
    console.error('Failed to parse module stats', error);
    return {};
  }
};

const setStats = (stats) => {
  if (typeof window === 'undefined') {
    return;
  }
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(stats));
};

const ensureEntry = (stats, moduleId) => {
  if (!stats[moduleId]) {
    stats[moduleId] = {
      visits: 0,
      active: 0,
      timeSpent: 0,
      avgDuration: 0,
      lastVisit: 0,
      dailyData: [],
      hourlyData: createHourlyTemplate(),
    };
  } else {
    const entry = stats[moduleId];
    entry.visits = entry.visits || 0;
    entry.active = entry.active || 0;
    entry.timeSpent = entry.timeSpent || 0;
    entry.avgDuration = entry.avgDuration || 0;
    entry.lastVisit = entry.lastVisit || 0;
    if (!Array.isArray(entry.dailyData)) {
      entry.dailyData = [];
    }
    if (!Array.isArray(entry.hourlyData) || entry.hourlyData.length !== 24) {
      entry.hourlyData = createHourlyTemplate();
    }
  }
  return stats[moduleId];
};

const getTodayKey = () => new Date().toISOString().split('T')[0];

const ensureDailyEntry = (entry, dateKey) => {
  let daily = entry.dailyData.find((item) => item.date === dateKey);
  if (!daily) {
    daily = { date: dateKey, visits: 0, active: 0, timeSpent: 0, lastVisit: 0 };
    entry.dailyData.push(daily);
    entry.dailyData.sort((a, b) => (a.date > b.date ? 1 : -1));
    if (entry.dailyData.length > MAX_DAILY_ENTRIES) {
      entry.dailyData.splice(0, entry.dailyData.length - MAX_DAILY_ENTRIES);
    }
  }
  return daily;
};

export const recordModuleVisit = (moduleId) => {
  if (!moduleId) return;
  const stats = getStats();
  const entry = ensureEntry(stats, moduleId);
  entry.visits += 1;
  entry.lastVisit = Date.now();

  const dateKey = getTodayKey();
  const daily = ensureDailyEntry(entry, dateKey);
  daily.visits += 1;
  daily.lastVisit = Date.now();

  const hour = new Date().getHours();
  entry.hourlyData[hour].visits = (entry.hourlyData[hour].visits || 0) + 1;

  setStats(stats);
};

export const recordModuleActive = (moduleId) => {
  if (!moduleId) return;
  const stats = getStats();
  const entry = ensureEntry(stats, moduleId);
  entry.active += 1;

  const dateKey = getTodayKey();
  const daily = ensureDailyEntry(entry, dateKey);
  daily.active = (daily.active || 0) + 1;

  const hour = new Date().getHours();
  entry.hourlyData[hour].active = (entry.hourlyData[hour].active || 0) + 1;

  setStats(stats);
};

export const recordModuleTimeSpent = (moduleId, milliseconds) => {
  if (!moduleId || !milliseconds || milliseconds < 500) {
    return;
  }
  const stats = getStats();
  const entry = ensureEntry(stats, moduleId);
  const minutes = milliseconds / 60000;
  entry.timeSpent = Number((entry.timeSpent + minutes).toFixed(2));
  entry.avgDuration = entry.visits ? Number((entry.timeSpent / entry.visits).toFixed(2)) : 0;

  const dateKey = getTodayKey();
  const daily = ensureDailyEntry(entry, dateKey);
  daily.timeSpent = Number(((daily.timeSpent || 0) + minutes).toFixed(2));

  const hour = new Date().getHours();
  const slot = entry.hourlyData[hour];
  slot.timeSpent = Number(((slot.timeSpent || 0) + minutes).toFixed(2));

  setStats(stats);
};

export const getModuleStats = () => getStats();
