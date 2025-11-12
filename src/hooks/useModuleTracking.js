const STORAGE_KEY = 'moduleVisitStats';

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

export const recordModuleVisit = (moduleId) => {
  if (!moduleId) return;
  const stats = getStats();
  if (!stats[moduleId]) {
    stats[moduleId] = {
      visits: 0,
      active: 0,
      lastVisit: Date.now(),
    };
  }
  stats[moduleId].visits += 1;
  stats[moduleId].lastVisit = Date.now();
  setStats(stats);
};

export const recordModuleActive = (moduleId) => {
  if (!moduleId) return;
  const stats = getStats();
  if (!stats[moduleId]) {
    return;
  }
  stats[moduleId].active += 1;
  setStats(stats);
};

export const getModuleStats = () => getStats();
