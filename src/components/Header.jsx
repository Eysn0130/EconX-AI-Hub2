import React, { useEffect, useRef, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useDarkMode } from '../hooks/useDarkMode.js';
import '../styles/layout.css';
import GlassIcon from './GlassIcon.jsx';

const Header = ({ policeId, onNavigate, buildLink }) => {
  const { isDark, toggle } = useDarkMode();
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef(null);
  const toggleRef = useRef(null);
  const location = useLocation();

  useEffect(() => {
    const handleClick = (event) => {
      if (
        menuRef.current &&
        !menuRef.current.contains(event.target) &&
        toggleRef.current &&
        !toggleRef.current.contains(event.target)
      ) {
        setMenuOpen(false);
      }
    };

    window.addEventListener('click', handleClick);
    return () => window.removeEventListener('click', handleClick);
  }, []);

  useEffect(() => {
    setMenuOpen(false);
  }, [location.pathname, location.search]);

  const displayId = policeId ? `用户：${policeId}` : '用户';

  const handleNavigate = (path) => {
    setMenuOpen(false);
    if (onNavigate) {
      onNavigate(path);
    }
  };

  return (
    <header className="header">
      <div className="header__glow" />
      <div className="header__glow header__glow--right" />
      <div className="header__content">
        <div className="header__brand">
          <div className="brand-emblem">
            <span className="brand-ring brand-ring--outer" />
            <span className="brand-ring brand-ring--inner" />
            <GlassIcon icon="fa-solid fa-shield-halved" size="lg" tone="navy" floating className="logo-icon" />
          </div>
          <div className="brand-copy">
            <div className="title-text">经智AI智能体工作平台</div>
            <div className="subtitle">Guiyang Economic Crime AI Platform</div>
          </div>
        </div>

        <div className="header__meta">
          <div className="meta-chip" title="经济安全作业态势">
            <span className="meta-chip__pulse" />
            <span className="meta-chip__label">经济安全执法云</span>
          </div>
          <span className="meta-divider" aria-hidden="true" />
          <div className="meta-caption">全天候智能辅助决策中心</div>
        </div>

        <div className="header-right">
          <nav className="header__links" aria-label="快捷操作">
            <Link
              to={buildLink('/stats')}
              className="header-link stats-link"
              onClick={() => handleNavigate('/stats')}
              title="访问统计"
            >
              <span className="header-link__icon">
                <GlassIcon icon="fa-solid fa-chart-simple" size="xs" tone="cool" />
              </span>
              <span className="header-link__label">访问统计</span>
            </Link>
            <Link
              to={buildLink('/chrome-installer')}
              className="header-link browser-link"
              onClick={() => handleNavigate('/chrome-installer')}
              title="安装浏览器插件"
            >
              <span className="header-link__icon">
                <GlassIcon icon="fa-brands fa-chrome" size="xs" tone="mint" />
              </span>
              <span className="header-link__label">浏览器插件</span>
            </Link>
          </nav>
          <div className="theme-toggle" onClick={toggle} title="切换主题" role="button" tabIndex={0}>
            <GlassIcon icon={`fa-solid ${isDark ? 'fa-sun' : 'fa-moon'}`} size="xs" tone="amber" />
          </div>
          <div className="user-info" ref={menuRef}>
            <span
              className="user-icon"
              onClick={(event) => {
                event.stopPropagation();
                setMenuOpen((prev) => !prev);
              }}
              ref={toggleRef}
            >
              <GlassIcon icon="fa-solid fa-user-shield" size="xs" tone="navy" />
              <span>{displayId}</span>
              <GlassIcon icon="fa-solid fa-chevron-down" size="xs" tone="cool" />
            </span>
            <div className={`user-menu ${menuOpen ? 'active' : ''}`}>
              <a className="menu-item" href="#">
                <GlassIcon icon="fa-solid fa-user-gear" size="xs" tone="mint" /> 个人设置
              </a>
              <a className="menu-item" href="#">
                <GlassIcon icon="fa-solid fa-bell" size="xs" tone="amber" pulsing /> 消息通知
              </a>
              <Link to={buildLink('/login')} className="logout-btn" onClick={() => handleNavigate('/login')}>
                <GlassIcon icon="fa-solid fa-arrow-right-from-bracket" size="xs" tone="rose" /> 退出系统
              </Link>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
