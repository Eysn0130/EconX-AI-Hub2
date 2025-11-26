import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import '../styles/stats.css';
import { usePoliceId } from '../hooks/usePoliceId.js';
import { withPoliceId } from '../utils/navigation.js';
import { timeframeOptions, ratingColorScale, hourlySegments } from '../data/stats.js';
import { navSections } from '../data/navigation.js';
import { getModuleStats } from '../hooks/useModuleTracking.js';
import { getLoginStats } from '../hooks/useLoginTracking.js';
import GlassIcon from '../components/GlassIcon.jsx';

const formatNumber = (value) => value.toLocaleString('zh-CN');
const formatPercent = (value) => `${(value * 100).toFixed(1)}%`;
const clampScore = (value) => Math.max(0, Math.min(5, value));

const HorizontalBars = ({ data }) => {
  if (!data.length) {
    return <div className="stats-empty">暂无数据</div>;
  }
  const maxValue = Math.max(...data.map((item) => item.visits), 1);
  return (
    <div className="stats-hbar-list">
      {data.map((item) => {
        const width = maxValue ? (item.visits / maxValue) * 100 : 0;
        return (
          <div key={item.id} className="stats-hbar-item">
            <div className="stats-hbar-meta">
              <span className="stats-hbar-name">{item.name}</span>
              <span className="stats-hbar-value">{formatNumber(item.visits)}</span>
            </div>
            <div className="stats-hbar-track" aria-hidden="true">
              <div className="stats-hbar-fill" style={{ width: `${width}%` }}>
                <span>{formatPercent(item.usageRate)}</span>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
};

const LineChart = ({ data, durationSeries }) => {
  if (!data.length) {
    return <div className="stats-empty">暂无趋势数据</div>;
  }
  const width = 100;
  const height = 100;
  const valuePoints = data.map((point) => Math.max(point.visits, point.activeUsers || 0));
  const maxValue = valuePoints.length ? Math.max(...valuePoints) : 0;
  const durationValues = durationSeries.map((point) => point.score ?? point.avgDuration ?? 0);
  const maxDuration = durationValues.length ? Math.max(...durationValues) : 0;
  const visitsPoints = data
    .map((point, index) => {
      const x = (index / Math.max(data.length - 1, 1)) * width;
      const y = height - (maxValue ? (point.visits / maxValue) * height : 0);
      return `${x},${y}`;
    })
    .join(' ');
  const activePoints = data
    .map((point, index) => {
      const x = (index / Math.max(data.length - 1, 1)) * width;
      const y = height - (maxValue ? (point.activeUsers / maxValue) * height : 0);
      return `${x},${y}`;
    })
    .join(' ');
  const durationPoints = durationSeries
    .map((point, index) => {
      const x = (index / Math.max(durationSeries.length - 1, 1)) * width;
      const y = height - (maxDuration ? ((point.score ?? point.avgDuration) / maxDuration) * height : 0);
      return `${x},${y}`;
    })
    .join(' ');

  return (
    <svg className="stats-line-chart" viewBox={`0 0 ${width} ${height}`} role="img">
      <defs>
        <linearGradient id="visitGradient" x1="0" x2="0" y1="0" y2="1">
          <stop offset="0%" stopColor="rgba(26, 63, 114, 0.32)" />
          <stop offset="100%" stopColor="rgba(26, 63, 114, 0)" />
        </linearGradient>
        <linearGradient id="activeGradient" x1="0" x2="0" y1="0" y2="1">
          <stop offset="0%" stopColor="rgba(67, 197, 158, 0.28)" />
          <stop offset="100%" stopColor="rgba(67, 197, 158, 0)" />
        </linearGradient>
      </defs>
      <rect x="0" y="0" width="100" height="100" className="stats-line-bg" />
      <polyline points={visitsPoints} className="stats-line stats-line--primary" />
      <polyline points={activePoints} className="stats-line stats-line--secondary" />
      <polyline points={durationPoints} className="stats-line stats-line--dashed" />
    </svg>
  );
};

const RatingDistribution = ({ data }) => {
  if (!data.length) {
    return <div className="stats-empty">暂无评分数据</div>;
  }
  const total = data.reduce((sum, item) => sum + item.value, 0);
  return (
    <div className="stats-rating-grid">
      {data.map((item) => {
        const percent = total ? (item.value / total) * 100 : 0;
        return (
          <div key={item.label} className="stats-rating-item">
            <div className="stats-rating-label">
              <span>{item.label}</span>
              <span>{percent.toFixed(1)}%</span>
            </div>
            <div className="stats-rating-track">
              <div
                className="stats-rating-fill"
                style={{ width: `${percent}%`, backgroundColor: item.color }}
              />
            </div>
          </div>
        );
      })}
    </div>
  );
};

const HourlyUsage = ({ data }) => {
  if (!data.length) {
    return <div className="stats-empty">暂无时间分布</div>;
  }
  const maxSessions = Math.max(...data.map((item) => item.sessions), 1);
  return (
    <div className="stats-hourly-grid">
      {data.map((item) => {
        const height = maxSessions ? (item.sessions / maxSessions) * 100 : 0;
        return (
          <div key={item.label} className="stats-hourly-item">
            <div className="stats-hourly-bar" style={{ height: `${height}%` }} />
            <span className="stats-hourly-value">{item.sessions}</span>
            <span className="stats-hourly-label">{item.label}</span>
          </div>
        );
      })}
    </div>
  );
};

const deriveModuleMetadata = (moduleStats) => {
  const metaMap = new Map();
  navSections.forEach((section) => {
    section.items.forEach((item) => {
      if (!item.moduleId || metaMap.has(item.moduleId)) {
        return;
      }
      metaMap.set(item.moduleId, {
        id: item.moduleId,
        name: item.label,
        category: section.title,
      });
    });
  });

  Object.keys(moduleStats).forEach((moduleId) => {
    if (!metaMap.has(moduleId)) {
      metaMap.set(moduleId, {
        id: moduleId,
        name: moduleId,
        category: '其他模块',
      });
    }
  });

  return Array.from(metaMap.values());
};

const formatTrendLabel = (date, days) => {
  if (days <= 7) {
    return date.toLocaleDateString('zh-CN', { weekday: 'short' });
  }
  if (days <= 31) {
    return `${date.getMonth() + 1}/${date.getDate()}`;
  }
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
};

const StatsPage = () => {
  const navigate = useNavigate();
  const policeId = usePoliceId();
  const homeLink = useMemo(() => withPoliceId('/', policeId), [policeId]);
  const [selectedTimeframe, setSelectedTimeframe] = useState(timeframeOptions[0].id);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [moduleStats, setModuleStats] = useState({});
  const [loginStats, setLoginStats] = useState(() => getLoginStats());

  useEffect(() => {
    const update = () => setModuleStats(getModuleStats());
    update();
    const handleStorageChange = (event) => {
      if (!event || event.key === 'moduleVisitStats') {
        update();
      }
    };
    const handleVisibility = () => {
      if (document.visibilityState === 'visible') {
        update();
      }
    };
    window.addEventListener('storage', handleStorageChange);
    document.addEventListener('visibilitychange', handleVisibility);
    return () => {
      window.removeEventListener('storage', handleStorageChange);
      document.removeEventListener('visibilitychange', handleVisibility);
    };
  }, []);

  useEffect(() => {
    const update = () => setLoginStats(getLoginStats());
    update();
    const handleStorageChange = (event) => {
      if (!event || event.key === 'loginStats') {
        update();
      }
    };
    const handleVisibility = () => {
      if (document.visibilityState === 'visible') {
        update();
      }
    };
    window.addEventListener('storage', handleStorageChange);
    document.addEventListener('visibilitychange', handleVisibility);
    return () => {
      window.removeEventListener('storage', handleStorageChange);
      document.removeEventListener('visibilitychange', handleVisibility);
    };
  }, []);

  const moduleMetadata = useMemo(() => deriveModuleMetadata(moduleStats), [moduleStats]);

  const moduleCategoryOptions = useMemo(() => {
    const categories = Array.from(new Set(moduleMetadata.map((item) => item.category)));
    return [{ id: 'all', label: '全部模块' }, ...categories.map((category) => ({ id: category, label: category }))];
  }, [moduleMetadata]);

  useEffect(() => {
    if (selectedCategory === 'all') {
      return;
    }
    const exists = moduleCategoryOptions.some((option) => option.id === selectedCategory);
    if (!exists) {
      setSelectedCategory('all');
    }
  }, [moduleCategoryOptions, selectedCategory]);

  const enrichedModules = useMemo(
    () =>
      moduleMetadata
        .map((module) => {
          const tracked = moduleStats[module.id] || {};
          const visits = tracked.visits || 0;
          const activeSessions = tracked.active || 0;
          const usageRate = visits ? Math.min(activeSessions / visits, 1) : 0;
          const totalMinutes = tracked.timeSpent || 0;
          const avgDuration = tracked.avgDuration || (visits ? totalMinutes / visits : 0);
          const satisfaction = visits
            ? clampScore(2.5 + usageRate * 2 + Math.min(avgDuration / 15, 1.5))
            : 0;
          return {
            ...module,
            visits,
            activeSessions,
            usageRate,
            avgDuration,
            satisfaction,
            totalMinutes,
            lastVisit: tracked.lastVisit || 0,
            dailyData: Array.isArray(tracked.dailyData) ? tracked.dailyData : [],
            hourlyData: Array.isArray(tracked.hourlyData) ? tracked.hourlyData : [],
          };
        })
        .sort((a, b) => b.visits - a.visits),
    [moduleMetadata, moduleStats]
  );

  const filteredModules = useMemo(
    () =>
      selectedCategory === 'all'
        ? enrichedModules
        : enrichedModules.filter((module) => module.category === selectedCategory),
    [enrichedModules, selectedCategory]
  );

  const summaryStats = useMemo(() => {
    const totalVisits = enrichedModules.reduce((sum, module) => sum + module.visits, 0);
    const totalActive = enrichedModules.reduce((sum, module) => sum + module.activeSessions, 0);
    const totalMinutes = enrichedModules.reduce((sum, module) => sum + module.totalMinutes, 0);
    const avgDuration = totalVisits ? totalMinutes / totalVisits : 0;
    const avgSatisfaction = totalVisits
      ? enrichedModules.reduce((sum, module) => sum + module.satisfaction * module.visits, 0) / totalVisits
      : 0;
    const activeRate = totalVisits ? totalActive / totalVisits : 0;

    return {
      totalVisits,
      avgDuration,
      avgSatisfaction,
      activeRate,
    };
  }, [enrichedModules]);

  const aggregatedDaily = useMemo(() => {
    const map = new Map();
    enrichedModules.forEach((module) => {
      module.dailyData.forEach((day) => {
        const existing = map.get(day.date) || { visits: 0, active: 0, timeSpent: 0 };
        existing.visits += day.visits || 0;
        existing.active += day.active || 0;
        existing.timeSpent += day.timeSpent || 0;
        map.set(day.date, existing);
      });
    });
    return map;
  }, [enrichedModules]);

  const timeframe = timeframeOptions.find((option) => option.id === selectedTimeframe) || timeframeOptions[0];

  const trendSeries = useMemo(() => {
    const series = [];
    const today = new Date();
    for (let offset = timeframe.days - 1; offset >= 0; offset -= 1) {
      const date = new Date(today);
      date.setDate(today.getDate() - offset);
      const key = date.toISOString().split('T')[0];
      const bucket = aggregatedDaily.get(key) || { visits: 0, active: 0, timeSpent: 0 };
      const avgDuration = bucket.visits ? bucket.timeSpent / bucket.visits : 0;
      series.push({
        key,
        label: formatTrendLabel(date, timeframe.days),
        visits: bucket.visits,
        activeUsers: bucket.active,
        avgDuration,
      });
    }
    return series;
  }, [aggregatedDaily, timeframe.days]);

  const satisfactionSeries = useMemo(
    () =>
      trendSeries.map((point) => {
        const usageRate = point.visits ? point.activeUsers / point.visits : 0;
        const score = point.visits
          ? clampScore(2.5 + usageRate * 2 + Math.min(point.avgDuration / 15, 1.5))
          : 0;
        return { label: point.label, score };
      }),
    [trendSeries]
  );

  const moduleUsageByHour = useMemo(() => {
    const totals = Array.from({ length: 24 }, () => ({ visits: 0 }));
    enrichedModules.forEach((module) => {
      module.hourlyData.forEach((slot) => {
        if (typeof slot.hour !== 'number') {
          return;
        }
        const hour = Math.min(23, Math.max(0, slot.hour));
        totals[hour].visits += slot.visits || 0;
      });
    });
    return hourlySegments.map((segment) => {
      const sessions = totals
        .slice(segment.start, segment.end + 1)
        .reduce((sum, slot) => sum + (slot.visits || 0), 0);
      return { label: segment.label, sessions };
    });
  }, [enrichedModules]);

  const ratingDistribution = useMemo(() => {
    const buckets = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
    enrichedModules.forEach((module) => {
      if (!module.visits) {
        return;
      }
      const bucketScore = Math.round(clampScore(module.satisfaction)) || 1;
      buckets[bucketScore] += 1;
    });
    return Object.entries(buckets).map(([score, value]) => ({
      label: `${score}分`,
      value,
      color: ratingColorScale[score] || '#1f77ff',
    }));
  }, [enrichedModules]);

  const loginStatsByUnit = useMemo(() => {
    const units = loginStats.units || {};
    const entries = Object.entries(units).map(([unitName, stats]) => {
      const activeUsers = stats.users ? Object.keys(stats.users).length : 0;
      const avgLoginsPerUser = activeUsers ? stats.logins / activeUsers : 0;
      const satisfaction = activeUsers ? clampScore(2.5 + Math.min(avgLoginsPerUser, 5) * 0.5) : 0;
      return {
        unit: unitName,
        logins: stats.logins || 0,
        activeUsers,
        lastLogin: stats.lastLogin || 0,
        satisfaction,
      };
    });
    const totalActiveUsers = entries.reduce((sum, entry) => sum + entry.activeUsers, 0);
    return entries
      .map((entry) => ({
        ...entry,
        coverage: totalActiveUsers ? entry.activeUsers / totalActiveUsers : 0,
      }))
      .sort((a, b) => b.logins - a.logins);
  }, [loginStats]);

  const activeUnits = loginStatsByUnit.filter((unit) => unit.activeUsers > 0).length;

  return (
    <div className="stats-page">
      <header className="stats-header-bar">
        <div className="stats-header-info">
          <GlassIcon icon="fa-solid fa-chart-pie" size="sm" tone="violet" floating className="stats-header-icon" />
          <div className="stats-title-text">
            <span className="stats-title-main">系统使用统计</span>
            <span className="stats-title-sub">System Usage Analytics</span>
          </div>
        </div>
        <a
          href={homeLink}
          className="stats-back-link"
          onClick={(event) => {
            event.preventDefault();
            if (typeof window !== 'undefined' && window.location.pathname.endsWith('.html')) {
              window.location.href = new URL(homeLink, window.location.origin);
            } else {
              navigate(homeLink);
            }
          }}
        >
          <GlassIcon icon="fa-solid fa-house" size="xs" tone="mint" />
        </a>
      </header>

      <main className="stats-main">
        <section className="stats-overview">
          <h1>平台运行概览</h1>
          <p>实时掌握各业务模块的访问频次、使用时长、活跃度与单位登录情况</p>
        </section>

        <section className="stats-controls" aria-label="统计维度选择">
          <div className="stats-filter">
            <span className="stats-filter-label">统计周期</span>
            <div className="stats-filter-options">
              {timeframeOptions.map((option) => (
                <button
                  key={option.id}
                  type="button"
                  className={`stats-chip ${selectedTimeframe === option.id ? 'active' : ''}`}
                  onClick={() => setSelectedTimeframe(option.id)}
                >
                  {option.label}
                </button>
              ))}
            </div>
          </div>

          <div className="stats-filter">
            <span className="stats-filter-label">模块分类</span>
            <div className="stats-filter-options">
              {moduleCategoryOptions.map((option) => (
                <button
                  key={option.id}
                  type="button"
                  className={`stats-chip ${selectedCategory === option.id ? 'active' : ''}`}
                  onClick={() => setSelectedCategory(option.id)}
                >
                  {option.label}
                </button>
              ))}
            </div>
          </div>
        </section>

        <section className="stats-summary">
          <div className="stats-summary-card">
            <div className="stats-summary-icon">
              <GlassIcon icon="fa-solid fa-chart-column" size="sm" tone="cool" floating />
            </div>
            <div className="stats-summary-value">{formatNumber(summaryStats.totalVisits)}</div>
            <div className="stats-summary-label">累计访问次数</div>
          </div>
          <div className="stats-summary-card">
            <div className="stats-summary-icon">
              <GlassIcon icon="fa-solid fa-clock-rotate-left" size="sm" tone="amber" floating />
            </div>
            <div className="stats-summary-value">{summaryStats.avgDuration.toFixed(1)}m</div>
            <div className="stats-summary-label">平均使用时长</div>
          </div>
          <div className="stats-summary-card">
            <div className="stats-summary-icon">
              <GlassIcon icon="fa-solid fa-signal" size="sm" tone="mint" floating />
            </div>
            <div className="stats-summary-value">{formatPercent(summaryStats.activeRate)}</div>
            <div className="stats-summary-label">模块活跃率</div>
          </div>
          <div className="stats-summary-card">
            <div className="stats-summary-icon">
              <GlassIcon icon="fa-solid fa-face-smile" size="sm" tone="rose" floating />
            </div>
            <div className="stats-summary-value">{summaryStats.avgSatisfaction.toFixed(2)}</div>
            <div className="stats-summary-label">满意度评率</div>
          </div>
          <div className="stats-summary-card">
            <div className="stats-summary-icon">
              <GlassIcon icon="fa-solid fa-building-user" size="sm" tone="navy" floating />
            </div>
            <div className="stats-summary-value">{activeUnits}</div>
            <div className="stats-summary-label">活跃单位数</div>
          </div>
        </section>

        <section className="stats-grid">
          <article className="stats-card">
            <div className="stats-card-header">
              <span>模块访问分布</span>
              <GlassIcon icon="fa-solid fa-chart-bar" size="xs" tone="cool" />
            </div>
            <div className="stats-card-body">
              <HorizontalBars data={filteredModules.slice(0, 8)} />
            </div>
          </article>

          <article className="stats-card">
            <div className="stats-card-header">
              <span>访问趋势与满意度</span>
              <GlassIcon icon="fa-solid fa-chart-line" size="xs" tone="mint" />
            </div>
            <div className="stats-card-body stats-card-body--chart">
              <LineChart data={trendSeries} durationSeries={satisfactionSeries} />
              <div className="stats-chart-legend">
                <span><i className="legend-dot legend-dot--primary" />访问次数</span>
                <span><i className="legend-dot legend-dot--secondary" />活跃用户</span>
                <span><i className="legend-dot legend-dot--dashed" />满意度</span>
              </div>
            </div>
          </article>

          <article className="stats-card stats-card--table">
            <div className="stats-card-header">
              <span>模块使用明细</span>
              <GlassIcon icon="fa-solid fa-layer-group" size="xs" tone="violet" />
            </div>
            <div className="stats-card-body">
              <table className="stats-table" aria-label="模块使用明细">
                <thead>
                  <tr>
                    <th>模块名称</th>
                    <th>访问次数</th>
                    <th>使用率</th>
                    <th>平均时长</th>
                    <th>满意度</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredModules.slice(0, 10).map((module) => (
                    <tr key={module.id}>
                      <td>{module.name}</td>
                      <td>{formatNumber(module.visits)}</td>
                      <td>{formatPercent(module.usageRate)}</td>
                      <td>{module.avgDuration.toFixed(1)} 分钟</td>
                      <td>{module.satisfaction.toFixed(2)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </article>

          <article className="stats-card">
            <div className="stats-card-header">
              <span>用时分布</span>
              <GlassIcon icon="fa-solid fa-clock" size="xs" tone="amber" />
            </div>
            <div className="stats-card-body">
              <HourlyUsage data={moduleUsageByHour} />
            </div>
          </article>

          <article className="stats-card">
            <div className="stats-card-header">
              <span>用户评率分布</span>
              <GlassIcon icon="fa-solid fa-star-half-stroke" size="xs" tone="rose" />
            </div>
            <div className="stats-card-body">
              <RatingDistribution data={ratingDistribution} />
            </div>
          </article>

          <article className="stats-card stats-card--table">
            <div className="stats-card-header">
              <span>单位登录活跃度</span>
              <GlassIcon icon="fa-solid fa-building-user" size="xs" tone="navy" />
            </div>
            <div className="stats-card-body">
              <table className="stats-table" aria-label="单位登录活跃度">
                <thead>
                  <tr>
                    <th>单位</th>
                    <th>登录次数</th>
                    <th>活跃用户</th>
                    <th>覆盖率</th>
                    <th>满意度</th>
                  </tr>
                </thead>
                <tbody>
                  {loginStatsByUnit.map((unit) => (
                    <tr key={unit.unit}>
                      <td>{unit.unit}</td>
                      <td>{formatNumber(unit.logins)}</td>
                      <td>{formatNumber(unit.activeUsers)}</td>
                      <td>{formatPercent(unit.coverage)}</td>
                      <td>{unit.satisfaction.toFixed(2)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </article>
        </section>
      </main>

      <footer className="stats-footer">© 2025 贵阳市公安局经侦支队 | 技术支持：何国钦工作室</footer>
    </div>
  );
};

export default StatsPage;
