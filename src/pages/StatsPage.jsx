import React from 'react';
import { useNavigate } from 'react-router-dom';
import '../styles/stats.css';
import { usePoliceId } from '../hooks/usePoliceId.js';
import { withPoliceId } from '../utils/navigation.js';

const summaryItems = [
  { icon: 'fa-solid fa-users', value: '1,254', label: '总访问用户' },
  { icon: 'fa-solid fa-bolt', value: '98%', label: '系统可用率' },
  { icon: 'fa-solid fa-layer-group', value: '16', label: '模块访问次数' },
  { icon: 'fa-solid fa-clock', value: '12m', label: '平均停留时长' },
];

const moduleData = [
  { module: '通用AI助手', visits: 432 },
  { module: '金融领域', visits: 298 },
  { module: '金析为证', visits: 220 },
  { module: '数据分析', visits: 180 },
];

const StatsPage = () => {
  const navigate = useNavigate();
  const policeId = usePoliceId();

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
          <p>了解当前平台的访问情况与业务运行状态</p>
        </section>

        <section className="stats-summary">
          {summaryItems.map((item) => (
            <div className="stats-summary-card" key={item.label}>
              <div className="stats-summary-icon">
                <i className={item.icon} />
              </div>
              <div className="stats-summary-value">{item.value}</div>
              <div className="stats-summary-label">{item.label}</div>
            </div>
          ))}
        </section>

        <section className="stats-grid">
          <article className="stats-card">
            <div className="stats-card-header">
              <span>模块访问分布</span>
              <i className="fa-solid fa-chart-pie" />
            </div>
            <div className="stats-card-body">
              <div className="stats-chart-placeholder">图表暂不可用</div>
            </div>
          </article>

          <article className="stats-card">
            <div className="stats-card-header">
              <span>访问趋势</span>
              <i className="fa-solid fa-wave-square" />
            </div>
            <div className="stats-card-body">
              <div className="stats-chart-placeholder">图表暂不可用</div>
            </div>
          </article>

          <article className="stats-card">
            <div className="stats-card-header">
              <span>模块使用明细</span>
              <i className="fa-solid fa-list" />
            </div>
            <div className="stats-card-body">
              <table className="stats-table">
                <thead>
                  <tr>
                    <th>模块</th>
                    <th>访问次数</th>
                  </tr>
                </thead>
                <tbody>
                  {moduleData.map((row) => (
                    <tr key={row.module}>
                      <td>{row.module}</td>
                      <td>{row.visits}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </article>

          <article className="stats-card">
            <div className="stats-card-header">
              <span>使用时段分布</span>
              <i className="fa-solid fa-clock" />
            </div>
            <div className="stats-card-body">
              <div className="stats-chart-placeholder">图表暂不可用</div>
            </div>
          </article>
        </section>
      </main>

      <footer className="stats-footer">© 2025 贵阳市公安局经侦支队 | 技术支持：何国钦工作室</footer>
    </div>
  );
};

export default StatsPage;
