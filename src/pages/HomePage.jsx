import React, { useContext, useEffect } from 'react';
import { moduleCards } from '../data/navigation.js';
import { NavigationContext } from '../context/NavigationContext.js';
import useScrollReveal from '../hooks/useScrollReveal.js';
import '../styles/layout.css';
import '../styles/home.css';
import GlassIcon from '../components/GlassIcon.jsx';

const sections = [
  { title: '通用AI模块', ids: ['general-ai'] },
  {
    title: '案件侦办模块',
    ids: ['general-case', 'finance-case', 'securities-case', 'tax-case', 'trade-case', 'money-laundering'],
  },
  { title: '基础模块', ids: ['doc-writing'] },
  { title: '专属领域', ids: ['evidence-analysis', 'case-guide', 'data-analysis'] },
  { title: '研判工具', ids: ['person-info-analysis', 'police-data-analysis'] },
];

const statCards = [
  {
    icon: 'fa-solid fa-robot',
    value: '8',
    label: 'AI模型数量',
    description: '可用的智能模型',
  },
  {
    icon: 'fa-solid fa-shield-halved',
    value: '12',
    label: '专业功能',
    description: '各类案件分析工具',
  },
  {
    icon: 'fa-solid fa-book',
    value: '313',
    label: '知识库文档',
    description: '经侦专业知识',
  },
];

const HomePage = () => {
  const { navigateTo } = useContext(NavigationContext);

  useScrollReveal();

  const handleCardClick = (card) => {
    if (!card) return;
    navigateTo(card.path, card.id);
  };

  return (
    <div>
      <div className="dashboard-header">
        <div>
          <h1 className="dashboard-title fade-in">智能工作平台</h1>
          <p className="dashboard-subtitle fade-in" style={{ animationDelay: '.1s' }}>
            欢迎使用经智AI智能体工作平台，请选择您需要的功能模块
          </p>
        </div>
        <div className="dashboard-stats fade-in" style={{ animationDelay: '.2s' }}>
          {statCards.map((stat, index) => (
            <div
              key={stat.label}
              className="stat-card reveal-on-scroll"
              data-reveal-duration="680ms"
              data-reveal-type="zoom-in"
              data-reveal-index={index}
              data-reveal-step="80"
              data-reveal-max-delay="320"
            >
              <div className="stat-icon">
                <GlassIcon icon={stat.icon} size="lg" tone="mint" floating />
              </div>
              <div className="stat-value">{stat.value}</div>
              <div className="stat-label">{stat.label}</div>
              <div className="stat-desc">{stat.description}</div>
            </div>
          ))}
        </div>
      </div>

      {sections.map((section) => {
        const isCaseDeck = section.title === '案件侦办模块';
        const cards = moduleCards.filter((card) => section.ids.includes(card.id));
        if (cards.length === 0) {
          return null;
        }
        return (
          <div
            className="module-section reveal-on-scroll"
            data-reveal-duration="720ms"
            data-reveal-type="fade"
            data-reveal-delay="60ms"
            key={section.title}
          >
            <h2
              className="section-title reveal-on-scroll"
              data-reveal-duration="620ms"
              data-reveal-type="slide-left"
              data-reveal-delay="90ms"
            >
              {section.title}
            </h2>
            <div
              className="workflow-cards"
              data-reveal-group={section.title}
              data-reveal-deck={isCaseDeck ? 'case' : undefined}
            >
              {cards.map((card, index) => (
                <div
                  key={card.id}
                  className="workflow-card reveal-on-scroll"
                  data-reveal-duration="760ms"
                  data-reveal-index={index}
                  data-reveal-step="90"
                  data-reveal-max-delay="450"
                  data-reveal-reset={isCaseDeck ? 'true' : undefined}
                  onClick={() => handleCardClick(card)}
                  role="button"
                  tabIndex={0}
                  onKeyDown={(event) => {
                    if (event.key === 'Enter' || event.key === ' ') {
                      event.preventDefault();
                      handleCardClick(card);
                    }
                  }}
                >
                  <div className="card-header">
                    <div className="header-title">{card.title}</div>
                    <div className="header-sub">{card.subtitle}</div>
                  </div>
                  <div className="card-body">
                    <div className="card-icon">
                      <GlassIcon icon={card.icon} size="xl" tone={card.tone || 'cool'} floating />
                    </div>
                    <div className="card-title">{card.cardTitle}</div>
                    <div className="card-desc">{card.description}</div>
                  </div>
                  <div className="card-footer">
                    <span>
                      <GlassIcon icon={card.footerIcon} size="xs" tone={card.tone || 'cool'} /> {card.footerLabel}
                    </span>
                    <span className="badge">{card.badge}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default HomePage;
