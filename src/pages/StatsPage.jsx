import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import '../styles/stats.css';
import { usePoliceId } from '../hooks/usePoliceId.js';
import { withPoliceId } from '../utils/navigation.js';
import {
  moduleAnalytics,
  moduleCategoryOptions,
  timeframeOptions,
  usageTrendData,
  satisfactionTrend,
  moduleUsageByHour,
  ratingDistribution,
  loginStatsByUnit,
} from '../data/stats.js';
import { getModuleStats } from '../hooks/useModuleTracking.js';

const formatNumber = (value) => value.toLocaleString('zh-CN');
const formatPercent = (value) => `${(value * 100).toFixed(1)}%`;
const formatScorePercent = (score) => `${((score / 5) * 100).toFixed(1)}%`;

const HorizontalBars = ({ data }) => {
  if (!data.length) {
    return <div className="stats-empty">暂无数据</div>;
  }
  const maxValue = Math.max(...data.map((item) => item.visits));
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
              <div
                className="stats-hbar-fill"
                style={{ width: `${width}%` }}
              >
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
  const width = 100;
  const height = 100;
  const maxValue = Math.max(...data.map((point) => Math.max(point.visits, point.activeUsers)));
  const maxDuration = Math.max(...durationSeries.map((point) => point.score ?? point.avgDuration));
  const visitsPoints = data
    .map((point, index) => {
      const x = (index / Math.max(data.length - 1, 1)) * width;
      const y = height - (point.visits / (maxValue || 1)) * height;
      return `${x},${y}`;
    })
    .join(' ');
  const activePoints = data
    .map((point, index) => {
      const x = (index / Math.max(data.length - 1, 1)) * width;
      const y = height - (point.activeUsers / (maxValue || 1)) * height;
      return `${x},${y}`;
    })
    .join(' ');
  const durationPoints = durationSeries
    .map((point, index) => {
      const x = (index / Math.max(durationSeries.length - 1, 1)) * width;
      const y = height - ((point.score ?? point.avgDuration) / (maxDuration || 1)) * height;
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
  const maxSessions = Math.max(...data.map((item) => item.sessions));
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

const StatsPage = () => {
  const navigate = useNavigate();
  const policeId = usePoliceId();
  const [selectedTimeframe, setSelectedTimeframe] = useState(timeframeOptions[0].id);
  const [selectedCategory, setSelectedCategory] = useState(moduleCategoryOptions[0].id);
  const [moduleStats, setModuleStats] = useState({});

  useEffect(() => {
    setModuleStats(getModuleStats());
    const handleStorageChange = (event) => {
      if (!event || event.key === 'moduleVisitStats') {
        setModuleStats(getModuleStats());
      }
    };
    const handleVisibility = () => {
      if (document.visibilityState === 'visible') {
        setModuleStats(getModuleStats());
      }
    };

    window.addEventListener('storage', handleStorageChange);
    document.addEventListener('visibilitychange', handleVisibility);
    return () => {
      window.removeEventListener('storage', handleStorageChange);
      document.removeEventListener('visibilitychange', handleVisibility);
    };
  }, []);

  const enrichedModules = useMemo(() =>
    moduleAnalytics
      .map((module) => {
        const tracked = moduleStats[module.id] || {};
        const visits = module.baselineVisits + (tracked.visits || 0);
        const activeSessions = module.baselineActiveSessions + (tracked.active || 0);
        const usageRate = visits === 0 ? 0 : activeSessions / visits;
        return {
          ...module,
          visits,
          activeSessions,
          usageRate,
        };
      })
      .sort((a, b) => b.visits - a.visits),
  [moduleStats]);

  const filteredModules = useMemo(() =>
    selectedCategory === 'all'
      ? enrichedModules
      : enrichedModules.filter((module) => module.category === selectedCategory),
  [enrichedModules, selectedCategory]);

  const summaryStats = useMemo(() => {
    const totalVisits = enrichedModules.reduce((sum, module) => sum + module.visits, 0);
    const totalActive = enrichedModules.reduce((sum, module) => sum + module.activeSessions, 0);
    const weightedDuration = enrichedModules.reduce(
      (sum, module) => sum + module.avgDuration * module.visits,
      0
    );
    const weightedSatisfaction = enrichedModules.reduce(
      (sum, module) => sum + module.satisfaction * module.visits,
      0
    );
    const avgDuration = totalVisits ? weightedDuration / totalVisits : 0;
    const avgSatisfaction = totalVisits ? weightedSatisfaction / totalVisits : 0;
    const activeRate = totalVisits ? totalActive / totalVisits : 0;
    const activeUnits = loginStatsByUnit.filter((unit) => unit.coverage >= 0.75).length;
    return {
      totalVisits,
      avgDuration,
      avgSatisfaction,
      activeRate,
      activeUnits,
    };
  }, [enrichedModules]);

  const trendSeries = usageTrendData[selectedTimeframe] || [];
  const satisfactionSeries = satisfactionTrend[selectedTimeframe] || [];

  return (
    <div className="stats-page">
      <header className="stats-header-bar">
        <div className="stats-header-info">
          <i className="fa-solid fa-chart-pie stats-header-icon" />
          <div className="stats-title-text">
            <span className="stats-title-main">系统使用统计</span>
            <span className="stats-title-sub">System Usage Analytics</span>
          </div>
        </div>
        <a
          href={withPoliceId('/', policeId)}
          className="stats-back-link"
          onClick={(event) => {
            event.preventDefault();
            navigate(withPoliceId('/', policeId));
          }}
        >
          <i className="fa-solid fa-house" />
        </a>
      </header>

      <main className="stats-main">
        <section className="stats-overview">
          <h1>平台运行概览</h1>
          <p>实时掌握各业务模块的访问频次、使用时长、用户满意度与单位活跃度</p>
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
              <i className="fa-solid fa-chart-column" />
            </div>
            <div className="stats-summary-value">{formatNumber(summaryStats.totalVisits)}</div>
            <div className="stats-summary-label">累计访问次数</div>
          </div>
          <div className="stats-summary-card">
            <div className="stats-summary-icon">
              <i className="fa-solid fa-clock-rotate-left" />
            </div>
            <div className="stats-summary-value">{summaryStats.avgDuration.toFixed(1)}m</div>
            <div className="stats-summary-label">平均使用时长</div>
          </div>
          <div className="stats-summary-card">
            <div className="stats-summary-icon">
              <i className="fa-solid fa-signal" />
            </div>
            <div className="stats-summary-value">{formatPercent(summaryStats.activeRate)}</div>
            <div className="stats-summary-label">模块活跃率</div>
          </div>
          <div className="stats-summary-card">
            <div className="stats-summary-icon">
              <i className="fa-solid fa-face-smile" />
            </div>
            <div className="stats-summary-value">{formatScorePercent(summaryStats.avgSatisfaction)}</div>
            <div className="stats-summary-label">满意度评率</div>
          </div>
        </section>

        <section className="stats-grid">
          <article className="stats-card">
            <div className="stats-card-header">
              <span>模块访问分布</span>
              <i className="fa-solid fa-chart-bar" />
            </div>
            <div className="stats-card-body">
              <HorizontalBars data={filteredModules.slice(0, 8)} />
            </div>
          </article>

          <article className="stats-card">
            <div className="stats-card-header">
              <span>访问趋势与满意度</span>
              <i className="fa-solid fa-chart-line" />
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
              <i className="fa-solid fa-layer-group" />
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
              <i className="fa-solid fa-clock" />
            </div>
            <div className="stats-card-body">
              <HourlyUsage data={moduleUsageByHour} />
            </div>
          </article>

          <article className="stats-card">
            <div className="stats-card-header">
              <span>用户评率分布</span>
              <i className="fa-solid fa-star-half-stroke" />
            </div>
            <div className="stats-card-body">
              <RatingDistribution data={ratingDistribution} />
            </div>
          </article>

          <article className="stats-card stats-card--table">
            <div className="stats-card-header">
              <span>单位登录活跃度</span>
              <i className="fa-solid fa-building-user" />
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
