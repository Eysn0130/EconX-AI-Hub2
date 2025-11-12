import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { navSections } from '../data/navigation.js';
import { recordModuleActive, recordModuleVisit } from '../hooks/useModuleTracking.js';
import { usePoliceId } from '../hooks/usePoliceId.js';
import { withPoliceId } from '../utils/navigation.js';
import '../styles/sideNavLayout.css';

const SideNavLayout = ({ icon, title, subtitle, iframeSrc, iframeAllow = 'microphone' }) => {
  const [sidebarVisible, setSidebarVisible] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const policeId = usePoliceId();

  useEffect(() => {
    setSidebarVisible(false);
  }, [location.pathname, location.search]);

  const navigateTo = (path, moduleId) => {
    const target = withPoliceId(path, policeId);
    recordModuleVisit(moduleId);
    setTimeout(() => recordModuleActive(moduleId), 10000);
    navigate(target);
  };

  const activeModule = location.pathname.replace('/', '') || 'index';

  return (
    <div className="side-layout-root">
      <header className="side-layout-header">
        <div className="side-layout-logo">
          <i className={icon} />
          <div>
            <div className="side-layout-title">{title}</div>
            <div className="side-layout-subtitle">{subtitle}</div>
          </div>
        </div>
        <button
          type="button"
          className="side-layout-back"
          onClick={() => navigate(withPoliceId('/', policeId))}
        >
          <i className="fa-solid fa-house" /> 返回主页
        </button>
      </header>
      <div className="side-layout-body">
        <nav className={`side-layout-sidebar ${sidebarVisible ? 'active' : ''}`}>
          <div
            className="side-layout-toggle"
            role="button"
            tabIndex={0}
            onClick={() => setSidebarVisible((prev) => !prev)}
            onKeyDown={(event) => {
              if (event.key === 'Enter' || event.key === ' ') {
                event.preventDefault();
                setSidebarVisible((prev) => !prev);
              }
            }}
          >
            <i className={`fa-solid ${sidebarVisible ? 'fa-chevron-left' : 'fa-chevron-right'}`} />
          </div>
          {navSections.map((section) => (
            <div key={section.title}>
              <div className="side-layout-section-title">{section.title}</div>
              <ul className="side-layout-nav-menu">
                {section.items.map((item) => (
                  <li className="side-layout-nav-item" key={item.path}>
                    <a
                      href={withPoliceId(item.path, policeId)}
                      className={`side-layout-nav-link ${
                        activeModule.startsWith(item.moduleId) ? 'active' : ''
                      }`}
                      onClick={(event) => {
                        event.preventDefault();
                        navigateTo(item.path, item.moduleId);
                      }}
                    >
                      <i className={item.icon} />
                      {item.label}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </nav>
        <main
          className={`side-layout-main ${sidebarVisible ? 'sidebar-visible' : ''}`}
          onClick={() => {
            if (sidebarVisible) {
              setSidebarVisible(false);
            }
          }}
        >
          <div className="side-layout-iframe-wrapper">
            <iframe src={iframeSrc} allow={iframeAllow} title={title} />
          </div>
        </main>
      </div>
    </div>
  );
};

export default SideNavLayout;
