(function () {
  const STORAGE_KEY = 'moduleVisitStats';
  const ACTIVE_DELAY = 10000;
  const MAX_DAILY_ENTRIES = 60;

  function loadStats() {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) return {};
      const data = JSON.parse(raw);
      return typeof data === 'object' && data ? data : {};
    } catch (error) {
      console.warn('[ModuleTracker] Failed to load stats from localStorage.', error);
      return {};
    }
  }

  function saveStats(stats) {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(stats));
    } catch (error) {
      console.warn('[ModuleTracker] Failed to persist stats.', error);
    }
  }

  function createHourlyData() {
    return Array.from({ length: 24 }, (_, hour) => ({ hour, visits: 0, timeSpent: 0 }));
  }

  function ensureEntry(stats, moduleId) {
    if (!stats[moduleId]) {
      stats[moduleId] = {
        visits: 0,
        active: 0,
        timeSpent: 0,
        avgTimeSpent: 0,
        lastVisit: 0,
        dailyData: [],
        hourlyData: createHourlyData()
      };
    } else {
      const entry = stats[moduleId];
      if (!Array.isArray(entry.dailyData)) entry.dailyData = [];
      if (!Array.isArray(entry.hourlyData) || entry.hourlyData.length !== 24) {
        entry.hourlyData = createHourlyData();
      }
    }
    return stats[moduleId];
  }

  function getTodayKey(date = new Date()) {
    return date.toISOString().split('T')[0];
  }

  function touchDailyEntry(entry, dateKey) {
    let day = entry.dailyData.find(item => item.date === dateKey);
    if (!day) {
      day = { date: dateKey, visits: 0, timeSpent: 0 };
      entry.dailyData.push(day);
      if (entry.dailyData.length > MAX_DAILY_ENTRIES) {
        entry.dailyData.splice(0, entry.dailyData.length - MAX_DAILY_ENTRIES);
      }
    }
    return day;
  }

  function recordVisit(moduleId) {
    const stats = loadStats();
    const entry = ensureEntry(stats, moduleId);
    entry.visits += 1;
    entry.lastVisit = Date.now();

    const today = getTodayKey();
    const day = touchDailyEntry(entry, today);
    day.visits += 1;

    const currentHour = new Date().getHours();
    entry.hourlyData[currentHour].visits = (entry.hourlyData[currentHour].visits || 0) + 1;

    saveStats(stats);
    return entry;
  }

  function recordActive(moduleId) {
    const stats = loadStats();
    const entry = ensureEntry(stats, moduleId);
    entry.active += 1;
    saveStats(stats);
    return entry;
  }

  function recordTimeSpent(moduleId, milliseconds) {
    if (!milliseconds || milliseconds < 1000) return;
    const stats = loadStats();
    const entry = ensureEntry(stats, moduleId);

    const minutes = milliseconds / 60000;
    entry.timeSpent += minutes;
    entry.avgTimeSpent = entry.visits ? Number((entry.timeSpent / entry.visits).toFixed(1)) : 0;

    const today = getTodayKey();
    const day = touchDailyEntry(entry, today);
    day.timeSpent = (day.timeSpent || 0) + minutes;

    const currentHour = new Date().getHours();
    const slot = entry.hourlyData[currentHour];
    slot.timeSpent = (slot.timeSpent || 0) + minutes;

    saveStats(stats);
    return entry;
  }

  function getModuleIdFromPath() {
    const path = window.location.pathname;
    const file = path.split('/').pop() || 'index.html';
    const moduleId = file.replace(/\.html$/i, '') || 'index';
    return moduleId;
  }

  function shouldTrack(moduleId) {
    const skipList = ['index', 'login', 'login2'];
    return !skipList.includes(moduleId);
  }

  function autoTrackPage() {
    const moduleId = getModuleIdFromPath();
    if (!shouldTrack(moduleId)) {
      return;
    }

    const entry = recordVisit(moduleId);
    let startTime = Date.now();
    let hiddenStartedAt = null;
    let activeTimer = setTimeout(() => {
      recordActive(moduleId);
      activeTimer = null;
    }, ACTIVE_DELAY);

    document.addEventListener('visibilitychange', () => {
      if (document.hidden) {
        hiddenStartedAt = Date.now();
      } else if (hiddenStartedAt) {
        const hiddenDuration = Date.now() - hiddenStartedAt;
        startTime += hiddenDuration;
        hiddenStartedAt = null;
      }
    });

    window.addEventListener('beforeunload', () => {
      if (activeTimer) {
        clearTimeout(activeTimer);
        activeTimer = null;
      }
      const spent = Date.now() - startTime;
      recordTimeSpent(moduleId, spent);
    });

    return entry;
  }

  window.ModuleTracker = {
    loadStats,
    saveStats,
    recordVisit,
    recordActive,
    recordTimeSpent,
    autoTrackPage,
    getModuleIdFromPath
  };

  document.addEventListener('DOMContentLoaded', autoTrackPage, { once: true });
})();
