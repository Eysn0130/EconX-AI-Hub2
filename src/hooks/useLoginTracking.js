const STORAGE_KEY = 'loginStats';

const defaultStats = () => ({
  totalLogins: 0,
  units: {},
  lastLogin: 0,
});

const loadStats = () => {
  if (typeof window === 'undefined') {
    return defaultStats();
  }
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      return defaultStats();
    }
    const parsed = JSON.parse(raw);
    if (!parsed || typeof parsed !== 'object') {
      return defaultStats();
    }
    if (!parsed.units || typeof parsed.units !== 'object') {
      parsed.units = {};
    }
    return parsed;
  } catch (error) {
    console.error('Failed to load login stats', error);
    return defaultStats();
  }
};

const saveStats = (stats) => {
  if (typeof window === 'undefined') {
    return;
  }
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(stats));
};

const UNIT_PREFIX_MAP = [
  { pattern: /^11/, unit: '经侦支队一大队' },
  { pattern: /^12/, unit: '经侦支队二大队' },
  { pattern: /^13/, unit: '经侦支队三大队' },
  { pattern: /^14/, unit: '经侦支队四大队' },
  { pattern: /^15/, unit: '经侦支队技术支撑组' },
  { pattern: /^2/, unit: '贵阳市分局联络组' },
];

export const resolveUnitFromPoliceId = (policeId = '') => {
  if (!policeId) {
    return '未识别单位';
  }
  const normalized = String(policeId).trim();
  if (!normalized) {
    return '未识别单位';
  }
  const explicitUnitDelimiter = normalized.indexOf('@');
  if (explicitUnitDelimiter > -1) {
    const unitName = normalized.substring(explicitUnitDelimiter + 1).trim();
    if (unitName) {
      return unitName;
    }
  }
  const cleaned = normalized.replace(/[^0-9A-Za-z]/g, '');
  const prefix = cleaned.slice(0, 2);
  const matched = UNIT_PREFIX_MAP.find((item) => item.pattern.test(prefix));
  return matched ? matched.unit : '其他单位';
};

export const recordLoginEvent = (policeId) => {
  if (!policeId) {
    return null;
  }
  const stats = loadStats();
  const unit = resolveUnitFromPoliceId(policeId);
  const now = Date.now();

  if (!stats.units[unit]) {
    stats.units[unit] = {
      logins: 0,
      users: {},
      lastLogin: 0,
    };
  }

  const unitEntry = stats.units[unit];
  unitEntry.users = unitEntry.users || {};

  if (!unitEntry.users[policeId]) {
    unitEntry.users[policeId] = { logins: 0, lastLogin: 0 };
  }

  const userEntry = unitEntry.users[policeId];
  const withinFiveMinutes = userEntry.lastLogin && now - userEntry.lastLogin < 5 * 60 * 1000;

  userEntry.lastLogin = now;

  if (!withinFiveMinutes) {
    userEntry.logins += 1;
    unitEntry.logins += 1;
    stats.totalLogins += 1;
  }

  unitEntry.lastLogin = now;
  stats.lastLogin = now;

  saveStats(stats);
  return { policeId, unit, timestamp: now };
};

export const getLoginStats = () => loadStats();
