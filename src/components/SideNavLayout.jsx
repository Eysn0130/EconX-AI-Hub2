import React, { useEffect, useRef, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { navSections } from '../data/navigation.js';
import {
  recordModuleActive,
  recordModuleTimeSpent,
  recordModuleVisit,
} from '../hooks/useModuleTracking.js';
import { usePoliceId } from '../hooks/usePoliceId.js';
import { withPoliceId } from '../utils/navigation.js';
import { recordLoginEvent } from '../hooks/useLoginTracking.js';
import '../styles/sideNavLayout.css';
import GlassIcon from './GlassIcon.jsx';

const SideNavLayout = ({ icon, title, subtitle, iframeSrc, iframeAllow = 'microphone', moduleId }) => {
  const [sidebarVisible, setSidebarVisible] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const policeId = usePoliceId();
  const sessionRef = useRef({ moduleId: null, start: null });
  const timerRef = useRef(null);

  useEffect(() => {
    if (!moduleId) {
      return undefined;
    }

    recordModuleVisit(moduleId);
    sessionRef.current = { moduleId, start: Date.now() };
    timerRef.current = setTimeout(() => {
      recordModuleActive(moduleId);
      timerRef.current = null;
    }, 10000);

    const handleBeforeUnload = () => {
      if (!moduleId || !sessionRef.current.start) {
        return;
      }
      recordModuleTimeSpent(moduleId, Date.now() - sessionRef.current.start);
    };

    window.addEventListener('beforeunload', handleBeforeUnload);

    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
      if (timerRef.current) {
        clearTimeout(timerRef.current);
        timerRef.current = null;
      }
      if (moduleId && sessionRef.current.start) {
        recordModuleTimeSpent(moduleId, Date.now() - sessionRef.current.start);
        sessionRef.current = { moduleId: null, start: null };
      }
    };
  }, [moduleId]);

  useEffect(() => {
    if (policeId) {
      recordLoginEvent(policeId);
    }
  }, [policeId]);

  useEffect(() => {
    setSidebarVisible(false);
  }, [location.pathname, location.search]);

  const navigateTo = (path, moduleId) => {
    const target = withPoliceId(path, policeId);
    navigate(target);
  };

  const activeModule = location.pathname.replace('/', '') || 'index';

  return (
    <div className="side-layout-root">
      <header className="side-layout-header">
        <div className="side-layout-logo">
          <GlassIcon icon={icon} size="lg" tone="cool" floating />
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
          <GlassIcon icon="fa-solid fa-house" size="xs" tone="mint" /> 返回主页
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
            <GlassIcon
              icon={`fa-solid ${sidebarVisible ? 'fa-chevron-left' : 'fa-chevron-right'}`}
              size="xs"
              tone="cool"
            />
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
                    <GlassIcon
                      icon={item.icon}
                      size="sm"
                      tone={item.tone || 'cool'}
                      floating={activeModule.startsWith(item.moduleId)}
                      label={item.label}
                    />
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
