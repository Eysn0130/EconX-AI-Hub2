export const timeframeOptions = [
  { id: '7d', label: '近7日', days: 7 },
  { id: '30d', label: '近30日', days: 30 },
  { id: '90d', label: '近90日', days: 90 },
];

export const ratingColorScale = {
  1: '#ff6b6b',
  2: '#ff9f68',
  3: '#ffd166',
  4: '#43c59e',
  5: '#1f77ff',
};

export const hourlySegments = [
  { id: 'overnight', label: '00:00-05:59', start: 0, end: 5 },
  { id: 'morning', label: '06:00-08:59', start: 6, end: 8 },
  { id: 'am-peak', label: '09:00-11:59', start: 9, end: 11 },
  { id: 'noon', label: '12:00-13:59', start: 12, end: 13 },
  { id: 'pm-peak', label: '14:00-17:59', start: 14, end: 17 },
  { id: 'evening', label: '18:00-20:59', start: 18, end: 20 },
  { id: 'late', label: '21:00-23:59', start: 21, end: 23 },
];
