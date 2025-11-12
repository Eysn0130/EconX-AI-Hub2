import React, { useEffect, useRef, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useDarkMode } from '../hooks/useDarkMode.js';
import '../styles/layout.css';

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
      <div className="logo">
        <i className="fa-solid fa-shield-halved logo-icon" />
        <div>
          <div className="title-text">经智AI智能体工作平台</div>
          <div className="subtitle">Guiyang Economic Crime AI Platform</div>
        </div>
      </div>
      <div className="header-right">
        <Link
          to={buildLink('/stats')}
          className="stats-link"
          onClick={() => handleNavigate('/stats')}
          title="访问统计"
        >
          <i className="fa-solid fa-chart-column" />
          <span className="link-text">访问统计</span>
        </Link>
        <Link
          to={buildLink('/chrome-installer')}
          className="browser-link"
          onClick={() => handleNavigate('/chrome-installer')}
          title="安装浏览器插件"
        >
          <i className="fa-brands fa-chrome" />
          <span className="link-text">浏览器插件</span>
        </Link>
        <div className="theme-toggle" onClick={toggle} title="切换主题" role="button" tabIndex={0}>
          <i className={`fa-solid ${isDark ? 'fa-sun' : 'fa-moon'}`} />
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
            <i className="fa-solid fa-user-shield" />
            <span>{displayId}</span>
            <i className="fa-solid fa-caret-down" />
          </span>
          <div className={`user-menu ${menuOpen ? 'active' : ''}`}>
            <a className="menu-item" href="#">
              <i className="fa-solid fa-user-gear" /> 个人设置
            </a>
            <a className="menu-item" href="#">
              <i className="fa-solid fa-bell" /> 消息通知
            </a>
            <Link to={buildLink('/login')} className="logout-btn" onClick={() => handleNavigate('/login')}>
              <i className="fa-solid fa-right-from-bracket" /> 退出系统
            </Link>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
